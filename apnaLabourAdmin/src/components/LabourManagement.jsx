import React, { useState, useMemo } from 'react';
import { sampleLabours } from '../services/labourData';

// ✅ Status Badge
const StatusBadge = ({ status }) => {
  const style = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${
        style[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// ✅ Availability Badge
const AvailabilityBadge = ({ availability }) => {
  const style = {
    Available: 'bg-green-100 text-green-700',
    Busy: 'bg-yellow-100 text-yellow-700',
    'Not Available': 'bg-red-100 text-red-700'
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
        style[availability] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {availability}
    </span>
  );
};

// ✅ Labour Card
const LabourCard = ({ labour, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-0">
          <img
            src={labour.userImage}
            alt={labour.firstName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {labour.firstName} {labour.lastName}
            </h3>
            <p className="text-[9px] sm:text-xs text-gray-500">@{labour.username}</p>
            <p className="text-[9px] sm:text-xs text-gray-600">{labour.businessName}</p>
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2">
          <StatusBadge status={labour.status} />
          <AvailabilityBadge availability={labour.availability} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3 text-[9px] sm:text-xs">
        <div>
          <p className="text-gray-500 mb-0.5">Rating</p>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-900 text-xs sm:text-sm">
              {labour.rating}
            </span>
            <i className="fas fa-star text-yellow-400 text-[9px] sm:text-xs"></i>
          </div>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Tasks</p>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{labour.totalTask}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Earnings</p>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">
            ₹{labour.totalEarning.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Experience</p>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{labour.experience}</p>
        </div>
      </div>

      <div className="mb-2 sm:mb-3">
        <p className="text-[9px] sm:text-xs text-gray-500 mb-0.5">Skills</p>
        <div className="flex flex-wrap gap-1">
          {labour.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] sm:text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
        <div className="text-[9px] sm:text-xs text-gray-500 flex items-center">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {labour.location}
        </div>
        <button
          onClick={() => onViewDetails(labour.id)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-[9px] sm:text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ✅ Main Component
const LabourManagement = ({ onViewLabourDetails }) => {
  const [labours] = useState(sampleLabours);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  // 🔍 Filtering
  const filteredLabours = useMemo(() => {
    return labours.filter((labour) => {
      const matchesSearch =
        searchQuery === '' ||
        `${labour.firstName} ${labour.lastName} ${labour.username} ${labour.businessName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || labour.status === statusFilter;
      const matchesAvailability =
        availabilityFilter === 'all' || labour.availability === availabilityFilter;
      const matchesLocation =
        locationFilter === '' ||
        labour.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesAvailability && matchesLocation;
    });
  }, [labours, searchQuery, statusFilter, availabilityFilter, locationFilter]);

  // 📊 Stats
  const stats = useMemo(() => {
    const total = labours.length;
    const active = labours.filter((l) => l.status === 'active').length;
    const available = labours.filter((l) => l.availability === 'Available').length;
    const totalEarnings = labours.reduce((sum, l) => sum + l.totalEarning, 0);

    return { total, active, available, totalEarnings };
  }, [labours]);

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Labour Management</h1>
          <p className="text-[10px] sm:text-sm text-gray-600 mt-1">
            Manage and track all your labour workers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        {[
          { title: 'Total Labours', value: stats.total, icon: 'fas fa-users', color: 'blue' },
          { title: 'Active Labours', value: stats.active, icon: 'fas fa-user-check', color: 'green' },
          { title: 'Available Now', value: stats.available, icon: 'fas fa-clock', color: 'yellow' },
          {
            title: 'Total Earnings',
            value: `₹${stats.totalEarnings.toLocaleString()}`,
            icon: 'fas fa-rupee-sign',
            color: 'purple'
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg bg-${card.color}-50`}>
                <i className={`${card.icon} text-${card.color}-600 text-base sm:text-xl`}></i>
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500">{card.title}</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <i className="fas fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, username..."
                className="w-full pl-7 pr-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-2 py-1 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location..."
              className="w-full px-2 py-1 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setAvailabilityFilter('all');
                setLocationFilter('');
              }}
              className="w-full px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <i className="fas fa-times mr-1"></i> Clear
            </button>
          </div>
        </div>
        <div className="mt-3 text-[10px] sm:text-sm text-gray-500">
          {filteredLabours.length} of {labours.length} labours
        </div>
      </div>

      {/* Labour Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredLabours.map((labour) => (
          <LabourCard key={labour.id} labour={labour} onViewDetails={onViewLabourDetails} />
        ))}
      </div>

      {filteredLabours.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-search text-gray-300 text-3xl sm:text-4xl mb-3"></i>
          <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1">No labours found</h3>
          <p className="text-[10px] sm:text-sm text-gray-500">
            Adjust your filters or search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default LabourManagement;
