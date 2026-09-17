import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type ClassRow = {
  id: string;
  teacher_name: string;
  subject: 'Vocals' | 'Keyboard' | 'Guitar';
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  room: string;
  max_capacity: number;
  current_enrollment: number;
  created_at?: string;
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const SUBJECTS = ['Vocals', 'Keyboard', 'Guitar'] as const;
export const TEACHERS = ['Priya', 'Arjun', 'Maya'] as const;
