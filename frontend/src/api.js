import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = 'https://csqtsflaklabqsnjlioy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcXRzZmxha2xhYnFzbmpsaW95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTU0NjExMywiZXhwIjoyMDU3MTIyMTEzfQ.5ShmiI7t-b8LTxKeh3TxE0RILSdG5Ss6a1WrkaxqaAI';

export const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = import.meta.env.VITE_API_URL;

// Add request interceptor for token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันสำหรับอัปโหลดไฟล์รูปภาพ
export const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file selected');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;

    // อัปโหลดไฟล์
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.storage
      .from('Bookhub_media')
      .upload(`covers/${fileName}`, file);

    if (error) {
      throw error;
    }

    // สร้าง public URL
    const { data: { publicUrl } } = supabase.storage
      .from('Bookhub_media')
      .getPublicUrl(`covers/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับอัปโหลดไฟล์ PDF
export const uploadPDF = async (file) => {
  try {
    if (!file) {
      throw new Error('No file selected');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;

    // อัปโหลดไฟล์
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.storage
      .from('Bookhub_pdf')
      .upload(`pdf/${fileName}`, file);

    if (error) {
      throw error;
    }

    // สร้าง public URL
    const { data: { publicUrl } } = supabase.storage
      .from('Bookhub_pdf')
      .getPublicUrl(`pdf/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading PDF:', error.message);
    throw error;
  }
};
