import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthData, clearAuthData } from '../../utils/authUtils';

export const useAccount = (role) => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAccountData = useCallback(async () => {
    const { token, role: userRole } = getAuthData();

    if (!token || userRole !== role) {
      clearAuthData();
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/account/${role}/`,
        {
          headers: { Authorization: `Token ${token}` }
        }
      );
      setAccountData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching account data:', err);
      if (err.response?.status === 401) {
        clearAuthData();
        navigate('/login');
      } else {
        setError('Failed to load account data');
      }
    } finally {
      setLoading(false);
    }
  }, [role, navigate]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  return { accountData, loading, error, fetchAccountData };
};