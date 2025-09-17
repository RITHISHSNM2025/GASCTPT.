import React, { useState } from 'react';
import { UserPlus, Search, Edit, Trash2, Mail, Phone, GraduationCap } from 'lucide-react';
import { Student } from '../lib/supabase';
import { departments, years } from '../data/departments';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    email: '',
    phone: '',
    year: '',
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      onAddStudent(formData);
      setShowAddForm(false);
    }
    setFormData({
      name: '',
      rollNumber: '',
      department: '',
      email: '',
      phone: '',
      year: '',
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      email: student.email,
      phone: student.phone,
      year: student.year,
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNumber: '',
      department: '',
      email: '',
      phone: '',
      year: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white drop-shadow-md">Student Management</h2>
          <p className="text-white/80">Manage GASC students database</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition-transform duration-200 flex items-center space-x-2"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
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
      </div>

      {/* Add/Edit Student Form */}
      {showAddForm && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="text"
              placeholder="Roll Number"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="" className="text-gray-800">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="text-gray-800">
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="" className="text-gray-800">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year} className="text-gray-800">
                  {year}
                </option>
              ))}
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 transition-transform duration-200"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white/20 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-white/30 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Students List ({filteredStudents.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white text-lg">{student.name}</h4>
                  <p className="text-white/60 text-sm">{student.roll_number}</p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(student)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-blue-200" />
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-200" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-white/60" />
                  <span className="text-white/80 text-sm">{student.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 text-sm">{student.year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-white/60" />
                  <span className="text-white/80 text-sm">{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span className="text-white/80 text-sm">{student.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No students found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};