import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameData } from '../data/gameData';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import './home.css';

const Home: React.FC = () => {
    const { user } = useAuth();
    useFadeInOnScroll();

    // Shuffle function
    const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // State for displayed games
    const [displayedGames, setDisplayedGames] = useState(() =>
        shuffleArray(gameData).slice(0, 4)
    );
    const [isShuffling, setIsShuffling] = useState(false);

    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => {
            setDisplayedGames(shuffleArray(gameData).slice(0, 4));
            setIsShuffling(false);
        }, 150); // Small delay for fade out
    };

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="home-hero" data-fade data-delay="1">
                <div className="container-narrow">
                    <h1 className="hero-title">
                        {user ? `Welcome, ${user.username}` : 'Welcome, Solo Developer'}
                    </h1>
                    <p className="hero-subtitle">
                        A quiet space for devs building projects at their own pace.
                    </p>
                    <div className="home-buttons">
                        <a href="https://discord.gg/uXeapAkAra" className="btn btn-primary">Join Discord</a>
                        <a href="https://reddit.com/r/solodevelopment" className="btn btn-secondary">Browse Reddit</a>
                    </div>
                </div>
            </section>

            {/* Current Jam - Simple Highlight */}
            <section className="current-jam-section" data-fade data-delay="2">
                <div className="container">
                    <div className="current-jam-banner">
                        <div className="jam-info">
                            <div className="jam-badge">Active Jam</div>
                            <h2 className="jam-title">Winter Jam: "Connections"</h2>
                            <p className="jam-description">72-hour sprint exploring how things relate • 4 days left</p>
                        </div>
                        <div className="jam-cta">
                            <a href="/jams" className="btn btn-secondary">Join Now</a>
                            <span className="jam-stats">127 joined</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Games - Simple Grid */}
            <section className="featured-section" data-fade data-delay="3">
                <div className="container">
                    <div className="section-header-inline">
                        <div className="section-label">// from the community</div>
                        <div className="section-actions">
                            <button onClick={handleShuffle} className="btn btn-ghost btn-sm shuffle-btn">
                                Shuffle
                            </button>
                            <a href="/showcase" className="btn btn-ghost btn-sm">See More</a>
                        </div>
                    </div>
                    <div className={`featured-grid ${isShuffling ? 'shuffling' : ''}`}>
                        {displayedGames.map((game, index) => (
                            <a
                                href={game.url}
                                key={`${game.id}-${index}`} // Include index to help with re-renders
                                className="featured-game"
                            >
                                <div className="game-thumb-large">
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
                                <div className="game-info-clean">
                                    <div className="game-title-clean">{game.title}</div>
                                    <div className="game-author-clean">{game.author}</div>
                                    <div className="game-jam-clean">{game.jamName}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mini Explore Section */}
            <section className="mini-explore-section" data-fade data-delay="8">
                <div className="container">
                    <div className="section-label">// explore</div>
                </div>
            </section>

            {/* Navigation Links */}
            <section className="navigation-section" data-fade data-delay="9">
                <div className="container">
                    <div className="nav-grid">
                        <a href="/jams" className="nav-link-card" data-fade data-delay="10">
                            <h3>Game Jams</h3>
                            <p>Join timed challenges and build with the community</p>
                        </a>
                        <a href="/showcase" className="nav-link-card" data-fade data-delay="11">
                            <h3>Showcase</h3>
                            <p>Browse games and winners from past jams</p>
                        </a>
                        <a href="/resources" className="nav-link-card" data-fade data-delay="12">
                            <h3>Resources</h3>
                            <p>Tools, guides, and workflows for solo developers</p>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;