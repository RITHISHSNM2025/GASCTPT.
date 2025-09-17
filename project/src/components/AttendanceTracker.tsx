import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Student, AttendanceRecord } from '../lib/supabase';
import { departments } from '../data/departments';

interface AttendanceTrackerProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (record: Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at'>) => void;
  onUpdateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  students,
  attendance,
  onMarkAttendance,
  onUpdateAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [bulkAction, setBulkAction] = useState<'present' | 'absent' | ''>('');

  const filteredStudents = students.filter(student => 
    !selectedDepartment || student.department === selectedDepartment
  );

  const dateAttendance = attendance.filter(record => record.date === selectedDate);

  const getAttendanceRecord = (studentId: string) => {
    return dateAttendance.find(record => record.student_id === studentId);
  };

  const markAttendance = (student: Student, status: 'present' | 'absent' | 'late') => {
    const existingRecord = getAttendanceRecord(student.id);
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    if (existingRecord) {
      onUpdateAttendance(existingRecord.id, { 
        status,
        timeIn: status === 'present' || status === 'late' ? currentTime : undefined,
      });
    } else {
      onMarkAttendance({
        student_id: student.id,
        date: selectedDate,
        time_in: status === 'present' || status === 'late' ? currentTime : undefined,
        status,
      });
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction) return;

    filteredStudents.forEach(student => {
      const existingRecord = getAttendanceRecord(student.id);
      if (!existingRecord) {
        markAttendance(student, bulkAction);
      }
    });
    setBulkAction('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/20 text-green-100 border-green-500/30';
      case 'late':
        return 'bg-orange-500/20 text-orange-100 border-orange-500/30';
      case 'absent':
        return 'bg-red-500/20 text-red-100 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-100 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'late':
        return <AlertCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white drop-shadow-md">Attendance Tracker</h2>
        <p className="text-white/80">Mark and manage student attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Filter Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="" className="text-gray-800">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="text-gray-800">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Bulk Action
            </label>
            <div className="flex space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as 'present' | 'absent' | '')}
                className="flex-1 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="text-gray-800">Select Action</option>
                <option value="present" className="text-gray-800">Mark Present</option>
                <option value="absent" className="text-gray-800">Mark Absent</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Attendance for {new Date(selectedDate).toLocaleDateString()}
        </h3>
        
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const record = getAttendanceRecord(student.id);
            return (
              <div
                key={student.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{student.name}</h4>
                    <div className="flex items-center space-x-4 text-white/60 text-sm">
                      <span>{student.rollNumber}</span>
                      <span>{student.department}</span>
                      <span>{student.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {record && record.timeIn && (
                      <div className="flex items-center space-x-2 text-white/80">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{record.timeIn}</span>
                      </div>
                    )}

                    {record ? (
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="capitalize">{record.status}</span>
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => markAttendance(student, 'present')}
                            className={`p-2 rounded-lg transition-colors ${
                              record.status === 'present' ? 'bg-green-500/30' : 'bg-green-500/20 hover:bg-green-500/30'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4 text-green-200" />
                          </button>
                          <button
                            onClick={() => markAttendance(student, 'late')}
                            className={`p-2 rounded-lg transition-colors ${
                              record.status === 'late' ? 'bg-orange-500/30' : 'bg-orange-500/20 hover:bg-orange-500/30'
                            }`}
                          >
                            <AlertCircle className="h-4 w-4 text-orange-200" />
                          </button>
                          <button
                            onClick={() => markAttendance(student, 'absent')}
                            className={`p-2 rounded-lg transition-colors ${
                              record.status === 'absent' ? 'bg-red-500/30' : 'bg-red-500/20 hover:bg-red-500/30'
                            }`}
                          >
                            <XCircle className="h-4 w-4 text-red-200" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(student, 'present')}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Present</span>
                        </button>
                        <button
                          onClick={() => markAttendance(student, 'late')}
                          className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>Late</span>
                        </button>
                        <button
                          onClick={() => markAttendance(student, 'absent')}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Absent</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No students found</p>
            <p className="text-white/40 text-sm">Try selecting a different department</p>
          </div>
        )}
      </div>
    </div>
  );
};