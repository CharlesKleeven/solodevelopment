import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userSearchAPI } from '../services/api';
import { parseStoredLink, getLinkInfo } from '../utils/linkUtils';
import './user-profile.css';

interface UserStats {
    user: {
        username: string;
        displayName: string;
        bio: string;
        joinedAt: string;
        isPrivate?: boolean;
        links?: string[];
    };
    stats: {
        gameCount: number;
        totalViews: number;
    };
    recentGames: Array<{
        title: string;
        slug: string;
        thumbnailUrl?: string;
        createdAt: string;
        views: number;
        description?: string;
        tags?: string[];
        playUrl?: string;
    }>;
}

const UserProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTags, setExpandedTags] = useState<Set<number>>(new Set());

    const toggleTags = (gameIndex: number) => {
        const newExpanded = new Set(expandedTags);
        if (newExpanded.has(gameIndex)) {
            newExpanded.delete(gameIndex);
        } else {
            newExpanded.add(gameIndex);
        }
        setExpandedTags(newExpanded);
    };

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!username) return;
            
            try {
                setLoading(true);
                const response = await userSearchAPI.getUserStats(username);
                setUserStats(response);
            } catch (error: any) {
                console.error('Failed to load user profile:', error);
                if (error.response?.status === 404) {
                    setError('User not found');
                } else {
                    setError('Failed to load user profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, [username]);

    if (loading) {
        return (
            <div className="user-profile-page">
                <div className="container">
                    <div className="loading-state">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error || !userStats) {
        return (
            <div className="user-profile-page">
                <div className="container">
                    <div className="error-state">
                        <h1>{error || 'Profile not found'}</h1>
                        <p>This user profile could not be loaded.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { user, recentGames } = userStats;

    // Format join date
    const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="user-profile-page">
            <div className="profile-container">
                <div className="profile-hero">
                    <h1 className="profile-name">{user.displayName}</h1>
                    <p className="profile-username">@{username}</p>
                    
                    {user.bio && (
                        <p className="profile-bio">{user.bio}</p>
                    )}
                    
                    {user.links && user.links.length > 0 && (
                        <div className="profile-links">
                            {user.links.map((link: string, index: number) => {
                                const parsedLink = parseStoredLink(link);
                                const linkInfo = getLinkInfo(parsedLink.display);
                                
                                return (
                                    <a 
                                        key={index}
                                        href={linkInfo.url}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="profile-link"
                                        title={linkInfo.platform}
                                    >
                                        {linkInfo.displayText}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                {user.isPrivate ? (
                    <div className="private-profile">
                        <div className="private-notice">
                            <h3>This profile is private</h3>
                            <p>This user has chosen to keep their profile private.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {recentGames.length > 0 && (
                            <div className="portfolio-grid">
                                    {recentGames.map((game, index) => (
                                        <div key={index} className="portfolio-item">
                                            <div className="portfolio-thumbnail">
                                                {game.thumbnailUrl ? (
                                                    <img src={game.thumbnailUrl} alt={game.title} />
                                                ) : (
                                                    <div className="portfolio-placeholder">No Image</div>
                                                )}
                                            </div>
                                            <div className="portfolio-info">
                                                <h4 className="portfolio-title">{game.title}</h4>
                                                {game.description && (
                                                    <p className="portfolio-description">{game.description}</p>
                                                )}
                                                {game.tags && game.tags.length > 0 && (
                                                    <div className="portfolio-tags">
                                                        {(expandedTags.has(index) ? game.tags : game.tags.slice(0, 3)).map((tag: string, tagIndex: number) => (
                                                            <span key={tagIndex} className="portfolio-tag">{tag}</span>
                                                        ))}
                                                        {game.tags.length > 3 && (
                                                            <button 
                                                                className="portfolio-tag-more" 
                                                                onClick={() => toggleTags(index)}
                                                                type="button"
                                                            >
                                                                {expandedTags.has(index) 
                                                                    ? 'Show less' 
                                                                    : `+${game.tags.length - 3} more`
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="portfolio-actions">
                                                    {game.playUrl ? (
                                                        <a 
                                                            href={game.playUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer nofollow" 
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Play Game
                                                        </a>
                                                    ) : (
                                                        <span className="btn-placeholder">No link available</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default UserProfile;