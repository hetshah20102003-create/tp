import { remoteConfig } from '../firebase';
import { fetchAndActivate, getValue } from "firebase/remote-config";

export const remoteConfigAPI = {
    fetchSupportedAreas: async () => {
        try {
            await fetchAndActivate(remoteConfig);
            const val = getValue(remoteConfig, 'supported_areas');
            const jsonString = val.asString();

            try {
                const data = JSON.parse(jsonString);
                return data;
            } catch (parseError) {
                console.error("Error parsing supported_areas JSON:", parseError);
                return {};
            }
        } catch (error) {
            console.error("Error fetching remote config:", error);
            return {};
        }
    },

    // Note: Firebase Client SDK is read-only. Updates must be done via Firebase Console or Admin SDK (Backend).
    // This function is included to fit the service pattern but will only log/alert for now.
    updateSupportedAreas: async (newAreas) => {
        console.warn("Update attempted from client-side. This requires backend implementation or manual update in Firebase Console.");
        console.log("New data structure:", JSON.stringify(newAreas, null, 2));

        // In a real implementation with a backend proxy:
        // return await axios.post('/api/update-remote-config', { supported_areas: newAreas });

        return { success: false, message: "Client-side updates are not supported by Firebase Client SDK. Please update via Firebase Console or implement a backend endpoint." };
    }
};
