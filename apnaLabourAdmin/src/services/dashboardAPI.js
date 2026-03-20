import { generateClient } from 'aws-amplify/api';
import { listBookings } from '../graphql/queries';
import { listUsers } from '../graphql/queries';

const client = generateClient();

export const dashboardAPI = {
  // Get all dashboard statistics
  async getDashboardStats() {
    try {
      // Fetch all data in parallel
      const [bookingsData, labourUsersData, customerUsersData] = await Promise.all([
        this.getAllBookings(),
        this.getUsersByType(2), // Active Labours
        this.getUsersByType(1)   // Total Users (Customers)
      ]);

      // Exclude cancelled bookings and other statuses
      const revenue = bookingsData.reduce((sum, booking) => {
        const status = booking.status?.toLowerCase();
        // Only include accepted (booked) and completed bookings
        if (status === 'completed') {
          return sum + (booking.totalAmount || 0);
        }
        return sum;
      }, 0);

      // Calculate Total Orders: Count of all bookings
      const totalOrders = bookingsData.length;

      // Active Labours: Count of users with userType = 2
      const activeLabours = labourUsersData.length;

      // Total Users: Count of users with userType = 1
      const totalUsers = customerUsersData.length;

      console.log('revenue', revenue);
      console.log('totalOrders', totalOrders);
      console.log('activeLabours', activeLabours);
      console.log('totalUsers', totalUsers);

      return {
        revenue,
        totalOrders,
        activeLabours,
        totalUsers
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all bookings (with pagination handling)
  async getAllBookings() {
    try {
      let allItems = [];
      let nextToken = null;

      do {
        const response = await client.graphql({
          query: listBookings,
          variables: {
            limit: 100,
            nextToken,
          },
        });

        const items = response?.data?.listBookings?.items || [];
        allItems = allItems.concat(items);
        nextToken = response?.data?.listBookings?.nextToken;
      } while (nextToken);

      return allItems;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get users by userType (with pagination handling)
  async getUsersByType(userType) {
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
      console.error(`Error fetching users with userType ${userType}:`, error);
      throw error;
    }
  },

  // Get all customer users (userType=1) — returns full objects with createdAt & updatedAt
  async getAllCustomers() {
    return this.getUsersByType(1);
  }
};
