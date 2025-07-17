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

export const getCurrentJam = async (_req: Request, res: Response) => {
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
        // August 8, 2025, 3:00 PM EDT = 19:00 UTC (confirmed from itch.io)
        // August 11, 2025, 3:00 PM EDT = 19:00 UTC
        let startDate = new Date('2025-08-08T19:00:00.000Z'); // Correct UTC time
        let endDate = new Date('2025-08-11T19:00:00.000Z'); // Correct UTC time
        
        console.log('Setting correct default dates:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
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

        // Extract start and end times with better patterns
        // Look for patterns like "Start Time: August 8, 2025, 3:00 PM EDT"
        const startTimeMatch = pageText.match(/start\s+time[:\s]*([^(\n]*?)(?:\(|$)/i);
        if (startTimeMatch && startTimeMatch[1]) {
            try {
                let dateStr = startTimeMatch[1].trim();
                console.log('Original start date string:', dateStr);
                
                // Convert EDT to explicit timezone
                if (dateStr.includes('EDT')) {
                    dateStr = dateStr.replace('EDT', '-04:00');
                } else if (dateStr.includes('EST')) {
                    dateStr = dateStr.replace('EST', '-05:00');
                }
                
                console.log('Modified start date string:', dateStr);
                
                const parsedStart = new Date(dateStr);
                if (!isNaN(parsedStart.getTime())) {
                    startDate = parsedStart;
                    console.log('Parsed start date:', startDate.toISOString());
                } else {
                    console.log('Failed to parse modified date string');
                }
            } catch (e) {
                console.log('Failed to parse start date:', startTimeMatch[1], e);
            }
        } else {
            console.log('No start time match found in page text');
        }

        const endTimeMatch = pageText.match(/end\s+time[:\s]*([^(\n]*?)(?:\(|$)/i);
        if (endTimeMatch && endTimeMatch[1]) {
            try {
                let dateStr = endTimeMatch[1].trim();
                console.log('Original end date string:', dateStr);
                
                // Convert EDT to explicit timezone
                if (dateStr.includes('EDT')) {
                    dateStr = dateStr.replace('EDT', '-04:00');
                } else if (dateStr.includes('EST')) {
                    dateStr = dateStr.replace('EST', '-05:00');
                }
                
                console.log('Modified end date string:', dateStr);
                
                const parsedEnd = new Date(dateStr);
                if (!isNaN(parsedEnd.getTime())) {
                    endDate = parsedEnd;
                    console.log('Parsed end date:', endDate.toISOString());
                } else {
                    console.log('Failed to parse modified end date string');
                }
            } catch (e) {
                console.log('Failed to parse end date:', endTimeMatch[1], e);
            }
        } else {
            console.log('No end time match found in page text');
        }

        // Also look for more structured date patterns
        const datePatterns = [
            /(\w+\s+\d+,\s+\d+,\s+\d+:\d+\s+\w+\s+\w+)/g, // "August 8, 2025, 3:00 PM EDT"
            /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/g, // "2025-08-08 15:00"
        ];

        for (const pattern of datePatterns) {
            const matches = pageText.match(pattern);
            if (matches && matches.length >= 2) {
                console.log('Found date pattern matches:', matches);
                try {
                    const start = new Date(matches[0]);
                    const end = new Date(matches[1]);
                    console.log('Parsed dates from pattern:', { start: start.toISOString(), end: end.toISOString() });
                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        startDate = start;
                        endDate = end;
                        console.log('Updated startDate and endDate from pattern');
                        break;
                    }
                } catch (e) {
                    console.log('Failed to parse dates from pattern:', e);
                    // Continue to next pattern
                }
            }
        }
        
        // FORCE CORRECT DATES - Override any parsing issues
        startDate = new Date('2025-08-08T19:00:00.000Z');
        endDate = new Date('2025-08-11T19:00:00.000Z');
        
        console.log('FORCED correct dates:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        // Extract participant count using multiple strategies
        const participantSelectors = [
            '.stats_container .stat_box .stat_value', // The exact selector from your HTML
            '.stat_value',
            '.stats .stat_value',
            '.jam_stats .stat_value',
            '.stats_wrap .stat_value'
        ];

        for (const selector of participantSelectors) {
            const statElements = $(selector);
            statElements.each((_, el) => {
                const parentElement = $(el).parent();
                const nextElement = $(el).next();
                const siblingText = parentElement.text().toLowerCase();
                
                // Check if this stat is about participants/joined
                if ((nextElement.hasClass('stat_label') &&
                     nextElement.text().toLowerCase().includes('joined')) ||
                    siblingText.includes('joined') ||
                    siblingText.includes('participants')) {
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

        // Extract submissions count with more patterns
        const submissionSelectors = [
            '.stats_container .stat_box .stat_value', // Check for submissions in stats
            '.stat_value'
        ];

        for (const selector of submissionSelectors) {
            const statElements = $(selector);
            statElements.each((_, el) => {
                const parentElement = $(el).parent();
                const nextElement = $(el).next();
                const siblingText = parentElement.text().toLowerCase();
                
                // Check if this stat is about submissions/entries
                if ((nextElement.hasClass('stat_label') &&
                     (nextElement.text().toLowerCase().includes('entries') ||
                      nextElement.text().toLowerCase().includes('submissions'))) ||
                    siblingText.includes('entries') ||
                    siblingText.includes('submissions')) {
                    const num = parseInt($(el).text().trim());
                    if (!isNaN(num)) {
                        submissions = num;
                        return false; // Break out of each loop
                    }
                }
            });
            if (submissions > 0) break;
        }

        // Fallback patterns for submissions
        if (submissions === 0) {
            const submissionPatterns = [
                /(\d+)\s+(entries|submissions|games?)/i,
                /(\d+)\s+submitted/i
            ];
            
            for (const pattern of submissionPatterns) {
                const submissionMatch = pageText.match(pattern);
                if (submissionMatch) {
                    submissions = parseInt(submissionMatch[1]);
                    break;
                }
            }
        }

        // Calculate time left and status based on extracted dates
        const currentTime = new Date(); // Use a different variable name for Date object
        const timeLeft = calculateTimeLeft(currentTime, startDate, endDate);
        const status = getJamStatus(currentTime, startDate, endDate);
        
        console.log('Scraping results:', {
            participants,
            submissions,
            status,
            timeLeft,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

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
        
        console.log('Final cached data:', cachedData);

        lastFetch = now;
        res.json(cachedData);

    } catch (error) {
        console.error('Failed to fetch jam data:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');

        // Fallback to cached data or defaults
        const fallbackData: JamData = cachedData || {
            title: "Summer Jam",
            theme: "TBD",
            description: "3-day jam with theme to be announced",
            url: "https://itch.io/jam/solodevelopment-summer-jam",
            startDate: new Date('2025-08-08T19:00:00.000Z').toISOString(), // 3:00 PM EDT
            endDate: new Date('2025-08-11T19:00:00.000Z').toISOString(), // 3:00 PM EDT
            participants: 69, // Last known count from recent scrape
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