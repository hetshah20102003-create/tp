import React from 'react';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 1,
      title: "Introduction",
      content: "Apna Labour Private Limited (\"Apna Labour\") values the privacy of its Customers and Worker Partners. This Privacy Policy explains how we collect, use, share, and protect your information when you use the Apna Labour App and related services."
    },
    {
      id: 2,
      title: "Information We Collect",
      type: "list",
      items: [
        "Personal Information: Name, mobile number, email, address.",
        "Business Information (if applicable): GSTIN, PAN, company details.",
        "Booking Information: Nature of work, hours booked, location.",
        "Payment Data: Payment method, invoices, refunds.",
        "Location Data: Live GPS for service allocation.",
        "Device/Usage Data: App usage patterns, preferences, feedback."
      ]
    },
    {
      id: 3,
      title: "How We Use Your Information",
      type: "list",
      items: [
        "To process and complete bookings.",
        "To match Customers with verified Worker Partners.",
        "To ensure safety, verification, and fraud prevention.",
        "To send updates, offers, and notifications.",
        "To comply with applicable legal and tax obligations."
      ]
    },
    {
      id: 4,
      title: "Sharing of Information",
      type: "list",
      items: [
        "With Worker Partners to enable service delivery.",
        "With payment processors and financial institutions.",
        "With affiliates/partners for promotions and analytics.",
        "With government or regulatory authorities if required by law."
      ]
    },
    {
      id: 5,
      title: "Data Security",
      content: "We use reasonable technical and organizational measures (encryption, restricted access) to protect your data. However, no system is fully secure, and we cannot guarantee absolute protection."
    },
    {
      id: 6,
      title: "Your Rights",
      type: "list",
      items: [
        "You may access and update your personal information via the App.",
        "You may withdraw consent by deleting your account and uninstalling the App.",
        "You may opt-out of marketing communications anytime."
      ]
    },
    {
      id: 7,
      title: "Cookies & Tracking",
      content: "The App may use cookies, trackers, and analytics to improve service quality and personalize experience."
    },
    {
      id: 8,
      title: "Grievance Redressal",
      content: "As per Indian IT Act and Consumer Protection (E-commerce) Rules, our Grievance Officer is:",
      type: "grievance",
      grievanceDetails: {
        name: "QUICK APNA LABOUR PRIVATE LIMITED",
        email: "apnalabour@gmail.com",
        phone: "+919512885353",
        address: "SATVA APARTMENT, Fatehpura, Ranna Park, Paldi, Ahmedabad, Gujarat 380007",
        availability: "Monday to Friday, 9:00 AM – 6:00 PM"
      }
    },
    {
      id: 9,
      title: "Updates to Policy",
      content: "We may revise this Privacy Policy from time to time. Updates will be published in the App/Website, and continued use will be considered as acceptance."
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 relative overflow-hidden">
        <div className="w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-center text-sm sm:text-base mt-3">
            Your privacy matters to us
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Policy Sections */}
          <div className="space-y-6 py-6">
            {sections.map((section) => (
              <div key={section.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {section.id}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1">
                    {section.title}
                  </h2>
                </div>

                {section.type === "list" ? (
                  <div className="ml-11 space-y-2">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : section.type === "grievance" ? (
                  <div className="ml-11 space-y-4">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {section.content}
                    </p>
                    <div className="bg-blue-50 rounded-lg p-5 sm:p-6 border border-blue-200">
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Name:</span>
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">{section.grievanceDetails.name}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Email:</span>
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">{section.grievanceDetails.email}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Phone:</span>
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">{section.grievanceDetails.phone}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Office Address:</span>
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">{section.grievanceDetails.address}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Availability:</span>
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">{section.grievanceDetails.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-11">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                )}
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
                    Questions About Privacy?
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Grievance Officer using the details provided in Section 8.
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

export default PrivacyPolicy;

