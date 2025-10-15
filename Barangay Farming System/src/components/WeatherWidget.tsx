import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, CloudSnow, CloudDrizzle, MapPin, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface WeatherData {
  current: {
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    humidity: number;
    windSpeed: number;
    description?: string;
    feelsLike?: number;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm" | "mist";
    description?: string;
  }>;
  alerts: string[];
  location?: {
    city: string;
    country: string;
  };
}

interface WeatherWidgetProps {
  weather: WeatherData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WeatherWidget({ weather, isLoading = false, onRefresh }: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-8 w-8 text-gray-400" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "snow":
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      case "thunderstorm":
        return <CloudRain className="h-8 w-8 text-purple-500" />;
      case "mist":
        return <CloudDrizzle className="h-8 w-8 text-gray-300" />;
      default:
        return <Sun className="h-8 w-8" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-24" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Weather</CardTitle>
              <CardDescription>
                {weather.location ? (
                  <span className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {weather.location.city}, {weather.location.country}
                  </span>
                ) : (
                  "Weather conditions for garden planning"
                )}
              </CardDescription>
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weather.current.condition)}
              <div>
                <div className="text-3xl">{weather.current.temp}°C</div>
                <p className="text-sm text-muted-foreground capitalize">
                  {weather.current.description || weather.current.condition}
                </p>
                {weather.current.feelsLike && (
                  <p className="text-xs text-muted-foreground">
                    Feels like {weather.current.feelsLike}°C
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4" />
                <span>Humidity: {weather.current.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wind className="h-4 w-4" />
                <span>Wind: {weather.current.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4>3-Day Forecast</h4>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="text-center p-3 border rounded-lg">
                  <p className="text-sm mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-sm">{day.temp}°C</p>
                  {day.description && (
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {day.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {weather.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Weather Alert</AlertTitle>
          <AlertDescription>
            {weather.alerts.map((alert, index) => (
              <p key={index}>{alert}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}