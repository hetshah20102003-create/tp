import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/usersAPI";
import { deleteUserByPhone } from "../services/userOperationAPI";
import MapView from "./MapView";

// Simple InfoRow Component
const InfoRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-medium text-gray-900 text-sm">{value ?? "—"}</span>
  </div>
);

// Simple SectionCard Component
const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-base text-blue-600">{icon}</span>}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const UserDetails = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingUnloadingEnabled, setIsLoadingUnloadingEnabled] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await usersAPI.fetchUserById(userId);
        setUser(userData);
        setIsLoadingUnloadingEnabled(userData?.is_loading_unloading_enabled || false);
      } catch (err) {
        console.error(err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const handleDeleteUser = async () => {
    if (!user?.phoneNumber) {
      alert("Phone number not available");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${user.firstName || user.username}?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserByPhone(user.phoneNumber);
      alert("✅ User deleted successfully!");
      onBack();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`❌ Error: ${err.message || "Failed to delete user"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLoadingUnloading = async () => {
    try {
      const newValue = !isLoadingUnloadingEnabled;
      // Optimistic update
      setIsLoadingUnloadingEnabled(newValue);

      await usersAPI.updateUser({
        id: user.id,
        is_loading_unloading_enabled: newValue
      });

      // Update local user object too to reflect change
      setUser(prev => ({ ...prev, is_loading_unloading_enabled: newValue }));

    } catch (err) {
      console.error("Error updating loading/unloading status:", err);
      // Revert on error
      setIsLoadingUnloadingEnabled(!isLoadingUnloadingEnabled);
      alert("Failed to update status");
    }
  };

  // Function to open native maps
  const openNativeMap = (latitude, longitude) => {
    if (!latitude || !longitude) return;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      const appleMapsUrl = `maps://maps.apple.com/?q=${latitude},${longitude}`;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.location.href = appleMapsUrl;
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 500);
    } else if (isAndroid) {
      const googleMapsAppUrl = `google.navigation:q=${latitude},${longitude}`;
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      const link = document.createElement('a');
      link.href = googleMapsAppUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        try {
          window.location.href = geoUrl;
        } catch (e) {
          window.open(googleMapsWebUrl, '_blank');
        }
      }, 300);
    } else {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-base">Loading user details...</span>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-12">
        <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">User Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Back to Users
        </button>
      </div>
    );

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "N/A";
  const isActive = user.isActive === true;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <i className="fas fa-info-circle text-yellow-600"></i>
          <span className="text-yellow-700 text-sm">{error}</span>
        </div>
      )}

      {/* Simple Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
                }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Simple User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">User ID</p>
            <p className="text-sm font-semibold text-gray-900 truncate" title={user?.id}>
              {user?.id}
            </p>
          </div>
          {/* <div>
            <p className="text-xs text-gray-500 mb-1">Name</p>
            <p className="text-sm font-semibold text-gray-900">{fullName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Phone Number</p>
            <p className="text-sm font-semibold text-gray-900">{user?.phoneNumber || "—"}</p>
          </div> */}
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 pt-4 border-t border-gray-200">
          {/* <div className="grid grid-cols-2 gap-4 flex-1">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
              <p className="text-xl font-bold text-blue-600">{user?.totalTask || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Earnings</p>
              <p className="text-xl font-bold text-green-600">
                ₹{user?.totalEarnings?.toLocaleString("en-IN") || "0"}
              </p>
            </div>
          </div> */}
          {/* {user?.phoneNumber && (
            <button
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash"></i>
                  Delete User
                </>
              )}
            </button>
          )} */}
        </div>
      </div>

      {/* Map Section */}
      {user?.latitude && user?.longitude && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-blue-600"></i>
              User Location
            </h2>
            <span className="text-xs text-gray-500 hidden sm:inline">Click map to open in native app</span>
          </div>
          <div
            onClick={() => openNativeMap(user.latitude, user.longitude)}
            className="cursor-pointer relative group"
            title="Click to open in native map app"
          >
            <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 z-10 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white px-5 py-3 rounded-lg shadow-xl border-2 border-blue-300">
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                  <i className="fas fa-external-link-alt"></i>
                  Open in Maps
                </span>
              </div>
            </div>
            <div style={{ height: "400px" }}>
              <MapView latitude={user.latitude} longitude={user.longitude} />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <SectionCard title="Personal Information" icon="👤">
            <InfoRow label="First Name" value={user?.firstName} />
            <InfoRow label="Last Name" value={user?.lastName} />
            {/* <InfoRow label="Username" value={user?.username} /> */}
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone Number" value={user?.phoneNumber} />
            <InfoRow label="Languages" value={user?.languages} />
            {/* <InfoRow label="Rating" value={user?.rating} /> */}
          </SectionCard>

          {/* Account Status */}
          <SectionCard title="Account Status" icon="🔒">
            <InfoRow label="Email Verified" value={user?.isEmailVerified ? "Yes" : "No"} />
            <InfoRow label="Account Activated" value={user?.isAccountActivated ? "Yes" : "No"} />
            <InfoRow label="WhatsApp Sync" value={user?.isWhatsappSync ? "Yes" : "No"} />

            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-600 text-sm">Loading/Unloading</span>
              <button
                onClick={handleToggleLoadingUnloading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoadingUnloadingEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLoadingUnloadingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* <InfoRow label="Active Status" value={user?.isActive ? "Active" : "Inactive"} />
            <InfoRow label="Deleted" value={user?.isDeleted ? "Yes" : "No"} /> */}
          </SectionCard>

          {/* Business Information */}
          {(user?.businessName || user?.businessType || user?.businessGSTNO) && (
            <SectionCard title="Business Information" icon="🏢">
              <InfoRow label="Business Name" value={user?.businessName} />
              <InfoRow label="Business Type" value={user?.businessType} />
              <InfoRow label="GST Number" value={user?.businessGSTNO} />
            </SectionCard>
          )}

          {/* Address Information */}
          {user?.addressList && (() => {
            let parsedAddresses = null;
            try {
              parsedAddresses = typeof user.addressList === 'string'
                ? JSON.parse(user.addressList)
                : user.addressList;
            } catch (e) {
              parsedAddresses = null;
            }

            if (!parsedAddresses || typeof parsedAddresses !== 'object') {
              return null;
            }

            return (
              <SectionCard title="Address Information" icon="📍">
                <div className="space-y-4">
                  {Object.entries(parsedAddresses).map(([addressType, addressData]) => (
                    <div key={addressType} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {addressType.charAt(0).toUpperCase() + addressType.slice(1)}
                        </span>
                      </div>
                      {addressData?.address && (
                        <div className="text-sm text-gray-900">
                          {addressData.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            );
          })()}

          {/* Device Information */}
          <SectionCard title="Device Information" icon="📱">
            <InfoRow label="Device ID" value={user?.deviceId} />
            <InfoRow label="Device Name" value={user?.deviceName} />
            <InfoRow label="FCM Token" value={user?.fcmToken ? "Set" : "Not Set"} />
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <SectionCard title="Financial Summary" icon="💰">
            <InfoRow label="Balance" value={`₹${user?.balance?.toLocaleString("en-IN") || "0"}`} />
            <InfoRow label="Total Tasks" value={user?.totalTask || 0} />
            <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{user?.totalEarnings?.toLocaleString("en-IN") || "0"}
              </p>
            </div>
          </SectionCard>

          {/* Location Details */}
          {/* {(user?.latitude && user?.longitude) && (
            <SectionCard title="Location Details" icon="📍">
              <InfoRow label="Latitude" value={user.latitude?.toFixed(6)} />
              <InfoRow label="Longitude" value={user.longitude?.toFixed(6)} />
              <InfoRow label="Geohash" value={user?.geohash} />
            </SectionCard>
          )} */}

          {/* Timestamps */}
          <SectionCard title="Timestamps" icon="🕒">
            {/* <InfoRow 
              label="Created At" 
              value={user?.createdAt ? new Date(user.createdAt).toLocaleString("en-IN") : "—"} 
            />
            <InfoRow 
              label="Updated At" 
              value={user?.updatedAt ? new Date(user.updatedAt).toLocaleString("en-IN") : "—"} 
            /> */}
            <InfoRow
              label="Last Accessed"
              value={user?.lastAccessed ? new Date(user.lastAccessed).toLocaleString("en-IN") : "—"}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
