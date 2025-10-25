import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './admin.css';

interface Streamer {
    _id: string;
    channel: string;
    title: string;
    isActive: boolean;
    order: number;
}

const AdminStreamers: React.FC = () => {
    const { user } = useAuth();
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        channel: '',
        title: '',
        order: 999
    });

    useEffect(() => {
        if (user?.isAdmin) {
            fetchStreamers();
        }
    }, [user]);

    const fetchStreamers = async () => {
        try {
            const response = await api.get('/api/streamers/all');
            setStreamers(response.data.streamers);
        } catch (error) {
            console.error('Error fetching streamers:', error);
            setMessage('Failed to load streamers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStreamer = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await api.post('/api/streamers/add', formData);
            setStreamers([...streamers, response.data.streamer]);
            setMessage('Streamer added successfully!');
            setFormData({ channel: '', title: '', order: 999 });
            setShowAddForm(false);
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleUpdateStreamer = async (id: string, updates: Partial<Streamer>) => {
        try {
            const response = await api.put(`/api/streamers/${id}`, updates);
            setStreamers(streamers.map(s =>
                s._id === id ? response.data.streamer : s
            ));
            setMessage('Streamer updated successfully!');
            setEditingStreamer(null);
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDeleteStreamer = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this streamer?')) {
            return;
        }

        try {
            await api.delete(`/api/streamers/${id}`);
            setStreamers(streamers.filter(s => s._id !== id));
            setMessage('Streamer deleted successfully!');
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };


    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/api/streamers/${id}`, { isActive: !currentStatus });
            setStreamers(streamers.map(s =>
                s._id === id ? { ...s, isActive: !currentStatus } : s
            ));
            setMessage(`Streamer ${!currentStatus ? 'activated' : 'deactivated'}!`);
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <div className="admin-section">Loading streamers...</div>;

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Featured Streamers</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add Streamer'}
                </button>
            </div>

            {message && (
                <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {showAddForm && (
                <form className="admin-form" onSubmit={handleAddStreamer}>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Twitch Channel (username)"
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Display Name"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Order"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            min="0"
                        />
                        <button type="submit" className="btn btn-success">
                            Add Streamer
                        </button>
                    </div>
                </form>
            )}

            <div className="streamers-list">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Channel</th>
                            <th>Display Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streamers.sort((a, b) => a.order - b.order).map(streamer => (
                            <tr key={streamer._id}>
                                <td>
                                    {editingStreamer?._id === streamer._id ? (
                                        <input
                                            type="number"
                                            value={editingStreamer.order}
                                            onChange={(e) => setEditingStreamer({
                                                ...editingStreamer,
                                                order: parseInt(e.target.value)
                                            })}
                                            onBlur={() => {
                                                handleUpdateStreamer(streamer._id, { order: editingStreamer.order });
                                            }}
                                            className="inline-edit"
                                            min="0"
                                        />
                                    ) : (
                                        <span
                                            onClick={() => setEditingStreamer(streamer)}
                                            className="editable"
                                        >
                                            {streamer.order}
                                        </span>
                                    )}
                                </td>
                                <td className="monospace">{streamer.channel}</td>
                                <td>
                                    {editingStreamer?._id === streamer._id ? (
                                        <input
                                            type="text"
                                            value={editingStreamer.title}
                                            onChange={(e) => setEditingStreamer({
                                                ...editingStreamer,
                                                title: e.target.value
                                            })}
                                            onBlur={() => {
                                                handleUpdateStreamer(streamer._id, { title: editingStreamer.title });
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleUpdateStreamer(streamer._id, { title: editingStreamer.title });
                                                }
                                            }}
                                            className="inline-edit"
                                        />
                                    ) : (
                                        <span
                                            onClick={() => setEditingStreamer(streamer)}
                                            className="editable"
                                        >
                                            {streamer.title}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className={`status-badge ${streamer.isActive ? 'active' : 'inactive'}`}
                                        onClick={() => toggleActive(streamer._id, streamer.isActive)}
                                    >
                                        {streamer.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn-small btn-danger"
                                        onClick={() => handleDeleteStreamer(streamer._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {streamers.length === 0 && (
                    <p className="no-data">No streamers added yet. Click "Add Streamer" to get started!</p>
                )}
            </div>

            <div className="admin-note">
                <p><strong>Note:</strong> Streamers will appear on the /streams page in order (lowest numbers first).
                Click on order numbers or display names to edit them inline.</p>
            </div>
        </div>
    );
};

export default AdminStreamers;