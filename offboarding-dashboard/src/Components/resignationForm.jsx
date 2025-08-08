import React, { useState } from 'react';
import { User, Building2, Calendar, FileText } from 'lucide-react';
import axiosInstance from './axios';
import { API_URL } from './api_url';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResignationForm = () => {
  const [resignation, setResignation] = useState({
    employee_name: '',
    employee_id: '',
    email: '',
    department: '',
    designation: '',
    branch: '',
    notice_period: '30',
    resignation_date: '',
    last_working_date: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  // *** ADDED: Validation function to check individual fields ***
  const validateField = (name, value) => {
    switch (name) {
      case 'employee_name':
        if (!value.trim()) return 'Employee name is required';
        if (value.trim().length < 2)
          return 'Name must be at least 2 characters';
        return '';

      case 'employee_id':
        if (!value.trim()) return 'Employee ID is required';
        if (value.trim().length < 3)
          return 'Employee ID must be at least 3 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return 'Please enter a valid email address';
        return '';

      case 'department':
        if (!value.trim()) return 'Department is required';
        return '';

      case 'designation':
        if (!value.trim()) return 'Designation is required';
        return '';

      case 'notice_period':
        if (!value) return 'Notice period is required';
        const days = parseInt(value);
        if (isNaN(days) || days < 30)
          return 'Notice period must be at least 30 days';
        return '';

      case 'resignation_date':
        if (!value) return 'Resignation date is required';
        const today = new Date();
        const selectedDate = new Date(value);
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today)
          return 'Resignation date cannot be in the past';
        return '';

      case 'last_working_date':
        if (!value) return 'Last working date is required';
        if (resignation.resignation_date && value) {
          const resignDate = new Date(resignation.resignation_date);
          const lastWorkDate = new Date(value);
          if (lastWorkDate < resignDate)
            return 'Last working date must be after resignation date';
        }
        return '';

      case 'reason':
        if (!value.trim()) return 'Reason for resignation is required';
        if (value.trim().length < 10)
          return 'Please provide a detailed reason (at least 10 characters)';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setResignation({ ...resignation, [name]: value });
    // const error = validateField(name, value);
    // setErrors(prev => ({
    //   ...prev,
    //   [name]: error,
    // }));
    // if (name === 'resignation_date' && resignation.last_working_date) {
    //   const lastWorkError = validateField(
    //     'last_working_date',
    //     resignation.last_working_date
    //   );
    //   setErrors(prev => ({
    //     ...prev,
    //     last_working_date: lastWorkError,
    //   }));
    // }
  };
  const handleFieldBlur = e => {
    const { name, value } = e.target;

    // *** ADDED: Validate the field and update errors state ***
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
    if (name === 'resignation_date' && resignation.last_working_date) {
      const lastWorkError = validateField(
        'last_working_date',
        resignation.last_working_date
      );
      setErrors(prev => ({
        ...prev,
        last_working_date: lastWorkError,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        API_URL.RESIGNATION.POST_RESIGNATION,
        resignation
      );
      console.log('Response', res);
      toast.success('Resignation form submitted successfully!');
      setResignation({
        employee_name: '',
        employee_id: '',
        email: '',
        department: '',
        designation: '',
        branch: '',
        notice_period: '30',
        resignation_date: '',
        last_working_date: '',
        reason: '',
      });
      setErrors({});
    } catch (error) {
      if (error.response) {
        console.error('Server validation errors:', error.response.data.errors);
        alert(`Error: ${error.response.data.message || 'Invalid data.'}`);
      } else {
        toast.error('Posting resignation form failed', error);
      }
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    alert('Form cancelled');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Submit Resignation
            </h1>
            <p className="text-gray-600">
              Fill out the form below to submit your resignation request
            </p>
          </div>

          {/* Form Container */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <div className="flex items-center mb-8">
              <FileText className="h-6 w-6 text-gray-700 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Resignation Form
              </h2>
            </div>

            <div className="space-y-8">
              {/* Row 1: Employee Name and Employee ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Employee Name
                  </label>
                  <input
                    type="text"
                    name="employee_name"
                    placeholder="Enter your name"
                    value={resignation.employee_name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.employee_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.employee_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    placeholder="Enter your employee id"
                    value={resignation.employee_id}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.employee_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.employee_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={resignation.email}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="h-4 w-4 mr-2" />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    placeholder="Enter your department"
                    value={resignation.department}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Designation and Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter your designation"
                    value={resignation.designation}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.designation}
                    </p>
                  )}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch
                  </label>
                  <Select
                    name="branch"
                    value={resignation.branch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Main Office">Main Office</option>
                    <option value="Branch A">Branch A</option>
                    <option value="Branch B">Branch B</option>
                    <option value="Remote">Remote</option>
                  </Select>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    name="notice_period"
                    value={resignation.notice_period}
                    min={30}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.notice_period && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.notice_period}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Notice Period and Resignation Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resignation Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="resignation_date"
                      name="resignation_date"
                      value={resignation.resignation_date}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Pick a date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar
                      onClick={() =>
                        document
                          .getElementById('resignation_date')
                          .showPicker?.() ||
                        document.getElementById('resignation_date').focus()
                      }
                      className="absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer  hover:text-gray-900 transition-all duration-300 ease-in-out"
                    />
                  </div>
                  {errors.resignation_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.resignation_date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Working Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="last_working_date"
                      name="last_working_date"
                      value={resignation.last_working_date}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Pick a date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar
                      onClick={() =>
                        document
                          .getElementById('last_working_date')
                          .showPicker?.() ||
                        document.getElementById('last_working_date').focus()
                      }
                      className="absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer  hover:text-gray-900 transition-all duration-300 ease-in-out"
                    />
                  </div>
                  {errors.last_working_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.last_working_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Reason for Resignation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Resignation
                </label>
                <textarea
                  name="reason"
                  value={resignation.reason}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  placeholder="Please provide a brief reason for your resignation..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full cursor-pointer sm:w-auto px-8 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full cursor-pointer sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Submit Resignation
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        theme="light"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default ResignationForm;
