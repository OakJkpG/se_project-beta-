import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTag, FaUpload, FaTimes, FaBook } from 'react-icons/fa';
import { uploadImage, uploadPDF } from '../api';
import { getAuthData } from '../utils/authUtils';
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
    cover_image: null,
    pdf_file: null,
    selectedTags: [],
  });

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const { token } = getAuthData();
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/books/${bookId}/`,
          {
            headers: { Authorization: `Token ${token}` }
          }
        );
        
        setBookData({
          ...response.data,
          selectedTags: response.data.tags || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Unable to load book data');
        setLoading(false);
      }
    };

    fetchBookData();
  }, [bookId, navigate]);

  const fetchAvailableTags = async () => {
    try {
      const { token } = getAuthData();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/tags/', {
        headers: { Authorization: `Token ${token}` }
      });
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      alert('Unable to load tags');
    }
  };

  const handleTagSelection = (tagName) => {
    setBookData(prev => {
      const currentTags = prev.selectedTags || [];
      
      if (currentTags.includes(tagName)) {
        return {
          ...prev,
          selectedTags: currentTags.filter(t => t !== tagName)
        };
      }
      
      if (currentTags.length >= 3) {
        alert('Maximum 3 tags allowed');
        return prev;
      }

      return {
        ...prev,
        selectedTags: [...currentTags, tagName]
      };
    });
  };

  // eslint-disable-next-line no-unused-vars
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
      const { token } = getAuthData();
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      
      formData.append('title', bookData.title.trim());
      formData.append('description', bookData.description.trim());
      formData.append('lending_period', parseInt(bookData.lending_period));
      formData.append('max_borrowers', parseInt(bookData.max_borrowers));
      
      formData.append('tags', JSON.stringify(bookData.selectedTags));
      
      if (bookData.new_cover_image instanceof File) {
        const coverImageUrl = await uploadImage(bookData.new_cover_image);
        formData.append('cover_image', coverImageUrl);
      } else if (bookData.cover_image) {
        formData.append('cover_image', bookData.cover_image);
      }
      
      if (bookData.new_pdf_file instanceof File) {
        const pdfFileUrl = await uploadPDF(bookData.new_pdf_file);
        formData.append('pdf_file', pdfFileUrl);
      } else if (bookData.pdf_file) {
        formData.append('keep_existing_pdf', 'true');
      }
      
      const response = await axios.put(
        `http://127.0.0.1:8000/api/books/update/${bookId}/`,
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
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

  const TagSelectionModal = () => (
    <div className="modal tag-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaTag /> Select Tags</h3>
          <button 
            className="close-button"
            onClick={() => setShowTagModal(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="tag-selection-info">
          <p>Select up to 3 tags (Selected: {bookData.selectedTags.length}/3)</p>
        </div>

        <div className="tags-grid">
          {availableTags.map((tag) => (
            <label key={tag.id} className="tag-checkbox">
              <input
                type="checkbox"
                checked={bookData.selectedTags.includes(tag.name)}
                onChange={() => handleTagSelection(tag.name)}
                disabled={
                  !bookData.selectedTags.includes(tag.name) && 
                  bookData.selectedTags.length >= 3
                }
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-book-page">
      <h2>Edit Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Title:</label>
          <input
            type="text"
            value={bookData.title}
            onChange={(e) => setBookData({...bookData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={bookData.description}
            onChange={(e) => setBookData({...bookData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Lending Period (days):</label>
          <input
            type="number"
            value={bookData.lending_period}
            onChange={(e) => setBookData({...bookData, lending_period: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Maximum Borrowers:</label>
          <input
            type="number"
            value={bookData.max_borrowers}
            onChange={(e) => setBookData({...bookData, max_borrowers: e.target.value})}
            required
          />
        </div>

        <div className="form-group tag-section">
          <label>Tags:</label>
          <button 
            type="button" 
            className="show-tags-button"
            onClick={() => {
              fetchAvailableTags();
              setShowTagModal(true);
            }}
          >
            <FaTag /> Manage Tags
          </button>

          <div className="selected-tags">
            {bookData.selectedTags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleTagSelection(tag)}
                  className="remove-tag"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Cover Image:</label>
          <div className="file-upload">
            <FaUpload />
            <p>Click to select image file</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBookData({...bookData, new_cover_image: e.target.files[0]})}
            />
          </div>
          {bookData.cover_image && (
            <img
              src={bookData.cover_image}
              alt="Current book cover"
              className="current-cover"
            />
          )}
        </div>

        <div className="form-group">
          <label>PDF File:</label>
          <div className="file-upload">
            <FaUpload />
            <p>Click to select PDF file</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setBookData({...bookData, new_pdf_file: e.target.files[0]})}
            />
          </div>
          {bookData.pdf_file && (
            <div className="current-pdf">
              <FaBook /> Current PDF File
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>

      {showTagModal && <TagSelectionModal />}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            🎉 Book updated successfully!
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBook;