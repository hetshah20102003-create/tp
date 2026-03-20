import React, { useState, useMemo } from 'react';
import { sampleSuggestions } from '../services/suggestionData';

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
		feature: 'bg-purple-100 text-purple-700',
		bug: 'bg-red-100 text-red-700',
		improvement: 'bg-blue-100 text-blue-700',
		other: 'bg-gray-100 text-gray-700'
	};
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium ${style[category] || 'bg-gray-100 text-gray-700'}`}>
			{category?.charAt(0).toUpperCase() + category?.slice(1)}
		</span>
	);
};

const PriorityBadge = ({ priority }) => {
	if (!priority) return null;
	
	const style = {
		low: 'bg-green-100 text-green-700',
		medium: 'bg-yellow-100 text-yellow-700',
		high: 'bg-red-100 text-red-700'
	};
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium ${style[priority] || 'bg-gray-100 text-gray-700'}`}>
			{priority?.charAt(0).toUpperCase() + priority?.slice(1)}
		</span>
	);
};

const SuggestionCard = ({ suggestion, onViewDetails }) => {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group">
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
							{suggestion.userName}
						</h3>
						<CategoryBadge category={suggestion.category} />
					</div>
					<p className="text-sm text-gray-500 mb-2">{suggestion.userEmail}</p>
					<p className="text-sm text-gray-600 line-clamp-3">
						{suggestion.suggestionText}
					</p>
				</div>
				<div className="flex flex-col items-end space-y-2 ml-4">
					<StatusBadge status={suggestion.status} />
					<PriorityBadge priority={suggestion.priority} />
				</div>
			</div>

			<div className="flex items-center justify-between pt-4 border-t border-gray-100">
				<div className="flex items-center space-x-4 text-sm text-gray-500">
					<div className="flex items-center space-x-1">
						<i className="fas fa-calendar-alt"></i>
						<span>{formatDate(suggestion.createdAt)}</span>
					</div>
					{suggestion.response && (
						<div className="flex items-center space-x-1">
							<i className="fas fa-reply text-blue-500"></i>
							<span className="text-blue-600">Response Available</span>
						</div>
					)}
				</div>
				<button
					onClick={() => onViewDetails(suggestion.id)}
					className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
				>
					View Details
				</button>
			</div>
		</div>
	);
};

const SuggestionsManagement = ({ onViewSuggestionDetails }) => {
	const [suggestions] = useState(sampleSuggestions);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [priorityFilter, setPriorityFilter] = useState('all');

	const filteredSuggestions = useMemo(() => {
		return suggestions.filter(suggestion => {
			const matchesSearch = searchQuery === '' || 
				`${suggestion.userName} ${suggestion.userEmail} ${suggestion.suggestionText}`.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
			const matchesCategory = categoryFilter === 'all' || suggestion.category === categoryFilter;
			const matchesPriority = priorityFilter === 'all' || suggestion.priority === priorityFilter;

			return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
		});
	}, [suggestions, searchQuery, statusFilter, categoryFilter, priorityFilter]);

	const stats = useMemo(() => {
		const total = suggestions.length;
		const pending = suggestions.filter(s => s.status === 'pending').length;
		const reviewed = suggestions.filter(s => s.status === 'reviewed').length;
		const resolved = suggestions.filter(s => s.status === 'resolved').length;
		const highPriority = suggestions.filter(s => s.priority === 'high').length;
		
		return { total, pending, reviewed, resolved, highPriority };
	}, [suggestions]);

	return (
		<div className="px-4 sm:px-6 lg:px-8 py-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Suggestions Management</h1>
					<p className="text-gray-600 mt-1">Review and manage user feedback and suggestions</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 bg-blue-50 rounded-lg mr-4">
							<i className="fas fa-lightbulb text-blue-600 text-xl"></i>
						</div>
						<div>
							<p className="text-sm text-gray-500">Total Suggestions</p>
							<p className="text-2xl font-bold text-gray-900">{stats.total}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 bg-yellow-50 rounded-lg mr-4">
							<i className="fas fa-clock text-yellow-600 text-xl"></i>
						</div>
						<div>
							<p className="text-sm text-gray-500">Pending</p>
							<p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 bg-blue-50 rounded-lg mr-4">
							<i className="fas fa-eye text-blue-600 text-xl"></i>
						</div>
						<div>
							<p className="text-sm text-gray-500">Reviewed</p>
							<p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 bg-green-50 rounded-lg mr-4">
							<i className="fas fa-check-circle text-green-600 text-xl"></i>
						</div>
						<div>
							<p className="text-sm text-gray-500">Resolved</p>
							<p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<div className="flex items-center">
						<div className="p-3 bg-red-50 rounded-lg mr-4">
							<i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
						</div>
						<div>
							<p className="text-sm text-gray-500">High Priority</p>
							<p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
						<div className="relative">
							<i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search suggestions..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="reviewed">Reviewed</option>
							<option value="resolved">Resolved</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						>
							<option value="all">All Categories</option>
							<option value="feature">Feature</option>
							<option value="bug">Bug</option>
							<option value="improvement">Improvement</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
						<select
							value={priorityFilter}
							onChange={(e) => setPriorityFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						>
							<option value="all">All Priorities</option>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={() => {
								setSearchQuery('');
								setStatusFilter('all');
								setCategoryFilter('all');
								setPriorityFilter('all');
							}}
							className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
						>
							<i className="fas fa-times mr-2"></i>
							Clear Filters
						</button>
					</div>
				</div>
				<div className="mt-4 flex justify-between items-center">
					<div className="text-sm text-gray-500">
						{filteredSuggestions.length} of {suggestions.length} suggestions
					</div>
				</div>
			</div>

			{/* Suggestions Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{filteredSuggestions.map((suggestion) => (
					<SuggestionCard
						key={suggestion.id}
						suggestion={suggestion}
						onViewDetails={onViewSuggestionDetails}
					/>
				))}
			</div>

			{filteredSuggestions.length === 0 && (
				<div className="text-center py-12">
					<div className="flex flex-col items-center">
						<i className="fas fa-search text-gray-300 text-4xl mb-4"></i>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions found</h3>
						<p className="text-gray-500">Try adjusting your filters or search criteria.</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default SuggestionsManagement;