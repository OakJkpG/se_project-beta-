// src/pages/ReadBook.jsx
import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './ReadBook.css';

// Set worker source using the same version as pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ReadBook = ({ borrowId }) => {
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        // Validate borrowId
        if (!borrowId || !/^\d+$/.test(borrowId)) {
          setError('Invalid borrow ID.');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: `/read/${borrowId}` } });
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/books/read/${borrowId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!response.data.signed_url) {
          throw new Error('No signed URL in response');
        }

        setPdfUrl(response.data.signed_url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [borrowId, navigate]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to the first page when a new document is loaded
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    alert('Right-click is disabled for security reasons.');
  };

  const preventDragStart = (e) => {
    e.preventDefault();
  };

  if (error) {
    return <div className="error-message">Error loading PDF: {error}</div>;
  }

  if (loading || !pdfUrl) {
    return <div className="loading-message">Loading PDF...</div>;
  }

  return (
    <div
      className="pdf-container"
      onContextMenu={preventContextMenu}
      onDragStart={preventDragStart}
    >
      <div className="pdf-controls">
        <button onClick={goToPreviousPage} disabled={currentPage <= 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {numPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= numPages}>
          Next
        </button>
      </div>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error('Error loading PDF:', error)}
      >
        <Page
          pageNumber={currentPage}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};

export default ReadBook;
