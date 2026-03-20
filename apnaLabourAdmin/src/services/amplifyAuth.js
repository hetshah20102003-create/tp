import { Amplify } from 'aws-amplify';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  confirmSignUp,
  resendSignUpCode,
  updateUserAttributes,
  fetchUserAttributes
} from 'aws-amplify/auth';
import awsconfig from '../aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);


const { generateClient } = await import('aws-amplify/api');
const client = generateClient();
const mutations = await import('../graphql/mutations');


// AWS Amplify Authentication Service
export class AmplifyAuthService {
  // Sign up a new user (userType 3 - Admin)
  
  static async signUp(userData) {
    try {
      const { email, password } = userData;
      
      const result = await signUp({
        username: email, // Using email as username
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: false // Don't auto sign in, require verification first
        }
      });

      return {
        success: true,
        userId: result.userId,
        nextStep: result.nextStep,
        message: 'Admin account created successfully! Please check your email for verification code.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Confirm sign up with verification code
 // Confirm sign up with verification code and insert into Users table
static async confirmSignUp(userId, emailOrPhone, confirmationCode) {
  
  try {
    // Step 1: Verify in Cognito
    await confirmSignUp({
      username: emailOrPhone,
      confirmationCode
    });

    // Step 2: Set userType in Cognito attributes
    try {
      await updateUserAttributes({
        userAttributes: {
          'custom:userType': '3'
        }
      });
    } catch (updateError) {
      console.log('Could not set userType, using default:', updateError.message);
    }

    // Step 3: Insert into Users table
    try {
      // check if input is email or phone
      const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
      const email = isEmail ? emailOrPhone : null;
      const phoneNumber = !isEmail ? emailOrPhone : null;

      await client.graphql({
        query: mutations.createUsers,
        variables: {
          input: {
            id: userId,
            username: emailOrPhone,
            email,
            phoneNumber,
            firstName: '',
            lastName: '',
            userType: 3,
            isActive: true,
            isDeleted: false,
            isEmailVerified: isEmail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    } catch (dbError) {
      console.error('Error inserting into Users table:', dbError);
    }

    return {
      success: true,
      message: 'Account verified successfully! You can now sign in.'
    };
  } catch (error) {
    console.error('Confirm sign up error:', error);
    return {
      success: false,
      error: this.getErrorMessage(error)
    };
  }
}

  // Resend verification code
  static async resendVerificationCode(email) {
    try {
      await resendSignUpCode({
        username: email
      });

      return {
        success: true,
        message: 'Verification code sent successfully!'
      };
    } catch (error) {
      console.error('Resend verification code error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign in user
  static async signIn(credentials) {
    
    try {

      const { email, password } = credentials;
      
      const result = await signIn({
        username: email,
        password
      });

      if (result.isSignedIn) {
        // Get user attributes after successful sign in
        const userAttributes = await this.getUserAttributes();
        
        return {
          success: true,
          user: userAttributes,
          message: 'Login successful!'
        };
      } else {
        return {
          success: false,
          error: 'Login failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Sign out user
  static async signOut() {
    try {
      await signOut();
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      const userAttributes = await this.getUserAttributes();
      
      return {
        success: true,
        user: {
          ...user,
          ...userAttributes
        }
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.message || 'No user signed in'
      };
    }
  }

  // Get user attributes
  static async getUserAttributes() {
    try {
      const attributes = await fetchUserAttributes();
      
      return {
        id: attributes.sub,
        email: attributes.email,
        phoneNumber: null, // Admin users don't use phone numbers
        firstName: attributes.given_name || '',
        lastName: attributes.family_name || '',
        userType: parseInt(attributes['custom:userType']) || 3, // Default to admin if not set
        userTypeString: attributes['custom:userType'] || '3', // Keep original string for debugging
        isEmailVerified: attributes.email_verified || false,
        isPhoneVerified: attributes.phone_number_verified || false,
        createdAt: attributes.created_at,
        updatedAt: attributes.updated_at
      };
    } catch (error) {
      console.error('Get user attributes error:', error);
      return null;
    }
  }

  // Update user attributes
  static async updateUserAttributes(attributes) {
    try {
      const cognitoAttributes = {};
      
      // Map custom attributes
      if (attributes.firstName) cognitoAttributes.given_name = attributes.firstName;
      if (attributes.lastName) cognitoAttributes.family_name = attributes.lastName;
      if (attributes.userType) cognitoAttributes['custom:userType'] = attributes.userType.toString();

      await updateUserAttributes({
        userAttributes: cognitoAttributes
      });

      return {
        success: true,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Update user attributes error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper method to get user-friendly error messages
  static getErrorMessage(error) {
    const errorCode = error.name || error.code;
    
    switch (errorCode) {
      case 'UserNotFoundException':
        return 'No account found with this email address.';
      case 'NotAuthorizedException':
        return 'Incorrect password. Please try again.';
      case 'UserNotConfirmedException':
        return 'Please contact support to verify your account.';
      case 'UsernameExistsException':
        return 'An account with this email already exists.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements.';
      case 'InvalidParameterException':
        return 'Invalid email format.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}

export default AmplifyAuthService;