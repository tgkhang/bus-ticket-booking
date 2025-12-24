import { useState, useEffect } from 'react';
import { fetchBookingAnalytics } from '@/lib/api/bookingAnalytics';

export function useBookingAnalyticsData(from: string, to: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBookingAnalytics(from, to);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return { data, loading, error };
}