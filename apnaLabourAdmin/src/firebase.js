import { initializeApp } from "firebase/app";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyBh-DDorvdXWAkBqvmbll51hn6TKqrPRXQ",
  authDomain: "apnalabour-b41b0.firebaseapp.com",
  projectId: "apnalabour-b41b0",
  storageBucket: "apnalabour-b41b0.firebasestorage.app",
  messagingSenderId: "124559206755",
  appId: "1:124559206755:web:6b2bfb9a2b7397fc02cb56",
  measurementId: "G-Y2K7NL7PK2"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export const remoteConfig = getRemoteConfig(app);

// Set default fetch interval (dev: 0, prod: 12 hours)
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour for now to avoid frequent fetches during dev, set to 0 strictly for debugging


// Get FCM token
export const requestForToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BC8yHiganK2M0Vv5jVVv8tzmMdgcRJ8jxkSj_4PCsNbnJ3sSQBTxIx6FL_wIFYG5fJQl451VmXLQoaOeV989qtU"
    });
    console.log("Web Token:", token);
    return token;
  } catch (err) {
    console.error("Error retrieving token:", err);
    throw err; // Propagate error to be handled by caller
  }
};

// Listen for foreground messages
export const listenForMessages = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    callback(payload);
  });
};
