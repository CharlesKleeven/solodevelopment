import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { redirectAPI } from '../services/api';
import './admin.css';

interface Redirect {
    _id: string;
    slug: string;
    destination: string;
    description?: string;
    clickCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const AdminRedirects: React.FC = () => {
    const { user } = useAuth();
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        slug: '',
        destination: '',
        description: ''
    });

    useEffect(() => {
        if (user?.isAdmin) {
            fetchRedirects();
        }
    }, [user]);

    const fetchRedirects = async () => {
        try {
            const response = await redirectAPI.getAllRedirects();
            setRedirects(response.data.redirects);
        } catch (error) {
            console.error('Error fetching redirects:', error);
            setMessage('Error: Failed to fetch redirects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            if (editingSlug) {
                await redirectAPI.updateRedirect(editingSlug, {
                    destination: formData.destination,
                    description: formData.description
                });
                setMessage('Redirect updated successfully!');
            } else {
                await redirectAPI.createRedirect(formData);
                setMessage('Redirect created successfully!');
            }

            fetchRedirects();
            resetForm();
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(`Are you sure you want to delete /${slug}?`)) {
            return;
        }

        try {
            await redirectAPI.deleteRedirect(slug);
            setMessage('Redirect deleted successfully!');
            fetchRedirects();
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleToggle = async (redirect: Redirect) => {
        try {
            await redirectAPI.updateRedirect(redirect.slug, {
                isActive: !redirect.isActive
            });
            fetchRedirects();
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEdit = (redirect: Redirect) => {
        setFormData({
            slug: redirect.slug,
            destination: redirect.destination,
            description: redirect.description || ''
        });
        setEditingSlug(redirect.slug);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            slug: '',
            destination: '',
            description: ''
        });
        setEditingSlug(null);
        setShowForm(false);
    };

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(url);
        setMessage(`Copied: ${url}`);
        setTimeout(() => setMessage(''), 2000);
    };

    if (!user?.isAdmin) {
        return <div className="admin-page">Please log in as an admin.</div>;
    }

    if (loading) {
        return <div className="admin-page">Loading...</div>;
    }

    return (
        <div className="admin-redirects">
            <h2>Redirect Management</h2>

            {message && (
                <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="admin-actions">
                <button
                    className="btn btn-secondary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Add Redirect'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="redirect-form">
                    <h3>{editingSlug ? 'Edit Redirect' : 'Create New Redirect'}</h3>

                    <div className="form-group">
                        <label>Slug (URL path):</label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">{window.location.origin}/</span>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                placeholder="jam"
                                pattern="[a-z0-9-]+"
                                required
                                disabled={!!editingSlug}
                            />
                        </div>
                        <small>Only lowercase letters, numbers, and hyphens allowed</small>
                    </div>

                    <div className="form-group">
                        <label>Destination URL:</label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="https://itch.io/jam/solodevelopment-halloween"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (optional):</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Current game jam"
                            maxLength={200}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editingSlug ? 'Update' : 'Create'} Redirect
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="redirects-table">
                <h3>Active Redirects ({redirects.length})</h3>
                {redirects.length === 0 ? (
                    <p>No redirects created yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Slug</th>
                                <th>Destination</th>
                                <th>Description</th>
                                <th>Clicks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redirects.map((redirect) => (
                                <tr key={redirect._id}>
                                    <td>
                                        <code>/{redirect.slug}</code>
                                        <button
                                            className="btn-icon"
                                            onClick={() => copyToClipboard(redirect.slug)}
                                            title="Copy URL"
                                        >
                                            📋
                                        </button>
                                    </td>
                                    <td className="destination-cell">
                                        <a href={redirect.destination} target="_blank" rel="noopener noreferrer">
                                            {redirect.destination.length > 50
                                                ? redirect.destination.substring(0, 50) + '...'
                                                : redirect.destination}
                                        </a>
                                    </td>
                                    <td>{redirect.description || '-'}</td>
                                    <td className="text-center">{redirect.clickCount}</td>
                                    <td>
                                        <button
                                            className={`status-toggle ${redirect.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggle(redirect)}
                                        >
                                            {redirect.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleEdit(redirect)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(redirect.slug)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminRedirects;