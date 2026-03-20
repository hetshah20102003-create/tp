import React from 'react';

const RefundCancellationPolicy = () => {
  const policyPoints = [
    {
      id: 1,
      text: "Cancellations made before a Gin (labour) is assigned are eligible for a 100% refund.",
      icon: "✓",
      highlight: true
    },
    {
      id: 2,
      text: "If cancelled after a Gin is assigned but before they start traveling, a 50% refund will be issued.",
      icon: "50%",
      highlight: false
    },
    {
      id: 3,
      text: "Once the Gin has reached the location or started work, no refund will be provided.",
      icon: "⚠",
      highlight: false
    },
    {
      id: 4,
      text: "If Genie cancels a booking due to unavailability or operational issues, customers will receive a full refund within 3-5 business days.",
      icon: "✓",
      highlight: true
    },
    {
      id: 5,
      text: "Refunds are processed to the original payment method; timelines depend on the bank or payment gateway.",
      icon: "💳",
      highlight: false
    },
    {
      id: 6,
      text: "Bookings under discounts or offers will be refunded after adjusting the offer value.",
      icon: "💰",
      highlight: false
    },
    {
      id: 7,
      text: "Genie reserves the right to deny refunds in cases of fraudulent activity, incorrect booking details, or customer misconduct.",
      icon: "🚫",
      highlight: false
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 relative overflow-hidden">
        <div className="w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Refund &<br className="sm:hidden" /> Cancellation Policy
          </h1>
          <p className="text-gray-300 text-center text-sm sm:text-base mt-3">
            Clear and transparent policies for your peace of mind
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="mb-6 pb-6 border-b border-gray-200 pt-6">
            {/* <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              At Genie, we understand that plans can change. Our refund and cancellation policy is designed to be fair and transparent for all parties involved. Please review the following terms carefully.
            </p> */}
          </div>

          {/* Policy Points */}
          <div className="space-y-4">
            {policyPoints.map((point, index) => (
              <div
                key={point.id}
                className={`p-4 rounded-lg border-2 ${
                  point.highlight
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold ${
                    point.highlight
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {point.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-gray-800 text-sm sm:text-base leading-relaxed ${
                      point.highlight ? "font-semibold" : ""
                    }`}>
                      {point.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-info-circle text-blue-600 text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Need Help?
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    If you have any questions about our refund and cancellation policy, please contact our customer support team. We're here to help ensure your experience with Genie is smooth and satisfactory.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 text-center pb-6">
            <p className="text-gray-500 text-xs sm:text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundCancellationPolicy;

