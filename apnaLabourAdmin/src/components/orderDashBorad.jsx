import React, { useEffect, useState } from 'react';

// Mock data based on the provided DynamoDB attributes
const mockOrderData = [
  {
    id: "6bed519a-31dd-4774-83ab-cf4c8f5e5193",
    createdAt: "2025-10-20T20:03:15.209Z",
    deliveryAddress: "Fetching address...",
    floorNumber: null,
    houseNo: "13",
    image: "",
    isGroundFloor: null,
    isListAvailable: null,
    latitude: "37.4212162",
    longitude: "-122.0828568",
    orders: [],
    paymentType: "Cash",
    PickupDate: "2025-10-20",
    PickupTime: "",
    status: "Booking Confirmed",
    tax: 0,
    totalAmount: 2500,
    totalLabour: 5,
    userId: "51735dda-a091-7017-8c9d-824c7593d446"
  }
];

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount (using mock data for now)
  useEffect(() => {
    // Simulate API call with mock data
    setOrders(mockOrderData);
    setLoading(false);

    // Uncomment and configure below for real GraphQL integration
    /*
    const GRAPHQL_ENDPOINT = 'https://your-graphql-endpoint.com/graphql';
    const GET_ORDERS_QUERY = `
      query GetOrders {
        getOrders {
          id
          createdAt
          deliveryAddress
          floorNumber
          houseNo
          image
          isGroundFloor
          isListAvailable
          latitude
          longitude
          orders
          paymentType
          PickupDate
          PickupTime
          status
          tax
          totalAmount
          totalLabour
          userId
        }
      }
    `;

    const fetchOrders = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication if needed, e.g., 'Authorization': 'Bearer your-token'
          },
          body: JSON.stringify({
            query: GET_ORDERS_QUERY,
          }),
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        setOrders(result.data.getOrders);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
    */
  }, []);

  // Format value for display
  const formatValue = (value) => {
    if (value === null) return 'Null';
    if (Array.isArray(value)) return value.length ? JSON.stringify(value) : 'Empty List';
    if (value === '') return 'Empty value';
    return value.toString();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-600 text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600 text-xl">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 border-r border-gray-200">
        <div className="text-2xl font-bold text-purple-700 mb-6">ShopZen</div>
        <ul className="space-y-2">
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">🏠</span> Home
          </li>
          <li className="flex items-center p-2 text-purple-700 bg-gray-200 rounded">
            <span className="mr-2">📦</span> Orders
          </li>
          <ul className="pl-4 mt-1 space-y-1 text-sm text-gray-600">
            <li>Drafts</li>
            <li>Shipping labels</li>
            <li>Abandoned checkouts</li>
          </ul>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">📦</span> Products
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">👥</span> Customers
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">📝</span> Content
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">💰</span> Finances
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">📊</span> Analytics
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">📣</span> Marketing
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">💸</span> Discounts <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full ml-2">New</span>
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">🛒</span> Sales Channels
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">🏪</span> Online Store
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">💳</span> Point of Sale
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">🏬</span> Shop
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">📱</span> Apps
          </li>
          <li className="flex items-center p-2 text-gray-600 hover:bg-gray-200 rounded">
            <span className="mr-2">➕</span> Add Apps
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search or type command..."
            className="p-2 w-96 border border-gray-300 rounded"
          />
          <div className="flex items-center space-x-4">
            <button className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-100">Export</button>
            <button className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-100">More actions</button>
            <button className="p-2 bg-purple-700 text-white rounded hover:bg-purple-600">Create order</button>
            <div className="text-2xl">👤</div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800">21</div>
            <div className="text-gray-500">Total Orders</div>
            <div className="text-green-600 text-sm">+25.2% last week</div>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800">15</div>
            <div className="text-gray-500">Order items over time</div>
            <div className="text-green-600 text-sm">+18.2% last week</div>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800">0</div>
            <div className="text-gray-500">Returns Orders</div>
            <div className="text-red-600 text-sm">-1.2% last week</div>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-gray-500">Fulfilled orders over time</div>
            <div className="text-green-600 text-sm">+12.2% last week</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded shadow border border-gray-200 p-4">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-purple-700 text-white rounded">All</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Unfulfilled</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Unpaid</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Open</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Closed</button>
              <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add</button>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100">🔍</button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100">≡</button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100">⋮</button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-left text-gray-600">Order #</th>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">Customer</th>
                <th className="p-3 text-left text-gray-600">Payment</th>
                <th className="p-3 text-left text-gray-600">Total</th>
                <th className="p-3 text-left text-gray-600">Delivery</th>
                <th className="p-3 text-left text-gray-600">Items</th>
                <th className="p-3 text-left text-gray-600">Fulfillment</th>
                <th className="p-3 text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-3">#{order.id.slice(0, 6)}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">Customer {order.userId.slice(0, 6)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                  </td>
                  <td className="p-3">${formatValue(order.totalAmount)}</td>
                  <td className="p-3">N/A</td>
                  <td className="p-3">{order.orders.length || 'N/A'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Unfulfilled</span>
                  </td>
                  <td className="p-3">
                    <button className="p-1 hover:bg-gray-200 rounded">👁️</button>
                    <button className="p-1 hover:bg-gray-200 rounded">💬</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;