import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'staff';
  department: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  roll_number: string;
  department: string;
  email: string;
  phone: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  student_id: string;
  date: string;
  time_in?: string;
  time_out?: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  created_at: string;
  student?: Student;
}