import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Award, Users, CheckCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export interface Volunteer {
  id: string;
  name: string;
  hoursContributed: number;
  tasksCompleted: number;
  lastActivity: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

interface VolunteerManagementProps {
  volunteers: Volunteer[];
  tasks: Task[];
  isAdmin?: boolean;
  onAddVolunteer?: (volunteer: Omit<Volunteer, "id">) => Promise<void>;
  onUpdateVolunteer?: (id: string, volunteer: Partial<Volunteer>) => Promise<void>;
  onDeleteVolunteer?: (id: string) => Promise<void>;
  onAddTask?: (task: Omit<Task, "id">) => Promise<void>;
  onUpdateTask?: (id: string, task: Partial<Task>) => Promise<void>;
  onDeleteTask?: (id: string) => Promise<void>;
}

export function VolunteerManagement({ 
  volunteers, 
  tasks, 
  isAdmin = false,
  onAddVolunteer,
  onUpdateVolunteer,
  onDeleteVolunteer,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: VolunteerManagementProps) {
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    role: "",
    hoursContributed: "",
    tasksCompleted: "",
    lastActivity: "",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    assignedTo: "",
    dueDate: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalHours = volunteers.reduce((sum, v) => sum + v.hoursContributed, 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const topVolunteers = [...volunteers].sort((a, b) => b.hoursContributed - a.hoursContributed).slice(0, 3);

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
    }
  };

  // Volunteer handlers
  const handleOpenVolunteerDialog = (volunteer?: Volunteer) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setVolunteerForm({
        name: volunteer.name,
        role: volunteer.role,
        hoursContributed: volunteer.hoursContributed.toString(),
        tasksCompleted: volunteer.tasksCompleted.toString(),
        lastActivity: volunteer.lastActivity,
      });
    } else {
      setEditingVolunteer(null);
      setVolunteerForm({
        name: "",
        role: "",
        hoursContributed: "0",
        tasksCompleted: "0",
        lastActivity: new Date().toISOString().split('T')[0],
      });
    }
    setVolunteerDialogOpen(true);
  };

  const handleCloseVolunteerDialog = () => {
    setVolunteerDialogOpen(false);
    setEditingVolunteer(null);
  };

  const handleSubmitVolunteer = async () => {
    if (!volunteerForm.name || !volunteerForm.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: volunteerForm.name,
        role: volunteerForm.role,
        hoursContributed: parseInt(volunteerForm.hoursContributed) || 0,
        tasksCompleted: parseInt(volunteerForm.tasksCompleted) || 0,
        lastActivity: volunteerForm.lastActivity || new Date().toISOString(),
      };

      if (editingVolunteer && onUpdateVolunteer) {
        await onUpdateVolunteer(editingVolunteer.id, data);
        toast.success("Volunteer updated successfully!");
      } else if (onAddVolunteer) {
        await onAddVolunteer(data);
        toast.success("Volunteer added successfully!");
      }
      handleCloseVolunteerDialog();
    } catch (error) {
      console.error("Error saving volunteer:", error);
      toast.error("Failed to save volunteer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (id: string, name: string) => {
    if (!onDeleteVolunteer) return;
    
    if (window.confirm(`Are you sure you want to remove ${name} from volunteers?`)) {
      try {
        await onDeleteVolunteer(id);
        toast.success("Volunteer removed successfully!");
      } catch (error) {
        console.error("Error deleting volunteer:", error);
        toast.error("Failed to delete volunteer");
      }
    }
  };

  // Task handlers
  const handleOpenTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: "",
        assignedTo: "",
        dueDate: new Date().toISOString().split('T')[0],
        status: "pending",
        priority: "medium",
      });
    }
    setTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo || !taskForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        title: taskForm.title,
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate,
        status: taskForm.status,
        priority: taskForm.priority,
      };

      if (editingTask && onUpdateTask) {
        await onUpdateTask(editingTask.id, data);
        toast.success("Task updated successfully!");
      } else if (onAddTask) {
        await onAddTask(data);
        toast.success("Task created successfully!");
      }
      handleCloseTaskDialog();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!onDeleteTask) return;
    
    if (window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      try {
        await onDeleteTask(id);
        toast.success("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{volunteers.length}</div>
              <p className="text-xs text-muted-foreground">Active community members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Hours</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours}</div>
              <p className="text-xs text-muted-foreground">Contributed this quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Most active volunteers this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVolunteers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No volunteers yet
                </div>
              ) : (
                topVolunteers.map((volunteer, index) => (
                  <div key={volunteer.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4>{volunteer.name}</h4>
                          <p className="text-sm text-muted-foreground">{volunteer.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{volunteer.hoursContributed} hours</p>
                          <p className="text-xs text-muted-foreground">{volunteer.tasksCompleted} tasks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Volunteers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Volunteers</CardTitle>
                <CardDescription>Complete list of community contributors</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => handleOpenVolunteerDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Volunteer
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Last Activity</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                        No volunteers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    volunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>{volunteer.name}</TableCell>
                        <TableCell>{volunteer.role}</TableCell>
                        <TableCell>{volunteer.hoursContributed}</TableCell>
                        <TableCell>{volunteer.tasksCompleted}</TableCell>
                        <TableCell>{new Date(volunteer.lastActivity).toLocaleDateString()}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenVolunteerDialog(volunteer)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVolunteer(volunteer.id, volunteer.name)}
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
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Assignment</CardTitle>
                <CardDescription>Current tasks and their status</CardDescription>
              </div>
              {isAdmin && (
                <Button onClick={() => handleOpenTaskDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                        No tasks assigned
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenTaskDialog(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id, task.title)}
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
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Dialog */}
      <Dialog open={volunteerDialogOpen} onOpenChange={setVolunteerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle>
            <DialogDescription>
              {editingVolunteer ? "Update volunteer information" : "Add a new community volunteer"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={volunteerForm.name}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={volunteerForm.role}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
                placeholder="Garden Coordinator"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Contributed</Label>
                <Input
                  id="hours"
                  type="number"
                  value={volunteerForm.hoursContributed}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, hoursContributed: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks Completed</Label>
                <Input
                  id="tasks"
                  type="number"
                  value={volunteerForm.tasksCompleted}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, tasksCompleted: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastActivity">Last Activity</Label>
              <Input
                id="lastActivity"
                type="date"
                value={volunteerForm.lastActivity}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, lastActivity: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseVolunteerDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitVolunteer} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingVolunteer ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update task details" : "Create a new task assignment"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Water the plants"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Input
                id="assignedTo"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                placeholder="Volunteer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value: Task["priority"]) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={taskForm.status} onValueChange={(value: Task["status"]) => setTaskForm({ ...taskForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTaskDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTask} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingTask ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
