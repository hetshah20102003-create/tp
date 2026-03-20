import React, { useState, useEffect, useMemo } from 'react';
import CategoryForm from './CategoryForm';
import CategoryDetails from './CategoryDetails';
import { categoryAPI } from '../services/categoryAPI';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [codeFilter, setCodeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categories = await categoryAPI.getAll();
      const categoriesWithUrls = await Promise.all(
        categories.map(async (cat) => {
          if (cat.imageKey) {
            try {
              const urlResult = await getUrl({ key: cat.imageKey, options: { level: 'public' } });
              return { ...cat, imageUrl: urlResult.url.toString() };
            } catch (err) {
              console.error(`Error getting image for ${cat.name}`, err);
              return { ...cat, imageUrl: null };
            }
          }
          return { ...cat, imageUrl: null };
        })
      );
      setCategories(categoriesWithUrls);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      alert('Failed to load categories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setShowDetails(true);
  };

  const handleDeleteCategory = async (categoryCode) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.delete(categoryCode);
        const category = categories.find((c) => c.id === categoryCode);
        if (category?.imageKey) {
          try {
            await remove({ key: category.imageKey, options: { level: 'public' } });
            console.log('Image removed from S3:', category.imageKey);
          } catch (err) {
            console.error('Error removing image from S3:', err);
          }
        }
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleFormSubmit = async (categoryData) => {
    try {
      let imageKey = categoryData.imageKey || null;

      if (categoryData.imageFile) {
        // Upload file into category/<category-name>/<filename>
        const uploadResponse = await uploadData({
          key: `category/${categoryData.imageFile.name}`,
          data: categoryData.imageFile,
          options: { contentType: categoryData.imageFile.type, level: 'public' },
        }).result;

        imageKey = uploadResponse.key;
      }

      const dataToSend = { ...categoryData, imageKey };
      delete dataToSend.imageFile;
      delete dataToSend.image;

      if (editingCategory) {
        await categoryAPI.update(dataToSend);
      } else {
        await categoryAPI.create(dataToSend);
      }

      setShowForm(false);
      setEditingCategory(null);
      await fetchCategories();
      alert('Category saved successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Failed to save category: ${error.message || 'Please try again.'}`);
    }
  };


  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedCategory(null);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        searchQuery === '' ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        category.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesCode =
        codeFilter === '' ||
        category.id.toLowerCase().includes(codeFilter.toLowerCase());

      const matchesDate =
        dateFilter === '' ||
        new Date(category.createdAt).toLocaleDateString().includes(dateFilter);

      return matchesSearch && matchesCategory && matchesCode && matchesDate;
    });
  }, [categories, searchQuery, categoryFilter, codeFilter, dateFilter]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(categories.map((cat) => cat.category))].sort();
  }, [categories]);

  if (loading) {
    return (
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Category List</h1>
          <p className="text-[10px] sm:text-sm text-gray-600 mt-1">
            Manage service categories and their details
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <i className="fas fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Select category</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              placeholder="Enter your code"
              className="w-full px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <i className="fas fa-calendar absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs"></i>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setCodeFilter('');
              setDateFilter('');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <i className="fas fa-filter"></i>
            Clear Filters
          </button>
        </div>

        <div className="mt-3 text-[10px] sm:text-sm text-gray-500">
          {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                            <i className="fas fa-image text-gray-400"></i>
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-folder text-gray-400 text-sm"></i>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}{" "}
                          {category.category.toLowerCase() === "furniture".toLowerCase() &&
                            (category.isopenCategory ? "(Open Category)" : "(Closed Category)")}
                        </div>
                        {category.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{category.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{category.category}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(category)}
                        className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors flex items-center justify-center"
                        title="View Details"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredCategories.map((category) => (
            <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                {category.imageUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
                      <i className="fas fa-image text-gray-400"></i>
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-folder text-gray-400"></i>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {category.name}
                    {category.category.toLowerCase() === "furniture".toLowerCase() && (
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        ({category.isopenCategory ? "Open" : "Closed"})
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 mb-2">{category.description}</div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{category.category}</span>
                    <span className="text-xs text-gray-600 font-mono">{category.id}</span>
                    <span className="text-xs text-gray-500">{new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(category)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <i className="fas fa-eye text-xs"></i>
                  View
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <i className="fas fa-edit text-xs"></i>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <i className="fas fa-trash text-xs"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-folder-open text-gray-300 text-3xl sm:text-4xl mb-3"></i>
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1">
              {categories.length === 0 ? 'No categories yet' : 'No categories found'}
            </h3>
            <p className="text-[10px] sm:text-sm text-gray-500 mb-4">
              {categories.length === 0 ? 'Get started by creating your first category.' : 'Adjust your filters or search criteria.'}
            </p>
            {categories.length === 0 && (
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-plus"></i>
                Create First Category
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && <CategoryForm category={editingCategory} onSubmit={handleFormSubmit} onClose={handleFormClose} />}
      {showDetails && selectedCategory && <CategoryDetails category={selectedCategory} onClose={handleDetailsClose} />}
    </div>
  );
};

export default CategoryManagement;
