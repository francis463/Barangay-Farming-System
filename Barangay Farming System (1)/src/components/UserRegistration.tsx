import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Eye, EyeOff, User, Mail, Lock, UserPlus, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { adminRegisterUser } from "../utils/auth";

interface UserRegistrationProps {
  accessToken: string | null;
}

export function UserRegistration({ accessToken }: UserRegistrationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);

    try {
      await adminRegisterUser(accessToken, { email, password, name, role });
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>User "{name}" created successfully as {role}!</span>
        </div>
      );
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("member");
    } catch (error: any) {
      console.error("User registration error:", error);
      toast.error(error.message || "Failed to create user account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("member");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>User Registration</h2>
        <p className="text-muted-foreground">Register new users or administrators for the community farming system</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <CardTitle>Create New User Account</CardTitle>
          </div>
          <CardDescription>
            Fill in the details below to register a new user. You can assign them as a member or administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select value={role} onValueChange={(value: "member" | "admin") => setRole(value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Member</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === "admin" 
                    ? "Admins can manage all aspects of the system including user registration" 
                    : "Members can view data and participate in community engagement"}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Role Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Member</Badge>
                  <span className="text-muted-foreground flex-1">
                    Can view crops, harvests, budget, gallery, and participate in polls and feedback
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 mt-0.5">Admin</Badge>
                  <span className="text-muted-foreground flex-1">
                    Full access to create, edit, and delete all data. Can register new users and manage system settings. Gets golden avatar and admin badge.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating User...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Create User</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
            <p>
              <strong className="text-foreground">Role assignment:</strong> The role you select above will be assigned to the new user. 
              Choose "Admin" to give full system access or "Member" for view-only with community participation.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
            <p>
              <strong className="text-foreground">Password security:</strong> Make sure to use a strong password 
              (minimum 6 characters). Share credentials securely with the new user.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
            <p>
              <strong className="text-foreground">First login:</strong> New users can sign in immediately after 
              registration using their email and password. They can update their profile after logging in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
