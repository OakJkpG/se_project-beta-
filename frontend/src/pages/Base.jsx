import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SignupModal from "../components/account/SignupModal";
import { getAuthData, clearAuthData } from "../utils/authUtils";
import "./Base.css";

const Base = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Get auth data from storage
  const { token, role: userRole, userId } = getAuthData();

  // เส้นทางสำหรับหน้า Login/Signup
  const authRoutes = ["/", "/login", "/signup/reader", "/signup/publisher"];
  const isAuthPage = authRoutes.includes(location.pathname);

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  const handleAccountClick = (e) => {
    e.preventDefault();
    if (userRole === "reader") {
      navigate(`/account/reader/${userId}`);
    } else if (userRole === "publisher") {
      navigate(`/account/publisher/${userId}`);
    } else {
      navigate("/login");
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // Animation variants สำหรับ Navbar
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  const linkVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <>
      <motion.nav 
        className="navbar bg-gradient-to-r from-blue-900 to-purple-900 p-4 text-white flex justify-between items-center"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="navbar-left">
          <a href="#" onClick={handleLogoClick} className="logo-link flex items-center">
            <img src="/Bookhub.png" alt="BookHub Logo" className="logo w-12 h-12 mr-2 rounded-full shadow-lg" />
          </a>
        </div>
        <div className="navbar-right flex gap-4">
          {isAuthPage && !token ? (
            <>
              <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                <Link to="/login" className="nav-link">Login</Link>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                <Link  
                  onClick={() => setIsSignupModalOpen(true)} 
                  className="nav-link signup-button"
                >
                  Sign Up
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                <Link to="/main" className="nav-link">Search</Link>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                <a href="login" onClick={handleAccountClick} className="nav-link">Account</a>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
                <a href="" onClick={handleLogout} className="nav-link logout-button">Logout</a>
              </motion.div>
            </>
          )}
        </div>
      </motion.nav>
      <main className="p-4">{children}</main>
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </>
  );
};

export default Base;
