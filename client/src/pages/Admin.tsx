import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import AdminJams from './AdminJams';
import AdminReportedGames from '../components/AdminReportedGames';
import AdminRedirects from './AdminRedirects';
import AdminStreamers from './AdminStreamers';
import './admin.css';

const Admin: React.FC = () => {
    const { user } = useAuth();

    if (!user || !user?.isAdmin) {
        return <div className="admin-page"><div className="container">Please log in as an admin.</div></div>;
    }

    return (
        <div className="admin-page">
            <Helmet>
                <title>Admin — Solo Development</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="container">
                <div className="admin-header">
                    <h1>Admin</h1>
                </div>

                <div className="admin-panel">
                    <AdminJams />
                    <AdminStreamers />
                    <AdminReportedGames />
                    <AdminRedirects />
                </div>
            </div>
        </div>
    );
};

export default Admin;
