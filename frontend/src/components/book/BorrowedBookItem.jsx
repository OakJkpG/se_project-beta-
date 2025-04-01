import React, { useEffect } from 'react';
import { FaBook, FaCalendarAlt, FaClock, FaArrowRight, FaSpinner } from 'react-icons/fa';
import CountdownNotification from '../../pages/CountdownNotification';
import './BorrowedBookItem.css'; 
const BorrowedBookItem = ({ borrow, handleReturn, returnLoading, returningBookId, navigate }) => {
  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatusClass = (daysRemaining) => {
    if (daysRemaining < 0) {
      return 'overdue';
    }
    if (daysRemaining <= 2) return 'due-soon';
    return 'on-time';
  };

  const daysRemaining = calculateDaysRemaining(borrow.due_date);
  const dueStatusClass = getDueStatusClass(daysRemaining);
  
  // Auto-return functionality for overdue books
  useEffect(() => {
    // Check if book is overdue (daysRemaining < 0) and not currently being returned
    if (daysRemaining < 0 && !returnLoading && returningBookId !== borrow.id) {
      console.log(`Book "${borrow.book.title}" is overdue by ${Math.abs(daysRemaining)} days. Auto-returning...`);
      
      // Add a slight delay to avoid immediate returns when component mounts
      // This gives user a chance to see that the book was overdue
      const autoReturnTimer = setTimeout(() => {
        handleReturn(borrow.id, borrow.book.title, true); // Added "true" to indicate auto-return
      }, 3000); // 3 second delay
      
      return () => clearTimeout(autoReturnTimer);
    }
  }, [borrow.id, borrow.book.title, daysRemaining, handleReturn, returnLoading, returningBookId]);

  return (
    <div className="book-item">
      <div className="book-cover">
        <img
          src={borrow.book.cover_image}
          alt={borrow.book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/cover_default.jpg';
          }}
        />
        <div className={`due-badge ${dueStatusClass}`}>
          {daysRemaining < 0
            ? `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`
            : daysRemaining === 0
            ? 'Due Today'
            : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
        </div>
      </div>
      <div className="book-info">
        <h4>{borrow.book.title}</h4>
        <div className="book-meta">
          <p className="borrow-date">
            <FaCalendarAlt />
            <span>Borrowed:</span>
            {new Date(borrow.borrow_date).toLocaleDateString()}
          </p>
          <p className="due-date">
            <FaClock />
            <span>Due:</span>
            {new Date(borrow.due_date).toLocaleDateString()}
          </p>
          <CountdownNotification countdown={borrow.countdown} />
        </div>
        {borrow.book.tags && borrow.book.tags.length > 0 && (
          <div className="book-tags">
            {borrow.book.tags.map((tag, index) => (
              <span key={index} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}
        <div className="book-actions">
          <button className="read-button" onClick={() => navigate(`/read/${borrow.id}`)}>
            <FaBook />
            Read Now
          </button>
          <button
            className={`return-button ${returnLoading && returningBookId === borrow.id ? 'loading' : ''} ${daysRemaining < 0 ? 'auto-returning' : ''}`}
            onClick={() => handleReturn(borrow.id, borrow.book.title)}
            disabled={returnLoading}
          >
            {returnLoading && returningBookId === borrow.id ? (
              <>
                <FaSpinner className="spinning" />
                {daysRemaining < 0 ? 'Auto-Returning...' : 'Returning...'}
              </>
            ) : (
              <>
                <FaArrowRight />
                {daysRemaining < 0 ? 'Return Overdue Book' : 'Return Book'}
              </>
            )}
          </button>
        </div>
        
        {/* Visual indicator for auto-return */}
        {daysRemaining < 0 && !returnLoading && returningBookId !== borrow.id && (
          <div className="auto-return-notice">
            <p>This overdue book will be automatically returned in a few seconds...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowedBookItem;