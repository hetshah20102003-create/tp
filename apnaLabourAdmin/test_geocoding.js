
const https = require('https');

// Utils Logic Inlined for Testing
const geocodeCache = {};

function generateAddressVariations(address) {
    if (!address || typeof address !== 'string') return [];

    const cleaned = address.trim();
    const variations = [cleaned];

    let simplified = cleaned
        .replace(/\bRoad\b/gi, '')
        .replace(/\bStreet\b/gi, '')
        .replace(/\bSt\b/gi, '')
        .replace(/\bAvenue\b/gi, '')
        .replace(/\bAve\b/gi, '')
        .replace(/\bLane\b/gi, '')
        .replace(/\bLn\b/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/,\s*,/g, ',')
        .trim();

    if (simplified !== cleaned) {
        variations.push(simplified);
    }

    const parts = cleaned.split(',').map(p => p.trim()).filter(p => p);

    // Custom Addition: Try just the first part if it looks like an area
    // e.g. "Bopal, Ahmedabad" -> Try "Bopal, Ahmedabad" (already in), then "Bopal" ?
    // Actually, searching just "Bopal" might give Bopal in another city?
    // But searching "Bopal Ahmedabad" (spaces instead of comma) is often good for Nominatim.

    if (parts.length >= 2) {
        const spaceSeparated = parts.join(' ');
        if (!variations.includes(spaceSeparated)) variations.push(spaceSeparated);
    }

    return variations.filter(v => v.length > 0);
}

async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const headers = { 'User-Agent': 'ApnaLabourApp/1.0' };
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    console.error("Error parsing JSON:", data);
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

async function geocodeSingleAddress(address) {
    try {
        const encodedAddress = encodeURIComponent(address);
        // Note: I am copying the URL structure from the source file
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=in`;

        const data = await fetchJson(url);

        if (!data || data.length === 0) {
            return null;
        }

        const result = data[0];
        const coordinates = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            display_name: result.display_name
        };

        if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
            return null;
        }

        return coordinates;
    } catch (error) {
        console.error('Error in geocodeSingleAddress:', error);
        return null;
    }
}

async function geocodeAddress(address) {
    if (!address || typeof address !== 'string' || address.trim() === '') {
        return null;
    }

    const normalizedAddress = address.trim();

    if (geocodeCache[normalizedAddress]) {
        return geocodeCache[normalizedAddress];
    }

    const variations = generateAddressVariations(normalizedAddress);
    console.log(`Trying ${variations.length} variations for "${normalizedAddress}":`, variations);

    for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));

        const coordinates = await geocodeSingleAddress(variation);

        if (coordinates) {
            geocodeCache[normalizedAddress] = coordinates;
            return coordinates;
        }
    }

    return null;
}

// Run Test
async function run() {
    const queries = [
        "Ahmedabad",
        "Bopal, Ahmedabad",
        "Satellite, Ahmedabad",
        "Ahmedabad Area"
    ];

    for (const q of queries) {
        console.log(`\n--- Searching: ${q} ---`);
        const res = await geocodeAddress(q);
        if (res) {
            console.log(`✅ Found: ${res.display_name}`);
        } else {
            console.log(`❌ Not Found`);
        }
    }
}

run();
