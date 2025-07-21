interface LinkInfo {
  url: string;
  displayText: string;
  platform: string;
}

interface PlatformInfo {
  name: string;
  contains?: boolean;
}

const ALLOWED_PLATFORMS: Record<string, PlatformInfo> = {
  'github.com': { name: 'GitHub' },
  'twitter.com': { name: 'Twitter' },
  'x.com': { name: 'X' },
  'linkedin.com': { name: 'LinkedIn' },
  'youtube.com': { name: 'YouTube' },
  'twitch.tv': { name: 'Twitch' },
  'instagram.com': { name: 'Instagram' },
  'behance.net': { name: 'Behance' },
  'dribbble.com': { name: 'Dribbble' },
  'artstation.com': { name: 'ArtStation' },
  'deviantart.com': { name: 'DeviantArt' },
  'medium.com': { name: 'Medium' },
  'dev.to': { name: 'Dev.to' },
  'codepen.io': { name: 'CodePen' },
  'itch.io': { name: 'itch.io' },
  'steam': { name: 'Steam', contains: true },
  'discord.gg': { name: 'Discord' },
  'discord.com': { name: 'Discord' },
  'facebook.com': { name: 'Facebook' },
  'reddit.com': { name: 'Reddit' },
  'tiktok.com': { name: 'TikTok' },
  'pinterest.com': { name: 'Pinterest' },
  'tumblr.com': { name: 'Tumblr' },
  'spotify.com': { name: 'Spotify' },
  'soundcloud.com': { name: 'SoundCloud' },
  'bandcamp.com': { name: 'Bandcamp' },
  'patreon.com': { name: 'Patreon' },
  'ko-fi.com': { name: 'Ko-fi' },
  'buymeacoffee.com': { name: 'Buy Me a Coffee' },
  'gumroad.com': { name: 'Gumroad' },
  'substack.com': { name: 'Substack' },
  'mastodon': { name: 'Mastodon', contains: true },
  'bluesky': { name: 'Bluesky', contains: true },
  'threads.net': { name: 'Threads' },
  'polywork.com': { name: 'Polywork' },
  'figma.com': { name: 'Figma' },
  'notion.so': { name: 'Notion' },
  'carrd.co': { name: 'Carrd' },
  'bio.link': { name: 'Bio.link' },
  'linktr.ee': { name: 'Linktree' },
  'beacons.ai': { name: 'Beacons' },
};

export function isAllowedPlatform(url: string): boolean {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
    
    // Check exact matches
    if (ALLOWED_PLATFORMS[hostname]) {
      return true;
    }
    
    // Check contains matches (for domains with subdomains like steam)
    for (const [domain, info] of Object.entries(ALLOWED_PLATFORMS)) {
      if (info.contains && hostname.includes(domain)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

export function getLinkInfo(link: string): LinkInfo {
  let url = link.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
    
    // Check for known platforms
    for (const [domain, info] of Object.entries(ALLOWED_PLATFORMS)) {
      if (hostname === domain || (info.contains && hostname.includes(domain))) {
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        let displayText = info.name;
        
        // Platform-specific display logic
        if (pathParts.length > 0 && pathParts[0].length > 0) {
          // Social platforms with usernames
          if (['github.com', 'twitter.com', 'x.com', 'instagram.com', 'tiktok.com'].includes(hostname)) {
            displayText = `${info.name}: @${pathParts[0]}`;
          } else if (['linkedin.com'].includes(hostname) && pathParts[0] === 'in' && pathParts[1]) {
            displayText = `LinkedIn: ${pathParts[1]}`;
          } else if (['twitch.tv'].includes(hostname)) {
            displayText = `Twitch: ${pathParts[0]}`;
          } else if (['behance.net', 'dribbble.com'].includes(hostname)) {
            displayText = `${info.name}: ${pathParts[0]}`;
          } else if (['medium.com'].includes(hostname) && pathParts[0].startsWith('@')) {
            displayText = `Medium: ${pathParts[0]}`;
          } else if (['dev.to'].includes(hostname)) {
            displayText = `Dev.to: ${pathParts[0]}`;
          } else if (['reddit.com'].includes(hostname) && pathParts[0] === 'user' && pathParts[1]) {
            displayText = `Reddit: u/${pathParts[1]}`;
          } else if (['tumblr.com'].includes(hostname) && urlObj.hostname.split('.')[0] !== 'www') {
            displayText = `Tumblr: ${urlObj.hostname.split('.')[0]}`;
          } else if (hostname.includes('discord')) {
            displayText = 'Discord Server';
          } else if (hostname === 'youtube.com') {
            if (pathParts[0] === 'channel' && pathParts[1]) {
              displayText = 'YouTube Channel';
            } else if (pathParts[0] === 'c' && pathParts[1]) {
              displayText = `YouTube: ${pathParts[1]}`;
            } else if (pathParts[0].startsWith('@')) {
              displayText = `YouTube: ${pathParts[0]}`;
            } else if (pathParts[0] && !['watch', 'playlist', 'results', 'feed'].includes(pathParts[0])) {
              // This handles vanity URLs like youtube.com/pewdiepie
              displayText = `YouTube: ${pathParts[0]}`;
            } else {
              displayText = 'YouTube';
            }
          } else if (['patreon.com'].includes(hostname) && pathParts[0]) {
            displayText = `Patreon: ${pathParts[0]}`;
          } else if (['ko-fi.com'].includes(hostname) && pathParts[0]) {
            displayText = `Ko-fi: ${pathParts[0]}`;
          } else if (['itch.io'].includes(hostname) && urlObj.hostname.split('.')[0] !== 'www') {
            displayText = `itch.io: ${urlObj.hostname.split('.')[0]}`;
          } else if (['artstation.com'].includes(hostname) && pathParts[0]) {
            displayText = `ArtStation: ${pathParts[0]}`;
          } else if (['spotify.com'].includes(hostname) && pathParts[0] === 'artist' && pathParts[1]) {
            displayText = 'Spotify Artist';
          } else if (['soundcloud.com'].includes(hostname) && pathParts[0]) {
            displayText = `SoundCloud: ${pathParts[0]}`;
          } else if (['figma.com'].includes(hostname) && pathParts[0] === '@' && pathParts[1]) {
            displayText = `Figma: @${pathParts[1]}`;
          } else if (['buymeacoffee.com'].includes(hostname) && pathParts[0]) {
            displayText = `Buy Me a Coffee: ${pathParts[0]}`;
          } else if (['threads.net'].includes(hostname)) {
            if (pathParts[0] && pathParts[0].startsWith('@')) {
              displayText = `Threads: ${pathParts[0]}`;
            } else if (pathParts[0]) {
              displayText = `Threads: @${pathParts[0]}`;
            }
          } else if (['facebook.com'].includes(hostname) && pathParts[0]) {
            displayText = `Facebook: ${pathParts[0]}`;
          } else if (['pinterest.com'].includes(hostname) && pathParts[0]) {
            displayText = `Pinterest: ${pathParts[0]}`;
          } else if (['bandcamp.com'].includes(hostname)) {
            const subdomain = urlObj.hostname.split('.')[0];
            if (subdomain !== 'www' && subdomain !== 'bandcamp') {
              displayText = `Bandcamp: ${subdomain}`;
            } else if (pathParts[0]) {
              displayText = `Bandcamp: ${pathParts[0]}`;
            }
          } else if (['deviantart.com'].includes(hostname) && urlObj.hostname.split('.')[0] !== 'www') {
            displayText = `DeviantArt: ${urlObj.hostname.split('.')[0]}`;
          } else if (['codepen.io'].includes(hostname) && pathParts[0]) {
            displayText = `CodePen: ${pathParts[0]}`;
          }
        }
        
        // If we still have just the platform name, make it clearer
        if (displayText === info.name) {
          if (['linktr.ee', 'bio.link', 'carrd.co', 'beacons.ai'].includes(hostname)) {
            displayText = `${info.name} Profile`;
          } else if (['notion.so'].includes(hostname)) {
            displayText = 'Notion Page';
          } else if (['gumroad.com'].includes(hostname)) {
            displayText = 'Gumroad Store';
          } else if (['substack.com'].includes(hostname)) {
            displayText = 'Substack Newsletter';
          } else if (['polywork.com'].includes(hostname)) {
            displayText = 'Polywork Profile';
          }
        }
        
        return {
          url,
          displayText,
          platform: info.name
        };
      }
    }
    
    // This shouldn't happen with strict whitelist
    return {
      url,
      displayText: 'Link',
      platform: 'unknown'
    };
  } catch {
    return {
      url: link,
      displayText: 'Link',
      platform: 'unknown'
    };
  }
}

export function parseStoredLink(storedLink: string): { url: string; display: string } {
  try {
    const parsed = JSON.parse(storedLink);
    return {
      url: parsed.url || storedLink,
      display: parsed.display || storedLink
    };
  } catch {
    // Handle old format or plain strings
    return {
      url: storedLink.startsWith('http') ? storedLink : `https://${storedLink}`,
      display: storedLink
    };
  }
}