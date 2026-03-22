import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { gameData } from '../data/gameData';
import { gameAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './showcase.css';
import './community.css';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

interface CommunityGame {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    tags?: string[];
    engine?: string;
    platforms?: string[];
    playUrl?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        _id: string;
        username: string;
        displayName: string;
    };
}

interface GamesResponse {
    games: CommunityGame[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const ENGINES = [
    { value: '', label: 'All Engines' },
    { value: 'unity', label: 'Unity' },
    { value: 'unreal', label: 'Unreal' },
    { value: 'godot', label: 'Godot' },
    { value: 'gamemaker', label: 'GameMaker' },
    { value: 'construct', label: 'Construct' },
    { value: 'phaser', label: 'Phaser' },
    { value: 'love2d', label: 'Love2D' },
    { value: 'pygame', label: 'Pygame' },
    { value: 'custom', label: 'Custom' },
    { value: 'other', label: 'Other' }
];

const TAGS = [
    { value: '', label: 'All Genres' },
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'puzzle', label: 'Puzzle' },
    { value: 'platformer', label: 'Platformer' },
    { value: 'rpg', label: 'RPG' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'arcade', label: 'Arcade' },
    { value: '2d', label: '2D' },
    { value: '3d', label: '3D' },
    { value: 'pixel-art', label: 'Pixel Art' },
    { value: 'jam-game', label: 'Jam Game' }
];

const Showcase: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Community games state
  const [communityGames, setCommunityGames] = useState<CommunityGame[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortOption, setSortOption] = useState<'newest' | 'random' | 'updated'>('newest');
  const [communitySearch, setCommunitySearch] = useState<string>('');
  const [reportingGame, setReportingGame] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
      page: 1, limit: 12, total: 0, pages: 0
  });

  useFadeInOnScroll([searchTerm, activeTab, communityGames, communityLoading]);

  // Load community games
  useEffect(() => {
      const delaySearch = setTimeout(() => {
          loadCommunityGames(1);
      }, communitySearch ? 300 : 0);
      return () => clearTimeout(delaySearch);
  }, [selectedEngine, selectedTag, sortOption, communitySearch]);

  const loadCommunityGames = async (page: number) => {
      try {
          setCommunityLoading(true);
          setCommunityError(null);
          const params = {
              page, limit: 12, sort: sortOption,
              ...(selectedEngine && { engine: selectedEngine }),
              ...(selectedTag && { tag: selectedTag }),
              ...(communitySearch.trim() && { search: communitySearch.trim() })
          };
          const response: GamesResponse = await gameAPI.getCommunityGames(params);
          const games = response?.games || [];
          if (page === 1) {
              setCommunityGames(games);
          } else {
              setCommunityGames(prev => [...prev, ...games]);
          }
          setPagination(response?.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      } catch (error) {
          console.error('Failed to load games:', error);
          setCommunityError('Failed to load games.');
      } finally {
          setCommunityLoading(false);
      }
  };

  const handleReportGame = async (gameId: string) => {
      if (!user) { alert('Please log in to report content'); return; }
      if (!gameId) return;
      if (!window.confirm('Are you sure you want to report this content for inappropriate material?')) return;
      try {
          setReportingGame(gameId);
          await gameAPI.reportGame(gameId);
          alert('Thank you for your report. We will review this content.');
      } catch (error: any) {
          alert(error.response?.data?.error || 'Failed to report game');
      } finally {
          setReportingGame(null);
      }
  };

  // Showcase filtering
  const filterGames = (games: typeof gameData, term: string, tab: string) => {
    let filtered = games;
    if (tab !== 'all') {
      filtered = filtered.filter(game => game.jamType === tab);
    }
    if (term) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(term.toLowerCase()) ||
        game.author.toLowerCase().includes(term.toLowerCase()) ||
        game.jamName.toLowerCase().includes(term.toLowerCase())
      );
    }
    return filtered;
  };

  const groupGamesByJam = (games: typeof gameData) => {
    // Preserve insertion order but reverse so newest jams come first
    const grouped: { [key: string]: typeof gameData } = {};
    games.forEach(game => {
      if (!grouped[game.jamName]) {
        grouped[game.jamName] = [];
      }
      grouped[game.jamName].push(game);
    });
    // Reverse the entries so newest (last added) jams appear first
    const entries = Object.entries(grouped);
    entries.reverse();
    return Object.fromEntries(entries);
  };

  const filteredGames = filterGames(gameData, searchTerm, activeTab);
  const groupedGames = groupGamesByJam(filteredGames);

  const CommunityGameCard: React.FC<{ game: CommunityGame }> = ({ game }) => {
      const [expanded, setExpanded] = useState(false);
      const isOwner = user && user.id === game.user._id;

      return (
      <div className="community-game-card">
          {game.thumbnailUrl && (
              <div className="game-thumbnail">
                  <img src={game.thumbnailUrl} alt={game.title} />
              </div>
          )}
          <div className="game-info">
              <div className="game-header">
                  <h3 className="game-title">{game.title}</h3>
                  {user && !isOwner && (
                      <button
                          className="report-flag-btn"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleReportGame(game._id); }}
                          disabled={reportingGame === game._id}
                          title="Report inappropriate content"
                          aria-label="Report game"
                          type="button"
                      >
                          <span className="flag-icon">&#9873;</span>
                      </button>
                  )}
              </div>
              <p className="game-developer">
                  by <Link to={`/users/${game.user.username}`} className="developer-link">
                      {game.user.displayName}
                  </Link>
              </p>
              {game.description && (
                  <div className="game-description-wrapper">
                      <p className={`game-description ${expanded ? 'expanded' : ''}`}>{game.description}</p>
                      {game.description.length > 120 && (
                          <button type="button" className="show-more-btn" onClick={() => setExpanded(!expanded)}>
                              {expanded ? 'Show less' : 'Show more'}
                          </button>
                      )}
                  </div>
              )}
              {game.tags && game.tags.length > 0 && (
                  <div className="game-tags">
                      {game.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="game-tag">{tag}</span>
                      ))}
                  </div>
              )}
              <div className="game-actions">
                  {game.playUrl ? (
                      <a href={game.playUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-primary">View Game</a>
                  ) : (
                      <div className="coming-soon-badge"><span>In Development</span></div>
                  )}
              </div>
          </div>
      </div>
      );
  };

  return (
    <div className="showcase-page">
      <Helmet>
        <title>Showcase — Solo Development</title>
        <meta name="description" content="Browse winning games and community submissions from Solo Development game jams." />
      </Helmet>
      {/* Showcase Header */}
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Showcase</h1>
          <p>Winning entries from community jams and games from our members</p>
        </div>
      </section>

      {/* Jam Winners */}
      <section className="section-compact" data-fade data-delay="2">
        <div className="container showcase-controls">
          <div className="showcase-tabs">
            {[
              { key: 'all', label: 'All' },
              { key: 'themed', label: 'Themed' },
              { key: 'marathon', label: 'Marathon' }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search jam games..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {Object.keys(groupedGames).length === 0 ? (
            <div className="showcase-empty" data-fade data-delay="3">
              <h3>No games found</h3>
              <p>Try adjusting your search or browse a different category.</p>
            </div>
          ) : (
            Object.entries(groupedGames).map(([jamName, games], gi) => {
              const theme = games[0].jamTheme;
              return (
                <div key={jamName} className="jam-tile-section" data-fade data-delay={String(3 + gi)}>
                  <div className="jam-tile-header">
                    <h3>
                      <a href={games[0].jamUrl} target="_blank" rel="noopener noreferrer nofollow">{jamName}</a>
                    </h3>
                    {theme && theme !== 'Work on your own project' && (
                      <span className="jam-tile-theme">Theme: "{theme}"</span>
                    )}
                  </div>
                  <div className="jam-tiles">
                    {games.map((game, i) => (
                      <a
                        key={game.id}
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={`jam-tile ${i === 0 ? 'jam-tile-first' : ''}`}
                      >
                        <div className="jam-tile-img">
                          {game.image ? (
                            <img src={game.image} alt={game.title} loading="lazy" />
                          ) : (
                            <span>{game.thumb}</span>
                          )}
                        </div>
                        <div className="jam-tile-overlay">
                          <span className="jam-tile-place">{games.length === 1 ? 'Winner' : i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}</span>
                          <span className="jam-tile-title">{game.title}</span>
                          <span className="jam-tile-author">{game.author}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Community Submissions */}
      <section className="community-section" data-fade data-delay="4">
        <div className="container">
          <div className="community-header">
            <h2>Community Submissions</h2>
            <p>Games shared by our members</p>
          </div>

          <section className="view-controls" data-fade data-delay="5">
            <div className="search-and-filters">
              <input
                type="text"
                placeholder="Search games, developers..."
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-options">
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as any)} className="filter-select">
                <option value="newest">Newest First</option>
                <option value="random">Random</option>
                <option value="updated">Recently Updated</option>
              </select>
              <select value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value)} className="filter-select">
                {ENGINES.map(engine => (<option key={engine.value} value={engine.value}>{engine.label}</option>))}
              </select>
              <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="filter-select">
                {TAGS.map(tag => (<option key={tag.value} value={tag.value}>{tag.label}</option>))}
              </select>
            </div>
          </section>

          {communityError && <div className="error-message">{communityError}</div>}

          <section className="community-content" data-fade data-delay="6">
            {communityLoading && (!communityGames || communityGames.length === 0) ? (
              <div className="loading-state">Loading games...</div>
            ) : communityGames && communityGames.length > 0 ? (
              <>
                <div className="community-tiles">
                  {[...communityGames]
                    .sort((a, b) => {
                      if (a.thumbnailUrl && !b.thumbnailUrl) return -1;
                      if (!a.thumbnailUrl && b.thumbnailUrl) return 1;
                      return 0;
                    })
                    .map((game) => (
                      <a
                        key={game._id}
                        href={game.playUrl || '#'}
                        className="community-tile"
                        target={game.playUrl ? "_blank" : undefined}
                        rel="noopener noreferrer nofollow"
                      >
                        <div className="community-tile-img">
                          {game.thumbnailUrl ? (
                            <img src={game.thumbnailUrl} alt={game.title} loading="lazy" />
                          ) : (
                            <span>{game.title.charAt(0)}</span>
                          )}
                        </div>
                        <div className="community-tile-overlay">
                          <span className="community-tile-title">{game.title}</span>
                          <span className="community-tile-author">by {game.user.displayName}</span>
                        </div>
                      </a>
                    ))}
                </div>
                {pagination.page < pagination.pages && (
                  <div className="load-more-container">
                    <button
                      onClick={() => loadCommunityGames(pagination.page + 1)}
                      disabled={communityLoading}
                      className="btn btn-secondary load-more-button"
                    >
                      {communityLoading ? 'Loading...' : 'Load More Games'}
                    </button>
                    <p className="pagination-info">Showing {communityGames.length} of {pagination.total} games</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>No games found.</p>
                <p>Be the first to share your game with the community!</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default Showcase;
