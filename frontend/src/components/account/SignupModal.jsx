import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupModal.css';

const SignupModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    onClose(); // Close the modal first
    navigate(`/signup/${role}`); // Then navigate
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Choose Your Role</h2>
        <div className="role-options">
          <div 
            className="role-card"
            onClick={() => handleRoleSelect('reader')}
          >
            <img src="/reader_default.jpg" alt="Reader" />
            <h2>Reader</h2>
            <p>Browse and borrow books from our collection</p>
          </div>
          <div 
            className="role-card"
            onClick={() => handleRoleSelect('publisher')}
          >
            <img src="/publisher_default.jpg" alt="Publisher" />
            <h2>Publisher</h2>
            <p>Share your books with our community</p>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default SignupModal;