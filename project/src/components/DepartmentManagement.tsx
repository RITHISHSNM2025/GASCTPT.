import React from 'react';
import { Building2, Users, TrendingUp, GraduationCap } from 'lucide-react';
import { Student } from '../lib/supabase';
import { departments } from '../data/departments';

interface DepartmentManagementProps {
  students: Student[];
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ students }) => {
  const getDepartmentStats = (department: string) => {
    const deptStudents = students.filter(s => s.department === department);
    const yearBreakdown = {
      'I Year': deptStudents.filter(s => s.year === 'I Year').length,
      'II Year': deptStudents.filter(s => s.year === 'II Year').length,
      'III Year': deptStudents.filter(s => s.year === 'III Year').length,
    };
    
    return {
      total: deptStudents.length,
      yearBreakdown,
      students: deptStudents,
    };
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-violet-500 to-purple-500',
      'from-rose-500 to-pink-500',
      'from-teal-500 to-cyan-500',
      'from-lime-500 to-green-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white drop-shadow-md">Department Management</h2>
        <p className="text-white/80">Overview of all departments at GASC</p>
      </div>

      {/* Department Overview */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg mb-3 mx-auto w-fit">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{departments.length}</p>
            <p className="text-white/60 text-sm">Total Departments</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg mb-3 mx-auto w-fit">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{students.length}</p>
            <p className="text-white/60 text-sm">Total Students</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg mb-3 mx-auto w-fit">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {departments.filter(dept => getDepartmentStats(dept).total > 0).length}
            </p>
            <p className="text-white/60 text-sm">Active Departments</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg mb-3 mx-auto w-fit">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {students.length > 0 ? Math.round(students.length / departments.length) : 0}
            </p>
            <p className="text-white/60 text-sm">Avg Students/Dept</p>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map((department, index) => {
          const stats = getDepartmentStats(department);
          const colorClass = getRandomColor(index);
          
          return (
            <div
              key={department}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${colorClass} p-3 rounded-lg`}>
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-white/60 text-sm">Students</p>
                </div>
              </div>
              
              <h3 className="font-bold text-white text-lg mb-4">{department}</h3>
              
              {stats.total > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {Object.entries(stats.yearBreakdown).map(([year, count]) => (
                      <div key={year} className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">{year}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-white/20 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-500`}
                              style={{ 
                                width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%' 
                              }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t border-white/20">
                    <p className="text-white/60 text-xs">Recent Students:</p>
                    <div className="mt-2 space-y-1">
                      {stats.students.slice(-3).map((student) => (
                        <div key={student.id} className="flex justify-between items-center">
                          <span className="text-white text-sm truncate">{student.name}</span>
                          <span className="text-white/60 text-xs">{student.year}</span>
                        </div>
                      ))}
                      {stats.students.length > 3 && (
                        <p className="text-white/60 text-xs text-center">
                          +{stats.students.length - 3} more students
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">No students enrolled</p>
                  <p className="text-white/40 text-sm">Add students to this department</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Department List */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">All Departments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept, index) => (
            <div
              key={dept}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">{dept}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getDepartmentStats(dept).total > 0 
                      ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                  }`}>
                    {getDepartmentStats(dept).total} students
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};