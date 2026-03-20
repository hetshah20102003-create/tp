import { getUrl, uploadData } from 'aws-amplify/storage';

// S3 Keys for static assets
export const S3_KEYS = {
  NOTIFICATION_AUDIO: 'public/notification/notification.mp3',
  LOCATION_ICON: 'public/location/location_icon.png',
};

// Cache for URLs to avoid repeated API calls
const urlCache = {};

/**
 * Get S3 URL for a file key
 * @param {string} key - S3 file key
 * @returns {Promise<string|null>} - URL string or null if failed
 */
export async function getS3Url(key) {
  try {
    // Check cache first
    if (urlCache[key]) {
      return urlCache[key];
    }

    const { url } = await getUrl({ 
      path: key,
      options: {
        expiresIn: 3600, // 1 hour expiry
      }
    });

    const urlString = url.toString();
    
    // Cache the URL
    urlCache[key] = urlString;
    
    console.log(`✅ S3 URL fetched for ${key}:`, urlString);
    return urlString;
  } catch (error) {
    console.error(`❌ Error fetching S3 URL for ${key}:`, error);
    return null;
  }
}

/**
 * Get notification audio URL (S3 or fallback to local)
 */
export async function getNotificationAudioUrl() {
  const s3Url = await getS3Url(S3_KEYS.NOTIFICATION_AUDIO);
  return s3Url || '/sounds/notification.mp3'; // Fallback to local
}

/**
 * Get location icon URL (S3 or fallback to local)
 */
export async function getLocationIconUrl() {
  console.log('📍 [MARKER] Starting to get location marker icon from S3...');
  console.log('📍 [MARKER] S3 Key:', S3_KEYS.LOCATION_ICON);
  
  try {
    const s3Url = await getS3Url(S3_KEYS.LOCATION_ICON);
    
    if (s3Url) {
      console.log('✅ [MARKER] Successfully retrieved marker icon from S3');
      console.log('✅ [MARKER] Marker URL:', s3Url);
      return s3Url;
    } else {
      console.warn('⚠️ [MARKER] Failed to get marker from S3, using local fallback');
      console.log('⚠️ [MARKER] Fallback URL: /icons/location_icon.png');
      return '/icons/location_icon.png'; // Fallback to local
    }
  } catch (error) {
    console.error('❌ [MARKER] Error getting location marker icon:', error);
    console.log('⚠️ [MARKER] Using local fallback due to error');
    return '/icons/location_icon.png'; // Fallback to local
  }
}

/**
 * Upload location marker icon to S3
 * @param {File} file - The marker icon file to upload
 * @returns {Promise<{success: boolean, data?: {imageUrl: string, key: string}, error?: string}>}
 */
export async function uploadLocationMarker(file) {
  console.log('📤 [MARKER] Starting to upload location marker icon to S3...');
  console.log('📤 [MARKER] File name:', file?.name);
  console.log('📤 [MARKER] File size:', file?.size, 'bytes');
  console.log('📤 [MARKER] File type:', file?.type);
  console.log('📤 [MARKER] Target S3 Key:', S3_KEYS.LOCATION_ICON);
  
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    console.log('📤 [MARKER] Uploading file to S3...');
    const uploadResult = await uploadData({
      path: S3_KEYS.LOCATION_ICON,
      data: file,
      options: { 
        contentType: file.type || 'image/png',
        level: 'public'
      },
    }).result;

    console.log('✅ [MARKER] Upload completed successfully');
    console.log('✅ [MARKER] Upload result:', uploadResult);

    // Get the S3 URL
    console.log('📍 [MARKER] Getting S3 URL for uploaded marker...');
    const { url } = await getUrl({ 
      path: S3_KEYS.LOCATION_ICON,
      options: {
        expiresIn: 3600,
      }
    });
    
    const urlString = url.toString();
    console.log('✅ [MARKER] Marker URL generated:', urlString);
    
    // Clear cache to force refresh
    if (urlCache[S3_KEYS.LOCATION_ICON]) {
      delete urlCache[S3_KEYS.LOCATION_ICON];
      console.log('🔄 [MARKER] Cleared cache for location icon');
    }

    return {
      success: true,
      data: {
        imageUrl: urlString,
        key: S3_KEYS.LOCATION_ICON,
      },
    };
  } catch (error) {
    console.error('❌ [MARKER] Error uploading location marker icon:', error);
    console.error('❌ [MARKER] Error details:', {
      message: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message || 'Failed to upload location marker icon',
    };
  }
}

