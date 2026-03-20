// import { generateClient } from 'aws-amplify/api';
// import { createWebTokens , updateWebTokens } from '../graphql/mutations'; // GraphQL mutation
// import * as APITypes from '../API'; // Amplify-generated TypeScript types (optional)

// // Create Amplify GraphQL client
// const client = generateClient();
// export const webTokenAPI = {
//     async upsert({ id, token }) {
//       try {
//         // Try to create first
//         const variables = { input: { id, token } };
//         const response = await client.graphql({
//           query: createWebTokens,
//           variables,
//         });
  
//         console.log('✅ Web Token created:', response);
//         return response.data?.createWebTokens;
  
//       } catch (error) {
//         console.warn('⚠️ Create failed, trying update...', error);
  
//         // If creation fails, try update
//         try {
//           const updateResponse = await client.graphql({
//             query: updateWebTokens, // your update mutation
//             variables: { input: { id, token } },
//           });
//           console.log('🔄 Web Token updated:', updateResponse);
//           return updateResponse.data?.updateWebTokens;
//         } catch (updateError) {
//           console.error('❌ Error updating web token:', updateError);
//           return null;
//         }
//       }
//     },
//   };

import { generateClient } from 'aws-amplify/api';
import { updateUsers } from '../graphql/mutations'; // Use your actual GraphQL mutations
import * as APITypes from '../API'; // optional, for TypeScript types

const client = generateClient();

export const webTokenAPI = {
  async upsert({ id, token }) {
    try {

      console.log("userid nrknrkmrmirf",id);
      
      // First, try to update the existing user with the FCM token
      const updateResponse = await client.graphql({
        query: updateUsers,
        variables: {
          input: { id, fcmToken: token },
        },
      });

      console.log('🔄 FCM Token updated for user:', updateResponse);
      return updateResponse.data?.updateUsers;

    } catch (error) {
      console.error('❌ Error updating user FCM token:', error);
      return null;
    }
  },
};
