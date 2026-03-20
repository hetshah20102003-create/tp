import React, { useState, useEffect } from 'react';
import RefundCancellationPolicy from './RefundCancellationPolicy';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import ContactUs from './ContactUs';

const WelcomePage = ({ onProceedToLogin }) => {
  // Initialize step from URL
  const getInitialStep = () => {
    const path = window.location.pathname;
    const routeMap = {
      '/policy/terms': 0,
      '/policy/privacy': 1,
      '/policy/refund': 2,
      '/policy/contact': 3
    };
    return routeMap[path] !== undefined ? routeMap[path] : 0;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [acceptedPolicies, setAcceptedPolicies] = useState({});

  const policyPages = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      description: 'Please read and accept our Terms & Conditions to continue',
      icon: 'fas fa-file-alt',
      color: 'blue',
      component: TermsAndConditions
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Please read and accept our Privacy Policy to continue',
      icon: 'fas fa-shield-alt',
      color: 'green',
      component: PrivacyPolicy
    },
    {
      id: 'refund',
      title: 'Refund & Cancellation Policy',
      description: 'Please read and accept our Refund & Cancellation Policy to continue',
      icon: 'fas fa-file-contract',
      color: 'purple',
      component: RefundCancellationPolicy
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Review our contact information',
      icon: 'fas fa-envelope',
      color: 'orange',
      component: ContactUs
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200'
    }
  };

  // URL routing: Map policy IDs to routes
  const getRouteForStep = (step) => {
    if (step < 0 || step >= policyPages.length) return '/policy/terms';
    return `/policy/${policyPages[step].id}`;
  };

  const getStepFromRoute = () => {
    const path = window.location.pathname;
    const routeMap = {
      '/policy/terms': 0,
      '/policy/privacy': 1,
      '/policy/refund': 2,
      '/policy/contact': 3
    };
    return routeMap[path] !== undefined ? routeMap[path] : 0;
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const stepFromUrl = getStepFromRoute();
      setCurrentStep(stepFromUrl);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when step changes
  useEffect(() => {
    const route = getRouteForStep(currentStep);
    if (window.location.pathname !== route) {
      window.history.pushState({ step: currentStep }, '', route);
    }
  }, [currentStep]);

  // Ensure currentStep is always valid
  useEffect(() => {
    if (currentStep < 0 || currentStep >= policyPages.length) {
      setCurrentStep(0);
    }
  }, [currentStep, policyPages.length]);

  const handleAccept = () => {
    const currentPolicy = policyPages[currentStep];
    setAcceptedPolicies(prev => ({
      ...prev,
      [currentPolicy.id]: true
    }));

    // Move to next step or finish
    if (currentStep < policyPages.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        // Scroll to top when moving to next step
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    // Mark all as accepted (for current session only)
    const allAccepted = policyPages.reduce((acc, policy) => {
      acc[policy.id] = true;
      return acc;
    }, {});
    setAcceptedPolicies(allAccepted);
    
    // Don't save to localStorage - always show flow from start
    
    // Proceed to login
    setTimeout(() => {
      onProceedToLogin();
    }, 500);
  };

  // Check if all policies are accepted
  const allAccepted = policyPages.every(policy => acceptedPolicies[policy.id]);
  const isLastStep = currentStep === policyPages.length - 1;
  
  // Safety check: ensure currentStep is valid
  const validStep = currentStep >= 0 && currentStep < policyPages.length ? currentStep : 0;
  const currentPolicy = policyPages[validStep];
  
  // Early return if policy is undefined (shouldn't happen, but safety check)
  if (!currentPolicy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const colors = colorClasses[currentPolicy.color] || colorClasses.blue; // Fallback to blue if color not found
  const PageComponent = currentPolicy.component;
  const progress = policyPages.length > 0 ? ((validStep + 1) / policyPages.length) * 100 : 0;

  // Final completion screen
  if (allAccepted && isLastStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fas fa-check text-white text-3xl"></i>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              All Set! 🎉
            </h2>
            <p className="text-gray-600 text-lg">
              You've successfully reviewed and accepted all our policies.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {policyPages.map((policy, index) => (
                <div key={policy.id} className="text-center">
                  <div className={`${colorClasses[policy.color].light} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <i className={`${policy.icon} ${colorClasses[policy.color].text} text-xl`}></i>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {policy.title.split(' ')[0]}
                  </div>
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="
              w-full bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-bold py-4 px-8
              rounded-xl shadow-lg hover:shadow-xl
              transform hover:scale-105 transition-all duration-200
              text-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            "
          >
            <span className="flex items-center justify-center gap-2">
              <span>Continue to Login</span>
              <i className="fas fa-arrow-right"></i>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`${colors.bg} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                <i className={`${currentPolicy.icon} text-lg`}></i>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {currentPolicy.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Step {currentStep + 1} of {policyPages.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`${colors.bg} h-2.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {policyPages.map((policy, index) => {
              const isActive = index === currentStep;
              const isCompleted = acceptedPolicies[policy.id];
              const policyColors = colorClasses[policy.color];
              
              return (
                <div
                  key={policy.id}
                  className="flex items-center flex-1"
                >
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        transition-all duration-300
                        ${isCompleted
                          ? `${policyColors.bg} text-white`
                          : isActive
                          ? `${policyColors.bg} text-white ring-4 ring-offset-2 ${policyColors.bg.replace('bg-', 'ring-')}`
                          : 'bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <i className="fas fa-check text-xs"></i>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className={`text-xs mt-1 text-center ${isActive ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {policy.title.split(' ')[0]}
                    </div>
                  </div>
                  {index < policyPages.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${
                        isCompleted ? policyColors.bg : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Policy Header */}
          <div className={`${colors.light} border-b ${colors.border} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {currentPolicy.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentPolicy.description}
                </p>
              </div>
              <div className={`${colors.bg} w-12 h-12 rounded-lg flex items-center justify-center text-white hidden sm:flex`}>
                <i className={`${currentPolicy.icon} text-xl`}></i>
              </div>
            </div>
          </div>

          {/* Policy Body */}
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            <div className="p-6 policy-content-wrapper">
              <style>{`
                .policy-content-wrapper > div > div:first-child {
                  display: none !important;
                }
                .policy-content-wrapper > div {
                  min-height: auto !important;
                  background: transparent !important;
                }
                .policy-content-wrapper > div > div:last-child {
                  padding: 0 !important;
                  max-width: 100% !important;
                }
              `}</style>
              <PageComponent />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`${colors.light} border-t ${colors.border} px-6 py-4 flex items-center justify-between gap-4`}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              `}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-arrow-left"></i>
                <span className="hidden sm:inline">Previous</span>
              </span>
            </button>

            <div className="flex-1"></div>

            {!isLastStep ? (
              <button
                onClick={handleAccept}
                className={`
                  ${colors.bg} text-white font-bold py-3 px-8
                  rounded-lg shadow-lg hover:shadow-xl
                  transform hover:scale-105 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  flex items-center gap-2
                `}
              >
                <span>I Accept & Continue</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button
                onClick={handleAccept}
                className={`
                  ${colors.bg} text-white font-bold py-3 px-8
                  rounded-lg shadow-lg hover:shadow-xl
                  transform hover:scale-105 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  flex items-center gap-2
                `}
              >
                <span>Accept & Finish</span>
                <i className="fas fa-check"></i>
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <i className="fas fa-info-circle text-blue-600 text-xs"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Please read through each policy carefully before accepting. 
                You can use the Previous button to review earlier policies if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
