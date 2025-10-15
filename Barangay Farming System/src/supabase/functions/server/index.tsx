import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function to generate ID
const generateId = () => crypto.randomUUID();

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Sign up route
app.post("/make-server-a8901673/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ success: false, error: "Email, password, and name are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log("Sign up error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }

    // Determine role based on email
    const adminEmail = "francisjohngorres@gmail.com";
    const isAdmin = email.toLowerCase() === adminEmail.toLowerCase();
    
    // Store additional user profile data in KV store
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: isAdmin ? "admin" : "member",
      joinedDate: new Date().toISOString(),
      avatar: null,
      bio: null,
      location: null,
      tasksCompleted: 0,
      hoursContributed: 0,
      eventsAttended: 0,
      recentActivities: [],
    });

    return c.json({ 
      success: true, 
      data: { 
        user: data.user,
        message: "Account created successfully! You can now sign in."
      } 
    });
  } catch (error) {
    console.log("Sign up server error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin-only registration route
app.post("/make-server-a8901673/auth/admin-register", async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }

    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !adminUser) {
      console.log("Auth error while verifying admin:", authError);
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Check if the requesting user is an admin
    const adminProfile = await kv.get(`user_profile:${adminUser.id}`);
    if (!adminProfile || adminProfile.role !== "admin") {
      return c.json({ success: false, error: "Admin access required" }, 403);
    }

    const { email, password, name, role } = await c.req.json();

    // Validate role
    if (role && role !== "admin" && role !== "member") {
      return c.json({ success: false, error: "Invalid role. Must be 'admin' or 'member'" }, 400);
    }

    // Create user using Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.log("Supabase auth error during admin registration:", error);
      return c.json({ success: false, error: error.message }, 400);
    }

    // Use the role specified by admin, or default to member
    const userRole = role || "member";
    
    // Store additional user profile data in KV store
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: userRole,
      joinedDate: new Date().toISOString(),
      avatar: null,
      bio: null,
      location: null,
      tasksCompleted: 0,
      hoursContributed: 0,
      eventsAttended: 0,
      recentActivities: [],
    });

    console.log(`Admin ${adminUser.email} registered new user ${email} with role ${userRole}`);

    return c.json({ 
      success: true, 
      data: { 
        user: data.user,
        role: userRole,
        message: `User created successfully with ${userRole} role!`
      } 
    });
  } catch (error) {
    console.log("Admin registration server error:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user profile
app.get("/make-server-a8901673/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }

    // Verify the user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Auth error while fetching profile:", error);
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Get user profile from KV store
    let profile = await kv.get(`user_profile:${user.id}`);
    
    // Admin email configuration
    const adminEmail = "francisjohngorres@gmail.com";
    const isAdmin = user.email?.toLowerCase() === adminEmail.toLowerCase();
    
    if (!profile) {
      // Create default profile if it doesn't exist
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || "User";
      
      const defaultProfile = {
        id: user.id,
        email: user.email,
        name: userName,
        role: isAdmin ? "admin" : "member",
        joinedDate: new Date().toISOString(),
        avatar: null,
        bio: null,
        location: null,
        tasksCompleted: 0,
        hoursContributed: 0,
        eventsAttended: 0,
        recentActivities: [],
      };
      await kv.set(`user_profile:${user.id}`, defaultProfile);
      return c.json({ success: true, data: defaultProfile });
    }
    
    // Migrate existing profiles to include new activity fields
    let needsUpdate = false;
    if (profile.tasksCompleted === undefined) {
      profile.tasksCompleted = 0;
      needsUpdate = true;
    }
    if (profile.hoursContributed === undefined) {
      profile.hoursContributed = 0;
      needsUpdate = true;
    }
    if (profile.eventsAttended === undefined) {
      profile.eventsAttended = 0;
      needsUpdate = true;
    }
    if (profile.recentActivities === undefined) {
      profile.recentActivities = [];
      needsUpdate = true;
    }
    
    // Update existing profile to admin if email matches
    if (isAdmin && profile.role !== "admin") {
      profile.role = "admin";
      needsUpdate = true;
      console.log(`Updated ${user.email} to admin role`);
    }
    
    // Save migrated profile
    if (needsUpdate) {
      await kv.set(`user_profile:${user.id}`, profile);
    }

    return c.json({ success: true, data: profile });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update user profile
app.put("/make-server-a8901673/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }

    // Verify the user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Auth error while updating profile:", error);
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const updateData = await c.req.json();
    
    // Get existing profile
    const existingProfile = await kv.get(`user_profile:${user.id}`);
    
    // Ensure user activity fields exist (migration for existing users)
    const profileDefaults = {
      tasksCompleted: 0,
      hoursContributed: 0,
      eventsAttended: 0,
      recentActivities: [],
    };
    
    // Update profile
    const updatedProfile = {
      ...profileDefaults,
      ...existingProfile,
      ...updateData,
      id: user.id, // Ensure ID doesn't change
      email: user.email, // Ensure email doesn't change
    };
    
    await kv.set(`user_profile:${user.id}`, updatedProfile);

    return c.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.log("Error updating user profile:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CROPS ROUTES
// ============================================

app.get("/make-server-a8901673/crops", async (c) => {
  try {
    const crops = await kv.getByPrefix("crop:");
    return c.json({ success: true, data: crops });
  } catch (error) {
    console.log("Error fetching crops:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/crops", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const crop = { ...body, id };
    await kv.set(`crop:${id}`, crop);
    return c.json({ success: true, data: crop });
  } catch (error) {
    console.log("Error creating crop:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/crops/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const crop = { ...body, id };
    await kv.set(`crop:${id}`, crop);
    return c.json({ success: true, data: crop });
  } catch (error) {
    console.log("Error updating crop:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/crops/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`crop:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting crop:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// HARVESTS ROUTES
// ============================================

app.get("/make-server-a8901673/harvests", async (c) => {
  try {
    const harvests = await kv.getByPrefix("harvest:");
    return c.json({ success: true, data: harvests });
  } catch (error) {
    console.log("Error fetching harvests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/harvests", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const harvest = { ...body, id };
    await kv.set(`harvest:${id}`, harvest);
    return c.json({ success: true, data: harvest });
  } catch (error) {
    console.log("Error creating harvest:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/harvests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const harvest = { ...body, id };
    await kv.set(`harvest:${id}`, harvest);
    return c.json({ success: true, data: harvest });
  } catch (error) {
    console.log("Error updating harvest:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/harvests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`harvest:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting harvest:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// BUDGET ROUTES
// ============================================

app.get("/make-server-a8901673/budget", async (c) => {
  try {
    const budgetItems = await kv.getByPrefix("budget:");
    return c.json({ success: true, data: budgetItems });
  } catch (error) {
    console.log("Error fetching budget:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/budget", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const budgetItem = { ...body, id };
    await kv.set(`budget:${id}`, budgetItem);
    return c.json({ success: true, data: budgetItem });
  } catch (error) {
    console.log("Error creating budget item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/budget/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const budgetItem = { ...body, id };
    await kv.set(`budget:${id}`, budgetItem);
    return c.json({ success: true, data: budgetItem });
  } catch (error) {
    console.log("Error updating budget item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/budget/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`budget:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting budget item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// VOLUNTEERS ROUTES
// ============================================

app.get("/make-server-a8901673/volunteers", async (c) => {
  try {
    const volunteers = await kv.getByPrefix("volunteer:");
    return c.json({ success: true, data: volunteers });
  } catch (error) {
    console.log("Error fetching volunteers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/volunteers", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const volunteer = { ...body, id };
    await kv.set(`volunteer:${id}`, volunteer);
    return c.json({ success: true, data: volunteer });
  } catch (error) {
    console.log("Error creating volunteer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/volunteers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const volunteer = { ...body, id };
    await kv.set(`volunteer:${id}`, volunteer);
    return c.json({ success: true, data: volunteer });
  } catch (error) {
    console.log("Error updating volunteer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/volunteers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`volunteer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting volunteer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// TASKS ROUTES
// ============================================

app.get("/make-server-a8901673/tasks", async (c) => {
  try {
    const tasks = await kv.getByPrefix("task:");
    return c.json({ success: true, data: tasks });
  } catch (error) {
    console.log("Error fetching tasks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/tasks", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const task = { ...body, id };
    await kv.set(`task:${id}`, task);
    return c.json({ success: true, data: task });
  } catch (error) {
    console.log("Error creating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const task = { ...body, id };
    await kv.set(`task:${id}`, task);
    return c.json({ success: true, data: task });
  } catch (error) {
    console.log("Error updating task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// POLLS ROUTES
// ============================================

app.get("/make-server-a8901673/polls", async (c) => {
  try {
    const polls = await kv.getByPrefix("poll:");
    return c.json({ success: true, data: polls });
  } catch (error) {
    console.log("Error fetching polls:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/polls", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const poll = { ...body, id };
    await kv.set(`poll:${id}`, poll);
    return c.json({ success: true, data: poll });
  } catch (error) {
    console.log("Error creating poll:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/polls/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existingPoll = await kv.get(`poll:${id}`);
    if (!existingPoll) {
      return c.json({ success: false, error: "Poll not found" }, 404);
    }
    
    const updatedPoll = { ...body, id };
    await kv.set(`poll:${id}`, updatedPoll);
    return c.json({ success: true, data: updatedPoll });
  } catch (error) {
    console.log("Error updating poll:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/polls/:id/vote", async (c) => {
  try {
    const pollId = c.req.param("id");
    const { optionId } = await c.req.json();
    
    const poll = await kv.get(`poll:${pollId}`);
    if (!poll) {
      return c.json({ success: false, error: "Poll not found" }, 404);
    }
    
    // Update vote count
    const updatedPoll = {
      ...poll,
      options: poll.options.map((opt: any) => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
      totalVotes: poll.totalVotes + 1
    };
    
    await kv.set(`poll:${pollId}`, updatedPoll);
    return c.json({ success: true, data: updatedPoll });
  } catch (error) {
    console.log("Error voting on poll:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// FEEDBACKS ROUTES
// ============================================

app.get("/make-server-a8901673/feedbacks", async (c) => {
  try {
    const feedbacks = await kv.getByPrefix("feedback:");
    return c.json({ success: true, data: feedbacks });
  } catch (error) {
    console.log("Error fetching feedbacks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/feedbacks", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const feedback = { 
      ...body, 
      id,
      date: new Date().toISOString(),
      category: "general"
    };
    await kv.set(`feedback:${id}`, feedback);
    return c.json({ success: true, data: feedback });
  } catch (error) {
    console.log("Error creating feedback:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PHOTOS ROUTES
// ============================================

app.get("/make-server-a8901673/photos", async (c) => {
  try {
    const photos = await kv.getByPrefix("photo:");
    return c.json({ success: true, data: photos });
  } catch (error) {
    console.log("Error fetching photos:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/photos", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const photo = { ...body, id };
    await kv.set(`photo:${id}`, photo);
    return c.json({ success: true, data: photo });
  } catch (error) {
    console.log("Error creating photo:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/photos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const photo = { ...body, id };
    await kv.set(`photo:${id}`, photo);
    return c.json({ success: true, data: photo });
  } catch (error) {
    console.log("Error updating photo:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/photos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`photo:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting photo:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// UPDATES ROUTES
// ============================================

app.get("/make-server-a8901673/updates", async (c) => {
  try {
    const updates = await kv.getByPrefix("update:");
    return c.json({ success: true, data: updates });
  } catch (error) {
    console.log("Error fetching updates:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/updates", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const update = { 
      ...body, 
      id,
      date: new Date().toISOString()
    };
    await kv.set(`update:${id}`, update);
    return c.json({ success: true, data: update });
  } catch (error) {
    console.log("Error creating update:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/updates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const update = { ...body, id };
    await kv.set(`update:${id}`, update);
    return c.json({ success: true, data: update });
  } catch (error) {
    console.log("Error updating update:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-a8901673/updates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`update:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting update:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// SCHEDULE EVENTS ROUTES
// ============================================

app.get("/make-server-a8901673/events", async (c) => {
  try {
    const events = await kv.getByPrefix("event:");
    return c.json({ success: true, data: events });
  } catch (error) {
    console.log("Error fetching events:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-a8901673/events", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId();
    const event = { ...body, id };
    await kv.set(`event:${id}`, event);
    return c.json({ success: true, data: event });
  } catch (error) {
    console.log("Error creating event:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// INITIALIZE DATABASE WITH SAMPLE DATA
// ============================================

app.post("/make-server-a8901673/init-sample-data", async (c) => {
  try {
    // Check if data already exists
    const existingCrops = await kv.getByPrefix("crop:");
    if (existingCrops.length > 0) {
      return c.json({ success: true, message: "Sample data already exists" });
    }

    // Initialize with sample data (using the mock data from App.tsx)
    // This will be called once to populate the database
    
    return c.json({ success: true, message: "Sample data initialized" });
  } catch (error) {
    console.log("Error initializing sample data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// SETTINGS ROUTES
// ============================================

app.get("/make-server-a8901673/settings/total-budget", async (c) => {
  try {
    const budget = await kv.get("settings:total_budget");
    // Return default if not set
    return c.json({ success: true, data: budget || 30000 });
  } catch (error) {
    console.log("Error fetching total budget:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-a8901673/settings/total-budget", async (c) => {
  try {
    const body = await c.req.json();
    const { amount } = body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return c.json({ success: false, error: "Invalid budget amount" }, 400);
    }
    
    await kv.set("settings:total_budget", amount);
    return c.json({ success: true, data: amount });
  } catch (error) {
    console.log("Error updating total budget:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

// Health check
app.get("/make-server-a8901673/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================

Deno.serve(app.fetch);
