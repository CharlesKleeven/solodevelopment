import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './streams.css';

interface Stream {
    channel: string;
    title: string;
    isLive?: boolean;
    viewerCount?: number;
    gameName?: string;
}

const Streams: React.FC = () => {
    const { user } = useAuth();
    const [activeStream, setActiveStream] = useState<string>('');
    const [customChannel, setCustomChannel] = useState<string>('');
    const [featuredStreams, setFeaturedStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [liveStatus, setLiveStatus] = useState<{[key: string]: any}>({});

    // Submit stream state
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submitChannel, setSubmitChannel] = useState('');
    const [submitTitle, setSubmitTitle] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
        // Poll for live status every 2 minutes
        const interval = setInterval(fetchLiveStatus, 2 * 60 * 1000);
        return () => clearInterval(interval);
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

            // Fetch live status after getting streamers
            fetchLiveStatus();
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

    const fetchLiveStatus = async () => {
        try {
            const response = await api.get('/api/streamers/live-status');
            setLiveStatus(response.data.liveStatus || {});
        } catch (error) {
            console.error('Error fetching live status:', error);
            // Silently fail - not critical
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
            <Helmet>
                <title>Streams — Solo Development</title>
                <meta name="description" content="Watch solo game developers stream their work live." />
                <link rel="canonical" href="https://solodevelopment.org/streams" />
                <meta property="og:title" content="Streams — Solo Development" />
                <meta property="og:description" content="Watch solo game developers stream their work live." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://solodevelopment.org/streams" />
                <meta property="og:site_name" content="Solo Development" />
            </Helmet>
            <div className="page-container">
                <h1 className="page-title">Community Streams</h1>
                <p className="page-subtitle">Watch game development live from our community</p>

                <div className="streams-layout">
                    {/* Stream List Sidebar */}
                    <div className="stream-sidebar">
                        <h3>Featured Streamers</h3>
                        {!showSubmitForm ? (
                            <p className="sidebar-note">
                                {!user ? (
                                    <>Want to be featured? <a href="/login">Log in</a> to submit your stream</>
                                ) : (
                                    <button className="submit-stream-toggle" onClick={() => setShowSubmitForm(true)}>Want to be featured? Submit your stream</button>
                                )}
                            </p>
                        ) : (
                            <div className="submit-stream-form">
                                {submitMessage && <p className={`submit-message ${submitMessage.startsWith('Error') ? 'error' : 'success'}`}>{submitMessage}</p>}
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!submitChannel.trim() || !submitTitle.trim()) return;
                                    setSubmitting(true);
                                    setSubmitMessage('');
                                    try {
                                        const response = await api.post('/api/streamers/submit', {
                                            channel: submitChannel.trim(),
                                            title: submitTitle.trim()
                                        });
                                        setSubmitMessage(response.data.message);
                                        setSubmitChannel('');
                                        setSubmitTitle('');
                                        setShowSubmitForm(false);
                                    } catch (err: any) {
                                        setSubmitMessage(`Error: ${err.response?.data?.error || 'Failed to submit'}`);
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}>
                                    <div className="submit-fields">
                                        <label>Twitch channel<input type="text" value={submitChannel} onChange={e => setSubmitChannel(e.target.value)} placeholder="your_twitch_username" required /></label>
                                        <label>Display name<input type="text" value={submitTitle} onChange={e => setSubmitTitle(e.target.value)} placeholder="How you want to be shown" required /></label>
                                    </div>
                                    <div className="submit-actions">
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSubmitForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {loading ? (
                            <div className="loading">Loading streamers...</div>
                        ) : (
                        <div className="stream-list">
                            {featuredStreams
                                .sort((a, b) => {
                                    // Sort live streams to the top
                                    const aLive = liveStatus[a.channel]?.isLive || false;
                                    const bLive = liveStatus[b.channel]?.isLive || false;
                                    if (aLive && !bLive) return -1;
                                    if (!aLive && bLive) return 1;
                                    return 0;
                                })
                                .map((stream) => {
                                    const status = liveStatus[stream.channel];
                                    const isLive = status?.isLive || false;

                                    return (
                                        <button
                                            key={stream.channel}
                                            className={`stream-button ${activeStream === stream.channel ? 'active' : ''} ${isLive ? 'live' : ''}`}
                                            onClick={() => setActiveStream(stream.channel)}
                                            title={isLive ? `${stream.channel} is LIVE with ${status.viewerCount} viewers` : `Watch ${stream.channel} on Twitch`}
                                        >
                                            {isLive && (
                                                <span className="live-badge">LIVE</span>
                                            )}
                                            <span className="channel-info">
                                                <span className="channel-title">{stream.title}</span>
                                                <span className="channel-username">
                                                    @{stream.channel}
                                                    {isLive && status.viewerCount && (
                                                        <span className="viewer-count"> · {status.viewerCount.toLocaleString()} viewers</span>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}

                            {featuredStreams.length === 0 && (
                                <p className="no-streamers">No featured streamers yet</p>
                            )}
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
                    <p>Currently watching: <strong>@{activeStream}</strong></p>
                    <p className="stream-note">
                        If the stream shows as offline, the broadcaster is not currently live. Check back later or try another streamer!
                    </p>
                    <a
                        href={`https://twitch.tv/${activeStream}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="twitch-link"
                    >
                        Open in Twitch →
                    </a>
                </div>
                )}

            </div>
        </div>
    );
};

export default Streams;