import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { getLinkInfo } from '../utils/linkUtils';
import './profile.css';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Current values
    const [bio, setBio] = useState('');
    const [links, setLinks] = useState<string[]>(['', '', '', '']);

    // Original values for canceling
    const [originalBio, setOriginalBio] = useState('');
    const [originalLinks, setOriginalLinks] = useState<string[]>(['', '', '', '']);

    // Load profile data
    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const response = await profileAPI.getProfile();
            const userData = response.user;

            setBio(userData.bio || '');

            // Pad links array to always have 4 slots
            const userLinks = userData.links || [];
            const paddedLinks = [...userLinks];
            while (paddedLinks.length < 4) {
                paddedLinks.push('');
            }
            setLinks(paddedLinks);

            // Set originals
            setOriginalBio(userData.bio || '');
            setOriginalLinks(paddedLinks);
        } catch (error: any) {
            console.error('Failed to load profile:', error);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Filter out empty links before saving
            const filteredLinks = links.filter(link => link.trim() !== '');

            await profileAPI.updateProfile({
                bio,
                links: filteredLinks,
            });

            // Update original values to current values
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
        setBio(originalBio);
        setLinks([...originalLinks]);
        setIsEditing(false);
        setError(null);
    };

    const startEditing = () => {
        // Store current values as originals when starting to edit
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

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-card">
                        <h1>Loading profile...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Get member since year - fallback to current year
    const memberSince = new Date().getFullYear();

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-card">
                    {/* Header */}
                    <div className="profile-header">
                        <div className="profile-info">
                            <h1 className="profile-name">{user.username}</h1>
                            <p className="profile-email">{user.email}</p>
                        </div>
                        <button
                            onClick={isEditing ? handleCancel : startEditing}
                            className="btn btn-secondary btn-sm"
                            disabled={isSaving}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="profile-error">
                            {error}
                        </div>
                    )}

                    {/* Bio Section */}
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
                            <p className="profile-bio">{bio || 'No bio yet.'}</p>
                        )}
                    </div>

                    {/* Links Section */}
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
                                {links.filter(link => link.trim() !== '').map((link, index) => {
                                    const linkInfo = getLinkInfo(link);
                                    return (
                                        <a
                                            key={index}
                                            href={linkInfo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-item"
                                        >
                                            {linkInfo.icon} {linkInfo.displayText}
                                        </a>
                                    );
                                })}
                                {links.filter(link => link.trim() !== '').length === 0 && (
                                    <p className="no-links">No links added yet.</p>
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

                    {/* Member Since */}
                    <div className="profile-section">
                        <div className="member-since">
                            Member since {memberSince}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;