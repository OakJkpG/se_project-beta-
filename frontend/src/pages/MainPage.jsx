import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // ตัวอย่างแท็กพื้นฐานที่มีให้เลือก
  const availableTags = ["Fiction", "Non-fiction", "Science"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized. Please login.');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/books/', {
      headers: { Authorization: `Token ${token}` },
    })
    .then(response => setBooks(response.data))
    .catch(err => {
      console.error("Error fetching books:", err);
      setError('Failed to load books. Please try again later.');
    });
  }, []);

  // ฟังก์ชันกรองหนังสือจาก search query และ selected tags
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    // ถ้าไม่ได้เลือกแท็กใดๆ ก็ถือว่าผ่านเงื่อนไข
    const matchesTags = selectedTags.length === 0 || 
      (book.tags && selectedTags.some(tag => book.tags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  if (error) return <div>{error}</div>;

  return (
    <div className="main-page">
      <h1>All Books</h1>

      {/* ส่วน Filter และ Search */}
      <div className="filter-search-container">
        {/* Filter Section */}
        <div className="filter-section">
          <h3>Filter by Tags</h3>
          {availableTags.map(tag => (
            <div key={tag} className="tag-option">
              <input 
                type="checkbox"
                value={tag}
                checked={selectedTags.includes(tag)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTags(prev => [...prev, tag]);
                  } else {
                    setSelectedTags(prev => prev.filter(t => t !== tag));
                  }
                }}
              />
              <span>{tag}</span>
            </div>
          ))}
        </div>

        {/* Search Section */}
        <div className="search-section">
          <input 
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* แสดงรายการหนังสือ */}
      <div className="book-list">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-item">
              <img src={book.cover_image} alt={book.title} />
              <h3>{book.title}</h3>
              <p>Tags: {book.tags ? book.tags.join(', ') : 'No Tags'}</p>
              <p>Publisher: {book.publisher_name}</p>
              <p>Remaining Borrows: {book.remaining_borrows}</p>
              <Link to={`/book/${book.id}`}>Details</Link>
            </div>
          ))
        ) : (
          <p>No books available.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
