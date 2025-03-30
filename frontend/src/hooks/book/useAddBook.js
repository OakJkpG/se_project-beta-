import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../../api';

export const useAddBook = (fetchAccountData, showNotification, closeModal) => {
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    lending_period: 14,
    max_borrowers: 1,
    cover_image: '',
    pdf_file: null,
    selectedTags: [],
    custom_tag: '',
  });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleAddBookSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = null;

      if (newBook.cover_image instanceof File) {
        coverImageUrl = await uploadImage(newBook.cover_image);
      }

      const formData = new FormData();

      formData.append('title', newBook.title);
      formData.append('description', newBook.description);
      formData.append('lending_period', newBook.lending_period);
      formData.append('max_borrowers', newBook.max_borrowers);

      if (newBook.selectedTags.length > 0) {
        formData.append('selectedTags', newBook.selectedTags[0]);
      } else if (newBook.custom_tag) {
        formData.append('custom_tag', newBook.custom_tag);
      }

      if (coverImageUrl) {
        formData.append('cover_image', coverImageUrl);
      }

      if (newBook.pdf_file instanceof File) {
        formData.append('pdf_file', newBook.pdf_file);
      }

      const response = await axios.post('http://127.0.0.1:8000/api/books/add/', formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // ตรวจสอบ Response
      console.log('Add Book Response:', response);

      fetchAccountData(prev => ({
        ...prev,
        published_books: [...prev.published_books, response.data]
      }));

      showNotification('success', `"${newBook.title}" has been added successfully`);

      setNewBook({
        title: '',
        description: '',
        lending_period: 14,
        max_borrowers: 1,
        cover_image: '',
        pdf_file: null,
        selectedTags: [],
        custom_tag: '',
      });

      // ปิด Modal หลังจากเพิ่มหนังสือสำเร็จ
      closeModal();

    } catch (err) {
      console.error("Error adding book:", err); // แสดง Error ทั้ง Object
      showNotification('error', 'Failed to add book. Please check your inputs and try again.');
      // ตรวจสอบ Error Code และ Logout หาก 401
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  }, [fetchAccountData, showNotification, token, newBook, navigate, closeModal]);

  return { newBook, setNewBook, handleAddBookSubmit };
};