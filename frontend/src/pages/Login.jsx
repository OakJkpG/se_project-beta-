import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Login = () => {
  const navigate = useNavigate();

  // State สำหรับเก็บข้อมูลการกรอกฟอร์ม
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ฟังก์ชั่นสำหรับส่งข้อมูลเมื่อทำการ login
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ส่งข้อมูลไปยัง backend (เช่น ผ่าน API)
    try {
      // สร้าง payload สำหรับ login
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const Data = await response.json();

      if (response.ok) {
        // หาก login สำเร็จ, นำผู้ใช้ไปที่หน้า home หรือหน้าอื่น ๆ
        navigate('/home');
      } else {
        alert('Username or Password is incorrect');
      }
    } catch (error) {
      alert('Error during login');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to BookHub</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
