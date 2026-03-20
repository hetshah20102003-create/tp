import React, { useState, useEffect, useMemo } from 'react';
import { labourAPI } from '../services/labourAPI';

// Helper Component for Image
const LabourImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        const refreshImage = async () => {
            if (!src) return;
            // Check if it looks like an S3 URL
            if (src.includes('amazonaws.com') || src.startsWith('public/')) {
                try {
                    // Try to extract key if it's a full URL
                    let key = src;
                    if (src.startsWith('http')) {
                        const urlObj = new URL(src);
                        // Extract key from pathname. Remove leading slash.
                        // Decode URI component to handle spaces/special chars
                        let path = decodeURIComponent(urlObj.pathname.substring(1));

                        // If path starts with public/, use it. 
                        // Note: Some S3 URLs might have bucket name in path. 
                        // We assume standard Amplify structure where key starts with public/
                        const publicIndex = path.indexOf('public/');
                        if (publicIndex !== -1) {
                            key = path.substring(publicIndex);
                        } else {
                            // If we can't find 'public/', it might be a direct key or different structure.
                            // Fallback to using the whole path if it doesn't look like a standard URL
                            console.warn("Could not determine S3 key from URL, trying pathname", path);
                            key = path;
                        }
                    }

                    const freshUrl = await labourAPI.getImageUrl(key);
                    if (freshUrl) setImgSrc(freshUrl);
                } catch (e) {
                    console.error("Failed to refresh image", e);
                }
            }
        };

        refreshImage();
    }, [src]);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.onerror = null;
                // e.target.src = 'placeholder.png'; // Optional placeholder
            }}
        />
    );
};

const LabourList = ({ onNavigate, onEdit }) => {
    console.log("LabourList rendered. onNavigate:", onNavigate, "type:", typeof onNavigate);
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLabours();
    }, []);

    const fetchLabours = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await labourAPI.fetchLabours();
            setLabours(data);
        } catch (error) {
            console.error("Failed to load labours", error);
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return labours.filter(l => {
            const q = query.toLowerCase();
            const matchesQuery = (
                (l.name && l.name.toLowerCase().includes(q)) ||
                (l.phoneNumber && l.phoneNumber.includes(q)) ||
                (l.idNumber && l.idNumber.toLowerCase().includes(q))
            );

            // isActive might be true, false, or null/undefined (legacy items are active)
            const isLabourActive = l.isActive !== false; // Default to true if undefined

            // If showInactive is TRUE: Show ALL (Active + Inactive)
            // If showInactive is FALSE: Show ONLY Active
            const matchesActive = showInactive ? true : isLabourActive;

            // Alternative: If user wants to see ONLY inactive when checked, we'd do:
            // const matchesActive = showInactive ? !isLabourActive : isLabourActive;
            // But standard "Show Inactive" usually means "Include Inactive".
            // Let's assume the user might want to see ONLY inactive if they check it? 
            // Or maybe the issue is that it's NOT showing inactive even when checked?
            // "when click to show inactive not showing data" -> implies when they check it, they expected to see inactive people but maybe saw nothing? 
            // If they have inactive people, `showInactive=true` returning `true` should show them.

            // Let's debug by logging. But for the fix, let's assume "Show Inactive" means "Show Inactive Only" is NOT standard.
            // Let's Try: Checkbox = "Show Inactive" -> Toggle between "Active Only" and "All". 
            // If the user meant "I clicked it and nothing happened", maybe the state didn't update?

            return matchesQuery && matchesActive;
        });
    }, [labours, query, showInactive]);

    return (
        <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto w-full text-sm">
            <div className="flex flex-col sm:flex-row justify-between mb-4 items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Labour Management</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            id="show-inactive"
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="show-inactive" className="text-gray-600 text-sm cursor-pointer select-none">Show Inactive</label>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                    <button
                        onClick={() => {
                            if (typeof onNavigate === 'function') {
                                onNavigate('attendance');
                            } else {
                                console.error("onNavigate is not a function!", onNavigate);
                                alert("Navigation error");
                            }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <i className="fas fa-calendar-check mr-2"></i> Attendance
                    </button>
                    <button
                        onClick={() => {
                            if (typeof onNavigate === 'function') {
                                onNavigate('add-labour');
                            } else {
                                console.error("onNavigate is not a function!", onNavigate);
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <i className="fas fa-plus mr-2"></i> Add Labour
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search labours by name, phone or ID..."
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            {/* List */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error loading data:</p>
                    <p>{error}</p>
                    <p className="text-sm mt-1">If this says "Cannot query field totalEarnings", please run <code>amplify push</code> in your terminal.</p>
                </div>
            )}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 px-6 py-3">
                        <div>Name</div>
                        <div>Contact</div>
                        <div>ID Number</div>
                        <div>Daily Salary</div>
                        <div>Total Earnings</div>
                        <div className="text-center">Action</div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filtered.map((labour) => (
                            <div key={labour.id} className="hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] px-6 py-4 items-center hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {labour.photo ?
                                            <LabourImage src={labour.photo} alt={labour.name} className="w-full h-full object-cover" />
                                            : labour.name.charAt(0)
                                        }
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{labour.name}</div>
                                    </div>
                                </div>
                                <div className="text-gray-600">{labour.phoneNumber || "-"}</div>
                                <div className="text-gray-600">{labour.idNumber || "-"}</div>
                                <div className="text-gray-600">₹{labour.dailySalary || "0"}</div>
                                <div className="text-gray-600 font-medium">₹{labour.totalEarnings || "0"}</div>
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => onEdit && onEdit(labour.id)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                        title="Edit"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Are you sure you want to ${labour.isActive !== false ? 'deactivate' : 'activate'} ${labour.name}?`)) {
                                                try {
                                                    await labourAPI.updateLabour({
                                                        id: labour.id,
                                                        isActive: !labour.isActive
                                                    });
                                                    fetchLabours();
                                                } catch (e) {
                                                    console.error("Error updating status", e);
                                                    alert("Failed to update status");
                                                }
                                            }
                                        }}
                                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition w-16 text-center ${labour.isActive !== false
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                    >
                                        {labour.isActive !== false ? "Active" : "Inactive"}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Mobile View */}
                        {filtered.map((labour) => (
                            <div key={labour.id} className="md:hidden p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {labour.photo ?
                                            <LabourImage src={labour.photo} alt={labour.name} className="w-full h-full object-cover" />
                                            : labour.name.charAt(0)
                                        }
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{labour.name}</div>
                                        <div className="text-xs text-gray-500">{labour.phoneNumber}</div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit && onEdit(labour.id)}
                                        className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <div>
                                        <div className="font-medium text-gray-900">₹{labour.dailySalary}</div>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${labour.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {labour.isActive !== false ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No labours found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabourList;
