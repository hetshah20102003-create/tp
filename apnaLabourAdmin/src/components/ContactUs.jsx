import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactInfo = [
    {
      id: 1,
      label: 'Name',
      icon: 'fas fa-user',
      iconColor: 'text-green-500',
      value: 'QUICK APNA LABOUR PRIVATE LIMITED',
      subValue: null
    },
    {
      id: 2,
      label: 'Address',
      icon: 'fas fa-map-marker-alt',
      iconColor: 'text-pink-500',
      value: 'SATVA APARTMENT',
      subValue: 'Fatehpura, Ranna Park, Paldi, Ahmedabad, Gujarat 380007'
    },
    {
      id: 3,
      label: 'Phone',
      icon: 'fas fa-phone',
      iconColor: 'text-pink-500',
      value: '+919512885353',
      subValue: null
    },
    {
      id: 4,
      label: 'Email',
      icon: 'fas fa-envelope',
      iconColor: 'text-blue-500',
      value: 'apnalabour@gmail.com',
      subValue: null
    },
    {
      id: 5,
      label: 'Hours',
      icon: 'fas fa-clock',
      iconColor: 'text-orange-500',
      value: 'Monday–Sunday: 9:00 AM – 6:00 PM',
      subValue: null
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1000);
  };

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 relative overflow-hidden">
        <div className="w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Contact Us
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
           <div className="mb-6 pt-6">
         {/* <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            We'd love to hear from you! Please reach out using the form below or through any of the following ways:
          </p> */}
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
            
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.id} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center ${info.iconColor}`}>
                    <i className={`${info.icon} text-lg sm:text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                      {info.label}:
                    </div>
                    <div className="text-gray-700 text-sm sm:text-base">
                      {info.value && (
                        <div className="font-semibold text-gray-900">{info.value}</div>
                      )}
                      {info.subValue && (
                        <div className="text-gray-600 mt-1">{info.subValue}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <i className="fas fa-check-circle text-green-600"></i>
                <span className="text-green-700 text-sm">Thank you! Your message has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
