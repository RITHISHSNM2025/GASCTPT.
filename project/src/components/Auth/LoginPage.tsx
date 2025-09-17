import React, { useState } from 'react';
import { BookOpen, User, Lock, UserPlus, LogIn, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { departments } from '../../data/departments';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'teacher' as 'admin' | 'teacher' | 'staff',
    department: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login with username (we'll use username as email for simplicity)
        const email = `${formData.username}@gasc.edu`;
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });

        if (error) throw error;
        onLogin();
      } else {
        // Sign up
        if (!formData.department) {
          setError('Please select a department');
          return;
        }

        const email = `${formData.username}@gasc.edu`;
        const { error } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: formData.fullName,
              role: formData.role,
              department: formData.department,
            },
          },
        });

        if (error) throw error;
        
        setError('Registration successful! Please login with your credentials.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 via-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-400 to-indigo-400 animate-gradient-x flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg mx-auto w-fit mb-4">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md mb-2">
            GASC TPT
          </h1>
          <p className="text-white/80">
            Government Arts and Science College
          </p>
          <p className="text-white/60 text-sm mt-2">
            Attendance Management System
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              isLogin
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              !isLogin
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Full Name (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {/* Role (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'teacher' | 'staff' })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="teacher" className="text-gray-800">Teacher</option>
                <option value="admin" className="text-gray-800">Admin</option>
                <option value="staff" className="text-gray-800">Staff</option>
              </select>
            </div>
          )}

          {/* Department (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="" className="text-gray-800">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="text-gray-800">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                <span>{isLogin ? 'Login' : 'Sign Up'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white font-medium ml-1 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};