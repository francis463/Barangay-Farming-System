import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Download, Printer, AlertCircle, Droplets, Bug, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plotNumber: string;
  datePlanted: string;
  estimatedHarvest: string;
  status: "growing" | "ready" | "harvested";
  quantity: string;
  health?: "healthy" | "needs-water" | "pest-issue" | "disease";
}

interface CropsManagementProps {
  crops: Crop[];
  onAdd?: (crop: Omit<Crop, "id">) => Promise<void>;
  onUpdate?: (id: string, crop: Omit<Crop, "id">) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function CropsManagement({ crops, onAdd, onUpdate, onDelete }: CropsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Crop, "id">>({
    name: "",
    variety: "",
    plotNumber: "",
    datePlanted: "",
    estimatedHarvest: "",
    status: "growing",
    quantity: "",
    health: "healthy",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      variety: "",
      plotNumber: "",
      datePlanted: "",
      estimatedHarvest: "",
      status: "growing",
      quantity: "",
      health: "healthy",
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (crop: Crop) => {
    setSelectedCrop(crop);
    setFormData({
      name: crop.name,
      variety: crop.variety,
      plotNumber: crop.plotNumber,
      datePlanted: crop.datePlanted,
      estimatedHarvest: crop.estimatedHarvest,
      status: crop.status,
      quantity: crop.quantity,
      health: crop.health || "healthy",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (crop: Crop) => {
    setSelectedCrop(crop);
    setDeleteDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.variety || !formData.plotNumber || !formData.datePlanted || !formData.estimatedHarvest || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAdd) {
        await onAdd(formData);
        toast.success("Crop added successfully!");
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      toast.error("Failed to add crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCrop) return;

    if (!formData.name || !formData.variety || !formData.plotNumber || !formData.datePlanted || !formData.estimatedHarvest || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onUpdate) {
        await onUpdate(selectedCrop.id, formData);
        toast.success("Crop updated successfully!");
        setIsEditDialogOpen(false);
        setSelectedCrop(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      toast.error("Failed to update crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCrop) return;

    setIsSubmitting(true);
    try {
      if (onDelete) {
        await onDelete(selectedCrop.id);
        toast.success("Crop deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedCrop(null);
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast.error("Failed to delete crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Crop["status"]) => {
    switch (status) {
      case "growing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Growing</Badge>;
      case "ready":
        return <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>;
      case "harvested":
        return <Badge variant="secondary">Harvested</Badge>;
    }
  };

  const getHealthBadge = (health?: Crop["health"]) => {
    if (!health) return null;
    
    switch (health) {
      case "healthy":
        return <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>;
      case "needs-water":
        return (
          <Badge className="bg-blue-400 hover:bg-blue-500">
            <Droplets className="h-3 w-3 mr-1" />
            Needs Water
          </Badge>
        );
      case "pest-issue":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <Bug className="h-3 w-3 mr-1" />
            Pest Issue
          </Badge>
        );
      case "disease":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Disease
          </Badge>
        );
    }
  };

  const getDaysUntilHarvest = (estimatedDate: string) => {
    const today = new Date();
    const harvestDate = new Date(estimatedDate);
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Ready";
    if (diffDays === 0) return "Today";
    return `${diffDays} days`;
  };

  // Filter crops
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = 
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.plotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || crop.status === statusFilter;
    const matchesHealth = healthFilter === "all" || crop.health === healthFilter;
    
    return matchesSearch && matchesStatus && matchesHealth;
  });

  const handleExport = () => {
    const csvContent = [
      ["Crop Name", "Variety", "Plot", "Date Planted", "Est. Harvest", "Quantity", "Status", "Health"],
      ...filteredCrops.map(crop => [
        crop.name,
        crop.variety,
        crop.plotNumber,
        new Date(crop.datePlanted).toLocaleDateString(),
        new Date(crop.estimatedHarvest).toLocaleDateString(),
        crop.quantity,
        crop.status,
        crop.health || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crops-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Crops data exported successfully!");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Crops Management</CardTitle>
            <CardDescription>Current crops planted in the community garden</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Crop</DialogTitle>
                <DialogDescription>
                  Enter the details of the new crop to add to the garden
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Crop Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tomatoes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety *</Label>
                  <Input
                    id="variety"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g., Cherry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plotNumber">Plot Number *</Label>
                  <Input
                    id="plotNumber"
                    value={formData.plotNumber}
                    onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                    placeholder="e.g., A1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 50 plants"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datePlanted">Date Planted *</Label>
                  <Input
                    id="datePlanted"
                    type="date"
                    value={formData.datePlanted}
                    onChange={(e) => setFormData({ ...formData, datePlanted: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHarvest">Estimated Harvest *</Label>
                  <Input
                    id="estimatedHarvest"
                    type="date"
                    value={formData.estimatedHarvest}
                    onChange={(e) => setFormData({ ...formData, estimatedHarvest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growing">Growing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="harvested">Harvested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health">Health Status</Label>
                  <Select value={formData.health} onValueChange={(value: any) => setFormData({ ...formData, health: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="needs-water">Needs Water</SelectItem>
                      <SelectItem value="pest-issue">Pest Issue</SelectItem>
                      <SelectItem value="disease">Disease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Adding..." : "Add Crop"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops, variety, or plot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="harvested">Harvested</SelectItem>
            </SelectContent>
          </Select>
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="needs-water">Needs Water</SelectItem>
              <SelectItem value="pest-issue">Pest Issue</SelectItem>
              <SelectItem value="disease">Disease</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop Name</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead>Plot</TableHead>
                <TableHead>Date Planted</TableHead>
                <TableHead>Est. Harvest</TableHead>
                <TableHead>Days Until Harvest</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No crops found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredCrops.map((crop) => (
                  <TableRow key={crop.id}>
                    <TableCell>{crop.name}</TableCell>
                    <TableCell>{crop.variety}</TableCell>
                    <TableCell>{crop.plotNumber}</TableCell>
                    <TableCell>{new Date(crop.datePlanted).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(crop.estimatedHarvest).toLocaleDateString()}</TableCell>
                    <TableCell>{getDaysUntilHarvest(crop.estimatedHarvest)}</TableCell>
                    <TableCell>{crop.quantity}</TableCell>
                    <TableCell>{getStatusBadge(crop.status)}</TableCell>
                    <TableCell>{getHealthBadge(crop.health)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(crop)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(crop)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredCrops.length} of {crops.length} crops
        </p>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Crop</DialogTitle>
            <DialogDescription>
              Update the details of {selectedCrop?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Crop Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tomatoes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-variety">Variety *</Label>
              <Input
                id="edit-variety"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g., Cherry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-plotNumber">Plot Number *</Label>
              <Input
                id="edit-plotNumber"
                value={formData.plotNumber}
                onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                placeholder="e.g., A1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity *</Label>
              <Input
                id="edit-quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 50 plants"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-datePlanted">Date Planted *</Label>
              <Input
                id="edit-datePlanted"
                type="date"
                value={formData.datePlanted}
                onChange={(e) => setFormData({ ...formData, datePlanted: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedHarvest">Estimated Harvest *</Label>
              <Input
                id="edit-estimatedHarvest"
                type="date"
                value={formData.estimatedHarvest}
                onChange={(e) => setFormData({ ...formData, estimatedHarvest: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="harvested">Harvested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-health">Health Status</Label>
              <Select value={formData.health} onValueChange={(value: any) => setFormData({ ...formData, health: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="needs-water">Needs Water</SelectItem>
                  <SelectItem value="pest-issue">Pest Issue</SelectItem>
                  <SelectItem value="disease">Disease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Updating..." : "Update Crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the crop "{selectedCrop?.name}" from {selectedCrop?.plotNumber}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
