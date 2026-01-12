import { useState } from 'react';
import { AxiosResponse } from 'axios';

export interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApiCall = <T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<AxiosResponse<T>>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: Args): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      const responseData = result.data as T;
      setData(responseData);
      return responseData;
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred';
      
      // Type guard for axios error
      const isAxiosError = (error: unknown): error is { response?: { status: number; data?: { error?: string } }; request?: unknown; message?: string } => {
        return typeof error === 'object' && error !== null && ('response' in error || 'request' in error || 'message' in error);
      };
      
      if (isAxiosError(err) && err.response) {
        // Handle specific HTTP status codes
        switch (err.response.status) {
          case 401:
            errorMessage = 'Session expired. Please login again.';
            // Clear session and redirect to login handled by axios interceptor
            break;
          case 403:
            errorMessage = err.response.data?.error || 'Permission denied';
            break;
          case 404:
            errorMessage = err.response.data?.error || 'Resource not found';
            break;
          case 409:
            errorMessage = err.response.data?.error || 'Conflict occurred';
            break;
          case 429:
            errorMessage = err.response.data?.error || 'Too many requests. Please slow down.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.error || errorMessage;
        }
      } else if (isAxiosError(err) && err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (isAxiosError(err) && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, loading, error, execute, reset };
};
