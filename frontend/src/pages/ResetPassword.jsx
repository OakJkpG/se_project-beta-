import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaLock } from 'react-icons/fa';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        await axios.get(`http://127.0.0.1:8000/api/reset-password/${token}/validate/`);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setTokenValid(false);
        setError('This password reset link has expired or is invalid.');
      }
    };
    checkToken();
  }, [token]);

  if (!tokenValid) {
    return (
      <div className="login-container">
        <div className="login-form-container">
          <div className="login-right">
            <div className="login-form-header">
              <h2>Link Expired</h2>
              <p>This password reset link has expired or is invalid.</p>
            </div>
            <Link to="/forgot-password" className="login-button">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/reset-password/${token}/`, {
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password
      });
      
      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-right">
          <div className="login-form-header">
            <h2>Reset Password</h2>
            <p>Enter your new password</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type="password"
                placeholder="New Password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;