import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Search, Users2, Shield, Mail, Calendar, User, Loader2, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  joinedDate: string;
}

interface UserManagementProps {
  accessToken: string | null;
}

export function UserManagement({ accessToken }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "member">("all");

  const loadUsers = async () => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/users/list`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users");
      }

      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [accessToken]);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === "admin").length;
  const memberCount = users.filter(u => u.role === "member").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-green-600 mb-2">User Management</h2>
        <p className="text-muted-foreground">
          View all registered users and administrators for account recovery assistance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-2xl">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl">{memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                List of all registered users and their roles
              </CardDescription>
            </div>
            <Button
              onClick={loadUsers}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("all")}
              >
                All
              </Button>
              <Button
                variant={filterRole === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admins
              </Button>
              <Button
                variant={filterRole === "member" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("member")}
              >
                <User className="h-4 w-4 mr-2" />
                Members
              </Button>
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || filterRole !== "all" 
                  ? "No users found matching your criteria" 
                  : "No users registered yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" && (
                            <Shield className="h-4 w-4 text-yellow-600" />
                          )}
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className={
                            user.role === "admin"
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : ""
                          }
                        >
                          {user.role === "admin" && (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results count */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-blue-900 dark:text-blue-100 mb-1">Account Recovery Assistance</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Use this page to view all registered user emails for account recovery support. 
                You can search for users by email or name and filter by role. This information 
                helps administrators assist community members who have forgotten their login credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
