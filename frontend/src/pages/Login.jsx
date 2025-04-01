import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Auth.css';
import SignupModal from "../components/account/SignupModal";
import { FaUser, FaLock, FaBook, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { saveAuthData, clearAuthData } from '../utils/authUtils';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { 
        identifier, 
        password,
        remember_me: rememberMe 
      });

      const { token, role, userId } = response.data;
      
      // Save auth data based on remember me choice
      saveAuthData({ token, role, userId }, rememberMe);

      // Navigate based on role
      if (role === 'reader') {
        navigate(`/account/reader/${userId}`);
      } else if (role === 'publisher') {
        navigate(`/account/publisher/${userId}`);
      } else {
        navigate('/main');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      clearAuthData(); // Clear any existing auth data on error
    } finally {
      setLoading(false);
    }
  };

  // Add Google Login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setLoading(true);

    try {
      // Send the Google ID token to your backend
      const response = await axios.post('http://127.0.0.1:8000/api/google-login/', {
        token: credentialResponse.credential,
        user_type: 'reader' // Always set as reader
      });

      // Get token and user info
      const { token, role } = response.data;
      const userId = response.data.userId || '1';

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Since this is reader-only login, always navigate to reader account
      navigate(`/account/reader/${userId}`);
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.detail || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add Google Login error handler
  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
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
            <p className="slogan">Your digital library, anywhere, anytime.</p>
          </div>
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div className="feature-text">
                <h3>Extensive Library</h3>
                <p>Access thousands of books across genres</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <div className="feature-text">
                <h3>Easy Borrowing</h3>
                <p>Borrow books with just a few clicks</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h3>Read Anywhere</h3>
                <p>Access your books on any device</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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

            <div className="form-options">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="separator">
            <span>OR</span>
          </div>

          <div className="google-login-container">
            <div className="google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                text="signin_with"
                shape="pill"
                size="large"
                disabled={loading}
              />
            </div>
            <p className="google-login-note">
              <FaGoogle /> Sign in with Google is for readers only
            </p>
          </div>

          <div className="signup-options">
            <p>Don't have an account?</p>
            <Link
              onClick={() => setIsSignupModalOpen(true)}
              className="nav-link signup-button"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  );
};

export default Login;
