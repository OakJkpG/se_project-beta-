import React from 'react';
import { FaBook, FaBookReader } from 'react-icons/fa';
import './AccountStats.css';

const AccountStats = ({ user }) => {
  return (
    <div className="account-stats">
      <h2>Account Statistics</h2>
      <div className="stats-grid">
        <div className="stat-item-account">
          <span className="stat-label-account">Name:</span>
          <span className="stat-value-account">{user?.name || 'N/A'}</span>
        </div>
        <div className="stat-item-account">
          <span className="stat-label-account">Email:</span>
          <span className="stat-value-account">{user?.email || 'N/A'}</span>
        </div>
        <div className="stat-item-account">
          <span className="stat-label-account">Role:</span>
          <span className="stat-value-account">{user?.role || 'N/A'}</span>
        </div>
        
        {user?.role === 'reader' ? (
          <>
            <div className="stat-item-account">
              <span className="stat-label-account">
                <FaBookReader /> Books Borrowed:
              </span>
              <span className="stat-value-account">{user?.borrow_count || 0}</span>
            </div>
            <div className="stat-item-account">
              <span className="stat-label-account">
                <FaBookReader /> Currently Borrowing:
              </span>
              <span className="stat-value-account">{user?.active_borrows || 0}</span>
            </div>
            
          </>
        ) : (
          <div className="stat-item-account">
            <span className="stat-label-account">
              <FaBook /> Published Books:
            </span>
            <span className="stat-value-account">{user?.book_count || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountStats;