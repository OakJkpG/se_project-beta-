import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useTagManagement = (showNotification, setNewBook) => {
  const [availableTags, setAvailableTags] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tags/', {
        headers: { Authorization: `Token ${token}` },
      });
      setAvailableTags(response.data);
    } catch (err) {
      console.error("Error fetching tags:", err.response?.data);
      showNotification('error', 'Failed to load tags.');
      // ตรวจสอบ Error Code
      if (err.response && err.response.status === 401) {
        // หาก Token หมดอายุ หรือไม่ถูกต้อง ให้ Logout
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  }, [showNotification, token, navigate]);

  const handleTagSelection = useCallback((tagName) => {
    setNewBook(prev => ({
      ...prev,
      selectedTags: [tagName],
      custom_tag: ''
    }));
  }, [setNewBook]);

  const handleCustomTagChange = useCallback((e) => {
    setNewBook(prev => ({
      ...prev,
      custom_tag: e.target.value,
      selectedTags: []
    }));
  }, [setNewBook]);

  const handleRemoveTag = useCallback(() => {
    setNewBook(prev => ({
      ...prev,
      selectedTags: [],
      custom_tag: ''
    }));
  }, [setNewBook]);

  return { availableTags, fetchAvailableTags, handleTagSelection, handleCustomTagChange, handleRemoveTag };
};