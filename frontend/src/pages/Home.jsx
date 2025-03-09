// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Main Content */}
      <main className="main-content">
        <h1>BookHub</h1>
        <p>แพลตฟอร์มสำหรับนักอ่านที่ต้องการค้นหาและแบ่งปันหนังสือดี ๆ</p>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 BookHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
