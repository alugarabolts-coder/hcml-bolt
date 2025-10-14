// API utility functions for making authenticated requests

import { AuthService } from './auth';

const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Create authenticated fetch wrapper
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = AuthService.getJwtToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle unauthorized responses
    if (response.status === 401) {
      AuthService.logout();
      window.location.reload();
      throw new Error('Unauthorized - please login again');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Convenience methods
export const apiGet = <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

export const apiPost = <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiDelete = <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};