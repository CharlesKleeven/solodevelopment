// Home.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { featuredGames } from '../data/gameData';
import './home.css';

const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        {user ? `Welcome back, ${user.username}` : 'Welcome, Solo Dev'}
                    </h1>
                    <p className="hero-subtitle">
                        {user
                            ? 'Ready to continue your solo dev journey? Check out what\'s happening in the community.'
                            : 'Join a community of solo developers building at their own pace.'
                        }
                    </p>

                    {!user && (
                        <div className="hero-buttons">
                            <a href="https://discord.gg/your-discord-link" className="btn btn-primary">Join Discord</a>
                            <a href="https://reddit.com/r/solodevelopment" className="btn btn-secondary">Browse Reddit</a>
                        </div>
                    )}
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
                                {user ? (
                                    <button className="btn btn-jam">Join Jam</button>
                                ) : (
                                    <a href="/login" className="btn btn-jam">Login to Join</a>
                                )}
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
                                {user && (
                                    <li><strong>{user.username}</strong> joined the community! <span className="time">Welcome!</span></li>
                                )}
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
                        {featuredGames.map((game) => (
                            <a
                                href={game.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="game-card-compact"
                                key={game.id}
                            >
                                <div className="featured-thumb">
                                    {game.image ? (
                                        <img
                                            src={game.image}
                                            alt={game.title}
                                            onError={(e) => {
                                                // Fallback to letter if image fails to load
                                                const target = e.currentTarget;
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    target.style.display = 'none';
                                                    parent.classList.add('no-image');
                                                    parent.textContent = game.thumb;
                                                }
                                            }}
                                        />
                                    ) : (
                                        game.thumb
                                    )}
                                </div>
                                <div className="game-info">
                                    <h4>{game.title}</h4>
                                    <p>by {game.author}</p>
                                    <div className="game-stats">
                                        ★ 4.8 • View on itch.io
                                    </div>
                                </div>
                            </a>
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

            {/* Welcome Message for New Users */}
            {user && (
                <section className="section">
                    <div className="container">
                        <div className="card">
                            <h3>Welcome to the community, {user.username}!</h3>
                            <p>You're now part of a growing community of solo developers. Here are some ways to get started:</p>
                            <div className="card-actions">
                                <a href="/jams" className="btn btn-primary">Join a Game Jam</a>
                                <a href="/showcase" className="btn btn-secondary">Browse Games</a>
                                <a href="https://discord.gg/your-discord-link" className="btn btn-ghost">Join Discord</a>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;