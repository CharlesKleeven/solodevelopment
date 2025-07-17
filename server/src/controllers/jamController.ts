// Backend: jamController.ts - Simplified version that only scrapes participant count
import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { currentJam } from '../config/currentJam';

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
let cachedParticipants: number | null = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (shorter cache for live updates)

export const getCurrentJam = async (_req: Request, res: Response) => {
    const now = Date.now();

    // Get fresh participant count (cached for 5 minutes)
    let participants = cachedParticipants;
    
    if (!cachedParticipants || (now - lastFetch) > CACHE_DURATION) {
        try {
            console.log('Fetching participant count from itch.io...');
            
            const response = await axios.get(currentJam.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SoloDev-Bot/1.0)'
                },
                timeout: 8000
            });

            const $ = cheerio.load(response.data as string);

            // Simple participant count extraction
            participants = 0;
            
            // Look for the specific pattern: <div class="stat_value">70</div><div class="stat_label">Joined</div>
            const statElements = $('.stat_value');
            console.log(`Found ${statElements.length} stat_value elements`);
            
            statElements.each((_, el) => {
                const nextElement = $(el).next();
                const value = $(el).text().trim();
                const label = nextElement.text().trim().toLowerCase();
                
                console.log(`Stat: ${value} - Label: ${label}`);
                
                if (label.includes('joined')) {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                        participants = num;
                        console.log(`✅ Found participant count: ${participants}`);
                        return false; // Break out of each loop
                    }
                }
            });

            // Cache the result
            cachedParticipants = participants;
            lastFetch = now;
            
            console.log(`✅ Scraped participant count: ${participants}`);
            
        } catch (error) {
            console.error('❌ Failed to scrape participant count:', error);
            // Use cached value or fallback
            participants = cachedParticipants || 0;
        }
    }

    // Calculate dynamic values from config
    const currentTime = new Date();
    const startDate = new Date(currentJam.startDate);
    const endDate = new Date(currentJam.endDate);
    
    const timeLeft = calculateTimeLeft(currentTime, startDate, endDate);
    const autoStatus = getJamStatus(currentTime, startDate, endDate);
    
    // Use manual status from config, or auto-calculate if needed
    const status = currentJam.status === 'upcoming' || currentJam.status === 'active' || currentJam.status === 'ended' 
        ? currentJam.status 
        : autoStatus;

    const jamData: JamData = {
        title: currentJam.title,
        theme: currentJam.theme,
        description: currentJam.description,
        url: currentJam.url,
        startDate: currentJam.startDate,
        endDate: currentJam.endDate,
        participants: participants || 0,
        submissions: 0, // Could scrape this too if needed
        timeLeft,
        status
    };

    console.log('📊 Serving jam data:', { 
        title: jamData.title, 
        participants: jamData.participants, 
        status: jamData.status,
        timeLeft: jamData.timeLeft
    });

    res.json(jamData);
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