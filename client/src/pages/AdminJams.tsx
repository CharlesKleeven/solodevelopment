import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jamAPI, themeAPI, backupAPI } from '../services/api';
import api from '../services/api';
import './admin.css';

interface Jam {
    _id?: string;
    id: string;
    title: string;
    theme: string;
    description: string;
    url: string;
    startDate: string;
    endDate: string;
    status?: 'upcoming' | 'active' | 'ended';
    participants: number;
    submissions: number;
    isCurrent: boolean;
    isVotingOpen?: boolean;
}

interface Theme {
    id: string;
    name: string;
    score: number;
    userVote?: -1 | 0 | 1;
    voteCounts?: {
        upvotes: number;
        downvotes: number;
        total: number;
    };
}

interface Backup {
    _id: string;
    jamId: string;
    backupType: 'manual' | 'automatic' | 'pre_update';
    timestamp: string;
    voteCount: number;
    themeCount: number;
    metadata?: {
        triggeredBy?: string;
        reason?: string;
    };
}

const AdminJams: React.FC = () => {
    const { user } = useAuth();
    const [currentJam, setCurrentJam] = useState<Jam | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [showThemeForm, setShowThemeForm] = useState(false);
    const [themeText, setThemeText] = useState('');
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [showVotingResults, setShowVotingResults] = useState(false);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [showBackups, setShowBackups] = useState(false);
    const [backups, setBackups] = useState<Backup[]>([]);

    // Form state
    const [formData, setFormData] = useState<Partial<Jam>>({
        id: '',
        title: '',
        theme: 'TBD',
        description: '',
        url: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (user) {
            fetchCurrentJam();
        }
    }, [user]);

    const fetchCurrentJam = async () => {
        try {
            const response = await jamAPI.getAllJams();
            const current = response.data.jams.find((j: Jam) => j.isCurrent);
            if (current) {
                setCurrentJam(current);
                setIsVotingOpen(current.isVotingOpen ?? false);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching current jam:', error);
            }
            setMessage('Error: Failed to fetch current jam');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            if (currentJam) {
                await jamAPI.updateJam(formData.id!, formData);
                setMessage('Jam updated successfully!');
            } else {
                await jamAPI.createJam(formData);
                await jamAPI.setCurrentJam(formData.id!);
                setMessage('Jam created successfully!');
            }
            
            fetchCurrentJam();
            resetForm();
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleToggleVoting = async () => {
        const confirmMessage = isVotingOpen 
            ? 'Are you sure you want to close voting? Users will no longer be able to vote on themes.'
            : 'Are you sure you want to open voting? Users will be able to vote on themes.';
            
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        try {
            const response = await jamAPI.toggleVoting();
            setIsVotingOpen(response.data.isVotingOpen);
            setMessage(response.data.message);
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const fetchVotingResults = async () => {
        if (!currentJam) return;
        
        // Close other sections
        setShowForm(false);
        setShowThemeForm(false);
        
        try {
            // Pass includeVoteCounts query param for admin users
            const response = await api.get(`/api/themes/jam/${currentJam.id}?includeVoteCounts=true`);
            if (response.data?.themes) {
                // Sort by score descending
                const sortedThemes = [...response.data.themes].sort((a, b) => b.score - a.score);
                setThemes(sortedThemes);
                setShowVotingResults(true);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching voting results:', error);
            }
            setMessage('Error: Failed to fetch voting results');
        }
    };

    const handleEdit = () => {
        if (!currentJam) return;
        
        // Close other sections
        setShowThemeForm(false);
        setShowVotingResults(false);
        
        setFormData({
            id: currentJam.id,
            title: currentJam.title,
            theme: currentJam.theme,
            description: currentJam.description,
            url: currentJam.url,
            startDate: new Date(currentJam.startDate).toISOString().slice(0, 16),
            endDate: new Date(currentJam.endDate).toISOString().slice(0, 16)
        });
        setShowForm(true);
    };


    const resetForm = () => {
        setShowForm(false);
        setFormData({
            id: '',
            title: '',
            theme: 'TBD',
            description: '',
            url: '',
            startDate: '',
            endDate: ''
        });
    };

    const generateJamId = () => {
        const title = formData.title || 'jam';
        const year = new Date().getFullYear();
        const id = `${title.toLowerCase().replace(/\s+/g, '-')}-${year}`;
        setFormData({ ...formData, id });
    };

    if (!user || !user?.isAdmin) {
        return <div className="admin-page">Please log in as an admin.</div>;
    }

    if (loading) {
        return <div className="admin-page">Loading...</div>;
    }

    return (
        <div className="admin-jams">
                <h2>Jam Management</h2>
                
                {message && (
                    <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {!currentJam ? (
                    <div className="admin-actions">
                        <button 
                            className="btn btn-secondary"
                            onClick={() => {
                                // Close other sections when toggling form
                                if (!showForm) {
                                    setShowThemeForm(false);
                                    setShowVotingResults(false);
                                }
                                setShowForm(!showForm);
                            }}
                        >
                            {showForm ? 'Cancel' : 'Create Jam'}
                        </button>
                    </div>
                ) : (
                    <div className="current-jam-section">
                        <div className="jam-card current">
                            <div className="jam-header">
                                <h3>{currentJam.title}</h3>
                                <span className={`status-text ${currentJam.status}`}>{currentJam.status}</span>
                            </div>
                            <div className="jam-details">
                                <p><strong>Theme:</strong> {currentJam.theme}</p>
                                <p><strong>Dates:</strong> {new Date(currentJam.startDate).toLocaleDateString()} - {new Date(currentJam.endDate).toLocaleDateString()}</p>
                                <p><strong>Participants:</strong> {currentJam.participants}</p>
                                <div className="voting-status-row">
                                    <p><strong>Voting:</strong> <span className={`status-badge ${isVotingOpen ? 'open' : 'closed'}`}>{isVotingOpen ? 'Open' : 'Closed'}</span></p>
                                    <button 
                                        onClick={handleToggleVoting}
                                        className={`btn btn-sm ${isVotingOpen ? 'btn-danger' : 'btn-success'}`}
                                        title={isVotingOpen ? 'Close voting' : 'Open voting'}
                                    >
                                        {isVotingOpen ? 'Close Voting' : 'Open Voting'}
                                    </button>
                                </div>
                            </div>
                            <div className="jam-actions">
                                <button 
                                    onClick={handleEdit}
                                    className={`btn btn-sm ${showForm ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    Edit Jam
                                </button>
                                <button 
                                    onClick={() => {
                                        // Close other sections
                                        setShowForm(false);
                                        setShowVotingResults(false);
                                        
                                        setShowThemeForm(true);
                                        // Load existing themes
                                        themeAPI.getThemes(currentJam.id).then(response => {
                                            if (response.data?.themes) {
                                                const existingThemes = response.data.themes.map((t: Theme) => t.name).join('\n');
                                                setThemeText(existingThemes);
                                            }
                                        }).catch((error) => {
                                            if (process.env.NODE_ENV === 'development') {
                                                console.error(error);
                                            }
                                        });
                                    }}
                                    className={`btn btn-sm ${showThemeForm ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    Manage Themes
                                </button>
                                <button 
                                    onClick={fetchVotingResults}
                                    className={`btn btn-sm ${showVotingResults ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    View Voting Results
                                </button>
                                <button 
                                    onClick={async () => {
                                        // Close other sections
                                        setShowForm(false);
                                        setShowThemeForm(false);
                                        setShowVotingResults(false);
                                        
                                        if (!showBackups) {
                                            try {
                                                const response = await backupAPI.getBackups(currentJam.id);
                                                setBackups(response.data.backups);
                                                setShowBackups(true);
                                            } catch (error) {
                                                setMessage('Error: Failed to fetch backups');
                                            }
                                        } else {
                                            setShowBackups(false);
                                        }
                                    }}
                                    className={`btn btn-sm ${showBackups ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    Manage Backups
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showForm && (
                    <form onSubmit={handleSubmit} className="jam-form">
                        <h2>{currentJam ? 'Edit Jam' : 'Create New Jam'}</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Jam ID (URL-friendly):</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="summer-jam-2025"
                                        required
                                    />
                                    <button type="button" onClick={generateJamId} className="btn btn-sm">
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Summer Jam"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Theme:</label>
                                <input
                                    type="text"
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                    placeholder="TBD or theme name"
                                />
                            </div>

                        </div>

                        <div className="form-group">
                            <label>Description:</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="3-day jam with theme to be announced"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Itch.io URL:</label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://itch.io/jam/..."
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date & Time:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date & Time:</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>


                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {currentJam ? 'Update Jam' : 'Create Jam'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                        
                    </form>
                )}

                {showThemeForm && currentJam && (
                    <div className="theme-form">
                        <h2>Manage Themes for {currentJam.title}</h2>
                        <div className="existing-themes">
                            <p className="text-sm text-secondary">Current themes will be replaced when you submit new ones.</p>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setMessage('');
                            try {
                                const themeList = themeText.split('\n').filter(t => t.trim());
                                await themeAPI.createThemes(currentJam.id, themeList);
                                setMessage(`Success! Added ${themeList.length} themes.`);
                                setThemeText('');
                                setShowThemeForm(false);
                            } catch (error: any) {
                                setMessage(`Error: ${error.response?.data?.error || error.message}`);
                            }
                        }}>
                            <div className="form-group">
                                <label>Themes (one per line):</label>
                                <textarea
                                    value={themeText}
                                    onChange={(e) => setThemeText(e.target.value)}
                                    placeholder="Retro Future&#10;One Button&#10;Time Loop&#10;etc..."
                                    rows={10}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-secondary">Replace All Themes</button>
                                <button type="button" onClick={() => setShowThemeForm(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showVotingResults && currentJam && (
                    <div className="voting-results">
                        <h2>Voting Results for {currentJam.title}</h2>
                        <div className="results-info">
                            <p>Total themes: {themes.length}</p>
                            <p>Voting status: {isVotingOpen ? 'Open' : 'Closed'}</p>
                        </div>
                        <div className="themes-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Theme</th>
                                        <th>Score</th>
                                        <th>Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {themes.map((theme, index) => (
                                        <tr key={theme.id} className={index < 5 ? 'top-theme' : ''}>
                                            <td>{index + 1}</td>
                                            <td>{theme.name}</td>
                                            <td>
                                                <span className={`score ${theme.score > 0 ? 'positive' : theme.score < 0 ? 'negative' : ''}`}>
                                                    {theme.score > 0 ? '+' : ''}{theme.score}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="vote-counts">
                                                    {theme.voteCounts ? (
                                                        <>
                                                            <span className="upvotes">↑ {theme.voteCounts.upvotes}</span>
                                                            <span className="downvotes">↓ {theme.voteCounts.downvotes}</span>
                                                            <span className="total-votes">Total: {theme.voteCounts.total}</span>
                                                        </>
                                                    ) : (
                                                        <span className="no-votes">No votes yet</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="form-actions">
                            <button 
                                type="button" 
                                onClick={async () => {
                                    try {
                                        await themeAPI.recalculateScores(currentJam.id);
                                        setMessage('Theme scores recalculated successfully');
                                        fetchVotingResults(); // Refresh the results
                                    } catch (error: any) {
                                        setMessage(`Error: ${error.response?.data?.error || error.message}`);
                                    }
                                }}
                                className="btn btn-secondary"
                            >
                                Recalculate Scores
                            </button>
                            <button type="button" onClick={() => setShowVotingResults(false)} className="btn btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showBackups && currentJam && (
                    <div className="backup-management">
                        <h2>Backup Management for {currentJam.title}</h2>
                        
                        <div className="backup-actions">
                            <button 
                                onClick={async () => {
                                    const reason = prompt('Enter reason for manual backup (optional):');
                                    try {
                                        await backupAPI.createBackup(currentJam.id, reason || undefined);
                                        setMessage('Manual backup created successfully');
                                        // Refresh backup list
                                        const response = await backupAPI.getBackups(currentJam.id);
                                        setBackups(response.data.backups);
                                    } catch (error: any) {
                                        setMessage(`Error: ${error.response?.data?.error || error.message}`);
                                    }
                                }}
                                className="btn btn-secondary"
                            >
                                Create Manual Backup
                            </button>
                            <p className="backup-info">
                                Automatic backups run every 6 hours. Backups are kept for 30 days.
                            </p>
                        </div>

                        <div className="backups-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Date & Time</th>
                                        <th>Votes</th>
                                        <th>Themes</th>
                                        <th>Reason</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups.map((backup) => (
                                        <tr key={backup._id}>
                                            <td>
                                                <span className={`backup-type ${backup.backupType}`}>
                                                    {backup.backupType}
                                                </span>
                                            </td>
                                            <td>{new Date(backup.timestamp).toLocaleString()}</td>
                                            <td>{backup.voteCount}</td>
                                            <td>{backup.themeCount}</td>
                                            <td>{backup.metadata?.reason || '-'}</td>
                                            <td>
                                                <button 
                                                    onClick={async () => {
                                                        if (window.confirm(
                                                            `Are you sure you want to restore from this backup?\n\n` +
                                                            `This will REPLACE all current votes with ${backup.voteCount} votes from ${new Date(backup.timestamp).toLocaleString()}.\n\n` +
                                                            `This action cannot be undone!`
                                                        )) {
                                                            try {
                                                                await backupAPI.restoreBackup(backup._id);
                                                                setMessage('Backup restored successfully');
                                                                // Refresh voting results if open
                                                                if (showVotingResults) {
                                                                    fetchVotingResults();
                                                                }
                                                            } catch (error: any) {
                                                                setMessage(`Error: ${error.response?.data?.error || error.message}`);
                                                            }
                                                        }
                                                    }}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Restore
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setShowBackups(false)} className="btn btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default AdminJams;