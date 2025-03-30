import React from 'react';
import { FaTag, FaUpload } from 'react-icons/fa';

const AddBookModal = ({
  newBook,
  setNewBook,
  handleAddBookSubmit,
  openTagModal,
  handleCustomTagChange,
  handleImageUpload,
  handlePDFUpload,
  handleRemoveTag,
  closeModal
}) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Add New Book</h3>
      <form onSubmit={handleAddBookSubmit} className="book-form">
        <div className="form-group">
          <label>Book Title</label>
          <input
            type="text"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            placeholder="Enter book title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newBook.description}
            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
            placeholder="Enter book description"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Maximum Borrowers</label>
            <input
              type="number"
              min="1"
              value={newBook.max_borrowers}
              onChange={(e) => setNewBook({ ...newBook, max_borrowers: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Lending Period (days)</label>
            <input
              type="number"
              min="1"
              value={newBook.lending_period}
              onChange={(e) => setNewBook({ ...newBook, lending_period: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Book Tag</label>
          <div className="tag-selection">
            <button type="button" onClick={openTagModal}>
              <FaTag /> Select Book Tag
            </button>
            <div className="selected-tags">
              {newBook.selectedTags.map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag}
                  <button
                    type="button"
                    onClick={handleRemoveTag}
                    className="remove-tag"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Create New Tag</label>
          <input
            type="text"
            value={newBook.custom_tag}
            onChange={handleCustomTagChange}
            placeholder="Type to create a new tag"
          />
        </div>

        <div className="form-group">
          <label>Cover Image</label>
          <div className="file-upload">
            <FaUpload />
            <p>Click to select an image file</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>PDF File</label>
          <div className="file-upload">
            <FaUpload />
            <p>Click to select a PDF file</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePDFUpload}
              required
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit">Add Book</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default AddBookModal;