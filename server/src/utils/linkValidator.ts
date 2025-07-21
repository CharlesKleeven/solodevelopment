// List of allowed platforms for user links
const ALLOWED_DOMAINS = [
  // Social Media
  'github.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'youtube.com',
  'twitch.tv',
  'instagram.com',
  'facebook.com',
  'reddit.com',
  'tiktok.com',
  'pinterest.com',
  'tumblr.com',
  'threads.net',
  
  // Creative/Portfolio
  'behance.net',
  'dribbble.com',
  'artstation.com',
  'deviantart.com',
  'codepen.io',
  'itch.io',
  
  // Developer/Tech
  'medium.com',
  'dev.to',
  'hashnode.dev',
  'stackoverflow.com',
  'gitlab.com',
  'bitbucket.org',
  
  // Music
  'spotify.com',
  'soundcloud.com',
  'bandcamp.com',
  'music.apple.com',
  
  // Support/Monetization
  'patreon.com',
  'ko-fi.com',
  'buymeacoffee.com',
  'gumroad.com',
  'substack.com',
  
  // Communication
  'discord.gg',
  'discord.com',
  
  // Professional
  'polywork.com',
  'read.cv',
  'bento.me',
  'linktr.ee',
  'linkin.bio',
  'figma.com',
  'notion.so',
  'carrd.co',
  'bio.link',
  'beacons.ai',
];

// Patterns for allowed domains (for subdomains)
const ALLOWED_PATTERNS = [
  /^(.+\.)?steam(community|powered)\.com$/,
  /^(.+\.)?mastodon\.(social|online|world|cloud)$/,
  /^(.+\.)?bsky\.(app|social)$/,
  /^(.+\.)?bluesky\.(app|social)$/,
];

export function isAllowedDomain(url: string): boolean {
  try {
    // Ensure URL has protocol
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    
    const urlObj = new URL(urlToTest);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
    
    // Check exact domain matches
    if (ALLOWED_DOMAINS.includes(hostname)) {
      return true;
    }
    
    // Check pattern matches
    for (const pattern of ALLOWED_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

export function validateLink(link: string): { isValid: boolean; error?: string } {
  if (!link || link.trim() === '') {
    return { isValid: true }; // Empty links are okay
  }
  
  const trimmedLink = link.trim();
  
  // Basic URL validation
  let urlToTest = trimmedLink;
  if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
    urlToTest = 'https://' + urlToTest;
  }
  
  try {
    new URL(urlToTest);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
  
  // Check if domain is allowed
  if (!isAllowedDomain(urlToTest)) {
    return { 
      isValid: false, 
      error: 'This website is not allowed. Only verified social media and portfolio platforms are permitted.' 
    };
  }
  
  return { isValid: true };
}