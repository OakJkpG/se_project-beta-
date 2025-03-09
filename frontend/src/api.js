import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jesymqwwoxinovuxsibt.supabase.co';  // URL ของ Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implc3ltcXd3b3hpbm92dXhzaWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MjczOTgsImV4cCI6MjA1NzAwMzM5OH0.fimoy-HUJAxf9q3LnfkyuvRB7dIDfEfeXTw4emrjO5c';  // คีย์สำหรับเชื่อมต่อ (ไปที่ Supabase Dashboard แล้วหา API Key)

export const supabase = createClient(supabaseUrl, supabaseKey);
