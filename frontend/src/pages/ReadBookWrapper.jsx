// src/pages/ReadBookWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ReadBook from './ReadBook';

const ReadBookWrapper = () => {
  const { borrowId } = useParams();
  return <ReadBook borrowId={borrowId} />;
};

export default ReadBookWrapper;
