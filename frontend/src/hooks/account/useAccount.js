import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAccount = (role) => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const fetchAccountData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/account/${role}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setAccountData(response.data);
    } catch (err) {
      setError('Failed to load account data.');
      console.error(err);
      // ตรวจสอบ Error Code
      if (err.response && err.response.status === 401) {
        // หาก Token หมดอายุ หรือไม่ถูกต้อง ให้ Logout
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [role, token, navigate]);

  useEffect(() => {
    if (!token || userRole !== role) {
      navigate('/login', { state: { from: '/account' } });
      return;
    }
    fetchAccountData();
  }, [role, token, navigate, fetchAccountData, userRole]);

  return { accountData, loading, error, fetchAccountData };
};