import { LayoutDashboard, Sprout, Calendar, Wallet, Bell, CalendarDays, Users, Image, Heart, X, User, UserPlus } from "lucide-react";
import { cn } from "./ui/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isAdmin?: boolean;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crops", label: "Crops", icon: Sprout },
  { id: "harvest", label: "Harvest", icon: Calendar },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "volunteers", label: "Volunteers", icon: Users },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "engagement", label: "Community", icon: Heart },
  { id: "updates", label: "Updates", icon: Bell },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: User },
];

const adminNavigationItems = [
  { id: "register", label: "Register User", icon: UserPlus, adminOnly: true },
];

export function Sidebar({ activeTab, onTabChange, isMobileOpen, onMobileClose, isAdmin = false }: SidebarProps) {
  const handleItemClick = (id: string) => {
    onTabChange(id);
    onMobileClose();
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-full w-64 bg-card border-r transition-transform duration-300 ease-in-out overflow-y-auto",
      "lg:translate-x-0",
      isMobileOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Sidebar Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-green-600">Plant n' Plan</h3>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-accent rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Admin-only navigation items */}
        {isAdmin && (
          <>
            <div className="pt-2 mt-2 border-t">
              <p className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                Administration
              </p>
            </div>
            {adminNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
