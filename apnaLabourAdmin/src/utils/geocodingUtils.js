/**
 * Geocoding utility to convert addresses to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = {};

/**
 * Clean and normalize address for better geocoding results
 * @param {string} address - Raw address string
 * @returns {string[]} - Array of address variations to try
 */
function generateAddressVariations(address) {
  if (!address || typeof address !== 'string') return [];

  const cleaned = address.trim();
  const variations = [cleaned]; // Start with original

  // Remove common redundant words that might confuse geocoding
  let simplified = cleaned
    .replace(/\bRoad\b/gi, '') // Remove standalone "Road"
    .replace(/\bStreet\b/gi, '')
    .replace(/\bSt\b/gi, '')
    .replace(/\bAvenue\b/gi, '')
    .replace(/\bAve\b/gi, '')
    .replace(/\bLane\b/gi, '')
    .replace(/\bLn\b/gi, '')
    .replace(/\bArea\b/gi, '') // Remove "Area"
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/,\s*,/g, ',') // Remove double commas
    .trim();

  if (simplified !== cleaned) {
    variations.push(simplified);
  }

  // Extract city, state, country pattern (common in Indian addresses)
  // Pattern: [Street/Area], City, State, Country, Pincode
  const parts = cleaned.split(',').map(p => p.trim()).filter(p => p);

  // Check if last part is a pincode (6 digits)
  const lastPart = parts[parts.length - 1];
  const isPincode = /^\d{6}$/.test(lastPart);

  // Determine indices based on whether pincode exists
  let cityIndex, stateIndex, countryIndex;

  if (isPincode && parts.length >= 4) {
    // Format: ..., City, State, Country, Pincode
    cityIndex = parts.length - 4;
    stateIndex = parts.length - 3;
    countryIndex = parts.length - 2;
  } else if (parts.length >= 3) {
    // Format: ..., City, State, Country (no pincode)
    cityIndex = parts.length - 3;
    stateIndex = parts.length - 2;
    countryIndex = parts.length - 1;
  }

  // Try different combinations
  if (cityIndex >= 0 && stateIndex >= 0 && countryIndex >= 0) {
    // Try: City, State, Country (most common Indian format)
    const cityStateCountry = `${parts[cityIndex]}, ${parts[stateIndex]}, ${parts[countryIndex]}`;
    if (!variations.includes(cityStateCountry)) {
      variations.push(cityStateCountry);
    }

    // Try: City, State
    const cityState = `${parts[cityIndex]}, ${parts[stateIndex]}`;
    if (!variations.includes(cityState)) {
      variations.push(cityState);
    }

    // Try: Just City
    const city = parts[cityIndex];
    if (city && !variations.includes(city)) {
      variations.push(city);
    }
  }

  // Also try without the first part(s) if address is long
  // Sometimes street names confuse geocoding
  if (parts.length > 4) {
    // Remove first part and try again
    const withoutFirst = parts.slice(1).join(', ');
    if (!variations.includes(withoutFirst)) {
      variations.push(withoutFirst);
    }

    // Remove first two parts
    if (parts.length > 5) {
      const withoutFirstTwo = parts.slice(2).join(', ');
      if (!variations.includes(withoutFirstTwo)) {
        variations.push(withoutFirstTwo);
      }
    }
  }

  return variations.filter(v => v.length > 0);
}

/**
 * Geocode a single address string using Nominatim
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} - Coordinates or null if failed
 */
async function geocodeSingleAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ApnaLabourApp/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address
    };

    // Validate coordinates
    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      return null;
    }

    return coordinates;
  } catch (error) {
    console.error('❌ [GEOCODE] Error in geocodeSingleAddress:', error);
    return null;
  }
}

/**
 * Geocode an address to get latitude and longitude
 * Tries multiple address variations for better success rate
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} - Coordinates or null if failed
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    console.warn('⚠️ [GEOCODE] Invalid address provided');
    return null;
  }

  const normalizedAddress = address.trim();

  // Check cache first
  if (geocodeCache[normalizedAddress]) {
    console.log('✅ [GEOCODE] Using cached result for:', normalizedAddress);
    return geocodeCache[normalizedAddress];
  }

  console.log('🗺️ [GEOCODE] Geocoding address:', normalizedAddress);

  // Generate address variations to try
  const variations = generateAddressVariations(normalizedAddress);
  console.log('🗺️ [GEOCODE] Trying', variations.length, 'address variations');

  // Try each variation in order
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    console.log(`🗺️ [GEOCODE] Attempt ${i + 1}/${variations.length}: "${variation}"`);

    // Add delay between requests to respect rate limits (1 request per second)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const coordinates = await geocodeSingleAddress(variation);

    if (coordinates) {
      // Cache the result for the original address
      geocodeCache[normalizedAddress] = coordinates;
      console.log('✅ [GEOCODE] Successfully geocoded address:', normalizedAddress);
      console.log('✅ [GEOCODE] Using variation:', variation);
      console.log('✅ [GEOCODE] Coordinates:', coordinates);
      return coordinates;
    }
  }

  console.warn('⚠️ [GEOCODE] No results found for any address variation:', normalizedAddress);
  return null;
}

/**
 * Build a full address string from address components
 * @param {string} deliveryAddress - Main delivery address
 * @param {string} houseNo - House number
 * @param {number|string} floorNumber - Floor number
 * @returns {string} - Combined address string
 */

/**
 * Reverse geocode coordinates to get address details
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} - Area name or formatted address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ApnaLabourApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.address) {
      // Prioritize specific area names
      const address = data.address;
      const areaName = address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.village ||
        address.town ||
        address.city_district ||
        address.city ||
        address.hamlet;

      return areaName || data.display_name.split(',')[0];
    }

    return null;
  } catch (error) {
    console.error('❌ [GEOCODE] Error in reverseGeocode:', error);
    return null;
  }
}

export function buildFullAddress(deliveryAddress, houseNo, floorNumber) {
  const parts = [];

  if (deliveryAddress) parts.push(deliveryAddress.trim());
  if (houseNo) parts.push(`House No: ${houseNo.trim()}`);
  if (floorNumber) parts.push(`Floor: ${floorNumber}`);

  return parts.join(', ');
}

