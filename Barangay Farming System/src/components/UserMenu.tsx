import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut, Settings, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userRole?: string;
  onLogout: () => void;
  onProfileClick?: () => void;
}

export function UserMenu({ userName, userEmail, userRole = "member", onLogout, onProfileClick }: UserMenuProps) {
  const handleLogout = () => {
    onLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = userRole === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-600 rounded-full">
          <Avatar className={`h-9 w-9 border-2 ${isAdmin ? "border-yellow-500" : "border-green-600"}`}>
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className={isAdmin ? "bg-yellow-500 text-white" : "bg-green-600 text-white"}>
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm leading-none">{userName}</p>
              {isAdmin && <Shield className="h-3 w-3 text-yellow-600" />}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p>{userName}</p>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (onProfileClick) {
              onProfileClick();
            } else {
              toast.info("Profile page coming soon!");
            }
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toast.info("Settings page coming soon!")}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
