import React from 'react';
import { Users, Calendar, TrendingUp, Award } from 'lucide-react';
import { Student, AttendanceRecord } from '../lib/supabase';
import { departments } from '../data/departments';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, attendance }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => record.date === today);
  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const totalStudents = students.length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const deptPresentToday = todayAttendance.filter(record => 
      record.status === 'present' && 
      students.find(s => s.id === record.student_id)?.department === dept
    ).length;
    const deptRate = deptStudents.length > 0 ? Math.round((deptPresentToday / deptStudents.length) * 100) : 0;
    
    return {
      name: dept,
      total: deptStudents.length,
      present: deptPresentToday,
      rate: deptRate,
    };
  });

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Active Departments',
      value: departments.length,
      icon: Award,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white drop-shadow-md mb-2">
          Welcome to GASC TPT
        </h2>
        <p className="text-white/80 text-lg">
          Attendance Management Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl mb-4 w-fit`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Department Stats */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-6">Department Wise Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map((dept, index) => (
            <div
              key={dept.name}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h4 className="font-semibold text-white mb-2 text-sm">{dept.name}</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">Present/Total</span>
                <span className="text-white font-bold">{dept.present}/{dept.total}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dept.rate}%` }}
                ></div>
              </div>
              <p className="text-white/80 text-sm">{dept.rate}% attendance</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Attendance</h3>
        <div className="space-y-3">
          {todayAttendance.slice(0, 5).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10"
            >
              <div>
                <p className="font-medium text-white">{record.studentName}</p>
                <p className="text-white/60 text-sm">{record.department}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-white/80 text-sm">{record.timeIn}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'present'
                      ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                      : record.status === 'late'
                      ? 'bg-orange-500/20 text-orange-100 border border-orange-500/30'
                      : 'bg-red-500/20 text-red-100 border border-red-500/30'
                  }`}
                >
                  {record.status}
                </span>
              </div>
            </div>
          ))}
          {todayAttendance.length === 0 && (
            <p className="text-white/60 text-center py-8">No attendance records for today</p>
          )}
        </div>
      </div>
    </div>
  );
};