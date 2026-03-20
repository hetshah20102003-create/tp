import React, { useState, useEffect } from 'react';
import { remoteConfigBackendAPI } from '../services/remoteConfigBackendAPI';
import MapPicker from './MapPicker';

const SupportedAreas = () => {
    const [areasData, setAreasData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCity, setExpandedCity] = useState(null);
    const [newCity, setNewCity] = useState('');
    const [newArea, setNewArea] = useState('');
    const [editingCity, setEditingCity] = useState(null);
    const [editingArea, setEditingArea] = useState(null);
    const [showMapPicker, setShowMapPicker] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const template = await remoteConfigBackendAPI.getRemoteConfig();
            if (template && template.data && template.data.parameters) {
                // Parse parameters to match the expected structure: { city: [areas] }
                const parsedData = {};
                // We assume there's a parameter named 'supported_areas' or similar, 
                // OR we are mapping all parameters. 
                // Based on previous context, likely a single JSON parameter 'supported_areas'.
                // checking for 'supported_areas' key in parameters

                const supportedAreasParam = template.data.parameters['supported_areas'];

                if (supportedAreasParam && supportedAreasParam.defaultValue && supportedAreasParam.defaultValue.value) {
                    try {
                        const jsonVal = JSON.parse(supportedAreasParam.defaultValue.value);
                        setAreasData(jsonVal);
                    } catch (e) {
                        console.error("Error parsing supported_areas JSON", e);
                        setAreasData({});
                    }
                } else {
                    // Fallback or empty if not found
                    setAreasData({});
                }

            } else {
                setAreasData({});
            }
        } catch (err) {
            setError("Failed to fetch supported areas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format data for Remote Config update
    // We update the 'supported_areas' parameter with the new JSON string
    const prepareUpdatePayload = (newData) => {
        return {
            "supported_areas": {
                "defaultValue": {
                    "value": JSON.stringify(newData)
                },
                "description": "List of supported cities and areas",
                "valueType": "JSON"
            }
        };
    };

    const handleAddCity = async () => {
        if (!newCity.trim()) return;
        const cityKey = newCity.trim().toLowerCase();
        if (areasData[cityKey]) {
            alert("City already exists!");
            return;
        }

        const updatedData = { ...areasData, [cityKey]: [] };

        // Optimistic update
        setAreasData(updatedData);
        setNewCity('');

        await saveChanges(updatedData);
    };

    const handleDeleteCity = async (city) => {
        if (!window.confirm(`Are you sure you want to delete ${city} and all its areas?`)) return;

        const updatedData = { ...areasData };
        delete updatedData[city];

        setAreasData(updatedData);
        await saveChanges(updatedData);
    };

    const handleAddArea = async (city) => {
        if (!newArea.trim()) return;
        const areaVal = newArea.trim().toLowerCase();

        const currentAreas = areasData[city] || [];
        if (currentAreas.includes(areaVal)) {
            alert("Area already exists in this city!");
            return;
        }

        const updatedAreas = [...currentAreas, areaVal];
        const updatedData = { ...areasData, [city]: updatedAreas };

        setAreasData(updatedData);
        setNewArea('');
        await saveChanges(updatedData);
    };

    const handleDeleteArea = async (city, areaIndex) => {
        if (!window.confirm("Are you sure you want to delete this area?")) return;

        const currentAreas = areasData[city];
        const updatedAreas = currentAreas.filter((_, index) => index !== areaIndex);
        const updatedData = { ...areasData, [city]: updatedAreas };

        setAreasData(updatedData);
        await saveChanges(updatedData);
    };

    const handleEditCityStart = (city) => {
        setEditingCity({ original: city, value: city });
    };

    const handleEditCitySave = async () => {
        if (!editingCity.value.trim() || editingCity.value === editingCity.original) {
            setEditingCity(null);
            return;
        }

        const newCityName = editingCity.value.trim().toLowerCase();
        if (areasData[newCityName]) {
            alert("City name already exists!");
            return;
        }

        const updatedData = { ...areasData };
        updatedData[newCityName] = updatedData[editingCity.original];
        delete updatedData[editingCity.original];

        setAreasData(updatedData);
        setEditingCity(null);
        await saveChanges(updatedData);
    };

    const handleEditAreaStart = (city, index, area) => {
        setEditingArea({ city, index, value: area });
    };

    const handleEditAreaSave = async () => {
        if (!editingArea.value.trim()) {
            setEditingArea(null);
            return;
        }

        const city = editingArea.city;
        const currentAreas = [...areasData[city]];
        currentAreas[editingArea.index] = editingArea.value.trim().toLowerCase();

        const updatedData = { ...areasData, [city]: currentAreas };

        setAreasData(updatedData);
        setEditingArea(null);
        await saveChanges(updatedData);
    };


    const saveChanges = async (newData) => {
        try {
            const payload = prepareUpdatePayload(newData);
            const result = await remoteConfigBackendAPI.updateRemoteConfig(payload);

            if (result && result.success) {
                console.log("Remote config updated successfully:", result.etag);
            } else {
                console.error("Failed to update remote config:", result);
                alert("Failed to save changes to server. Please try again.");
                // Revert optimistic update here if necessary (fetching fresh data)
                fetchData();
            }
        } catch (e) {
            console.error("Error saving changes:", e);
            alert("Error saving changes. See console for details.");
            fetchData();
        }
    };

    const handleMapPick = (areaName) => {
        setNewArea(areaName);
        setShowMapPicker(false);
    };

    const toggleCity = (city) => {
        if (expandedCity === city) {
            setExpandedCity(null);
        } else {
            setExpandedCity(city);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-lg">
                <p>{error}</p>
                <button onClick={fetchData} className="mt-2 text-sm text-blue-600 hover:underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supported Areas</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage cities and their service areas.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Refresh Data"
                >
                    <i className="fas fa-sync-alt"></i>
                </button>
            </div>

            {/* Add City Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Add New City</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Enter city name (e.g., Ahmedabad)"
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                    />
                    <button
                        onClick={handleAddCity}
                        disabled={!newCity.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add City
                    </button>
                </div>
            </div>

            {/* Cities List */}
            <div className="space-y-4">
                {Object.keys(areasData).length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No supported areas found.</p>
                    </div>
                ) : (
                    Object.keys(areasData).map((city) => (
                        <div key={city} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                            {/* City Header */}
                            <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={() => toggleCity(city)}
                                        className={`transform transition-transform duration-200 ${expandedCity === city ? 'rotate-90' : ''} text-gray-400 hover:text-gray-600`}
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>

                                    {editingCity && editingCity.original === city ? (
                                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                                            <input
                                                type="text"
                                                value={editingCity.value}
                                                onChange={(e) => setEditingCity({ ...editingCity, value: e.target.value })}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                autoFocus
                                            />
                                            <button onClick={handleEditCitySave} className="text-green-600 hover:text-green-700"><i className="fas fa-check"></i></button>
                                            <button onClick={() => setEditingCity(null)} className="text-red-500 hover:text-red-600"><i className="fas fa-times"></i></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-gray-900 capitalize" onClick={() => toggleCity(city)}>{city}</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                {areasData[city].length} areas
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditCityStart(city)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit City Name"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCity(city)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete City"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Areas List (Collapsible) */}
                            {expandedCity === city && (
                                <div className="p-4 bg-white">
                                    {/* Add Area Input */}
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newArea}
                                            onChange={(e) => setNewArea(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddArea(city);
                                            }}
                                            placeholder={`Add area to ${city}...`}
                                            className="flex-1 rounded-lg border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                                        />
                                        <button
                                            onClick={() => setShowMapPicker(true)}
                                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm transition-colors"
                                            title="Pick from Map"
                                        >
                                            <i className="fas fa-map-marker-alt mr-1"></i>
                                            Map
                                        </button>
                                        <button
                                            onClick={() => handleAddArea(city)}
                                            disabled={!newArea.trim()}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Tags List */}
                                    <div className="flex flex-wrap gap-2">
                                        {areasData[city].length === 0 ? (
                                            <p className="text-sm text-gray-400 italic w-full text-center py-2">No areas added yet.</p>
                                        ) : (
                                            areasData[city].map((area, index) => (
                                                <div key={`${city}-${index}`} className="group relative inline-flex items-center bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-full px-3 py-1.5 transition-colors">
                                                    {editingArea && editingArea.city === city && editingArea.index === index ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="text"
                                                                value={editingArea.value}
                                                                onChange={(e) => setEditingArea({ ...editingArea, value: e.target.value })}
                                                                className="w-24 text-xs border-none bg-transparent focus:ring-0 p-0"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleEditAreaSave();
                                                                }}
                                                            />
                                                            <button onClick={handleEditAreaSave} className="text-green-600 text-xs"><i className="fas fa-check"></i></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span
                                                                className="text-sm text-gray-700 font-medium capitalize cursor-pointer"
                                                                onDoubleClick={() => handleEditAreaStart(city, index, area)}
                                                            >
                                                                {area}
                                                            </span>
                                                            <div className="flex items-center ml-2 border-l border-gray-300 pl-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditAreaStart(city, index, area)}
                                                                    className="text-gray-400 hover:text-blue-600"
                                                                >
                                                                    <i className="fas fa-pen text-xs"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteArea(city, index)}
                                                                    className="text-gray-400 hover:text-red-600"
                                                                >
                                                                    <i className="fas fa-times text-xs"></i>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showMapPicker && (
                <MapPicker
                    defaultCity={expandedCity}
                    onSelect={handleMapPick}
                    onCancel={() => setShowMapPicker(false)}
                />
            )}
        </div>
    );
};

export default SupportedAreas;
