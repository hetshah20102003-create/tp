import React, { useEffect, useState } from "react";
import { fetchOrderById } from "../services/ordersAPI";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";
import { getUrl } from "aws-amplify/storage";
import MapView from "./MapView";
import { generateClient } from "aws-amplify/api";
import { updateBooking } from "../graphql/mutations";
import { buildFullAddress } from "../utils/geocodingUtils";


// Simple InfoRow Component
const InfoRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-medium text-gray-900 text-sm">{value ?? "—"}</span>
  </div>
);


// Status mapping: DB value -> UI display value
const STATUS_DB_TO_UI = {
  "confirmed": "Booking Confirmed",
  "completed": "Booking Completed",
  "cancelled": "Booking Cancelled",
};

// Status mapping: UI display value -> DB value
const STATUS_UI_TO_DB = {
  "Booking Confirmed": "booking confirmed",
  "Booking Completed": "completed",
  "Booking Cancelled": "cancelled",
};

// Centralized status model used across app (UI display values)
const ALLOWED_STATUSES = [
  "Booking Confirmed",
  "Booking Completed",
  "Booking Cancelled",
];

// Helper functions
const getDisplayStatus = (dbStatus) => {
  if (!dbStatus) return "Booking Completed";
  const normalized = dbStatus.toLowerCase();
  return STATUS_DB_TO_UI[normalized] || dbStatus;
};

const getDbStatus = (uiStatus) => {
  return STATUS_UI_TO_DB[uiStatus] || uiStatus?.toLowerCase() || "booking confirmed";
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const displayStatus = getDisplayStatus(status);
  const styleMap = {
    "Booking Confirmed": "bg-blue-100 text-blue-800 border-blue-200",
    "Booking Completed": "bg-green-100 text-green-800 border-green-200",
    "Booking Cancelled": "bg-gray-900 text-white border-gray-800",
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${styleMap[displayStatus] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {displayStatus}
    </span>
  );
};

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

const OrderDetails = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const client = generateClient();

  const changeStatus = async (newStatus) => {
    if (!order?.id || isUpdating) return;
    try {
      setIsUpdating(true);
      // Convert UI status to DB status
      const dbStatus = getDbStatus(newStatus);

      await client.graphql({
        query: updateBooking,
        variables: {
          input: {
            id: order.id,
            status: dbStatus,
          },
        },
      });

      // Update local state with DB value (will be converted to display value in UI)
      setOrder((prev) => ({ ...prev, status: dbStatus }));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to open native maps - works on Android, iOS, and desktop
  const openNativeMap = (latitude, longitude) => {
    if (!latitude || !longitude) return;

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      // iOS - try Apple Maps (will open native app if installed)
      const appleMapsUrl = `maps://maps.apple.com/?q=${latitude},${longitude}`;
      // Also provide Google Maps as alternative
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // Try Apple Maps first
      window.location.href = appleMapsUrl;

      // If Apple Maps doesn't open, provide Google Maps as fallback
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 500);
    } else if (isAndroid) {
      // Android - try Google Maps app schemes
      const googleMapsAppUrl = `google.navigation:q=${latitude},${longitude}`;
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // Try Google Maps app first (navigation mode)
      const link = document.createElement('a');
      link.href = googleMapsAppUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback chain: geo: scheme -> web
      setTimeout(() => {
        try {
          window.location.href = geoUrl;
        } catch (e) {
          window.open(googleMapsWebUrl, '_blank');
        }
      }, 300);
    } else {
      // Desktop/Web - open Google Maps in new tab
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {

        setLoading(true);

        const orderData = await fetchOrderById(orderId);

        // Normalize status to lowercase when received from DB
        const normalizedOrderData = orderData ? {
          ...orderData,
          status: orderData.status ? orderData.status.toLowerCase() : "completed"
        } : null;

        setOrder(normalizedOrderData);


        console.log("orderdata that is having in", normalizedOrderData);

        const allImages = {};

        if (normalizedOrderData?.image) {

          const { url } = await getUrl({ key: normalizedOrderData.image, options: { level: "public" } });

          allImages[normalizedOrderData.imageUrl] = url.toString();

          console.log("correctly recevied everything url here ", allImages[normalizedOrderData.imageUrl]);

        }


        if (normalizedOrderData?.orders) {

          for (const cat of normalizedOrderData.orders) {

            if (cat.imageKey) {

              const { url } = await getUrl({ key: cat.imageKey, options: { level: "public" } });

              allImages[cat.imageUrl] = url.toString();

              console.log("correctly recevied everything url here part two ", allImages[cat.imageUrl]);

            }

            // if (cat.truckSizeWiseRate) {

            //   for (const truck of cat.truckSizeWiseRate) {

            //     if (truck.imageUrl) {

            //       const { url } = await getUrl({ key: truck.imageUrl, options: { level: "public" } });

            //       allImages[truck.imageUrl] = url.toString();

            //     }

            //   }

            // }

          }

        }

        setImages(allImages);

      } catch (err) {
        console.error(err);
        setError("Using sample data - API not available");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-base">Loading order details...</span>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-12">
        <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Back to Orders
        </button>
      </div>
    );

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
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          </div>
          <div className="flex items-center">
            <StatusBadge status={order?.status} />
          </div>
        </div>

        {/* Simple Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Order ID</p>
            <p className="text-sm font-semibold text-gray-900 truncate" title={order?.id}>
              {order?.id}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Booking Name</p>
            <p className="text-sm font-semibold text-gray-900">{order?.bookingName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Labour</p>
            <p className="text-sm font-semibold text-gray-900">{order?.totalLabour || "0"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Booking Type</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{order?.bookingType || "—"}</p>
          </div>
        </div>

        {/* Amount and Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{order?.totalAmount?.toLocaleString("en-IN") || "0"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[200px] disabled:opacity-60"
              value={getDisplayStatus(order?.status) || "Booking Completed"}
              onChange={(e) => changeStatus(e.target.value)}
              disabled={isUpdating}
            >
              {ALLOWED_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="hidden sm:inline">Updating...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Map Section */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-blue-600"></i>
            Location on Map
          </h2>
          <span className="text-xs text-gray-500 hidden sm:inline">Click to open in native app</span>
        </div>
        <div
          onClick={() => openNativeMap(order?.latitude, order?.longitude)}
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
            <MapView
              latitude={order?.latitude}
              longitude={order?.longitude}
              address={buildFullAddress(
                order?.deliveryAddress,
                order?.houseNo,
                order?.floorNumber
              )}
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Image */}
          {order?.image && images[order.image] && (
            <SectionCard title="Order Image" icon="📸">
              <img
                src={images[order.image]}
                alt="Order"
                className="w-full max-w-md h-auto object-cover rounded-lg border border-gray-200"
              />
            </SectionCard>
          )}

          {/* Customer Info */}
          <SectionCard title="Customer Information" icon="👤">
            <InfoRow label="Name" value={order?.bookingName} />
            <InfoRow label="Phone" value={order?.phoneNumber} />
            {/* <InfoRow label="Service" value={order?.ServiceName} />
            <InfoRow label="Good Type" value={order?.goodType} /> */}
          </SectionCard>

          {/* Delivery Address */}
          <SectionCard title="Delivery Address" icon="📍">
            <InfoRow label="Address" value={order?.deliveryAddress} />
            <InfoRow label="House No" value={order?.houseNo} />
            <InfoRow label="Floor No" value={order?.floorNumber} />
            {/* <InfoRow label="Ground Floor" value={order?.isGroundFloor ? "Yes" : "No"} />
            <InfoRow label="List Available" value={order?.isListAvailable ? "Yes" : "No"} /> */}
          </SectionCard>

          {/* Pickup & Delivery */}
          <SectionCard title="Pickup & Delivery Schedule" icon="📅">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(order?.startDate || order?.endDate || order?.daysCount) && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 col-span-1 sm:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Schedule Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <InfoRow label="Start Date" value={order?.startDate} />
                      <InfoRow label="End Date" value={order?.endDate} />
                    </div>
                    <div>
                      <InfoRow label="Days Count" value={order?.daysCount} />
                      <InfoRow label="Time" value={order?.scheduledTime} />
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Pickup</h3>
                <InfoRow label="Date" value={order?.pickupDate} />
                <InfoRow label="Time" value={order?.pickupTime} />
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Delivery</h3>
                <InfoRow label="Date" value={order?.deliveryDate} />
                <InfoRow label="Time" value={order?.deliveryTime} />
              </div>
            </div>
          </SectionCard>

          {/* Goods & Truck */}

          {/* Labour Info */}
          <SectionCard title="Labour Information" icon="👷">
            <InfoRow label="Labour Name" value={order?.labourName} />
            <InfoRow label="Labour Phone" value={order?.labourPhoneNumber} />
            <InfoRow label="Labour ID" value={order?.labourId} />
          </SectionCard>

          {/* Ordered Services */}
          <SectionCard title="Ordered Services" icon="🛒">
            <div className="space-y-4">
              {order?.orders?.map((o, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {(o?.imageKey) && (
                        <img
                          src={images[o.imageUrl]}
                          alt={o?.description || "Service"}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{o?.category || "Unknown"}</h3>
                        <p className="text-sm text-gray-600 mb-2">{o?.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Truck Id:</span> <span className="font-semibold text-gray-900">{o?.truckId}</span></div>
                          <div><span className="text-gray-500">Truck Size:</span> <span className="font-semibold text-gray-900">{o?.truckSize}</span></div>

                          <div><span className="text-gray-500">Rate:</span> <span className="font-semibold text-gray-900">₹{o?.rate}</span></div>
                          {/* <div><span className="text-gray-500">Labour:</span> <span className="font-semibold text-gray-900">{o?.LabourCount}</span></div> */}
                          <div><span className="text-gray-500">Unit Size:</span> <span className="font-semibold text-gray-900">{o?.unitSize}</span></div>
                          <div><span className="text-gray-500">Total Qty:</span> <span className="font-semibold text-gray-900">{o?.UintQty}</span></div>
                          <div><span className="text-gray-500">Furniture Open:</span> <span className="font-semibold text-gray-900">{o?.isOpenFurniture ? "Yes" : "No"}</span></div>
                          <div><span className="text-gray-500">Total Tons:</span> <span className="font-semibold text-gray-900">{o?.maixumWight}</span></div>
                          <div><span className="text-gray-500">Service:</span> <span className="font-semibold text-gray-900">{o?.service}</span></div>
                          <div><span className="text-gray-500">Floor:</span> <span className="font-semibold text-gray-900">{o?.Floor || "—"}</span></div>
                          <div><span className="text-gray-500">Ground Floor:</span> <span className="font-semibold text-gray-900">{o?.groundFloor ? "Yes" : "No"}</span></div>
                          <div><span className="text-gray-500">Lift:</span> <span className="font-semibold text-gray-900">{o?.lift ? "Yes" : "No"}</span></div>
                        </div>
                      </div>
                    </div>
                    {/* <div className="bg-blue-600 text-white rounded-lg px-4 py-3 text-center min-w-fit">
                      <p className="text-xs text-blue-100 mb-1">Total</p>
                      <p className="text-xl font-bold">₹{o?.rate * (o?.LabourCount || 1)}</p>
                    </div> */}
                  </div>

                  {/* Ton-wise */}
                  {/* {o?.tonWiseRate?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Ton-wise Rates</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {o.tonWiseRate.map((ton, i) => (
                          <div key={i} className="bg-white rounded p-2 border text-sm flex justify-between">
                            <span className="font-medium text-gray-900">{ton.TonSize}</span>
                            <span className="font-semibold text-blue-600">₹{ton.rate}</span>
                            <span className="text-gray-500 text-xs">(Min: {ton.MinLabourCount || "N/A"})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Truck-wise */}
                  {/* {o?.truckSizeWiseRate?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Truck Size Rates</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {o.truckSizeWiseRate.map((truck, i) => (
                          <div key={i} className="bg-white rounded p-2 border text-sm flex justify-between">
                            <span className="font-medium text-gray-900">{truck.truckSize}</span>
                            <span className="font-semibold text-blue-600">₹{truck.rate}</span>
                            <span className="text-gray-500 text-xs">(Labour: {truck.LabourCount || "N/A"})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          </SectionCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial */}
          <SectionCard title="Financial Summary" icon="💰">
            {/* <InfoRow label="Commission" value={`₹${order?.commission || 0}`} /> */}
            <InfoRow label="Tax" value={`${order?.tax || 0}`} />
            <InfoRow label="Wallet Amount" value={`${order?.walletAmount || 0}`} />
            <InfoRow label="NightShift Charges" value={`${order?.nightCharges || 0}`} />
            <InfoRow label="Transport Charges" value={`${order?.transportCharges || 0}`} />
            <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{order?.totalAmount?.toLocaleString("en-IN") || "0"}</p>
            </div>
          </SectionCard>

          {/* Invoice */}
          <SectionCard title="Invoice" icon="📄">
            <button
              onClick={() => generateInvoicePDF(order)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <i className="fas fa-file-pdf"></i> Generate PDF Invoice
            </button>
          </SectionCard>

          {/* Quick Info */}
          {/* <SectionCard title="Quick Info" icon="ℹ️">
            <InfoRow label="Geo Hash" value={order?.geoHas} />
            <InfoRow label="Ton Per Labour" value={order?.orders?.[0]?.tonPerLabour} />
          </SectionCard> */}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
