import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

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
        
        // Update local state to reflect the new borrowed status
        setBook({
          ...book,
          remaining_borrows: book.remaining_borrows - 1
        });
        
        // Redirect after a short delay to allow the user to see the success message
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

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleRemoveBook = () => {
    axios
      .delete(`http://127.0.0.1:8000/api/books/remove/${bookId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(() => {
        alert('Book removed successfully!');
        navigate('/account/publisher');
      })
      .catch((err) => {
        console.error('Error removing book:', err.response?.data);
        alert('Failed to remove book.');
      });
  };

  const handleEditBook = () => {
    navigate(`/edit-book/${bookId}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading book details...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
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
        
        <div className="book-info">
          <h1>{book.title}</h1>
          
          <div className="book-tags">
            {book.tags && book.tags.length > 0 ? book.tags.map((tag, index) => (
              <span key={index} className="tag-pill">{tag}</span>
            )) : <span className="no-tags">No Tags</span>}
          </div>
          
          <p className="publisher"><strong>Publisher:</strong> {book.publisher_name}</p>
          
          <div className="book-description">
            <h3>Description</h3>
            <p>{book.description || "No description available."}</p>
          </div>
          
          <div className="book-details">
            <div className="detail-item">
              <span className="detail-label">Max Borrowers:</span>
              <span className="detail-value">{book.max_borrowers}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Lending Period:</span>
              <span className="detail-value">{book.lending_period} days</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Available Copies:</span>
              <span className={`detail-value ${book.remaining_borrows > 0 ? 'available' : 'unavailable'}`}>
                {book.remaining_borrows}
              </span>
            </div>
          </div>
          
          <div className="book-actions">
            {role === 'reader' && (
              <button 
                className={`borrow-button ${borrowing ? 'loading' : ''} ${book.remaining_borrows <= 0 ? 'disabled' : ''}`}
                onClick={handleBorrowBook}
                disabled={borrowing || book.remaining_borrows <= 0}
              >
                {borrowing ? (
                  <>
                    <span className="button-loader"></span>
                    <span>Processing...</span>
                  </>
                ) : book.remaining_borrows <= 0 ? 'Currently Unavailable' : 'Borrow Book'}
              </button>
            )}
            
            {role === 'publisher' && (
              <div className="publisher-actions">
                <button className="edit-button" onClick={handleEditBook}>Edit Book</button>
                <button className="remove-button" onClick={handleRemoveBook}>Remove Book</button>
              </div>
            )}
            
            <button className="back-button" onClick={() => navigate(-1)}>Back to Books</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
