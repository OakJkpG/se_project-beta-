/* eslint-disable no-undef */
// src/pages/AccountReader.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Account.css';
import { useNavigate } from 'react-router-dom';

const AccountReader = () => {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/account/reader/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => setAccountData(response.data))
      // eslint-disable-next-line no-unused-vars
      .catch(err => setError('Failed to load account data.'));
  }, []);

  const handleReturn = (borrowId) => {
    axios
      .post(`http://127.0.0.1:8000/api/books/return/${borrowId}/`, {}, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      // eslint-disable-next-line no-unused-vars
      .then(response => {
        setAccountData(prev => ({
          ...prev,
          borrowed_books: prev.borrowed_books.filter(b => b.id !== borrowId)
        }));
      })
      .catch(err => {
        console.error(err);
        alert('Return failed.');
      });
  };

  if (error) return <p>{error}</p>;
  if (!accountData) return <p>Loading...</p>;

  return (
    <div className="account-page">
      <div className="account-left">
        <img src={accountData.user.profile_image || "/path/to/default_profile.png"} alt="Profile" />
        <h2>{accountData.user.name}</h2>
        <p>Role: {accountData.user.role}</p>
        <p>Registered: {new Date(accountData.user.registered_at).toLocaleDateString()}</p>
        <p>Borrowed Books: {accountData.user.borrow_count}</p>
        <button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }}>Logout</button>
      </div>
      <div className="account-right">
        <h3>Borrowed Books</h3>
        {accountData.borrowed_books.map(borrow => (
          <div key={borrow.id} className="book-item">
            <img src={borrow.book.cover_image} alt={borrow.book.title} />
            <div className="book-info">
              <h4>{borrow.book.title}</h4>
              <p>Due: {new Date(borrow.due_date).toLocaleDateString()}</p>
              <button onClick={() => handleReturn(borrow.id)}>Return</button>
            </div>
          </div>
        ))}
      </div>
      <div className="book-item" key={borrowed.id}>
        <img src={borrow.book.cover_image} alt={borrow.book.title} />
        <div className="book-info">
            <h4>{borrow.book.title}</h4>
            <p>Due: {new Date(borrow.due_date).toLocaleDateString()}</p>
            <button onClick={() => navigate(`/read/${borrow.id}`)}>Read Book</button>
            <button onClick={() => handleReturn(borrow.id)}>Return</button>
        </div>
      </div>
    </div>
  );
};

export default AccountReader;
