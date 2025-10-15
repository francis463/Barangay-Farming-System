import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Search, Download, Printer, Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export interface Harvest {
  id: string;
  cropName: string;
  harvestDate: string;
  quantity: string;
  distributionMethod: string;
  notes: string;
}

interface HarvestTrackerProps {
  harvests: Harvest[];
  isAdmin?: boolean;
  onAdd?: (harvest: Omit<Harvest, "id">) => Promise<void>;
  onUpdate?: (id: string, harvest: Partial<Harvest>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function HarvestTracker({ harvests, isAdmin = false, onAdd, onUpdate, onDelete }: HarvestTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [formData, setFormData] = useState({
    cropName: "",
    harvestDate: "",
    quantity: "",
    distributionMethod: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter harvests
  const filteredHarvests = harvests.filter((harvest) => {
    return (
      harvest.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.distributionMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExport = () => {
    const csvContent = [
      ["Crop Name", "Harvest Date", "Quantity", "Distribution", "Notes"],
      ...filteredHarvests.map(harvest => [
        harvest.cropName,
        new Date(harvest.harvestDate).toLocaleDateString(),
        harvest.quantity,
        harvest.distributionMethod,
        harvest.notes
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Harvest data exported successfully!");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleOpenDialog = (harvest?: Harvest) => {
    if (harvest) {
      setEditingHarvest(harvest);
      setFormData({
        cropName: harvest.cropName,
        harvestDate: harvest.harvestDate,
        quantity: harvest.quantity,
        distributionMethod: harvest.distributionMethod,
        notes: harvest.notes,
      });
    } else {
      setEditingHarvest(null);
      setFormData({
        cropName: "",
        harvestDate: new Date().toISOString().split('T')[0],
        quantity: "",
        distributionMethod: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHarvest(null);
    setFormData({
      cropName: "",
      harvestDate: "",
      quantity: "",
      distributionMethod: "",
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.cropName || !formData.harvestDate || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingHarvest && onUpdate) {
        await onUpdate(editingHarvest.id, formData);
        toast.success("Harvest updated successfully!");
      } else if (onAdd) {
        await onAdd(formData);
        toast.success("Harvest added successfully!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving harvest:", error);
      toast.error("Failed to save harvest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, cropName: string) => {
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete the harvest record for ${cropName}?`)) {
      try {
        await onDelete(id);
        toast.success("Harvest deleted successfully!");
      } catch (error) {
        console.error("Error deleting harvest:", error);
        toast.error("Failed to delete harvest");
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Harvest Records</CardTitle>
              <CardDescription>History of completed harvests and their distribution</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Harvest
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by crop name, distribution, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                  <TableHead>Harvest Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Notes</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHarvests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                      No harvest records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHarvests.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell>{harvest.cropName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(harvest.harvestDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{harvest.quantity}</TableCell>
                      <TableCell>{harvest.distributionMethod}</TableCell>
                      <TableCell>{harvest.notes}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(harvest)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(harvest.id, harvest.cropName)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredHarvests.length} of {harvests.length} harvest records
          </p>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHarvest ? "Edit Harvest" : "Add Harvest"}</DialogTitle>
            <DialogDescription>
              {editingHarvest ? "Update harvest record details" : "Record a new harvest"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cropName">Crop Name *</Label>
              <Input
                id="cropName"
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="e.g., Tomatoes, Lettuce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 50 kg, 200 pieces"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributionMethod">Distribution Method</Label>
              <Input
                id="distributionMethod"
                value={formData.distributionMethod}
                onChange={(e) => setFormData({ ...formData, distributionMethod: e.target.value })}
                placeholder="e.g., Community distribution, Market sale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information about this harvest..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingHarvest ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
