/**
 * ============================================
 * API CLIENT - BACKEND COMMUNICATION
 * ============================================
 * 
 * This file contains all the functions to communicate with the backend server.
 * It handles HTTP requests (GET, POST, PUT, DELETE) to the Supabase Edge Functions.
 * 
 * All API calls go through the apiCall() function which:
 * - Adds authentication headers
 * - Handles errors
 * - Returns typed data
 */

import { projectId, publicAnonKey } from './supabase/info';

// Base URL for all API requests
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a8901673`;

/**
 * Standard API response format from the backend
 */
interface ApiResponse<T> {
  success: boolean;  // Whether the request succeeded
  data?: T;          // Response data (if successful)
  error?: string;    // Error message (if failed)
}

/**
 * Main function to make API calls to the backend
 * 
 * @param endpoint - API route (e.g., '/crops', '/harvests')
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param body - Data to send (for POST/PUT requests)
 * @returns Promise with the response data
 */
async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<T> {
  try {
    // Configure the HTTP request
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`, // Auth token for backend
      },
    };

    // Add request body for POST/PUT requests
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data: ApiResponse<T> = await response.json();

    // Check if request was successful
    if (!data.success) {
      throw new Error(data.error || 'API call failed');
    }

    return data.data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error; // Re-throw so calling code can handle it
  }
}

// ============================================
// CROPS API
// Manage all crop-related operations
// ============================================
export const cropsApi = {
  getAll: () => apiCall<any[]>('/crops'),                              // Get all crops
  create: (crop: any) => apiCall<any>('/crops', 'POST', crop),         // Add new crop
  update: (id: string, crop: any) => apiCall<any>(`/crops/${id}`, 'PUT', crop),  // Update crop
  delete: (id: string) => apiCall<void>(`/crops/${id}`, 'DELETE'),    // Delete crop
};

// ============================================
// HARVESTS API
// Track harvest records
// ============================================
export const harvestsApi = {
  getAll: () => apiCall<any[]>('/harvests'),                           // Get all harvests
  create: (harvest: any) => apiCall<any>('/harvests', 'POST', harvest),  // Record new harvest
  update: (id: string, harvest: any) => apiCall<any>(`/harvests/${id}`, 'PUT', harvest),  // Update harvest
  delete: (id: string) => apiCall<void>(`/harvests/${id}`, 'DELETE'), // Delete harvest
};

// ============================================
// BUDGET API
// Manage budget and expenses
// ============================================
export const budgetApi = {
  getAll: () => apiCall<any[]>('/budget'),                             // Get all budget items
  create: (item: any) => apiCall<any>('/budget', 'POST', item),       // Add expense
  update: (id: string, item: any) => apiCall<any>(`/budget/${id}`, 'PUT', item),  // Update expense
  delete: (id: string) => apiCall<void>(`/budget/${id}`, 'DELETE'),   // Delete expense
};

// ============================================
// VOLUNTEERS API
// Manage volunteer information
// ============================================
export const volunteersApi = {
  getAll: () => apiCall<any[]>('/volunteers'),                         // Get all volunteers
  create: (volunteer: any) => apiCall<any>('/volunteers', 'POST', volunteer),  // Add volunteer
  update: (id: string, volunteer: any) => apiCall<any>(`/volunteers/${id}`, 'PUT', volunteer),  // Update volunteer
  delete: (id: string) => apiCall<void>(`/volunteers/${id}`, 'DELETE'),  // Delete volunteer
};

// ============================================
// TASKS API
// Manage community tasks
// ============================================
export const tasksApi = {
  getAll: () => apiCall<any[]>('/tasks'),                              // Get all tasks
  create: (task: any) => apiCall<any>('/tasks', 'POST', task),        // Create task
  update: (id: string, task: any) => apiCall<any>(`/tasks/${id}`, 'PUT', task),  // Update task
  delete: (id: string) => apiCall<void>(`/tasks/${id}`, 'DELETE'),    // Delete task
};

// ============================================
// POLLS API
// Community polls and voting
// ============================================
export const pollsApi = {
  getAll: () => apiCall<any[]>('/polls'),                              // Get all polls
  create: (poll: any) => apiCall<any>('/polls', 'POST', poll),        // Create poll (admin only)
  update: (id: string, poll: any) => apiCall<any>(`/polls/${id}`, 'PUT', poll),  // Update poll
  delete: (id: string) => apiCall<void>(`/polls/${id}`, 'DELETE'),    // Delete poll
  vote: (pollId: string, optionId: string) =>                          // Vote on a poll
    apiCall<any>(`/polls/${pollId}/vote`, 'POST', { optionId }),
};

// ============================================
// FEEDBACKS API
// Community feedback and suggestions
// ============================================
export const feedbacksApi = {
  getAll: () => apiCall<any[]>('/feedbacks'),                          // Get all feedback
  create: (feedback: any) => apiCall<any>('/feedbacks', 'POST', feedback),  // Submit feedback
  update: (id: string, feedback: any) => apiCall<any>(`/feedbacks/${id}`, 'PUT', feedback),  // Update feedback status
  delete: (id: string) => apiCall<void>(`/feedbacks/${id}`, 'DELETE'),  // Delete feedback
};

// ============================================
// PHOTOS API
// Photo gallery management
// ============================================
export const photosApi = {
  getAll: () => apiCall<any[]>('/photos'),                             // Get all photos
  create: (photo: any) => apiCall<any>('/photos', 'POST', photo),     // Upload photo
  update: (id: string, photo: any) => apiCall<any>(`/photos/${id}`, 'PUT', photo),  // Update photo info
  delete: (id: string) => apiCall<void>(`/photos/${id}`, 'DELETE'),   // Delete photo
};

// ============================================
// UPDATES API
// Community news and updates
// ============================================
export const updatesApi = {
  getAll: () => apiCall<any[]>('/updates'),                            // Get all updates
  create: (update: any) => apiCall<any>('/updates', 'POST', update),  // Post update
  update: (id: string, update: any) => apiCall<any>(`/updates/${id}`, 'PUT', update),  // Edit update
  delete: (id: string) => apiCall<void>(`/updates/${id}`, 'DELETE'),  // Delete update
};

// ============================================
// EVENTS API
// Community events calendar
// ============================================
export const eventsApi = {
  getAll: () => apiCall<any[]>('/events'),                             // Get all events
  create: (event: any) => apiCall<any>('/events', 'POST', event),     // Create event
};

// ============================================
// SETTINGS API
// System-wide settings
// ============================================
export const settingsApi = {
  getTotalBudget: () => apiCall<number>('/settings/total-budget'),     // Get total budget
  setTotalBudget: (amount: number) => apiCall<void>('/settings/total-budget', 'PUT', { amount }),  // Set budget
  getLocation: () => apiCall<any>('/public/location'),                 // Get saved location
};

// Initialize database with sample data (first-time setup)
export const initSampleData = () => apiCall<void>('/init-sample-data', 'POST');

// ============================================
// PROFILE PICTURE API
// Upload and manage user profile pictures
// ============================================
export const profilePictureApi = {
  upload: (imageData: string, fileType: string, accessToken: string) => 
    apiCallWithToken<{ avatar: string }>('/profile/avatar', 'POST', { imageData, fileType }, accessToken),
  delete: (accessToken: string) => 
    apiCallWithToken<void>('/profile/avatar', 'DELETE', undefined, accessToken),
};

/**
 * API call function with custom access token
 * Used for authenticated requests that need the user's token (not just the public key)
 * 
 * @param endpoint - API route
 * @param method - HTTP method
 * @param body - Request data
 * @param accessToken - User's authentication token
 * @returns Promise with response data
 */
async function apiCallWithToken<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  accessToken?: string
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Use user's token if provided, otherwise use public key
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API call failed');
    }

    return data.data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}
