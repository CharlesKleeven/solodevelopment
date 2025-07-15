import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-brand">
                    <div className="header-logo">SD</div>
                    <h1 className="header-title">SoloDevelopment</h1>
                </Link>

                <nav className="header-nav">
                    <ul className="header-nav-links">
                        <li><Link to="/jams" className="header-nav-link">Jams</Link></li>
                        <li><Link to="/showcase" className="header-nav-link">Showcase</Link></li>
                        <li><Link to="/resources" className="header-nav-link">Resources</Link></li>
                        <li><Link to="/community" className="header-nav-link">Community</Link></li>
                    </ul>
                    <div className="header-actions">
                        <Link to="/login" className="header-nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;