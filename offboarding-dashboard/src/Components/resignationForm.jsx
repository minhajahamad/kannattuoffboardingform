import React, { useState, useRef } from 'react';
import { User, Building2, Calendar, FileText } from 'lucide-react';
import axiosInstance from './axios';
import { API_URL } from './api_url';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const resignationDateRef = useRef(null);
  const lastWorkingDateRef = useRef(null);

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
        if (!resignation.resignation_date) {
          return 'Please select a resignation date before choosing your last working date';
        }
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

    let filteredValue = value;

    // Restrict employee_name to letters and spaces only
    if (name === 'employee_name') {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setResignation(prev => {
      let updated = { ...prev, [name]: filteredValue };

      // If notice_period changes and resignation_date is set, recalc last working date
      if (name === 'notice_period' && prev.resignation_date) {
        const noticeDays = parseInt(value);
        if (!isNaN(noticeDays)) {
          const resignDate = new Date(prev.resignation_date);
          resignDate.setDate(resignDate.getDate() + noticeDays);
          updated.last_working_date = resignDate.toISOString().split('T')[0];
        }
      }

      return updated;
    });
  };

  const handleFieldBlur = e => {
    const { name, value } = e.target;

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

  const handleDateChange = (date, fieldName) => {
    const dateString = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(date.getDate()).padStart(2, '0')}`
      : '';

    setResignation(prev => {
      let updated = { ...prev, [fieldName]: dateString };

      // Auto-fill last working date if resignation_date is set
      if (fieldName === 'resignation_date' && prev.notice_period) {
        const noticeDays = parseInt(prev.notice_period);
        if (!isNaN(noticeDays) && date) {
          const lastDate = new Date(date);
          lastDate.setDate(lastDate.getDate() + noticeDays);
          updated.last_working_date = lastDate.toISOString().split('T')[0];
        }
      }

      return updated;
    });

    const error = validateField(fieldName, dateString);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));

    // If resignation date changes, revalidate last working date
    if (fieldName === 'resignation_date' && resignation.last_working_date) {
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

    // Validate all fields
    let newErrors = {};
    Object.keys(resignation).forEach(field => {
      const error = validateField(field, resignation[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // If there are errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please correct the errors before submitting.');
      return;
    }

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
      <style jsx>{`
        /* Custom DatePicker Styles */
        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker__input-container {
          width: 100%;
        }

        .react-datepicker__input-container input {
          width: 100% !important;
          padding: 12px 40px 12px 16px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          background-color: white !important;
          color: #111827 !important;
          font-size: 14px !important;
          transition: all 0.2s ease-in-out !important;
        }

        .react-datepicker__input-container input:focus {
          outline: none !important;
          ring: 2px !important;
          ring-color: #3b82f6 !important;
          border-color: transparent !important;
          box-shadow: 0 0 0 2px #3b82f6 !important;
        }

        .react-datepicker__input-container input::placeholder {
          color: #9ca3af !important;
        }

        /* DatePicker Popup Styles */
        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          background-color: white !important;
        }

        .react-datepicker__header {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 16px 0 !important;
        }

        .react-datepicker__current-month {
          color: #111827 !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }

        .react-datepicker__day-names {
          margin-top: 8px !important;
        }

        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }

        .react-datepicker__day {
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          color: #374151 !important;
          font-size: 14px !important;
          border-radius: 6px !important;
          transition: all 0.2s ease-in-out !important;
        }

        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }

        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .react-datepicker__day--selected:hover {
          background-color: #2563eb !important;
        }

        .react-datepicker__day--today {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
          font-weight: 600 !important;
        }

        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
        }

        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
        }

        .react-datepicker__navigation {
          top: 16px !important;
        }

        .react-datepicker__navigation--previous {
          left: 16px !important;
        }

        .react-datepicker__navigation--next {
          right: 16px !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: #6b7280 !important;
        }

        .react-datepicker__navigation:hover
          .react-datepicker__navigation-icon::before {
          border-color: #374151 !important;
        }
      `}</style>
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
                    {/* <User className="h-4 w-4 mr-2" /> */}
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    name="employee_name"
                    placeholder="Enter your name"
                    value={resignation.employee_name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
                  />
                  {errors.employee_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.employee_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    placeholder="Enter your employee id"
                    value={resignation.employee_id}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
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
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={resignation.email}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    {/* <Building2 className="h-4 w-4 mr-2" /> */}
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    placeholder="Enter your department"
                    value={resignation.department}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
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
                    Designation *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter your designation"
                    value={resignation.designation}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
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
                    Notice Period (Days) *
                  </label>
                  <input
                    type="number"
                    name="notice_period"
                    value={resignation.notice_period}
                    min={30}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    // required
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
                    Resignation Date *
                  </label>
                  <div className="relative">
                    <DatePicker
                      ref={resignationDateRef}
                      selected={
                        resignation.resignation_date
                          ? new Date(resignation.resignation_date)
                          : null
                      }
                      onChange={date =>
                        handleDateChange(date, 'resignation_date')
                      }
                      placeholderText="Select resignation date"
                      dateFormat="dd-MM-yyyy"
                      minDate={new Date()}
                      className="w-full"
                      // required
                    />
                    <Calendar
                      // onClick={() =>
                      //   document
                      //     .getElementById('resignation_date')
                      //     .showPicker?.() ||
                      //   document.getElementById('resignation_date').focus()
                      // }
                      onClick={() => resignationDateRef.current?.setOpen(true)}
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
                    <DatePicker
                      selected={
                        resignation.last_working_date
                          ? new Date(resignation.last_working_date)
                          : null
                      }
                      onChange={date =>
                        handleDateChange(date, 'last_working_date')
                      }
                      placeholderText="Select last working date"
                      dateFormat="dd-MM-yyyy"
                      minDate={
                        resignation.resignation_date
                          ? new Date(resignation.resignation_date)
                          : new Date()
                      }
                      className="w-full"
                      readOnly // <-- Optional: prevents manual change
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
                  Reason for Resignation *
                </label>
                <textarea
                  name="reason"
                  value={resignation.reason}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  placeholder="Please provide a brief reason for your resignation..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  // required
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
