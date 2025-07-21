import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import './game-form.css';

// Available options
const ENGINES = [
    'unity', 'unreal', 'godot', 'gamemaker', 'construct', 
    'phaser', 'love2d', 'pygame', 'custom', 'other'
];

const PLATFORMS = [
    'web', 'windows', 'mac', 'linux', 'android', 'ios',
    'playstation', 'xbox', 'nintendo-switch', 'other'
];

const POPULAR_TAGS = [
    'action', 'adventure', 'puzzle', 'platformer', 'rpg', 
    'arcade', '2d', '3d', 'pixel-art', 'jam-game'
];

const GameForm: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form data - simplified
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        playUrl: '',
        thumbnailUrl: '',
        tags: [] as string[],
        engine: 'other',
        platforms: [] as string[],
        visibility: 'public' as 'public' | 'unlisted' | 'private'
    });


    // Load existing game data if editing
    useEffect(() => {
        if (isEditing && id) {
            const loadGame = async () => {
                try {
                    setLoading(true);
                    const game = await gameAPI.getGame(id);
                    
                    setFormData({
                        title: game.title || '',
                        description: game.description || '',
                        playUrl: game.playUrl || '',
                        thumbnailUrl: game.thumbnailUrl || '',
                        tags: game.tags || [],
                        engine: game.engine || 'other',
                        platforms: game.platforms || [],
                        visibility: game.visibility || 'public'
                    });

                } catch (error: any) {
                    console.error('Failed to load game:', error);
                    setError('Failed to load game data.');
                } finally {
                    setLoading(false);
                }
            };
            
            loadGame();
        }
    }, [isEditing, id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tag: string) => {
        const newTags = formData.tags.includes(tag)
            ? formData.tags.filter(t => t !== tag)
            : [...formData.tags, tag];
        
        if (newTags.length <= 5) {
            setFormData(prev => ({ ...prev, tags: newTags }));
        }
    };

    const handlePlatformToggle = (platform: string) => {
        const newPlatforms = formData.platforms.includes(platform)
            ? formData.platforms.filter(p => p !== platform)
            : [...formData.platforms, platform];
        
        setFormData(prev => ({ ...prev, platforms: newPlatforms }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate required fields
            if (formData.title.length < 3) {
                setError('Title must be at least 3 characters long.');
                return;
            }
            
            if (formData.description.length < 10) {
                setError('Description must be at least 10 characters long.');
                return;
            }

            // Combine basic and advanced data
            const gameData: any = {
                title: formData.title,
                description: formData.description,
                visibility: formData.visibility,
                engine: formData.engine || 'other',
                platforms: formData.platforms.length > 0 ? formData.platforms : ['other'],
                tags: formData.tags || []
            };

            // Handle playUrl - only include if it has a value
            if (formData.playUrl && formData.playUrl.trim()) {
                const url = formData.playUrl.trim();
                // Validate that it's only itch.io or Steam
                if (url.includes('itch.io') || url.includes('store.steampowered.com')) {
                    gameData.playUrl = url;
                } else {
                    throw new Error('Game links must be from itch.io or Steam store only');
                }
            }
            // If empty, don't include playUrl field at all - this will remove it from database
            
            if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
                gameData.thumbnailUrl = formData.thumbnailUrl.trim();
            }


            console.log('Game data being sent:', gameData);
            
            if (isEditing && id) {
                await gameAPI.updateGame(id, gameData);
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/games'), 2000);
            } else {
                await gameAPI.createGame(gameData);
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/games'), 2000);
            }
        } catch (error: any) {
            console.error('Failed to save game:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
                setError(errorMessages);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.details) {
                console.error('Validation details:', error.response.data.details);
                setError('Validation error: ' + JSON.stringify(error.response.data.details));
            } else {
                setError('Failed to save game. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (authLoading) {
        return <div className="game-form-page"><div className="container">Loading...</div></div>;
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="game-form-page">
                <div className="container">
                    <div className="form-card">
                        <h1>Please log in to add games</h1>
                        <a href="/login" className="btn btn-primary">Log In</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-form-page">
            <div className="container">
                <div className="form-header">
                    <h1>{isEditing ? 'Edit Game' : 'Add New Game'}</h1>
                    <p>Share your creation with the community</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Game saved successfully! Redirecting...</div>}

                <form onSubmit={handleSubmit} className="game-form">
                    {/* Essential Information */}
                    <div className="form-section">
                        <h2>Game Details</h2>
                        
                        <div className="form-group">
                            <label htmlFor="title">
                                Game Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                maxLength={100}
                                placeholder="What's your game called?"
                            />
                            <small>Required - At least 3 characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                maxLength={2000}
                                rows={4}
                                placeholder="Tell people about your game. What genre is it? What's the story? What makes it fun?"
                            />
                            <div className="char-count">{formData.description.length}/2000 (minimum 10 characters)</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="playUrl">
                                Where can people play it? <span className="optional">(optional)</span>
                            </label>
                            <input
                                type="url"
                                id="playUrl"
                                name="playUrl"
                                value={formData.playUrl}
                                onChange={handleInputChange}
                                placeholder="https://yourname.itch.io/your-game"
                            />
                            <small>Only itch.io and Steam store links allowed for security</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="thumbnailUrl">
                                Game Image <span className="optional">(coming soon)</span>
                            </label>
                            <input
                                type="url"
                                id="thumbnailUrl"
                                name="thumbnailUrl"
                                value=""
                                disabled
                                placeholder="Image upload coming soon..."
                                className="coming-soon"
                            />
                            <small>Direct image upload feature will be available soon</small>
                        </div>
                    </div>

                    {/* Quick Options */}
                    <div className="form-section">
                        <h2>Quick Details</h2>
                        
                        <div className="form-group">
                            <label>Popular Tags (optional, up to 5)</label>
                            <div className="tag-grid">
                                {POPULAR_TAGS.map(tag => (
                                    <label key={tag} className="tag-option">
                                        <input
                                            type="checkbox"
                                            name={`tag-${tag}`}
                                            checked={formData.tags.includes(tag)}
                                            onChange={() => handleTagToggle(tag)}
                                            disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                                        />
                                        <span>{tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                            <small>{formData.tags.length}/5 tags selected</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="engine">Made with</label>
                                <select
                                    id="engine"
                                    name="engine"
                                    value={formData.engine}
                                    onChange={handleInputChange}
                                >
                                    {ENGINES.map(engine => (
                                        <option key={engine} value={engine}>
                                            {engine.charAt(0).toUpperCase() + engine.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="visibility">Visibility</label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleInputChange}
                                >
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Platforms (optional)</label>
                            <div className="platform-grid">
                                {PLATFORMS.map(platform => (
                                    <label key={platform} className="platform-option">
                                        <input
                                            type="checkbox"
                                            name={`platform-${platform}`}
                                            checked={formData.platforms.includes(platform)}
                                            onChange={() => handlePlatformToggle(platform)}
                                        />
                                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.platforms.length === 0 && (
                                <small>If none selected, will default to "Other"</small>
                            )}
                        </div>
                    </div>


                    {/* Submit Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/games')}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Game' : 'Add Game')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GameForm;