import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Account.css';

const AccountPublisher = () => {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const basicTags = ["Fiction", "Non-fiction", "Science"]; // ตัวอย่างแท็กพื้นฐาน
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    lending_period: 14,
    max_borrowers: 1,
    cover_image: null,
    pdf_file: null,
    selectedTags: [],  // เลือกแท็กพื้นฐาน (array ของชื่อ)
    custom_tag: '',    // แท็กที่เพิ่มเอง (สูงสุด 1 แท็ก)
  });

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/account/publisher/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => setAccountData(response.data))
      // eslint-disable-next-line no-unused-vars
      .catch(err => setError('Failed to load account data.'));
  }, []);

  const handleRemoveBook = (bookId) => {
    axios
      .delete(`http://127.0.0.1:8000/api/books/remove/${bookId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      // eslint-disable-next-line no-unused-vars
      .then(response => {
        setAccountData(prev => ({
          ...prev,
          published_books: prev.published_books.filter(b => b.id !== bookId)
        }));
      })
      .catch(err => {
        console.error(err);
        alert('Failed to remove book.');
      });
  };

  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newBook.title);
    formData.append('description', newBook.description);
    formData.append('lending_period', newBook.lending_period);
    formData.append('max_borrowers', newBook.max_borrowers);
    formData.append('selectedTags', JSON.stringify(newBook.selectedTags));
    if (newBook.custom_tag) formData.append('custom_tag', newBook.custom_tag);
    if (newBook.cover_image) formData.append('cover_image', newBook.cover_image);
    if (newBook.pdf_file) formData.append('pdf_file', newBook.pdf_file);
    axios
      .post('http://127.0.0.1:8000/api/books/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        setAccountData(prev => ({
          ...prev,
          published_books: [...prev.published_books, response.data]
        }));
        setShowAddBook(false);  // ซ่อนโมดอลหลังการเพิ่มหนังสือ
        setNewBook({ title: '', description: '', lending_period: 14, cover_image: null, pdf_file: null });
      })
      .catch(err => {
        console.error(err);
        alert('Failed to add book.');
      });
  };

  // eslint-disable-next-line no-unused-vars
  const handleTagSelection = (e) => {
    const value = e.target.value;
    let updatedTags = [...newBook.selectedTags];
  
    if (e.target.checked) {
      // ถ้า checked ให้เพิ่มค่า tag เข้าไปใน selectedTags
      updatedTags.push(value);
    } else {
      // ถ้า unchecked ให้ลบค่า tag ออกจาก selectedTags
      updatedTags = updatedTags.filter(tag => tag !== value);
    }
  
    setNewBook({ ...newBook, selectedTags: updatedTags });
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
        <p>Published Books: {accountData.user.book_count}</p>
        <button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }}>Logout</button>
        <button onClick={() => setShowAddBook(true)}>Add Book</button>
      </div>
      <div className="account-right">
        <h3>Published Books</h3>
        {accountData.published_books.map(book => (
          <div key={book.id} className="book-item">
            <img src={book.cover_image} alt={book.title} />
            <div className="book-info">
              <h4>{book.title}</h4>
              <p>Borrow Count: {book.borrow_count}</p>
              <button onClick={() => handleRemoveBook(book.id)}>Remove</button>
              <button onClick={() => alert('Manage book functionality')}>Manage</button>
            </div>
          </div>
        ))}
      </div>

      {showAddBook && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Book</h3>
            <form onSubmit={handleAddBookSubmit}>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Description:</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Lending Period (days):</label>
                <input
                  type="number"
                  value={newBook.lending_period}
                  onChange={(e) => setNewBook({ ...newBook, lending_period: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Cover Image:</label>
                <input
                  type="file"
                  onChange={(e) => setNewBook({ ...newBook, cover_image: e.target.files[0] })}
                  required
                />
              </div>
              <div>
                <label>PDF File:</label>
                <input
                  type="file"
                  onChange={(e) => setNewBook({ ...newBook, pdf_file: e.target.files[0] })}
                />
              </div>
              <button type="submit">Add Book</button>
              <button type="button" onClick={() => setShowAddBook(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPublisher;
