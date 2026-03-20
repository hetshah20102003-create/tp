import React, { useState, useEffect } from 'react';
import { getSuggestionById } from '../services/suggestionData';

const StatusBadge = ({ status }) => {
	const style = {
		pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
		reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
		resolved: 'bg-green-100 text-green-700 border-green-200',
		rejected: 'bg-red-100 text-red-700 border-red-200'
	};
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border ${style[status] || 'bg-gray-100 text-gray-700'}`}>
			{status?.charAt(0).toUpperCase() + status?.slice(1)}
		</span>
	);
};

const CategoryBadge = ({ category }) => {
	const style = {
		feature: 'bg-purple-100 text-purple-700 border-purple-200',
		bug: 'bg-red-100 text-red-700 border-red-200',
		improvement: 'bg-blue-100 text-blue-700 border-blue-200',
		other: 'bg-gray-100 text-gray-700 border-gray-200'
	};
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border ${style[category] || 'bg-gray-100 text-gray-700'}`}>
			{category?.charAt(0).toUpperCase() + category?.slice(1)}
		</span>
	);
};

const PriorityBadge = ({ priority }) => {
	if (!priority) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">No Priority</span>;
	const style = {
		low: 'bg-green-100 text-green-700 border-green-200',
		medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
		high: 'bg-red-100 text-red-700 border-red-200'
	};
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border ${style[priority] || 'bg-gray-100 text-gray-700'}`}>
			{priority?.charAt(0).toUpperCase() + priority?.slice(1)} Priority
		</span>
	);
};

const SuggestionDetails = ({ suggestionId, onBack }) => {
	const [suggestion, setSuggestion] = useState(null);
	const [loading, setLoading] = useState(true);
	const [response, setResponse] = useState('');
	const [status, setStatus] = useState('');

	useEffect(() => {
		if (!suggestionId) return;
		try {
			setLoading(true);
			const suggestionData = getSuggestionById(suggestionId);
			if (suggestionData) {
				setSuggestion(suggestionData);
				setResponse(suggestionData.response || '');
				setStatus(suggestionData.status);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [suggestionId]);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleStatusUpdate = () => {
		console.log('Updating status:', status, 'Response:', response);
	};

	if (loading) {
		return (
			<div className="px-4 py-6 flex justify-center items-center h-64">
				<div className="flex items-center space-x-2">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
					<span className="text-gray-600 text-sm">Loading suggestion details...</span>
				</div>
			</div>
		);
	}

	if (!suggestion) {
		return (
			<div className="px-4 py-6 text-center">
				<i className="fas fa-search text-gray-400 text-3xl mb-2"></i>
				<h3 className="text-md font-medium text-gray-900 mb-1">Suggestion Not Found</h3>
				<p className="text-gray-500 mb-3 text-sm">The suggestion you're looking for doesn't exist.</p>
				<button
					onClick={onBack}
					className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
				>
					Back to Suggestions
				</button>
			</div>
		);
	}

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
				<div className="flex items-center space-x-3">
					<button
						onClick={onBack}
						className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
					>
						<i className="fas fa-arrow-left text-base"></i>
					</button>
					<div>
						<h1 className="text-xl font-bold text-gray-900">Suggestion Details</h1>
						<p className="text-gray-500 text-sm">ID: {suggestion.id}</p>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<CategoryBadge category={suggestion.category} />
					<PriorityBadge priority={suggestion.priority} />
					<StatusBadge status={suggestion.status} />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-4 lg:space-y-6">
					{/* User Info */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Submitted By</h2>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<i className="fas fa-user text-blue-600 text-base"></i>
							</div>
							<div>
								<h3 className="text-sm font-medium text-gray-900">{suggestion.userName}</h3>
								<p className="text-xs text-gray-600">{suggestion.userEmail}</p>
								<p className="text-xs text-gray-500">User ID: {suggestion.userId}</p>
							</div>
						</div>
					</div>

					{/* Suggestion Text */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Suggestion Details</h2>
						<p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{suggestion.suggestionText}</p>
					</div>

					{/* Admin Response */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Admin Response</h2>
						<div className="space-y-2">
							<textarea
								value={response}
								onChange={(e) => setResponse(e.target.value)}
								rows={4}
								className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
								placeholder="Enter your response..."
							/>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="pending">Pending</option>
									<option value="reviewed">Reviewed</option>
									<option value="resolved">Resolved</option>
									<option value="rejected">Rejected</option>
								</select>
								<button
									onClick={handleStatusUpdate}
									className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
								>
									Update Suggestion
								</button>
							</div>
						</div>
					</div>

					{/* Current Response */}
					{suggestion.response && (
						<div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
							<h3 className="text-xs font-semibold text-gray-900 mb-1">Current Response</h3>
							<p className="text-gray-700 text-sm whitespace-pre-wrap">{suggestion.response}</p>
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-4 lg:space-y-6">
					{/* Timeline */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Timeline</h2>
						<div className="space-y-2">
							<div className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
								<div>
									<p className="text-xs font-medium text-gray-900">Suggestion Submitted</p>
									<p className="text-xs text-gray-500">{formatDate(suggestion.createdAt)}</p>
								</div>
							</div>
							{suggestion.updatedAt !== suggestion.createdAt && (
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
									<div>
										<p className="text-xs font-medium text-gray-900">Last Updated</p>
										<p className="text-xs text-gray-500">{formatDate(suggestion.updatedAt)}</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Quick Info */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Quick Info</h2>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Category</span>
								<CategoryBadge category={suggestion.category} />
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Priority</span>
								<PriorityBadge priority={suggestion.priority} />
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Status</span>
								<StatusBadge status={suggestion.status} />
							</div>
							<div className="pt-1 border-t border-gray-200 flex justify-between">
								<span className="text-gray-600 text-sm">Response Status</span>
								<span className={`text-xs font-medium ${suggestion.response ? 'text-green-600' : 'text-gray-500'}`}>
									{suggestion.response ? 'Responded' : 'No Response'}
								</span>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-2 text-sm">
						<h2 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h2>
						<button className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
							<i className="fas fa-check text-xs"></i>
							<span>Mark as Resolved</span>
						</button>
						<button className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
							<i className="fas fa-envelope text-xs"></i>
							<span>Contact User</span>
						</button>
						<button className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
							<i className="fas fa-flag text-xs"></i>
							<span>Set Priority</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SuggestionDetails;
