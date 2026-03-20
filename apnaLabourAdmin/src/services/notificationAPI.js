import { generateClient } from 'aws-amplify/api';
import { post } from 'aws-amplify/api'; // Import post for REST API
import { getAppTokens, listUsers } from '../graphql/queries';
import { createNotification } from '../graphql/mutations';
import { messaging } from '../firebase';
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify if not already configured
if (!Amplify.getConfig().API) {
  Amplify.configure(awsconfig);
}

const client = generateClient();

// API Name defined in aws-exports.js
const API_NAME = 'notification';
// Use the bulk endpoint which handles multiple tokens efficiently using Firebase Multicast
// And handles invalid tokens without throwing 500 errors
const API_BULK_PATH = '/items/notify/send-notification-app';

const getNotificationApiEndpoint = () => {
  // Use production URL directly
  return 'https://3fov3isnyf.execute-api.ap-south-1.amazonaws.com/prod';
};

export const sendNotificationToTokens = async (tokens, notificationData) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No tokens provided for notification');
      return {
        success: false,
        message: 'No tokens provided',
        stats: { total: 0, sent: 0, failed: 0 }
      };
    }

    console.log(`🚀 Preparing to send notifications to ${tokens.length} devices...`);

    // Firebase Multicast limit is 500 tokens per request
    // We strictly limit to 450 to be safe
    const CHUNK_SIZE = 450;
    const chunks = [];

    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      chunks.push(tokens.slice(i, i + CHUNK_SIZE));
    }

    console.log(`📦 Split into ${chunks.length} batches (max ${CHUNK_SIZE}/batch)`);

    const results = {
      success: true,
      stats: { total: tokens.length, sent: 0, failed: 0 },
      failures: [],
      batches: 0
    };

    // Process chunks sequentially to avoid overwhelming the backend/network
    // or triggering rate limits
    for (const [index, chunk] of chunks.entries()) {
      console.log(`📤 Sending batch ${index + 1}/${chunks.length} (${chunk.length} tokens)...`);

      try {
        const restOperation = post({
          apiName: API_NAME,
          path: API_BULK_PATH,
          options: {
            body: {
              tokens: chunk,
              notification: {
                title: notificationData.title,
                body: notificationData.body,
                imageUrl: notificationData.imageUrl
              }
            }
          }
        });

        const response = await restOperation.response;
        const data = await response.body.json();

        // Check for HTTP errors
        if (response.statusCode >= 300) {
          console.error(`❌ Batch ${index + 1} failed:`, data);
          // Don't fail the whole process, just record the failures
          results.stats.failed += chunk.length;
          results.failures.push({
            batchIndex: index,
            error: data.message || `Status ${response.statusCode}`,
            tokens: chunk.length
          });
          continue;
        }

        // Aggregate stats
        if (data.stats) {
          results.stats.sent += data.stats.sent || 0;
          results.stats.failed += data.stats.failed || 0;
        } else {
          // Fallback if backend doesn't return stats
          results.stats.sent += chunk.length;
        }

        if (data.failures && Array.isArray(data.failures)) {
          results.failures.push(...data.failures);
        }

        console.log(`✅ Batch ${index + 1} completed: ${data.stats?.sent} sent, ${data.stats?.failed} failed`);

      } catch (batchError) {
        console.error(`❌ Batch ${index + 1} exception:`, batchError);
        results.stats.failed += chunk.length;
        results.failures.push({
          batchIndex: index,
          error: batchError.message,
          count: chunk.length
        });
      }
    }

    // Final summary
    console.log('🏁 Bulk notification process completed:', results.stats);

    return {
      success: true,
      stats: results.stats,
      failures: results.failures,
      message: `Processed ${tokens.length} tokens in ${chunks.length} batches. Sent: ${results.stats.sent}, Failed: ${results.stats.failed}`
    };

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return {
      success: false,
      error: error.message || 'Failed to send notification',
      message: error.message || 'Failed to send notification'
    };
  }
};

export const notifyAllUsers = async (notificationData) => {
  try {
    console.log('📤 Starting notification send process to ALL users...');
    console.log('📤 Notification data:', notificationData);

    // Fetch users with userType 1 & 2 using pagination to get EVERYONE
    console.log('👥 Fetching ALL users (Type 1 & 2)...');

    let allTokens = [];
    let nextToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      // console.log(`📄 Fetching page ${pageCount}...`);

      const { data } = await client.graphql({
        query: listUsers,
        variables: {
          filter: {
            or: [
              { userType: { eq: 1 } },
              { userType: { eq: 2 } }
            ],
            isActive: { eq: true },
            isDeleted: { ne: true }, // Ensure not deleted
          },
          limit: 1000, // Maximise limit per page
          nextToken: nextToken
        },
      });

      const items = data?.listUsers?.items || [];
      const pageTokens = items
        .map(u => u.fcmToken)
        .filter(t => t && t.length > 10); // Basic validation

      allTokens = allTokens.concat(pageTokens);
      nextToken = data?.listUsers?.nextToken;

    } while (nextToken);

    console.log(`✅ Total users fetched: ${allTokens.length} (across ${pageCount} pages)`);

    // Create notification record in database
    console.log('💾 Creating notification record...');
    try {
      const response = await client.graphql({
        query: createNotification,
        variables: {
          input: {
            title: notificationData.title,
            body: notificationData.body,
            imageUrl: notificationData.imageUrl || null,
          }
        },
      });
      console.log('✅ Notification record created:', response.data?.createNotification?.id);
    } catch (dbError) {
      console.warn('⚠️ Failed to create notification record (continuing anyway):', dbError);
    }

    if (!allTokens.length) {
      console.log('⚠️ No FCM tokens found for userType 1 & 2');
      return {
        success: false,
        message: 'No active users with device tokens found',
        stats: { total: 0, sent: 0, failed: 0 }
      };
    }

    // Remove duplicates
    const uniqueTokens = [...new Set(allTokens)];
    if (uniqueTokens.length !== allTokens.length) {
      console.log(`ℹ️ Removed ${allTokens.length - uniqueTokens.length} duplicate tokens`);
    }

    return await sendNotificationToTokens(uniqueTokens, notificationData);
  } catch (error) {
    console.error('❌ Error in notifyAllUsers:', error);
    return {
      success: false,
      error: error.message || 'Failed to send notification',
      message: error.message || 'Failed to send notification'
    };
  }
};