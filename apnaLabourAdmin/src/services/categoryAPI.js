// // import { apiRequest } from './api';


// import { API, graphqlOperation } from '@aws-amplify/api';
// import { Storage } from '@aws-amplify/storage';
// import {listCategories} from '../graphql/queries.ts';
// import {createCategory,updateCategory,deleteCategory} from '../graphql/mutations';

// // Category API endpoints
// // const CATEGORY_ENDPOINTS = {
// //   // Basic CRUD operations
// //   getAll: '/api/categories',
// //   getByCode: (code) => `/api/categories/${code}`,
// //   create: '/api/categories',
// //   update: (code) => `/api/categories/${code}`,
// //   delete: (code) => `/api/categories/${code}`,
  
// //   // Search and filtering
// //   search: '/api/categories/search',
// //   getPopular: '/api/categories/popular/list',
// //   getStats: '/api/categories/stats/overview',
  
// //   // Reviews
// //   addReview: (code) => `/api/categories/${code}/reviews`,
// //   updateReview: (code, reviewId) => `/api/categories/${code}/reviews/${reviewId}`,
// //   deleteReview: (code, reviewId) => `/api/categories/${code}/reviews/${reviewId}`,
  
// //   // Workers
// //   addWorker: (code) => `/api/categories/${code}/workers`,
// //   removeWorker: (code, workerId) => `/api/categories/${code}/workers/${workerId}`,
  
// //   // Utility operations
// //   togglePopular: (code) => `/api/categories/${code}/popular`,
// //   export: '/api/categories/export',
// //   import: '/api/categories/import',
  
// //   // Image operations
// //   uploadImage: '/api/categories/upload-image',
// //   getImage: (filename) => `/api/categories/image/${filename}`
// // };

// // Production-ready API service - no sample data

// export const categoryAPI = {

//   // Get all categories
//   // async getAll(options = {}) {

//   //   const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', popular } = options;
    
//   //   try {

//   //     const queryParams = new URLSearchParams({
//   //       page: page.toString(),
//   //       limit: limit.toString(),
//   //       sortBy,
//   //       sortOrder,
//   //       ...(popular !== undefined && { popular: popular.toString() })
//   //     });
      
//   //     const response = await apiRequest(`${CATEGORY_ENDPOINTS.getAll}?${queryParams}`);

//   //     return response.data || response; // Handle both response formats

//   //   } catch (error) {

//   //     console.error('Error fetching categories:', error);

//   //     throw error;

//   //   }

//   // },
    
  
// async getAll(options = {}) {

//   const { limit = 10, nextToken = null } = options;

//   try {

//     const filter = {};  // Add filter here if needed, e.g., popular: { eq: true }

//     const variables = { limit, nextToken, filter };

//     const response = await API.graphql(graphqlOperation(listCategories, variables));

//     return response.data.listCategory;  // contains items array and nextToken for pagination

//   } catch (error) {

//     console.error('Error fetching categories via Amplify:', error);

//     throw error;

//   }

// },


// // async getByCode(code) {
// //    try {
// //    const response = await apiRequest(CATEGORY_ENDPOINTS.getByCode(code));
// //    return response.data || response; // Handle both response formats
// //    } catch (error) {
// //    console.error('Error fetching category:', error);
// //    throw error;
// //     }
// //    },


// async  getByCode(code) {

//   try {
//     // If 'getCategory' queries by primary key (id), but you want code, use listCategory with a filter:
//     const filter = { code: { eq: code } };

//     const variables = { filter, limit: 1 };

//     const response = await API.graphql(graphqlOperation(listCategories, variables));

//     const items = response.data.listCategory.items;

//     // Return first matching item or null

//     return items.length > 0 ? items[0] : null;

//   } catch (error) {

//     console.error('Error fetching category:', error);

//     throw error;

//   }

// },

// // async create(categoryData) {
// //   try {
// //     const response = await apiRequest(CATEGORY_ENDPOINTS.create, {
// //       method: 'POST',
// //       body: categoryData
// //     });
// //     return response.data || response;
// //   } catch (error) {
// //     console.error('Error creating category:', error);
// //     throw error;
// //   }
// // }


//   // Create new category
//   async  create(categoryData) {

//     try {

//       const response = await API.graphql(graphqlOperation(createCategory, { input: categoryData }));

//       return response.data.createCategory;

//     } 
    
//     catch (error) {

//       console.error('Error creating category:', error);

//       throw error;

//     }

//   },


//   // Update category
//   // async update(code, categoryData) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.update(code), {
//   //       method: 'PUT',
//   //       body: categoryData
//   //     });
//   //     return response.data || response; // Handle both response formats
//   //   } catch (error) {
//   //     console.error('Error updating category:', error);
//   //     throw error;
//   //   }
//   // },

//   async  update(categoryData) {

//     try {
//       // categoryData should include the unique key (e.g., code or id)
//       const response = await API.graphql(graphqlOperation(updateCategory, { input: categoryData }));

//       return response.data.updateCategory;

//     } 
    
//     catch (error) {

//       console.error('Error updating category:', error);

//       throw error;

//     }

//   },

//   // Delete category
//   // async delete(code) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.delete(code), {
//   //       method: 'DELETE'
//   //     });
//   //     return response.data || response; // Handle both response formats
//   //   } catch (error) {
//   //     console.error('Error deleting category:', error);
//   //     throw error;
//   //   }
//   // },

//   async  delete(code) {

//     try {
//       // Pass the code (or id) as input to identify the record to delete
//       const response = await API.graphql(graphqlOperation(deleteCategory, { input: { id: code } }));

//       return response.data.deleteCategory;

//     } catch (error) {

//       console.error('Error deleting category:', error);

//       throw error;

//     }

//   },

//   // Search categories
//   // async search(query, filters = {}) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.search, {
//   //       method: 'POST',
//   //       body: { query, filters }
//   //     });
//   //     return response.data || response; // Handle both response formats
//   //   } catch (error) {
//   //     console.error('Error searching categories:', error);
//   //     throw error;
//   //   }
//   // },

//   // Get popular categories
//   // async getPopular(limit = 5) {
//   //   try {
//   //     const response = await apiRequest(`${CATEGORY_ENDPOINTS.getPopular}?limit=${limit}`);
//   //     return response.data || response;
//   //   } catch (error) {
//   //     console.error('Error fetching popular categories:', error);
//   //     throw error;
//   //   }
//   // },

//   // Get category statistics
//   // async getStats() {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.getStats);
//   //     return response.data || response;
//   //   } catch (error) {
//   //     console.error('Error fetching category stats:', error);
//   //     throw error;
//   //   }
//   // },

//   // Add review to category
//   // async addReview(categoryCode, reviewData) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.addReview(categoryCode), {
//   //       method: 'POST',
//   //       body: reviewData
//   //     });
//   //     return response.data || response;
//   //   } catch (error) {
//   //     console.error('Error adding review:', error);
//   //     throw error;
//   //   }
//   // },

//   // Add worker to category
//   // async addWorker(categoryCode, workerData) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.addWorker(categoryCode), {
//   //       method: 'POST',
//   //       body: workerData
//   //     });
//   //     return response.data || response;
//   //   } catch (error) {
//   //     console.error('Error adding worker:', error);
//   //     throw error;
//   //   }
//   // },

//   // Remove worker from category
//   // async removeWorker(categoryCode, workerId) {
//   //   try {
//   //     const response = await apiRequest(CATEGORY_ENDPOINTS.removeWorker(categoryCode, workerId), {
//   //       method: 'DELETE'
//   //     });
//   //     return response.data || response;
//   //   } catch (error) {
//   //     console.error('Error removing worker:', error);
//   //     throw error;
//   //   }
//   // },

//   // Upload image
//   // async uploadImage(formData) {

//   //   try {
//   //     const { API_BASE_URL } = await import('../config');
//   //     const url = `${API_BASE_URL}${CATEGORY_ENDPOINTS.uploadImage}`;
      
//   //     console.log('Uploading to URL:', url);
//   //     console.log('FormData contents:', Array.from(formData.entries()));
      
//   //     const response = await fetch(url, {
//   //       method: 'POST',
//   //       body: formData
//   //       // Note: Don't set Content-Type header, let browser set it with boundary
//   //     });
      
//   //     console.log('Response status:', response.status);
//   //     console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
//   //     if (!response.ok) {
//   //       let errorMessage = `HTTP error! status: ${response.status}`;
//   //       try {
//   //         const errorData = await response.json();
//   //         console.log('Error response data:', errorData);
//   //         errorMessage = errorData.message || errorData.error || errorMessage;
//   //       } catch (e) {
//   //         console.log('Could not parse error response as JSON');
//   //       }
//   //       throw new Error(errorMessage);
//   //     }
      
//   //     const data = await response.json();
//   //     console.log('Upload success data:', data);
//   //     return data;
//   //   } catch (error) {
//   //     console.error('Error uploading image:', error);
//   //     throw error;
//   //   }
//   // },

//   async  uploadImage(formData) {

//     try {
//       // Extract file object from formData, adjust key name if needed

//       const file = formData.get('image');

//       if (!file) throw new Error('No image file found in formData');
  
//       // Upload file to S3 bucket configured in Amplify
//       const s3Result = await Storage.put(file.name, file, {

//         contentType: file.type,

//         level: 'public'  // set access level as needed

//       });
  
//       console.log('File uploaded successfully with key:', s3Result.key);
  
//       // Get public URL of the uploaded file
//       const fileUrl = await Storage.get(s3Result.key, { level: 'public' });

//       console.log('File accessible at:', fileUrl);
  
//       // Return structure like your expected response
//       return { success: true, data: { imageUrl: fileUrl, key: s3Result.key } };
  
//     } catch (error) {

//       console.error('Error uploading image:', error);

//       return { success: false, error: error.message || 'Upload error' };

//     }

//   }

//   // Get image URL
//   // async getImageUrl(filename) {
//   //   const { API_BASE_URL } = await import('../config');
//   //   return `${API_BASE_URL}${CATEGORY_ENDPOINTS.getImage(filename)}`;
//   // },


//   // Test API connectivity
//   // async testConnection() {
//   //   try {
//   //     const { API_BASE_URL } = await import('../config');
//   //     const response = await fetch(`${API_BASE_URL}/api/categories`);
//   //     console.log('API Connection Test:', {
//   //       url: `${API_BASE_URL}/api/categories`,
//   //       status: response.status,
//   //       ok: response.ok
//   //     });
//   //     return response.ok;
//   //   } catch (error) {
//   //     console.error('API Connection Test Failed:', error);
//   //     return false;
//   //   }
//   // }

// };

import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { deleteCategoryByCode } from '../graphql/mutations'; // Import the new mutations

import { listCategories } from '../graphql/queries';
import { createCategory, updateCategory, deleteCategory } from '../graphql/mutations';

// Create Amplify GraphQL client
const client = generateClient();

  export const categoryAPI = {
    // Fetch all categories with optional params
    async getAll(options = {}) {

      const { limit = 100, nextToken = null, filter = null, sortDirection = null } = options;

      try {

        console.log('Fetching categories with options:', options);

        const variables = { limit, nextToken, filter, sortDirection };

        const response = await client.graphql({
          query: listCategories,
          variables,
        });
        
        console.log('GraphQL response:', response);
    
        // Always return array
        return response.data?.listCategories?.items || [];

      } catch (error) {

        console.error('Error fetching categories via Amplify:', error);

        return [];

      }

    },

  // Fetch category by unique code
  async getByCode(code) {
    try {
      const filter = { code: { eq: code } };
      const variables = { filter, limit: 1 };
      const response = await client.graphql({
        query: listCategories,
        variables,
      });
      return response.data.listCategories.items[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create a new category
  async create(categoryData) {
    try {
      console.log('Category data:', categoryData);
  
      const input = {
        name: categoryData.name,
        category: categoryData.category,
        description: categoryData.description,
  
        image: categoryData.image || null,
        imageFile: categoryData.imageFile || null,
  
        commission: categoryData.commission
          ? parseFloat(categoryData.commission)
          : null,
        rate: categoryData.rate ? parseFloat(categoryData.rate) : null,
  
        popular: categoryData.popular || false,

        isopenCategory: categoryData.isopenCategory || false,

        // Floor-wise rates
        additionalRate: categoryData.additionalRate?.length
          ? categoryData.additionalRate.map((f) => ({
              floorNumber: f.floorNumber ? parseInt(f.floorNumber) : null,
              rate: f.rate ? parseFloat(f.rate) : null,
            }))
          : null,
  
        // Truck-size-wise rates
        truckSizeWiseRate: categoryData.truckSizeWiseRate?.length
          ? categoryData.truckSizeWiseRate.map((f) => ({
              truckSize: f.truckSize || null,
              LabourCount: f.LabourCount || null,
              rate: f.rate ? parseFloat(f.rate) : null,
              imageUrl: f.imageUrl || null,
              maxLabourAddAllowance: f.maxLabourAddAllowance ? parseFloat(f.maxLabourAddAllowance) : null,
              ExtraLabourPrice: f.ExtraLabourPrice ? parseFloat(f.ExtraLabourPrice) : null,
            }))
          : null,
  
        // Unit-wise rates
        unitWiseRate: categoryData.unitWiseRate?.length
          ? categoryData.unitWiseRate.map((f) => ({
              unitNumber: f.unitNumber || null,
              rate: f.rate ? parseFloat(f.rate) : null,
              imageUrl: f.imageUrl || null,
              maxLabourAddAllowance: f.maxLabourAddAllowance ? parseFloat(f.maxLabourAddAllowance) : null,
              ExtraLabourPrice: f.ExtraLabourPrice ? parseFloat(f.ExtraLabourPrice) : null,
            }))
          : null,
  
        // Ton-wise rates
        tonWiseRate: categoryData.tonWiseRate?.length
          ? categoryData.tonWiseRate.map((f) => ({
              TonSize: f.TonSize || null,
              MinLabourCount: f.MinLabourCount || null,
              // tonNumber: parseInt(f.tonNumber) || null,
              rate: f.rate ? parseFloat(f.rate) : null,
            }))
          : null,
      };
  
      // Remove null fields recursively
      Object.keys(input).forEach((key) => input[key] === null && delete input[key]);
  
      const response = await client.graphql({
        query: createCategory,
        variables: { input },
      });
  
      return response.data.createCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  
  async update(categoryData) {
    try {
      console.log('Updating category:', categoryData);
  
      const input = {
        id: categoryData.id,
        name: categoryData.name,
        category: categoryData.category,
        description: categoryData.description,
  
        image: categoryData.image || null,
        imageFile: categoryData.imageFile || null,

        isopenCategory: categoryData.isopenCategory || false,
   
        commission: categoryData.commission
          ? parseFloat(categoryData.commission)
          : null,
        rate: categoryData.rate ? parseFloat(categoryData.rate) : null,
  
        popular: categoryData.popular || false,
  
        additionalRate: categoryData.additionalRate?.length
          ? categoryData.additionalRate.map((f) => ({
              floorNumber: f.floorNumber ? parseInt(f.floorNumber) : null,
              rate: f.rate ? parseFloat(f.rate) : null,
            }))
          : null,
  
        truckSizeWiseRate: categoryData.truckSizeWiseRate?.length
          ? categoryData.truckSizeWiseRate.map((f) => ({
              truckSize: f.truckSize || null,
              LabourCount: f.LabourCount || null,
              rate: f.rate ? parseFloat(f.rate) : null,
              imageUrl: f.imageUrl || null,
              maxLabourAddAllowance: f.maxLabourAddAllowance ? parseFloat(f.maxLabourAddAllowance) : null,
              ExtraLabourPrice: f.ExtraLabourPrice ? parseFloat(f.ExtraLabourPrice) : null,
            }))
          : null,
  
        unitWiseRate: categoryData.unitWiseRate?.length
          ? categoryData.unitWiseRate.map((f) => ({
              unitNumber: f.unitNumber || null,
              rate: f.rate ? parseFloat(f.rate) : null,
              imageUrl: f.imageUrl || null,
              maxLabourAddAllowance: f.maxLabourAddAllowance ? parseFloat(f.maxLabourAddAllowance) : null,
              ExtraLabourPrice: f.ExtraLabourPrice ? parseFloat(f.ExtraLabourPrice) : null,
            }))
          : null,
  
        tonWiseRate: categoryData.tonWiseRate?.length
          ? categoryData.tonWiseRate.map((f) => ({
              TonSize: f.TonSize || null,
              MinLabourCount: f.MinLabourCount || null,
              // tonNumber: parseInt(f.tonNumber) || null,
              rate: f.rate ? parseFloat(f.rate) : null,
            }))
          : null,
      };
  
      Object.keys(input).forEach((key) => input[key] === null && delete input[key]);
  
      console.log('Input for update:', input);
  
      const response = await client.graphql({
        query: updateCategory,
        variables: { input },
      });
  
      return response.data.updateCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

 // Add this method to your existing categoryAPI
  async delete(id) {
    try {
      console.log('Deleting category by id:', id);

      const response = await client.graphql({
        query: deleteCategory,
        variables: {
          input: { id }  // Amplify requires { input: { id } }
        }
      });

      console.log('Delete response:', response);
      return response.data.deleteCategory;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Upload image to S3 and return URL and key
  async uploadImage(file) {
    try {
      console.log('Starting upload with file:', file);

      let imageFile = file;
      if (file instanceof FormData) {
        imageFile = file.get('image');
      }

      if (!imageFile) {
        throw new Error('No image file found');
      }

      const fileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
     // get current user identity
     const user = await getCurrentUser();
const identityId = user?.attributes?.sub || user?.username;

const fileKey = `private/${identityId}/categories/${Date.now()}_${fileName}`;

      console.log('Uploading file with key:', fileKey);

      const uploadResult = await uploadData({
        path: fileKey,
        data: imageFile,
        options: { contentType: imageFile.type },
      }).result;

      console.log('Upload result:', uploadResult);

      const { url } = await getUrl({ path: fileKey });
      console.log('Generated URL:', url);

      return {
        success: true,
        data: { imageUrl: url.toString(), key: fileKey },
      };
    } catch (error) {
      console.error('Upload error details:', error);
      return { success: false, error: error.message || 'Image upload failed' };
    }
  },

  async getImageUrl(fileKey) {
    try {
      const { url } = await getUrl({ path: fileKey });
      console.log('Fetched URL:', url);
      return url.toString();
    } catch (error) {
      console.error('Get image error:', error);
      return null;
    }
  },
};
