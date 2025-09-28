// NAYA CODE (erp-frontend/src/hooks/useApi.js)

'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie'; // Token nikalne ke liye

// Yeh hamara custom hook hai
export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Cookie se token nikalo
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // API call karo
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Yeh hook 3 cheezein return karega: data, loading state, aur error state
  // Saath hi, data ko dobara fetch karne ke liye ek function bhi dega
  return { data, loading, error, refetch: fetchData };
}