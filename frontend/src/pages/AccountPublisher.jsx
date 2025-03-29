import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Account.css';
import { useNavigate } from 'react-router-dom';
import { uploadImage} from '../api';

const AccountPublisher = () => {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    lending_period: 14,
    max_borrowers: 1,
    cover_image: '',
    pdf_file: null,
    selectedTags: [],
    custom_tag: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/account/publisher/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => setAccountData(response.data))
      .catch(err => {
        console.error("Error fetching account data:", err.response?.data);
        setError('Failed to load account data.');
      });
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
        console.error("Error removing book:", err.response?.data);
        alert('Failed to remove book.');
      });
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = null;
      // let pdfFileUrl = null;

      // อัปโหลดรูปภาพ
      if (newBook.cover_image instanceof File) {
        coverImageUrl = await uploadImage(newBook.cover_image);
        console.log("coverImageUrl:", coverImageUrl);
      }

      // อัปโหลด PDF
      // if (newBook.pdf_file instanceof File) {
      //   pdfFileUrl = await uploadPDF(newBook.pdf_file);
      //   console.log("pdfFileUrl:", pdfFileUrl);
      // }

      const formData = new FormData();


      formData.append('title', newBook.title);
      formData.append('description', newBook.description);
      formData.append('lending_period', newBook.lending_period);
      formData.append('max_borrowers', newBook.max_borrowers);
      formData.append('selectedTags', JSON.stringify(newBook.selectedTags));

      if (coverImageUrl) {
        formData.append('cover_image', coverImageUrl);
      }
      
      if (newBook.pdf_file instanceof File) {
        formData.append('pdf_file', newBook.pdf_file);
      }

      if (newBook.selectedTags.length > 0) {
        formData.append('tags', newBook.selectedTags.join(','));
      }





      if (newBook.custom_tag) {
        formData.append('custom_tag', newBook.custom_tag);
      }

      const response = await axios.post('http://127.0.0.1:8000/api/books/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });









      setAccountData(prev => ({
        ...prev,
        published_books: [...prev.published_books, response.data]
      }));


      setShowAddBookModal(false);
      setNewBook({
        title: '',
        description: '',
        lending_period: 14,
        custom_tag: '',
      });
    } catch (err) {
      console.error("Error adding book:", err);
      alert('Failed to add book. Please try again.');
    }
  };

  const fetchAvailableTags = () => {
    axios
      .get('http://127.0.0.1:8000/api/tags/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => {
        setAvailableTags(response.data);
      })
      .catch(err => {
        console.error("Error fetching tags:", err.response?.data);
        alert('Failed to load tags.');
      });
  };

  const openTagModal = () => {
    fetchAvailableTags();
    setShowTagModal(true);
  };

  const handleTagSelection = (tagName) => {
    let updatedTags = [...newBook.selectedTags];
    if (updatedTags.includes(tagName)) {
      updatedTags = updatedTags.filter(tag => tag !== tagName);
    } else {
      updatedTags.push(tagName);
    }
    setNewBook({ ...newBook, selectedTags: updatedTags });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPEG)');
        return;
      }
      setNewBook(prev => ({
        ...prev,
        cover_image: file  // เก็บไฟล์ไว้ใน state
      }));
    }
  };

  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      setNewBook(prev => ({
        ...prev,
        pdf_file: file  // เก็บไฟล์ไว้ใน state
      }));
    }
  };

  if (error) return <p>{error}</p>;
  if (!accountData) return <p>Loading...</p>;

  return (
    <div className="account-page">
      <div className="account-left">
        <img src={accountData.user.profile_image || "/publisher_default.jpg"} alt="Profile" />
        <h2>{accountData.user.name}</h2>
        <p>Role: {accountData.user.role}</p>
        <p>Registered: {new Date(accountData.user.registered_at).toLocaleDateString()}</p>
        <p>Published Books: {accountData.user.book_count}</p>
        <button onClick={() => {
          localStorage.removeItem('token');
          navigate('/');
        }}>Logout</button>
      </div>

      <div className="account-right">
        <div className="top-controls">
          <button onClick={() => setShowAddBookModal(true)}>เพิ่มหนังสือ</button>
        </div>
        <h3>รายการหนังสือที่ลง</h3>
        <div className="books-list">
          {accountData.published_books.map(book => (
            <div key={book.id} className="book-item">
              {console.log("book.cover_image:", book.cover_image)}
              <img
                src={book.cover_image}
                alt={book.title}
                onError={(e) => {
                  console.error('Error loading image:', book.cover_image);
                  e.target.onerror = null;
                  e.target.src = "/cover_default.jpg";
                }}
                style={{ maxWidth: '200px', height: 'auto', objectFit: 'cover' }}
              />
              <div className="book-info">
                <h4>{book.title}</h4>
                <p>จำนวนถูกยืม: {book.borrow_count}</p>
                <div className="book-actions">
                  <button onClick={() => navigate(`/edit-book/${book.id}`)}>แก้ไขหนังสือ</button>
                  <button onClick={() => handleRemoveBook(book.id)}>ถอนหนังสือ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddBookModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>เพิ่มหนังสือใหม่</h3>
            <form onSubmit={handleAddBookSubmit}>
              <div>
                <label>ชื่อหนังสือ:</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>คำอธิบาย:</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>จำนวนสูงสุดที่ยืมได้:</label>
                <input
                  type="number"
                  value={newBook.max_borrowers}
                  onChange={(e) => setNewBook({ ...newBook, max_borrowers: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>เวลาที่สามารถยืมได้ (วัน):</label>
                <input
                  type="number"
                  value={newBook.lending_period}
                  onChange={(e) => setNewBook({ ...newBook, lending_period: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>แท็กหนังสือ:</label>
                <div className="tag-selection">
                  <button type="button" onClick={openTagModal}>เลือกแท็กหนังสือ</button>
                  <div className="selected-tags">
                    {newBook.selectedTags.map((tag, index) => (
                      <span key={index} className="tag-item">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label>เพิ่มแท็กใหม่ (ถ้าต้องการ):</label>
                <input
                  type="text"
                  value={newBook.custom_tag}
                  onChange={(e) => setNewBook({ ...newBook, custom_tag: e.target.value })}
                />
              </div>
              <div>
                <label>Upload Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required
                />
              </div>
              <div>
                <label>Upload PDF:</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                />
              </div>
              <div className="modal-actions">
                <button type="submit">ยืนยันการลงหนังสือ</button>
                <button type="button" onClick={() => setShowAddBookModal(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="modal tag-modal">
          <div className="modal-content">
            <h3>เลือกแท็กหนังสือ</h3>
            <div className="tags-list">
              {availableTags.length > 0 ? (
                availableTags.map(tag => (
                  <div key={tag.id} className="tag-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={newBook.selectedTags.includes(tag.name)}
                        onChange={() => handleTagSelection(tag.name)}
                      />
                      {tag.name}
                    </label>
                  </div>
                ))
              ) : (
                <p>No tags available.</p>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowTagModal(false)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPublisher;
