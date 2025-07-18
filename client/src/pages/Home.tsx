import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameData } from '../data/gameData';
import { useJam } from '../hooks/useJam'; // Add this import
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import './home.css';

const Home: React.FC = () => {
    const { user } = useAuth();
    const { jamData, loading: jamLoading } = useJam(); // Add this
    useFadeInOnScroll();

    // Weighted random selection - newer games have higher probability
    const getRandomWeightedGames = (games: any[], count: number) => {
        const selected = [];
        const availableGames = [...games];
        
        for (let i = 0; i < count && availableGames.length > 0; i++) {
            // Create weights: games at the end (newer) have higher weights
            const weights = availableGames.map((_, index) => {
                const originalIndex = games.findIndex(g => g.id === availableGames[index].id);
                // Newer games (higher index/ID) get higher weight
                const weight = Math.max(1, originalIndex + 1);
                return weight * 1.5; // Boost factor for newer games
            });
            
            // Calculate total weight
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            
            // Random selection based on weights
            let random = Math.random() * totalWeight;
            let selectedIndex = 0;
            
            for (let j = 0; j < weights.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    selectedIndex = j;
                    break;
                }
            }
            
            selected.push(availableGames[selectedIndex]);
            availableGames.splice(selectedIndex, 1);
        }
        
        return selected;
    };

    // State for displayed games
    const [displayedGames, setDisplayedGames] = useState(() =>
        getRandomWeightedGames(gameData, 4)
    );
    const [isShuffling, setIsShuffling] = useState(false);

    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => {
            setDisplayedGames(getRandomWeightedGames(gameData, 4));
            setIsShuffling(false);
        }, 150); // Small delay for fade out
    };

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="home-hero" data-fade data-delay="1">
                <div className="container-narrow">
                    <h1 className="hero-title">
                        {user ? `Welcome, ${user.displayName}` : 'Welcome, Solo Developer'}
                    </h1>
                    <p className="hero-subtitle">
                        A quiet space for devs building projects at their own pace.
                    </p>
                    <div className="home-buttons">
                        <a href="https://discord.gg/uXeapAkAra" className="btn btn-primary" target="_blank" rel="noreferrer">Join Discord</a>
                        <a href="https://reddit.com/r/solodevelopment" className="btn btn-secondary" target="_blank" rel="noreferrer">Browse Reddit</a>
                    </div>
                </div>
            </section>

            {/* Current Jam - Dynamic Data */}
            <section className="current-jam-section" data-fade data-delay="2">
                <div className="container">
                    <div className="current-jam-banner">
                        {jamLoading ? (
                            <div className="jam-info">
                                <div className="jam-badge">Loading...</div>
                                <h2 className="jam-title">Loading jam data...</h2>
                            </div>
                        ) : jamData ? (
                            <>
                                <div className="jam-info">
                                    <div className={`jam-badge ${jamData.status}`}>
                                        {jamData.status === 'upcoming' ? 'Upcoming' :
                                            jamData.status === 'active' ? 'Active' : 'Ended'}
                                    </div>
                                    <h2 className="jam-title">
                                        {jamData.title}{jamData.theme !== 'TBD' ? `: "${jamData.theme}"` : `: ${jamData.theme}`}
                                    </h2>
                                    <p className="jam-description">{jamData.description} • {jamData.timeLeft}</p>
                                </div>
                                <div className="jam-cta">
                                    <a href={jamData.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                        {jamData.status === 'upcoming' ? 'Learn More' :
                                            jamData.status === 'active' ? 'Join Now' : 'View Results'}
                                    </a>
                                    <span className="jam-stats">{jamData.participants} joined</span>
                                </div>
                            </>
                        ) : (
                            <div className="jam-info">
                                <div className="jam-badge upcoming">Upcoming</div>
                                <h2 className="jam-title">Summer Jam: TBD</h2>
                                <p className="jam-description">3-day jam with theme to be announced</p>
                            </div>
                        )}
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
                                key={`${game.id}-${index}`}
                                className="featured-game"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <div className="game-thumb-large">
                                    {game.image ? (
                                        <img
                                            src={game.image}
                                            alt={game.title}
                                            onError={(e) => {
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