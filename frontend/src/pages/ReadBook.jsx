// src/pages/ReadBook.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ReadBook = ({ borrowId }) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/books/read/${borrowId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        responseType: 'arraybuffer', // รับข้อมูลเป็น ArrayBuffer
      })
      .then(response => {
        const pdfArray = new Uint8Array(response.data);
        setPdfData(pdfArray);
      })
      // eslint-disable-next-line no-unused-vars
      .catch(err => {
        setError('Unable to load PDF. Borrow period may have expired.');
      });
  }, [borrowId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (error) return <div>{error}</div>;
  if (!pdfData) return <div>Loading PDF...</div>;

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
    >
      <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
        PDF is protected. Right-click and text selection are disabled.
      </p>
    </div>
  );
};

export default ReadBook;
