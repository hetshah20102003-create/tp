import React, { useState, useEffect, useMemo } from 'react';
import { sendNotificationToTokens, notifyAllUsers } from '../services/notificationAPI';
import { usersAPI } from '../services/usersAPI';

const SendNotification = () => {
    const [targetType, setTargetType] = useState('all'); // 'all' | 'specific'
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [isUsersLoading, setIsUsersLoading] = useState(false);

    // Fetch users when 'specific' target type is selected
    useEffect(() => {
        if (targetType === 'specific' && users.length === 0) {
            const loadUsers = async () => {
                setIsUsersLoading(true);
                try {
                    // Fetch both Customers (1) and Labours (2)
                    const [customers, labours] = await Promise.all([
                        usersAPI.fetchUsers(1),
                        usersAPI.fetchUsers(2)
                    ]);

                    const combinedUsers = [
                        ...customers.map(u => ({ ...u, typeLabel: 'Customer' })),
                        ...labours.map(u => ({ ...u, typeLabel: 'Labour' }))
                    ];
                    setUsers(combinedUsers);
                } catch (error) {
                    console.error("Failed to load users:", error);
                    setStatus({ type: 'error', message: 'Failed to load users list' });
                } finally {
                    setIsUsersLoading(false);
                }
            };
            loadUsers();
        }
    }, [targetType, users.length]);

    const filteredUsers = useMemo(() => {
        if (!userSearchQuery) return users.slice(0, 50); // Show first 50 by default
        const query = userSearchQuery.toLowerCase();
        return users.filter(user =>
            (user.firstName && user.firstName.toLowerCase().includes(query)) ||
            (user.lastName && user.lastName.toLowerCase().includes(query)) ||
            (user.phoneNumber && user.phoneNumber.includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query))
        ).slice(0, 50); // Limit results for performance
    }, [users, userSearchQuery]);

    const handleSend = async (e) => {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            setStatus({ type: 'error', message: 'Please enter Title and Body' });
            return;
        }

        if (targetType === 'specific' && !selectedUser) {
            setStatus({ type: 'error', message: 'Please select a user' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            let result;
            const notificationData = { title, body, imageUrl };

            if (targetType === 'all') {
                result = await notifyAllUsers(notificationData);
            } else {
                // Specific User
                if (!selectedUser.fcmToken) {
                    setStatus({ type: 'error', message: 'Selected user does not have a registered device (No FCM Token)' });
                    setIsLoading(false);
                    return;
                }
                result = await sendNotificationToTokens([selectedUser.fcmToken], notificationData);
            }

            if (result.success) {
                if (result.stats?.failed > 0) {
                    setStatus({
                        type: 'warning',
                        message: `Partially successful. Sent: ${result.stats.sent}, Failed: ${result.stats.failed}.`
                    });
                } else {
                    setStatus({
                        type: 'success',
                        message: `Notification sent successfully to ${targetType === 'all' ? 'all users' : selectedUser.firstName || 'User'}!`
                    });
                    // Reset form fields but keep target selection
                    setTitle('');
                    setBody('');
                    setImageUrl('');
                }
            } else {
                setStatus({ type: 'error', message: result.message || 'Failed to send notification' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                <p className="text-gray-500 mt-1">Send push notifications to all users or specific individuals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible p-6">
                        <form onSubmit={handleSend} className="space-y-6">
                            {status && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' :
                                        status.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'
                                    }`}>
                                    <i className={`fas mt-0.5 ${status.type === 'success' ? 'fa-check-circle' :
                                            status.type === 'warning' ? 'fa-exclamation-triangle' :
                                                'fa-exclamation-circle'
                                        }`}></i>
                                    <span className="text-sm font-medium">{status.message}</span>
                                </div>
                            )}

                            {/* Target Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Send To</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setTargetType('all'); setSelectedUser(null); }}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${targetType === 'all'
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${targetType === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <i className="fas fa-users"></i>
                                            </div>
                                            <div>
                                                <div className={`font-semibold ${targetType === 'all' ? 'text-blue-700' : 'text-gray-900'}`}>All Users</div>
                                                <div className="text-xs text-gray-500">Notify everyone</div>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTargetType('specific')}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${targetType === 'specific'
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${targetType === 'specific' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div>
                                                <div className={`font-semibold ${targetType === 'specific' ? 'text-blue-700' : 'text-gray-900'}`}>Specific User</div>
                                                <div className="text-xs text-gray-500">Pick one person</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* User Selection (Conditional) */}
                            {targetType === 'specific' && (
                                <div className="animate-fade-in-down">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            placeholder="Search by name or phone..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        <div className="absolute right-3 top-2.5 text-gray-400">
                                            <i className="fas fa-search"></i>
                                        </div>
                                    </div>

                                    {isUsersLoading ? (
                                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading users...
                                        </div>
                                    ) : (
                                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setUserSearchQuery(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username);
                                                        }}
                                                        className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b last:border-0 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 border-blue-100' : ''
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {user.firstName} {user.lastName}
                                                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    {user.typeLabel}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">{user.phoneNumber}</div>
                                                        </div>
                                                        {selectedUser?.id === user.id && (
                                                            <i className="fas fa-check text-blue-600"></i>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-sm text-gray-500 text-center">No users found</div>
                                            )}
                                        </div>
                                    )}
                                    {selectedUser && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Selected: <span className="font-semibold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</span>
                                            {selectedUser.fcmToken ? (
                                                <span className="text-green-600 ml-2"><i className="fas fa-mobile-alt mr-1"></i>Device Ready</span>
                                            ) : (
                                                <span className="text-red-500 ml-2"><i className="fas fa-exclamation-circle mr-1"></i>No Device Token</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Introduction to new feature..."
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="We are exciting to announce..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="https://example.com/image.png"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading || (targetType === 'specific' && !selectedUser)}
                                    className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm transition-all ${isLoading || (targetType === 'specific' && !selectedUser)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i>
                                            <span>Send Notification</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Preview</h3>

                        {/* Mobile Preview */}
                        <div className="border-4 border-gray-800 rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl max-w-[280px] mx-auto min-h-[500px] relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-gray-800 rounded-b-xl z-20"></div>

                            {/* Screen */}
                            <div className="bg-white h-full w-full pt-8 px-3 relative">
                                {/* Status Bar */}
                                <div className="flex justify-between text-[10px] font-semibold text-gray-900 mb-4 px-1">
                                    <span>9:41</span>
                                    <div className="flex gap-1">
                                        <i className="fas fa-signal"></i>
                                        <i className="fas fa-wifi"></i>
                                        <i className="fas fa-battery-full"></i>
                                    </div>
                                </div>

                                {/* Notification Card */}
                                {(title || body) && (
                                    <div className="bg-gray-50/90 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-200/50 mb-4 animate-fade-in-up">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                                <i className="fas fa-bell text-white text-[10px]"></i>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">APP NAME</span>
                                            <span className="text-[10px] text-gray-400 ml-auto">now</span>
                                        </div>
                                        <div>
                                            {title && <div className="font-semibold text-sm text-gray-900 mb-1">{title}</div>}
                                            {body && <div className="text-xs text-gray-600 leading-relaxed">{body}</div>}
                                            {imageUrl && (
                                                <div className="mt-2 rounded-lg overflow-hidden h-24 bg-gray-200">
                                                    <img src={imageUrl} alt="Notification" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!title && !body && (
                                    <div className="flex flex-col items-center justify-center h-40 text-gray-300 text-xs text-center mt-12">
                                        <i className="fas fa-mobile-alt text-2xl mb-2"></i>
                                        <div>Preview will appear here</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendNotification;
