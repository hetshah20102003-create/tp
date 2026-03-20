import { generateClient } from 'aws-amplify/api';
import { listUsers, getUsers } from '../graphql/queries';
import { updateUsers } from '../graphql/mutations';

const client = generateClient();

export const usersAPI = {
  // Get all users with userType = 1
  async fetchUsers(userType = 1) {
    try {
      let allItems = [];
      let nextToken = null;

      do {
        const response = await client.graphql({
          query: listUsers,
          variables: {
            filter: {
              userType: { eq: userType },
              isDeleted: { ne: true } // Exclude deleted users
            },
            limit: 100,
            nextToken,
          },
        });

        const items = response?.data?.listUsers?.items || [];
        allItems = allItems.concat(items);
        nextToken = response?.data?.listUsers?.nextToken;
      } while (nextToken);

      return allItems;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async fetchUserById(userId) {
    try {
      const response = await client.graphql({
        query: getUsers,
        variables: { id: userId },
      });

      return response?.data?.getUsers || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Get users by IDs
  async fetchUsersByIds(userIds) {
    if (!userIds || userIds.length === 0) return [];

    try {
      // Chunking if necessary, but starting simple
      // AppSync filter supports 'or' or 'in' depending on schema version
      // Using 'or' with IDs list for compatibility if 'in' isn't supported directly on ID in all transform versions
      // Ideally 'id: { in: userIds }' works in newer Amplify

      let allItems = [];
      // Fetch in chunks of 50 to avoid filter limit issues
      const chunkSize = 50;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);

        // Construct filter
        const filter = {
          or: chunk.map(id => ({ id: { eq: id } }))
        };

        let nextToken = null;
        do {
          const response = await client.graphql({
            query: listUsers,
            variables: {
              filter: filter,
              limit: 100,
              nextToken,
            },
          });

          const items = response?.data?.listUsers?.items || [];
          allItems = allItems.concat(items);
          nextToken = response?.data?.listUsers?.nextToken;
        } while (nextToken);
      }

      return allItems;
    } catch (error) {
      console.error('Error fetching users by IDs:', error);
      // Return empty array so we don't break the caller
      return [];
    }
  },

  // Update user
  async updateUser(userDetails) {
    try {
      const response = await client.graphql({
        query: updateUsers,
        variables: { input: userDetails },
      });
      return response?.data?.updateUsers;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

