import React from 'react';
import { FaTag, FaTimes, FaPlus } from 'react-icons/fa';
import './TagModal.css';

const TagModal = ({ 
  availableTags, 
  handleTagSelection, 
  closeModal,
  selectedTags = []
}) => (
  <div className="modal tag-modal">
    <div className="modal-content">
      <div className="modal-header">
        <h3><FaTag /> เลือกแท็กหนังสือ</h3>
        <button className="close-button" onClick={closeModal}>
          <FaTimes />
        </button>
      </div>

      <div className="tag-selection-info">
        <p>เลือกได้สูงสุด 1 แท็ก (เลือกแล้ว {selectedTags.length}/1)</p>
      </div>

      {selectedTags.length > 0 && (
        <div className="selected-tags-section">
          <h4>แท็กที่เลือก:</h4>
          <div className="selected-tags-list">
            {selectedTags.map((tag, index) => (
              <span key={index} className="selected-tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagSelection(tag)}
                  className="remove-tag"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="tags-list">
        {availableTags.length > 0 ? (
          availableTags.map(tag => (
            <button
              key={tag.id}
              className={`tag-button ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
              onClick={() => handleTagSelection(tag.name)}
              disabled={!selectedTags.includes(tag.name) && selectedTags.length >= 1}
            >
              {selectedTags.includes(tag.name) ? (
                <>
                  <span>{tag.name}</span>
                  <FaTimes className="remove-icon" />
                </>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <FaPlus className="add-icon" />
                </>
              )}
            </button>
          ))
        ) : (
          <p className="no-tags-message">ยังไม่มีแท็กในระบบ</p>
        )}
      </div>
    </div>
  </div>
);

export default TagModal;