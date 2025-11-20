/**
 * ============================================
 * PLANT N' PLAN - MAIN APPLICATION COMPONENT
 * ============================================
 * 
 * This is the root component of the Barangay Community Farming System.
 * It manages:
 * - User authentication and session management
 * - Application state (crops, harvests, budget, volunteers, etc.)
 * - Navigation between different pages
 * - Data loading and synchronization with the backend
 * - Theme management (dark/light mode)
 * - Weather data integration
 */

import { useState, useEffect } from "react";
import { getSession, getUserProfile, signOut, type UserProfile } from "./utils/auth";

// Page Components - Different sections of the application
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
import { UserManagement } from "./components/UserManagement";
import { LocationSettings } from "./components/LocationSettings";

// Icons from Lucide React
import { Menu, Sprout, Loader2 } from "lucide-react";

// UI Components
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

// API Functions - Used to communicate with the backend
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

// Utilities
import { initializeDatabaseWithSampleData } from "./utils/initializeData";
import { getWeatherWithLocation, getMockWeatherData, type WeatherData } from "./utils/weather";

/**
 * Main App Component
 * Manages the entire application state and routing
 */
export default function App() {
  // ============================================
  // AUTHENTICATION STATE
  // ============================================
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Whether user is logged in
  const [accessToken, setAccessToken] = useState<string | null>(null); // JWT token for API requests
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Current user's profile data
  
  // ============================================
  // UI STATE
  // ============================================
  const [activeTab, setActiveTab] = useState("dashboard"); // Current page being displayed
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile menu open/closed
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode toggle
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const [isCheckingSession, setIsCheckingSession] = useState(true); // Checking for existing session
  
  // ============================================
  // WEATHER STATE
  // ============================================
  const [weatherData, setWeatherData] = useState<WeatherData>(getMockWeatherData()); // Weather information
  const [isWeatherLoading, setIsWeatherLoading] = useState(true); // Weather data loading state
  
  // ============================================
  // APPLICATION DATA STATE
  // These arrays hold all the farming data
  // ============================================
  const [crops, setCrops] = useState<any[]>([]); // All crops in the community garden
  const [harvests, setHarvests] = useState<any[]>([]); // Harvest records
  const [budgetItems, setBudgetItems] = useState<any[]>([]); // Budget expenses
  const [volunteers, setVolunteers] = useState<any[]>([]); // Registered volunteers
  const [tasks, setTasks] = useState<any[]>([]); // Community tasks
  const [polls, setPolls] = useState<any[]>([]); // Community polls
  const [feedbacks, setFeedbacks] = useState<any[]>([]); // Community feedback
  const [photos, setPhotos] = useState<any[]>([]); // Gallery photos
  const [updates, setUpdates] = useState<any[]>([]); // Community updates/news
  const [events, setEvents] = useState<any[]>([]); // Upcoming events
  const [totalBudget, setTotalBudget] = useState(30000); // Total budget allocation

  // ============================================
  // COMPUTED VALUES
  // These are calculated from the state above
  // ============================================
  const budgetSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0); // Total spent
  const totalCrops = crops.length; // Total number of crops
  const activePlots = crops.filter((c: any) => c.status !== "harvested").length; // Currently growing crops
  const upcomingHarvests = crops.filter((c: any) => c.status === "ready").length; // Crops ready to harvest

  // ============================================
  // WEATHER DATA LOADING
  // ============================================
  /**
   * Loads weather data with automatic location detection
   * Falls back to mock data if API key is not configured or request fails
   */
  const loadWeatherData = async () => {
    setIsWeatherLoading(true);
    try {
      // Try to get real weather data with auto-detected location
      const data = await getWeatherWithLocation();
      setWeatherData(data);
      
      // Log whether we're using real or sample data
      if (data.alerts.some(alert => alert.includes("sample weather data"))) {
        console.log("ℹ️ Using sample weather data for Kabankalan City. Add OpenWeatherMap API key for real-time weather.");
      } else {
        console.log("✅ Successfully loaded real-time weather data for:", data.location.city);
      }
    } catch (error) {
      console.error("❌ Error loading weather data:", error);
      // Gracefully fall back to mock data without showing errors to users
      setWeatherData(getMockWeatherData());
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // ============================================
  // EFFECT: Load weather data on app mount
  // ============================================
  useEffect(() => {
    loadWeatherData();
  }, []);

  // ============================================
  // EFFECT: Auto-refresh weather data every 15 minutes
  // Keeps the 3-day forecast and current conditions real-time
  // ============================================
  useEffect(() => {
    // Set up interval to refresh weather data every 15 minutes (900,000 ms)
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    const intervalId = setInterval(() => {
      console.log("🔄 Auto-refreshing weather data...");
      loadWeatherData();
    }, REFRESH_INTERVAL);

    // Cleanup: Clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array = runs once on mount, cleanup on unmount

  // ============================================
  // EFFECT: Check for existing user session
  // This runs once when the app loads to see if user is already logged in
  // ============================================
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's an active session in localStorage
        const session = await getSession();
        
        if (session && session.access_token) {
          // Session exists, get the user's profile
          const profile = await getUserProfile(session.access_token);
          
          if (profile) {
            // Valid session - log the user in automatically
            setAccessToken(session.access_token);
            setUserProfile(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        // If session check fails, user will see landing page
      } finally {
        // Done checking session, show the app
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // ============================================
  // EFFECT: Handle dark mode toggle
  // Adds/removes the 'dark' class from HTML element
  // ============================================
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // ============================================
  // LOAD ALL DATA FROM DATABASE
  // This function fetches all farming data from the backend
  // ============================================
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Make all API calls in parallel for faster loading
      // Using Promise.all means all requests happen at the same time
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
        cropsApi.getAll(),         // Get all crops
        harvestsApi.getAll(),      // Get harvest history
        budgetApi.getAll(),        // Get budget expenses
        volunteersApi.getAll(),    // Get volunteer list
        tasksApi.getAll(),         // Get tasks
        pollsApi.getAll(),         // Get community polls
        feedbacksApi.getAll(),     // Get feedback
        photosApi.getAll(),        // Get gallery photos
        updatesApi.getAll(),       // Get community updates
        eventsApi.getAll(),        // Get events
        settingsApi.getTotalBudget().catch(() => 30000), // Get budget total, default to 30000
      ]);

      // Update all state with fetched data
      // Using || [] ensures we always have an array, even if data is null/undefined
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

      // First-time setup: If database is empty, populate with sample data
      if (!cropsData || cropsData.length === 0) {
        console.log("No data found, initializing sample data...");
        await initializeDatabaseWithSampleData();
        // Reload to get the sample data
        await loadData();
        toast.success("Database initialized with sample data!");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data from database");
    } finally {
      // Always stop loading spinner, even if there's an error
      setIsLoading(false);
    }
  };

  // ============================================
  // EFFECT: Load data when user logs in
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // ============================================
  // CRUD HANDLERS FOR CROPS
  // These functions handle Create, Read, Update, Delete operations for crops
  // ============================================
  
  /**
   * Add a new crop to the database
   * @param cropData - Object containing crop information (name, type, plot, etc.)
   */
  const handleAddCrop = async (cropData: any) => {
    await cropsApi.create(cropData);
    await loadData(); // Refresh all data to show the new crop
  };

  /**
   * Update an existing crop
   * @param id - Unique ID of the crop to update
   * @param cropData - New data for the crop
   */
  const handleUpdateCrop = async (id: string, cropData: any) => {
    await cropsApi.update(id, cropData);
    await loadData(); // Refresh to show updated crop
  };

  /**
   * Delete a crop from the database
   * @param id - Unique ID of the crop to delete
   */
  const handleDeleteCrop = async (id: string) => {
    await cropsApi.delete(id);
    await loadData(); // Refresh to remove the crop from the list
  };

  // ============================================
  // CRUD HANDLERS FOR HARVESTS
  // ============================================
  
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

  // ============================================
  // CRUD HANDLERS FOR BUDGET ITEMS
  // ============================================
  
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

  // ============================================
  // CRUD HANDLERS FOR VOLUNTEERS
  // ============================================
  
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

  // ============================================
  // CRUD HANDLERS FOR TASKS
  // ============================================
  
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

  // ============================================
  // CRUD HANDLERS FOR COMMUNITY UPDATES
  // ============================================
  
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

  // ============================================
  // CRUD HANDLERS FOR PHOTOS
  // ============================================
  
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

  // ============================================
  // BUDGET SETTINGS HANDLER
  // ============================================
  
  /**
   * Update the total budget allocation
   * @param amount - New total budget amount
   */
  const handleUpdateTotalBudget = async (amount: number) => {
    await settingsApi.setTotalBudget(amount);
    setTotalBudget(amount);
  };

  // ============================================
  // AUTHENTICATION HANDLERS
  // ============================================
  
  /**
   * Handle user login
   * @param token - Access token received from Supabase Auth
   */
  const handleLogin = async (token: string) => {
    setAccessToken(token);
    
    // Fetch and store user profile
    try {
      const profile = await getUserProfile(token);
      setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Failed to load user profile");
    }
  };

  /**
   * Handle user logout
   * Clears all user data and returns to landing page
   */
  const handleLogout = async () => {
    try {
      await signOut(); // Clear Supabase session
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
                  userAvatar={userProfile?.avatar}
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
              isAdmin={userProfile?.role === "admin"}
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

          {activeTab === "user-management" && userProfile?.role === "admin" && (
            <UserManagement accessToken={accessToken} />
          )}

          {activeTab === "location-settings" && userProfile?.role === "admin" && (
            <LocationSettings accessToken={accessToken} />
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