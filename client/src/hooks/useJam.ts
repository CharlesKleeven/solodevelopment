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

                // Fallback data
                setJamData({
                    title: "Summer Jam",
                    theme: "Under Pressure",
                    description: "3-day jam exploring the theme \"Under Pressure\"",
                    url: "https://itch.io/jam/solodevelopment-summer-jam",
                    startDate: new Date('2025-08-08T19:00:00Z').toISOString(),
                    endDate: new Date('2025-08-11T19:00:00Z').toISOString(),
                    participants: 94,
                    submissions: 0,
                    timeLeft: "Check itch.io",
                    status: 'active'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchJamData();

        // Refresh every hour
        const interval = setInterval(fetchJamData, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { jamData, loading, error };
};