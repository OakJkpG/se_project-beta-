import { useCallback } from 'react';

export const useFileUpload = (showNotification, setNewBook) => {
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please upload an image file (PNG, JPEG)');
        return;
      }
      setNewBook(prev => ({
        ...prev,
        cover_image: file
      }));
    }
  }, [showNotification, setNewBook]);

  const handlePDFUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showNotification('error', 'Please upload a PDF file');
        return;
      }
      setNewBook(prev => ({
        ...prev,
        pdf_file: file
      }));
    }
  }, [showNotification, setNewBook]);

  return { handleImageUpload, handlePDFUpload };
};