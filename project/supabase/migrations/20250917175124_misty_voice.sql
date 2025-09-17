/*
  # Authentication and User Management Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `role` (text: 'admin', 'teacher', 'staff')
      - `department` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `students`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `roll_number` (text, unique)
      - `department` (text)
      - `email` (text)
      - `phone` (text)
      - `year` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `attendance_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `student_id` (uuid, references students)
      - `date` (date)
      - `time_in` (time)
      - `time_out` (time)
      - `status` (text: 'present', 'absent', 'late')
      - `remarks` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Users can only access their own data and department data
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'staff')),
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  name text NOT NULL,
  roll_number text UNIQUE NOT NULL,
  department text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  year text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  student_id uuid REFERENCES students(id) NOT NULL,
  date date NOT NULL,
  time_in time,
  time_out time,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for students
CREATE POLICY "Users can read students in their department"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    department IN (
      SELECT department FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert students in their department"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    department IN (
      SELECT department FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update students in their department"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    department IN (
      SELECT department FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete students in their department"
  ON students
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    department IN (
      SELECT department FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create policies for attendance_records
CREATE POLICY "Users can read attendance in their department"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    student_id IN (
      SELECT s.id FROM students s
      JOIN user_profiles up ON up.id = auth.uid()
      WHERE s.department = up.department
    )
  );

CREATE POLICY "Users can insert attendance records"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update attendance records"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);