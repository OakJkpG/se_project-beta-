import { useState, useCallback } from 'react';
import axios from 'axios';

export const useBookActions = (fetchAccountData, showNotification) => {
  const [returnLoading, setReturnLoading] = useState(false);
  const [returningBookId, setReturningBookId] = useState(null);
  const token = localStorage.getItem('token');

  const handleReturn = useCallback(async (borrowId, bookTitle, isAutoReturn = false) => {
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
      
      // Different message for auto-returns vs manual returns
      if (isAutoReturn) {
        showNotification('info', `Overdue book "${bookTitle}" has been automatically returned`);
      } else {
        showNotification('success', `You have successfully returned "${bookTitle}"`);
      }
    } catch (error) {
      console.error('Return error:', error); // เพิ่ม log เพื่อตรวจสอบ error
      showNotification('error', 'Unable to return the book. Please try again later.');
    } finally {
      setReturnLoading(false);
      setReturningBookId(null);
    }
  }, [fetchAccountData, showNotification, token, returnLoading]);

  const handleBorrow = useCallback(async (bookId, bookTitle) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/books/borrow/`,
        { book_id: bookId },
        { headers: { Authorization: `Token ${token}` } }
      );

      showNotification('success', `You have successfully borrowed "${bookTitle}"`);
      return true;
    } catch (error) {
      if (error.response?.data?.status === 'ALREADY_BORROWED') {
        showNotification('error', 'You have already borrowed this book and haven\'t returned it yet.');
      } else {
        showNotification('error', error.response?.data?.error || 'Unable to borrow the book. Please try again later.');
      }
      return false;
    }
  }, [token, showNotification]);

  return {
    handleBorrow,
    handleReturn,
    returnLoading,
    returningBookId
  };
};