import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Sprout, Mail, Lock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { signIn } from "../utils/auth";
import { SignUpDialog } from "./SignUpDialog";

interface LandingPageProps {
  onLogin: (accessToken: string) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { accessToken } = await signIn({ email, password });
      toast.success("Welcome to Plant n' Plan!");
      onLogin(accessToken);
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSuccess = () => {
    toast.success("Account created! Please sign in with your credentials.");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Main Background Image */}
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80"
          alt="Community Garden"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-green-800/85 to-emerald-900/90" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-white">Plant n' Plan</h1>
              <p className="text-white/90">Barangay Farming System</p>
            </div>
          </div>

          <h2 className="text-white mb-4 max-w-md">
            Growing Together, Building Community
          </h2>
          
          <p className="text-white/90 max-w-md mb-8">
            A transparent farming management system that helps our barangay track crops, 
            monitor harvests, manage budgets, and strengthen community bonds through shared 
            agricultural success.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
              <div>
                <h4 className="text-white mb-1">Track & Monitor</h4>
                <p className="text-sm text-white/80">
                  Real-time updates on crops, harvests, and garden activities
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
              <div>
                <h4 className="text-white mb-1">Budget Transparency</h4>
                <p className="text-sm text-white/80">
                  Clear visibility on how community funds are utilized
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
              <div>
                <h4 className="text-white mb-1">Community Engagement</h4>
                <p className="text-sm text-white/80">
                  Volunteer management, polls, and feedback system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-green-600">Plant n' Plan</h2>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to access the barangay farming system
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-700 whitespace-nowrap"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground px-4">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-green-600 hover:text-green-700 font-medium"
              onClick={() => setShowSignUpDialog(true)}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* Sign Up Dialog */}
      <SignUpDialog
        open={showSignUpDialog}
        onClose={() => setShowSignUpDialog(false)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </div>
  );
}
