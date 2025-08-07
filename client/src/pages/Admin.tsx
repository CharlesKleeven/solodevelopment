import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminJams from './AdminJams';
import AdminReportedGames from '../components/AdminReportedGames';
import './admin.css';

const Admin: React.FC = () => {
    const { user } = useAuth();
    if (!user || !user?.isAdmin) {
        return <div className="admin-page">Please log in as an admin.</div>;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                </div>

                <div className="admin-content">
                    <AdminReportedGames />
                    <AdminJams />
                </div>
            </div>
        </div>
    );
};

export default Admin;