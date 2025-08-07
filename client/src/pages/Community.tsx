import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import './community.css';

interface CommunityGame {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    tags?: string[];
    engine?: string;
    platforms?: string[];
    playUrl?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        _id: string;
        username: string;
        displayName: string;
    };
}

interface GamesResponse {
    games: CommunityGame[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const ENGINES = [
    { value: '', label: 'All Engines' },
    { value: 'unity', label: 'Unity' },
    { value: 'unreal', label: 'Unreal' },
    { value: 'godot', label: 'Godot' },
    { value: 'gamemaker', label: 'GameMaker' },
    { value: 'construct', label: 'Construct' },
    { value: 'phaser', label: 'Phaser' },
    { value: 'love2d', label: 'Love2D' },
    { value: 'pygame', label: 'Pygame' },
    { value: 'custom', label: 'Custom' },
    { value: 'other', label: 'Other' }
];

const TAGS = [
    { value: '', label: 'All Genres' },
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'puzzle', label: 'Puzzle' },
    { value: 'platformer', label: 'Platformer' },
    { value: 'rpg', label: 'RPG' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'arcade', label: 'Arcade' },
    { value: '2d', label: '2D' },
    { value: '3d', label: '3D' },
    { value: 'pixel-art', label: 'Pixel Art' },
    { value: 'jam-game', label: 'Jam Game' }
];

const Community: React.FC = () => {
    const { user } = useAuth();
    const [games, setGames] = useState<CommunityGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedEngine, setSelectedEngine] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [sortOption, setSortOption] = useState<'newest' | 'random' | 'updated'>('newest');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [reportingGame, setReportingGame] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    useFadeInOnScroll([games, loading]);

    // Load games on mount and when filters change
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            loadGames(1);
        }, searchQuery ? 300 : 0); // Debounce search input
        
        return () => clearTimeout(delaySearch);
    }, [selectedEngine, selectedTag, sortOption, searchQuery]);

    const loadGames = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page,
                limit: 12,
                sort: sortOption,
                ...(selectedEngine && { engine: selectedEngine }),
                ...(selectedTag && { tag: selectedTag }),
                ...(searchQuery.trim() && { search: searchQuery.trim() })
            };
            
            const response: GamesResponse = await gameAPI.getCommunityGames(params);
            
            if (page === 1) {
                setGames(response.games);
            } else {
                setGames(prev => [...prev, ...response.games]);
            }
            
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to load games:', error);
            setError('Failed to load games.');
        } finally {
            setLoading(false);
        }
    };

    const handleReportGame = async (gameId: string) => {
        if (!user) {
            alert('Please log in to report content');
            return;
        }
        
        if (!gameId) {
            console.error('No game ID provided for reporting');
            return;
        }

        // Add confirmation dialog
        if (!window.confirm('Are you sure you want to report this content for inappropriate material?')) {
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

    const GameCard: React.FC<{ game: CommunityGame }> = ({ game }) => {
        const [expanded, setExpanded] = useState(false);
        const isOwner = user && user.id === game.user._id;
        
        return (
        <div className="community-game-card">
            {game.thumbnailUrl && (
                <div className="game-thumbnail">
                    <img src={game.thumbnailUrl} alt={game.title} />
                </div>
            )}
            <div className="game-info">
                <div className="game-header">
                    <h3 className="game-title">{game.title}</h3>
                    {user && !isOwner && (
                        <button
                            className="report-flag-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleReportGame(game._id);
                            }}
                            disabled={reportingGame === game._id}
                            title="Report inappropriate content"
                            aria-label="Report game"
                            type="button"
                        >
                            <span className="flag-icon">⚑</span>
                        </button>
                    )}
                </div>
                <p className="game-developer">
                    by <Link to={`/users/${game.user.username}`} className="developer-link">
                        {game.user.displayName}
                    </Link>
                </p>
                
                {game.description && (
                    <div className="game-description-wrapper">
                        <p className={`game-description ${expanded ? 'expanded' : ''}`}>
                            {game.description}
                        </p>
                        {game.description.length > 120 && (
                            <button 
                                type="button"
                                className="show-more-btn"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                )}
                
                {game.tags && game.tags.length > 0 && (
                    <div className="game-tags">
                        {game.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="game-tag">{tag}</span>
                        ))}
                    </div>
                )}
                
                <div className="game-actions">
                    {game.playUrl ? (
                        <a 
                            href={game.playUrl} 
                            target="_blank" 
                            rel="noopener noreferrer nofollow"
                            className="btn btn-primary"
                        >
                            View Game
                        </a>
                    ) : (
                        <div className="coming-soon-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>In Development</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        );
    };

    return (
        <>
        <div className="community-page">
            <Helmet>
                <meta name="robots" content="noindex, follow" />
                <meta name="description" content="Find fellow solo game developers and discover their projects" />
            </Helmet>
            <section className="page-header" data-fade data-delay="1">
                <div className="container">
                    <h1>Community</h1>
                    <p>Games from our developer community</p>
                </div>
            </section>
            
            <section className="section-compact" data-fade data-delay="2">
                <div className="container">

                {/* Filters and Sort */}
                <section className="view-controls" data-fade data-delay="2">
                    <div className="search-and-filters">
                        <input
                            type="text"
                            placeholder="Search games, developers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-options">
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as 'newest' | 'random' | 'updated')}
                            className="filter-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="random">Random</option>
                            <option value="updated">Recently Updated</option>
                        </select>
                        
                        <select 
                            value={selectedEngine}
                            onChange={(e) => setSelectedEngine(e.target.value)}
                            className="filter-select"
                        >
                            {ENGINES.map(engine => (
                                <option key={engine.value} value={engine.value}>
                                    {engine.label}
                                </option>
                            ))}
                        </select>
                        
                        <select 
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="filter-select"
                        >
                            {TAGS.map(tag => (
                                <option key={tag.value} value={tag.value}>
                                    {tag.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Results */}
                <section className="community-content" data-fade data-delay="3">
                    {loading && games.length === 0 ? (
                        <div className="loading-state">Loading games...</div>
                    ) : games.length > 0 ? (
                        <>
                            <div className="games-grid">
                                {games
                                    .sort((a, b) => {
                                        // Games with thumbnails come first
                                        if (a.thumbnailUrl && !b.thumbnailUrl) return -1;
                                        if (!a.thumbnailUrl && b.thumbnailUrl) return 1;
                                        return 0;
                                    })
                                    .map((game) => (
                                        <GameCard key={game._id} game={game} />
                                    ))}
                            </div>

                            {/* Load More */}
                            {pagination.page < pagination.pages && (
                                <div className="load-more-container">
                                    <button 
                                        onClick={() => loadGames(pagination.page + 1)}
                                        disabled={loading}
                                        className="btn btn-secondary load-more-button"
                                    >
                                        {loading ? 'Loading...' : 'Load More Games'}
                                    </button>
                                    <p className="pagination-info">
                                        Showing {games.length} of {pagination.total} games
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>No games found.</p>
                            <p>Be the first to share your game with the community!</p>
                        </div>
                    )}
                </section>
                </div>
            </section>
        </div>

        </>
    );
};

export default Community;