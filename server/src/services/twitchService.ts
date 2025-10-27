import axios from 'axios';

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface TwitchStream {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    thumbnail_url: string;
}

interface TwitchStreamsResponse {
    data: TwitchStream[];
}

class TwitchService {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor() {
        this.clientId = process.env.TWITCH_CLIENT_ID || '';
        this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    }

    /**
     * Get OAuth access token using Client Credentials flow
     */
    private async getAccessToken(): Promise<string> {
        // Return cached token if still valid
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        try {
            const response = await axios.post<TwitchTokenResponse>(
                'https://id.twitch.tv/oauth2/token',
                null,
                {
                    params: {
                        client_id: this.clientId,
                        client_secret: this.clientSecret,
                        grant_type: 'client_credentials'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Set expiration to 5 minutes before actual expiration for safety
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

            return this.accessToken;
        } catch (error) {
            console.error('Error getting Twitch access token:', error);
            throw new Error('Failed to authenticate with Twitch API');
        }
    }

    /**
     * Check which channels are currently live
     * @param usernames Array of Twitch usernames to check
     * @returns Object mapping username to live status and stream info
     */
    async getLiveStatus(usernames: string[]): Promise<{
        [username: string]: {
            isLive: boolean;
            viewerCount?: number;
            title?: string;
            gameName?: string;
            startedAt?: string;
        }
    }> {
        if (!this.clientId || !this.clientSecret) {
            console.warn('Twitch API credentials not configured');
            return {};
        }

        if (usernames.length === 0) {
            return {};
        }

        try {
            const token = await this.getAccessToken();

            // Twitch API allows up to 100 usernames per request
            const response = await axios.get<TwitchStreamsResponse>(
                'https://api.twitch.tv/helix/streams',
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        user_login: usernames
                    }
                }
            );

            const result: {
                [username: string]: {
                    isLive: boolean;
                    viewerCount?: number;
                    title?: string;
                    gameName?: string;
                    startedAt?: string;
                }
            } = {};

            // Initialize all usernames as offline
            usernames.forEach(username => {
                result[username.toLowerCase()] = { isLive: false };
            });

            // Update with live stream data
            response.data.data.forEach(stream => {
                result[stream.user_login.toLowerCase()] = {
                    isLive: true,
                    viewerCount: stream.viewer_count,
                    title: stream.title,
                    gameName: stream.game_name,
                    startedAt: stream.started_at
                };
            });

            return result;
        } catch (error) {
            console.error('Error fetching Twitch live status:', error);
            // Return empty object on error - frontend will handle gracefully
            return {};
        }
    }

    /**
     * Get detailed info about specific channels (whether live or not)
     * Useful for future features like channel avatars, descriptions, etc.
     */
    async getChannelInfo(usernames: string[]): Promise<any> {
        if (!this.clientId || !this.clientSecret) {
            return {};
        }

        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                'https://api.twitch.tv/helix/users',
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        login: usernames
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching Twitch channel info:', error);
            return {};
        }
    }
}

// Export singleton instance
export const twitchService = new TwitchService();