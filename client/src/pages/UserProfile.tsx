import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { userSearchAPI, gameAPI } from '../services/api';
import { parseStoredLink, getLinkInfo } from '../utils/linkUtils';
import { useAuth } from '../context/AuthContext';
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
    const { user: currentUser } = useAuth();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [allGames, setAllGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedTags, setExpandedTags] = useState<Set<number>>(new Set());
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
    const [allDescriptionsExpanded, setAllDescriptionsExpanded] = useState(true);
    const [showAllGames, setShowAllGames] = useState(false);
    const [reportingGame, setReportingGame] = useState<string | null>(null);
    const [gamesPagination, setGamesPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    const toggleTags = (gameIndex: number) => {
        const newExpanded = new Set(expandedTags);
        if (newExpanded.has(gameIndex)) {
            newExpanded.delete(gameIndex);
        } else {
            newExpanded.add(gameIndex);
        }
        setExpandedTags(newExpanded);
    };

    const toggleDescription = (gameIndex: number) => {
        if (allDescriptionsExpanded) {
            // If all are expanded, collapse all and keep this one collapsed
            setAllDescriptionsExpanded(false);
            setExpandedDescriptions(new Set());
        } else {
            // Toggle individual description
            const newExpanded = new Set(expandedDescriptions);
            if (newExpanded.has(gameIndex)) {
                newExpanded.delete(gameIndex);
            } else {
                newExpanded.add(gameIndex);
            }
            setExpandedDescriptions(newExpanded);
        }
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

    const loadAllGames = async (page: number) => {
        if (!username) return;
        
        try {
            setGamesLoading(true);
            const response = await gameAPI.getUserGames(username, page, 12);
            
            if (page === 1) {
                setAllGames(response.games);
            } else {
                setAllGames(prev => [...prev, ...response.games]);
            }
            
            setGamesPagination({
                page: response.pagination.page,
                limit: response.pagination.limit,
                total: response.pagination.total,
                pages: response.pagination.pages
            });
        } catch (error: any) {
            console.error('Failed to load games:', error);
        } finally {
            setGamesLoading(false);
        }
    };

    useEffect(() => {
        if (showAllGames && username) {
            loadAllGames(1);
        }
    }, [showAllGames, username]);

    const handleReportGame = async (gameId: string) => {
        if (!currentUser) {
            alert('Please log in to report content');
            return;
        }
        
        if (!gameId) {
            console.error('No game ID provided for reporting');
            return;
        }
        
        try {
            setReportingGame(gameId);
            await gameAPI.reportGame(gameId);
            alert('Thank you for your report. We will review this content.');
        } catch (error: any) {
            console.error('Failed to report game:', error);
            alert(error.response?.data?.error || 'Failed to report game');
        } finally {
            setReportingGame(null);
        }
    };

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

    const { user, recentGames, stats } = userStats;

    // Game card component
    const GameCard: React.FC<{ game: any; index: number }> = ({ game, index }) => {
        return (
        <div className="portfolio-item">
            <div className="portfolio-thumbnail">
                {game.thumbnailUrl ? (
                    <img src={game.thumbnailUrl} alt={game.title} />
                ) : (
                    <div className="portfolio-placeholder">No Image</div>
                )}
            </div>
            <div className="portfolio-info">
                <h4 className="portfolio-title">
                    {game.title}
                    {game.isAdult && <span className="adult-badge"> 18+</span>}
                </h4>
                {game.description && (
                    <div className="portfolio-description-wrapper">
                        <p className={`portfolio-description ${allDescriptionsExpanded || expandedDescriptions.has(index) ? 'expanded' : ''}`}>
                            {game.description}
                        </p>
                        {game.description.length > 150 && (
                            <button 
                                className="description-toggle"
                                onClick={() => toggleDescription(index)}
                                type="button"
                            >
                                {allDescriptionsExpanded || expandedDescriptions.has(index) ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
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
                {currentUser && currentUser.username !== username && (
                    <button
                        className="report-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleReportGame(game._id || game.slug);
                        }}
                        disabled={reportingGame === (game._id || game.slug)}
                        title="Report inappropriate content"
                        aria-label="Report game"
                        type="button"
                    >
                        <span className="flag-icon">⚑</span>
                    </button>
                )}
            </div>
        </div>
        );
    };

    return (
        <div className="user-profile-page">
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="description" content={`View ${user.displayName}'s profile and games on SoloDevelopment`} />
            </Helmet>
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
                        {/* Games Section */}
                        {!showAllGames && recentGames.length > 0 && (
                            <>
                                <div className="portfolio-section-header">
                                    <h3>Recent Games</h3>
                                    {stats.gameCount > 3 && (
                                        <button 
                                            className="view-all-button"
                                            onClick={() => setShowAllGames(true)}
                                        >
                                            View All Games ({stats.gameCount})
                                        </button>
                                    )}
                                </div>
                                <div className="portfolio-grid">
                                    {recentGames.map((game, index) => (
                                        <GameCard key={game.slug || index} game={game} index={index} />
                                    ))}
                                </div>
                            </>
                        )}

                        {showAllGames && (
                            <>
                                <div className="portfolio-section-header">
                                    <h3>All Games ({stats.gameCount})</h3>
                                    <button 
                                        className="view-all-button"
                                        onClick={() => setShowAllGames(false)}
                                    >
                                        Show Recent Only
                                    </button>
                                </div>
                                {gamesLoading && allGames.length === 0 ? (
                                    <div className="loading-state">Loading games...</div>
                                ) : (
                                    <>
                                        <div className="portfolio-grid">
                                            {allGames.map((game, index) => (
                                                <GameCard key={game.slug || index} game={game} index={index} />
                                            ))}
                                        </div>
                                        
                                        {/* Load More */}
                                        {gamesPagination.page < gamesPagination.pages && (
                                            <div className="load-more-container">
                                                <button 
                                                    onClick={() => loadAllGames(gamesPagination.page + 1)}
                                                    disabled={gamesLoading}
                                                    className="btn btn-secondary load-more-button"
                                                >
                                                    {gamesLoading ? 'Loading...' : 'Load More Games'}
                                                </button>
                                                <p className="pagination-info">
                                                    Showing {allGames.length} of {gamesPagination.total} games
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {/* No games message */}
                        {!showAllGames && recentGames.length === 0 && (
                            <div className="empty-state">
                                <p>No games published yet.</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default UserProfile;