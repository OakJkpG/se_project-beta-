import axios from "axios";

const API_URL = 'https://<backend-vercel-url>/api'; // เปลี่ยนเป็น URL ของ backend บน Vercel

export const getBooks = async () => {
  const response = await axios.get(`${API_URL}/books/`);
  return response.data;
};

