// src/pages/SignupReader.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaBook, FaCheck, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupReader = () => {
  const [step, setStep] = useState(1); // 1: Form entry, 2: Verification code
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/signup/reader/', {
        username: name,
        email,
        password
      });
      setStep(2);
      setMessage('Verification code sent to your email. Please check your inbox.');
    } catch (err) {
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://127.0.0.1:8000/api/signup/reader/verify/', {
        email,
        verification_code: verificationCode
      });
      setMessage('Your account has been verified successfully!');

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.non_field_errors?.[0] || "Verification failed. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://127.0.0.1:8000/api/signup/reader/verify/', { email });
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
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
            <p className="slogan">Access thousands of books at your fingertips.</p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div className="feature-text">
                <h3>Unlimited Access</h3>
                <p>Borrow from our vast collection of digital books</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔖</div>
              <div className="feature-text">
                <h3>Bookmarks & Notes</h3>
                <p>Save your progress and add notes while reading</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h3>Read Anywhere</h3>
                <p>Access your books on any device, anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="step-indicator">
            <div className={`step ${step === 1 ? 'active' : 'completed'}`}>
              {step > 1 ? <FaCheck /> : '1'}
            </div>
            <div className="step-line"></div>
            <div className={`step ${step === 2 ? 'active' : ''}`}>
              2
            </div>
          </div>

          <div className="login-form-header">
            <h2>{step === 1 ? 'Create Reader Account' : 'Verify Your Email'}</h2>
            <p className="form-description">
              {step === 1
                ? 'Sign up to access thousands of books and educational resources.'
                : 'Enter the verification code sent to your email.'}
            </p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {message && !error && (
            <div className="success-message">
              <p>{message}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleFormSubmit} className="login-form">
              <div className="form-group">
                <div className="input-icon">
                  <FaUser />
                </div>
                <input
                  type="text"
                  placeholder="Username"
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

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Processing...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="login-form">
              <div className="verification-container">
                <div className="form-group">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    disabled={loading}
                    maxLength={6}
                    className="verification-input"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Verifying...
                  </>
                ) : 'Verify Account'}
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

export default SignupReader;
