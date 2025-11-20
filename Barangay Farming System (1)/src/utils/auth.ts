/**
 * ============================================
 * AUTHENTICATION UTILITIES
 * ============================================
 * 
 * This file handles all user authentication operations:
 * - Sign up (register new users)
 * - Sign in (login)
 * - Sign out (logout)
 * - Session management
 * - User profile management
 * 
 * Uses Supabase Auth for secure authentication
 */

import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./supabase/info";

// Create Supabase client instance for authentication
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/**
 * User Profile Interface
 * Defines the structure of user data stored in the database
 */
export interface UserProfile {
  id: string;                // Unique user ID from Supabase Auth
  email: string;             // User's email address
  name: string;              // Full name
  role: string;              // User role (admin, member, volunteer)
  joinedDate: string;        // Date user registered
  avatar: string | null;     // Profile picture URL (if uploaded)
  bio?: string;              // User biography/description
  location?: string;         // User's location
  tasksCompleted?: number;   // Number of tasks completed
  hoursContributed?: number; // Hours volunteered
  eventsAttended?: number;   // Number of events attended
  recentActivities?: Array<{
    type: string;            // Activity type (crop, task, harvest, etc.)
    description: string;     // Activity description
    timestamp: string;       // When it happened
  }>;
}

/**
 * Sign Up Data Interface
 * Data required for new user registration
 */
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: string;             // Optional - defaults to "member"
}

/**
 * Sign In Data Interface
 * Data required for login
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 * Registers a new user account through the backend API
 * 
 * @param data - User registration information (email, password, name)
 * @returns Promise with registration result
 */
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

/**
 * Admin-only: Register a new user with specific role
 * Allows admin to create users and assign roles (admin, member, volunteer)
 * 
 * @param accessToken - Admin's authentication token
 * @param data - User data including role
 * @returns Promise with registration result
 */
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

/**
 * Sign in an existing user
 * Authenticates user and returns access token for API requests
 * 
 * @param data - Login credentials (email, password)
 * @returns Promise with access token and user data
 */
export async function signIn(data: SignInData) {
  try {
    // Call Supabase Auth to sign in
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

    // Return access token for making authenticated requests
    return {
      accessToken: authData.session.access_token,
      user: authData.user,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * Logs out user and clears session from localStorage
 */
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

/**
 * Get current session
 * Checks if user has an active session (for auto-login)
 * 
 * @returns Promise with session data or null
 */
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

/**
 * Get user profile from server
 * Fetches complete user profile data including stats and avatar
 * 
 * @param accessToken - User's authentication token
 * @returns Promise with UserProfile or null
 */
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

/**
 * Update user profile
 * Updates user's personal information (name, bio, location, etc.)
 * 
 * @param accessToken - User's authentication token
 * @param profileData - Partial profile data to update
 * @returns Promise with updated profile data
 */
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
