import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import './profile.css';

const Profile: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Current values
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [links, setLinks] = useState<string[]>(['', '', '', '']);

    // Original values for canceling
    const [originalDisplayName, setOriginalDisplayName] = useState('');
    const [originalBio, setOriginalBio] = useState('');
    const [originalLinks, setOriginalLinks] = useState<string[]>(['', '', '', '']);

    // Initialize profile data from user context
    useEffect(() => {
        if (user) {
            const userDisplayName = user.displayName; // No fallback needed since it's required
            const userBio = user.bio || '';

            // Parse links from stored JSON format and extract display text
            let userLinks: string[] = [];
            if (user.links) {
                userLinks = user.links.map((link: string) => {
                    try {
                        const linkData = JSON.parse(link);
                        return linkData.display || link;
                    } catch {
                        // Fallback for old format
                        return link;
                    }
                });
            }

            // Pad links array to always have 4 slots
            const paddedLinks = [...userLinks];
            while (paddedLinks.length < 4) {
                paddedLinks.push('');
            }

            setDisplayName(userDisplayName);
            setBio(userBio);
            setLinks(paddedLinks);

            // Set originals
            setOriginalDisplayName(userDisplayName);
            setOriginalBio(userBio);
            setOriginalLinks(paddedLinks);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Filter out empty links before saving
            const filteredLinks = links.filter(link => link.trim() !== '');

            await profileAPI.updateProfile({
                displayName: displayName.trim(),
                bio: bio.trim(),
                links: filteredLinks,
            });

            // Refresh user data in context - this updates navbar immediately!
            await refreshUser();

            // Update original values to current values
            setOriginalDisplayName(displayName);
            setOriginalBio(bio);
            setOriginalLinks([...links]);

            setIsEditing(false);
        } catch (error: any) {
            console.error('Save failed:', error);
            if (error.response?.data?.details) {
                const errorMessages = error.response.data.details.map((err: any) => err.msg).join(', ');
                setError(errorMessages);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to save profile. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        setDisplayName(originalDisplayName);
        setBio(originalBio);
        setLinks([...originalLinks]);
        setIsEditing(false);
        setError(null);
    };

    const startEditing = () => {
        // Store current values as originals when starting to edit
        setOriginalDisplayName(displayName);
        setOriginalBio(bio);
        setOriginalLinks([...links]);
        setIsEditing(true);
        setError(null);
    };

    const updateLink = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
    };

    // Helper function to get link info (you'll need to implement this)
    const getLinkInfo = (link: string) => {
        // Ensure URL has protocol
        const url = link.startsWith('http') ? link : `https://${link}`;

        // Simple display text extraction
        let displayText = link;
        try {
            const urlObj = new URL(url);
            displayText = urlObj.hostname.replace('www.', '');
        } catch {
            displayText = link;
        }

        return {
            url,
            displayText,
            icon: '🔗' // You can replace this with proper icons later
        };
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-card">
                        <h1>Please log in to view your profile</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Format join date
    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : 'Recently';

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-card">
                    {/* Header */}
                    <div className="profile-header">
                        <div className="profile-info">
                            {isEditing ? (
                                <div className="name-edit">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Display name"
                                        className="display-name-input"
                                        maxLength={20}
                                        disabled={isSaving}
                                    />
                                    <p className="profile-username">@{user.username}</p>
                                </div>
                            ) : (
                                <>
                                    <h1 className="profile-name">{displayName}</h1>
                                    <p className="profile-username">@{user.username}</p>
                                </>
                            )}
                        </div>
                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="btn btn-secondary btn-sm"
                                disabled={isSaving}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="profile-error">
                            {error}
                        </div>
                    )}

                    {/* Bio Section - Always show */}
                    <div className="profile-section">
                        <h3>About</h3>
                        {isEditing ? (
                            <div className="bio-edit">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell the community about yourself..."
                                    className="profile-textarea"
                                    rows={3}
                                    maxLength={280}
                                    disabled={isSaving}
                                />
                                <div className="char-count">{bio.length}/280</div>
                            </div>
                        ) : (
                            <p className={`profile-bio ${!bio ? 'empty-bio' : ''}`}>
                                {bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>

                    {/* Links Section - Always show */}
                    <div className="profile-section">
                        <h3>Links</h3>
                        {isEditing ? (
                            <div className="links-edit">
                                {links.map((link, index) => (
                                    <input
                                        key={index}
                                        type="url"
                                        value={link}
                                        onChange={(e) => updateLink(index, e.target.value)}
                                        placeholder={`Link ${index + 1} (optional)`}
                                        className="link-input"
                                        disabled={isSaving}
                                    />
                                ))}
                                <p className="links-help">Add up to 4 links to your work, social profiles, or portfolio</p>
                            </div>
                        ) : (
                            <div className="links-display">
                                {links.filter(link => link.trim() !== '').length > 0 ? (
                                    links.filter(link => link.trim() !== '').map((link, index) => {
                                        const linkInfo = getLinkInfo(link);
                                        return (
                                            <a
                                                key={index}
                                                href={linkInfo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link-item"
                                            >
                                                {linkInfo.displayText}
                                            </a>
                                        );
                                    })
                                ) : (
                                    <p className="empty-links">No links added yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Save/Cancel buttons */}
                    {isEditing && (
                        <div className="profile-actions">
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="btn btn-ghost"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Joined date - subtle at bottom */}
                    <div className="profile-footer">
                        <span className="joined-date">Joined {joinDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;