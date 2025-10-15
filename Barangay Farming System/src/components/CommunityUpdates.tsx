import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, Info, AlertCircle, CheckCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export interface Update {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "success" | "warning" | "event";
}

interface CommunityUpdatesProps {
  updates: Update[];
  isAdmin?: boolean;
  onAdd?: (update: Omit<Update, "id">) => Promise<void>;
  onUpdate?: (id: string, update: Partial<Update>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function CommunityUpdates({ updates, isAdmin = false, onAdd, onUpdate, onDelete }: CommunityUpdatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as Update["type"],
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getIcon = (type: Update["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-purple-500" />;
    }
  };

  const getBadgeVariant = (type: Update["type"]) => {
    switch (type) {
      case "info":
        return "default";
      case "success":
        return "default";
      case "warning":
        return "default";
      case "event":
        return "secondary";
    }
  };

  const handleOpenDialog = (update?: Update) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        message: update.message,
        type: update.type,
        date: update.date,
      });
    } else {
      setEditingUpdate(null);
      setFormData({
        title: "",
        message: "",
        type: "info",
        date: new Date().toISOString(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUpdate(null);
    setFormData({
      title: "",
      message: "",
      type: "info",
      date: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        date: formData.date || new Date().toISOString(),
      };

      if (editingUpdate && onUpdate) {
        await onUpdate(editingUpdate.id, updateData);
        toast.success("Update modified successfully!");
      } else if (onAdd) {
        await onAdd(updateData);
        toast.success("Update posted successfully!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving update:", error);
      toast.error("Failed to save update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(id);
        toast.success("Update deleted successfully!");
      } catch (error) {
        console.error("Error deleting update:", error);
        toast.error("Failed to delete update");
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Community Updates & Announcements</CardTitle>
              <CardDescription>Latest news and events from the barangay garden</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No updates available
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(update.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="mb-1">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{update.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(update.date).toLocaleDateString()} • {new Date(update.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant={getBadgeVariant(update.type)} className="capitalize">
                          {update.type}
                        </Badge>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(update)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(update.id, update.title)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUpdate ? "Edit Update" : "Add Update"}</DialogTitle>
            <DialogDescription>
              {editingUpdate ? "Modify community update" : "Post a new community update"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., New Harvest Ready"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: Update["type"]) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingUpdate ? "Update" : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
