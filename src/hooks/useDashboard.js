// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import api from '../services/api'; // Assuming you have axios instance configured

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error, refetch: () => fetchStats() };
};

export const useDashboardTrends = (months = 6) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trends?months=${months}`);
        if (response.data.success) {
          setTrends(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [months]);

  return { trends, loading, error };
};

export const useInventoryByLocation = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/inventory-by-location');
        if (response.data.success) {
          setInventory(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching inventory by location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return { inventory, loading, error };
};

export const useActivityFeed = (limit = 10) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/activity-feed?limit=${limit}`);
        if (response.data.success) {
          setActivities(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching activity feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  return { activities, loading, error };
};