// src/pages/ReadBook.jsx
import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './ReadBook.css';

// Set worker source using the same version as pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ReadBook = () => {
  const { borrowId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageScale, setPageScale] = useState(1.0);
  const [pageInputValue, setPageInputValue] = useState('');
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'slide'

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

  const zoomIn = () => setPageScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setPageScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setPageScale(1.0);

  const handlePageInputChange = (e) => {
    setPageInputValue(e.target.value);
  };

  const handlePageSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInputValue);
    if (pageNumber && pageNumber > 0 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      setPageInputValue('');
    } else {
      alert(`Please enter a page number between 1 and ${numPages}`);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'slide' : 'single');
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
        <div className="navigation-controls">
          <button onClick={goToPreviousPage} disabled={currentPage <= 1}>
            Previous
          </button>
          <form onSubmit={handlePageSubmit} className="page-jump-form">
            <input
              type="number"
              value={pageInputValue}
              onChange={handlePageInputChange}
              placeholder={`Page ${currentPage}`}
              min="1"
              max={numPages}
            />
            <button type="submit">Go</button>
          </form>
          <span>of {numPages}</span>
          <button onClick={goToNextPage} disabled={currentPage >= numPages}>
            Next
          </button>
        </div>
        
        <div className="zoom-controls">
          <button onClick={zoomOut} title="Zoom Out">-</button>
          <span>{Math.round(pageScale * 100)}%</span>
          <button onClick={zoomIn} title="Zoom In">+</button>
          <button onClick={resetZoom} title="Reset Zoom">Reset</button>
        </div>

        <button 
          onClick={toggleViewMode} 
          className={`view-mode-toggle ${viewMode}`}
        >
          {viewMode === 'single' ? 'Switch to Slide View' : 'Switch to Single Page'}
        </button>
      </div>

      {viewMode === 'single' ? (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Error loading PDF:', error)}
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            scale={pageScale}
          />
        </Document>
      ) : (
        <div className="slide-view">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('Error loading PDF:', error)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                scale={pageScale}
              />
            ))}
          </Document>
        </div>
      )}
    </div>
  );
};

export default ReadBook;
