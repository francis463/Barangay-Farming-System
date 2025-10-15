import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a8901673`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
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

// Crops API
export const cropsApi = {
  getAll: () => apiCall<any[]>('/crops'),
  create: (crop: any) => apiCall<any>('/crops', 'POST', crop),
  update: (id: string, crop: any) => apiCall<any>(`/crops/${id}`, 'PUT', crop),
  delete: (id: string) => apiCall<void>(`/crops/${id}`, 'DELETE'),
};

// Harvests API
export const harvestsApi = {
  getAll: () => apiCall<any[]>('/harvests'),
  create: (harvest: any) => apiCall<any>('/harvests', 'POST', harvest),
  update: (id: string, harvest: any) => apiCall<any>(`/harvests/${id}`, 'PUT', harvest),
  delete: (id: string) => apiCall<void>(`/harvests/${id}`, 'DELETE'),
};

// Budget API
export const budgetApi = {
  getAll: () => apiCall<any[]>('/budget'),
  create: (item: any) => apiCall<any>('/budget', 'POST', item),
  update: (id: string, item: any) => apiCall<any>(`/budget/${id}`, 'PUT', item),
  delete: (id: string) => apiCall<void>(`/budget/${id}`, 'DELETE'),
};

// Volunteers API
export const volunteersApi = {
  getAll: () => apiCall<any[]>('/volunteers'),
  create: (volunteer: any) => apiCall<any>('/volunteers', 'POST', volunteer),
  update: (id: string, volunteer: any) => apiCall<any>(`/volunteers/${id}`, 'PUT', volunteer),
  delete: (id: string) => apiCall<void>(`/volunteers/${id}`, 'DELETE'),
};

// Tasks API
export const tasksApi = {
  getAll: () => apiCall<any[]>('/tasks'),
  create: (task: any) => apiCall<any>('/tasks', 'POST', task),
  update: (id: string, task: any) => apiCall<any>(`/tasks/${id}`, 'PUT', task),
  delete: (id: string) => apiCall<void>(`/tasks/${id}`, 'DELETE'),
};

// Polls API
export const pollsApi = {
  getAll: () => apiCall<any[]>('/polls'),
  create: (poll: any) => apiCall<any>('/polls', 'POST', poll),
  update: (id: string, poll: any) => apiCall<any>(`/polls/${id}`, 'PUT', poll),
  vote: (pollId: string, optionId: string) => 
    apiCall<any>(`/polls/${pollId}/vote`, 'POST', { optionId }),
};

// Feedbacks API
export const feedbacksApi = {
  getAll: () => apiCall<any[]>('/feedbacks'),
  create: (feedback: any) => apiCall<any>('/feedbacks', 'POST', feedback),
};

// Photos API
export const photosApi = {
  getAll: () => apiCall<any[]>('/photos'),
  create: (photo: any) => apiCall<any>('/photos', 'POST', photo),
  update: (id: string, photo: any) => apiCall<any>(`/photos/${id}`, 'PUT', photo),
  delete: (id: string) => apiCall<void>(`/photos/${id}`, 'DELETE'),
};

// Updates API
export const updatesApi = {
  getAll: () => apiCall<any[]>('/updates'),
  create: (update: any) => apiCall<any>('/updates', 'POST', update),
  update: (id: string, update: any) => apiCall<any>(`/updates/${id}`, 'PUT', update),
  delete: (id: string) => apiCall<void>(`/updates/${id}`, 'DELETE'),
};

// Events API
export const eventsApi = {
  getAll: () => apiCall<any[]>('/events'),
  create: (event: any) => apiCall<any>('/events', 'POST', event),
};

// Settings API
export const settingsApi = {
  getTotalBudget: () => apiCall<number>('/settings/total-budget'),
  setTotalBudget: (amount: number) => apiCall<void>('/settings/total-budget', 'PUT', { amount }),
};

// Initialize sample data
export const initSampleData = () => apiCall<void>('/init-sample-data', 'POST');
