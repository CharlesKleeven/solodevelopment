import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { themeAPI } from '../services/api';
import './themeVoting.css';

interface Theme {
    id: string;
    name: string;
    score: number;
    userVote?: -1 | 0 | 1;
}

interface ThemeVotingProps {
    jamId: string;
    votingDeadline?: Date;
    isVotingOpen: boolean;
}

const ThemeVoting: React.FC<ThemeVotingProps> = ({ jamId, votingDeadline, isVotingOpen }) => {
    const { user } = useAuth();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [votedCount, setVotedCount] = useState(0);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch themes
    useEffect(() => {
        fetchThemes();
    }, [jamId, user]);

    const fetchThemes = async () => {
        try {
            const response = await themeAPI.getThemes(jamId);
            if (response.data && response.data.themes) {
                setThemes(response.data.themes);
                
                // Count voted themes
                const voted = response.data.themes.filter((t: Theme) => t.userVote !== 0).length;
                setVotedCount(voted);
            } else {
                // Ensure themes is empty array if no themes returned
                setThemes([]);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching themes:', error);
            }
            setThemes([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Handle vote
    const handleVote = useCallback(async (themeId: string, vote: -1 | 0 | 1) => {
        if (!user || !isVotingOpen) return;

        // Get current vote for this theme
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;
        
        const currentVote = theme.userVote !== undefined ? theme.userVote : 0;
        
        // If clicking the same vote, set to neutral
        const nextVote = currentVote === vote ? 0 : vote;

        // Optimistic update
        setThemes(prev => prev.map(theme => {
            if (theme.id === themeId) {
                const scoreDiff = nextVote - (theme.userVote !== undefined ? theme.userVote : 0);
                return {
                    ...theme,
                    userVote: nextVote,
                    score: theme.score + scoreDiff
                };
            }
            return theme;
        }));

        // Update voted count
        setVotedCount(prev => {
            if (currentVote === 0 && nextVote !== 0) return prev + 1;
            if (currentVote !== 0 && nextVote === 0) return prev - 1;
            return prev;
        });

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounced save
        setSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await themeAPI.voteOnTheme(themeId, nextVote);
                
                if (response.data) {
                    setLastSaved(new Date());
                }
            } catch (error: any) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Vote failed:', error.response || error);
                }
                // Revert on error
                fetchThemes(); // Refresh to get correct state
            } finally {
                setSaving(false);
            }
        }, 500); // 500ms debounce
    }, [user, isVotingOpen, jamId, themes]);


    // Calculate time left
    const getTimeLeft = () => {
        if (!votingDeadline) return null;
        
        const now = new Date();
        const diff = votingDeadline.getTime() - now.getTime();
        
        if (diff <= 0) return 'voting closed';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `closes in ${days}d ${hours}h`;
        return `closes in ${hours}h`;
    };

    if (loading) {
        return null; // Don't show loading state, just return null
    }

    // Don't render anything if there are no themes
    if (!themes || !Array.isArray(themes) || themes.length === 0) {
        return null;
    }
    
    // Also check if there are any valid themes to display
    const validThemes = themes.filter(theme => theme && theme.id && theme.name);
    if (validThemes.length === 0) {
        return null;
    }

    if (!user) {
        return (
            <section className="theme-voting-section">
                <div className="container">
                    <div className="theme-voting">
                        <div className="voting-header">
                            <h3>// theme voting</h3>
                        </div>
                        <div className="verify-prompt">
                            <span className="verify-icon">[!]</span>
                            <span>sign in to participate in theme voting</span>
                            <a href="/login" className="verify-link">→ sign in</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Check if user is verified
    if (!user.emailVerified) {
        return (
            <section className="theme-voting-section">
                <div className="container">
                    <div className="theme-voting">
                        <div className="voting-header">
                            <h3>// theme voting</h3>
                        </div>
                        <div className="verify-prompt">
                            <span className="verify-icon">[!]</span>
                            <span>verify your email to participate in theme voting</span>
                            <a href="/verify-email" className="verify-link">→ verify email</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="theme-voting-section">
            <div className="container">
                <div className="theme-voting">
            <div className="voting-header">
                <h3>// theme voting</h3>
                {votingDeadline && (
                    <span className="voting-deadline">{getTimeLeft()}</span>
                )}
            </div>

            {!isVotingOpen && (
                <div className="voting-closed">
                    voting has ended for this jam
                </div>
            )}

            <div className="themes-list">
                {validThemes.map((theme, index) => (
                    <div 
                        key={theme.id} 
                        className={`theme-row ${theme.userVote ? `voted-${theme.userVote === 1 ? 'up' : 'down'}` : ''}`}
                        data-theme-id={theme.id}
                    >
                        <div className="vote-buttons">
                            <button 
                                className={`vote-btn vote-up ${theme.userVote === 1 ? 'active' : ''}`}
                                onClick={() => handleVote(theme.id, 1)}
                                disabled={!isVotingOpen}
                                aria-label={`Upvote ${theme.name}`}
                                title="Upvote"
                            >
                                +
                            </button>
                            <button 
                                className={`vote-btn vote-neutral ${theme.userVote === 0 ? 'active' : ''}`}
                                onClick={() => handleVote(theme.id, 0)}
                                disabled={!isVotingOpen}
                                aria-label={`Neutral vote for ${theme.name}`}
                                title="Neutral"
                            >
                                ○
                            </button>
                            <button 
                                className={`vote-btn vote-down ${theme.userVote === -1 ? 'active' : ''}`}
                                onClick={() => handleVote(theme.id, -1)}
                                disabled={!isVotingOpen}
                                aria-label={`Downvote ${theme.name}`}
                                title="Downvote"
                            >
                                −
                            </button>
                        </div>
                        <span className="theme-name">{theme.name}</span>
                    </div>
                ))}
            </div>

            <div className="voting-stats">
                {saving && <span className="save-indicator">• saving...</span>}
                {!saving && lastSaved && <span className="save-indicator">✓ saved</span>}
            </div>

            {isVotingOpen && (
                <div className="voting-help">
                    <span>upvote themes you like • downvote to push them down • help shape what the community wants</span>
                </div>
            )}
                </div>
            </div>
        </section>
    );
};

export default ThemeVoting;