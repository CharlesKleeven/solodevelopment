import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './navbar.css';

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout, loading } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    // Since displayName is required, no fallback needed
    const getDisplayName = () => {
        return user?.displayName || '';
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <span className="navbar-title">SoloDevelopment</span>
                </Link>

                {/* Right Side - Navigation + Auth */}
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
                            to="/community"
                            className={`nav-link ${isActive('/community') ? 'active' : ''}`}
                        >
                            Community
                        </Link>
                    </div>

                    <div className="navbar-actions">
                        {loading ? (
                            <div className="auth-loading">...</div>
                        ) : user ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    className="user-button"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <span className="user-name">{getDisplayName()}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="user-dropdown">
                                        <Link
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/dashboard/games"
                                            className="dropdown-item"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Games
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="dropdown-item logout-btn"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                        )}
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
                        to="/community"
                        className={`mobile-nav-link ${isActive('/community') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Community
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {getDisplayName()}
                            </Link>
                            <Link
                                to="/dashboard/games"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                My Games
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="mobile-nav-link logout-mobile"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="mobile-nav-link login-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;