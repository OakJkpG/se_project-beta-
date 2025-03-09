import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Base.css'; // ไฟล์ CSS สำหรับ navbar

const Base = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // รายการเส้นทางสำหรับหน้า Login/Signup (auth pages)
  const authRoutes = ['/', '/login', '/signup/reader', '/signup/publisher'];
  const isAuthPage = authRoutes.includes(location.pathname);

  const handleLogout = () => {
    // เคลียร์ token และ role จาก localStorage แล้วรีไดเร็กต์ไปหน้า login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // ดึง role ของผู้ใช้จาก localStorage (คาดว่าจะเป็น 'reader' หรือ 'publisher')
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const roleFromStorage = localStorage.getItem('role');
    if (roleFromStorage) {
      setUserRole(roleFromStorage); // อัปเดต userRole หากมีการตั้งค่า role ใน localStorage
    }
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/">
            <img src="/path/to/logo.png" alt="BookHub Logo" className="logo" />
          </Link>
        </div>
        <div className="navbar-right">
          {isAuthPage ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup/reader" className="nav-link">Signup</Link>
            </>
          ) : (
            <>
              <Link to="/main" className="nav-link">Search</Link>
              {/* ใช้ role เพื่อเลือกเส้นทาง account */}
              {userRole === 'reader' ? (
                <Link to="/account/reader" className="nav-link">Account</Link>
              ) : userRole === 'publisher' ? (
                <Link to="/account/publisher" className="nav-link">Account</Link>
              ) : (
                <Link to="/account" className="nav-link">Account</Link>
              )}
              <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
            </>
          )}
        </div>
      </nav>
      <main>
        {children}
      </main>
    </>
  );
};

export default Base;
