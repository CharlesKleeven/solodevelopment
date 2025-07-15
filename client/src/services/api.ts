import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const authAPI = {
    register: (userData: { username: string; email: string; password: string }) =>
        api.post('/auth/register', userData),

    login: (credentials: { emailOrUsername: string; password: string }) =>
        api.post('/auth/login', credentials),

    logout: () =>
        api.post('auth/logout'),

    // Checks current auth status
    me: () =>
        api.get('auth/me'),
};

export default api;

