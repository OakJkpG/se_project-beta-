import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Make sure to install react-icons
import './MainPage.css';

const getAuthData = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const role = localStorage.getItem('role') || sessionStorage.getItem('role');
  return { token, role };
};

const clearAuthData = () => {
  localStorage.clear();
  sessionStorage.clear();
};

const MainPage = () => {
  const [books, setBooks] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const { token, role } = getAuthData();
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch data using token
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/books/', {
        headers: { Authorization: `Token ${token}` }
      }),
      axios.get('http://127.0.0.1:8000/api/tags/', {
        headers: { Authorization: `Token ${token}` }
      })
    ])
    .then(([booksResponse, tagsResponse]) => {
      setBooks(booksResponse.data);
      setTags(tagsResponse.data);
    })
    .catch(err => {
      if (err.response?.status === 401) {
        clearAuthData();
        navigate('/login');
      }
      setError('Failed to load data');
    })
    .finally(() => setLoading(false));

    // ตรวจสอบ role ก่อนเรียก API
    if (role) {
      const userEndpoint = role === 'publisher' 
        ? 'http://127.0.0.1:8000/api/account/publisher/'
        : 'http://127.0.0.1:8000/api/account/reader/';

      axios.get(userEndpoint, {
        headers: { Authorization: `Token ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(err => {
        console.error("Error fetching user info:", err);
        if (err.response?.status === 401) {
          clearAuthData();
          navigate('/login');
        }
      });
    }
  }, [navigate]);

  // ฟังก์ชันกรองหนังสือตาม search query และ selected tags
  const filteredBooks = books.filter(book => {
    // กรองตามการค้นหา
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // กรองตาม tags ที่เลือก
    const matchesTags = selectedTags.length === 0 ||
      (book.tags && selectedTags.every(tag => book.tags.includes(tag)));
    
    // กรองตามสถานะการมีให้ยืม
    const matchesAvailability = filterBy === 'all' || 
      (filterBy === 'available' && book.remaining_borrows > 0);

    return matchesSearch && matchesTags && matchesAvailability;
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
    setSearchTerm('');
    setSelectedTags([]);
    setFilterBy('all');
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
              <button
                key={tag.id}
                className={`tag-button ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                onClick={() => handleTagSelect(tag.name)}
              >
                <span className="tag-name">{tag.name}</span>
                <span className="tag-count">
                  {books.filter(book => book.tags?.includes(tag.name)).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ส่วนหลักของหน้าที่แสดงหนังสือ */}
        <div className="main-content">
          
          {/* Library Books Header */}
          <div className="section-header">
            <h2>Library Books</h2>
          </div>

          {/* Search Bar ด้านขวาบน */}
          <div className="search-container">
            <div className="search-bar">
              <span className="search-icon">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search for books by title, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Optional: Show number of results */}
            {filteredBooks.length > 0 && (
              <div className="search-results-count">
                Found {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
              </div>
            )}

            {/* Optional: Add search filters */}
            <div className="search-filters">
              <button
                className={`filter-button ${filterBy === 'all' ? 'active' : ''}`}
                onClick={() => setFilterBy('all')}
              >
                All Books
              </button>
              <button
                className={`filter-button ${filterBy === 'available' ? 'active' : ''}`}
                onClick={() => setFilterBy('available')}
              >
                Available Only
              </button>
              {/* Add more filter buttons as needed */}
            </div>
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
                <button onClick={() => { setSearchTerm(''); setSelectedTags([]); }}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
