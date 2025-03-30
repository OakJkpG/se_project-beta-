import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  return { notification, showNotification };
};