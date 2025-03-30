// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Base from './pages/Base';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/MainPage';
import SignupReader from './pages/SignupReader';
import SignupPublisher from './pages/SignupPublisher';
import AccountReader from './pages/AccountReader';
import AccountPublisher from './pages/AccountPublisher';
import MainPage from './pages/MainPage';
import BookDetail from './pages/BookDetail';
import EditBook from './pages/EditBook';
import ReadBook from './pages/ReadBook';

// Replace this with your Google Client ID
const GOOGLE_CLIENT_ID = "922387380789-081ufgcic0l05iivp0lnqqu694cs6sbl.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Base>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup/reader" element={<SignupReader />} />
            <Route path="/signup/publisher" element={<SignupPublisher />} />
            <Route path="/account/reader/:userId" element={<AccountReader />} />
            <Route path="/account/publisher/:userId" element={<AccountPublisher />} />
            <Route path="/read/:borrowId" element={<ReadBook />} />
            <Route path="/books/:bookId" element={<BookDetail />} />
            <Route path="/books/:bookId/borrow" element={<BookDetail />} />
            <Route path="/edit-book/:bookId" element={<EditBook />} />
          </Routes>
        </Base>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
