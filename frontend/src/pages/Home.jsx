// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaShare } from 'react-icons/fa';
import bgImage from '../assets/pexels-repuding-12064.jpg';
import './Home.css';

const Home = () => {
  return (
    <div 
      className="home-page" 
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <main className="main-content">
        <h1>Discover & Share Amazing Books</h1>
        <h2>แพลตฟอร์มสำหรับนักอ่านที่ต้องการค้นหาและแบ่งปันหนังสือดี ๆ</h2>
        
        <div className="features-container">
          <div className="feature-card">
            <FaBook className="feature-icon" />
            <h3>Digital Library</h3>
            <p>Access thousands of books anytime, anywhere</p>
          </div>
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Reading Community</h3>
            <p>Join a community of passionate readers</p>
          </div>
          <div className="feature-card">
            <FaShare className="feature-icon" />
            <h3>Easy Sharing</h3>
            <p>Share your favorite books with others</p>
          </div>
        </div>

        <Link to="/main" className="cta-button">Let's Explore Books!</Link>
      </main>

      <footer className="footer">
        <p>© 2025 BookHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

