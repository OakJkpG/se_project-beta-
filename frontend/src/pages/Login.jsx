// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { identifier, password });
      
      // Get token and user info
      const { token, role } = response.data;
      const userId = response.data.userId || '1'; // Get userId from response or use default
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
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
    <div className="auth-page">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email or Username:</label>
          <input 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="separator">
        <span>OR</span>
      </div>
      
      <div className="google-login-container">
        <p className="google-login-note">Sign in with Google is for readers only</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="filled_blue"
          text="signin_with"
          shape="rectangular"
          size="large"
          disabled={loading}
        />
      </div>
      
      <p>
        Don't have an account?&nbsp;
        <Link to="/signup/reader">Signup as Reader</Link> |&nbsp;
        <Link to="/signup/publisher">Signup as Publisher</Link>
      </p>
    </div>
  );
};

export default Login;
