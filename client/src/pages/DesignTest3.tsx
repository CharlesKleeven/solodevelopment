import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { gameData } from '../data/gameData';
import { useJam } from '../hooks/useJam';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import './design-test3.css';

const DesignTest3: React.FC = () => {
    const { user } = useAuth();
    const { jamData, loading: jamLoading } = useJam();
    useFadeInOnScroll();


    return (
        <div className="dt3-page">
            <Helmet>
                <title>Solo Development — A Community for Solo Game Developers</title>
                <meta name="description" content="Join a community of indie game developers. Game jams with cash prizes, a showcase for your work, and people who actually play your games." />
            </Helmet>
            <div className="dt3-main">
                {/* Hero with scrolling game tiles behind */}
                <section className="dt3-hero" data-fade data-delay="1">
                    <div className="dt3-hero-bg">
                        <div className="dt3-hero-marquee dt3-hero-row1">
                            {[...gameData, ...gameData].map((game, i) => (
                                <div key={`hbg1-${i}`} className="dt3-hero-bg-tile">
                                    {game.image ? <img src={game.image} alt="" loading="lazy" /> : <span>{game.thumb}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="dt3-hero-content">
                        <div className="dt3-container-narrow">
                            <h1 className="dt3-hero-title">
                                {user ? (
                                    <>Welcome back, <span className="dt3-accent">{user.displayName}</span></>
                                ) : (
                                    <>Welcome to <span className="dt3-accent">Solo Development</span></>
                                )}
                            </h1>
                            <p className="dt3-hero-subtitle">
                                {user
                                    ? "Glad to see you here"
                                    : "Our corner of the internet for solo game devs building at their own pace."
                                }
                            </p>
                            <div className="dt3-hero-buttons">
                                <a href="https://discord.gg/uXeapAkAra" className="dt3-btn dt3-btn-primary" target="_blank" rel="noopener noreferrer nofollow">Join Discord</a>
                                <a href="https://reddit.com/r/solodevelopment" className="dt3-btn dt3-btn-secondary" target="_blank" rel="noopener noreferrer nofollow">Browse Reddit</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Jam & Community — order swaps based on jam status */}
                {(() => {
                    const jamEnded = !jamLoading && (!jamData || jamData.status === 'ended');

                    const jamSection = (
                        <section className="dt3-jam-section" data-fade data-delay={jamEnded ? "3" : "2"} key="jam">
                            <div className="dt3-container">
                                <div className="dt3-jam-banner">
                                    {jamLoading ? (
                                        <div className="dt3-jam-info">
                                            <div className="dt3-jam-badge">Loading...</div>
                                            <h2 className="dt3-jam-title">Loading jam data...</h2>
                                        </div>
                                    ) : jamData ? (
                                        <>
                                            <div className="dt3-jam-info">
                                                <div className="dt3-jam-meta">
                                                    <div className={`dt3-jam-badge ${jamData.status}`}>
                                                        {jamData.status === 'upcoming' ? 'Upcoming' : jamData.status === 'active' ? 'Active' : 'Ended'}
                                                    </div>
                                                    {jamData.isVotingOpen && <span className="dt3-voting">• Theme voting open</span>}
                                                </div>
                                                <h2 className="dt3-jam-title">{jamData.title}{jamData.theme !== 'TBD' ? `: "${jamData.theme}"` : ''}</h2>
                                                <p className="dt3-jam-desc">{jamData.description} • {jamData.timeLeft}</p>
                                            </div>
                                            <div className="dt3-jam-cta">
                                                {jamData.isVotingOpen ? (
                                                    <a href="/jams" className="dt3-btn dt3-btn-secondary">Vote on Themes</a>
                                                ) : jamData.status === 'ended' ? (
                                                    <>
                                                        <a href={jamData.url} target="_blank" rel="noopener noreferrer nofollow" className="dt3-btn dt3-btn-secondary">View Results</a>
                                                        <a href="https://forms.gle/gpvm9AZaft4uK7oYA" target="_blank" rel="noopener noreferrer nofollow" className="dt3-btn dt3-btn-secondary">Suggest Themes</a>
                                                    </>
                                                ) : (
                                                    <a href={jamData.url} target="_blank" rel="noopener noreferrer nofollow" className="dt3-btn dt3-btn-secondary">
                                                        {jamData.status === 'upcoming' ? 'Learn More' : 'Join Now'}
                                                    </a>
                                                )}
                                                <span className="dt3-jam-stats">{jamData.participants} joined</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="dt3-jam-info">
                                            <div className="dt3-jam-badge upcoming">Upcoming</div>
                                            <h2 className="dt3-jam-title">Summer Jam: TBD</h2>
                                            <p className="dt3-jam-desc">3-day jam with theme to be announced</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    );

                    // Group games by jam, newest first
                    const grouped: { [key: string]: typeof gameData } = {};
                    gameData.forEach(game => {
                        if (!grouped[game.jamName]) grouped[game.jamName] = [];
                        grouped[game.jamName].push(game);
                    });
                    const jamEntries = Object.entries(grouped).reverse().slice(0, 3);

                    const communitySection = (
                        <section className="dt3-games-section" data-fade data-delay={jamEnded ? "2" : "3"} key="community">
                            <div className="dt3-container">
                                <div className="dt3-section-header">
                                    <div className="dt3-section-label">// from the community</div>
                                </div>
                                {jamEntries.map(([jamName, games]) => (
                                    <div key={jamName} className="dt3-jam-group">
                                        <div className="dt3-jam-tiles">
                                            {games.map((game, i) => (
                                                <a
                                                    key={game.id}
                                                    href={game.url}
                                                    className={`dt3-jam-tile ${i === 0 ? 'dt3-jam-tile-first' : ''}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer nofollow"
                                                >
                                                    <div className="dt3-tile-img">
                                                        {game.image ? (
                                                            <img src={game.image} alt={game.title} loading="lazy" />
                                                        ) : (
                                                            <span>{game.thumb}</span>
                                                        )}
                                                    </div>
                                                    <div className="dt3-tile-overlay">
                                                        <span className="dt3-tile-place">{games.length === 1 ? 'Winner' : i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}</span>
                                                        <span className="dt3-tile-title">{game.title}</span>
                                                        <span className="dt3-tile-author">{game.author}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="dt3-see-more">
                                    <a href="/showcase" className="dt3-btn-ghost">See More</a>
                                </div>
                            </div>
                        </section>
                    );

                    // No jam data at all — just show community
                    if (!jamData && !jamLoading) {
                        return [communitySection];
                    }
                    // Active/upcoming jam goes above community, ended goes below
                    const jamIsLive = jamData && (jamData.status === 'active' || jamData.status === 'upcoming');
                    if (jamIsLive) {
                        return [jamSection, communitySection];
                    }
                    return [communitySection, jamSection];
                })()}

                {/* Explore */}
                <section className="dt3-explore" data-fade data-delay="5">
                    <div className="dt3-container">
                        <div className="dt3-section-label">// explore</div>
                        <div className="dt3-explore-links">
                            <a href="/jams">Game Jams</a>
                            <span className="dt3-explore-sep">/</span>
                            <a href="/showcase">Showcase</a>
                            <span className="dt3-explore-sep">/</span>
                            <a href="/streams">Streams</a>
                            <span className="dt3-explore-sep">/</span>
                            <a href="/resources">Resources</a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DesignTest3;
