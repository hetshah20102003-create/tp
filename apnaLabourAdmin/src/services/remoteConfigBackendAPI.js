import { post, get, del } from 'aws-amplify/api';

const apiName = 'userOperationApi';
const path = '/op/remote-config';

export const remoteConfigBackendAPI = {
    /**
     * Get the current Remote Config template
     */
    getRemoteConfig: async () => {
        try {
            const restOperation = get({
                apiName,
                path: path
            });
            const response = await restOperation.response;
            const json = await response.body.json();
            return json;
        } catch (error) {
            console.error('Error fetching remote config:', error);
            throw error;
        }
    },

    /**
     * Update Remote Config parameters
     * @param {Object} parameters - Object containing parameters to add/update
     * Example: { "new_param": { "defaultValue": { "value": "true" } } }
     */
    updateRemoteConfig: async (parameters) => {
        try {
            const restOperation = post({
                apiName,
                path: path,
                options: {
                    body: { parameters }
                }
            });
            const response = await restOperation.response;
            const json = await response.body.json();
            return json;
        } catch (error) {
            console.error('Error updating remote config:', error);
            throw error;
        }
    },

    /**
     * Delete a Remote Config parameter
     * @param {string} key - The parameter key to delete
     */
    deleteRemoteConfig: async (key) => {
        try {
            const restOperation = del({
                apiName,
                path: `${path}/${key}`
            });
            const response = await restOperation.response;
            const json = await response.body.json();
            return json;
        } catch (error) {
            console.error(`Error deleting remote config parameter '${key}':`, error);
            throw error;
        }
    }
};
