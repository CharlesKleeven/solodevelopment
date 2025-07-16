import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <div className="navbar-logo">SD</div>
                    <span className="navbar-title">SoloDevelopment</span>
                </Link>

                {/* Right Side - Navigation + Login */}
                <div className="navbar-right">
                    <div className="navbar-nav">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/jams"
                            className={`nav-link ${isActive('/jams') ? 'active' : ''}`}
                        >
                            Jams
                        </Link>
                        <Link
                            to="/showcase"
                            className={`nav-link ${isActive('/showcase') ? 'active' : ''}`}
                        >
                            Showcase
                        </Link>
                        <Link
                            to="/resources"
                            className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
                        >
                            Resources
                        </Link>
                    </div>

                    <div className="navbar-actions">
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <Link
                        to="/"
                        className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/jams"
                        className={`mobile-nav-link ${isActive('/jams') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Jams
                    </Link>
                    <Link
                        to="/showcase"
                        className={`mobile-nav-link ${isActive('/showcase') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Showcase
                    </Link>
                    <Link
                        to="/resources"
                        className={`mobile-nav-link ${isActive('/resources') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Resources
                    </Link>
                    <Link
                        to="/community"
                        className={`mobile-nav-link ${isActive('/community') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Community
                    </Link>
                    <Link
                        to="/login"
                        className="mobile-nav-link login-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;