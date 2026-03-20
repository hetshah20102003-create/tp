import React, { useState, useEffect, useMemo } from 'react';
import { dashboardAPI } from '../services/dashboardAPI';

// Helper functions for date handling
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key) => {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
};

// Filter completed bookings
const completed = (bookings) => bookings.filter(b => (b.status || '').toLowerCase() === 'completed');

// Currency formatter
const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// ─── Core CRM Funnel Logic (Mutually Exclusive) ─────────────────────────────
function computeCRMFunnel(users, bookings, targetMonth) {
    // 1. Get all users who signed up in this specific month
    const cohortUsers = users.filter(u => u.createdAt && monthKey(u.createdAt) === targetMonth);
    const cohortUserIds = new Set(cohortUsers.map(u => u.id));

    // 2. Get all completed bookings for ONLY these cohort users
    const okBookings = completed(bookings).filter(b => cohortUserIds.has(b.userId));

    // 3. Calculate order stats per cohort user
    const userStats = {};
    // Initialize all cohort users with 0 orders
    cohortUsers.forEach(u => {
        userStats[u.id] = { user: u, orders: 0, lastOrderDate: null };
    });

    // Populate order counts and last order dates
    okBookings.forEach(b => {
        if (!b.userId || !userStats[b.userId]) return;
        userStats[b.userId].orders += 1;
        const bDate = new Date(b.createdAt);
        if (!userStats[b.userId].lastOrderDate || bDate > userStats[b.userId].lastOrderDate) {
            userStats[b.userId].lastOrderDate = bDate;
        }
    });

    // 4. Bucket users into MUTUALLY EXCLUSIVE stages
    const stages = {
        signedUpOnly: [], // Exactly 0
        firstOrder: [],   // Exactly 1
        repeat: [],       // Exactly 2 or 3
        loyal: [],        // 4 or more
    };

    Object.values(userStats).forEach(({ user, orders, lastOrderDate }) => {
        const enrichedUser = { ...user, totalOrders: orders, lastOrderDate };
        if (orders === 0) stages.signedUpOnly.push(enrichedUser);
        else if (orders === 1) stages.firstOrder.push(enrichedUser);
        else if (orders >= 2 && orders <= 3) stages.repeat.push(enrichedUser);
        else if (orders >= 4) stages.loyal.push(enrichedUser);
    });

    return {
        month: targetMonth,
        totalSignups: cohortUsers.length,
        buckets: [
            { id: 'signedUpOnly', label: 'Signed Up Only (0 Orders)', count: stages.signedUpOnly.length, users: stages.signedUpOnly, color: '#6366f1', icon: 'fas fa-user-clock' },
            { id: 'firstOrder', label: 'First Order (1 Order)', count: stages.firstOrder.length, users: stages.firstOrder, color: '#3b82f6', icon: 'fas fa-shopping-cart' },
            { id: 'repeat', label: 'Repeat (2-3 Orders)', count: stages.repeat.length, users: stages.repeat, color: '#14b8a6', icon: 'fas fa-redo' },
            { id: 'loyal', label: 'Loyal (4+ Orders)', count: stages.loyal.length, users: stages.loyal, color: '#f59e0b', icon: 'fas fa-star' },
        ],
    };
}

// ─── Modal Component for User List ──────────────────────────────────────────────
const UserListModal = ({ isOpen, onClose, bucketLabel, users, monthLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
                onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{bucketLabel}</h2>
                        <p className="text-xs text-gray-500">Signups from {monthLabel} • {users.length} users</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <i className="fas fa-user-slash text-4xl mb-3 opacity-30"></i>
                            <p>No users currently in this stage.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map(u => (
                                <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3 mb-3 sm:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {u.firstName?.[0] || '?'}{u.lastName?.[0] || ''}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <i className="fas fa-phone text-gray-400"></i>
                                                    {u.phoneNumber || 'N/A'}
                                                </span>
                                                {u.userType && (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${String(u.userType).toUpperCase() === 'LABOUR' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.userType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 pl-12 sm:pl-0 border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold text-gray-900">{u.totalOrders} Orders</p>
                                        </div>
                                        <div className="text-xs text-gray-400 text-left sm:text-right">
                                            <p>Signed up: {new Date(u.createdAt).toLocaleDateString()}</p>
                                            {u.lastOrderDate && (
                                                <p>Last order: {u.lastOrderDate.toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with actions (e.g., Export) */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    <button
                        onClick={() => {
                            // Basic CSV export functionality could go here
                            const headers = ['First Name', 'Last Name', 'Phone', 'Type', 'Signup Date', 'Total Orders', 'Last Order Date'];
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + headers.join(",") + "\n"
                                + users.map(e => [
                                    e.firstName,
                                    e.lastName,
                                    e.phoneNumber,
                                    e.userType,
                                    new Date(e.createdAt).toLocaleDateString(),
                                    e.totalOrders,
                                    e.lastOrderDate ? e.lastOrderDate.toLocaleDateString() : 'N/A'
                                ].join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `${bucketLabel.replace(/ /g, '_')}_${monthLabel}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                    >
                        <i className="fas fa-file-csv"></i> Export List
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Single Month Funnel Row ──────────────────────────────────────────────────
const MonthFunnelRow = ({ data, onStageClick }) => {
    const { month, totalSignups, buckets } = data;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm">
                        <i className="fas fa-calendar-day text-white text-xs"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{monthLabel(month)} Signups</h3>
                        <p className="text-[10px] text-gray-500">Total: {totalSignups} users</p>
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {buckets.map(bucket => {
                    const pct = totalSignups > 0 ? Math.round((bucket.count / totalSignups) * 100) : 0;
                    return (
                        <button
                            key={bucket.id}
                            onClick={() => onStageClick(bucket, monthLabel(month))}
                            className="text-left group relative overflow-hidden rounded-xl border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {/* Background hover effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ backgroundColor: bucket.color }} />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-80" style={{ backgroundColor: `${bucket.color}20` }}>
                                    <i className={`${bucket.icon} text-sm`} style={{ color: bucket.color }}></i>
                                </div>
                                <h4 className="text-[11px] font-bold text-gray-700 leading-tight pr-2">{bucket.label}</h4>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-2xl font-extrabold text-gray-900">{bucket.count}</span>
                                    <span className="text-xs text-gray-400 ml-1">users</span>
                                </div>
                                <div className="text-[10px] font-bold px-2 py-1 rounded-md mb-1" style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}>
                                    {pct}%
                                </div>
                            </div>

                            {/* CTA Indicator */}
                            <div className="mt-3 text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                View Users <i className="fas fa-arrow-right text-[8px]"></i>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LifecycleFunnel = () => {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthsBack, setMonthsBack] = useState(6);

    // Modal State
    const [modalData, setModalData] = useState({ isOpen: false, bucket: null, monthLabel: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allBookings, allUsers] = await Promise.all([
                    dashboardAPI.getAllBookings(),
                    dashboardAPI.getAllCustomers(),
                ]);
                setBookings(allBookings);
                setUsers(allUsers);
            } catch (err) {
                console.error('Error loading CRM funnel data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Generate valid month keys looking backwards
    const months = useMemo(() => {
        const now = new Date();
        const result = [];
        for (let i = 0; i < monthsBack; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push(monthKey(d));
        }
        return result; // Order: Newest to Oldest
    }, [monthsBack]);

    // Compute funnel CRM data for each month
    const monthCRMData = useMemo(
        () => months.map(m => computeCRMFunnel(users, bookings, m)),
        [users, bookings, months]
    );

    const openModal = (bucket, monthLabel) => {
        setModalData({ isOpen: true, bucket, monthLabel });
    };

    const closeModal = () => {
        setModalData({ ...modalData, isOpen: false });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-sm font-semibold text-gray-600">Loading CRM Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7 bg-[#f8fafc] min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                            <i className="fas fa-users-cog text-white"></i>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Actionable CRM Funnel
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Users are divided into <strong className="text-gray-700">mutually exclusive</strong> stages based on their current completed orders. Click any stage to view the users for follow-up.
                    </p>
                </div>

                <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm self-start sm:self-auto shrink-0">
                    {[
                        { val: 3, label: '3 Months' },
                        { val: 6, label: '6 Months' },
                        { val: 12, label: '12 Months' },
                    ].map(p => (
                        <button
                            key={p.val}
                            onClick={() => setMonthsBack(p.val)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${monthsBack === p.val
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-triangle mt-0.5"></i>
                    <div>
                        <p className="font-bold">Error Loading Data</p>
                        <p className="opacity-90">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* CRM Monthly Rows */}
                    {monthCRMData.map(data => (
                        <MonthFunnelRow
                            key={data.month}
                            data={data}
                            onStageClick={openModal}
                        />
                    ))}

                    {monthCRMData.length === 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-folder-open text-3xl opacity-50"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">No signups found</h3>
                            <p className="text-sm">There are no user signups for the selected time period.</p>
                        </div>
                    )}
                </div>
            )}

            {/* User List Detail Modal */}
            <UserListModal
                isOpen={modalData.isOpen}
                onClose={closeModal}
                bucketLabel={modalData.bucket?.label}
                users={modalData.bucket?.users || []}
                monthLabel={modalData.monthLabel}
            />

        </div>
    );
};

export default LifecycleFunnel;
