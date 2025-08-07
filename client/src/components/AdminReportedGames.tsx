import React, { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';

interface ReportedGame {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    user: {
        username: string;
        displayName: string;
    };
    reportCount: number;
    isAdult?: boolean;
    createdAt: string;
}

const AdminReportedGames: React.FC = () => {
    const [reportedGames, setReportedGames] = useState<ReportedGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReportedGames();
    }, []);

    const fetchReportedGames = async () => {
        try {
            setLoading(true);
            const response = await gameAPI.getReportedGames();
            setReportedGames(response.games);
        } catch (error: any) {
            console.error('Failed to fetch reported games:', error);
            setError('Failed to load reported games');
        } finally {
            setLoading(false);
        }
    };

    const handleClearReports = async (gameId: string) => {
        if (!window.confirm('Are you sure you want to clear all reports for this game?')) {
            return;
        }

        try {
            await gameAPI.clearReports(gameId);
            setReportedGames(prev => prev.filter(game => game._id !== gameId));
            alert('Reports cleared successfully');
        } catch (error) {
            console.error('Failed to clear reports:', error);
            alert('Failed to clear reports');
        }
    };

    const handleRemoveImage = async (gameId: string) => {
        if (!window.confirm('Are you sure you want to remove this game\'s thumbnail?')) {
            return;
        }

        try {
            await gameAPI.removeThumbnail(gameId);
            setReportedGames(prev => prev.map(game => 
                game._id === gameId ? { ...game, thumbnailUrl: '' } : game
            ));
            alert('Thumbnail removed successfully');
        } catch (error) {
            console.error('Failed to remove thumbnail:', error);
            alert('Failed to remove thumbnail');
        }
    };

    if (loading) {
        return <div className="loading-state">Loading reported games...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="admin-section">
            <h2>Reported Games</h2>
            
            {reportedGames.length === 0 ? (
                <div className="empty-state">
                    <p>No reported games at this time.</p>
                </div>
            ) : (
                <div className="reported-games-list">
                    {reportedGames.map(game => (
                        <div key={game._id} className="reported-game-item">
                            <div className="reported-game-info">
                                {game.thumbnailUrl && (
                                    <img 
                                        src={game.thumbnailUrl} 
                                        alt={game.title}
                                        className="reported-game-thumbnail"
                                    />
                                )}
                                <div className="reported-game-details">
                                    <h3>
                                        {game.title}
                                        {game.isAdult && <span className="adult-badge"> 18+</span>}
                                    </h3>
                                    <p>By: {game.user.displayName} (@{game.user.username})</p>
                                    <p className="report-count">Reports: {game.reportCount}</p>
                                </div>
                            </div>
                            <div className="reported-game-actions">
                                <button 
                                    onClick={() => handleClearReports(game._id)}
                                    className="btn btn-secondary"
                                >
                                    Clear Reports
                                </button>
                                <button 
                                    onClick={() => handleRemoveImage(game._id)}
                                    className="btn btn-danger"
                                >
                                    Remove Image
                                </button>
                                <a 
                                    href={`/users/${game.user.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost"
                                >
                                    View Profile
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminReportedGames;