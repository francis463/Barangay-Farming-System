import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { MapPin, Save, Loader2, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface LocationSettingsProps {
  accessToken: string | null;
}

export function LocationSettings({ accessToken }: LocationSettingsProps) {
  const [location, setLocation] = useState<LocationData>({
    city: "",
    latitude: 0,
    longitude: 0,
    country: "PH",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadLocationSettings = async () => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/settings/location`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        setLocation(result.data);
      }
    } catch (error) {
      console.error("Error loading location settings:", error);
      toast.error("Failed to load location settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocationSettings();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    // Validate inputs
    if (!location.city.trim()) {
      toast.error("City name is required");
      return;
    }

    if (location.latitude < -90 || location.latitude > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (location.longitude < -180 || location.longitude > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/settings/location`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(location),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save location settings");
      }

      if (result.success) {
        toast.success("Location settings saved successfully!");
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Failed to save location settings");
      }
    } catch (error) {
      console.error("Error saving location settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save location settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Use reverse geocoding to get city name (using OpenStreetMap's Nominatim API)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();

          const city = data.address?.city || 
                      data.address?.municipality || 
                      data.address?.town || 
                      data.address?.village || 
                      "Unknown Location";
          
          const country = data.address?.country_code?.toUpperCase() || "PH";

          setLocation({
            city,
            latitude: lat,
            longitude: lon,
            country,
          });
          setHasChanges(true);
          toast.success(`Location detected: ${city}`);
        } catch (error) {
          console.error("Error getting city name:", error);
          // Still set coordinates even if reverse geocoding fails
          setLocation({
            ...location,
            latitude: lat,
            longitude: lon,
          });
          setHasChanges(true);
          toast.success("Coordinates detected. Please enter city name manually.");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        toast.error(errorMessage);
        setIsDetecting(false);
      }
    );
  };

  const handleInputChange = (field: keyof LocationData, value: string | number) => {
    setLocation(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-green-600 mb-2">Location Settings</h2>
        <p className="text-muted-foreground">
          Configure the barangay's location for accurate weather forecasting.
        </p>
      </div>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Location</CardTitle>
          <CardDescription>
            Set the location used for weather forecasts shown to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Auto-detect button */}
              <div>
                <Button
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Navigation className={`h-4 w-4 mr-2 ${isDetecting ? 'animate-spin' : ''}`} />
                  {isDetecting ? "Detecting Location..." : "Auto-Detect Current Location"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Automatically detect your current location using GPS
                </p>
              </div>

              {/* Manual input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      value={location.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="e.g., Kabankalan City"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country Code</Label>
                  <Input
                    id="country"
                    value={location.country}
                    onChange={(e) => handleInputChange("country", e.target.value.toUpperCase())}
                    placeholder="e.g., PH"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={location.latitude}
                    onChange={(e) => handleInputChange("latitude", parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 9.9833"
                  />
                  <p className="text-xs text-muted-foreground">Range: -90 to 90</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={location.longitude}
                    onChange={(e) => handleInputChange("longitude", parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 122.8167"
                  />
                  <p className="text-xs text-muted-foreground">Range: -180 to 180</p>
                </div>
              </div>

              {/* Save button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Location Settings
                    </>
                  )}
                </Button>
                {hasChanges && !isSaving && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Location</strong>
            <p className="mt-1 text-sm">
              {location.city || "Not set"}, {location.country}
              <br />
              <span className="text-xs text-muted-foreground">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </p>
          </AlertDescription>
        </Alert>

        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <MapPin className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-900 dark:text-blue-100">How to find coordinates</strong>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Use Google Maps: Right-click on your location → Click coordinates to copy
            </p>
          </AlertDescription>
        </Alert>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Default Location Info */}
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          
        </Card>

      </div>
    </div>
  );
}
