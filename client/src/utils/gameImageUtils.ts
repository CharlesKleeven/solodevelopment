// Utilities for extracting game images from Steam and Itch.io URLs

interface GameImageResult {
  thumbnailUrl: string | null;
  platform: 'steam' | 'itch' | null;
  error?: string;
}

/**
 * Extract Steam App ID from various Steam URL formats
 */
function extractSteamAppId(url: string): string | null {
  try {
    const steamPatterns = [
      /store\.steampowered\.com\/app\/(\d+)/,
      /steamcommunity\.com\/app\/(\d+)/,
      /steam:\/\/store\/(\d+)/
    ];

    for (const pattern of steamPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract Itch.io username and game name from URL
 */
function extractItchInfo(url: string): { username: string; gameName: string } | null {
  try {
    // Match https://username.itch.io/game-name
    const match = url.match(/https?:\/\/([^.]+)\.itch\.io\/([^/?#]+)/);
    if (match && match[1] && match[2]) {
      return {
        username: match[1],
        gameName: match[2]
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get game thumbnail from Steam or Itch.io URL
 */
export function getGameImageFromUrl(url: string): GameImageResult {
  if (!url) {
    return { thumbnailUrl: null, platform: null, error: 'No URL provided' };
  }

  // Try Steam first
  const steamAppId = extractSteamAppId(url);
  if (steamAppId) {
    // Steam CDN URL for game capsule image (460x215)
    const thumbnailUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/capsule_616x353.jpg`;
    return { thumbnailUrl, platform: 'steam' };
  }

  // Try Itch.io
  const itchInfo = extractItchInfo(url);
  if (itchInfo) {
    // Note: Itch.io doesn't have a predictable CDN pattern
    // We'll need to make an API call or scrape the page
    // For now, we'll return null and let users manually add the image
    return { 
      thumbnailUrl: null, 
      platform: 'itch',
      error: 'Itch.io detected! Please add your cover image URL below'
    };
  }

  return { 
    thumbnailUrl: null, 
    platform: null, 
    error: 'URL must be from Steam or Itch.io' 
  };
}

/**
 * Validate if URL is from Steam or Itch.io
 */
export function isValidGamePlatformUrl(url: string): boolean {
  if (!url) return false;
  
  const steamAppId = extractSteamAppId(url);
  const itchInfo = extractItchInfo(url);
  
  return !!(steamAppId || itchInfo);
}

/**
 * Get platform name from URL
 */
export function getPlatformFromUrl(url: string): string {
  if (extractSteamAppId(url)) return 'Steam';
  if (extractItchInfo(url)) return 'Itch.io';
  return 'Unknown';
}

/**
 * Validate if a thumbnail URL is from approved sources
 */
export function isApprovedThumbnailSource(url: string): boolean {
  if (!url) return false;
  
  // Steam CDN URLs
  if (url.includes('steamstatic.com') || url.includes('steamcdn')) {
    return true;
  }
  
  // Itch.io image URLs
  if (url.includes('itch.io') || url.includes('hwcdn.net') || url.includes('img.itch.zone')) {
    return true;
  }
  
  return false;
}