import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';

const SuperAdminPortal = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    
    // Section 2: Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    
    // Section 3: Employment Details
    position: 'Real Estate Agent',
    department: 'Sales',
    startDate: '',
    employmentType: 'Full-time',
    
    // Section 4: Compensation
    salary: '',
    paymentMethod: 'Bank Transfer',
    
    // Section 5: Benefits
    healthInsurance: false,
    lifeInsurance: false,
    retirement: false,
    paidLeave: false,
    
    // Section 6: Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Section 7: Account Setup
    generatePassword: true,
    manualPassword: '',
    manualPasswordConfirm: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    validateField(name, type === 'checkbox' ? ((e.target as HTMLInputElement).checked ? 'true' : 'false') : value);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateField = (name: string, value: string) => {
    let message = '';
    if (name === 'firstName' || name === 'lastName') {
      if (!value || value.trim().length < 2) message = 'Required, min 2 characters';
    }
    if (name === 'dateOfBirth') {
      if (!value) message = 'Birthdate is required';
      else {
        const dob = new Date(value);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
        if (dob > minAgeDate) message = 'Must be at least 18 years old';
      }
    }
    if (name === 'gender') {
      if (!value) message = 'Gender is required';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) message = 'Invalid email format';
    }
    if (name === 'phone') {
      const phoneRegex = /^(09|\+639)\d{9}$/;
      const clean = value.replace(/[-\s]/g, '');
      if (!phoneRegex.test(clean)) message = 'Invalid Philippine phone format';
    }
    if (name === 'address') {
      if (!value || value.trim().length < 5) message = 'Address is required';
    }
    if (name === 'city') {
      if (!value) message = 'City is required';
    }
    if (name === 'position' || name === 'department') {
      if (!value) message = 'Required';
    }
    if (name === 'startDate') {
      if (!value) message = 'Start date is required';
    }
    if (name === 'salary') {
      const num = Number(value);
      if (isNaN(num) || num <= 0) message = 'Enter a valid positive amount';
    }
    if (name === 'paymentMethod') {
      if (!value) message = 'Payment method is required';
    }
    if (name === 'emergencyName' || name === 'emergencyRelationship') {
      if (!value) message = 'Required';
    }
    if (name === 'emergencyPhone') {
      const phoneRegex = /^(09|\+639)\d{9}$/;
      const clean = value.replace(/[-\s]/g, '');
      if (!phoneRegex.test(clean)) message = 'Invalid Philippine phone format';
    }
    if (name === 'manualPassword' || name === 'manualPasswordConfirm') {
      if (!formData.generatePassword) {
        const pw = name === 'manualPassword' ? value : formData.manualPassword;
        const confirm = name === 'manualPasswordConfirm' ? value : formData.manualPasswordConfirm;
        const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\\-]{8,}$/;
        if (!strong.test(pw)) message = 'Min 8 chars, include letters and numbers';
        else if (confirm && pw !== confirm) message = 'Passwords do not match';
      }
    }
    setErrors(prev => ({ ...prev, [name]: message }));
    return message === '';
  };

  const validateSection = (section: number) => {
    const fieldsBySection: Record<number, string[]> = {
      1: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
      2: ['email', 'phone', 'address', 'city'],
      3: ['position', 'department', 'startDate'],
      4: ['salary', 'paymentMethod'],
      5: [],
      6: ['emergencyName', 'emergencyRelationship', 'emergencyPhone'],
      7: formData.generatePassword ? [] : ['manualPassword', 'manualPasswordConfirm']
    };
    const fields = fieldsBySection[section] || [];
    let valid = true;
    for (const f of fields) {
      const v = (formData as any)[f] as string;
      const ok = validateField(f, v || '');
      if (!ok) valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSection(7)) return;
    const password = formData.generatePassword ? generateRandomPassword() : formData.manualPassword;
    const fullName = `${formData.firstName} ${formData.lastName}`;
    const email = formData.email;

    const benefits = [];
    if (formData.healthInsurance) benefits.push('Health Insurance');
    if (formData.lifeInsurance) benefits.push('Life Insurance');
    if (formData.retirement) benefits.push('Retirement Plan');
    if (formData.paidLeave) benefits.push('Paid Leave');

    try {
      await usersAPI.create({
        name: fullName,
        email: email,
        password: password,
        phone: formData.phone,
        employmentData: {
          position: formData.position,
          department: formData.department,
          startDate: formData.startDate,
          salary: parseFloat(formData.salary),
          benefits: benefits,
          emergencyContact: {
            name: formData.emergencyName,
            relationship: formData.emergencyRelationship,
            phone: formData.emergencyPhone
          }
        },
        createdBy: 'Admin'
      });

      setCredentials({ email, password });
      setShowSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? (error.response.data as { error: string }).error
        : 'Failed to create agent account';
      alert(errorMessage);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 1: Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name *"
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && <div className="text-red-600 text-xs">{errors.firstName}</div>}
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name *"
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && <div className="text-red-600 text-xs">{errors.lastName}</div>}
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Middle Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateOfBirth && <div className="text-red-600 text-xs">{errors.dateOfBirth}</div>}
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <div className="text-red-600 text-xs">{errors.gender}</div>}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 2: Contact Information</h3>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <div className="text-red-600 text-xs">{errors.email}</div>}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <div className="text-red-600 text-xs">{errors.phone}</div>}
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.address && <div className="text-red-600 text-xs">{errors.address}</div>}
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.city && <div className="text-red-600 text-xs">{errors.city}</div>}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 3: Employment Details</h3>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Position *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.position && <div className="text-red-600 text-xs">{errors.position}</div>}
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Department *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.department && <div className="text-red-600 text-xs">{errors.department}</div>}
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              placeholder="Start Date *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.startDate && <div className="text-red-600 text-xs">{errors.startDate}</div>}
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 4: Compensation</h3>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Monthly Salary (PHP) *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.salary && <div className="text-red-600 text-xs">{errors.salary}</div>}
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
            </select>
            {errors.paymentMethod && <div className="text-red-600 text-xs">{errors.paymentMethod}</div>}
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 5: Benefits</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="healthInsurance"
                checked={formData.healthInsurance}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Health Insurance</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="lifeInsurance"
                checked={formData.lifeInsurance}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Life Insurance</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="retirement"
                checked={formData.retirement}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Retirement Plan</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="paidLeave"
                checked={formData.paidLeave}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Paid Leave</span>
            </label>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 6: Emergency Contact</h3>
            <input
              type="text"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleInputChange}
              placeholder="Emergency Contact Name *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.emergencyName && <div className="text-red-600 text-xs">{errors.emergencyName}</div>}
            <input
              type="text"
              name="emergencyRelationship"
              value={formData.emergencyRelationship}
              onChange={handleInputChange}
              placeholder="Relationship *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.emergencyRelationship && <div className="text-red-600 text-xs">{errors.emergencyRelationship}</div>}
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              placeholder="Emergency Phone Number *"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.emergencyPhone && <div className="text-red-600 text-xs">{errors.emergencyPhone}</div>}
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Section 7: Review & Submit</h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-2 text-sm">
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Position:</strong> {formData.position}</p>
              <p><strong>Department:</strong> {formData.department}</p>
              <p><strong>Start Date:</strong> {formData.startDate}</p>
              <p><strong>Salary:</strong> ₱{formData.salary ? parseFloat(formData.salary).toLocaleString() : '0'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {formData.generatePassword ? 'A secure password will be generated.' : 'Use custom password.'}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!formData.generatePassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, generatePassword: !e.target.checked }))}
                  />
                  <span>Set custom password</span>
                </label>
              </div>
              {!formData.generatePassword && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <input
                    type="password"
                    name="manualPassword"
                    value={formData.manualPassword}
                    onChange={handleInputChange}
                    placeholder="Password *"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    name="manualPasswordConfirm"
                    value={formData.manualPasswordConfirm}
                    onChange={handleInputChange}
                    placeholder="Confirm Password *"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {(errors.manualPassword || errors.manualPasswordConfirm) && (
                    <div className="col-span-2 text-red-600 text-xs">
                      {errors.manualPassword || errors.manualPasswordConfirm}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Agent Account Created!</h2>
            <p className="text-gray-600">The new agent has been successfully registered.</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">Login Credentials:</p>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-mono font-semibold">{credentials.email}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono font-semibold">{credentials.password}</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-6 text-center">
            ⚠️ Please save these credentials and share them securely with the agent.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/agents')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              View Agents
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                setCurrentSection(1);
                setFormData({
                  firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '',
                  email: '', phone: '', address: '', city: '',
                  position: 'Real Estate Agent', department: 'Sales', startDate: '', employmentType: 'Full-time',
                  salary: '', paymentMethod: 'Bank Transfer',
                  healthInsurance: false, lifeInsurance: false, retirement: false, paidLeave: false,
                  emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
                    generatePassword: true,
                    manualPassword: '',
                    manualPasswordConfirm: ''
                });
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-white hover:underline mb-4 flex items-center"
            >
              ← Back to Admin Portal
            </button>
            <h1 className="text-3xl font-bold text-white">HR Portal - Agent Registration</h1>
            <p className="text-blue-100 mt-2">Complete all 7 sections to register a new agent</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((section) => (
                <div
                  key={section}
                  className={`flex-1 h-2 mx-1 rounded-full ${
                    section <= currentSection ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Section {currentSection} of 7
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {renderSection()}

            <div className="flex gap-4 mt-8">
              {currentSection > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentSection(s => s - 1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  ← Previous
                </button>
              )}
              
              {currentSection < 7 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(s => s + 1);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Create Agent Account
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPortal;
