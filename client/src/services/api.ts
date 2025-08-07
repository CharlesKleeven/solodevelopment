// services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';

// Simple environment detection
const isDevelopment = window.location.hostname === 'localhost';
const API_BASE_URL = isDevelopment
    ? 'http://localhost:3001'
    : 'https://api.solodevelopment.org';

// Only log in development
if (isDevelopment) {
    console.log('Environment:', { isDevelopment, hostname: window.location.hostname, API_BASE_URL });
}

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
        if (isDevelopment) {
            console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
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
        profileVisibility?: 'public' | 'private';
        links?: string[];
    }) => {
        const response = await api.put('/api/auth/profile', data);
        return response.data;
    },
};

// Game API endpoints
export const gameAPI = {
    // Get user's own games
    getMyGames: async (page = 1, limit = 12) => {
        const response = await api.get(`/api/games/my/games?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Create a new game
    createGame: async (gameData: {
        title: string;
        description: string;
        shortDescription?: string;
        thumbnailUrl?: string;
        screenshots?: string[];
        videoUrl?: string;
        playUrl?: string;
        sourceUrl?: string;
        devlogUrl?: string;
        tags?: string[];
        engine?: string;
        platforms: string[];
        jamEntry?: boolean;
        jamName?: string;
        jamPlacement?: number;
        visibility?: 'public' | 'unlisted' | 'private';
    }) => {
        const response = await api.post('/api/games', gameData);
        return response.data;
    },

    // Get a single game
    getGame: async (id: string) => {
        const response = await api.get(`/api/games/${id}`);
        return response.data;
    },

    // Update a game
    updateGame: async (id: string, gameData: any) => {
        const response = await api.put(`/api/games/${id}`, gameData);
        return response.data;
    },

    // Delete a game
    deleteGame: async (id: string) => {
        const response = await api.delete(`/api/games/${id}`);
        return response.data;
    },

    // Get games by username (public portfolio)
    getUserGames: async (username: string, page = 1, limit = 12) => {
        const response = await api.get(`/api/games/user/${username}?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Search/browse games
    searchGames: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        tags?: string[];
        engine?: string;
        platform?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.engine) queryParams.append('engine', params.engine);
        if (params.platform) queryParams.append('platform', params.platform);
        if (params.tags) {
            params.tags.forEach(tag => queryParams.append('tags', tag));
        }

        const response = await api.get(`/api/games?${queryParams.toString()}`);
        return response.data;
    },

    // Get featured games
    getFeaturedGames: async (limit = 6) => {
        const response = await api.get(`/api/games/featured/list?limit=${limit}`);
        return response.data;
    },
};

// User search API endpoints
export const userSearchAPI = {
    // Search users by username/display name
    searchUsers: async (params: {
        q: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams();
        
        queryParams.append('q', params.q);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await api.get(`/api/users/search?${queryParams.toString()}`);
        return response.data;
    },

    // Get featured community members
    getFeaturedCommunityMembers: async (limit = 10) => {
        const response = await api.get(`/api/users/featured?limit=${limit}`);
        return response.data;
    },
    
    // Get all users with pagination
    getAllUsers: async (params: {
        page?: number;
        limit?: number;
        hasGames?: boolean;
    }) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.hasGames !== undefined) queryParams.append('hasGames', params.hasGames.toString());
        
        const response = await api.get(`/api/users/all?${queryParams.toString()}`);
        return response.data;
    },

    // Get user stats/profile
    getUserStats: async (username: string) => {
        const response = await api.get(`/api/users/${username}/stats`);
        return response.data;
    },
};

// Theme voting API
export const themeAPI = {
    // Get themes for a jam
    getThemes: async (jamId: string) => {
        const response = await api.get(`/api/themes/jam/${jamId}`);
        return response;
    },

    // Vote on a theme
    voteOnTheme: async (themeId: string, vote: -1 | 0 | 1) => {
        const response = await api.post(`/api/themes/${themeId}/vote`, { vote });
        return response;
    },

    // Create themes (admin only)
    createThemes: async (jamId: string, themes: string[]) => {
        const response = await api.post('/api/themes/create', { jamId, themes });
        return response;
    },

    // Recalculate scores (admin only)
    recalculateScores: async (jamId: string) => {
        const response = await api.post(`/api/themes/recalculate/${jamId}`);
        return response;
    },
};

// Backup API
export const backupAPI = {
    // Create manual backup
    createBackup: async (jamId: string, reason?: string) => {
        const response = await api.post(`/api/backup/create/${jamId}`, { reason });
        return response;
    },

    // Get all backups for a jam
    getBackups: async (jamId: string) => {
        const response = await api.get(`/api/backup/jam/${jamId}`);
        return response;
    },

    // Get specific backup details
    getBackupDetails: async (backupId: string) => {
        const response = await api.get(`/api/backup/${backupId}`);
        return response;
    },

    // Restore from backup
    restoreBackup: async (backupId: string) => {
        const response = await api.post(`/api/backup/restore/${backupId}`);
        return response;
    },
};

// Jam management API
export const jamAPI = {
    // Get all jams (admin only)
    getAllJams: async () => {
        const response = await api.get('/api/jam-management/all');
        return response;
    },

    // Create a new jam (admin only)
    createJam: async (jamData: any) => {
        const response = await api.post('/api/jam-management/create', jamData);
        return response;
    },

    // Update a jam (admin only)
    updateJam: async (jamId: string, jamData: any) => {
        const response = await api.put(`/api/jam-management/${jamId}`, jamData);
        return response;
    },

    // Set current jam (admin only)
    setCurrentJam: async (jamId: string) => {
        const response = await api.post(`/api/jam-management/${jamId}/set-current`);
        return response;
    },

    // Delete a jam (admin only)
    deleteJam: async (jamId: string) => {
        const response = await api.delete(`/api/jam-management/${jamId}`);
        return response;
    },

    // Toggle voting for current jam (admin only)
    toggleVoting: async () => {
        const response = await api.post('/api/jam-management/toggle-voting');
        return response;
    },
};

export default api;