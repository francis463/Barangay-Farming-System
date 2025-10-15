import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./supabase/info";

// Create Supabase client for auth
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  joinedDate: string;
  avatar: string | null;
  bio?: string;
  location?: string;
  tasksCompleted?: number;
  hoursContributed?: number;
  eventsAttended?: number;
  recentActivities?: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up a new user
export async function signUp(data: SignUpData) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Sign up failed");
    }

    return result;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

// Admin-only: Register a new user with specific role
export async function adminRegisterUser(accessToken: string, data: SignUpData) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/auth/admin-register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "User registration failed");
    }

    return result;
  } catch (error) {
    console.error("Admin register error:", error);
    throw error;
  }
}

// Sign in an existing user
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.session) {
      throw new Error("No session returned");
    }

    return {
      accessToken: authData.session.access_token,
      user: authData.user,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

// Sign out the current user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

// Get current session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

// Get user profile from server
export async function getUserProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Failed to get profile");
    }

    return result.data;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(accessToken: string, profileData: Partial<UserProfile>) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a8901673/auth/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Failed to update profile");
    }

    return result.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}
