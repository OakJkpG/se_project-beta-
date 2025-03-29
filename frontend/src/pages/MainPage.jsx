import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MainPage.css';

const MainPage = () => {
  const [books, setBooks] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized. Please login.');
      setLoading(false);
      return;
    }

    // Debug helper
    const logResponse = (name, response) => {
      console.log(`${name} API response:`, response.data);
      return response;
    };

    // ดึงข้อมูลหนังสือทั้งหมด
    axios.get('http://127.0.0.1:8000/api/books/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(response => logResponse('Books', response))
      .then(response => setBooks(response.data))
      .catch(err => {
        console.error("Error fetching books:", err);
        setError('Failed to load books. Please try again later.');
      })
      .finally(() => setLoading(false));

    // ดึงข้อมูลแท็กทั้งหมดจาก Database
    axios.get('http://127.0.0.1:8000/api/tags/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(response => logResponse('Tags', response))
      .then(response => setTags(response.data))
      .catch(err => console.error("Error fetching tags:", err));

    // ดึงข้อมูลผู้ใช้
    axios.get('http://127.0.0.1:8000/api/account/reader/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(response => logResponse('User', response))
      .then(response => {
        // Fix: Store just the user object from the response
        // The API returns { user: {...}, borrowed_books: [...] }
        setUser(response.data.user);
      })
      .catch(err => {
        console.error("Error fetching user info:", err);
        // Try alternative user info endpoint
        const role = localStorage.getItem('role');
        if (role === 'publisher') {
          axios.get('http://127.0.0.1:8000/api/account/publisher/', {
            headers: { Authorization: `Token ${token}` },
          })
            .then(response => logResponse('Publisher', response))
            .then(response => setUser(response.data.user))
            .catch(err => console.error("Error fetching publisher info:", err));
        }
      });
  }, []);

  // ฟังก์ชันกรองหนังสือตาม search query และ selected tags
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      (book.tags && selectedTags.every(tag => book.tags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  // Add tag management functions
  const handleTagSelect = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <div className="main-page">
      {/* คำทักทายด้านบน */}
      <header className="header">
        <h2>Welcome, {user ? (user.first_name || user.username || user.name || 'Reader') : 'Guest'}!</h2>
      </header>

      <div className="content-container">
        {/* Sidebar สำหรับเลือกแท็ก */}
        <div className="sidebar">
          <div className="tag-header">
            <h3>Filter by Tags</h3>
            {selectedTags.length > 0 && (
              <button onClick={clearFilters} className="clear-tags">
                Clear All
              </button>
            )}
          </div>
          <div className="tags-container">
            {tags.map(tag => (
              <div key={tag.id} className="tag-option">
                <label className="tag-checkbox">
                  <input
                    type="checkbox"
                    value={tag.name}
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => handleTagSelect(tag.name)}
                  />
                  <span className="tag-name">{tag.name}</span>
                  <span className="tag-count">
                    {books.filter(book => book.tags?.includes(tag.name)).length}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ส่วนหลักของหน้าที่แสดงหนังสือ */}
        <div className="main-content">
          {/* Search Bar ด้านขวาบน */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* รายการหนังสือ */}
          <div className="book-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading books...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="books-grid">
                {filteredBooks.map(book => (
                  <div key={book.id} className="book-card">
                    <div className="book-cover">
                      <img
                        src={`${book.cover_image}`}
                        alt={book.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/cover_default.jpg";
                        }}
                      />
                      {book.remaining_borrows === 0 && (
                        <div className="unavailable-overlay">
                          <span>Currently Unavailable</span>
                        </div>
                      )}
                    </div>
                    <div className="book-info">
                      <h3 title={book.title}>{book.title}</h3>
                      <div className="book-tags">
                        {book.tags && book.tags.length > 0 ? book.tags.map((tag, index) => (
                          <span key={index} className="tag-pill">{tag}</span>
                        )) : <span className="no-tags">No Tags</span>}
                      </div>
                      <p className="publisher"><span>Publisher:</span> {book.publisher_name}</p>
                      <div className="book-status">
                        <span className={`availability ${book.remaining_borrows > 0 ? 'available' : 'unavailable'}`}>
                          {book.remaining_borrows > 0 ? `${book.remaining_borrows} Available` : 'Unavailable'}
                        </span>
                        <Link to={`/books/${book.id}`} className="details-button">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <img src="/no-result.png" alt="No books found" />
                <p>No books match your search criteria.</p>
                <button onClick={() => {setSearchQuery(''); setSelectedTags([]);}}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
