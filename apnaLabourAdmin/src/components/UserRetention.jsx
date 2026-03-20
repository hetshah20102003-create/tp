import { fetchOrders } from '../services/ordersAPI';
import React, { useState, useEffect } from 'react';

// Mock Data Service - This will be removed
// const fetchRetentionData = (period) => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             const allData = [
//                 { month: 'Jan', total: 1200, retained: 1080, rate: 90, change: 2.5 },
//                 { month: 'Feb', total: 1350, retained: 1188, rate: 88, change: -2.0 },
//                 { month: 'Mar', total: 1500, retained: 1395, rate: 93, change: 5.0 },
//                 { month: 'Apr', total: 1600, retained: 1472, rate: 92, change: -1.0 },
//                 { month: 'May', total: 1750, retained: 1662, rate: 95, change: 3.0 },
//                 { month: 'Jun', total: 1900, retained: 1786, rate: 94, change: -1.0 },
//                 { month: 'Jul', total: 2050, retained: 1968, rate: 96, change: 2.0 },
//                 { month: 'Aug', total: 2200, retained: 2090, rate: 95, change: -1.0 },
//                 { month: 'Sep', total: 2350, retained: 2256, rate: 96, change: 1.0 },
//                 { month: 'Oct', total: 2500, retained: 2425, rate: 97, change: 1.0 },
//                 { month: 'Nov', total: 2650, retained: 2544, rate: 96, change: -1.0 },
//                 { month: 'Dec', total: 2800, retained: 2716, rate: 97, change: 1.0 },
//             ];

//             let sliceCount = 6;
//             if (period === 'Last 1 Month') sliceCount = 1;
//             else if (period === 'Last 3 Months') sliceCount = 3;
//             else if (period === 'Last 6 Months') sliceCount = 6;
//             else if (period === 'Last 12 Months') sliceCount = 12;

//             // Return the most recent N months
//             resolve(allData.slice(-sliceCount));
//         }, 600);
//     });
// };

const UserRetention = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Last 6 Months');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRealData = async () => {
            try {
                setLoading(true);
                setError(null); // Clear previous errors
                // Fetch all orders
                const orders = await fetchOrders();

                // Process data
                const processed = processOrderData(orders, period);
                setData(processed);
                setLoading(false);
            } catch (err) {
                console.error("Error loading retention data:", err);
                setError("Failed to load data");
                setLoading(false);
            }
        };
        loadRealData();
    }, [period]);

    // Process orders to calculate retention
    const processOrderData = (orders, timePeriod) => {
        // 1. Group orders by month (YYYY-MM) and User ID
        // Structure: { "2023-10": Set(userIds), "2023-11": Set(userIds), ... }
        const monthlyUsers = {};

        // Define date range based on period
        const now = new Date();
        let monthsBack = 6;
        if (timePeriod === 'Last 1 Month') monthsBack = 1;
        else if (timePeriod === 'Last 3 Months') monthsBack = 3;
        else if (timePeriod === 'Last 12 Months') monthsBack = 12;

        // Generate required month keys (current month inclusive)
        const requiredMonths = [];
        for (let i = 0; i < monthsBack; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            requiredMonths.unshift(key); // Push to front to keep ascending order
        }

        // Initialize map
        requiredMonths.forEach(m => monthlyUsers[m] = new Set());

        orders.forEach(order => {
            if (!order.createdAt || !order.userId) return;

            const d = new Date(order.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

            if (monthlyUsers[key]) {
                monthlyUsers[key].add(order.userId);
            }
        });

        // 2. Calculate metrics for each month
        // We need previous month data for retention calculation.
        // For the first month in our list, we might look for existing users in "any prior month" (lifetime retention) 
        // OR simpler: compare with Month M-1 (MoM Retention).
        // Let's stick to MoM Retention: "Users active in Month M who were also active in Month M-1"
        // Note: This requires Month M-1 data. For the first month in the view, we can't calculate MoM retention purely from the view's data unless we fetch extra.
        // Assuming fetchOrders returns ALL history, we can check.

        // Re-scan full history for specific retention logic if needed, but here simple MoM:
        const fullHistoryUsers = {}; // { "YYYY-MM": Set(ids) } - built from ALL orders
        orders.forEach(order => {
            if (!order.createdAt || !order.userId) return;
            const d = new Date(order.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!fullHistoryUsers[key]) fullHistoryUsers[key] = new Set();
            fullHistoryUsers[key].add(order.userId);
        });

        const result = requiredMonths.map((currentMonthKey, index) => {
            const currentUsers = monthlyUsers[currentMonthKey] || new Set();
            const totalUsers = currentUsers.size;

            // Determine Previous Month Key
            const [y, m] = currentMonthKey.split('-').map(Number);
            const prevDate = new Date(y, m - 1 - 1, 1); // Month is 0-indexed in JS Date
            const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

            // Calculate Retained: Count of users in Current Month who were also in Previous Month
            let retainedCount = 0;
            const prevUsers = fullHistoryUsers[prevMonthKey];

            if (prevUsers && prevUsers.size > 0) {
                currentUsers.forEach(userId => {
                    if (prevUsers.has(userId)) {
                        retainedCount++;
                    }
                });
            } else {
                // If previous month has no data (e.g., start of time), retention is undefined or 0.
                // Or maybe we treat everyone as new?
                retainedCount = 0;
            }

            // Rate: (Retained / Previous Month Users) * 100  <-- Standard Cohort Retention?
            // OR Simple Repeat Rate: (Retained / Current Total) * 100 ?
            // Let's stick to: "Percentage of Last Month's users who came back This Month"
            // Rate = (Retained Count / Previous Month Count) * 100"

            let rate = 0;
            const prevCount = prevUsers ? prevUsers.size : 0;

            if (prevCount > 0) {
                rate = (retainedCount / prevCount) * 100;
            } else {
                // If no previous users, rate is N/A. Let's show 0 or 100?
                // If totalUsers > 0 (all new), retention of previous cohort is technically undefined.
                // Let's display 0 for now.
                rate = 0;
            }

            // Format Month Label (e.g., "Jan", "Feb 24")
            const monthLabel = new Date(y, m - 1, 1).toLocaleString('default', { month: 'short' });

            return {
                month: monthLabel,
                fullDate: currentMonthKey,
                total: totalUsers,
                retained: retainedCount,
                rate: Math.round(rate),
                change: 0 // Will calculate in next pass
            };
        });

        // 3. Calculate Change (MoM difference in Rate)
        for (let i = 1; i < result.length; i++) {
            const diff = result[i].rate - result[i - 1].rate;
            result[i].change = Number(diff.toFixed(1));
        }

        return result;
    };

    // Derived Metrics
    const currentRate = data.length > 0 ? data[data.length - 1].rate : 0;
    const previousRate = data.length > 1 ? data[data.length - 2].rate : 0;
    const momChange = (currentRate - previousRate).toFixed(1);
    const avgRetention = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.rate, 0) / data.length).toFixed(1) : 0;
    const churnRate = (100 - currentRate).toFixed(1);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Chart Rendering Logic (Simple SVG Line Chart)
    const chartHeight = 200;
    const chartWidth = 600; // adjustable via viewBox
    const maxRate = 100;
    const minRate = 80; // Zoom in on the top range for better visibility

    const getX = (index) => (index / (data.length - 1)) * chartWidth;
    const getY = (rate) => chartHeight - ((rate - minRate) / (maxRate - minRate)) * chartHeight;

    const points = data.length > 1
        ? data.map((d, i) => `${getX(i)},${getY(d.rate)}`).join(' ')
        : `${chartWidth / 2},${getY(data[0].rate)}`; // Handle single point case

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monthly User Retention</h1>
                    <p className="text-gray-500 text-sm mt-1">Track user engagement and retention over time</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto">
                    {['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 12 Months'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${period === p
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Retention */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Current Retention</h3>
                        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${momChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {momChange >= 0 ? <i className="fas fa-arrow-up text-xs"></i> : <i className="fas fa-arrow-down text-xs"></i>}
                            {Math.abs(momChange)}%
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">{currentRate}%</span>
                        <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                </div>

                {/* Average Retention */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Average Retention</h3>
                        <i className="fas fa-chart-line text-gray-400"></i>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">{avgRetention}%</span>
                        <span className="text-sm text-gray-500">avg. over period</span>
                    </div>
                </div>

                {/* Churn Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Churn Rate</h3>
                        <i className="fas fa-user-minus text-gray-400"></i>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">{churnRate}%</span>
                        <span className="text-sm text-gray-500">users lost</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Retention Trend</h3>
                    <div className="relative w-full h-64">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">

                            {/* Grid Lines */}
                            {[0, 1, 2, 3, 4].map((i) => {
                                const y = (i / 4) * chartHeight;
                                const value = maxRate - (i / 4) * (maxRate - minRate);
                                return (
                                    <g key={i}>
                                        <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e5e7eb" strokeDasharray="4" />
                                        <text x="-10" y={y + 4} textAnchor="end" className="text-xs fill-gray-400">{value}%</text>
                                    </g>
                                );
                            })}

                            {/* Data Path - only render if we have points */}
                            {data.length > 1 && (
                                <path
                                    d={`M ${points}`}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-md"
                                />
                            )}

                            {/* Data Points */}
                            {data.map((d, i) => {
                                const cx = data.length > 1 ? getX(i) : chartWidth / 2;
                                return (
                                    <g key={i} className="group">
                                        <circle
                                            cx={cx}
                                            cy={getY(d.rate)}
                                            r="5"
                                            fill="white"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            className="cursor-pointer transition-all duration-200 group-hover:r-7"
                                        />
                                        {/* Tooltip */}
                                        <foreignObject x={cx - 40} y={getY(d.rate) - 50} width="80" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 text-center shadow-lg">
                                                {d.rate}%<br />
                                                <span className="text-gray-400">{d.month}</span>
                                            </div>
                                        </foreignObject>

                                        {/* X Axis Labels */}
                                        <text x={cx} y={chartHeight + 20} textAnchor="middle" className="text-xs fill-gray-500 font-medium">
                                            {d.month}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Detailed Table Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Monthly Breakdown</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 h-[300px]">
                        <table className="w-full text-sm text-left relative">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Month</th>
                                    <th className="px-6 py-3 text-right">Total Users</th>
                                    <th className="px-6 py-3 text-right">Retained</th>
                                    <th className="px-6 py-3 text-right">Rate</th>
                                    <th className="px-6 py-3 text-right">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...data].reverse().map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.month}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{row.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{row.retained.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {row.rate}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`flex items-center justify-end gap-1 ${row.change > 0 ? 'text-green-600' : row.change < 0 ? 'text-red-600' : 'text-gray-500'
                                                }`}>
                                                {row.change > 0 ? '+' : ''}{row.change}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button className="w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRetention;
