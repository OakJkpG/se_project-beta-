import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // นำเข้า useNavigate
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // รับค่าจากผู้ใช้ (email หรือ username)
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // สร้างฟังก์ชัน navigate เพื่อเปลี่ยนเส้นทาง

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { identifier, password });
      
      const { token, role } = response.data; // ดึง token และ role จาก response
  
      localStorage.setItem('token', token);
      localStorage.setItem('role', role); // เก็บ role ลง localStorage
  
      console.log("Token:", token);
      console.log("Role:", role);
      
      // เช็คว่า role ถูกเก็บใน localStorage หรือไม่
      console.log("Role from localStorage:", localStorage.getItem('role'));
  
      navigate('/main'); // รีไดเร็กต์ไปที่ MainPage หลังจาก Login สำเร็จ
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
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
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?&nbsp;
        <Link to="/signup/reader">Signup as Reader</Link> |&nbsp;
        <Link to="/signup/publisher">Signup as Publisher</Link>
      </p>
    </div>
  );
};

export default Login;
