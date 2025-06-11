import axios from 'axios';

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_DOMAIN || 'http://localhost:3001',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Automatically attach token from localStorage if available
apiClient.interceptors.request.use((config) => {
	const auth = localStorage.getItem('auth');
	if (auth) {
		const { token } = JSON.parse(auth);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

export default apiClient;
