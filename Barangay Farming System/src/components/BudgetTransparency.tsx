import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Search, Download, Printer, Plus, Pencil, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface BudgetTransparencyProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
  isAdmin?: boolean;
  onAdd?: (item: Omit<BudgetItem, "id">) => Promise<void>;
  onUpdate?: (id: string, item: Partial<BudgetItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onUpdateTotalBudget?: (amount: number) => Promise<void>;
}

export function BudgetTransparency({ budgetItems, totalBudget, isAdmin = false, onAdd, onUpdate, onDelete, onUpdateTotalBudget }: BudgetTransparencyProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState("");

  // Get unique categories
  const categories = Array.from(new Set(budgetItems.map(item => item.category)));

  // Filter budget items
  const filteredItems = budgetItems.filter((item) => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate spending by category
  const categorySpending = budgetItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    amount: value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const remaining = totalBudget - totalSpent;

  const summaryData = [
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: remaining }
  ];

  const handleExport = () => {
    const csvContent = [
      ["Date", "Category", "Description", "Amount"],
      ...filteredItems.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.category,
        item.description,
        item.amount
      ]),
      ["", "", "Total Spent", totalSpent],
      ["", "", "Remaining Budget", remaining]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Budget data exported successfully!");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleOpenDialog = (item?: BudgetItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        description: item.description,
        amount: item.amount.toString(),
        date: item.date,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      date: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.description || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemData = {
        category: formData.category,
        description: formData.description,
        amount: amount,
        date: formData.date,
      };

      if (editingItem && onUpdate) {
        await onUpdate(editingItem.id, itemData);
        toast.success("Budget item updated successfully!");
      } else if (onAdd) {
        await onAdd(itemData);
        toast.success("Budget item added successfully!");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving budget item:", error);
      toast.error("Failed to save budget item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, description: string) => {
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        await onDelete(id);
        toast.success("Budget item deleted successfully!");
      } catch (error) {
        console.error("Error deleting budget item:", error);
        toast.error("Failed to delete budget item");
      }
    }
  };

  const handleOpenBudgetDialog = () => {
    setNewTotalBudget(totalBudget.toString());
    setIsBudgetDialogOpen(true);
  };

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newTotalBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    if (!onUpdateTotalBudget) return;

    setIsSubmitting(true);
    try {
      await onUpdateTotalBudget(amount);
      setIsBudgetDialogOpen(false);
      toast.success("Total budget updated successfully!");
    } catch (error) {
      console.error("Error updating total budget:", error);
      toast.error("Failed to update total budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Total Budget: ₱{totalBudget.toLocaleString()}</CardDescription>
              </div>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={handleOpenBudgetDialog}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Budget
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-4">Budget Utilization</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={summaryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₱${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="mb-4">Spending by Category</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expense Records</CardTitle>
                <CardDescription>Detailed breakdown of all expenses</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
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
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">₱{item.amount.toLocaleString()}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id, item.description)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell colSpan={3}>Total Spent</TableCell>
                        <TableCell className="text-right">₱{totalSpent.toLocaleString()}</TableCell>
                        {isAdmin && <TableCell></TableCell>}
                      </TableRow>
                      <TableRow className="font-bold">
                        <TableCell colSpan={3}>Remaining Budget</TableCell>
                        <TableCell className="text-right">₱{remaining.toLocaleString()}</TableCell>
                        {isAdmin && <TableCell></TableCell>}
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {budgetItems.length} expense records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update expense details" : "Record a new expense"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Seeds, Tools, Water"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the expense..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Total Budget Dialog */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Total Budget</DialogTitle>
            <DialogDescription>
              Update the total budget allocation for the community garden
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget (₱) *</Label>
              <Input
                id="totalBudget"
                type="number"
                step="0.01"
                value={newTotalBudget}
                onChange={(e) => setNewTotalBudget(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground">
                Current total: ₱{totalBudget.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2">Budget Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Spent:</span>
                  <span>₱{totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Total:</span>
                  <span>₱{parseFloat(newTotalBudget || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-muted-foreground">New Remaining:</span>
                  <span className={(parseFloat(newTotalBudget || "0") - totalSpent) < 0 ? "text-destructive" : ""}>
                    ₱{(parseFloat(newTotalBudget || "0") - totalSpent).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBudget} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
