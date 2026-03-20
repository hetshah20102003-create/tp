import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress, reverseGeocode } from '../utils/geocodingUtils';

// Fix Leaflet's default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            onLocationSelect(lat, lng);
        },
    });
    return null;
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
};

const MapPicker = ({ onSelect, onCancel, defaultCity }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [position, setPosition] = useState(null); // { lat, lng }
    const [areaName, setAreaName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Default center (Mumbai)
    const defaultCenter = [19.076, 72.8777];
    const mapCenter = position ? [position.lat, position.lng] : defaultCenter;

    const markerRef = useRef(null);

    // Center map on defaultCity when component mounts
    useEffect(() => {
        if (defaultCity) {
            const centerOnCity = async () => {
                setLoading(true);
                try {
                    const coords = await geocodeAddress(defaultCity);
                    if (coords) {
                        setPosition({ lat: coords.lat, lng: coords.lng });
                        console.log(`Centering map on ${defaultCity}`);
                    }
                } catch (e) {
                    console.error("Failed to center on default city", e);
                } finally {
                    setLoading(false);
                }
            };
            centerOnCity();
        }
    }, [defaultCity]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            // Contextualize search with city if available and not already included
            let query = searchQuery;
            if (defaultCity && !query.toLowerCase().includes(defaultCity.toLowerCase())) {
                query = `${query}, ${defaultCity}`;
            }

            console.log(`Searching for: ${query}`);
            const result = await geocodeAddress(query);

            // If contextual search failed, try original query
            if (!result && query !== searchQuery) {
                console.log(`Contextual search failed, trying original: ${searchQuery}`);
                const fallbackResult = await geocodeAddress(searchQuery);
                if (fallbackResult) {
                    handleSearchResult(fallbackResult);
                    return;
                }
            } else if (result) {
                handleSearchResult(result);
                return;
            }

            setError('Location not found. Please try a different query.');
        } catch (err) {
            console.error(err);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchResult = (result) => {
        const { lat, lng, display_name, address } = result;

        // Construct a better area name from the search result if possible
        let searchAreaName = '';
        if (address) {
            searchAreaName = address.suburb ||
                address.neighbourhood ||
                address.residential ||
                address.village ||
                address.town ||
                address.city_district ||
                address.city ||
                address.hamlet;
        }

        // Fallback to display name or just let reverse geocoding handle it
        const finalName = searchAreaName || display_name.split(',')[0];

        setPosition({ lat, lng });
        setAreaName(finalName);

        // Open popup automatically
        setTimeout(() => {
            if (markerRef.current) {
                markerRef.current.openPopup();
            }
        }, 500);
    };

    const handleLocationSelect = async (lat, lng) => {
        setLoading(true);
        setError(null);
        try {
            setPosition({ lat, lng });
            const name = await reverseGeocode(lat, lng);
            if (name) {
                setAreaName(name);
            } else {
                setAreaName('Unknown Area');
            }

            // Open popup automatically
            setTimeout(() => {
                if (markerRef.current) {
                    markerRef.current.openPopup();
                }
            }, 100);
        } catch (err) {
            console.error(err);
            setAreaName('Unknown Area');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (areaName) {
            onSelect(areaName);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Pick Area from Map</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a location (e.g., Bandra West)"
                            className="flex-1 rounded-lg border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                    <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        <MapUpdater center={mapCenter} />
                        {position && (
                            <Marker position={[position.lat, position.lng]} ref={markerRef}>
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-medium">{areaName}</p>
                                        <p className="text-xs text-gray-500">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[1000]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
                    <div className="text-sm text-gray-600">
                        {areaName ? (
                            <span>Selected: <strong>{areaName}</strong></span>
                        ) : (
                            <span>Click on map or search to select an area</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!areaName}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-colors"
                        >
                            Use this Area
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
