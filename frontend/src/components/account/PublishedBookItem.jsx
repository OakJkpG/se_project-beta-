import React from 'react';
import { FaBook, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PublishedBookItem = ({ book, handleRemoveBook }) => {
  const navigate = useNavigate();

  return (
    <div className="book-item">
      <div className="book-cover">
        <img
          src={book.cover_image}
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/cover_default.jpg";
          }}
        />
      </div>
      <div className="book-info">
        <h4>{book.title}</h4>
        <div className="book-meta">
          <p className="borrow-count">
            <FaBook />
            <span>Borrowed:</span> {book.borrow_count} times
          </p>
        </div>

        {book.tags && book.tags.length > 0 && (
          <div className="book-tags">
            {book.tags.map((tag, index) => (
              <span key={index} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}

        <div className="book-actions">
          <button
            className="edit-button"
            onClick={() => navigate(`/edit-book/${book.id}`)}
          >
            <FaEdit />
            Edit
          </button>
          <button
            className="remove-button"
            onClick={() => handleRemoveBook(book.id, book.title)}
          >
            <FaTrash />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishedBookItem;