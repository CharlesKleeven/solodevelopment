import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './streams.css';

interface Stream {
    channel: string;
    title: string;
}

const Streams: React.FC = () => {
    const [activeStream, setActiveStream] = useState<string>('');
    const [customChannel, setCustomChannel] = useState<string>('');
    const [featuredStreams, setFeaturedStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);

    // Get proper parent domain for Twitch embed
    const getParentDomain = () => {
        const hostname = window.location.hostname;
        // For local development, always use localhost
        if (hostname === 'localhost' || hostname.startsWith('192.168') || hostname === '127.0.0.1') {
            return 'localhost';
        }
        // For production, use the actual domain
        // Remove 'www.' if present as Twitch requires exact domain match
        return hostname.replace('www.', '');
    };

    const parentDomain = getParentDomain();

    useEffect(() => {
        fetchStreamers();
    }, []);

    const fetchStreamers = async () => {
        try {
            const response = await api.get('/api/streamers');
            const streamersData = response.data.streamers.map((s: any) => ({
                channel: s.channel,
                title: s.title
            }));
            setFeaturedStreams(streamersData);

            // Set the first streamer as active if available
            if (streamersData.length > 0 && !activeStream) {
                setActiveStream(streamersData[0].channel);
            }
        } catch (error) {
            console.error('Error fetching streamers:', error);
            // Fallback to default streamers if API fails
            const defaults = [
                { channel: 'jddoesdev', title: 'JD Does Dev' },
                { channel: 'piratesoftware', title: 'Pirate Software' },
                { channel: 'theprimeagen', title: 'ThePrimeagen' },
            ];
            setFeaturedStreams(defaults);
            if (!activeStream) {
                setActiveStream('jddoesdev');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCustomStream = (e: React.FormEvent) => {
        e.preventDefault();
        if (customChannel.trim()) {
            setActiveStream(customChannel.trim());
        }
    };

    return (
        <div className="streams-page">
            <div className="page-container">
                <h1 className="page-title">Community Streams</h1>
                <p className="page-subtitle">Watch game development live from our community</p>

                <div className="streams-layout">
                    {/* Stream List Sidebar */}
                    <div className="stream-sidebar">
                        <h3>Featured Streams</h3>
                        {loading ? (
                            <div className="loading">Loading streamers...</div>
                        ) : (
                        <div className="stream-list">
                            {featuredStreams.map((stream) => (
                                <button
                                    key={stream.channel}
                                    className={`stream-button ${activeStream === stream.channel ? 'active' : ''}`}
                                    onClick={() => setActiveStream(stream.channel)}
                                >
                                    <span className="stream-indicator"></span>
                                    {stream.title}
                                </button>
                            ))}
                        </div>
                        )}

                        <div className="custom-stream-section">
                            <h3>Watch Any Stream</h3>
                            <form onSubmit={handleCustomStream} className="custom-stream-form">
                                <input
                                    type="text"
                                    placeholder="Enter Twitch username"
                                    value={customChannel}
                                    onChange={(e) => setCustomChannel(e.target.value)}
                                    className="custom-stream-input"
                                />
                                <button type="submit" className="watch-button">
                                    Watch
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Twitch Embed */}
                    {activeStream && (
                    <div className="stream-container">
                        <div className="twitch-embed-wrapper">
                            <iframe
                                src={`https://player.twitch.tv/?channel=${activeStream}&parent=${parentDomain}`}
                                height="100%"
                                width="100%"
                                allowFullScreen={true}
                                title={`Twitch stream: ${activeStream}`}
                            />
                        </div>

                        {/* Chat Embed */}
                        <div className="twitch-chat-wrapper">
                            <iframe
                                src={`https://www.twitch.tv/embed/${activeStream}/chat?parent=${parentDomain}&darkpopout`}
                                height="100%"
                                width="100%"
                                title={`Twitch chat: ${activeStream}`}
                            />
                        </div>
                    </div>
                    )}
                </div>

                {activeStream && (
                <div className="stream-info">
                    <p>Currently watching: <strong>{activeStream}</strong></p>
                    <p className="stream-note">
                        Streams are embedded from Twitch. Make sure the streamer is live for the best experience!
                    </p>
                </div>
                )}
            </div>
        </div>
    );
};

export default Streams;