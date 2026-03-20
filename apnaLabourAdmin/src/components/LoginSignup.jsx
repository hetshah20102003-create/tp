import React, { useState } from 'react';
import AmplifyAuthService from '../services/amplifyAuth';
import Header from './Header';

const LoginSignup = ({ onAuthSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await AmplifyAuthService.signIn({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        setSuccessMessage(result.message);
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(result.user);
        }
      } else {
        setErrorMessage(result.error);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full max-w-md bg-white rounded-lg sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">

          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-wide">Genie</h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm">Welcome back! Please sign in.</p>
          </div>

          {successMessage && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-xs sm:text-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 text-white py-2.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>

            <div className="text-center pt-2 border-t border-gray-200 mt-3">
              <a
                href="/user-delete"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/user-delete');
                  window.location.reload();
                }}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
              >
                <i className="fas fa-user-times"></i>
                <span>Delete User Account</span>
              </a>
            </div>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Genie. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
