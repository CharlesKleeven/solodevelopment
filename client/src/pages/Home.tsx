// Home.tsx
import React from 'react';
import './home.css';

const Home: React.FC = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome, Solo Dev</h1>
                    <p className="hero-subtitle">Join a community of solo developers building at their own pace.</p>

                    <div className="hero-buttons">
                        <a href="https://discord.gg/your-discord-link" className="btn btn-primary">Join Discord</a>
                        <a href="https://reddit.com/r/solodevelopment" className="btn btn-secondary">Browse Reddit</a>
                    </div>
                </div>
            </section>

            {/* What's Happening Now */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">What's happening now</h2>
                    <div className="happenings-grid">
                        <div className="card jam-card-highlight">
                            <p className="card-label"><span className="dot green"></span> Active Jam • 127 participants</p>
                            <h3>Winter Game Jam</h3>
                            <p>Theme: "Connections" — Create a game exploring different types of connections.</p>
                            <p className="highlight">4 days left!</p>
                            <div className="card-actions">
                                <button className="btn btn-jam">Join Jam</button>
                                <a href="/showcase" className="btn btn-ghost">View Submissions →</a>
                            </div>
                        </div>

                        <div className="card activity-card">
                            <div className="card-label right"><span className="dot purple"></span> Live updates</div>
                            <h3>Recent activity</h3>
                            <ul className="activity-feed">
                                <li><strong>ProYd</strong> released <a href="https://proyd.itch.io/hack-the-loop">Hack the Loop</a> <span className="time">2 hours ago</span></li>
                                <li><strong>drahmen</strong> submitted to Marathon Jam <span className="time">1 day ago</span></li>
                                <li><strong>NeatGames</strong> shared <a href="https://neatgames.itch.io/yestersol">YesterSol</a> <span className="time">3 days ago</span></li>
                            </ul>
                            <a href="/showcase" className="view-all">View all games →</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Games */}
            <section className="section featured-games-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Games</h2>
                        <a href="/showcase" className="btn btn-ghost btn-sm">See All</a>
                    </div>

                    <div className="games-grid">
                        {[
                            { title: "Hack the Loop", author: "ProYd", rating: "4.9", downloads: "1.2k" },
                            { title: "Guardian of the Grave", author: "drahmen", rating: "4.7", downloads: "890" },
                            { title: "YesterSol", author: "NeatGames", rating: "4.8", downloads: "1.5k" },
                            { title: "Track Master", author: "ensom_", rating: "4.6", downloads: "670" }
                        ].map((game, i) => (
                            <div className="game-card-compact" key={i}>
                                <div className="game-thumb">{game.title[0]}</div>
                                <div className="game-info">
                                    <h4>{game.title}</h4>
                                    <p>by {game.author}</p>
                                    <div className="game-stats">
                                        ★ {game.rating} • {game.downloads} plays
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore */}
            <section className="section explore-section">
                <div className="container">
                    <h2 className="section-title">Explore</h2>
                    <div className="quick-links">
                        <a href="/jams" className="quick-link">
                            <div>
                                <strong>Game Jams</strong>
                                <p>Join timed challenges and build games with the community</p>
                            </div>
                        </a>
                        <a href="/showcase" className="quick-link">
                            <div>
                                <strong>Showcase</strong>
                                <p>Browse winning games from past jams and get inspired</p>
                            </div>
                        </a>
                        <a href="/resources" className="quick-link">
                            <div>
                                <strong>Resources</strong>
                                <p>Community-curated guides, tools, and tips for solo devs</p>
                            </div>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;