import React, { useEffect, useMemo, useState } from "react";
import { usersAPI } from "../services/usersAPI";

const UsersList = ({ onViewUserDetails }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await usersAPI.fetchUsers(1); // userType = 1
        if (mounted) setUsers(list);
      } catch (e) {
        console.error("Error loading users:", e);
        if (mounted) setError("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Filtered users based on user input
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = query.trim().toLowerCase();
      const passQuery = q
        ? (`${u.firstName || ""}${u.lastName || ""}${u.phoneNumber || ""}${u.email || ""}${u.id || ""}`)
          .toLowerCase()
          .includes(q)
        : true;

      const passStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? u.isActive === true
            : statusFilter === "inactive"
              ? u.isActive === false
              : true;

      return passQuery && passStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [users, query, statusFilter]);

  // Compute user counts
  const userCounts = useMemo(() => {
    const counts = { active: 0, inactive: 0, total: filtered.length };
    filtered.forEach((u) => {
      if (u.isActive) counts.active++;
      else counts.inactive++;
    });
    return counts;
  }, [filtered]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto w-full text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          {/* <p className="text-sm text-gray-600">Manage and view all users (Type 1)</p> */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <i className="fas fa-filter text-blue-600 text-sm"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Filters & Search</h3>
          </div>
          {(query || statusFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-tag text-blue-600 text-xs"></i>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fas fa-search text-blue-600 text-xs"></i>
              Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, phone, email, or ID..."
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
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-gray-600">Showing</span>{" "}
              <span className="font-bold text-blue-600">{filtered.length}</span>{" "}
              <span className="text-gray-600">of</span>{" "}
              <span className="font-bold text-gray-900">{users.length}</span>{" "}
              <span className="text-gray-600">users</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-gray-600">Total:</span>{" "}
              <span className="text-sm font-bold text-gray-900">{userCounts.total}</span>
            </div>
            <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xs font-semibold text-green-700">Active:</span>{" "}
              <span className="text-sm font-bold text-green-800">{userCounts.active}</span>
            </div>
            <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs font-semibold text-red-700">Inactive:</span>{" "}
              <span className="text-sm font-bold text-red-800">{userCounts.inactive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-sm text-gray-600">Loading users...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm w-full">
          {/* Desktop Header */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_2fr_1fr] font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 px-4 lg:px-6 py-3.5 w-full text-xs lg:text-sm">
            <div>Name</div>
            <div>Contact</div>
            <div className="text-center">Status</div>
          </div>

          {/* Data */}
          <div className="divide-y divide-gray-200 w-full">
            {filtered.map((user) => {
              const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "N/A";
              const isActive = user.isActive === true;

              return (
                <div key={user.id}>
                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr_2fr_1fr] px-4 lg:px-6 py-4 items-center w-full hover:bg-gray-50 transition-colors duration-150 text-xs lg:text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                      <span
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                        title={fullName}
                        onClick={() => onViewUserDetails && onViewUserDetails(user.id)}
                      >
                        {fullName}
                      </span>
                    </div>

                    <div className="text-gray-700 truncate">
                      <div className="text-xs text-gray-500">{user.phoneNumber || "—"}</div>
                      {/* <div className="text-xs text-gray-500">{user.email || "—"}</div> */}
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                          }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        <span
                          className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 truncate text-sm"
                          title={fullName}
                          onClick={() => onViewUserDetails && onViewUserDetails(user.id)}
                        >
                          {fullName}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                          }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900 font-medium text-right flex-1 ml-2">
                          {user.phoneNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-700 text-right flex-1 ml-2">
                          {user.email || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="text-sm text-gray-500">No users found</div>
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

export default UsersList;

