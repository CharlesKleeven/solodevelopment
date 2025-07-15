import React from 'react';
import './home.css';

const Home: React.FC = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome, Solo Devs!</h1>
                    <p className="hero-subtitle">Join our vibrant community of independent game developers. Share, learn, and grow as we tackle the challenges of making games alone—together!</p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="live-dot"></span>
                            <span>Winter Jam happening now</span>
                        </div>
                        <span className="stat-separator">•</span>
                        <span>43 games submitted this week</span>
                        <span className="stat-separator">•</span>
                        <span>1,247 developers</span>
                    </div>
                </div>
            </section>

            {/* What's Happening Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">What's happening now</h2>
                        <div className="live-indicator">
                            <span className="live-dot"></span>
                            <span>Live updates</span>
                        </div>
                    </div>

                    <div className="layout-grid-2">
                        {/* Active Jam Card */}
                        <div className="card jam-active">
                            <div className="jam-header">
                                <span className="live-dot"></span>
                                <span className="badge badge-success">Active Jam</span>
                                <span className="jam-participants">• 127 participants</span>
                            </div>
                            <h3>Winter Game Jam</h3>
                            <p>
                                Theme: "Connections" - Create a game exploring different types of connections.{' '}
                                <span className="deadline-warning">4 days left!</span>
                            </p>
                            <div className="jam-actions">
                                <button className="btn btn-success btn-small">Join Jam</button>
                                <button className="btn btn-secondary btn-small">View Submissions →</button>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="card">
                            <h3>Recent activity</h3>
                            <div className="activity-feed">
                                <div className="activity-item">
                                    <div className="activity-avatar">S</div>
                                    <div className="activity-content">
                                        <p><strong>sarah_dev</strong> released <span className="activity-target">Pixel Garden</span></p>
                                        <span className="activity-time">2 minutes ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar">M</div>
                                    <div className="activity-content">
                                        <p><strong>mike_solo</strong> submitted to Winter Jam</p>
                                        <span className="activity-time">15 minutes ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar">A</div>
                                    <div className="activity-content">
                                        <p><strong>alex_makes</strong> shared a devlog update</p>
                                        <span className="activity-time">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-secondary btn-small">View all activity →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Games Section */}
            <section className="section featured-games">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured games</h2>
                        <button className="btn btn-secondary btn-small">View all →</button>
                    </div>

                    <div className="layout-grid-3">
                        <div className="game-card">
                            <div className="game-image gradient-1">
                                <div className="game-placeholder">E</div>
                            </div>
                            <h4>Echo Chambers</h4>
                            <p className="game-description">Platform puzzle with innovative sound mechanics</p>
                            <p className="game-author">by jenna_codes</p>
                            <div className="game-stats">
                                <span>★ 4.8</span>
                                <span>↓ 1.2k</span>
                            </div>
                        </div>

                        <div className="game-card">
                            <div className="game-image gradient-2">
                                <div className="game-placeholder">V</div>
                            </div>
                            <h4>Void Trader</h4>
                            <p className="game-description">Space trading simulation with roguelike elements</p>
                            <p className="game-author">by carlos_dev</p>
                            <div className="game-stats">
                                <span>★ 4.6</span>
                                <span>↓ 856</span>
                            </div>
                        </div>

                        <div className="game-card">
                            <div className="game-image gradient-3">
                                <div className="game-placeholder">G</div>
                            </div>
                            <h4>Garden Keeper</h4>
                            <p className="game-description">Relaxing farming game with seasonal cycles</p>
                            <p className="game-author">by emily_solo</p>
                            <div className="game-stats">
                                <span>★ 4.9</span>
                                <span>↓ 2.1k</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get Started Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title text-center">Get started</h2>

                    <div className="layout-grid-3">
                        <div className="card text-center">
                            <div className="card-icon">PLAY</div>
                            <h4>Share Your Game</h4>
                            <p>Upload your game, get feedback from the community, and showcase your work.</p>
                            <button className="btn btn-secondary btn-small">Get started →</button>
                        </div>

                        <div className="card text-center">
                            <div className="card-icon">BOLT</div>
                            <h4>Join a Game Jam</h4>
                            <p>Practice your skills in timed challenges with themes and community support.</p>
                            <button className="btn btn-secondary btn-small">View jams →</button>
                        </div>

                        <div className="card text-center">
                            <div className="card-icon">BOOK</div>
                            <h4>Learn & Grow</h4>
                            <p>Access guides, tools, and community knowledge to improve your game dev skills.</p>
                            <button className="btn btn-secondary btn-small">Browse resources →</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;