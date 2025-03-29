
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { uploadImage, uploadPDF } from '../api';
import './EditBook.css';

const EditBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [bookData, setBookData] = useState({
    title: '',
    description: '',
    lending_period: 14,
    max_borrowers: 1,
    cover_image: '',
    pdf_file: null,
    selectedTags: [],
  });

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/books/${bookId}/`,
          {
            headers: { Authorization: `Token ${localStorage.getItem('token')}` }
          }
        );
        
        setBookData({
          ...response.data,
          selectedTags: response.data.tags || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load book data');
        setLoading(false);
      }
    };

    fetchBookData();
  }, [bookId]);

  const fetchAvailableTags = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tags/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      alert('ไม่สามารถโหลดแท็กได้');
    }
  };

  const handleTagSelection = (tagName) => {
    setBookData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter(tag => tag !== tagName)
        : [...prev.selectedTags, tagName]
    }));
  };

  const handleRemoveTag = (tagName) => {
    setBookData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => tag !== tagName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let coverImageUrl = bookData.cover_image;
      let pdfFileUrl = bookData.pdf_file;

      if (bookData.new_cover_image instanceof File) {
        coverImageUrl = await uploadImage(bookData.new_cover_image);
      }

      if (bookData.new_pdf_file instanceof File) {
        pdfFileUrl = await uploadPDF(bookData.new_pdf_file);
      }

      const updateData = {
        title: bookData.title.trim(),
        description: bookData.description.trim(),
        lending_period: parseInt(bookData.lending_period),
        max_borrowers: parseInt(bookData.max_borrowers),
        tags: bookData.selectedTags,
        ...(coverImageUrl && { cover_image: coverImageUrl }),
        ...(pdfFileUrl && { pdf_file: pdfFileUrl })
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/books/update/${bookId}/`,
        updateData,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate(`/books/${bookId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating book:', err);
      const errorMessage = err.response?.data?.detail || 
                          Object.values(err.response?.data || {}).join('\n') ||
                          'ไม่สามารถอัพเดตหนังสือได้';
      alert(`ข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-book-page">
      <h2>แก้ไขหนังสือ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ชื่อหนังสือ:</label>
          <input
            type="text"
            value={bookData.title}
            onChange={(e) => setBookData({...bookData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>คำอธิบาย:</label>
          <textarea
            value={bookData.description}
            onChange={(e) => setBookData({...bookData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>ระยะเวลาการยืม (วัน):</label>
          <input
            type="number"
            value={bookData.lending_period}
            onChange={(e) => setBookData({...bookData, lending_period: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>จำนวนผู้ยืมสูงสุด:</label>
          <input
            type="number"
            value={bookData.max_borrowers}
            onChange={(e) => setBookData({...bookData, max_borrowers: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>รูปปก:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBookData({...bookData, new_cover_image: e.target.files[0]})}
          />
          {bookData.cover_image && (
            <img
              src={bookData.cover_image}
              alt="ปกหนังสือปัจจุบัน"
              className="current-cover"
            />
          )}
        </div>

        <div className="form-group">
          <label>ไฟล์ PDF:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setBookData({...bookData, new_pdf_file: e.target.files[0]})}
          />
          {bookData.pdf_file && (
            <p className="current-pdf">PDF ปัจจุบัน: มีอยู่แล้ว</p>
          )}
        </div>

        <div className="form-group tag-section">
          <label>แท็ก:</label>
          <button 
            type="button" 
            className="show-tags-button"
            onClick={() => {
              fetchAvailableTags();
              setShowTagModal(true);
            }}
          >
            เลือกแท็ก
          </button>

          <div className="selected-tags">
            {bookData.selectedTags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {showTagModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>เลือกแท็ก</h3>
              <div className="tags-grid">
                {availableTags.map((tag) => (
                  <label key={tag.id} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={bookData.selectedTags.includes(tag.name)}
                      onChange={() => handleTagSelection(tag.name)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowTagModal(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="save-button">บันทึกการแก้ไข</button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            ยกเลิก
          </button>
        </div>
      </form>

      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            🎉 อัปเดตหนังสือสำเร็จ!
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBook;