import React, { useState, useEffect, useMemo } from 'react';
import { dashboardAPI } from '../services/dashboardAPI';

const UserAnalytics = () => {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('1m'); // '1m', '3m', '6m'

    const [bookingTypeFilter, setBookingTypeFilter] = useState('all'); // 'all', 'completed', 'confirmed'
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [timeFilter, fromDate, toDate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch both bookings and users (customers) to map names
                const [bookingsData, usersData] = await Promise.all([
                    dashboardAPI.getAllBookings(),
                    dashboardAPI.getUsersByType(1) // 1 = Customer
                ]);

                setBookings(bookingsData);
                setUsers(usersData);
            } catch (err) {
                console.error("Error fetching bookings for analytics:", err);
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredStats = useMemo(() => {
        if (!bookings.length) return [];

        // Create user lookup map
        const userLookup = {};
        if (users.length) {
            users.forEach(u => {
                userLookup[u.id] = u;
            });
        }

        const now = new Date();
        let cutoffDate = new Date();
        let useDateRange = false;
        let start = null;
        let end = null;

        if (fromDate || toDate) {
            useDateRange = true;
            if (fromDate) {
                start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
            }
            if (toDate) {
                end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
            }
        } else {
            // Set cutoff based on presets
            if (timeFilter === '1m') {
                cutoffDate.setMonth(now.getMonth() - 1);
            } else if (timeFilter === '3m') {
                cutoffDate.setMonth(now.getMonth() - 3);
            } else if (timeFilter === '6m') {
                cutoffDate.setMonth(now.getMonth() - 6);
            }
        }

        // 1. Filter bookings by date AND status
        const filteredBookings = bookings.filter(b => {
            // Check date
            if (!b.createdAt) return false;
            const date = new Date(b.createdAt);

            if (useDateRange) {
                if (start && date < start) return false;
                if (end && date > end) return false;
            } else {
                if (date < cutoffDate) return false;
            }

            // Check status (Completed or Confirmed)
            const status = (b.status || "").toLowerCase();
            const validStatuses = [
                "completed",
                "booking completed",
                "confirmed",
                "booking confirmed"
            ];

            return validStatuses.includes(status);
        });

        // 2. Aggregate by unique user (using userId)
        const userMap = {};

        filteredBookings.forEach(b => {
            const userId = b.userId;
            // unexpected case: no userId
            if (!userId) return;

            if (!userMap[userId]) {
                // Try to find user details
                const user = userLookup[userId];
                // Fallback name/phone
                const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown Name';
                const identifier = user ? user.phoneNumber : (b.userId || 'Unknown ID');

                userMap[userId] = {
                    id: userId,
                    identifier: identifier || 'No Phone', // Phone number
                    name: name || 'Unknown',
                    count: 0,
                    totalSpent: 0
                };
            }

            userMap[userId].count += 1;
            userMap[userId].totalSpent += (b.totalAmount || 0);
        });

        // 3. Convert to array and sort by count descending
        return Object.values(userMap).sort((a, b) => b.count - a.count);

    }, [bookings, users, timeFilter, fromDate, toDate]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">User Order Analytics</h3>
                    <p className="text-sm text-gray-500 mt-1">Top users by order volume</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 pl-2">From:</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setTimeFilter('');
                                }}
                                className="text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">To:</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setTimeFilter('');
                                }}
                                className="text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['1m', '3m', '6m'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setTimeFilter(filter);
                                    setFromDate('');
                                    setToDate('');
                                }}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${timeFilter === filter
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filter === '1m' ? '1 Month' : filter === '3m' ? '3 Months' : '6 Months'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center text-xs uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">Orders</th>
                            <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">Total Spent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        <span>Loading analytics...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredStats.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    No orders found for the selected period
                                </td>
                            </tr>
                        ) : (
                            filteredStats
                                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                .map((user, index) => {
                                    const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                    // Initials for avatar
                                    const initials = user.name
                                        .split(' ')
                                        .map(n => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase();

                                    return (
                                        <tr key={user.identifier} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold 
                                                    ${rank <= 3 ? 'bg-amber-100 text-amber-700' : 'text-gray-400 bg-gray-100'}`}>
                                                    {rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {initials || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{user.identifier}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {user.count} orders
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {user.totalSpent.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredStats.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredStats.length)}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredStats.length)}</span> of <span className="font-medium">{filteredStats.length}</span> users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${currentPage === 1
                                ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                                }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => (prev * ITEMS_PER_PAGE < filteredStats.length ? prev + 1 : prev))}
                            disabled={currentPage * ITEMS_PER_PAGE >= filteredStats.length}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${currentPage * ITEMS_PER_PAGE >= filteredStats.length
                                ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAnalytics;
