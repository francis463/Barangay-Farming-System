import { useState, useEffect } from "react";
import { getSession, getUserProfile, signOut, type UserProfile } from "./utils/auth";
import { Dashboard } from "./components/Dashboard";
import { CropsManagement } from "./components/CropsManagement";
import { HarvestTracker } from "./components/HarvestTracker";
import { BudgetTransparency } from "./components/BudgetTransparency";
import { CommunityUpdates } from "./components/CommunityUpdates";
import { PlantingSchedule } from "./components/PlantingSchedule";
import { WeatherWidget } from "./components/WeatherWidget";
import { PhotoGallery } from "./components/PhotoGallery";
import { VolunteerManagement } from "./components/VolunteerManagement";
import { CommunityEngagement } from "./components/CommunityEngagement";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { LandingPage } from "./components/LandingPage";
import { UserMenu } from "./components/UserMenu";
import { ProfilePage } from "./components/ProfilePage";
import { UserRegistration } from "./components/UserRegistration";
import { Menu, Sprout, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import {
  cropsApi,
  harvestsApi,
  budgetApi,
  volunteersApi,
  tasksApi,
  pollsApi,
  feedbacksApi,
  photosApi,
  updatesApi,
  eventsApi,
  settingsApi,
} from "./utils/api";
import { initializeDatabaseWithSampleData } from "./utils/initializeData";
import { getWeatherWithLocation, getMockWeatherData, type WeatherData } from "./utils/weather";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData>(getMockWeatherData());
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  
  // Data states
  const [crops, setCrops] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [totalBudget, setTotalBudget] = useState(30000);

  const budgetSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalCrops = crops.length;
  const activePlots = crops.filter((c: any) => c.status !== "harvested").length;
  const upcomingHarvests = crops.filter((c: any) => c.status === "ready").length;

  // Load weather data with auto-location
  const loadWeatherData = async () => {
    setIsWeatherLoading(true);
    try {
      const data = await getWeatherWithLocation();
      setWeatherData(data);
    } catch (error) {
      console.error("Error loading weather data:", error);
      toast.error("Failed to load weather data. Using fallback.");
      setWeatherData(getMockWeatherData());
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Load weather on mount and when authenticated
  useEffect(() => {
    loadWeatherData();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        
        if (session && session.access_token) {
          const profile = await getUserProfile(session.access_token);
          
          if (profile) {
            setAccessToken(session.access_token);
            setUserProfile(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Load data from database
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [
        cropsData,
        harvestsData,
        budgetData,
        volunteersData,
        tasksData,
        pollsData,
        feedbacksData,
        photosData,
        updatesData,
        eventsData,
        totalBudgetData,
      ] = await Promise.all([
        cropsApi.getAll(),
        harvestsApi.getAll(),
        budgetApi.getAll(),
        volunteersApi.getAll(),
        tasksApi.getAll(),
        pollsApi.getAll(),
        feedbacksApi.getAll(),
        photosApi.getAll(),
        updatesApi.getAll(),
        eventsApi.getAll(),
        settingsApi.getTotalBudget().catch(() => 30000), // Default to 30000 if not set
      ]);

      setCrops(cropsData || []);
      setHarvests(harvestsData || []);
      setBudgetItems(budgetData || []);
      setVolunteers(volunteersData || []);
      setTasks(tasksData || []);
      setPolls(pollsData || []);
      setFeedbacks(feedbacksData || []);
      setPhotos(photosData || []);
      setUpdates(updatesData || []);
      setEvents(eventsData || []);
      setTotalBudget(totalBudgetData || 30000);

      // Initialize sample data if empty
      if (!cropsData || cropsData.length === 0) {
        console.log("No data found, initializing sample data...");
        await initializeDatabaseWithSampleData();
        // Reload data after initialization
        await loadData();
        toast.success("Database initialized with sample data!");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data from database");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // CRUD handlers for crops
  const handleAddCrop = async (cropData: any) => {
    await cropsApi.create(cropData);
    await loadData(); // Refresh all data
  };

  const handleUpdateCrop = async (id: string, cropData: any) => {
    await cropsApi.update(id, cropData);
    await loadData(); // Refresh all data
  };

  const handleDeleteCrop = async (id: string) => {
    await cropsApi.delete(id);
    await loadData(); // Refresh all data
  };

  // CRUD handlers for harvests
  const handleAddHarvest = async (harvestData: any) => {
    await harvestsApi.create(harvestData);
    await loadData();
  };

  const handleUpdateHarvest = async (id: string, harvestData: any) => {
    await harvestsApi.update(id, harvestData);
    await loadData();
  };

  const handleDeleteHarvest = async (id: string) => {
    await harvestsApi.delete(id);
    await loadData();
  };

  // CRUD handlers for budget items
  const handleAddBudgetItem = async (budgetData: any) => {
    await budgetApi.create(budgetData);
    await loadData();
  };

  const handleUpdateBudgetItem = async (id: string, budgetData: any) => {
    await budgetApi.update(id, budgetData);
    await loadData();
  };

  const handleDeleteBudgetItem = async (id: string) => {
    await budgetApi.delete(id);
    await loadData();
  };

  // CRUD handlers for volunteers
  const handleAddVolunteer = async (volunteerData: any) => {
    await volunteersApi.create(volunteerData);
    await loadData();
  };

  const handleUpdateVolunteer = async (id: string, volunteerData: any) => {
    await volunteersApi.update(id, volunteerData);
    await loadData();
  };

  const handleDeleteVolunteer = async (id: string) => {
    await volunteersApi.delete(id);
    await loadData();
  };

  // CRUD handlers for tasks
  const handleAddTask = async (taskData: any) => {
    await tasksApi.create(taskData);
    await loadData();
  };

  const handleUpdateTask = async (id: string, taskData: any) => {
    await tasksApi.update(id, taskData);
    await loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await tasksApi.delete(id);
    await loadData();
  };

  // CRUD handlers for updates
  const handleAddUpdate = async (updateData: any) => {
    await updatesApi.create(updateData);
    await loadData();
  };

  const handleUpdateUpdate = async (id: string, updateData: any) => {
    await updatesApi.update(id, updateData);
    await loadData();
  };

  const handleDeleteUpdate = async (id: string) => {
    await updatesApi.delete(id);
    await loadData();
  };

  // CRUD handlers for photos
  const handleAddPhoto = async (photoData: any) => {
    await photosApi.create(photoData);
    await loadData();
  };

  const handleUpdatePhoto = async (id: string, photoData: any) => {
    await photosApi.update(id, photoData);
    await loadData();
  };

  const handleDeletePhoto = async (id: string) => {
    await photosApi.delete(id);
    await loadData();
  };

  // Handler for updating total budget
  const handleUpdateTotalBudget = async (amount: number) => {
    await settingsApi.setTotalBudget(amount);
    setTotalBudget(amount);
  };

  // Login handler
  const handleLogin = async (token: string) => {
    setAccessToken(token);
    
    // Get user profile
    try {
      const profile = await getUserProfile(token);
      setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Failed to load user profile");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserProfile(null);
      setActiveTab("dashboard");
      // Reset data
      setCrops([]);
      setHarvests([]);
      setBudgetItems([]);
      setVolunteers([]);
      setTasks([]);
      setPolls([]);
      setFeedbacks([]);
      setPhotos([]);
      setUpdates([]);
      setEvents([]);
      
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative mb-6">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
            </div>
            {/* Static plant icon in center */}
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
              <Sprout className="h-8 w-8 text-green-700 animate-pulse" />
            </div>
          </div>
          <h3 className="text-green-600 mb-2">Plant n' Plan</h3>
          <p className="text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // Show loading state while loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative mb-6">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
            </div>
            {/* Static plant icon in center */}
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
              <Sprout className="h-8 w-8 text-green-700 animate-pulse" />
            </div>
          </div>
          <h3 className="text-green-600 mb-2">Plant n' Plan</h3>
          <p className="text-muted-foreground">Loading farming data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isAdmin={userProfile?.role === "admin"}
      />

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-20">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-accent rounded-md"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="lg:hidden">
                  <h1 className="text-green-600">Plant n' Plan</h1>
                  <p className="text-sm text-muted-foreground">Barangay Farming System</p>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-green-600">Plant n' Plan - Barangay Community Farming System</h1>
                  <p className="text-sm text-muted-foreground">Transparent farming management for our community</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
                <UserMenu 
                  userName={userProfile?.name || "User"}
                  userEmail={userProfile?.email || ""}
                  userRole={userProfile?.role || "member"}
                  onLogout={handleLogout}
                  onProfileClick={() => setActiveTab("profile")}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80"
            alt="Community Garden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
            <div className="px-4 md:px-8">
              <h2 className="text-white mb-2">Growing Together, Building Community</h2>
              <p className="text-white/90 max-w-2xl">
                Transparent farming management system for our barangay. Track crops, monitor harvests, 
                and see how we manage our community resources together.
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-4 md:px-8 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <Dashboard
                totalCrops={totalCrops}
                activePlots={activePlots}
                upcomingHarvests={upcomingHarvests}
                totalBudget={totalBudget}
                budgetSpent={budgetSpent}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CommunityUpdates updates={updates.slice(0, 3)} />
                </div>
                <div>
                  <WeatherWidget 
                    weather={weatherData} 
                    isLoading={isWeatherLoading}
                    onRefresh={loadWeatherData}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "crops" && (
            <CropsManagement 
              crops={crops} 
              onAdd={handleAddCrop}
              onUpdate={handleUpdateCrop}
              onDelete={handleDeleteCrop}
            />
          )}

          {activeTab === "harvest" && (
            <HarvestTracker 
              harvests={harvests}
              isAdmin={userProfile?.role === "admin"}
              onAdd={handleAddHarvest}
              onUpdate={handleUpdateHarvest}
              onDelete={handleDeleteHarvest}
            />
          )}

          {activeTab === "budget" && (
            <BudgetTransparency 
              budgetItems={budgetItems} 
              totalBudget={totalBudget}
              isAdmin={userProfile?.role === "admin"}
              onAdd={handleAddBudgetItem}
              onUpdate={handleUpdateBudgetItem}
              onDelete={handleDeleteBudgetItem}
              onUpdateTotalBudget={handleUpdateTotalBudget}
            />
          )}

          {activeTab === "volunteers" && (
            <VolunteerManagement 
              volunteers={volunteers} 
              tasks={tasks}
              isAdmin={userProfile?.role === "admin"}
              onAddVolunteer={handleAddVolunteer}
              onUpdateVolunteer={handleUpdateVolunteer}
              onDeleteVolunteer={handleDeleteVolunteer}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === "gallery" && (
            <PhotoGallery 
              photos={photos}
              isAdmin={userProfile?.role === "admin"}
              onAdd={handleAddPhoto}
              onUpdate={handleUpdatePhoto}
              onDelete={handleDeletePhoto}
            />
          )}

          {activeTab === "engagement" && (
            <CommunityEngagement 
              polls={polls} 
              feedbacks={feedbacks}
              onDataUpdate={loadData}
            />
          )}

          {activeTab === "updates" && (
            <CommunityUpdates 
              updates={updates}
              isAdmin={userProfile?.role === "admin"}
              onAdd={handleAddUpdate}
              onUpdate={handleUpdateUpdate}
              onDelete={handleDeleteUpdate}
            />
          )}

          {activeTab === "schedule" && <PlantingSchedule events={events} />}

          {activeTab === "profile" && (
            <ProfilePage 
              userProfile={userProfile}
              accessToken={accessToken}
              onProfileUpdate={(updatedProfile) => setUserProfile(updatedProfile)}
            />
          )}

          {activeTab === "register" && userProfile?.role === "admin" && (
            <UserRegistration accessToken={accessToken} />
          )}
        </div>

        {/* Footer */}
        <footer className="border-t mt-12 py-6 bg-card">
          <div className="px-4 text-center text-sm text-muted-foreground">
            <p>Barangay Community Farming System • Promoting Transparency and Community Participation</p>
          </div>
        </footer>
      </div>
    </div>
  );
}