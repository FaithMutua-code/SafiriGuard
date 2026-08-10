import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/admin',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const url = error.config?.url || '';

            // Don't redirect when login itself fails
            if (!url.includes('/login')) {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;