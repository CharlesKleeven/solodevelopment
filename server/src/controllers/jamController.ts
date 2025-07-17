// Backend: jamController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface JamData {
    title: string;
    theme: string;
    description: string;
    url: string;
    startDate: string;
    endDate: string;
    participants: number;
    submissions: number;
    timeLeft: string;
    status: 'active' | 'ended' | 'upcoming';
}

// Cache to avoid hammering itch.io
let cachedData: JamData | null = null;
let lastFetch = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getCurrentJam = async (req: Request, res: Response) => {
    const now = Date.now(); // Use Date.now() instead of new Date()

    // Return cached data if it's fresh
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
        return res.json(cachedData);
    }

    try {
        // Scrape itch.io for current participant count
        const response = await axios.get('https://itch.io/jam/solodevelopment-summer-jam', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SoloDev-Bot/1.0)'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data as string);

        // Extract jam title, theme, dates, and counts
        let title = "Summer Jam";
        let theme = "TBD"; // Force TBD for now since scraping isn't finding it
        let startDate = new Date('2025-08-08T19:00:00Z'); // Default fallback
        let endDate = new Date('2025-08-11T19:00:00Z');
        let participants = 0;
        let submissions = 0;

        // Try to get the jam title - look for more specific selectors
        const titleSelectors = [
            '.jam_title_header h1',
            '.jam_header h1',
            '.game_title h1',
            'h1:contains("Jam")',
            'h1'
        ];

        for (const selector of titleSelectors) {
            const titleEl = $(selector).first();
            if (titleEl.length && titleEl.text().trim() && !titleEl.text().includes('itch.io')) {
                const titleText = titleEl.text().trim();
                if (titleText.length > 3) { // Avoid short/empty titles
                    title = titleText;
                    break;
                }
            }
        }

        // Get page text for parsing
        const pageText = $('body').text();

        // Keep theme as TBD for Summer Jam - comment out theme scraping for now
        /*
        // Try to get the theme - look for more patterns
        const themePatterns = [
          /theme[:\s]+(is\s+)?["""]([^"""]+)["""]/i,
          /theme[:\s]+(is\s+)?([^.\n!?]+)/i,
          /the\s+theme\s+is[:\s]+["""]?([^""".\n!?]+)["""?]?/i
        ];
        
        for (const pattern of themePatterns) {
          const themeMatch = pageText.match(pattern);
          if (themeMatch && themeMatch[2] && themeMatch[2].trim() !== 'Under Pressure') {
            theme = themeMatch[2].trim();
            break;
          }
        }
    
        // Look for "TBD" or "To be determined" etc.
        if (pageText.includes('TBD') || pageText.includes('to be determined') || 
            pageText.includes('will be announced') || pageText.includes('coming soon')) {
          theme = "TBD";
        }
        */

        // Alternative theme selectors
        const themeSelectors = [
            '.jam_theme .theme_text',
            '.theme_announcement',
            '.jam_theme_info .theme',
            '.theme'
        ];

        for (const selector of themeSelectors) {
            const themeEl = $(selector).first();
            if (themeEl.length && themeEl.text().trim()) {
                theme = themeEl.text().trim();
                break;
            }
        }

        // Extract start and end times
        // Look for patterns like "Start Time: August 8, 2025, 3:00 PM EDT"
        const startTimeMatch = pageText.match(/start\s+time[:\s]*([^(\n]*?)(?:\(|$)/i);
        if (startTimeMatch && startTimeMatch[1]) {
            try {
                const parsedStart = new Date(startTimeMatch[1].trim());
                if (!isNaN(parsedStart.getTime())) {
                    startDate = parsedStart;
                }
            } catch (e) {
                console.log('Failed to parse start date:', startTimeMatch[1]);
            }
        }

        const endTimeMatch = pageText.match(/end\s+time[:\s]*([^(\n]*?)(?:\(|$)/i);
        if (endTimeMatch && endTimeMatch[1]) {
            try {
                const parsedEnd = new Date(endTimeMatch[1].trim());
                if (!isNaN(parsedEnd.getTime())) {
                    endDate = parsedEnd;
                }
            } catch (e) {
                console.log('Failed to parse end date:', endTimeMatch[1]);
            }
        }

        // Also look for more structured date patterns
        const datePatterns = [
            /(\w+\s+\d+,\s+\d+,\s+\d+:\d+\s+\w+\s+\w+)/g, // "August 8, 2025, 3:00 PM EDT"
            /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/g, // "2025-08-08 15:00"
        ];

        for (const pattern of datePatterns) {
            const matches = pageText.match(pattern);
            if (matches && matches.length >= 2) {
                try {
                    const start = new Date(matches[0]);
                    const end = new Date(matches[1]);
                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        startDate = start;
                        endDate = end;
                        break;
                    }
                } catch (e) {
                    // Continue to next pattern
                }
            }
        }

        // Extract participant count using the correct itch.io selectors
        const participantSelectors = [
            '.stats_container .stat_box .stat_value', // The exact selector from your HTML
            '.stat_value',
            '.stats .stat_value'
        ];

        for (const selector of participantSelectors) {
            const statElements = $(selector);
            statElements.each((i, el) => {
                const nextElement = $(el).next();
                if (nextElement.hasClass('stat_label') &&
                    nextElement.text().toLowerCase().includes('joined')) {
                    const num = parseInt($(el).text().trim());
                    if (!isNaN(num)) {
                        participants = num;
                        return false; // Break out of each loop
                    }
                }
            });
            if (participants > 0) break;
        }

        // Fallback patterns if selectors don't work
        if (participants === 0) {
            const participantPatterns = [
                /(\d+)\s+(people\s+)?joined/i,
                /(\d+)\s+participants?/i,
                /joined.*?(\d+)/i
            ];

            for (const pattern of participantPatterns) {
                const match = pageText.match(pattern);
                if (match && match[1]) {
                    participants = parseInt(match[1]);
                    break;
                }
            }
        }

        // Extract submissions count
        const submissionMatch = pageText.match(/(\d+)\s+(entries|submissions|games?)/i);
        if (submissionMatch) {
            submissions = parseInt(submissionMatch[1]);
        }

        // Calculate time left and status based on extracted dates
        const currentTime = new Date(); // Use a different variable name for Date object
        const timeLeft = calculateTimeLeft(currentTime, startDate, endDate);
        const status = getJamStatus(currentTime, startDate, endDate);

        cachedData = {
            title,
            theme,
            description: theme === "TBD" ? `3-day jam with theme to be announced` : `3-day jam exploring the theme "${theme}"`,
            url: "https://itch.io/jam/solodevelopment-summer-jam",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            participants,
            submissions,
            timeLeft,
            status
        };

        lastFetch = now;
        res.json(cachedData);

    } catch (error) {
        console.error('Failed to fetch jam data:', error);

        // Fallback to cached data or defaults
        const fallbackData: JamData = cachedData || {
            title: "Summer Jam",
            theme: "TBD",
            description: "3-day jam with theme to be announced",
            url: "https://itch.io/jam/solodevelopment-summer-jam",
            startDate: new Date('2025-08-08T19:00:00Z').toISOString(),
            endDate: new Date('2025-08-11T19:00:00Z').toISOString(),
            participants: 94, // Last known count
            submissions: 0,
            timeLeft: "Check itch.io",
            status: 'upcoming'
        };

        res.json(fallbackData);
    }
};

function calculateTimeLeft(now: Date, startDate: Date, endDate: Date): string {
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // If jam hasn't started yet
    if (nowTime < startTime) {
        const diff = startTime - nowTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `Starts in ${days} day${days === 1 ? '' : 's'}`;
        if (hours > 0) return `Starts in ${hours} hour${hours === 1 ? '' : 's'}`;
        return "Starting soon";
    }

    // If jam is active
    if (nowTime >= startTime && nowTime <= endTime) {
        const diff = endTime - nowTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;
        if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} left`;
        return "Less than 1 hour left";
    }

    // Jam has ended
    return "Jam ended";
}

function getJamStatus(now: Date, startDate: Date, endDate: Date): 'upcoming' | 'active' | 'ended' {
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if (nowTime < startTime) return 'upcoming';
    if (nowTime >= startTime && nowTime <= endTime) return 'active';
    return 'ended';
}