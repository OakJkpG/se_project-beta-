// src/pages/AccountReader.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Account.css';
import { useNavigate } from 'react-router-dom';

const AccountReader = () => {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returningBookId, setReturningBookId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  // ตรวจสอบ role ก่อนแสดงหน้า account
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'reader') {
      navigate('/login'); // หากไม่ใช่ reader ให้ redirect ไปที่หน้า login
    }
  }, [navigate]);

  const fetchAccountData = () => {
    axios
      .get('http://127.0.0.1:8000/api/account/reader/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => {
        console.log('Account Data:', response.data); // Debug: Log account data
        setAccountData(response.data);
      })
      .catch(err => {
        console.error('Error fetching account data:', err);
        setError('Failed to load account data.');
      });
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  // eslint-disable-next-line no-unused-vars
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleReturn = async (borrowId, bookTitle) => {
    const triggerReturn = (borrowId) => {
      setReturningBookId(borrowId); // เปิด modal
    };
    <button 
      className={`return-button ${returnLoading && returningBookId === borrowId ? 'loading' : ''}`}
      onClick={() => triggerReturn(borrowId)}
      disabled={returnLoading}
    >
      {returnLoading && returningBookId === borrowId ? (
        <>
          <span className="button-loader"></span>
          <span>Returning...</span>
        </>
      ) : 'Return Book'}
    </button>

    setReturnLoading(true);
    setReturningBookId(borrowId);

    try {
        const response = await axios({
            method: 'post',
            url: `http://127.0.0.1:8000/api/books/return/${borrowId}/`,
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status === 'success') {
            // Update local state
            setAccountData(prev => {
                if (!prev || !prev.borrowed_books) {
                    console.warn('Account data or borrowed_books is undefined/null');
                    return prev;
                }
                const updatedBorrowedBooks = prev.borrowed_books.filter(borrow => borrow.id !== borrowId);
                return {
                    ...prev,
                    borrowed_books: updatedBorrowedBooks,
                    user: {
                        ...prev.user,
                        borrow_count: Math.max(0, prev.user.borrow_count - 1)
                    }
                };
            });

            // Show success message
            setNotification({
                show: true,
                type: 'success',
                message: `คืนหนังสือ "${bookTitle}" สำเร็จ`
            });

            // Refresh account data (optional, but recommended)
            fetchAccountData();
        } else {
            // Log the response if the status is not 'success'
            console.error('Return book failed:', response.data);
            setNotification({
                show: true,
                type: 'error',
                message: response.data.message || 'ไม่สามารถคืนหนังสือได้ กรุณาลองใหม่อีกครั้ง'
            });
        }
    } catch (error) {
        console.error('Error returning book:', error.response ? error.response.data : error.message);

        let errorMessage = 'ไม่สามารถคืนหนังสือได้ กรุณาลองใหม่อีกครั้ง';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }

        // Show error message
        setNotification({
            show: true,
            type: 'error',
            message: errorMessage
        });
    } finally {
        setReturnLoading(false);
        setReturningBookId(null);

        // Hide notification after 3 seconds
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    }
};

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
  
  if (!accountData) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading account data...</p>
    </div>
  );

  return (
    <div className="account-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="account-left">
        <img 
          src={accountData.user.profile_image || "/reader_default.jpg"} 
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/reader_default.jpg";
          }}
        />
        <h2>{accountData.user.name}</h2>
        <p>Role: {accountData.user.role}</p>
        <p>Registered: {new Date(accountData.user.registered_at).toLocaleDateString()}</p>
        <p>Borrowed Books: {accountData.user.borrow_count}</p>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/');
        }}>Logout</button>
      </div>
      
      <div className="account-right">
        <h3>Borrowed Books</h3>
        {accountData.borrowed_books.length > 0 ? (
          <div className="borrowed-books-grid">
            {accountData.borrowed_books.map(borrow => {
              // Check if the book has been returned
              if (borrow.returned_at) {
                return null; // Skip rendering if the book has been returned
              }

              console.log('Borrow Data:', borrow); // Debug: Log borrow data
              return (
                <div key={borrow.id} className="book-item">
                  <div className="book-cover">
                    <img
                      src={`${borrow.book.cover_image}`}
                      alt={borrow.book.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/cover_default.jpg";
                      }}
                    />
                  </div>
                  <div className="book-info">
                    <h4>{borrow.book.title}</h4>
                    <p className="due-date">
                      <span>Due Date:</span> {new Date(borrow.due_date).toLocaleDateString()}
                    </p>
                    <div className="book-actions">
                      <button 
                        className="read-button" 
                        onClick={() => navigate(`/read/${borrow.id}`)}
                      >
                        Read Book
                      </button>
                      <button 
                        className={`return-button ${returnLoading && returningBookId === borrow.id ? 'loading' : ''}`}
                        onClick={() => handleReturn(borrow.id, borrow.book.title)}
                        disabled={returnLoading}
                      >
                        {returnLoading && returningBookId === borrow.id ? (
                          <>
                            <span className="button-loader"></span>
                            <span>Returning...</span>
                          </>
                        ) : 'Return Book'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-books-message">
            <p>You haven't borrowed any books yet.</p>
            <button onClick={() => navigate('/main')}>Browse Books</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountReader;
