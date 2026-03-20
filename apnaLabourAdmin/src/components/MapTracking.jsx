import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { usersAPI } from "../services/usersAPI";
import { fetchOrders } from "../services/ordersAPI";

// Fix Leaflet's default icon path issue
delete L.Icon.Default.prototype._getIconUrl;

// Use unpkg to serve default leaflet markers if needed anywhere
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom dot markers utilizing simple HTML/CSS
const createUserIcon = () => {
    return new L.DivIcon({
        className: "custom-div-icon",
        html: "<div style='background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;'><i class='fas fa-user' style='color: white; font-size: 10px;'></i></div>",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

const createOrderIcon = () => {
    return new L.DivIcon({
        className: "custom-div-icon",
        html: "<div style='background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;'><i class='fas fa-box' style='color: white; font-size: 10px;'></i></div>",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

// Component to dynamically fit map bounds
const MapBoundsUpdater = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
            // Map padding so markers don't sit right on the edge
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);
    return null;
};

const MapTracking = () => {
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Toggles
    const [showUsers, setShowUsers] = useState(true);
    const [showOrders, setShowOrders] = useState(true);

    // Base coordinates (Mumbai fallback)
    const defaultCenter = [19.076, 72.8777];

    useEffect(() => {
        const loadData = async () => {
            // 1. Load users
            try {
                setLoadingUsers(true);
                // Fetch all users type 1 initially (or modify if other user types are needed)
                const userList = await usersAPI.fetchUsers(1);
                // Filter users who have valid coordinates
                const validUsers = userList.filter(
                    (u) =>
                        u.latitude !== null && u.latitude !== undefined &&
                        u.longitude !== null && u.longitude !== undefined &&
                        !isNaN(parseFloat(u.latitude)) && !isNaN(parseFloat(u.longitude))
                );
                setUsers(validUsers);
            } catch (err) {
                console.error("Error loading users for map:", err);
            } finally {
                setLoadingUsers(false);
            }

            // 2. Load orders
            try {
                setLoadingOrders(true);
                const orderList = await fetchOrders();
                // Filter orders holding valid latitude and longitude (either direct or pickup coordinates)
                const validOrders = orderList.filter((o) => {
                    const lat = o.latitude || o.pickupLatitudeAddress;
                    const lng = o.longitude || o.pickupLongitudeAddress;
                    return lat !== null && lat !== undefined && lng !== null && lng !== undefined &&
                        !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
                });
                setOrders(validOrders);
            } catch (err) {
                console.error("Error loading orders for map:", err);
            } finally {
                setLoadingOrders(false);
            }
        };

        loadData();
    }, []);

    // Prepare map markers
    const mapMarkers = useMemo(() => {
        const list = [];

        if (showUsers) {
            users.forEach((user) => {
                list.push({
                    id: "user-" + user.id,
                    type: "user",
                    lat: parseFloat(user.latitude),
                    lng: parseFloat(user.longitude),
                    data: user,
                    icon: createUserIcon(),
                });
            });
        }

        if (showOrders) {
            orders.forEach((order) => {
                // Fallback to pickupAddress coords if direct lat/lng is missing
                const lat = parseFloat(order.latitude || order.pickupLatitudeAddress);
                const lng = parseFloat(order.longitude || order.pickupLongitudeAddress);
                list.push({
                    id: "order-" + order.id,
                    type: "order",
                    lat,
                    lng,
                    data: order,
                    icon: createOrderIcon(),
                });
            });
        }

        return list;
    }, [users, orders, showUsers, showOrders]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-gray-50">
            {/* Header & Controls */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shrink-0 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <i className="fas fa-map-marked-alt text-blue-600"></i>
                            Live Map Tracking
                        </h1>
                        <p className="text-gray-500 mt-1">Visualize active user locations and ongoing orders in real-time</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowUsers(!showUsers)}
                            className={"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 " + (showUsers ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm" : "bg-gray-50 text-gray-500 border-2 border-gray-200 hover:bg-gray-100")}
                        >
                            <div className={"w-3 h-3 rounded-full " + (showUsers ? "bg-blue-500" : "bg-gray-400")}></div>
                            Show Users <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded-full ml-1">{users.length}</span>
                        </button>

                        <button
                            onClick={() => setShowOrders(!showOrders)}
                            className={"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 " + (showOrders ? "bg-green-50 text-green-700 border-2 border-green-200 shadow-sm" : "bg-gray-50 text-gray-500 border-2 border-gray-200 hover:bg-gray-100")}
                        >
                            <div className={"w-3 h-3 rounded-full " + (showOrders ? "bg-green-500" : "bg-gray-400")}></div>
                            Show Orders <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded-full ml-1">{orders.length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Container - takes remaining height */}
            <div className="flex-1 relative w-full h-full z-0">
                {(loadingUsers || loadingOrders) && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                        <p className="font-medium text-gray-700">Loading map data...</p>
                    </div>
                )}

                <MapContainer
                    center={defaultCenter}
                    zoom={12}
                    zoomControl={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    {/* Base map layer (Light theme similar to CartoDB Voyager) */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    <MapBoundsUpdater markers={mapMarkers} />

                    {mapMarkers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={[marker.lat, marker.lng]}
                            icon={marker.icon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[200px]">
                                    {marker.type === "user" ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {(((marker.data.firstName || "") + " " + (marker.data.lastName || "")).trim() || "User")}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: {marker.data.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-2 text-xs">
                                                {marker.data.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <i className="fas fa-phone w-4 text-center"></i>
                                                        {marker.data.phoneNumber}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (marker.data.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                        {marker.data.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <i className="fas fa-box"></i>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 truncate max-w-[150px]" title={marker.data.customer || marker.data.bookingName || "Order"}>
                                                        {marker.data.customer || marker.data.bookingName || "Order"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">{marker.data.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Service:</span>
                                                    <span className="font-medium">{marker.data.serviceName || "—"}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Labours:</span>
                                                    <span className="font-medium">{marker.data.totalLabour || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                                                    <span className="text-gray-500">Amount:</span>
                                                    <span className="font-bold text-gray-900">₹{marker.data.totalAmount || 0}</span>
                                                </div>
                                                <div className="mt-2 pt-1">
                                                    <span className={"inline-block w-full text-center px-2 py-1 rounded text-[10px] font-bold " + (
                                                        (marker.data.status || 'completed').toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                            (marker.data.status || '').toLowerCase() === 'cancelled' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                                                                'bg-blue-50 text-blue-700 border border-blue-200'
                                                    )}>
                                                        {marker.data.status || "Completed"}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Global styles for Leaflet popups to make them look modern */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px;
          line-height: 1.4;
        }
        .custom-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}} />
        </div>
    );
};

export default MapTracking;
