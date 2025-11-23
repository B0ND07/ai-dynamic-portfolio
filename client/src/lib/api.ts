// Django API Configuration and Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Token management
export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API Client with automatic token refresh
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
      return null;
    } catch {
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && token) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      console.error('API Error:', error);
      // Handle different error formats from Django REST Framework
      if (error.detail) {
        throw new Error(error.detail);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        // If it's a validation error object, format it
        const errorMessages = Object.entries(error)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        throw new Error(errorMessages || 'Request failed');
      }
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// API Services
export const authService = {
  login: async (username: string, password: string) => {
    const data = await api.post<{ access: string; refresh: string }>('/api/auth/login/', {
      username,
      password,
    });
    setTokens(data.access, data.refresh);
    return data;
  },

  register: async (username: string, email: string, password: string, password2: string) => {
    const data = await api.post<{ access: string; refresh: string; message: string }>('/api/auth/register/', {
      username,
      email,
      password,
      password2,
    });
    setTokens(data.access, data.refresh);
    return data;
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout/', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    clearTokens();
  },

  getProfile: () => api.get<any>('/api/auth/profile/'),

  updateProfile: (data: any) => api.put('/api/auth/profile/', data),
};

export const projectService = {
  list: () => api.get<any[]>('/api/projects/'),
  get: (id: string) => api.get<any>(`/api/projects/${id}/`),
  create: (data: any) => api.post('/api/projects/', data),
  update: (id: string, data: any) => api.put(`/api/projects/${id}/`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}/`),
};

export const skillService = {
  list: () => api.get<any[]>('/api/skills/'),
  create: (data: any) => api.post('/api/skills/', data),
  update: (id: string, data: any) => api.put(`/api/skills/${id}/`, data),
  delete: (id: string) => api.delete(`/api/skills/${id}/`),
};

export const contactService = {
  submit: (data: any) => api.post('/api/contact/', data),
  list: () => api.get<any[]>('/api/contact/'),
};
