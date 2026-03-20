import React, { useState, useEffect } from 'react';
import { labourAPI } from '../services/labourAPI';

// Helper Component for Image (Reused from LabourList)
const LabourImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src); // Reset if src changes (e.g. new upload)
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
                        let path = decodeURIComponent(urlObj.pathname.substring(1));

                        const publicIndex = path.indexOf('public/');
                        if (publicIndex !== -1) {
                            key = path.substring(publicIndex);
                        } else {
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
            }}
        />
    );
};

const AddLabour = ({ onNavigate, labourId }) => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!labourId);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        idNumber: '', // Custom ID No
        dailySalary: '',
        isActive: true
    });
    // For storing fetched data to avoid overwriting with null
    const [existingData, setExistingData] = useState(null);

    const [aadharMethod, setAadharMethod] = useState('file'); // 'file' or 'camera'
    const [aadharFile, setAadharFile] = useState(null);
    const [userPhotoFile, setUserPhotoFile] = useState(null);
    const [preview, setPreview] = useState({ aadhar: null, photo: null });

    useEffect(() => {
        if (labourId) {
            fetchLabourDetails();
        }
    }, [labourId]);

    const fetchLabourDetails = async () => {
        try {
            setInitialLoading(true);
            const data = await labourAPI.fetchLabours(); // Fetch all (simplest way given current API)
            const labour = data.find(l => l.id === labourId);
            if (labour) {
                setFormData({
                    name: labour.name || '',
                    phoneNumber: labour.phoneNumber || '',
                    idNumber: labour.idNumber || '',
                    dailySalary: labour.dailySalary || '',
                    isActive: labour.isActive !== false
                });
                setExistingData(labour);
                setPreview({
                    aadhar: labour.aadharCardImage || null,
                    photo: labour.photo || null
                });
            }
        } catch (e) {
            console.error("Failed to fetch labour details", e);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'aadhar') setAadharFile(file);
            if (type === 'photo') setUserPhotoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let aadharUrl = existingData?.aadharCardImage || null;
            let photoUrl = existingData?.photo || null;

            if (aadharFile) {
                const result = await labourAPI.uploadImage(aadharFile);
                if (result.success) aadharUrl = result.data.key; // Store key preferably, but let's stick to url if that's what we did before. 
                // Wait, if we want to fix images, we should store keys if we updated LabourList to handle keys.
                // Our LabourList handles both. Storing key is safer for future.
                // NOTE: labourAPI.uploadImage returns { imageUrl, key }.
                // Let's store the full URL to be consistent with old data, OR the key if we are migrating.
                // Since LabourImage component handles keys, let's try to store the KEY now for new/updated images if possible.
                // But wait, the previous code stored `imageUrl`.
                // Let's store `imageUrl` (signed) AND we can't easily change database schema to store key separately without migration.
                // BUT, `LabourImage` handles full URLs too.
                // Let's store the signed URL for now to minimize breakage, but `LabourList` will extract key from it.
                if (result.success) aadharUrl = result.data.imageUrl;
            }

            if (userPhotoFile) {
                const result = await labourAPI.uploadImage(userPhotoFile);
                if (result.success) photoUrl = result.data.imageUrl;
            }

            const input = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                idNumber: formData.idNumber,
                dailySalary: parseFloat(formData.dailySalary) || 0,
                isActive: formData.isActive,
                aadharCardImage: aadharUrl,
                photo: photoUrl
            };

            if (labourId) {
                await labourAPI.updateLabour({
                    id: labourId,
                    ...input
                });
            } else {
                await labourAPI.createLabour(input);
            }

            if (typeof onNavigate === 'function') {
                onNavigate('labours');
            }
        } catch (error) {
            console.error('Error saving labour:', error);
            alert('Failed to save labour. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="text-center py-10">Loading details...</div>;
    }

    return (
        <div className="px-4 md:px-6 py-4 max-w-3xl mx-auto w-full text-sm">
            <div className="flex items-center gap-4 mb-6">
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
                <h1 className="text-2xl font-bold text-gray-900">{labourId ? 'Edit Labour' : 'Add New Labour'}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. 9876543210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (Custom ID)</label>
                            <input
                                type="text"
                                name="idNumber"
                                value={formData.idNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. L-101"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Everyday Salary (₹)</label>
                            <input
                                type="number"
                                name="dailySalary"
                                value={formData.dailySalary}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. 500"
                            />
                        </div>

                        {labourId && existingData && (
                            <div className="md:col-span-2 bg-gray-50 p-3 rounded text-xs text-gray-600">
                                <span className="font-semibold">Note:</span> Total Earnings (₹{existingData.totalEarnings || 0}) are updated automatically via Attendance and cannot be edited manually.
                            </div>
                        )}
                    </div>

                    {/* Uploads */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Documents & Photos</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Photo</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'aadhar')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center">
                                        {preview.aadhar ? (
                                            <LabourImage src={preview.aadhar} alt="Aadhar Preview" className="h-24 w-auto object-cover rounded mb-2" />
                                        ) : (
                                            <i className="fas fa-id-card text-2xl text-gray-400 mb-2"></i>
                                        )}
                                        <span className="text-sm text-gray-600">
                                            {aadharFile ? aadharFile.name : (preview.aadhar ? "Click to change" : "Click to upload Aadhar Card")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Labour Photo</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'photo')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center">
                                        {preview.photo ? (
                                            <LabourImage src={preview.photo} alt="Photo Preview" className="h-24 w-auto object-cover rounded mb-2" />
                                        ) : (
                                            <i className="fas fa-user-circle text-2xl text-gray-400 mb-2"></i>
                                        )}
                                        <span className="text-sm text-gray-600">
                                            {userPhotoFile ? userPhotoFile.name : (preview.photo ? "Click to change" : "Click to upload Photo")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof onNavigate === 'function') {
                                    onNavigate('labours');
                                }
                            }}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading && <i className="fas fa-spinner fa-spin"></i>}
                            {labourId ? 'Update Labour' : 'Save Labour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLabour;
