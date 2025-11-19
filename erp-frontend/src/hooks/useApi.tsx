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

      // Build base URL: use NEXT_PUBLIC_API_URL when provided, otherwise use relative path.
      // Use the URL constructor to avoid malformed concatenation if base contains a path.
      const base = process.env.NEXT_PUBLIC_API_URL ?? '';
      let url: string;
      try {
        // eslint-disable-next-line no-undef
        let baseForUrl: string;
        if (base) {
          baseForUrl = base;
        } else {
          // Default to backend dev server on port 3001 when running locally
          // If in production, fallback to same origin
          const isProd = process.env.NODE_ENV === 'production';
          const origin = window.location.origin;
          if (!isProd) {
            // prefer backend on port 3001 during local dev
            const host = window.location.hostname;
            baseForUrl = `${window.location.protocol}//${host}:3001`;
          } else {
            baseForUrl = origin;
          }
        }
        url = new URL(endpoint, baseForUrl).toString();
      } catch (e) {
        // Fallback: simple concatenation
        url = `${base}${endpoint}`;
      }
      console.log('Constructed API URL:', url);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, { headers });
      console.log('API Response Status:', response.status);

      if (!response.ok) {
        // Try to parse JSON error if available
        let errorMsg = 'Something went wrong with the request';
        try {
          const errorData = await response.json();
          console.error('API Error Data:', errorData);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          // ignore JSON parse error
        }
        throw new Error(errorMsg);
      }
      // Parse JSON safely
      let result: any = null;
      try {
        const text = await response.text();
        console.log('API Response Text:', text);
        result = JSON.parse(text);
      } catch (e) {
        console.error('JSON Parsing Error:', e);
        result = null;
      }
      setData(result as T);
    } catch (err) {
      // Error handling ko type-safe banaya gaya hai
      if (err instanceof Error) {
        setError(err.message);
        console.error('API Hook Error:', err.message);
      } else {
        setError('An unknown error occurred.');
        console.error('API Hook Unknown Error:', err);
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