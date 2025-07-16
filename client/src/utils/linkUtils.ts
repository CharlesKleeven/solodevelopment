export interface LinkInfo {
    url: string;
    icon: string;
    displayText: string;
}

export const getLinkInfo = (url: string): LinkInfo => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

        // Icon and display text mapping
        const linkMappings: { [key: string]: { icon: string; name: string } } = {
            // Game platforms
            'itch.io': { icon: '🎮', name: 'itch.io' },
            'steam.com': { icon: '🎮', name: 'Steam' },
            'gamejolt.com': { icon: '🎮', name: 'Game Jolt' },

            // Code platforms
            'github.com': { icon: '💻', name: 'GitHub' },
            'gitlab.com': { icon: '💻', name: 'GitLab' },
            'bitbucket.org': { icon: '💻', name: 'Bitbucket' },

            // Social platforms
            'twitter.com': { icon: '🐦', name: 'Twitter' },
            'x.com': { icon: '🐦', name: 'X' },
            'bsky.app': { icon: '🦋', name: 'Bluesky' },
            'mastodon.social': { icon: '🐘', name: 'Mastodon' },
            'linkedin.com': { icon: '💼', name: 'LinkedIn' },
            'instagram.com': { icon: '📷', name: 'Instagram' },

            // Content platforms
            'youtube.com': { icon: '📺', name: 'YouTube' },
            'youtu.be': { icon: '📺', name: 'YouTube' },
            'twitch.tv': { icon: '📺', name: 'Twitch' },
            'tiktok.com': { icon: '🎵', name: 'TikTok' },

            // Art platforms
            'artstation.com': { icon: '🎨', name: 'ArtStation' },
            'behance.net': { icon: '🎨', name: 'Behance' },
            'dribbble.com': { icon: '🎨', name: 'Dribbble' },

            // Music platforms
            'soundcloud.com': { icon: '🎵', name: 'SoundCloud' },
            'spotify.com': { icon: '🎵', name: 'Spotify' },
            'bandcamp.com': { icon: '🎵', name: 'Bandcamp' },

            // Other
            'discord.gg': { icon: '💬', name: 'Discord' },
            'discord.com': { icon: '💬', name: 'Discord' },
            'patreon.com': { icon: '❤️', name: 'Patreon' },
            'ko-fi.com': { icon: '☕', name: 'Ko-fi' },
        };

        // Check for exact matches first
        if (linkMappings[hostname]) {
            return {
                url,
                icon: linkMappings[hostname].icon,
                displayText: hostname
            };
        }

        // Check for partial matches (like custom domains)
        for (const [domain, info] of Object.entries(linkMappings)) {
            if (hostname.includes(domain) || hostname.endsWith(domain)) {
                return {
                    url,
                    icon: info.icon,
                    displayText: hostname
                };
            }
        }

        // Default for unknown domains
        return {
            url,
            icon: '🌐',
            displayText: hostname
        };

    } catch (error) {
        // Fallback for invalid URLs
        return {
            url,
            icon: '🔗',
            displayText: url
        };
    }
};