import React, { useState, useEffect } from 'react';
import { labourAPI } from '../services/labourAPI';

const Attendance = ({ onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [labours, setLabours] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({}); // labourId -> { status, orders: [], id (if exists), salary }

    // Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [currentLabourId, setCurrentLabourId] = useState(null);
    const [currentOrders, setCurrentOrders] = useState([]);
    const [newOrderName, setNewOrderName] = useState('');
    const [newOrderAmount, setNewOrderAmount] = useState('');

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const laboursData = await labourAPI.fetchLabours();
            const activeLabours = laboursData.filter(l => l.isActive !== false);
            setLabours(activeLabours);

            const attendanceList = await labourAPI.fetchAttendanceByDate(date);

            const newMap = {};
            activeLabours.forEach(l => {
                const existing = attendanceList.find(a => a.labourId === l.id);
                let orders = [];
                if (existing && existing.orderTaken) {
                    try {
                        // Try parsing as JSON first
                        const parsed = JSON.parse(existing.orderTaken);
                        if (Array.isArray(parsed)) {
                            orders = parsed;
                        } else {
                            // Legacy: treat string as one order with 0 amount (or handle as needed)
                            orders = [{ id: Date.now(), name: existing.orderTaken, amount: 0 }];
                        }
                    } catch (e) {
                        // Not JSON, simple string
                        if (existing.orderTaken.trim()) {
                            orders = [{ id: Date.now(), name: existing.orderTaken, amount: 0 }];
                        }
                    }
                }

                if (existing) {
                    newMap[l.id] = {
                        ...existing,
                        orders, // Use parsed or default orders
                        isNew: false,
                        originalSalary: existing.salary || 0
                    };
                } else {
                    newMap[l.id] = {
                        status: 'Absent',
                        orders: [],
                        salary: 0,
                        isNew: true,
                        labourId: l.id
                    };
                }
            });
            setAttendanceMap(newMap);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateValues = (labour, status, orders) => {
        const dailySalary = labour.dailySalary || 500;
        let totalOrderValue = orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);

        let calculatedSalary = 0;
        if (status === 'Present') {
            // Salary is at least daily salary, or total order value if higher
            calculatedSalary = Math.max(dailySalary, totalOrderValue);
        } else {
            // If absent, maybe they still get paid for orders? 
            // Usually Absent means 0, but if they did work (orders), logic might differ.
            // For now, assume if Absent but has orders, they get paid for orders.
            calculatedSalary = totalOrderValue;
        }

        const instantPayout = Math.max(0, totalOrderValue - dailySalary);

        return { calculatedSalary, instantPayout, totalOrderValue };
    };

    const handleStatusChange = (labourId, newStatus) => {
        setAttendanceMap(prev => {
            const current = prev[labourId];
            const labour = labours.find(l => l.id === labourId);

            const { calculatedSalary } = calculateValues(labour, newStatus, current.orders);

            return {
                ...prev,
                [labourId]: {
                    ...current,
                    status: newStatus,
                    salary: calculatedSalary
                }
            };
        });
    };

    // Open Modal
    const openOrderModal = (labourId) => {
        const record = attendanceMap[labourId];
        setCurrentLabourId(labourId);
        setCurrentOrders([...(record.orders || [])]);
        setNewOrderName('');
        setNewOrderAmount('');
        setShowOrderModal(true);
    };

    // Add Order in Modal
    const addOrder = () => {
        if (!newOrderName.trim()) return;
        const order = {
            id: Date.now(),
            name: newOrderName,
            amount: parseFloat(newOrderAmount) || 0
        };
        setCurrentOrders([...currentOrders, order]);
        setNewOrderName('');
        setNewOrderAmount('');
    };

    // Remove Order in Modal
    const removeOrder = (orderId) => {
        setCurrentOrders(currentOrders.filter(o => o.id !== orderId));
    };

    // Save Modal Changes
    const saveOrders = () => {
        setAttendanceMap(prev => {
            const current = prev[currentLabourId];
            const labour = labours.find(l => l.id === currentLabourId);
            const { calculatedSalary } = calculateValues(labour, current.status, currentOrders);

            return {
                ...prev,
                [currentLabourId]: {
                    ...current,
                    orders: currentOrders,
                    salary: calculatedSalary
                }
            };
        });
        setShowOrderModal(false);
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const promises = Object.values(attendanceMap).map(async (record) => {
                const input = {
                    date,
                    labourId: record.labourId,
                    status: record.status,
                    orderTaken: JSON.stringify(record.orders),
                    salary: record.salary
                };

                // Calculate salary difference for Total Earnings
                let salaryDiff = 0;
                if (record.isNew) {
                    salaryDiff = record.salary || 0;
                } else {
                    salaryDiff = (record.salary || 0) - (record.originalSalary || 0);
                }

                // Update Labour's Total Earnings if changed
                if (salaryDiff !== 0) {
                    const labour = labours.find(l => l.id === record.labourId);
                    if (labour) {
                        try {
                            const currentEarnings = labour.totalEarnings || 0;
                            await labourAPI.updateLabour({
                                id: labour.id,
                                totalEarnings: currentEarnings + salaryDiff
                            });
                        } catch (err) {
                            console.error("Failed to update labour earnings", err);
                        }
                    }
                }

                if (record.isNew) {
                    return labourAPI.createAttendance(input);
                } else {
                    return labourAPI.updateAttendance({
                        id: record.id,
                        ...input
                    });
                }
            });

            await Promise.all(promises);
            alert('Attendance saved successfully!');
            fetchData();
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert("Failed to save attendance.");
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        setAttendanceMap(prev => {
            const next = { ...prev };
            labours.forEach(l => {
                if (next[l.id]) {
                    const { calculatedSalary } = calculateValues(l, 'Present', next[l.id].orders);
                    next[l.id] = {
                        ...next[l.id],
                        status: 'Present',
                        salary: calculatedSalary
                    };
                }
            });
            return next;
        });
    };

    return (
        <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto w-full text-sm">
            <div className="flex flex-col sm:flex-row justify-between mb-6 items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (typeof onNavigate === 'function') {
                                onNavigate('labours');
                            }
                        }}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <i className="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={saveAttendance}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        {saving && <i className="fas fa-spinner fa-spin"></i>}
                        Save Changes
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Mark Attendance for {date}</span>
                        <div className="flex gap-4">
                            <button onClick={markAllPresent} className="text-blue-600 text-xs font-medium hover:underline">Mark All Present</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="px-6 py-3 font-semibold">Labour Name</th>
                                    <th className="px-6 py-3 font-semibold text-center">Status</th>
                                    <th className="px-6 py-3 font-semibold">Orders</th>
                                    <th className="px-6 py-3 font-semibold">Financials</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {labours.map(labour => {
                                    const record = attendanceMap[labour.id] || {};
                                    const { instantPayout, totalOrderValue } = calculateValues(labour, record.status, record.orders || []);

                                    return (
                                        <tr key={labour.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{labour.name}</div>
                                                <div className="text-xs text-gray-500">{labour.phoneNumber}</div>
                                                <div className="text-xs text-gray-400">Daily: ₹{labour.dailySalary}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                                    <button
                                                        onClick={() => handleStatusChange(labour.id, 'Present')}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${record.status === 'Present'
                                                            ? 'bg-green-500 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(labour.id, 'Absent')}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${record.status === 'Absent'
                                                            ? 'bg-red-500 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openOrderModal(labour.id)}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium flex items-center gap-2"
                                                >
                                                    <i className="fas fa-list"></i>
                                                    {record.orders?.length || 0} Orders (₹{totalOrderValue})
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">Total Salary:</span>
                                                        <span className="font-medium">₹{record.salary}</span>
                                                    </div>
                                                    {instantPayout > 0 && (
                                                        <div className="flex justify-between text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                                            <span>Instant Payout:</span>
                                                            <span>₹{instantPayout}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {labours.length === 0 && <div className="p-8 text-center text-gray-500">No active labours found.</div>}
                </div>
            )}

            {/* Order Management Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Manage Orders</h3>
                            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newOrderName}
                                    onChange={(e) => setNewOrderName(e.target.value)}
                                    placeholder="Order Name"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <input
                                    type="number"
                                    value={newOrderAmount}
                                    onChange={(e) => setNewOrderAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="w-24 px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <button
                                    onClick={addOrder}
                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {currentOrders.length === 0 ? (
                                    <div className="text-center text-gray-400 py-4 text-sm">No orders added yet.</div>
                                ) : (
                                    currentOrders.map(order => (
                                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                            <div>
                                                <div className="font-medium text-sm text-gray-900">{order.name}</div>
                                                <div className="text-xs text-gray-500">₹{order.amount}</div>
                                            </div>
                                            <button
                                                onClick={() => removeOrder(order.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-medium">
                                <span>Total Value:</span>
                                <span>₹{currentOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)}</span>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveOrders}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                Save Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
