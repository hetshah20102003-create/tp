import { apiRequest } from './api';

export function registerUser(payload) {
	// Backend expects: username, password, phone, lat, long, user_type (1|2|3 optional),
	// business_name (optional), gst_no (optional), business_type (optional enum)
	return apiRequest('/api/auth/loginOrRegister', {
		method: 'POST',
		body: payload,
	});
}

export function loginUser(credentials) {
	// Backend expects: username, password
	return apiRequest('/api/auth/loginOrRegister', {
		method: 'POST',
		body: credentials,
	});
}
