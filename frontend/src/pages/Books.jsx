import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/books/";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setBooks(response.data);
    });
  }, []);

  return (
    <div>
      <h1>รายการหนังสือ 📖</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title} - {book.author}</li>
        ))}
      </ul>
    </div>
  );
}

export default Books;
