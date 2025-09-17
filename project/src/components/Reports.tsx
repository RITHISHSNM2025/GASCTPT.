import React, { useState } from 'react';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import { Student, AttendanceRecord } from '../lib/supabase';
import { departments } from '../data/departments';

interface ReportsProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export const Reports: React.FC<ReportsProps> = ({ students, attendance }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'student'>('summary');

  const filteredAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || recordDate >= fromDate) && 
                     (!toDate || recordDate <= toDate);
    const deptMatch = !selectedDepartment || record.department === selectedDepartment;
    
    return dateMatch && deptMatch;
  });

  const generateSummaryReport = () => {
    const totalClasses = [...new Set(filteredAttendance.map(r => r.date))].length;
    const totalStudents = selectedDepartment 
      ? students.filter(s => s.department === selectedDepartment).length
      : students.length;
    
    const presentCount = filteredAttendance.filter(r => r.status === 'present').length;
    const absentCount = filteredAttendance.filter(r => r.status === 'absent').length;
    const lateCount = filteredAttendance.filter(r => r.status === 'late').length;
    
    const attendanceRate = totalStudents && totalClasses 
      ? ((presentCount + lateCount) / (totalStudents * totalClasses)) * 100 
      : 0;

    return {
      totalClasses,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: Math.round(attendanceRate),
    };
  };

  const generateStudentReport = () => {
    const filteredStudents = selectedDepartment 
      ? students.filter(s => s.department === selectedDepartment)
      : students;

    return filteredStudents.map(student => {
      const studentAttendance = filteredAttendance.filter(r => r.studentId === student.id);
      const totalClasses = [...new Set(filteredAttendance.map(r => r.date))].length;
      const present = studentAttendance.filter(r => r.status === 'present').length;
      const absent = studentAttendance.filter(r => r.status === 'absent').length;
      const late = studentAttendance.filter(r => r.status === 'late').length;
      const rate = totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 0;

      return {
        ...student,
        totalClasses,
        present,
        absent,
        late,
        rate,
      };
    });
  };

  const generateDepartmentReport = () => {
    return departments.map(dept => {
      const deptStudents = students.filter(s => s.department === dept);
      const deptAttendance = filteredAttendance.filter(r => r.department === dept);
      const totalClasses = [...new Set(filteredAttendance.map(r => r.date))].length;
      
      const present = deptAttendance.filter(r => r.status === 'present').length;
      const absent = deptAttendance.filter(r => r.status === 'absent').length;
      const late = deptAttendance.filter(r => r.status === 'late').length;
      
      const rate = deptStudents.length && totalClasses
        ? Math.round(((present + late) / (deptStudents.length * totalClasses)) * 100)
        : 0;

      return {
        department: dept,
        totalStudents: deptStudents.length,
        totalClasses,
        present,
        absent,
        late,
        rate,
      };
    }).filter(dept => dept.totalStudents > 0);
  };

  const exportToCSV = () => {
    let csvContent = '';
    
    if (reportType === 'summary') {
      const summary = generateSummaryReport();
      csvContent = `Metric,Value\n`;
      csvContent += `Total Classes,${summary.totalClasses}\n`;
      csvContent += `Total Students,${summary.totalStudents}\n`;
      csvContent += `Present,${summary.presentCount}\n`;
      csvContent += `Absent,${summary.absentCount}\n`;
      csvContent += `Late,${summary.lateCount}\n`;
      csvContent += `Attendance Rate,${summary.attendanceRate}%\n`;
    } else if (reportType === 'student') {
      const studentData = generateStudentReport();
      csvContent = `Name,Roll Number,Department,Year,Total Classes,Present,Absent,Late,Attendance Rate\n`;
      studentData.forEach(student => {
        csvContent += `${student.name},${student.rollNumber},${student.department},${student.year},${student.totalClasses},${student.present},${student.absent},${student.late},${student.rate}%\n`;
      });
    } else if (reportType === 'detailed') {
      const deptData = generateDepartmentReport();
      csvContent = `Department,Total Students,Total Classes,Present,Absent,Late,Attendance Rate\n`;
      deptData.forEach(dept => {
        csvContent += `${dept.department},${dept.totalStudents},${dept.totalClasses},${dept.present},${dept.absent},${dept.late},${dept.rate}%\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GASC_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summaryData = generateSummaryReport();
  const studentData = generateStudentReport();
  const departmentData = generateDepartmentReport();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white drop-shadow-md">Attendance Reports</h2>
        <p className="text-white/80">Generate and export attendance analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Department</label>
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
            <label className="block text-white/80 text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed' | 'student')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="summary" className="text-gray-800">Summary</option>
              <option value="detailed" className="text-gray-800">Department Wise</option>
              <option value="student" className="text-gray-800">Student Wise</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition-transform duration-200 flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Report */}
      {reportType === 'summary' && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6">Summary Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Classes', value: summaryData.totalClasses, color: 'from-blue-500 to-cyan-500' },
              { label: 'Total Students', value: summaryData.totalStudents, color: 'from-purple-500 to-pink-500' },
              { label: 'Present', value: summaryData.presentCount, color: 'from-green-500 to-emerald-500' },
              { label: 'Absent', value: summaryData.absentCount, color: 'from-red-500 to-rose-500' },
              { label: 'Late', value: summaryData.lateCount, color: 'from-orange-500 to-amber-500' },
              { label: 'Attendance Rate', value: `${summaryData.attendanceRate}%`, color: 'from-indigo-500 to-blue-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg mb-2 mx-auto w-fit`}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Report */}
      {reportType === 'student' && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6">Student Wise Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white/80 font-medium py-3 px-2">Name</th>
                  <th className="text-left text-white/80 font-medium py-3 px-2">Roll No.</th>
                  <th className="text-left text-white/80 font-medium py-3 px-2">Department</th>
                  <th className="text-center text-white/80 font-medium py-3 px-2">Present</th>
                  <th className="text-center text-white/80 font-medium py-3 px-2">Absent</th>
                  <th className="text-center text-white/80 font-medium py-3 px-2">Late</th>
                  <th className="text-center text-white/80 font-medium py-3 px-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {studentData.map((student) => (
                  <tr key={student.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-2 text-white">{student.name}</td>
                    <td className="py-3 px-2 text-white/80">{student.rollNumber}</td>
                    <td className="py-3 px-2 text-white/80 text-sm">{student.department}</td>
                    <td className="py-3 px-2 text-center text-green-300">{student.present}</td>
                    <td className="py-3 px-2 text-center text-red-300">{student.absent}</td>
                    <td className="py-3 px-2 text-center text-orange-300">{student.late}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.rate >= 75 
                          ? 'bg-green-500/20 text-green-200' 
                          : student.rate >= 60
                          ? 'bg-orange-500/20 text-orange-200'
                          : 'bg-red-500/20 text-red-200'
                      }`}>
                        {student.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Report */}
      {reportType === 'detailed' && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6">Department Wise Report</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {departmentData.map((dept) => (
              <div key={dept.department} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-3">{dept.department}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Students:</span>
                    <span className="text-white">{dept.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Classes:</span>
                    <span className="text-white">{dept.totalClasses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Present:</span>
                    <span className="text-green-300">{dept.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Absent:</span>
                    <span className="text-red-300">{dept.absent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-300">Late:</span>
                    <span className="text-orange-300">{dept.late}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Rate:</span>
                    <span className={`font-bold ${
                      dept.rate >= 75 ? 'text-green-300' : dept.rate >= 60 ? 'text-orange-300' : 'text-red-300'
                    }`}>
                      {dept.rate}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dept.rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};