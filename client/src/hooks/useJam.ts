// hooks/useJam.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

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

export const useJam = () => {
    const [jamData, setJamData] = useState<JamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJamData = async () => {
            try {
                const response = await axios.get('/api/jam/current');
                setJamData(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch jam data:', err);
                setError('Failed to load jam data');

                // Fallback data - matches current jam config
                setJamData({
                    title: "Summer Jam",
                    theme: "TBD",
                    description: "3-day jam with theme to be announced",
                    url: "https://itch.io/jam/solodevelopment-summer-jam",
                    startDate: "2025-08-08T19:00:00.000Z",
                    endDate: "2025-08-11T19:00:00.000Z",
                    participants: 0,
                    submissions: 0,
                    timeLeft: "Check itch.io",
                    status: 'upcoming'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchJamData();

        // Refresh every 10 minutes (backend caches for 5 minutes)
        const interval = setInterval(fetchJamData, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { jamData, loading, error };
};