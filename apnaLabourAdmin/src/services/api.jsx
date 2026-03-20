import { API_BASE_URL } from '../config';

const DEFAULT_HEADERS = {
	'Content-Type': 'application/json',
};

function withTimeout(promise, ms = 15000) {
	return new Promise((resolve, reject) => {
		const id = setTimeout(() => reject(new Error('Request timed out')), ms);
		promise
			.then((res) => {
				clearTimeout(id);
				resolve(res);
			})
			.catch((err) => {
				clearTimeout(id);
				reject(err);
			});
	});
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
	const url = `${API_BASE_URL}${path}`;
	const options = {
		method,
		headers: { ...DEFAULT_HEADERS, ...headers },
		signal,
	};
	if (body !== undefined) {
		options.body = JSON.stringify(body);
	}

	const response = await withTimeout(fetch(url, options));
	const isJson = response.headers.get('content-type')?.includes('application/json');
	const data = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const error = new Error((data && data.message) || 'Request failed');
		error.status = response.status;
		error.data = data;
		throw error;
	}

	return data;
}
