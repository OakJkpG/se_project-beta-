import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../hooks/account/useAccount';
import { useNotification } from '../hooks/notifications/useNotification';
import { useAddBook } from '../hooks/book/useAddBook';
import { useTagManagement } from '../hooks/book/useTagManagement';
import { useFileUpload } from '../hooks/account/useFileUpload';
import ProfileHeader from '../components/account/ProfileHeader';
import AccountStats from '../components/account/AccountStats';
import AccountActions from '../components/account/AccountActions';
import PublishedBookItem from '../components/account/PublishedBookItem';
import AddBookModal from '../components/book/AddBookModal';
import TagModal from '../components/book/TagModal';
import NotificationBar from '../components/notifications/NotificationBar';
import './Account.css';
import axios from 'axios';

const AccountPublisher = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { accountData, loading, error, fetchAccountData } = useAccount('publisher');
  const { notification, showNotification } = useNotification();

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const closeModal = useCallback(() => {
    setShowAddBookModal(false);
    setShowTagModal(false);
  }, []);

  const { newBook, setNewBook, handleAddBookSubmit } = useAddBook(fetchAccountData, showNotification, closeModal);
  const { availableTags, fetchAvailableTags, handleCustomTagChange, handleRemoveTag } = useTagManagement(showNotification, setNewBook);
  const { handleImageUpload, handlePDFUpload } = useFileUpload(showNotification, setNewBook);

  const openTagModal = useCallback(() => {
    fetchAvailableTags();
    setShowTagModal(true);
  }, [fetchAvailableTags]);

  const handleRemoveBook = useCallback((bookId, bookTitle) => {
    if (window.confirm(`Are you sure you want to remove "${bookTitle}"?`)) {
      axios.delete(`http://127.0.0.1:8000/api/books/remove/${bookId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(response => {
        console.log('Book deleted successfully', response);
        fetchAccountData();
        showNotification('success', `"${bookTitle}" has been deleted successfully`);
      })
      .catch(error => {
        console.error('Error deleting book', error);
        showNotification('error', 'Failed to delete book');
      });
    }
  }, [fetchAccountData, showNotification]);

  const handleTagSelection = (tagName) => {
    setNewBook(prev => {
      const currentTags = prev.selectedTags || [];
      
      if (currentTags.includes(tagName)) {
        // Remove tag if already selected
        return {
          ...prev,
          selectedTags: currentTags.filter(t => t !== tagName)
        };
      }
      
      if (currentTags.length >= 3) {
        showNotification('warning', 'สามารถเลือกได้สูงสุด 3 แท็ก');
        return prev;
      }

      // Add new tag
      return {
        ...prev,
        selectedTags: [...currentTags, tagName]
      };
    });
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="account-page">
      <NotificationBar notification={notification} />
      <div className="account-left">
        <ProfileHeader user={accountData.user} role="publisher" />
        <AccountStats user={accountData.user} />
        <AccountActions role="publisher" setShowAddBookModal={setShowAddBookModal} />
      </div>
      <div className="account-right">
        <div className="section-header">
          <h3>My Published Books</h3>
        </div>
        <div className="books-list">
          {accountData.published_books && accountData.published_books.length > 0 ? (
            accountData.published_books.map(book => (
              <PublishedBookItem
                key={book.id}
                book={book}
                handleRemoveBook={handleRemoveBook}
              />
            ))
          ) : (
            <div className="no-books-message">No books published yet.</div>
          )}
        </div>
      </div>

      {showAddBookModal && (
        <AddBookModal
          newBook={newBook}
          setNewBook={setNewBook}
          handleAddBookSubmit={handleAddBookSubmit}
          openTagModal={openTagModal}
          handleCustomTagChange={handleCustomTagChange}
          handleImageUpload={handleImageUpload}
          handlePDFUpload={handlePDFUpload}
          handleRemoveTag={handleRemoveTag}
          showTagModal={showTagModal}
          setShowTagModal={setShowTagModal}
          availableTags={availableTags}
          handleTagSelection={handleTagSelection}
          closeModal={closeModal}
        />
      )}

      {showTagModal && (
        <TagModal
          availableTags={availableTags}
          selectedTags={newBook.selectedTags}
          handleTagSelection={handleTagSelection}
          closeModal={() => setShowTagModal(false)}
        />
      )}
    </div>
  );
};

export default AccountPublisher;
