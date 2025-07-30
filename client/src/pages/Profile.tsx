import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { getLinkInfo, isAllowedPlatform } from '../utils/linkUtils';
import './profile.css';

const Profile: React.FC = () => {
    const { user, refreshUser, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Current values
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
    const [links, setLinks] = useState<string[]>(['', '', '', '']);
    const [linkErrors, setLinkErrors] = useState<string[]>(['', '', '', '']);

    // Original values for canceling
    const [originalDisplayName, setOriginalDisplayName] = useState('');
    const [originalBio, setOriginalBio] = useState('');
    const [originalProfileVisibility, setOriginalProfileVisibility] = useState<'public' | 'private'>('public');
    const [originalLinks, setOriginalLinks] = useState<string[]>(['', '', '', '']);

    // Initialize profile data from user context
    useEffect(() => {
        if (user) {
            const userDisplayName = user.displayName; // No fallback needed since it's required
            const userBio = user.bio || '';
            const userProfileVisibility = (user as any).profileVisibility || 'public';

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
            setProfileVisibility(userProfileVisibility);
            setLinks(paddedLinks);

            // Set originals
            setOriginalDisplayName(userDisplayName);
            setOriginalBio(userBio);
            setOriginalProfileVisibility(userProfileVisibility);
            setOriginalLinks(paddedLinks);
        }
    }, [user]);

    const handleSave = async () => {
        // Check if there are any link errors
        if (linkErrors.some(error => error !== '')) {
            setError('Please fix the link errors before saving');
            return;
        }
        
        setIsSaving(true);
        setError(null);

        try {
            // Filter out empty links before saving
            const filteredLinks = links.filter(link => link.trim() !== '');

            await profileAPI.updateProfile({
                displayName: displayName.trim(),
                bio: bio.trim(),
                profileVisibility,
                links: filteredLinks,
            });

            // Refresh user data in context - this updates navbar immediately!
            await refreshUser();

            // Update original values to current values
            setOriginalDisplayName(displayName);
            setOriginalBio(bio);
            setOriginalProfileVisibility(profileVisibility);
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
        setProfileVisibility(originalProfileVisibility);
        setLinks([...originalLinks]);
        setIsEditing(false);
        setError(null);
        setLinkErrors(['', '', '', '']);
    };

    const startEditing = () => {
        // Store current values as originals when starting to edit
        setOriginalDisplayName(displayName);
        setOriginalBio(bio);
        setOriginalProfileVisibility(profileVisibility);
        setOriginalLinks([...links]);
        setIsEditing(true);
        setError(null);
    };

    const updateLink = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
        
        // Validate the link
        const newErrors = [...linkErrors];
        if (value.trim() === '') {
            newErrors[index] = '';
        } else if (!isAllowedPlatform(value)) {
            newErrors[index] = 'Only verified social media and portfolio platforms are allowed';
        } else {
            newErrors[index] = '';
        }
        setLinkErrors(newErrors);
    };


    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-card">
                        <h1>Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

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
            <Helmet>
                <title>My Profile - SoloDevelopment</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
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

                    {/* Privacy Section - Only when editing */}
                    {isEditing && (
                        <div className="profile-section">
                            <h3>Privacy</h3>
                            <div className="privacy-dropdown-container">
                                <select
                                    value={profileVisibility}
                                    onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'private')}
                                    className="privacy-dropdown"
                                    disabled={isSaving}
                                >
                                    <option value="public">Public - Discoverable in search and featured</option>
                                    <option value="private">Private - Hidden from search (accessible via link)</option>
                                </select>
                                <p className="privacy-note">
                                    {profileVisibility === 'public' 
                                        ? 'Public profiles can be featured on the homepage and appear in community search.'
                                        : 'Private profiles work like YouTube unlisted - hidden from search but accessible via direct link.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Links Section - Always show */}
                    <div className="profile-section">
                        <h3>Links</h3>
                        {isEditing ? (
                            <div className="links-edit">
                                {links.map((link, index) => (
                                    <div key={index} className="link-input-wrapper">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateLink(index, e.target.value)}
                                            placeholder={`Link ${index + 1} (optional)`}
                                            className={`link-input ${linkErrors[index] ? 'link-input-error' : ''}`}
                                            disabled={isSaving}
                                        />
                                        {linkErrors[index] && (
                                            <span className="link-error-message">{linkErrors[index]}</span>
                                        )}
                                    </div>
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
                                                rel="noopener noreferrer nofollow"
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