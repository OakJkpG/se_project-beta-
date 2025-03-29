import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://csqtsflaklabqsnjlioy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcXRzZmxha2xhYnFzbmpsaW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDYxMTMsImV4cCI6MjA1NzEyMjExM30.FtAAPtRd4at3nrkRIPL-OM9pBwnLyddvqf1fY84ZF7k';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ฟังก์ชันสำหรับอัปโหลดไฟล์รูปภาพ
export const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file selected');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;

    // อัปโหลดไฟล์
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
