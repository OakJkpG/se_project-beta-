// src/pages/SignupPublisher.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaArrowLeft, FaBook, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupPublisher = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idCard, setIdCard] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate ID card
    if (idCard.length < 8) {
      setError('ID Card number must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/signup/publisher/', {
        name,
        email,
        password,
        id_card: idCard
      });

      setSuccess(true);

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIdCard('');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-left">
          <div className="login-header">
            <div className="app-logo">
              <FaBook className="logo-icon" />
              <h1>BookHub</h1>
            </div>
            <p className="slogan">Become a publisher and share your knowledge with the world.</p>
          </div>

          <div className="publisher-benefits">
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div className="feature-text">
                <h3>Publish Your Books</h3>
                <p>Share your knowledge and expertise with a global audience</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Track Analytics</h3>
                <p>Monitor who is reading your publications</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <h3>Secure Platform</h3>
                <p>Your content is protected and only accessible to authorized users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-header">
            <h2>Publisher Registration</h2>
            <p className="form-description">
              Fill out this form to register as a publisher. Your account will need admin approval before activation.
            </p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="success-message">
              <p>Registration submitted successfully!</p>
              <p className="sub-message">
                Your account is pending admin approval. We'll notify you by email once approved.
              </p>
              <p className="sub-message">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <div className="input-icon">
                  <FaUser />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <div className="input-icon">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group password-group">
                <div className="input-icon">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="form-group">
                <div className="input-icon">
                  <FaLock />
                </div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <div className="input-icon">
                  <FaIdCard />
                </div>
                <input
                  type="text"
                  placeholder="ID Card Number"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Register as Publisher'}
              </button>
            </form>
          )}

          <Link to="/login" className="back-to-login">
            <FaArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPublisher;
