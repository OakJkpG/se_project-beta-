// src/pages/SignupReader.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate สำหรับรีไดเร็กต์
import './Auth.css';

const SignupReader = () => {
  const [step, setStep] = useState(1); // 1: กรอกข้อมูล, 2: ยืนยันโค้ด
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/signup/reader/', { 
        username: name,  // ส่ง username แทน name
        email, 
        password 
      });
      setStep(2);
      setMessage('Verification code sent to your email. Please check your inbox.');
    } catch (err) {
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.error || "Signup failed.");
    }
  };
  
  

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/signup/reader/verify/', { email, verification_code: verificationCode });
      setMessage('Your account has been verified and registered as a Reader.');
      // รีไดเร็กต์ไปยังหน้า login หลังการยืนยันสำเร็จ
      navigate('/login');
    } catch (err) {
      console.error("Error Response:", err.response.data);
      setError(err.response?.data?.non_field_errors?.[0] || "Verification failed.");
    }
  };

  return (
    <div className="auth-page">
      <h2>Sign up as Reader</h2>
      {error && <p className="error">{error}</p>}
      
      {step === 1 && (
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit">Sign up</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerificationSubmit}>
          <div>
            <label>Verification Code:</label>
            <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
          </div>
          <button type="submit">Verify</button>
        </form>
      )}
      
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SignupReader;
