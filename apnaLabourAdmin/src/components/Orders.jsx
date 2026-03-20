import React, { useEffect, useMemo, useState } from "react";
import { fetchOrders } from "../services/ordersAPI";
import * as XLSX from "xlsx";

// Status mapping: DB value -> UI display value
const STATUS_DB_TO_UI = {
  "completed": "Booking Completed",
  "cancelled": "Booking Cancelled",
};

// Helper function to get display status from DB status
const getDisplayStatus = (dbStatus) => {
  if (!dbStatus) return "Booking Completed";
  const normalized = dbStatus.toLowerCase();
  return STATUS_DB_TO_UI[normalized] || dbStatus;
};

// Helper function to normalize status for comparison (handles both DB and UI values)
const normalizeStatus = (status) => {
  if (!status) return null;
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "booking completed") return "Booking Completed";
  if (normalized === "cancelled" || normalized === "booking cancelled") return "Booking Cancelled";
  return status;
};

const Orders = ({ onViewOrderDetails }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState("all"); // "all", "helper", "other"

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchOrders();
        // Normalize status to lowercase when received from DB
        const normalizedList = list.map(order => ({
          ...order,
          status: order.status ? order.status.toLowerCase() : "completed"
        }));

        // Sort by createdAt descending (newest first)
        normalizedList.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        if (mounted) setOrders(normalizedList);
      } catch (e) {
        console.error("Error loading orders:", e);
        if (mounted) setError("Using sample data - API not available");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Helper to check if an order passes the Status filter
  const passStatusFilter = (o, currentStatus) => {
    const orderStatusLower = (o.status || "completed").toLowerCase();
    return currentStatus === "all" ? true :
      (currentStatus === "Booking Completed" && orderStatusLower === "completed") ||
      (currentStatus === "Booking Cancelled" && orderStatusLower === "cancelled");
  };

  // Helper to check if an order passes the Order Type filter
  const passTypeFilter = (o, currentType) => {
    if (currentType === "all") return true;
    const orderItems = o.orders || [];
    const hasHelper = orderItems.some(item =>
      item.truckSize && item.truckSize.toLowerCase() === "helper"
    );
    if (currentType === "helper") return hasHelper;
    if (currentType === "other") return !hasHelper;
    return true;
  };

  // Base filtered list (respects Date + Search ONLY)
  const baseFiltered = useMemo(() => {
    return orders.filter((o) => {
      // Get order date
      const orderDate = o.date || o.createdAt;
      const orderDateObj = orderDate ? new Date(orderDate) : null;

      let passFrom = true;
      let passTo = true;

      if (from && orderDateObj) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        const orderDateStart = new Date(orderDateObj);
        orderDateStart.setHours(0, 0, 0, 0);
        passFrom = orderDateStart >= fromDate;
      }

      if (to && orderDateObj) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // End of day
        passTo = orderDateObj <= toDate;
      }

      const q = query.trim().toLowerCase();
      const passQuery = q
        ? (`${o.id}${o.type || o.serviceName}${o.customer || ''}${o.bookingName || ''}`).toLowerCase().includes(q)
        : true;

      return passFrom && passTo && passQuery;
    });
  }, [orders, from, to, query]);

  // Fully filtered list for the table (respects ALL filters)
  const filtered = useMemo(() => {
    return baseFiltered.filter(o =>
      passStatusFilter(o, status) && passTypeFilter(o, orderType)
    );
  }, [baseFiltered, status, orderType]);

  // Compute order counts by status (respects Date/Search/Type, ignores Status filter)
  const statusCounts = useMemo(() => {
    const counts = { "Booking Completed": 0, "Booking Cancelled": 0 };
    // Filter by everything EXCEPT status
    const relevantOrders = baseFiltered.filter(o => passTypeFilter(o, orderType));

    relevantOrders.forEach((o) => {
      const statusLower = (o.status || "completed").toLowerCase();
      if (statusLower === "completed") counts["Booking Completed"]++;
      else if (statusLower === "cancelled") counts["Booking Cancelled"]++;
    });
    return counts;
  }, [baseFiltered, orderType]);

  // Compute order type counts (respects Date/Search/Status, ignores Type filter)
  const orderTypeCounts = useMemo(() => {
    const counts = { helper: 0, other: 0 };
    // Filter by everything EXCEPT order type
    const relevantOrders = baseFiltered.filter(o => passStatusFilter(o, status));

    relevantOrders.forEach((o) => {
      const isHelper = passTypeFilter(o, "helper");
      if (isHelper) counts.helper++;
      else counts.other++;
    });
    return counts;
  }, [baseFiltered, status]);

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setStatus("all");
    setQuery("");
    setOrderType("all");
  };

  // Helper: build Excel rows for a given list of orders
  const buildExcelRows = (orderList) => {
    const excelData = [];
    orderList.forEach((o) => {
      const orderItems = o.orders || [];
      const baseRow = {
        "Order ID": o.id,
        "Booking Code": o.bookingCode || "-",
        "Customer Name": o.customer || o.bookingName || "-",
        "Phone Number": o.phoneNumber || "-",
        "Service Name": o.serviceName || "-",
        "Booking Type": o.bookingType || "-",
        "Good Type": o.goodType || "-",
        "Order Date": o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
        "Pickup Date": o.pickupDate || "-",
        "Pickup Time": o.pickupTime || "-",
        "Delivery Date": o.deliveryDate || "-",
        "Delivery Time": o.deliveryTime || "-",
        "Start Date": o.startDate || "-",
        "End Date": o.endDate || "-",
        "Days Count": o.daysCount || "-",
        "Delivery Address": o.deliveryAddress || "-",
        "Is Ground Floor": o.isGroundFloor ? "Yes" : "No",
        "Floor Number": o.floorNumber != null ? o.floorNumber : "-",
        "Total Labour": o.totalLabour || 0,
        "Weight Per Unit": o.weightPerUnit || "-",
        "No Of Units": o.noOfUnits || 0,
        "Goods Weight (kg)": o.goodsWeight || 0,
        "Transport Charges": o.transportCharges || 0,
        "Tax": o.tax || 0,
        "Wallet Amount Used": o.walletAmount || 0,
        "Commission": o.commission || 0,
        "Total Amount (₹)": o.totalAmount || 0,
        "Payment Type": o.paymentType || "-",
        "Labour Name": o.labourName || "-",
        "Labour Phone": o.labourPhoneNumber || "-",
        "Status": getDisplayStatus(o.status),
        "Cancel Reason": o.cancelReason || "-",
      };
      if (orderItems.length > 0) {
        excelData.push({
          ...baseRow,
          "Item #": orderItems.length > 1 ? `1 - ${orderItems.length}` : "1",
          "Item Category": orderItems.map(item => item.category || "-").join(", "),
          "Item Name": orderItems.map(item => item.name || "-").join(", "),
          "Item Order Details": orderItems.map(item => item.orderDetails || "-").join(" | "),
          "Item Truck Size": orderItems.map(item => item.truckSize || "-").join(", "),
          "Item Labour Count": orderItems.map(item => item.totalLabour || "-").join(", "),
        });
      } else {
        excelData.push({
          ...baseRow,
          "Item #": "-",
          "Item Category": "-",
          "Item Name": "-",
          "Item Order Details": "-",
          "Item Truck Size": Array.isArray(o.truckType) ? o.truckType.join(", ") : (o.truckType || "-"),
          "Item Labour Count": "-",
        });
      }
    });
    return excelData;
  };

  // Download Helper orders Excel (truckSize === 'helper')
  const downloadHelperExcel = () => {
    const helperOrders = baseFiltered.filter(o => passStatusFilter(o, status) && passTypeFilter(o, "helper"));
    const excelData = buildExcelRows(helperOrders);
    if (excelData.length === 0) { alert("No Helper orders found to download."); return; }
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Helper Orders");
    const dateStr = new Date().toISOString().split('T')[0];
    const statusLabel = status === "all" ? "All" : status === "Booking Completed" ? "Completed" : "Cancelled";
    XLSX.writeFile(wb, `Helper_Orders_${statusLabel}_${dateStr}.xlsx`);
  };

  // Download Other orders Excel (no helper truckSize)
  const downloadOtherExcel = () => {
    const otherOrders = baseFiltered.filter(o => passStatusFilter(o, status) && passTypeFilter(o, "other"));
    const excelData = buildExcelRows(otherOrders);
    if (excelData.length === 0) { alert("No Other orders found to download."); return; }
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Other Orders");
    const dateStr = new Date().toISOString().split('T')[0];
    const statusLabel = status === "all" ? "All" : status === "Booking Completed" ? "Completed" : "Cancelled";
    XLSX.writeFile(wb, `Other_Orders_${statusLabel}_${dateStr}.xlsx`);
  };

  // Download ALL orders Excel (all types, respects date/status/search filters)
  const downloadAllExcel = () => {
    const excelData = buildExcelRows(filtered);
    if (excelData.length === 0) { alert("No orders found to download."); return; }
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Orders");
    const dateStr = new Date().toISOString().split('T')[0];
    const statusLabel = status === "all" ? "All" : status === "Booking Completed" ? "Completed" : "Cancelled";
    const fromLabel = from ? `_From_${from}` : "";
    const toLabel = to ? `_To_${to}` : "";
    XLSX.writeFile(wb, `All_Orders_${statusLabel}${fromLabel}${toLabel}_${dateStr}.xlsx`);
  };

  return (
    <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto w-full text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-600">
            Manage and track all your orders
          </p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 mb-6 shadow-md hover:shadow-lg transition-shadow duration-200 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <i className="fas fa-filter text-blue-600 text-sm"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Filters & Search
            </h3>
          </div>
          {(from || to || status !== "all" || query || orderType !== "all") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
              Clear All
            </button>
          )}
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-5">
          {/* Time Period Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-clock text-blue-600 text-xs"></i>
              Time Period
            </label>
            <select
              onChange={(e) => {
                const type = e.target.value;
                const now = new Date();
                const formatDate = (date) => date.toISOString().split('T')[0];
                let start = new Date(now);

                if (type === 'custom') return;

                if (type === 'today') {
                  // start is already now
                } else if (type === 'week') {
                  const day = now.getDay();
                  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                  start.setDate(diff);
                } else if (type === 'month') {
                  start.setDate(1);
                } else if (type === '3months') {
                  start.setMonth(now.getMonth() - 2); // Current month + 2 previous months
                  start.setDate(1);
                }

                setFrom(formatDate(start));
                setTo(formatDate(now));
              }}
              defaultValue="custom"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="custom">Custom Range</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
          {/* From Date */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-calendar-alt text-blue-600 text-xs"></i>
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              />
              {from && (
                <button
                  onClick={() => setFrom("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {/* To Date */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-calendar-check text-blue-600 text-xs"></i>
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              />
              {to && (
                <button
                  onClick={() => setTo("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-tag text-blue-600 text-xs"></i>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Booking Completed">Booking Completed</option>
              <option value="Booking Cancelled">Booking Cancelled</option>
            </select>
          </div>

          {/* Order Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-truck text-blue-600 text-xs"></i>
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="helper">Helper Only</option>
              <option value="other">Other Orders</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-search text-blue-600 text-xs"></i>
              Search Orders
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, Name..."
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count and Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-gray-600">Showing</span>{" "}
              <span className="font-bold text-blue-600">{filtered.length}</span>{" "}
              <span className="text-gray-600">of</span>{" "}
              <span className="font-bold text-gray-900">{orders.length}</span>{" "}
              <span className="text-gray-600">orders</span>
            </div>
          </div>

          {/* Status Summary Cards */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-gray-600">Total:</span>{" "}
              <span className="text-sm font-bold text-gray-900">{filtered.length}</span>
            </div>
            <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xs font-semibold text-green-700">Completed:</span>{" "}
              <span className="text-sm font-bold text-green-800">{statusCounts["Booking Completed"] || 0}</span>
            </div>
            <div className="px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
              <span className="text-xs font-semibold text-white">Cancelled:</span>{" "}
              <span className="text-sm font-bold text-white">{statusCounts["Booking Cancelled"] || 0}</span>
            </div>
            {/* Order Type Counts */}
            <div className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-xs font-semibold text-purple-700">Helper:</span>{" "}
              <span className="text-sm font-bold text-purple-800">{orderTypeCounts.helper || 0}</span>
            </div>
            <div className="px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-xs font-semibold text-orange-700">Other:</span>{" "}
              <span className="text-sm font-bold text-orange-800">{orderTypeCounts.other || 0}</span>
            </div>
            {/* Excel Download Buttons */}
            <button
              onClick={downloadHelperExcel}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <i className="fas fa-file-excel"></i>
              Helper Excel ({orderTypeCounts.helper || 0})
            </button>
            <button
              onClick={downloadOtherExcel}
              className="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <i className="fas fa-file-excel"></i>
              Other Excel ({orderTypeCounts.other || 0})
            </button>
            <button
              onClick={downloadAllExcel}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <i className="fas fa-file-excel"></i>
              All Excel ({filtered.length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-sm text-gray-600">Loading orders...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm w-full">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_1.5fr] font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 px-4 lg:px-6 py-3.5 w-full text-xs lg:text-sm">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Service</div>
            <div>Date/Time</div>
            <div className="text-center">Labours</div>
            <div className="text-right">Total</div>
            <div className="text-center">Status</div>
          </div>

          {/* Data */}
          <div className="divide-y divide-gray-200 w-full">
            {filtered.map((o) => {
              const getStatusColor = (status) => {
                const normalized = normalizeStatus(status);
                if (normalized === "Booking Completed") {
                  return "bg-green-100 text-green-800 border-green-200";
                } else if (normalized === "Booking Cancelled") {
                  return "bg-gray-900 text-white border-gray-800";
                }
                return "bg-gray-100 text-gray-800 border-gray-200";
              };

              const displayStatus = getDisplayStatus(o.status);

              return (
                <div key={o.id}>
                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_1.5fr] px-4 lg:px-6 py-4 items-center w-full hover:bg-gray-50 transition-colors duration-150 text-xs lg:text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                      <span
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                        title={o.id}
                        onClick={() =>
                          onViewOrderDetails && onViewOrderDetails(o.id)
                        }
                      >
                        {o.id}
                      </span>
                    </div>

                    <div className="text-gray-900 font-medium truncate" title={o.customer || "—"}>
                      {o.customer || "—"}
                    </div>

                    <div className="text-gray-700 truncate" title={o.serviceName || "—"}>
                      {o.serviceName || "—"}
                    </div>

                    <div className="text-gray-600 text-xs lg:text-sm">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </div>

                    <div className="text-center font-semibold text-gray-900">
                      {o.totalLabour || 0}
                    </div>

                    <div className="text-right font-semibold text-gray-900">
                      ₹{o.totalAmount?.toLocaleString("en-IN") || "0"}
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {displayStatus || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile View - Card Layout */}
                  <div className="md:hidden p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 truncate text-sm"
                            title={o.id}
                            onClick={() =>
                              onViewOrderDetails && onViewOrderDetails(o.id)
                            }
                          >
                            {o.id}
                          </span>
                          <span className="text-xs text-gray-600 truncate font-medium">
                            {o.customer || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {displayStatus || "—"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service:</span>
                        <span className="text-gray-900 font-medium text-right flex-1 ml-2">
                          {o.serviceName || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date/Time:</span>
                        <span className="text-gray-700 text-right flex-1 ml-2">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Labours:</span>
                        <span className="text-gray-900 font-semibold">
                          {o.totalLabour || 0}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-700 font-semibold">Total:</span>
                        <span className="text-gray-900 font-bold text-base">
                          ₹{o.totalAmount?.toLocaleString("en-IN") || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="text-sm text-gray-500">No orders found</div>
                <div className="text-xs text-gray-400 mt-1">
                  Try adjusting your filters
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
