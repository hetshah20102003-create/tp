import React, { useState } from 'react';
import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import RefundCancellationPolicy from './RefundCancellationPolicy';
import ContactUs from './ContactUs';

const Header = () => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const policyPages = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'fas fa-file-alt',
      color: 'blue',
      component: TermsAndConditions
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'fas fa-shield-alt',
      color: 'green',
      component: PrivacyPolicy
    },
    {
      id: 'refund',
      title: 'Refund & Cancellation Policy',
      icon: 'fas fa-file-contract',
      color: 'purple',
      component: RefundCancellationPolicy
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: 'fas fa-envelope',
      color: 'orange',
      component: ContactUs
    }
  ];

  const openPolicyModal = (policy) => {
    setSelectedPolicy(policy);
    setShowPolicyModal(true);
    setShowMobileMenu(false);
  };

  const closePolicyModal = () => {
    setShowPolicyModal(false);
    setSelectedPolicy(null);
  };

  return (
    <>
      {/* Full Width Header - Enhanced Design */}
      <header className="w-full bg-gradient-to-r from-white via-blue-50/30 to-white border-b border-gray-200/60 shadow-md sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Logo - Enhanced */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group cursor-pointer">
              <div className="relative">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3">
                  <span className="text-white font-bold text-base sm:text-lg relative z-10">G</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
              </div>
              <span className="text-gray-800 font-bold text-lg sm:text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-800 transition-all duration-300">
                Genie
              </span>
            </div>

            {/* Center: Policy Links - Desktop - Simple Bottom Line on Hover */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-1 justify-center">
              {policyPages.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => openPolicyModal(policy)}
                  className="px-4 py-2.5 font-medium text-sm xl:text-base bg-transparent text-gray-700 flex items-center gap-2 relative hover:border-b-2 hover:border-gray-700"
                >
                  <i className={`${policy.icon} text-xs`}></i>
                  <span className="font-semibold">{policy.title}</span>
                </button>
              ))}
            </div>

            {/* Right: Mobile Menu Toggle - Enhanced */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="relative p-2.5 text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 group"
                aria-label="Toggle menu"
                aria-expanded={showMobileMenu}
              >
                <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl relative z-10 transform transition-transform duration-300 ${showMobileMenu ? 'rotate-90' : ''}`}></i>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown - No Hover Colors */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200/60 bg-gradient-to-b from-white to-gray-50/50 animate-slideDown overflow-hidden">
              <div className="py-4 space-y-2.5 px-2">
                {policyPages.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() => openPolicyModal(policy)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 text-sm font-semibold shadow-sm"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                      <i className={`${policy.icon} text-gray-700 text-base`}></i>
                    </div>
                    
                    {/* Text */}
                    <span className="flex-1 text-left">{policy.title}</span>
                    
                    {/* Arrow icon */}
                    <i className="fas fa-chevron-right text-gray-700 opacity-50 text-xs"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Full Screen Policy View - Simple Header with Back Arrow Only */}
      {showPolicyModal && selectedPolicy && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fadeIn">
          {/* Simple Header - Just Back Arrow */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="w-full px-4 sm:px-6 py-2 sm:py-3">
              <button
                onClick={closePolicyModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                aria-label="Back"
              >
                <i className="fas fa-arrow-left text-lg sm:text-xl"></i>
              </button>
            </div>
          </div>

          {/* Full Page Content - No Padding or Margins */}
          <div className="w-full">
            <div className="w-full policy-modal-content policy-full-width">
              <div className="prose prose-lg max-w-none m-0 p-0">
                {selectedPolicy.component && React.createElement(selectedPolicy.component)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Custom Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Smooth scrollbar for policy modal */
        .policy-modal-content::-webkit-scrollbar {
          width: 8px;
        }
        .policy-modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .policy-modal-content::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #2563eb);
          border-radius: 10px;
        }
        .policy-modal-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #1d4ed8);
        }
        
        /* Remove padding from outer containers only - Allow content padding */
        .policy-full-width > div:first-child {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          max-width: 100% !important;
        }
        .policy-full-width .max-w-4xl,
        .policy-full-width .max-w-6xl,
        .policy-full-width .max-w-7xl {
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        /* Ensure header text has minimal padding for readability only */
        .policy-full-width .bg-gradient-to-r h1,
        .policy-full-width .bg-gradient-to-r p {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
      `}</style>
    </>
  );
};

export default Header;

