import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
// These imports will be valid after codegen
import { listLabour, listAttendances } from '../graphql/queries';
import { createLabour, updateLabour, deleteLabour, createAttendance, updateAttendance } from '../graphql/mutations';

const client = generateClient();

export const labourAPI = {
    // Fetch all labours
    async fetchLabours() {
        try {
            let allItems = [];
            let nextToken = null;
            do {
                const response = await client.graphql({
                    query: listLabour,
                    variables: {
                        limit: 100,
                        nextToken,
                    },
                });
                const items = response?.data?.listLabour?.items || [];
                allItems = allItems.concat(items);
                nextToken = response?.data?.listLabour?.nextToken;
            } while (nextToken);

            // Sort by creation date descending by default
            return allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Error fetching labours:', error);
            throw error;
        }
    },

    async createLabour(labourData) {
        try {
            const response = await client.graphql({
                query: createLabour,
                variables: { input: labourData },
            });
            return response?.data?.createLabour;
        } catch (error) {
            console.error('Error creating labour:', error);
            throw error;
        }
    },

    async updateLabour(labourData) {
        try {
            // Remove createdAt/updatedAt/owner if present to avoid errors
            const { createdAt, updatedAt, owner, ...input } = labourData;
            const response = await client.graphql({
                query: updateLabour,
                variables: { input },
            });
            return response?.data?.updateLabour;
        } catch (error) {
            console.error('Error updating labour:', error);
            throw error;
        }
    },

    async deleteLabour(id) {
        try {
            const response = await client.graphql({
                query: deleteLabour,
                variables: { input: { id } },
            });
            return response?.data?.deleteLabour;
        } catch (error) {
            console.error('Error deleting labour:', error);
            throw error;
        }
    },

    // Attendance
    async fetchAttendanceByDate(date) {
        // There is no direct index on date globally (it's sort key in existing schema for User, but here we don't have global date index yet unless we scan or add GSI)
        // The schema defined: labourId: ID! @index(name: "byLabour", sortKeyFields: ["date"])
        // So we can query by labour. To get all attendance for a date, we probably have to scan or filter.
        // Given the number of attendance records might grow, a scan is okay for small scale, but GSI on date would be better.
        // For now, I'll use listAttendances with filter.

        try {
            let allItems = [];
            let nextToken = null;
            do {
                const response = await client.graphql({
                    query: listAttendances,
                    variables: {
                        filter: { date: { eq: date } },
                        limit: 1000,
                        nextToken,
                    },
                });
                const items = response?.data?.listAttendances?.items || [];
                allItems = allItems.concat(items);
                nextToken = response?.data?.listAttendances?.nextToken;
            } while (nextToken);
            return allItems;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            throw error;
        }
    },

    async createAttendance(attendanceData) {
        try {
            const response = await client.graphql({
                query: createAttendance,
                variables: { input: attendanceData },
            });
            return response?.data?.createAttendance;
        } catch (error) {
            console.error('Error creating attendance:', error);
            throw error;
        }
    },

    async updateAttendance(attendanceData) {
        try {
            const { createdAt, updatedAt, owner, ...input } = attendanceData;
            const response = await client.graphql({
                query: updateAttendance,
                variables: { input },
            });
            return response?.data?.updateAttendance;
        } catch (error) {
            console.error('Error updating attendance:', error);
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
            const identityId = user?.userId || user?.username || 'public'; // Fallback if no user

            const fileKey = `public/labours/${Date.now()}_${fileName}`; // Using public for now as schema is public read

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
            return url.toString();
        } catch (error) {
            console.error('Get image error:', error);
            return null;
        }
    }
};
