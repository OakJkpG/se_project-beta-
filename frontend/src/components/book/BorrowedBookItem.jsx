import React from 'react';
import { FaBook, FaCalendarAlt, FaClock, FaArrowRight, FaSpinner } from 'react-icons/fa';
import CountdownNotification from '../../pages/CountdownNotification';

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
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 2) return 'due-soon';
    return 'on-time';
  };

  const daysRemaining = calculateDaysRemaining(borrow.due_date);
  const dueStatusClass = getDueStatusClass(daysRemaining);

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
            ? 'Overdue'
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
            className={`return-button ${returnLoading && returningBookId === borrow.id ? 'loading' : ''}`}
            onClick={() => handleReturn(borrow.id, borrow.book.title)}
            disabled={returnLoading}
          >
            {returnLoading && returningBookId === borrow.id ? (
              <>
                <FaSpinner className="spinning" />
                Returning...
              </>
            ) : (
              <>
                <FaArrowRight />
                Return Book
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBookItem;