import React, { useState, useEffect, useMemo } from 'react';
import { dashboardAPI } from '../services/dashboardAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtINR = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const shortINR = (v) =>
    v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr`
        : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
            : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K`
                : `₹${Math.round(v)}`;

const monthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key) => {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[parseInt(m, 10) - 1]} '${y.slice(2)}`;
};

const completed = (bookings) => bookings.filter(b => (b.status || '').toLowerCase() === 'completed');

// ─── Cohort Data Builder ──────────────────────────────────────────────────────
function buildCohortData(users, bookings, monthsBack) {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed

    // 1. Generate cohort month keys (= signup month rows)
    const cohortMonths = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(curYear, curMonth - i, 1);
        cohortMonths.push(monthKey(d));
    }

    // 2. Build user → signup month map
    const userSignupMonth = {};
    users.forEach(u => {
        if (!u.createdAt || !u.id) return;
        userSignupMonth[u.id] = monthKey(u.createdAt);
    });

    // 3. Only completed bookings
    const okBookings = completed(bookings);

    // 4. Group bookings by (signup cohort, activity month)
    // Structure: { "2025-06": { "2025-06": { users: Set, revenue: 0 }, "2025-07": {...} } }
    const cohortData = {};
    cohortMonths.forEach(cm => {
        cohortData[cm] = {};
    });

    okBookings.forEach(b => {
        if (!b.userId || !b.createdAt) return;
        const signupMo = userSignupMonth[b.userId];
        if (!signupMo || !cohortData[signupMo]) return;

        const activityMo = monthKey(b.createdAt);
        if (!cohortData[signupMo][activityMo]) {
            cohortData[signupMo][activityMo] = { users: new Set(), revenue: 0, orders: 0 };
        }
        cohortData[signupMo][activityMo].users.add(b.userId);
        cohortData[signupMo][activityMo].revenue += (b.totalAmount || 0);
        cohortData[signupMo][activityMo].orders += 1;
    });

    // 5. Count users per cohort (who signed up in that month)
    const cohortSizes = {};
    cohortMonths.forEach(cm => { cohortSizes[cm] = 0; });
    users.forEach(u => {
        if (!u.createdAt || !u.id) return;
        const mk = monthKey(u.createdAt);
        if (cohortSizes[mk] !== undefined) cohortSizes[mk] += 1;
    });

    // 6. Build the retention table
    // Each row: { cohortMonth, cohortSize, periods: [{ monthOffset, activeUsers, pct, revenue }] }
    const rows = cohortMonths.map(cm => {
        const [cy, cmo] = cm.split('-').map(Number);
        const cohortSize = cohortSizes[cm];
        const maxOffset = monthsBack; // Maximum columns

        const periods = [];
        for (let offset = 0; offset < maxOffset; offset++) {
            const targetDate = new Date(cy, cmo - 1 + offset, 1);
            // Don't go beyond current month
            if (targetDate > now) break;

            const targetKey = monthKey(targetDate);
            const cell = cohortData[cm]?.[targetKey];
            const activeUsers = cell ? cell.users.size : 0;
            const revenue = cell ? cell.revenue : 0;
            const orders = cell ? cell.orders : 0;
            const pct = cohortSize > 0 ? Math.round((activeUsers / cohortSize) * 100) : 0;

            periods.push({ offset, monthKey: targetKey, activeUsers, pct, revenue, orders });
        }

        return { cohortMonth: cm, cohortSize, periods };
    }).filter(r => r.cohortSize > 0); // Only show cohorts that have users

    return rows;
}

// ─── Color Scales ─────────────────────────────────────────────────────────────
function retentionColor(pct) {
    if (pct >= 80) return { bg: '#047857', text: '#ffffff' };
    if (pct >= 60) return { bg: '#059669', text: '#ffffff' };
    if (pct >= 40) return { bg: '#10b981', text: '#ffffff' };
    if (pct >= 25) return { bg: '#6ee7b7', text: '#065f46' };
    if (pct >= 15) return { bg: '#a7f3d0', text: '#065f46' };
    if (pct >= 5) return { bg: '#d1fae5', text: '#065f46' };
    if (pct > 0) return { bg: '#ecfdf5', text: '#065f46' };
    return { bg: '#f9fafb', text: '#9ca3af' };
}

function revenueColor(revenue, maxRevenue) {
    if (maxRevenue === 0) return { bg: '#f9fafb', text: '#9ca3af' };
    const ratio = revenue / maxRevenue;
    if (ratio >= 0.75) return { bg: '#4338ca', text: '#ffffff' };
    if (ratio >= 0.5) return { bg: '#6366f1', text: '#ffffff' };
    if (ratio >= 0.3) return { bg: '#818cf8', text: '#ffffff' };
    if (ratio >= 0.15) return { bg: '#a5b4fc', text: '#312e81' };
    if (ratio >= 0.05) return { bg: '#c7d2fe', text: '#312e81' };
    if (ratio > 0) return { bg: '#e0e7ff', text: '#312e81' };
    return { bg: '#f9fafb', text: '#9ca3af' };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, subtitle, icon, gradientFrom, gradientTo, iconBg }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group p-5">
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: iconBg }}>
                <i className={`${icon} text-base`} style={{ color: gradientFrom }}></i>
            </div>
        </div>
    </div>
);

// ─── Tooltip Component ────────────────────────────────────────────────────────
const CellTooltip = ({ tooltip, type }) => {
    if (!tooltip) return null;
    return (
        <div
            className="fixed z-[100] bg-gray-950 text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl pointer-events-none border border-white/10 w-52"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {monthLabel(tooltip.cohortMonth)} cohort · Month {tooltip.offset}
            </p>
            <div className="space-y-1.5">
                <div className="flex justify-between">
                    <span className="text-gray-400">Cohort Size</span>
                    <span className="font-bold">{tooltip.cohortSize}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Active Users</span>
                    <span className="font-bold">{tooltip.activeUsers}</span>
                </div>
                {type === 'retention' && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">Retention</span>
                        <span className="font-bold text-emerald-400">{tooltip.pct}%</span>
                    </div>
                )}
                {type === 'revenue' && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Revenue</span>
                            <span className="font-bold text-indigo-400">{shortINR(tooltip.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Orders</span>
                            <span className="font-bold">{tooltip.orders}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Cohort Heatmap Table ─────────────────────────────────────────────────────
const CohortTable = ({ rows, type, maxColumns }) => {
    const [tooltip, setTooltip] = useState(null);

    // Get max revenue for color scaling
    const maxRevenue = useMemo(() => {
        let max = 0;
        rows.forEach(r => r.periods.forEach(p => { if (p.revenue > max) max = p.revenue; }));
        return max;
    }, [rows]);

    // Determine columns to show
    const numCols = Math.min(maxColumns, Math.max(...rows.map(r => r.periods.length), 1));

    const handleMouseEnter = (e, row, period) => {
        setTooltip({
            x: e.clientX,
            y: e.clientY,
            cohortMonth: row.cohortMonth,
            cohortSize: row.cohortSize,
            offset: period.offset,
            activeUsers: period.activeUsers,
            pct: period.pct,
            revenue: period.revenue,
            orders: period.orders,
        });
    };

    const handleMouseMove = (e) => {
        if (tooltip) {
            setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${type === 'retention'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                        }`}>
                        <i className={`${type === 'retention' ? 'fas fa-users' : 'fas fa-indian-rupee-sign'} text-white text-sm`}></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            {type === 'retention' ? 'Customer Retention Cohort' : 'Revenue per Cohort'}
                        </h3>
                        <p className="text-[11px] text-gray-400">
                            {type === 'retention'
                                ? '% of users from each signup month who placed a completed order'
                                : 'Revenue generated by each signup cohort over time'
                            }
                        </p>
                    </div>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400">
                    {type === 'retention' ? (
                        <>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#ecfdf5' }}></span>Low</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></span>Mid</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#047857' }}></span>High</span>
                        </>
                    ) : (
                        <>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#e0e7ff' }}></span>Low</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1' }}></span>Mid</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#4338ca' }}></span>High</span>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto" onMouseLeave={() => setTooltip(null)}>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-100">
                            <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[100px]">
                                Cohort
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-gray-500 uppercase tracking-wider min-w-[60px]">
                                Users
                            </th>
                            {Array.from({ length: numCols }, (_, i) => (
                                <th key={i} className="px-2 py-3 text-center font-bold text-gray-400 uppercase tracking-wider min-w-[56px]">
                                    {i === 0 ? 'M0' : `M${i}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-2.5 font-semibold text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-50">
                                    {monthLabel(row.cohortMonth)}
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold text-gray-600">
                                    {row.cohortSize}
                                </td>
                                {Array.from({ length: numCols }, (_, ci) => {
                                    const period = row.periods[ci];
                                    if (!period) {
                                        return <td key={ci} className="px-2 py-2.5"></td>;
                                    }

                                    const colors = type === 'retention'
                                        ? retentionColor(period.pct)
                                        : revenueColor(period.revenue, maxRevenue);

                                    return (
                                        <td key={ci} className="px-1 py-1.5">
                                            <div
                                                className="rounded-lg py-2 px-1 text-center cursor-default transition-all duration-150 hover:scale-105 hover:shadow-md"
                                                style={{ backgroundColor: colors.bg, color: colors.text }}
                                                onMouseEnter={(e) => handleMouseEnter(e, row, period)}
                                                onMouseMove={handleMouseMove}
                                                onMouseLeave={() => setTooltip(null)}
                                            >
                                                <span className="font-bold text-[11px]">
                                                    {type === 'retention'
                                                        ? (period.pct > 0 ? `${period.pct}%` : '—')
                                                        : (period.revenue > 0 ? shortINR(period.revenue) : '—')
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={numCols + 2} className="px-6 py-12 text-center text-gray-400">
                                    <i className="fas fa-chart-bar text-3xl mb-3 block opacity-30"></i>
                                    No cohort data available yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CellTooltip tooltip={tooltip} type={type} />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BusinessMetrics = () => {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState(6); // 6 or 12 months

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [allBookings, allUsers] = await Promise.all([
                    dashboardAPI.getAllBookings(),
                    dashboardAPI.getAllCustomers(),
                ]);
                setBookings(allBookings);
                setUsers(allUsers);
            } catch (err) {
                console.error('Error loading business metrics:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Build cohort data
    const cohortRows = useMemo(() => buildCohortData(users, bookings, period), [users, bookings, period]);

    // Compute KPIs
    const kpis = useMemo(() => {
        const okBookings = completed(bookings);

        // 1. Average retention at Month 1
        const m1Rates = cohortRows
            .filter(r => r.periods.length > 1)
            .map(r => r.periods[1].pct);
        const avgM1Retention = m1Rates.length > 0
            ? Math.round(m1Rates.reduce((s, v) => s + v, 0) / m1Rates.length)
            : 0;

        // 2. Best cohort (highest M1 retention)
        let bestCohort = '—';
        let bestM1 = 0;
        cohortRows.forEach(r => {
            if (r.periods.length > 1 && r.periods[1].pct > bestM1) {
                bestM1 = r.periods[1].pct;
                bestCohort = monthLabel(r.cohortMonth);
            }
        });

        // 3. Estimated LTV (avg revenue per user from completed bookings)
        const userRevenue = {};
        okBookings.forEach(b => {
            if (!b.userId) return;
            userRevenue[b.userId] = (userRevenue[b.userId] || 0) + (b.totalAmount || 0);
        });
        const uniqueRevUsers = Object.keys(userRevenue).length;
        const totalRev = Object.values(userRevenue).reduce((s, v) => s + v, 0);
        const avgLTV = uniqueRevUsers > 0 ? Math.round(totalRev / uniqueRevUsers) : 0;

        // 4. Repeat customer rate (users with ≥2 completed orders)
        const userOrderCount = {};
        okBookings.forEach(b => {
            if (!b.userId) return;
            userOrderCount[b.userId] = (userOrderCount[b.userId] || 0) + 1;
        });
        const totalOrderingUsers = Object.keys(userOrderCount).length;
        const repeatUsers = Object.values(userOrderCount).filter(c => c >= 2).length;
        const repeatRate = totalOrderingUsers > 0 ? Math.round((repeatUsers / totalOrderingUsers) * 100) : 0;

        return { avgM1Retention, bestCohort, bestM1, avgLTV, repeatRate, totalOrderingUsers, repeatUsers };
    }, [bookings, cohortRows]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading cohort analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                        Business Metrics
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Cohort analysis · Signup-based customer tracking
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Period toggle */}
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
                        {[
                            { val: 3, label: '3 Months' },
                            { val: 6, label: '6 Months' },
                            { val: 12, label: '12 Months' },
                        ].map(p => (
                            <button
                                key={p.val}
                                onClick={() => setPeriod(p.val)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${period === p.val
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <KPICard
                    title="Avg M1 Retention"
                    value={`${kpis.avgM1Retention}%`}
                    subtitle="Users active 1 month after signup"
                    icon="fas fa-redo"
                    gradientFrom="#059669"
                    gradientTo="#10b981"
                    iconBg="#d1fae5"
                />
                <KPICard
                    title="Best Cohort"
                    value={kpis.bestCohort}
                    subtitle={kpis.bestM1 > 0 ? `${kpis.bestM1}% M1 retention` : 'No data yet'}
                    icon="fas fa-trophy"
                    gradientFrom="#d97706"
                    gradientTo="#f59e0b"
                    iconBg="#fef3c7"
                />
                <KPICard
                    title="Avg Customer LTV"
                    value={fmtINR(kpis.avgLTV)}
                    subtitle={`Across ${kpis.totalOrderingUsers} ordering users`}
                    icon="fas fa-gem"
                    gradientFrom="#6366f1"
                    gradientTo="#818cf8"
                    iconBg="#e0e7ff"
                />
                <KPICard
                    title="Repeat Rate"
                    value={`${kpis.repeatRate}%`}
                    subtitle={`${kpis.repeatUsers} of ${kpis.totalOrderingUsers} users ordered 2+`}
                    icon="fas fa-arrow-rotate-right"
                    gradientFrom="#7c3aed"
                    gradientTo="#a78bfa"
                    iconBg="#ede9fe"
                />
            </div>

            {/* Retention Cohort Heatmap */}
            <div className="mb-6">
                <CohortTable rows={cohortRows} type="retention" maxColumns={period} />
            </div>

            {/* Revenue Cohort Heatmap */}
            <div className="mb-6">
                <CohortTable rows={cohortRows} type="revenue" maxColumns={period} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* RFM SEGMENTATION                                               */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <RFMSegmentation bookings={bookings} users={users} />


        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RFM SEGMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

const RFM_SEGMENTS = [
    { key: 'champions', label: 'Champions', desc: 'Recent, frequent, high spenders', icon: 'fas fa-crown', gradient: 'from-amber-400 to-yellow-500', bg: '#fef3c7', text: '#92400e' },
    { key: 'loyal', label: 'Loyal Customers', desc: 'Frequent buyers, good revenue', icon: 'fas fa-heart', gradient: 'from-rose-400 to-pink-500', bg: '#fce7f3', text: '#9d174d' },
    { key: 'potential', label: 'Potential Loyalists', desc: 'Recent buyers, growing frequency', icon: 'fas fa-seedling', gradient: 'from-emerald-400 to-green-500', bg: '#d1fae5', text: '#065f46' },
    { key: 'new', label: 'New Customers', desc: 'First-time buyers', icon: 'fas fa-sparkles', gradient: 'from-blue-400 to-cyan-500', bg: '#dbeafe', text: '#1e40af' },
    { key: 'atRisk', label: 'At Risk', desc: 'No activity for >90 days', icon: 'fas fa-exclamation-triangle', gradient: 'from-orange-400 to-red-400', bg: '#ffedd5', text: '#9a3412' },
    { key: 'noOrders', label: 'No Orders', desc: 'Signed up but never ordered', icon: 'fas fa-user-clock', gradient: 'from-indigo-400 to-blue-500', bg: '#e0e7ff', text: '#3730a3' },
];

function computeRFM(bookings, users) {
    const now = new Date();
    const okBookings = completed(bookings);

    // Build per-user stats including all users (even those with 0 orders)
    const userStats = {};
    users.forEach(u => {
        if (u && u.id) {
            userStats[u.id] = { user: u, orders: 0, revenue: 0, lastOrderDate: null };
        }
    });

    okBookings.forEach(b => {
        if (!b.userId) return;
        // If booking is by a user not in our users list, add them temporarily anyway
        if (!userStats[b.userId]) {
            userStats[b.userId] = { user: { id: b.userId, firstName: 'Unknown' }, orders: 0, revenue: 0, lastOrderDate: null };
        }
        userStats[b.userId].orders += 1;
        userStats[b.userId].revenue += (b.totalAmount || 0);
        const d = new Date(b.createdAt);
        if (!userStats[b.userId].lastOrderDate || d > userStats[b.userId].lastOrderDate) {
            userStats[b.userId].lastOrderDate = d;
        }
    });

    // Calculate RFM scores for those who HAVE ordered
    const userEntries = Object.values(userStats).map((stats) => {
        const daysSinceLast = stats.lastOrderDate ? Math.floor((now - stats.lastOrderDate) / (1000 * 60 * 60 * 24)) : 999;
        return { ...stats.user, ...stats, daysSinceLast };
    });

    const orderedUsers = userEntries.filter(u => u.orders > 0);
    const zeroOrderUsers = userEntries.filter(u => u.orders === 0);

    if (orderedUsers.length === 0) {
        return RFM_SEGMENTS.map(s => ({
            ...s,
            count: s.key === 'noOrders' ? zeroOrderUsers.length : 0,
            revenue: 0,
            avgOrders: '0',
            avgRecency: 0,
            users: s.key === 'noOrders' ? zeroOrderUsers : []
        }));
    }

    // Segment each user using explicit rules rather than percentiles, for realistic distributions
    const segments = { champions: [], loyal: [], potential: [], new: [], atRisk: [], noOrders: zeroOrderUsers };

    orderedUsers.forEach(u => {
        if (u.daysSinceLast > 90) {
            // No activity in 3+ months -> At Risk
            segments.atRisk.push(u);
        } else if (u.orders === 1) {
            // Only 1 order total, ordered recently -> New Customer
            segments.new.push(u);
        } else if (u.orders >= 4 && u.daysSinceLast <= 30) {
            // Highly frequent and very recent -> Champion
            segments.champions.push(u);
        } else if (u.orders >= 2 && u.daysSinceLast <= 30) {
            // Ordered again recently -> Potential Loyalist
            segments.potential.push(u);
        } else {
            // Frequent but not in the last 30 days -> Loyal
            segments.loyal.push(u);
        }
    });

    return RFM_SEGMENTS.map(s => ({
        ...s,
        count: segments[s.key].length,
        users: segments[s.key],
        revenue: segments[s.key].reduce((sum, u) => sum + (u.revenue || 0), 0),
        avgOrders: segments[s.key].length > 0
            ? (segments[s.key].reduce((sum, u) => sum + u.orders, 0) / segments[s.key].length).toFixed(1)
            : '0',
        avgRecency: segments[s.key].length > 0 && s.key !== 'noOrders'
            ? Math.round(segments[s.key].reduce((sum, u) => sum + u.daysSinceLast, 0) / segments[s.key].length)
            : 0,
    }));
}

// ─── Modal Component for RFM User List ──────────────────────────────────────────────
const RFMUserListModal = ({ isOpen, onClose, segmentLabel, users }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{segmentLabel}</h2>
                        <p className="text-xs text-gray-500">{users.length} users in this segment</p>
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
                            <p>No users currently in this segment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((u, idx) => (
                                <div key={u.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3 mb-3 sm:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0">
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
                                            <p className="text-sm font-extrabold text-gray-900">{u.orders} Orders</p>
                                        </div>
                                        <div className="text-xs text-gray-400 text-left sm:text-right">
                                            <p className="font-semibold text-gray-600 mt-1">{shortINR(u.revenue || 0)} Total Value</p>
                                            {u.lastOrderDate ? (
                                                <p>{u.daysSinceLast} days since last order</p>
                                            ) : (
                                                <p>Never ordered</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with actions */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    <button
                        onClick={() => {
                            const headers = ['First Name', 'Last Name', 'Phone', 'Type', 'Total Orders', 'Revenue', 'Days Since Last Order'];
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + headers.join(",") + "\n"
                                + users.map(e => [
                                    e.firstName,
                                    e.lastName,
                                    e.phoneNumber,
                                    e.userType,
                                    e.orders,
                                    e.revenue,
                                    e.lastOrderDate ? e.daysSinceLast : 'N/A'
                                ].join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `RFM_${segmentLabel.replace(/ /g, '_')}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors"
                    >
                        <i className="fas fa-file-csv"></i> Export List
                    </button>
                </div>
            </div>
        </div>
    );
};

const RFMSegmentation = ({ bookings, users }) => {
    // Determine available months from all completed bookings
    const availableMonths = useMemo(() => {
        const okBookings = completed(bookings);
        const months = new Set();
        okBookings.forEach(b => {
            if (b.createdAt) {
                months.add(monthKey(b.createdAt));
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [bookings]);

    const [selectedMonth, setSelectedMonth] = useState('all');

    // Filter bookings and users based on selected month
    const filteredData = useMemo(() => {
        if (selectedMonth === 'all') return { bookings, users };

        // Only include bookings from the selected month
        const filteredBookings = bookings.filter(b => b.createdAt && monthKey(b.createdAt) === selectedMonth);

        // For 'month' view, users list is just the same (we still count people who gave 0 orders as noOrders, but only looking at THIS month's bookings)
        // Note: To be strictly "RFM for January", users who signed up in Jan but placed no orders are "No Orders" for Jan.
        // Users who signed up earlier and placed no orders in Jan are also technically "No Orders" for Jan.
        // For simplicity, we keep the original users array, and the computeRFM will naturally show 0 orders if they didn't order in this month.
        return { bookings: filteredBookings, users };
    }, [bookings, users, selectedMonth]);

    const segments = useMemo(() => computeRFM(filteredData.bookings, filteredData.users), [filteredData]);
    const totalOrderedUsers = segments.filter(s => s.key !== 'noOrders').reduce((s, seg) => s + seg.count, 0);
    const totalUsers = segments.reduce((s, seg) => s + seg.count, 0);

    const [modalData, setModalData] = useState({ isOpen: false, segment: null });

    const openModal = (segment) => {
        setModalData({ isOpen: true, segment });
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 pt-5 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                            <i className="fas fa-users-viewfinder text-white text-sm"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">RFM Customer Segmentation</h3>
                            <p className="text-[11px] text-gray-400 w-full sm:max-w-md">Users segmented by Recency, Frequency, and Monetary value. Click to view users for follow-up.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-right">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Period:</span>
                            <select
                                className="text-sm border-gray-200 rounded-lg py-1.5 pl-3 pr-8 focus:ring-rose-500 focus:border-rose-500 text-gray-700 bg-gray-50 hover:bg-white cursor-pointer transition-colors shadow-sm"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="all">Lifetime (All Time)</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{monthLabel(m)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-sm font-bold text-gray-800 block">{totalUsers} total users</span>
                            <span className="text-[10px] text-gray-400">({totalOrderedUsers} ordering users)</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-5 pb-5">
                    {segments.map(seg => {
                        const pct = totalUsers > 0 ? Math.round((seg.count / totalUsers) * 100) : 0;
                        return (
                            <button key={seg.key} onClick={() => openModal(seg)} className="text-left rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${seg.gradient}`} />
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: seg.bg }}>
                                            <i className={`${seg.icon} text-xs`} style={{ color: seg.text }}></i>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-800 leading-tight">{seg.label}</p>
                                        </div>
                                    </div>
                                    <i className="fas fa-external-link-alt text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </div>
                                <p className="text-[9px] text-gray-400 mb-2 min-h-[28px]">{seg.desc}</p>
                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${seg.gradient} transition-all duration-500`}
                                        style={{ width: `${Math.max(pct, 2)}%` }} />
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-center items-end">
                                    <div>
                                        <p className="text-xl font-extrabold text-gray-900 leading-none">{seg.count}</p>
                                        <p className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">Users ({pct}%)</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-gray-900 leading-none">{shortINR(seg.revenue)}</p>
                                        <p className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">Rev</p>
                                    </div>
                                    <div>
                                        {seg.key === 'noOrders' ? (
                                            <p className="text-sm font-bold text-gray-300 leading-none">—</p>
                                        ) : (
                                            <p className="text-sm font-extrabold text-gray-900 leading-none">{seg.avgOrders}</p>
                                        )}
                                        <p className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">Avg Ord</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <RFMUserListModal
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                segmentLabel={modalData.segment?.label}
                users={modalData.segment?.users || []}
            />
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════


export default BusinessMetrics;
