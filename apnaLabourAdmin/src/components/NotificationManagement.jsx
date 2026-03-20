import React, { useState } from 'react';
import { notifyAllUsers } from '../services/notificationAPI';
import { uploadData, getUrl } from 'aws-amplify/storage';

const NotificationManagement = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageFile: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';

    if (!formData.body.trim()) newErrors.body = 'Message body is required';
    else if (formData.body.length > 500) newErrors.body = 'Message body must be less than 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = null;

      if (formData.imageFile) {
        const fileKey = `notifications/${Date.now()}_${formData.imageFile.name}`;
        console.log('📤 Uploading image to S3:', fileKey);
        
        await uploadData({
          path: fileKey,
          data: formData.imageFile,
          options: { contentType: formData.imageFile.type },
        }).result;
        
        // Get the S3 URL
        const { url } = await getUrl({ path: fileKey });
        uploadedImageUrl = url.toString();
        console.log('✅ Image uploaded, URL:', uploadedImageUrl);
      }

      const notificationData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        imageUrl: uploadedImageUrl
      };

      const response = await notifyAllUsers(notificationData);

      if (response.success) {
        setFormData({ title: '', body: '', imageFile: null });
        setPreviewUrl(null);
        alert('✅ Notification sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      alert(`❌ Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <i className="fas fa-bell text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Push Notification Management</h2>
              <p className="text-sm text-gray-500 mt-1">Send push notifications to all users</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-heading text-blue-600 text-xs"></i>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white ${
                  errors.title ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter notification title"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-xs mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-comment-alt text-blue-600 text-xs"></i>
                Message Body *
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y bg-gray-50 hover:bg-white ${
                  errors.body ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter notification message"
                maxLength={500}
              />
              {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
              <p className="text-gray-500 text-xs mt-1">{formData.body.length}/500 characters</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-image text-blue-600 text-xs"></i>
                Image (Optional)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <i className="fas fa-cloud-upload-alt text-3xl text-blue-400 mb-3"></i>
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageFile: null }));
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors shadow-md"
                      aria-label="Remove image"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
