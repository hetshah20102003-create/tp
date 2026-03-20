import React, { useState, useEffect } from 'react';

// Mock function to simulate fetching labour data by ID
const getLabourById = (labourId) => {
  // Specific labour data for labourId '123'
  const specificLabourData = {
    id: '123',
    firstName: 'Amit',
    lastName: 'Sharma',
    username: 'amitsharma',
    businessName: 'Sharma Home Solutions',
    email: 'amit.sharma@example.com',
    phone: '+91 9876543210',
    userImage: 'https://via.placeholder.com/150',
    status: 'active',
    availability: 'Available',
    businessType: 'home_maintenance',
    experience: 7,
    location: 'Delhi, India',
    lastActiveAt: '2025-09-11T10:00:00Z',
    skills: ['Plumbing', 'Electrical', 'Painting', 'Carpentry'],
    addressList: {
      homeAddress: {
        street: '456 Green Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        landmark: 'Near Metro Station'
      }
    },
    rating: 4.9,
    totalTask: 150,
    totalEarning: 350000,
    balance: 20000,
    latitude: 28.7041,
    longitude: 77.1025,
    orderHistory: [
      {
        id: 'ORD001',
        serviceName: 'Pipe Repair',
        userName: 'Priya Singh',
        location: 'Rohini, Delhi',
        amount: 2000,
        date: '2025-08-20',
        status: 'Completed',
        rating: 4.8,
        review: 'Quick and efficient service. Highly recommended!',
        completionTime: '2 hours',
        paymentMethod: 'Online'
      },
      {
        id: 'ORD002',
        serviceName: 'Electrical Installation',
        userName: 'Rahul Verma',
        location: 'Connaught Place, Delhi',
        amount: 3000,
        date: '2025-07-15',
        status: 'Completed',
        rating: 5.0,
        review: 'Very professional and thorough.',
        completionTime: '3 hours',
        paymentMethod: 'Cash'
      },
      {
        id: 'ORD003',
        serviceName: 'Wall Painting',
        userName: 'Sneha Gupta',
        location: 'Dwarka, Delhi',
        amount: 5000,
        date: '2025-06-25',
        status: 'Pending',
        rating: 0,
        review: '',
        completionTime: 'N/A',
        paymentMethod: 'N/A'
      },
      {
        id: 'ORD004',
        serviceName: 'Furniture Assembly',
        userName: 'Vikram Patel',
        location: 'South Delhi, Delhi',
        amount: 2500,
        date: '2025-05-10',
        status: 'Cancelled',
        rating: 0,
        review: 'Cancelled due to client unavailability.',
        completionTime: 'N/A',
        paymentMethod: 'N/A'
      }
    ]
  };

  // Default labour data for any other labourId
  const defaultLabourData = {
    id: labourId || 'Unknown',
    firstName: 'Unknown',
    lastName: 'Labour',
    username: 'unknown_user',
    businessName: 'Generic Services',
    email: 'unknown@example.com',
    phone: '+91 0000000000',
    userImage: 'https://via.placeholder.com/150',
    status: 'pending',
    availability: 'Not Available',
    businessType: 'general_services',
    experience: 0,
    location: 'Unknown Location',
    lastActiveAt: '2025-01-01T00:00:00Z',
    skills: ['General Work'],
    addressList: {
      homeAddress: {
        street: 'Unknown Street',
        city: 'Unknown City',
        state: 'Unknown State',
        pincode: '000000',
        landmark: 'N/A'
      }
    },
    rating: 0.0,
    totalTask: 0,
    totalEarning: 0,
    balance: 0,
    latitude: 0.0,
    longitude: 0.0,
    orderHistory: [
      {
        id: 'ORD000',
        serviceName: 'No Data',
        userName: 'N/A',
        location: 'N/A',
        amount: 0,
        date: '2025-01-01',
        status: 'N/A',
        rating: 0,
        review: 'No history available.',
        completionTime: 'N/A',
        paymentMethod: 'N/A'
      }
    ]
  };

  // Return specific data for labourId '123', otherwise return default data
  return labourId === '123' ? specificLabourData : defaultLabourData;
};

const StatusBadge = ({ status }) => {
  const style = {
    active: 'bg-teal-100 text-teal-700 border-teal-200',
    inactive: 'bg-orange-100 text-orange-700 border-orange-200',
    pending: 'bg-purple-100 text-purple-700 border-purple-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${style[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const AvailabilityBadge = ({ availability }) => {
  const style = {
    Available: 'bg-green-100 text-green-800',
    Busy: 'bg-yellow-100 text-yellow-800',
    'Not Available': 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${style[availability] || 'bg-gray-100 text-gray-700'}`}>
      {availability}
    </span>
  );
};

const LabourDetails = ({ labourId, onBack }) => {
  const [labour, setLabour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!labourId) return;

    const loadLabour = async () => {
      try {
        setLoading(true);
        const labourData = getLabourById(labourId);
        if (labourData) setLabour(labourData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLabour();
  }, [labourId]);

  if (loading) return (
    <div className="px-4 sm:px-6 py-8">
      <div className="flex items-center justify-center h-48">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="text-base text-gray-700">Loading labour details...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto bg-gray-100 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors text-lg"
            aria-label="Go back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Labour Profile</h1>
            <p className="text-base text-gray-600">ID: {labour.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={labour.status} />
          <AvailabilityBadge availability={labour.availability} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="flex items-start space-x-5">
              <img
                src={labour.userImage}
                alt={labour.firstName}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {labour.firstName} {labour.lastName}
                </h3>
                <p className="text-base text-gray-600">@{labour.username}</p>
                <p className="text-base text-gray-600">{labour.businessName}</p>
                <p className="text-base text-gray-500">{labour.email}</p>
                <p className="text-base text-gray-500">{labour.phone}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <label className="block text-gray-500 mb-1">Business Type</label>
                <p className="text-gray-900 font-medium capitalize">{labour.businessType.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Experience</label>
                <p className="text-gray-900 font-medium">{labour.experience} years</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Location</label>
                <p className="text-gray-900 font-medium">{labour.location}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Last Active</label>
                <p className="text-gray-900 font-medium">{new Date(labour.lastActiveAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {labour.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-teal-100 text-teal-700 text-base font-medium rounded-full border border-teal-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-base">
              <h4 className="font-medium text-gray-900 mb-2">Home Address</h4>
              <p>{labour.addressList.homeAddress.street}</p>
              <p>{labour.addressList.homeAddress.city}, {labour.addressList.homeAddress.state}</p>
              <p>PIN: {labour.addressList.homeAddress.pincode}</p>
              <p className="text-gray-600">Landmark: {labour.addressList.homeAddress.landmark}</p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
            {labour.orderHistory && labour.orderHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {labour.orderHistory.map((order, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.serviceName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.userName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.location}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">₹{order.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                          {order.rating > 0 ? (
                            <>
                              {order.rating} <i className="fas fa-star text-yellow-400"></i>
                            </>
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{order.review || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.completionTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{order.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-base text-gray-600">No order history available for this labour.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-base">
            <h2 className="font-semibold text-gray-900 mb-4">Performance Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 font-semibold">{labour.rating}</span>
                  <i className="fas fa-star text-yellow-400"></i>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="text-gray-900 font-semibold">{labour.totalTask}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Earnings</span>
                <span className="text-gray-900 font-semibold">₹{labour.totalEarning.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-gray-900">Balance</span>
                <span className="font-bold text-gray-900">₹{labour.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-base space-y-3">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <i className="fas fa-phone"></i>
              <span>Contact Labour</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-calendar-plus"></i>
              <span>Assign Task</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <i className="fas fa-edit"></i>
              <span>Update Profile</span>
            </button>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-base text-center">
            <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
            <i className="fas fa-map-marker-alt text-teal-500 text-2xl mb-3"></i>
            <p className="font-medium text-gray-700">{labour.location}</p>
            <p className="text-gray-600">Lat: {labour.latitude}, Lng: {labour.longitude}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourDetails;