import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { getGameImageFromUrl, isValidGamePlatformUrl, isApprovedThumbnailSource } from '../utils/gameImageUtils';
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [platformDetected, setPlatformDetected] = useState<string>('');

    // Form data - simplified
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        playUrl: '',
        thumbnailUrl: '',
        tags: [] as string[],
        engine: 'other',
        platforms: [] as string[],
        visibility: 'public' as 'public' | 'unlisted' | 'private',
        isAdult: false
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
                        visibility: game.visibility || 'public',
                        isAdult: game.isAdult || false
                    });
                    
                    // Set image preview if exists
                    if (game.thumbnailUrl) {
                        setImagePreview(game.thumbnailUrl);
                    }

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
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            
            // Auto-detect and fetch image when play URL changes
            if (name === 'playUrl' && value) {
                const result = getGameImageFromUrl(value);
                if (result.thumbnailUrl) {
                    setFormData(prev => ({ ...prev, thumbnailUrl: result.thumbnailUrl || '' }));
                    setImagePreview(result.thumbnailUrl);
                    setPlatformDetected(`Image auto-detected from ${result.platform === 'steam' ? 'Steam' : 'Itch.io'}`);
                } else if (result.platform) {
                    setPlatformDetected(result.error || '');
                } else if (value) {
                    setPlatformDetected('Please use a Steam or Itch.io game URL');
                }
            }
            
            // Update preview when thumbnail URL changes manually
            if (name === 'thumbnailUrl') {
                // Only allow preview if it's from approved sources
                if (value && isApprovedThumbnailSource(value)) {
                    setImagePreview(value);
                } else if (!value) {
                    setImagePreview(null);
                }
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
        setPlatformDetected('');
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
            
            // Validate game URL if provided
            if (formData.playUrl && !isValidGamePlatformUrl(formData.playUrl)) {
                setError('Play URL must be from Steam or Itch.io');
                return;
            }

            // Combine basic and advanced data
            const gameData: any = {
                title: formData.title,
                description: formData.description,
                visibility: formData.visibility,
                engine: formData.engine || 'other',
                platforms: formData.platforms.length > 0 ? formData.platforms : ['other'],
                tags: formData.tags || [],
                isAdult: formData.isAdult
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
                const thumbnailUrl = formData.thumbnailUrl.trim();
                if (!isApprovedThumbnailSource(thumbnailUrl)) {
                    throw new Error('Custom thumbnail URLs require mod approval. Please use Steam or Itch.io image URLs only.');
                }
                gameData.thumbnailUrl = thumbnailUrl;
            }

            
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
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to save game:', error);
                console.error('Error response data:', error.response?.data);
                console.error('Error response status:', error.response?.status);
            }
            
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
                setError(errorMessages);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.details) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Validation details:', error.response.data.details);
                }
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
                    {/* Step 1: Essential Information */}
                    <div className="form-section">
                        <div className="section-number">1</div>
                        <h2>Essential Information</h2>
                        
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
                                placeholder="Game Title"
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
                                placeholder="Brief description of your game"
                            />
                            <div className="char-count">{formData.description.length}/2000 (minimum 10 characters)</div>
                        </div>

                    </div>

                    {/* Step 2: Game Link & Image */}
                    <div className="form-section">
                        <div className="section-number">2</div>
                        <h2>Where to Play</h2>
                        
                        <div className="form-group">
                            <label htmlFor="playUrl">
                                Game URL <span className="optional">(optional)</span>
                            </label>
                            <input
                                type="url"
                                id="playUrl"
                                name="playUrl"
                                value={formData.playUrl}
                                onChange={handleInputChange}
                                placeholder="https://store.steampowered.com/app/123456"
                            />
                            <small className={platformDetected.includes('detected') ? 'success-text' : ''}>
                                {platformDetected || 'Steam or Itch.io URLs only'}
                            </small>
                        </div>

                        {(formData.thumbnailUrl || imagePreview) && (
                            <div className="form-group">
                                <label>Thumbnail Preview</label>
                                <div className="image-preview-container">
                                    <img src={imagePreview || formData.thumbnailUrl} alt="Game thumbnail" className="image-preview" />
                                    <button type="button" onClick={removeImage} className="btn btn-ghost btn-sm">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!imagePreview && (
                            <div className="form-group">
                                <label htmlFor="thumbnailUrl">
                                    Itch.io Thumbnail URL <span className="optional">(optional)</span>
                                </label>
                                <input
                                    type="url"
                                    id="thumbnailUrl"
                                    name="thumbnailUrl"
                                    value={formData.thumbnailUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://img.itch.zone/..."
                                />
                                <small>
                                    <strong>Itch.io only:</strong> Right-click your game's cover → "Copy image address" → Paste here<br/>
                                    <span style={{color: 'var(--color-coral)'}}>Note: Only Steam and Itch.io image URLs are allowed. Other URLs require mod approval.</span>
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Categorization */}
                    <div className="form-section">
                        <div className="section-number">3</div>
                        <h2>Categorize Your Game</h2>
                        
                        <div className="form-group">
                            <label>Genre Tags <span className="optional">(choose up to 5)</span></label>
                            <div className="tag-grid">
                                {POPULAR_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`tag-button ${formData.tags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => handleTagToggle(tag)}
                                        disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                                    >
                                        {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                            <small className="tag-counter">{formData.tags.length}/5 selected</small>
                        </div>

                        <div className="form-group">
                            <label>Platforms</label>
                            <div className="platform-grid">
                                {PLATFORMS.map(platform => (
                                    <button
                                        key={platform}
                                        type="button"
                                        className={`platform-button ${formData.platforms.includes(platform) ? 'selected' : ''}`}
                                        onClick={() => handlePlatformToggle(platform)}
                                    >
                                        {platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Additional Details */}
                    <div className="form-section collapsible">
                        <div className="section-header">
                            <div>
                                <div className="section-number">4</div>
                                <h2>Additional Details <span className="optional">(optional)</span></h2>
                            </div>
                        </div>
                        
                        <div className="collapsible-content">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="engine">Game Engine</label>
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
                                        <option value="public">Public - Everyone can see</option>
                                        <option value="unlisted">Unlisted - Only with link</option>
                                        <option value="private">Private - Only you</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="checkbox-label adult-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isAdult"
                                        checked={formData.isAdult}
                                        onChange={handleInputChange}
                                    />
                                    <span>This game contains adult content (18+)</span>
                                </label>
                                <small>Mature themes, violence, or sexual content</small>
                            </div>
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