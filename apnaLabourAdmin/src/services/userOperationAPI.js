/**
 * User Operation API Service
 * Handles user operations like delete via Lambda function
 * 
 * API endpoint format: https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/op
 * You can find this in Amplify console or AWS API Gateway console
 * 
 * Routes:
 * - POST /op/delete-user - Delete user by phone number
 */

import { USER_OPERATION_API_BASE_URL } from '../config';

/**
 * Delete user by phone number (soft delete - sets isDeleted to true)
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Object>} - Result object with success status and user data
 */
export const deleteUserByPhone = async (phoneNumber) => {
  try {
    if (!phoneNumber || !phoneNumber.trim()) {
      throw new Error('Phone number is required');
    }

    // Endpoint: /op/delete-user (base path /op is configured in Lambda)
    const endpoint = `${USER_OPERATION_API_BASE_URL}/op/delete-user`;
    
    console.log('🔍 Calling delete user API:', endpoint);
    console.log('📱 Phone number:', phoneNumber);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }

    console.log('✅ User deleted successfully:', data.user);
    return data;

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

