import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner@2.0.3";

export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  category: "harvest" | "planting" | "event" | "progress";
}

interface PhotoGalleryProps {
  photos: Photo[];
  isAdmin?: boolean;
  onAdd?: (photo: Omit<Photo, "id">) => Promise<void>;
  onUpdate?: (id: string, photo: Partial<Photo>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PhotoGallery({ photos, isAdmin = false, onAdd, onUpdate, onDelete }: PhotoGalleryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "progress" as Photo["category"],
    date: "",
    url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryColor = (category: Photo["category"]) => {
    switch (category) {
      case "harvest":
        return "bg-orange-500 hover:bg-orange-600";
      case "planting":
        return "bg-green-500 hover:bg-green-600";
      case "event":
        return "bg-purple-500 hover:bg-purple-600";
      case "progress":
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const handleOpenDialog = (photo?: Photo) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title,
        description: photo.description,
        category: photo.category,
        date: photo.date,
        url: photo.url,
      });
      setImagePreview(photo.url);
    } else {
      setEditingPhoto(null);
      setFormData({
        title: "",
        description: "",
        category: "progress",
        date: new Date().toISOString().split('T')[0],
        url: "",
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPhoto(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, url: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlInput = (url: string) => {
    setFormData({ ...formData, url });
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.url) {
      toast.error("Please fill in title and add an image");
      return;
    }

    setIsSubmitting(true);
    try {
      const photoData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date || new Date().toISOString(),
        url: formData.url,
      };

      if (editingPhoto && onUpdate) {
        await onUpdate(editingPhoto.id, photoData);
        toast.success("Photo updated successfully!");
      } else if (onAdd) {
        await onAdd(photoData);
        toast.success("Photo added successfully!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving photo:", error);
      toast.error("Failed to save photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(id);
        toast.success("Photo deleted successfully!");
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast.error("Failed to delete photo");
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>Visual documentation of our garden journey</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No photos yet. {isAdmin && "Click 'Add Photo' to get started!"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4>{photo.title}</h4>
                      <Badge className={getCategoryColor(photo.category)}>
                        {photo.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{photo.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(photo.date).toLocaleDateString()}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(photo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(photo.id, photo.title)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPhoto ? "Edit Photo" : "Add Photo"}</DialogTitle>
            <DialogDescription>
              {editingPhoto ? "Update photo details" : "Upload a new photo to the gallery"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image *</Label>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-lg border">
                    <ImageWithFallback
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drag & drop an image or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Maximum file size: 5MB
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or enter image URL
                      </span>
                    </div>
                  </div>

                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.url}
                    onChange={(e) => handleImageUrlInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., First Harvest of Tomatoes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the photo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: Photo["category"]) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harvest">Harvest</SelectItem>
                    <SelectItem value="planting">Planting</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingPhoto ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
