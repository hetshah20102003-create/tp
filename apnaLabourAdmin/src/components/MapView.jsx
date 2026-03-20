import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getLocationIconUrl } from "../utils/storageUtils";
import { geocodeAddress } from "../utils/geocodingUtils";

// Component to update map view when position changes
function MapViewUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

// Fix Leaflet's default icon path
delete L.Icon.Default.prototype._getIconUrl;

const MapView = ({ latitude, longitude, address }) => {
  const [theme, setTheme] = useState("light");
  const [markerIcon, setMarkerIcon] = useState(null);
  const [iconLoadError, setIconLoadError] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Default coordinates (Mumbai, India)
  const DEFAULT_LAT = 19.076;
  const DEFAULT_LNG = 72.8777;
  
  // Validate and normalize coordinates
  // Handle null, undefined, or invalid numbers
  const isValidCoordinate = (coord) => {
    return coord != null && typeof coord === 'number' && !isNaN(coord) && isFinite(coord);
  };
  
  // Geocode address if coordinates are not available but address is
  useEffect(() => {
    const geocodeIfNeeded = async () => {
      // Check if we have direct coordinates
      const hasDirectCoordinates = isValidCoordinate(latitude) && isValidCoordinate(longitude);
      
      // If we already have coordinates, don't geocode
      if (hasDirectCoordinates) {
        setGeocodedCoords(null);
        setIsGeocoding(false);
        return;
      }
      
      // If we have an address but no coordinates, try to geocode
      if (address && typeof address === 'string' && address.trim() !== '') {
        setIsGeocoding(true);
        console.log('🗺️ [MAPVIEW] No coordinates available, attempting to geocode address:', address);
        
        const coords = await geocodeAddress(address);
        
        if (coords) {
          console.log('✅ [MAPVIEW] Successfully geocoded address to:', coords);
          setGeocodedCoords(coords);
        } else {
          console.warn('⚠️ [MAPVIEW] Failed to geocode address');
          setGeocodedCoords(null);
        }
        
        setIsGeocoding(false);
      } else {
        setGeocodedCoords(null);
        setIsGeocoding(false);
      }
    };
    
    geocodeIfNeeded();
  }, [latitude, longitude, address]);
  
  // Check if we have direct coordinates (for rendering logic)
  const hasDirectCoordinates = isValidCoordinate(latitude) && isValidCoordinate(longitude);
  
  // Determine final coordinates to use
  const finalLat = hasDirectCoordinates 
    ? latitude 
    : (geocodedCoords?.lat ?? DEFAULT_LAT);
  const finalLng = hasDirectCoordinates 
    ? longitude 
    : (geocodedCoords?.lng ?? DEFAULT_LNG);
  
  const position = [finalLat, finalLng];
  const hasValidCoordinates = hasDirectCoordinates || geocodedCoords !== null;
  
  // Fetch S3 URL for location icon and create custom icon
  useEffect(() => {
    // Only load icon if we have valid coordinates
    if (!hasValidCoordinates) {
      return;
    }
    
    const loadIconUrl = async () => {
      console.log('🗺️ [MAPVIEW] Loading location marker icon...');
      console.log('🗺️ [MAPVIEW] Map coordinates - Latitude:', finalLat, 'Longitude:', finalLng);
      console.log('🗺️ [MAPVIEW] Original coordinates - Latitude:', latitude, 'Longitude:', longitude);
      console.log('🗺️ [MAPVIEW] Geocoded coordinates:', geocodedCoords);
      console.log('🗺️ [MAPVIEW] Has valid coordinates:', hasValidCoordinates);
      
      try {
        const s3IconUrl = await getLocationIconUrl();
        
        if (s3IconUrl) {
          console.log('✅ [MAPVIEW] Marker icon URL retrieved:', s3IconUrl);
          
          // Verify the image loads before creating icon
          const img = new Image();
          img.onload = () => {
            console.log('✅ [MAPVIEW] Marker icon image loaded successfully');
            // Create custom icon instance
            const customIcon = new L.Icon({
              iconUrl: s3IconUrl,
              iconRetinaUrl: s3IconUrl,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
              shadowUrl: null,
              shadowSize: null,
              shadowAnchor: null,
            });
            setMarkerIcon(customIcon);
            setIconLoadError(false);
            console.log('✅ [MAPVIEW] Custom marker icon created and set');
          };
          
          img.onerror = (error) => {
            console.error('❌ [MAPVIEW] Failed to load marker icon image:', error);
            console.warn('⚠️ [MAPVIEW] Using local fallback marker icon');
            setIconLoadError(true);
            // Create fallback icon
            const fallbackIcon = new L.Icon({
              iconUrl: '/icons/location_icon.png',
              iconRetinaUrl: '/icons/location_icon.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
              shadowUrl: null,
            });
            setMarkerIcon(fallbackIcon);
          };
          
          // Start loading the image
          img.src = s3IconUrl;
        } else {
          console.warn('⚠️ [MAPVIEW] No S3 URL, using local fallback marker icon');
          setIconLoadError(true);
          const fallbackIcon = new L.Icon({
            iconUrl: '/icons/location_icon.png',
            iconRetinaUrl: '/icons/location_icon.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            shadowUrl: null,
          });
          setMarkerIcon(fallbackIcon);
        }
      } catch (error) {
        console.error('❌ [MAPVIEW] Error loading marker icon:', error);
        setIconLoadError(true);
        // Use local fallback on error
        const fallbackIcon = new L.Icon({
          iconUrl: '/icons/location_icon.png',
          iconRetinaUrl: '/icons/location_icon.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
          shadowUrl: null,
        });
        setMarkerIcon(fallbackIcon);
      }
    };
    
    loadIconUrl();
  }, [finalLat, finalLng, hasValidCoordinates]);
  
  useEffect(() => {
    console.log('🗺️ [MAPVIEW] Map position updated:', [finalLat, finalLng]);
  }, [finalLat, finalLng]);

  const themes = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Theme selector */}
      <div style={{ position: "absolute", zIndex: 1000, padding: "10px", top: 0, left: 0 }}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: "pointer" }}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>

      {/* Map */}
      <MapContainer
        center={position}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        key={`${finalLat}-${finalLng}`}
      >
        <TileLayer url={themes[theme]} />
        <MapViewUpdater position={position} />
        {hasValidCoordinates && markerIcon && (
          <Marker 
            position={position} 
            icon={markerIcon}
            key={`marker-${finalLat}-${finalLng}`}
          >
            <Popup>
              {hasDirectCoordinates ? (
                <>
                  <strong>Coordinates:</strong><br />
                  Latitude: {finalLat.toFixed(6)}, Longitude: {finalLng.toFixed(6)}
                </>
              ) : (
                <>
                  <strong>Geocoded from address:</strong><br />
                  {address}<br />
                  <small>Lat: {finalLat.toFixed(6)}, Lng: {finalLng.toFixed(6)}</small>
                </>
              )}
            </Popup>
          </Marker>
        )}
        {isGeocoding && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '20px 30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              🔍 Finding location from address...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        {!hasValidCoordinates && !isGeocoding && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              ⚠️ Location coordinates not available
            </p>
            {address && (
              <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '12px' }}>
                Address geocoding failed
              </p>
            )}
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
