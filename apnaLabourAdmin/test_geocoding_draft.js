
const { geocodeAddress, reverseGeocode } = require('./src/utils/geocodingUtils');

// Mock fetch for node environment since the utils might use browser fetch
if (!global.fetch) {
    global.fetch = async (url, options) => {
        // We will need to use node-fetch or https to actually make the request if we want to run this in node.
        // However, I can't easily install new packages.
        // So I will rely on the fact that I can't run this easily without 'node-fetch' if the environment is node.
        // Wait, the user has 'axios' in dependencies. I can use that?
        // But the utils use 'fetch'. 

        // Let's use 'https' to emulate fetch
        const https = require('https');
        return new Promise((resolve, reject) => {
            console.log(`Fetching: ${url}`);
            https.get(url, { headers: options?.headers || { 'User-Agent': 'ApnaLabourApp/1.0' } }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: async () => JSON.parse(data)
                    });
                });
            }).on('error', reject);
        });
    };
}

async function test() {
    console.log("Testing Geocoding...");

    const queries = [
        "Ahmedabad",
        "Bopal, Ahmedabad",
        "Satellite, Ahmedabad",
        "Gota, Ahmedabad",
        "Ahmedabad Area"
    ];

    for (const q of queries) {
        console.log(`\nSearching for: "${q}"`);
        const start = Date.now();
        const res = await geocodeAddress(q);
        const duration = Date.now() - start;
        if (res) {
            console.log(`✅ Found: ${res.lat}, ${res.lng} in ${duration}ms`);

            // Test reverse geocode on the result
            const rev = await reverseGeocode(res.lat, res.lng);
            console.log(`   Reverse Identifies as: "${rev}"`);
        } else {
            console.log(`❌ Not Found in ${duration}ms`);
        }
    }
}
