// services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';

// Simple environment detection
const isDevelopment = window.location.hostname === 'localhost';
const API_BASE_URL = isDevelopment
    ? 'http://localhost:3001'
    : 'https://api.solodevelopment.org';

console.log('Environment:', { isDevelopment, hostname: window.location.hostname, API_BASE_URL });

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout for Render cold starts
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response; // Return full response, let components access .data
    },
    (error: AxiosError) => {
        // Log errors in development only
        if (isDevelopment) {
            console.error('API Error:', error.response?.data || error.message);
        }

        return Promise.reject(error);
    }
);

// Auth API endpoints with proper typing
export const authAPI = {
    register: async (data: { username: string; email: string; password: string }) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },

    login: async (data: { emailOrUsername: string; password: string }) => {
        const response = await api.post('/api/auth/login', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/api/auth/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
};

// Profile API endpoints - using auth routes
export const profileAPI = {
    getProfile: async () => {
        const response = await api.get('/api/auth/profile');
        return response.data;
    },

    updateProfile: async (data: {
        displayName?: string;
        bio?: string;
        links?: string[];
    }) => {
        const response = await api.put('/api/auth/profile', data);
        return response.data;
    },
};

export default api;