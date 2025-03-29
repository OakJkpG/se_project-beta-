// src/pages/Home.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import './Home.css';

// const Home = () => {
//   return (
//     <div className="home-page">
//       {/* Main Content */}
//       <main className="main-content">
//         <h1>BookHub</h1>
//         <p>แพลตฟอร์มสำหรับนักอ่านที่ต้องการค้นหาและแบ่งปันหนังสือดี ๆ</p>
//       </main>

//       {/* Footer */}
//       <footer className="footer">
//         <p>© 2025 BookHub. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default Home;
// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
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
      {/* Header */}

      {/* Main Content */}
      <main className="main-content">
        <h1>Discover & Share Amazing Books</h1>
        <h2>แพลตฟอร์มสำหรับนักอ่านที่ต้องการค้นหาและแบ่งปันหนังสือดี ๆ</h2>
        <Link to="/main" className="cta-button">Let's Explore Books!</Link>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 BookHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

