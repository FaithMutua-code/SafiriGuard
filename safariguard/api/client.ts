// api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/config/env';


const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

// ---- Request interceptor: attach token + log outgoing requests ----
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log(
      `[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data ? { body: config.data } : ''
    );

    return config;
  },
  (error) => {
    console.log('[API → ERROR]', error.message);
    return Promise.reject(error);
  }
);

// ---- Response interceptor: log success and failure responses ----
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API ←] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error status (422, 401, 500, etc.)
      console.log(
        `[API ← ERROR] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      // Request went out, no response came back — likely wrong IP, backend not running, or blocked network
      console.log(
        '[API ← NO RESPONSE]',
        error.message,
        '— check API_BASE_URL is reachable and Laravel is running (php artisan serve --host=0.0.0.0)'
      );
    } else {
      console.log('[API SETUP ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;