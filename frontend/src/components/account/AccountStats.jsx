import React from 'react';
import { FaBook, FaBookReader } from 'react-icons/fa';
import './AccountStats.css';

const AccountStats = ({ user }) => {
  return (
    <div className="account-stats">
      <h2>Account Statistics</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Name:</span>
          <span className="stat-value">{user?.first_name || user?.username || 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Email:</span>
          <span className="stat-value">{user?.email || 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Role:</span>
          <span className="stat-value">{user?.role || 'N/A'}</span>
        </div>
        
        {user?.role === 'reader' ? (
          <>
            <div className="stat-item">
              <span className="stat-label">
                <FaBookReader /> Books Borrowed:
              </span>
              <span className="stat-value">{user?.borrow_count || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                <FaBookReader /> Currently Borrowing:
              </span>
              <span className="stat-value">{user?.active_borrows || 0}</span>
            </div>
            
          </>
        ) : (
          <div className="stat-item">
            <span className="stat-label">
              <FaBook /> Published Books:
            </span>
            <span className="stat-value">{user?.book_count || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountStats;