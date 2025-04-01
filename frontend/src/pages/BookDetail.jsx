import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthData } from '../utils/authUtils';
import './BookDetail.css';
import { FaArrowLeft, FaEdit, FaTrash, FaShare, FaCalendarAlt, FaUsers, FaBookOpen, FaUserTie } from 'react-icons/fa';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();
  
  // Get auth data from both storages
  const { token, role, userId } = getAuthData();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookDetails();
  }, [bookId, token, navigate]);

  const fetchBookDetails = () => {
    axios
      .get(`http://127.0.0.1:8000/api/books/${bookId}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        setBook(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching book details:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
        setError('Failed to load book details.');
        setLoading(false);
      });
  };

  const handleBorrowBook = () => {
    if (!token) {
      showNotification('error', 'You must be logged in to borrow a book.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (book.remaining_borrows <= 0) {
      showNotification('error', 'No available copies of this book to borrow.');
      return;
    }

    setBorrowing(true);
    
    axios
      .post(
        `http://127.0.0.1:8000/api/books/borrow/`,
        { book_id: book.id },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then((response) => {
        showNotification('success', 'Book borrowed successfully!');
        setBook({
          ...book,
          remaining_borrows: book.remaining_borrows - 1
        });
        setTimeout(() => {
          navigate(`/account/reader/${response.data.user_id}`);
        }, 1500);
      })
      .catch((err) => {
        console.error('Error borrowing book:', err.response?.data);
        const errorMsg = err.response?.data?.error || 'Failed to borrow book.';
        showNotification('error', errorMsg);
      })
      .finally(() => {
        setBorrowing(false);
      });
  };

  const handleRemoveBook = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (window.confirm('Are you sure you want to remove this book?')) {
      axios
        .delete(`http://127.0.0.1:8000/api/books/remove/${bookId}/`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then(() => {
          showNotification('success', 'Book removed successfully!');
          setTimeout(() => navigate('/main'), 1500);
        })
        .catch((err) => {
          console.error('Error removing book:', err.response?.data);
          showNotification('error', 'Failed to remove book.');
        });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleEditBook = () => {
    navigate(`/edit-book/${bookId}`);
  };
  
  // eslint-disable-next-line no-unused-vars


  if (loading) return (
    <div className="book-detail-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="book-detail-page">
      <div className="error-container">
        <p>{error}</p>
        <button className="back-button" onClick={() => navigate('/main')}>
          <FaArrowLeft /> Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="book-detail-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="book-detail-container">
        {/* Add Back Button inside container */}
        <div className="page-navigation">
          <button className="back-button" onClick={() => navigate('/main')}>
            <FaArrowLeft /> Back to Browse
          </button>
        </div>

        <div className="book-content">
          {/* Left Column - Book Cover & Stats */}
          <div className="book-detail-left">
            <div className="book-image-container">
              <div className="book-image">
                <img
                  src={book.cover_image || '/cover_default.jpg'}
                  alt={book.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/cover_default.jpg";
                  }}
                />
              </div>
              
              <div className="availability-indicator">
                <span className={book.remaining_borrows > 0 ? 'available' : 'unavailable'}>
                  {book.remaining_borrows > 0 ? 'Available Now' : 'Currently Unavailable'}
                </span>
              </div>
            </div>
            
            <div className="book-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <FaBookOpen />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{book.max_borrowers}</div>
                  <div className="stat-label">Total Copies</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{book.remaining_borrows}</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{book.lending_period}</div>
                  <div className="stat-label">Days</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {role === 'reader' && (
              <div className="book-actions-main">
                <button 
                  className={`borrow-button ${book.remaining_borrows <= 0 ? 'disabled' : ''}`}
                  onClick={handleBorrowBook}
                  disabled={borrowing || book.remaining_borrows <= 0}
                >
                  {borrowing ? (
                    <>
                      <div className="button-loader"></div>
                      <span>Processing...</span>
                    </>
                  ) : book.remaining_borrows <= 0 ? 'Currently Unavailable' : 'Borrow This Book'}
                </button>
              </div>
            )}
            
            {role === 'publisher' && Number(userId) === book.publisher_id && (
              <div className="publisher-actions-main">
                <button className="edit-button" onClick={handleEditBook}>
                  <FaEdit /> Edit Book
                </button>
                
                <button className="remove-button" onClick={handleRemoveBook}>
                  <FaTrash /> Remove Book
                </button>
              </div>
            )}
          </div>
          
          {/* Right Column - Book Details */}
          <div className="book-detail-right">
            <div className="book-header">
              <h1 className="book-title">{book.title}</h1>
              
              <div className="book-tags">
                {book.tags && book.tags.length > 0 ? book.tags.map((tag, index) => (
                  <span key={index} className="tag-pill">{tag}</span>
                )) : <span className="no-tags">No Tags</span>}
              </div>
              
              <div className="publisher-info">
                <FaUserTie className="publisher-icon" />
                <span>Published by {book.publisher_name}</span>
              </div>
            </div>
            
            <div className="book-description">
              <h3>About this book</h3>
              <p>{book.description || "No description available."}</p>
            </div>
            
            <div className="book-details-card">
              <h3>Book Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Publisher</div>
                  <div className="detail-value">{book.publisher_name}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Maximum Borrowers</div>
                  <div className="detail-value">{book.max_borrowers}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Lending Period</div>
                  <div className="detail-value">{book.lending_period} days</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Available Copies</div>
                  <div className={`detail-value ${book.remaining_borrows > 0 ? 'available' : 'unavailable'}`}>
                    {book.remaining_borrows} of {book.max_borrowers}
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Tags</div>
                  <div className="detail-value">
                    {book.tags && book.tags.length > 0 ? book.tags.join(', ') : 'None'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
