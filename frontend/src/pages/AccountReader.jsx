// src/pages/AccountReader.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../hooks/account/useAccount';
import { useNotification } from '../hooks/notifications/useNotification';
import { useBookActions } from '../hooks/book/useBookActions';
import ProfileHeader from '../components/account/ProfileHeader';
import AccountStats from '../components/account/AccountStats';
import BorrowedBookItem from '../components/book/BorrowedBookItem';
import NotificationBar from '../components/notifications/NotificationBar';
import AccountActions from '../components/account/AccountActions'; // Import AccountActions
import './Account.css';

const AccountReader = () => {
  const navigate = useNavigate();
  const { accountData, loading, error, fetchAccountData } = useAccount('reader');
  const { notification, showNotification } = useNotification();
  const { handleReturn, returnLoading, returningBookId } = useBookActions(fetchAccountData, showNotification);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="account-page">
      <NotificationBar notification={notification} />
      <div className="account-left">
        <ProfileHeader user={accountData.user} role="reader" />
        <AccountStats user={accountData.user} borrowCount={accountData.user.borrow_count} />
        {/* Add AccountActions for Reader */}
        <AccountActions role="reader" setShowAddBookModal={null} />
      </div>
      <div className="account-right">
        <div className="section-header">
          <h3>My Borrowed Books</h3>
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
            <div className="no-books-message">No books borrowed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountReader;
