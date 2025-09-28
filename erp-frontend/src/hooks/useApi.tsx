// erp-frontend/src/hooks/useApi.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

// Hook ke return value ke liye ek type define kar rahe hain
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Custom hook ko ek generic type <T> ke saath define kiya gaya hai
// T ka matlab hai 'Type', yeh data ke structure ko represent karega
export function useApi<T = any>(endpoint: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // API se aane waale error message ya ek default message ka istemaal
        throw new Error(errorData.message || 'Something went wrong with the request');
      }

      const result = await response.json();
      setData(result as T);
    } catch (err) {
      // Error handling ko type-safe banaya gaya hai
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}