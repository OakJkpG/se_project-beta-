import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/books/${bookId}/', {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    })
    .then(response => setBook(response.data))
    // eslint-disable-next-line no-unused-vars
    .catch(err => setError('Failed to load book details.'));
  }, [bookId]);

  if (error) return <div className="error-message">{error}</div>;
  if (!book) return <div>Loading...</div>;

  return (
    <div className="book-detail-page">
      <img src={book.cover_image || '/path/to/default_cover_image.png'} alt={book.title} />
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      <p>Tags: {book.tags ? book.tags.join(', ') : 'No tags available'}</p>
      <p>Publisher: {book.publisher_name || 'Unknown Publisher'}</p>
      <p>Lending Period: {book.lending_period} days</p>
      <p>Remaining Borrows: {book.remaining_borrows}</p>
    </div>
  );
};

export default BookDetail;
