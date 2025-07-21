import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import './game-dashboard.css';

interface Game {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    screenshots: string[];
    videoUrl?: string;
    playUrl?: string;
    sourceUrl?: string;
    devlogUrl?: string;
    tags: string[];
    engine: string;
    platforms: string[];
    jamEntry: boolean;
    jamName?: string;
    jamPlacement?: number;
    visibility: 'public' | 'unlisted' | 'private' | 'pending';
    views: number;
    createdAt: string;
    updatedAt: string;
    slug: string;
}

interface GamesResponse {
    games: Game[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const GameDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
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

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Load user's games
    const loadGames = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response: GamesResponse = await gameAPI.getMyGames(page, 12);
            
            setGames(response.games);
            setPagination(response.pagination);
        } catch (error: any) {
            console.error('Failed to load games:', error);
            setError('Failed to load your games. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load games when component mounts
    useEffect(() => {
        if (user && !authLoading) {
            loadGames();
        }
    }, [user, authLoading]);

    // Delete game with confirmation
    const handleDeleteGame = async (gameId: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await gameAPI.deleteGame(gameId);
            // Reload games after deletion
            await loadGames(pagination.page);
        } catch (error: any) {
            console.error('Failed to delete game:', error);
            alert('Failed to delete game. Please try again.');
        }
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };


    // Loading state
    if (authLoading || loading) {
        return (
            <div className="game-dashboard">
                <div className="container">
                    <div className="dashboard-card">
                        <h1>Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="game-dashboard">
                <div className="container">
                    <div className="dashboard-card">
                        <h1>Please log in to manage your games</h1>
                        <a href="/login" className="btn btn-primary">Log In</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>My Games</h1>
                        <p>Manage your game portfolio</p>
                    </div>
                    <div className="header-actions">
                        <a href="/games/new" className="btn btn-primary">
                            + Add New Game
                        </a>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Games Grid */}
                <div className="dashboard-content">
                    {games.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">Game Portfolio</div>
                            <h2>No games yet</h2>
                            <p>Start building your game portfolio by adding your first game!</p>
                            <a href="/games/new" className="btn btn-primary">
                                Add Your First Game
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="games-grid">
                                {games.map((game, index) => (
                                    <div key={game._id} className="game-card">
                                        {/* Thumbnail */}
                                        <div className="game-thumbnail">
                                            {game.thumbnailUrl ? (
                                                <img 
                                                    src={game.thumbnailUrl} 
                                                    alt={game.title}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="placeholder-thumbnail">
                                                    <span>No Image</span>
                                                </div>
                                            )}
                                            
                                        </div>

                                        {/* Game Info */}
                                        <div className="game-info">
                                            <h3 className="game-title">{game.title}</h3>
                                            <p className="game-description">
                                                {game.description.substring(0, 100)}
                                                {game.description.length > 100 && '...'}
                                            </p>
                                            
                                            {/* Meta info */}
                                            <div className="game-meta">
                                                <span className="game-date">{formatDate(game.updatedAt)}</span>
                                            </div>

                                            {/* Tags */}
                                            {game.tags.length > 0 && (
                                                <div className="game-tags">
                                                    {(expandedTags.has(index) ? game.tags : game.tags.slice(0, 3)).map((tag, tagIndex) => (
                                                        <span key={tagIndex} className="tag">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {game.tags.length > 3 && (
                                                        <button 
                                                            className="tag-more"
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

                                            {/* Actions */}
                                            <div className="game-actions">
                                                <a 
                                                    href={game.playUrl || '#'} 
                                                    className="btn btn-sm btn-ghost"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ opacity: game.playUrl ? 1 : 0.5, pointerEvents: game.playUrl ? 'auto' : 'none' }}
                                                >
                                                    View
                                                </a>
                                                <a 
                                                    href={`/games/${game._id}/edit`} 
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    Edit
                                                </a>
                                                <button 
                                                    onClick={() => handleDeleteGame(game._id, game.title)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="pagination">
                                    <button 
                                        onClick={() => loadGames(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="btn btn-secondary"
                                    >
                                        Previous
                                    </button>
                                    <span className="pagination-info">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button 
                                        onClick={() => loadGames(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="btn btn-secondary"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameDashboard;