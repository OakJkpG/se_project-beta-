import { useState, useCallback } from 'react';
import axios from 'axios';

export const useBookActions = (fetchAccountData, showNotification) => {
  const [returnLoading, setReturnLoading] = useState(false);
  const [returningBookId, setReturningBookId] = useState(null);
  const token = localStorage.getItem('token');

  const handleReturn = useCallback(async (borrowId, bookTitle) => {
    if (returnLoading) return;
    setReturnLoading(true);
    setReturningBookId(borrowId);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/books/return/${borrowId}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      console.log('Return response:', response.data); // เพิ่ม log เพื่อตรวจสอบ response

      // รอให้ข้อมูลถูกอัพเดทในฐานข้อมูลก่อน
      await new Promise(resolve => setTimeout(resolve, 1000));

      // เรียก fetchAccountData เพื่ออัพเดทข้อมูล
      await fetchAccountData();
      
      showNotification('success', `You have successfully returned "${bookTitle}"`);
    } catch (error) {
      console.error('Return error:', error); // เพิ่ม log เพื่อตรวจสอบ error
      showNotification('error', 'Unable to return the book. Please try again later.');
    } finally {
      setReturnLoading(false);
      setReturningBookId(null);
    }
  }, [fetchAccountData, showNotification, token, returnLoading]);

  return { handleReturn, returnLoading, returningBookId };
};