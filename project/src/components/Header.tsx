import React from 'react';
import { BookOpen, Users, Calendar, BarChart3, Building2, LogOut, User } from 'lucide-react';
import { UserProfile } from '../lib/supabase';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onSignOut }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
  ];

  return (
    <header className="bg-white/20 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                GASC TPT
              </h1>
              <p className="text-white/80 text-sm">
                Government Arts and Science College
              </p>
            </div>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <User className="h-5 w-5 text-white" />
              <div className="text-white">
                <p className="font-medium text-sm">{user?.full_name}</p>
                <p className="text-xs text-white/60">{user?.role} • {user?.department}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 p-2 rounded-lg transition-colors duration-200 border border-red-500/30"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white text-purple-600 shadow-md scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id} className="text-gray-800">
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={onSignOut}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 p-2 rounded-lg transition-colors duration-200 border border-red-500/30"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};