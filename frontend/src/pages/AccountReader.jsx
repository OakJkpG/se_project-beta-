// src/pages/AccountReader.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../hooks/account/useAccount';
import { useNotification } from '../hooks/notifications/useNotification';
import { useBookActions } from '../hooks/book/useBookActions';
import { getAuthData } from '../utils/authUtils';
import ProfileHeader from '../components/account/ProfileHeader';
import AccountStats from '../components/account/AccountStats';
import BorrowedBookItem from '../components/book/BorrowedBookItem';
import NotificationBar from '../components/notifications/NotificationBar';
import AccountActions from '../components/account/AccountActions';
import './Account.css';

const AccountReader = () => {
  const navigate = useNavigate();
  const { accountData, loading, error, fetchAccountData } = useAccount('reader');
  const { notification, showNotification } = useNotification();
  const { handleReturn, returnLoading, returningBookId } = useBookActions(fetchAccountData, showNotification);

  useEffect(() => {
    const { token, role } = getAuthData();
    if (!token || role !== 'reader') {
      navigate('/login');
      return;
    }
    fetchAccountData();
  }, [fetchAccountData, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }

  if (!accountData?.user) {
    return (
      <div className="error-container">
        <p>Unable to load account data</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="account-page">
      <NotificationBar notification={notification} />
      <div className="account-left">
        <ProfileHeader user={accountData.user} role="reader" />
        <AccountStats 
          user={accountData.user}
          role="reader"
          borrowCount={accountData.user.borrow_count}
          activeBorrows={accountData.user.active_borrows}
        />
        <AccountActions 
          role="reader"
          onLogout={() => navigate('/login')}
        />
      </div>
      <div className="account-right">
        <div className="section-header">
          <h3>My Borrowed Books</h3>
          <p className="book-count">
            {accountData.borrowed_books?.length || 0} books borrowed
          </p>
        </div>
        <div className="borrowed-books-grid">
          {accountData?.borrowed_books && accountData.borrowed_books.length > 0 ? (
            accountData.borrowed_books.map((borrow) => (
              <BorrowedBookItem
                key={borrow.id}
                borrow={borrow}
                handleReturn={handleReturn}
                returnLoading={returnLoading}
                returningBookId={returningBookId}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="no-books-message">
              <p>No books borrowed yet.</p>
              <button onClick={() => navigate('/main')}>Browse Books</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountReader;
