import React, { useState } from 'react';
import { deleteUserByPhone } from '../services/userOperationAPI';

const UserDelete = ({ onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to home/login page
      window.history.pushState({}, '', '/');
      window.location.reload();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const data = await deleteUserByPhone(phoneNumber);
      setResult(data);
      setPhoneNumber(''); // Clear form on success
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Network error. Please check your API endpoint configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delete User</h1>
            <p className="text-sm text-gray-600 mt-1">
              Enter a phone number to soft delete a user
            </p>
          </div>
          {onBack && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              title="Back"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number Input */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+919512885353"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50 hover:bg-white text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Enter the phone number of the user you want to delete
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result && result.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-green-600 mt-0.5"></i>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">User Deleted Successfully</h3>
                    {result.user && (
                      <div className="bg-white rounded-lg p-4 mt-2 space-y-2 text-sm border border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">ID:</span>
                          <span className="text-gray-900">{result.user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span className="text-gray-900">{result.user.phoneNumber}</span>
                        </div>
                        {result.user.email && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Email:</span>
                            <span className="text-gray-900">{result.user.email}</span>
                          </div>
                        )}
                        {result.user.firstName && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Name:</span>
                            <span className="text-gray-900">{result.user.firstName} {result.user.lastName}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Deleted
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <button
                type="submit"
                disabled={isSubmitting || !phoneNumber.trim()}
                className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting User...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Delete User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default UserDelete;

