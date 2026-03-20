import React, { useState, useEffect } from "react";

const NavItem = ({ active, label, icon, onClick }) => (
  <button
    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${active
      ? "bg-gray-100 text-gray-900"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    onClick={onClick}
  >
    <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
    <span>{label}</span>
  </button>
);

const Sidebar = ({ active, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // always open on desktop
      } else {
        setIsOpen(false); // closed by default on mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Hamburger for mobile */}
      {!isDesktop && (
        <button
          className="fixed top-4 left-4 z-50 text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(true)}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4 transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isDesktop ? "!translate-x-0" : ""}`}
      >
        {/* Close Button (mobile only) */}
        {!isDesktop && (
          <div className="flex items-center justify-end mb-4">
            <button className="text-gray-600" onClick={() => setIsOpen(false)}>
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        )}

        {/* Nav Links */}
        {/* <div className="text-xs font-semibold text-gray-400 px-2 mb-2">
          GENERAL
        </div> */}
        <div className="space-y-1">
          <NavItem
            active={active === "dashboard"}
            label="Dashboard"
            icon={<i className="fas fa-chart-line"></i>}
            onClick={() => {
              onNavigate("dashboard");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "orders"}
            label="Orders"
            icon={<i className="fas fa-receipt"></i>}
            onClick={() => {
              onNavigate("orders");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "map-tracking"}
            label="Live Tracking"
            icon={<i className="fas fa-map-marked-alt"></i>}
            onClick={() => {
              onNavigate("map-tracking");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          {/* <NavItem
            active={active === "labours"}
            label="Labour Management"
            icon={<i className="fas fa-users"></i>}
            onClick={() => {
              onNavigate("labours");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}
          {/* <NavItem
            active={active === "suggestions"}
            label="Suggestions"
            icon={<i className="fas fa-lightbulb"></i>}
            onClick={() => {
              onNavigate("suggestions");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}
          {/* <NavItem
            active={active === "categories"}
            label="Categories"
            icon={<i className="fas fa-folder"></i>}
            onClick={() => {
              onNavigate("categories");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}
          <NavItem
            active={active === "users"}
            label="Users"
            icon={<i className="fas fa-users"></i>}
            onClick={() => {
              onNavigate("users");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          {/* <NavItem
            active={active === "notifications"}
            label="Notifications"
            icon={<i className="fas fa-bell"></i>}
            onClick={() => {
              onNavigate("notifications");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}

          {/* <NavItem
            active={active === "OrderForm"}
            label="OrderForm"
            icon={<i className="fas fa-receipt"></i>}
            onClick={() => {
              onNavigate("orders-detail");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}

          <NavItem
            active={active === "business-metrics"}
            label="Business Metrics"
            icon={<i className="fas fa-layer-group"></i>}
            onClick={() => {
              onNavigate("business-metrics");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "lifecycle-funnel"}
            label="Lifecycle Funnel"
            icon={<i className="fas fa-filter"></i>}
            onClick={() => {
              onNavigate("lifecycle-funnel");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "send-notification"}
            label="Send Notification"
            icon={<i className="fas fa-paper-plane"></i>}
            onClick={() => {
              onNavigate("send-notification");
              if (!isDesktop) setIsOpen(false);
            }}
          />

          <NavItem
            active={active === "user-delete"}
            label="Delete User"
            icon={<i className="fas fa-user-times"></i>}
            onClick={() => {
              onNavigate("user-delete");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "supported-areas"}
            label="Supported Areas"
            icon={<i className="fas fa-map-marked-alt"></i>}
            onClick={() => {
              onNavigate("supported-areas");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          {/* <NavItem
            active={active === "refund-policy"}
            label="Refund Policy"
            icon={<i className="fas fa-file-contract"></i>}
            onClick={() => {
              onNavigate("refund-policy");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "privacy-policy"}
            label="Privacy Policy"
            icon={<i className="fas fa-shield-alt"></i>}
            onClick={() => {
              onNavigate("privacy-policy");
              if (!isDesktop) setIsOpen(false);
            }}
          />
          <NavItem
            active={active === "terms-and-conditions"}
            label="Terms & Conditions"
            icon={<i className="fas fa-file-alt"></i>}
            onClick={() => {
              onNavigate("terms-and-conditions");
              if (!isDesktop) setIsOpen(false);
            }}
          /> */}

        </div>

        {/* Support Section */}
        {/* <div className="mt-4 text-xs font-semibold text-gray-400 px-2 mb-2">
          SUPPORT
        </div>
        <div className="space-y-1">
          <div className="px-3 py-1 text-gray-500 text-sm">Settings</div>
        </div> */}
      </div>

      {/* Overlay (mobile only) */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
