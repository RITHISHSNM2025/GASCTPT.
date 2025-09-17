import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/Auth/LoginPage';
import { useAuth } from './hooks/useAuth';
import { supabase, Student, AttendanceRecord } from './lib/supabase';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceTracker } from './components/AttendanceTracker';
import { Reports } from './components/Reports';
import { DepartmentManagement } from './components/DepartmentManagement';

function App() {
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Load data from Supabase on mount
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchStudents();
      fetchAttendance();
    }
  }, [isAuthenticated, profile]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          student:students(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setStudents(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStudents(prev => prev.map(student => 
        student.id === id ? data : student
      ));
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStudents(prev => prev.filter(student => student.id !== id));
      setAttendance(prev => prev.filter(record => record.student_id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const markAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
          ...recordData,
          user_id: user.id,
        }])
        .select(`
          *,
          student:students(*)
        `)
        .single();

      if (error) throw error;
      setAttendance(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const updateAttendance = async (id: string, updates: Partial<AttendanceRecord>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          student:students(*)
        `)
        .single();

      if (error) throw error;
      setAttendance(prev => prev.map(record => 
        record.id === id ? data : record
      ));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleLogin = () => {
    // This will be handled by the useAuth hook
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 via-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-400 to-indigo-400 animate-gradient-x flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} attendance={attendance} />;
      case 'students':
        return (
          <StudentManagement
            students={students}
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
          />
        );
      case 'attendance':
        return (
          <AttendanceTracker
            students={students}
            attendance={attendance}
            onMarkAttendance={markAttendance}
            onUpdateAttendance={updateAttendance}
          />
        );
      case 'reports':
        return <Reports students={students} attendance={attendance} />;
      case 'departments':
        return <DepartmentManagement students={students} />;
      default:
        return <Dashboard students={students} attendance={attendance} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 via-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-400 to-indigo-400 animate-gradient-x">
      <div className="min-h-screen backdrop-blur-sm bg-white/10">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={profile}
          onSignOut={signOut}
        />
        <main className="container mx-auto px-4 py-8">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;