import React from 'react';

const TermsAndConditions = () => {
  const sections = [
    {
      id: 1,
      title: "Definitions",
      content: "\"Customer\" refers to any individual or business booking services on the Apna Labour App. \"Worker Partner\" refers to the labourer(s) assigned to the booking. \"Platform\" refers to the Apna Labour App and related services. \"Booking\" refers to a confirmed request for services."
    },
    {
      id: 2,
      title: "Company and Services",
      content: "Apna Labour Private Limited (\"Apna Labour\") provides on-demand, verified loading/unloading and daily-wage labour services (excluding construction, tile, and agricultural work) through its digital platform (\"Apna Labour App\")."
    },
    {
      id: 3,
      title: "Agreement to Terms",
      content: "By booking services, clients (\"Customer\") accept these Terms and Conditions. If unwilling, Customers should uninstall the App and stop using Apna Labour services. Each booking confirms acceptance. Apna Labour may update these Terms anytime. Continued use implies acceptance."
    },
    {
      id: 4,
      title: "Service Availability & Timing",
      content: "Services depend on worker availability and may vary by location. Time slots are indicative only and not guaranteed. Delays may occur due to traffic, demand, or unforeseen issues."
    },
    {
      id: 5,
      title: "Verification & Background Checks",
      content: "All workers are verified via identity, address, and where applicable, police checks. Apna Labour does not guarantee behaviour beyond verification and onboarding processes."
    },
    {
      id: 6,
      title: "Customer Responsibilities",
      type: "list",
      items: [
        "Declare accurate details of the task (nature, hours, location).",
        "Provide a safe and lawful working environment.",
        "Not engage workers in restricted or unlawful activities.",
        "Indemnify Apna Labour against any claims from unsafe or illegal tasks."
      ]
    },
    {
      id: 7,
      title: "Worker Responsibilities",
      type: "list",
      items: [
        "Perform only the work booked.",
        "Follow lawful instructions.",
        "Maintain professional conduct.",
        "Avoid alcohol, drugs, or misconduct during services.",
        "Additional tasks require new bookings."
      ]
    },
    {
      id: 8,
      title: "Insurance & Risk Allocation",
      content: "Apna Labour is a facilitator and not the direct employer. Customers bear the risks of workplace accidents unless separately covered by insurance. Customers are encouraged to obtain task-specific insurance."
    },
    {
      id: 9,
      title: "Payment, Pricing & Invoices",
      type: "list",
      items: [
        "Payment must match the invoice shown in the App.",
        "Cash-on-completion payments made to the worker partner are deemed payment to Apna Labour.",
        "Non-payment may result in suspension or legal action.",
        "Pricing may include surcharges (night shifts, urgent bookings, festival periods).",
        "All pricing is subject to applicable GST regulations."
      ]
    },
    {
      id: 10,
      title: "Cancellation",
      content: "Cancellations after worker allocation may attract cancellation fees. Cancellation policies are visible in-app at the time of booking."
    },
    {
      id: 11,
      title: "Liability and Claims",
      content: "Claims must be raised within 24 hours of service completion. Apna Labour's liability is limited to the service fee of the booking. Indirect or consequential losses (lost profits, delays) are not covered."
    },
    {
      id: 12,
      title: "Safety and Restrictions",
      content: "Workers cannot be used for:",
      type: "list",
      items: [
        "Construction, agricultural, or tile work.",
        "Hazardous activities involving explosives, flammables, or narcotics.",
        "Any unlawful activity under Indian law."
      ],
      additionalContent: "Clients must provide necessary safety gear for risky tasks."
    },
    {
      id: 13,
      title: "Confidentiality & Data Privacy",
      content: "Customer and Worker data (e.g., KYC, contact details, feedback) is collected and stored for service delivery, compliance, and improvement. Apna Labour does not sell personal data to third parties."
    },
    {
      id: 14,
      title: "Refund Policy",
      content: "Refunds apply only if service is not provided and no replacement worker is available. Refunds are processed within 7–10 working days."
    },
    {
      id: 15,
      title: "Force Majeure",
      content: "Apna Labour shall not be held liable for service failures due to events beyond its control, including strikes, pandemics, government orders, natural disasters, or accidents."
    },
    {
      id: 16,
      title: "Blocking of Access & Termination",
      content: "Apna Labour may suspend or terminate accounts in cases of misuse, fraud, harassment, non-payment, or breach of these Terms. Appeals for reinstatement may be reviewed at Apna Labour's discretion."
    },
    {
      id: 17,
      title: "Dispute Escalation Process",
      content: "Disputes will follow a 3-tier process:",
      type: "numbered",
      items: [
        "Customer Support",
        "Grievance Officer",
        "Mediation/Arbitration before legal action."
      ]
    },
    {
      id: 18,
      title: "Governing Language",
      content: "These Terms are available in English, Hindi, and Gujarati. In case of conflict, the English version prevails."
    },
    {
      id: 19,
      title: "Governing Law and Dispute Resolution",
      content: "These Terms are governed by Indian law. Disputes fall under Ahmedabad jurisdiction. Parties must attempt amicable resolution within 30 days before pursuing legal remedies."
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 relative overflow-hidden">
        <div className="w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Terms and Conditions
          </h1>
          <p className="text-gray-300 text-center text-sm sm:text-base mt-3">
            Please read these terms carefully
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Terms Sections */}
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

                <div className="ml-11 space-y-3">
                  {section.content && !section.type && (
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {section.content}
                    </p>
                  )}

                  {section.type === "list" && (
                    <div className="space-y-2">
                      {section.content && (
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                          {section.content}
                        </p>
                      )}
                      {section.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === "numbered" && (
                    <div className="space-y-2">
                      {section.content && (
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                          {section.content}
                        </p>
                      )}
                      {section.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.additionalContent && (
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mt-2">
                      {section.additionalContent}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-5 sm:p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-info-circle text-blue-600 text-sm"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Questions About Terms?
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    If you have any questions or concerns about these Terms and Conditions, please contact our Customer Support or Grievance Officer using the details provided in the Contact Us page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Notice */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-5 sm:p-6 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-yellow-600 text-sm"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Acceptance of Terms
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  By using the Apna Labour App and booking services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please uninstall the App and discontinue use of our services.
                </p>
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

export default TermsAndConditions;

