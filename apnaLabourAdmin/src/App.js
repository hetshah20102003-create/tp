import React, { useState, useEffect } from 'react';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import LabourManagement from './components/LabourManagement';
import LabourDetails from './components/LabourDetails';
import Sidebar from './components/Sidebar';
import SuggestionsManagement from './components/suggestionsManagement';
import SuggestionDetails from './components/suggestionDetails';
import CategoryManagement from './components/CategoryManagement';
// import NotificationManagement from './components/NotificationManagement';
import AmplifyAuthService from './services/amplifyAuth';
// import ApiTest from './components/ApiTest';
import OrderDashBoard from './components/OrderForm';
import RefundCancellationPolicy from './components/RefundCancellationPolicy';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import UserDelete from './components/UserDelete';
import ContactUs from './components/ContactUs';
import UsersList from './components/UsersList';
import UserDetails from './components/UserDetails';
import SendNotification from './components/SendNotification';
import { requestForToken, listenForMessages } from "./firebase";
import 'leaflet/dist/leaflet.css';
import LabourList from './components/LabourList';
import AddLabour from './components/AddLabour';
import Attendance from './components/Attendance';
import SupportedAreas from './components/SupportedAreas';
import BusinessMetrics from './components/BusinessMetrics';
import LifecycleFunnel from './components/LifecycleFunnel';
import MapTracking from './components/MapTracking';



// ✅ Firebase Imports
import { webTokenAPI } from "../src/services/firebaseAPI";

// Note: Using local audio file instead of S3 to avoid CORS issues

// ✅ IndexedDB helper for storing audio URL for service worker
const openNotificationAudioDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationAudioDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('audioUrls')) {
        db.createObjectStore('audioUrls', { keyPath: 'id' });
      }
    };
  });
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = React.useRef(null);

  // Preload notification audio and enable on user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Use local audio file as primary source (avoids CORS issues with S3)
        const audioUrl = '/sounds/notification.mp3';
        console.log('🔊 Initializing audio from local file:', audioUrl);

        // First verify the file is accessible
        try {
          const response = await fetch(audioUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.warn('⚠️ Audio file not accessible, status:', response.status);
            return;
          }
          console.log('✅ Audio file is accessible');
        } catch (fetchError) {
          console.error('❌ Error checking audio file accessibility:', fetchError);
          return;
        }

        // Create audio element with local file
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous'; // Allow CORS if needed
        audioRef.current.src = audioUrl;
        audioRef.current.preload = 'auto';
        audioRef.current.volume = 0.8;

        // Add error handler with detailed logging
        audioRef.current.addEventListener('error', (e) => {
          const error = audioRef.current?.error;
          if (error) {
            let errorMsg = 'Unknown error';
            if (error.code === error.MEDIA_ERR_ABORTED) {
              errorMsg = 'Media aborted';
            } else if (error.code === error.MEDIA_ERR_NETWORK) {
              errorMsg = 'Network error';
            } else if (error.code === error.MEDIA_ERR_DECODE) {
              errorMsg = 'Decode error';
            } else if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
              errorMsg = 'Source not supported';
            }
            console.error('🔇 Audio load error:', errorMsg, {
              code: error.code,
              src: audioRef.current?.src,
              networkState: audioRef.current?.networkState,
              readyState: audioRef.current?.readyState
            });
          } else {
            console.error('🔇 Audio load error (no error object)');
          }
        });

        audioRef.current.addEventListener('loadstart', () => {
          console.log('🔊 Audio load started');
        });

        audioRef.current.addEventListener('loadeddata', () => {
          console.log('🔊 Audio data loaded');
        });

        audioRef.current.addEventListener('canplay', () => {
          console.log('🔊 Audio can play');
        });

        audioRef.current.addEventListener('canplaythrough', () => {
          if (audioRef.current) {
            console.log('✅ Audio preloaded successfully from:', audioRef.current.src);
          }
        });

        // Load the audio
        audioRef.current.load();
        console.log('🔊 Audio initialization started');
      } catch (err) {
        console.error('🔇 Audio initialization error:', err);
      }
    };

    initAudio();

    // Enable audio on first user interaction (required by browser policies)
    const enableAudio = () => {
      if (audioRef.current) {
        // Try to play and pause to unlock audio
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          console.log("🔊 Audio unlocked for playback");
        }).catch((err) => {
          console.log("⏸️ Audio will be enabled on notification:", err.message);
        });
      }

      // Also unlock Web Audio API context for beep sounds
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log("🔊 Web Audio API context unlocked");
          });
        }
      } catch (err) {
        console.warn("⚠️ Could not unlock Web Audio API:", err);
      }

      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);


  // ✅ Step 2: Setup Firebase Messaging (Push Notifications)
  useEffect(() => {
    const setupFCM = async () => {
      // ⚠️ Don't setup FCM until user is authenticated
      if (!user || !isAuthenticated) {
        console.log("⏳ Waiting for user authentication before FCM setup...");
        return;
      }

      try {
        // Note: Service worker uses browser's default notification sound
        // No need to send audio URL since service workers can't play custom audio files

        // 1️⃣ Register Service Worker for background notifications
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/',
              updateViaCache: 'none' // Always check for updates
            });
            console.log("✅ Service Worker registered successfully:", registration);
            console.log("✅ Service Worker scope:", registration.scope);
            console.log("✅ Service Worker active:", registration.active);

            // Check if service worker is ready
            if (registration.installing) {
              console.log("⏳ Service Worker installing...");
            } else if (registration.waiting) {
              console.log("⏳ Service Worker waiting...");
            } else if (registration.active) {
              console.log("✅ Service Worker active and ready");
            }
          } catch (swError) {
            console.error("❌ Service Worker registration failed:", swError);
            console.error("Error details:", {
              message: swError.message,
              stack: swError.stack,
              name: swError.name
            });

            // Retry once after a delay
            setTimeout(async () => {
              try {
                console.log("🔄 Retrying Service Worker registration...");
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                  scope: '/',
                  updateViaCache: 'none'
                });
                console.log("✅ Service Worker registered successfully on retry:", registration);
              } catch (retryError) {
                console.error("❌ Service Worker registration failed on retry:", retryError);
              }
            }, 2000);
          }
        } else {
          console.warn("⚠️ Service Workers are not supported in this browser");
        }

        // Request token for this browser
        let token = null;
        try {
          token = await requestForToken();
        } catch (tokenError) {
          if (tokenError.code === 'messaging/notifications-blocked' ||
            tokenError.message?.includes('permission was not granted and blocked')) {
            console.warn("⚠️ Notification permission blocked");
            alert("⚠️ Notifications are blocked!\n\nPlease enable notifications for this site to receive order updates:\n\n1. Click the lock icon 🔒 in the URL bar.\n2. Find 'Notifications'.\n3. Change to 'Allow'.\n4. Refresh the page.");
          }
          throw tokenError;
        }

        if (token) {
          console.log("✅ FCM Token:", token);
          console.log("✅ User data:", user);

          // Send token to backend (Amplify API)
          await webTokenAPI.upsert({
            id: user.id || user.email || user.username, // use actual user data
            token,
          });
          console.log("✅ FCM token saved successfully for user:", user.id || user.email);

        } else {
          console.warn("⚠️ No FCM token received");
        }

        listenForMessages((payload) => {
          console.log("📩 Message received in foreground:", payload);

          // ✅ Play notification sound - ALWAYS plays loud beep sound (no file needed, no user interaction needed)
          const playNotificationSound = async () => {
            // PRIMARY METHOD: Generate VERY LOUD, noticeable beep sound using Web Audio API
            // This always works, doesn't require files, and works without user interaction
            try {
              console.log("🔊 Playing LOUD notification beep sound...");

              // Create audio context (works even without user interaction for short sounds)
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();

              // Resume context if suspended
              if (audioContext.state === 'suspended') {
                try {
                  await audioContext.resume();
                  console.log("🔊 Audio context resumed");
                } catch (resumeErr) {
                  console.warn("⚠️ Could not resume audio context:", resumeErr);
                  // Continue anyway - might still work
                }
              }

              // Create a VERY LOUD, noticeable notification sound
              const playTone = (frequency, startTime, duration, volume = 0.8) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                // Make it VERY loud and noticeable
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.005); // Quick ramp up
                gainNode.gain.setValueAtTime(volume, startTime + duration * 0.9); // Stay loud
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
              };

              // Play three loud tones: 800Hz → 1000Hz → 1200Hz (VERY LOUD notification)
              const now = audioContext.currentTime;
              playTone(800, now, 0.25, 0.8);        // First tone - VERY loud
              playTone(1000, now + 0.25, 0.25, 0.8); // Second tone - VERY loud
              playTone(1200, now + 0.5, 0.25, 0.8);  // Third tone - VERY loud

              console.log("🔊 ✅ LOUD notification beep sound played successfully (3 tones)");
              return;
            } catch (err) {
              console.error("❌ Beep sound generation failed:", err.message);

              // Fallback: Try VERY loud simple beep
              try {
                console.log("🔄 Trying fallback: simple loud beep...");
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContext.state === 'suspended') {
                  await audioContext.resume();
                }

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                // Make it VERY loud (0.8 = 80% volume)
                gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                console.log("🔊 ✅ Simple LOUD beep played as fallback");
              } catch (finalErr) {
                console.error("❌ All audio playback methods failed:", finalErr.message);
                console.error("❌ Error details:", finalErr);
              }
            }
          };

          playNotificationSound();

          // ✅ Toast Notification UI
          const toast = document.createElement('div');
          toast.style.position = 'fixed';
          toast.style.top = '20px';
          toast.style.right = '20px';
          toast.style.background = 'linear-gradient(135deg, #6366f1, #3b82f6)';
          toast.style.color = 'white';
          toast.style.padding = '14px 22px';
          toast.style.borderRadius = '12px';
          toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
          toast.style.fontFamily = 'system-ui, sans-serif';
          toast.style.fontSize = '15px';
          toast.style.fontWeight = '500';
          toast.style.zIndex = 9999;
          toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-10px)';
          toast.innerHTML = `
            <strong style="display:block;font-size:16px;margin-bottom:4px;">
              ${payload.notification?.title || 'New Notification'}
            </strong>
            <span>${payload.notification?.body || ''}</span>
          `;
          document.body.appendChild(toast);

          // Animate fade-in
          requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
          });

          // Remove toast after 5 seconds 
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
          }, 5000);

          console.log("✅ Foreground message shown with sound + toast");
        });



      } catch (err) {

        console.error("❌ FCM Setup Error:", err);

      }

    };

    setupFCM();
  }, [user, isAuthenticated]); // runs when user logs in


  const checkAuthStatus = async () => {
    try {
      console.log("🔐 Checking authentication status...");
      const isAuth = await AmplifyAuthService.isAuthenticated();

      if (isAuth) {
        console.log("✅ User is authenticated, fetching user data...");
        const userResult = await AmplifyAuthService.getCurrentUser();

        if (userResult.success) {
          console.log("✅ User data loaded:", userResult.user);
          setUser(userResult.user);
          setIsAuthenticated(true);
        } else {
          console.warn("⚠️ Failed to get user data:", userResult.error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log("ℹ️ No authenticated session found");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    console.log("✅ Login successful! User data:", userData);
    setUser(userData);
    setIsAuthenticated(true);
    // Redirect to dashboard after login
    const path = window.location.pathname;
    if (path.startsWith('/policy/')) {
      window.history.replaceState({}, '', '/dashboard');
      setActivePage('dashboard');
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await AmplifyAuthService.signOut();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        // Redirect to login page after sign out
        window.history.pushState({}, '', '/');
      } else {
        console.error('Sign out error:', result.error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // URL routing for authenticated pages
  const getPageFromRoute = () => {
    const path = window.location.pathname;
    const routeMap = {
      '/dashboard': 'dashboard',
      '/orders': 'orders',
      '/users': 'users',
      '/notifications': 'notifications',
      '/send-notification': 'send-notification',
      '/orders-detail': 'orders-detail',
      '/refund-policy': 'refund-policy',
      '/privacy-policy': 'privacy-policy',
      '/terms-and-conditions': 'terms-and-conditions',
      '/user-delete': 'user-delete',
      '/labours': 'labours',
      '/add-labour': 'add-labour',
      '/add-labour': 'add-labour',
      '/attendance': 'attendance',
      '/supported-areas': 'supported-areas',
      '/business-metrics': 'business-metrics',
      '/lifecycle-funnel': 'lifecycle-funnel',
      '/map-tracking': 'map-tracking'
    };
    return routeMap[path] || 'dashboard';
  };

  const getRouteForPage = (page) => {
    const pageMap = {
      'dashboard': '/dashboard',
      'orders': '/orders',
      'users': '/users',
      'notifications': '/notifications',
      'send-notification': '/send-notification',
      'orders-detail': '/orders-detail',
      'refund-policy': '/refund-policy',
      'privacy-policy': '/privacy-policy',
      'terms-and-conditions': '/terms-and-conditions',
      'user-delete': '/user-delete',
      'labours': '/labours',
      'add-labour': '/add-labour',
      'add-labour': '/add-labour',
      'attendance': '/attendance',
      'supported-areas': '/supported-areas',
      'business-metrics': '/business-metrics',
      'lifecycle-funnel': '/lifecycle-funnel',
      'map-tracking': '/map-tracking'
    };
    return pageMap[page] || '/dashboard';
  };

  const [activePage, setActivePage] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedLabourId, setSelectedLabourId] = useState(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState(null);
  const [showUserDelete, setShowUserDelete] = useState(false);

  // URL routing and initialization
  // MUST be before any early returns to follow React hooks rules
  useEffect(() => {
    const path = window.location.pathname;
    const isPolicyRoute = path.startsWith('/policy/');
    const isUserDeleteRoute = path === '/user-delete';

    if (!isAuthenticated) {
      // Non-authenticated: handle user-delete route, otherwise show login
      if (isUserDeleteRoute) {
        // Allow user-delete route without authentication
        setShowUserDelete(true);
      } else {
        // Redirect to login page for all other routes
        setShowUserDelete(false);
        if (path !== '/' && path !== '') {
          window.history.replaceState({}, '', '/');
        }
      }
    } else {
      // Authenticated: initialize page from URL
      const pageFromUrl = getPageFromRoute();
      if (pageFromUrl !== activePage) {
        setActivePage(pageFromUrl);
      }
      // Update URL if not matching
      const expectedRoute = getRouteForPage(pageFromUrl);
      if (path !== expectedRoute && !isPolicyRoute && !isUserDeleteRoute) {
        window.history.replaceState({}, '', expectedRoute);
      }
    }
  }, [isAuthenticated]);

  // Update URL when activePage changes (authenticated only)
  useEffect(() => {
    if (isAuthenticated) {
      const route = getRouteForPage(activePage);
      if (window.location.pathname !== route) {
        window.history.pushState({ page: activePage }, '', route);
      }
    }
  }, [activePage, isAuthenticated]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (isAuthenticated) {
        const pageFromUrl = getPageFromRoute();
        setActivePage(pageFromUrl);
      } else {
        // Handle non-authenticated routes
        const path = window.location.pathname;
        const isUserDeleteRoute = path === '/user-delete';

        if (isUserDeleteRoute) {
          setShowUserDelete(true);
        } else {
          setShowUserDelete(false);
          // Redirect to login page
          if (path !== '/' && path !== '') {
            window.history.replaceState({}, '', '/');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        // Check if user-delete route - show UserDelete component
        showUserDelete ? (
          <UserDelete onBack={() => {
            setShowUserDelete(false);
            window.history.pushState({}, '', '/');
          }} />
        ) : (
          <LoginSignup
            onAuthSuccess={handleAuthSuccess}
          />
        )
      ) : (
        activePage === 'contact-us' ? (
          // Full-screen Contact Us page without sidebar
          <div className="min-h-screen">
            <div className="bg-white border-b border-gray-200">
              <div className="min-h-14 h-auto sm:h-16 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Dashboard</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
                    onClick={handleSignOut}
                    title="Sign Out"
                  >
                    <i className="fas fa-sign-out-alt text-xs sm:text-sm"></i>
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
            <ContactUs />
          </div>
        ) : (
          <div className="min-h-screen flex flex-col">
            {/* Single Header with Logo, Company Name, and Actions */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
              <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left: Logo and Company Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <i className="fas fa-hammer text-base"></i>
                  </div>
                  <div className="font-bold text-gray-900 text-xl tracking-tight">Genie</div>
                </div>

                {/* Right: Action Buttons and User Info */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Contact Us Button with Tooltip */}
                  <div className="relative group">
                    <button
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      onClick={() => setActivePage('contact-us')}
                      title="Contact Us"
                    >
                      <i className="fas fa-envelope text-base sm:text-lg"></i>
                    </button>
                    <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                      Contact Us
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>

                  {/* Sign Out Button with Tooltip */}
                  <div className="relative group">
                    <button
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={handleSignOut}
                      title="Sign Out"
                    >
                      <i className="fas fa-sign-out-alt text-base sm:text-lg"></i>
                    </button>
                    <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                      Sign Out
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 ml-2 border-l border-gray-200">
                    <div className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {user?.email || 'User'}
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md ring-2 ring-blue-100 flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {(user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
              <Sidebar active={activePage} onNavigate={setActivePage} />
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {activePage === 'dashboard' && <Dashboard onNavigate={setActivePage} />}
                  {activePage === 'orders' && !selectedOrderId && (
                    <Orders onViewOrderDetails={setSelectedOrderId} />
                  )}
                  {activePage === 'orders' && selectedOrderId && (
                    <OrderDetails
                      orderId={selectedOrderId}
                      onBack={() => setSelectedOrderId(null)}
                    />
                  )}
                  {/* {activePage === 'labours' && !selectedLabourId && (
                    <LabourManagement onViewLabourDetails={setSelectedLabourId} />
                  )} */}
                  {/* {activePage === 'labours' && selectedLabourId && (
                    <LabourDetails 
                      labourId={selectedLabourId} 
                      onBack={() => setSelectedLabourId(null)} 
                    />
                  )} */}
                  {/* {activePage === 'suggestions' && !selectedSuggestionId && (
                    <SuggestionsManagement onViewSuggestionDetails={setSelectedSuggestionId} />
                  )}
                  {activePage === 'suggestions' && selectedSuggestionId && (
                    <SuggestionDetails 
                      suggestionId={selectedSuggestionId} 
                      onBack={() => setSelectedSuggestionId(null)} 
                    />
                  )} */}
                  {/* {activePage === 'categories' && <CategoryManagement />} */}
                  {activePage === 'notifications' && <NotificationManagement />}
                  {activePage === 'send-notification' && <SendNotification />}
                  {activePage === 'orders-detail' && <OrderDashBoard />}
                  {activePage === 'refund-policy' && <RefundCancellationPolicy />}
                  {activePage === 'privacy-policy' && <PrivacyPolicy />}
                  {activePage === 'terms-and-conditions' && <TermsAndConditions />}
                  {activePage === 'user-delete' && <UserDelete />}
                  {activePage === 'users' && !selectedUserId && (
                    <UsersList onViewUserDetails={setSelectedUserId} />
                  )}
                  {activePage === 'users' && selectedUserId && (
                    <UserDetails
                      userId={selectedUserId}
                      onBack={() => setSelectedUserId(null)}
                    />
                  )}
                  {activePage === 'labours' && (
                    <>
                      {console.log("App rendering LabourList, setActivePage:", typeof setActivePage)}
                      <LabourList
                        onNavigate={setActivePage}
                        onEdit={(id) => {
                          setSelectedLabourId(id);
                          setActivePage('add-labour');
                        }}
                      />
                    </>
                  )}
                  {activePage === 'add-labour' && (
                    <AddLabour
                      onNavigate={(page) => {
                        setActivePage(page);
                        if (page !== 'add-labour') setSelectedLabourId(null);
                      }}
                      labourId={selectedLabourId}
                    />
                  )}
                  {activePage === 'attendance' && <Attendance onNavigate={setActivePage} />}
                  {activePage === 'supported-areas' && <SupportedAreas />}
                  {activePage === 'business-metrics' && <BusinessMetrics />}
                  {activePage === 'lifecycle-funnel' && <LifecycleFunnel />}
                  {activePage === 'map-tracking' && <MapTracking />}
                  {/* {activePage === 'api-test' && <ApiTest />} */}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;