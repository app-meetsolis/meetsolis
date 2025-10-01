/**
 * API Client with JWT Token Attachment
 * Axios-based client that automatically includes Clerk JWT tokens
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { useAuth } from '@clerk/nextjs';

/**
 * Error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * API Client class with automatic JWT token injection
 */
export class ApiClient {
  private client: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null;

  constructor(
    baseURL: string = '/api',
    getToken?: () => Promise<string | null>
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.getToken = getToken ?? null;

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      async config => {
        if (this.getToken) {
          const token = await this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status,
          code: (error.response?.data as any)?.code,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

/**
 * Hook to create API client with automatic JWT token injection
 * Use this in React components to make authenticated API calls
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();

  return new ApiClient(process.env.NEXT_PUBLIC_API_URL || '/api', getToken);
}
