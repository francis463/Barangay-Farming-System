import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { User, Mail, MapPin, Phone, Calendar, Edit2, Save, X, FileText, Shield, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { type UserProfile, updateUserProfile } from "../utils/auth";
import { profilePictureApi } from "../utils/api";

interface ProfilePageProps {
  userProfile: UserProfile | null;
  accessToken: string | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function ProfilePage({ userProfile, accessToken, onProfileUpdate }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name,
        bio: userProfile.bio || "",
        location: userProfile.location || "",
      });
    }
  }, [userProfile]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name,
        bio: userProfile.bio || "",
        location: userProfile.location || "",
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name,
        bio: userProfile.bio || "",
        location: userProfile.location || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!accessToken) {
      toast.error("Not authenticated");
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await updateUserProfile(accessToken, editedProfile);
      onProfileUpdate(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accessToken) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          const result = await profilePictureApi.upload(base64Data, file.type, accessToken);
          
          // Update local profile
          if (userProfile) {
            const updatedProfile = {
              ...userProfile,
              avatar: result.avatar,
            };
            onProfileUpdate(updatedProfile);
          }

          toast.success("Profile picture updated!");
        } catch (error: any) {
          console.error("Error uploading avatar:", error);
          toast.error(error.message || "Failed to upload profile picture");
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!accessToken || !userProfile?.avatar) return;

    setIsUploadingAvatar(true);

    try {
      await profilePictureApi.delete(accessToken);

      // Update local profile
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          avatar: null,
        };
        onProfileUpdate(updatedProfile);
      }

      toast.success("Profile picture removed");
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast.error(error.message || "Failed to delete profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  // User-specific stats - these should be tracked based on actual user activity
  // For now, we initialize to 0 for all users. Later, this can be enhanced to track actual contributions.
  const stats = [
    { label: "Tasks Completed", value: userProfile.tasksCompleted?.toString() || "0" },
    { label: "Hours Contributed", value: userProfile.hoursContributed?.toString() || "0" },
    { label: "Events Attended", value: userProfile.eventsAttended?.toString() || "0" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Profile</h2>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <Avatar className={`h-24 w-24 border-4 ${userProfile.role === "admin" ? "border-yellow-500" : "border-green-600"}`}>
                <AvatarImage src={userProfile.avatar || ""} alt={userProfile.name} />
                <AvatarFallback className={`text-white text-2xl ${userProfile.role === "admin" ? "bg-yellow-500" : "bg-green-600"}`}>
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {userProfile.avatar && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col md:hidden gap-2 -mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="text-xs"
              >
                <Camera className="h-3 w-3 mr-1" />
                Change Photo
              </Button>
            </div>
            <div className="hidden md:block text-xs text-muted-foreground -mt-4 mb-2">
              Hover to change photo
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2>{userProfile.name}</h2>
                {userProfile.role === "admin" ? (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge className="bg-green-600 hover:bg-green-700 capitalize">{userProfile.role}</Badge>
                )}
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(userProfile.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details and contact information</CardDescription>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile?.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userProfile.email}</span>
                <Badge variant="outline" className="ml-auto text-xs">Cannot be changed</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.location || "Not specified"}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <div className="flex items-start gap-2 px-3 py-2 border rounded-md bg-muted/50 min-h-[100px]">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <span className="text-sm">{userProfile.bio || "No bio added yet"}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 hover:bg-green-700">{userProfile.role}</Badge>
              <span className="text-sm text-muted-foreground">
                Community member
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent contributions to the community garden</CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile.recentActivities && userProfile.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {userProfile.recentActivities.map((activity: any, index: number) => (
                <div key={index} className={`flex items-start gap-4 ${index < userProfile.recentActivities!.length - 1 ? 'pb-4 border-b' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'crop' ? 'bg-green-600' : 
                    activity.type === 'task' ? 'bg-blue-600' : 
                    'bg-orange-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">Start contributing to the community garden to see your activity here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
