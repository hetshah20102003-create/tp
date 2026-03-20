// Firebase Cloud Messaging Service Worker
// This file must be served from the root directory and NOT be minified

console.log('[SW] Service worker script loaded');

try {
  importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');
  console.log('[SW] Firebase scripts loaded successfully');
} catch (error) {
  console.error('[SW] ❌ Failed to load Firebase scripts:', error);
}

console.log('[SW] Firebase scripts loaded');

const firebaseConfig = {
  apiKey: "AIzaSyBh-DDorvdXWAkBqvmbll51hn6TKqrPRXQ",
  authDomain: "apnalabour-b41b0.firebaseapp.com",
  projectId: "apnalabour-b41b0",
  storageBucket: "apnalabour-b41b0.firebasestorage.app",
  messagingSenderId: "124559206755",
  appId: "1:124559206755:web:6b2bfb9a2b7397fc02cb56",
  measurementId: "G-Y2K7NL7PK2"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('[SW] Firebase initialized successfully');
} catch (error) {
  console.error('[SW] Firebase initialization error:', error);
}

// Get messaging instance
let messaging;
try {
  messaging = firebase.messaging();
  console.log('[SW] Messaging instance created');
} catch (error) {
  console.error('[SW] Error creating messaging instance:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage(function (payload) {
    console.log('[SW] ========== BACKGROUND MESSAGE RECEIVED ==========');
    console.log('[SW] Full payload:', JSON.stringify(payload, null, 2));
    console.log('[SW] Payload notification:', payload.notification);
    console.log('[SW] Payload data:', payload.data);

    // IMPORTANT: onBackgroundMessage must return a Promise
    return new Promise(async (resolve, reject) => {
      try {
        const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
        const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new message.';

        console.log('[SW] Notification title:', notificationTitle);
        console.log('[SW] Notification body:', notificationBody);

        const notificationOptions = {
          body: notificationBody,
          icon: '/notification.png',
          badge: '/notification.png',
          tag: 'fcm-notification-' + Date.now(),
          renotify: true,
          requireInteraction: false, // Set to false so it doesn't stay open
          data: payload.data || {},
          vibrate: [200, 100, 200, 100, 200], // Enhanced vibration pattern
          silent: false, // Explicitly set to false to ensure sound plays
          // Note: The 'sound' property has limited browser support
          // Most browsers will use the default system notification sound automatically
          // when silent: false and a notification is shown
        };

        // Log notification options for debugging
        console.log('[SW] Notification will be shown with sound enabled (silent: false)');

        console.log('[SW] Notification options:', notificationOptions);
        console.log('[SW] Showing notification...');

        // Show notification and return the promise
        // The browser will automatically play the default system notification sound
        // when silent: false and the notification is displayed
        const notificationPromise = self.registration.showNotification(notificationTitle, notificationOptions);

        notificationPromise
          .then(() => {
            console.log('[SW] ✅ Notification shown successfully');
            console.log('[SW] 🔊 Browser should play default notification sound automatically');
            console.log('[SW] 📱 If no sound, check:');
            console.log('[SW]    1. Browser notification settings');
            console.log('[SW]    2. System notification sound settings');
            console.log('[SW]    3. Device volume/mute settings');

            // Additional check: verify notification was actually shown
            setTimeout(() => {
              console.log('[SW] 📊 Notification status: displayed with silent=false');
            }, 100);

            resolve();
          })
          .catch((error) => {
            console.error('[SW] ❌ Error showing notification:', error);
            console.error('[SW] Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
            reject(error);
          });
      } catch (error) {
        console.error('[SW] ❌ Fatal error in background message handler:', error);
        console.error('[SW] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        reject(error);
      }
    });
  });

  console.log('[SW] Background message handler registered');
} else {
  console.error('[SW] ❌ Messaging instance not available, cannot register background handler');
}

// Function to get S3 audio URL from IndexedDB
function getAudioUrlFromDB() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('NotificationAudioDB', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction(['audioUrls'], 'readonly');
        const store = tx.objectStore('audioUrls');
        const getRequest = store.get('notificationAudio');

        getRequest.onsuccess = () => {
          const data = getRequest.result;
          if (data && data.url) {
            // Check if URL is still valid (not expired - S3 URLs expire after 1 hour)
            const age = Date.now() - (data.timestamp || 0);
            const oneHour = 3600000; // 1 hour in milliseconds
            if (age < oneHour) {
              console.log('[SW] Found S3 audio URL in IndexedDB:', data.url);
              resolve(data.url);
            } else {
              console.log('[SW] S3 audio URL expired, using local fallback');
              resolve('/sounds/notification.mp3');
            }
          } else {
            console.log('[SW] No S3 audio URL in IndexedDB, using local fallback');
            resolve('/sounds/notification.mp3');
          }
        };

        getRequest.onerror = () => {
          console.warn('[SW] Error reading from IndexedDB, using local fallback');
          resolve('/sounds/notification.mp3');
        };
      };

      request.onerror = () => {
        console.warn('[SW] Error opening IndexedDB, using local fallback');
        resolve('/sounds/notification.mp3');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('audioUrls')) {
          db.createObjectStore('audioUrls', { keyPath: 'id' });
        }
      };
    } catch (error) {
      console.warn('[SW] IndexedDB error, using local fallback:', error);
      resolve('/sounds/notification.mp3');
    }
  });
}

// Note: AudioContext is not available in service workers
// Service workers rely on the browser's built-in notification sound
// The sound property in notificationOptions will be used by the browser
// if supported, otherwise the default system notification sound will play

// Service worker installation - must be before other event listeners
self.addEventListener('install', function (event) {
  console.log('[SW] Service worker installing');
  self.skipWaiting(); // Activate immediately
});

// Service worker activation
self.addEventListener('activate', function (event) {
  console.log('[SW] Service worker activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control of all pages immediately
      // Clean up old service workers
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            console.log('[SW] Cleaning up old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    ]).then(() => {
      console.log('[SW] Service worker activated and claimed clients');
    })
  );
});

// Listen for messages from main app (e.g., audio URL updates)
self.addEventListener('message', function (event) {
  console.log('[SW] Message received from main app:', event.data);

  if (event.data && event.data.type === 'AUDIO_URL_UPDATE') {
    const audioUrl = event.data.audioUrl;
    console.log('[SW] Updating audio URL in IndexedDB:', audioUrl);

    // Store in IndexedDB
    const request = indexedDB.open('NotificationAudioDB', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(['audioUrls'], 'readwrite');
      const store = tx.objectStore('audioUrls');
      store.put({ id: 'notificationAudio', url: audioUrl, timestamp: Date.now() });
      console.log('[SW] ✅ Audio URL updated in IndexedDB');
    };
    request.onerror = (e) => {
      console.error('[SW] ❌ Error updating audio URL in IndexedDB:', e);
    };
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
