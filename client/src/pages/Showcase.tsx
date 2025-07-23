import React, { useState } from 'react';
import { gameData } from '../data/gameData';
import './showcase.css';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

const Showcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  useFadeInOnScroll([searchTerm, activeTab]);

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
    const grouped: { [key: string]: typeof gameData } = {};
    games.forEach(game => {
      if (!grouped[game.jamName]) {
        grouped[game.jamName] = [];
      }
      grouped[game.jamName].push(game);
    });
    return grouped;
  };

  const filteredGames = filterGames(gameData, searchTerm, activeTab);
  const groupedGames = groupGamesByJam(filteredGames);

  const renderGameItem = (
    game: typeof gameData[0],
    index: number,
    totalGames: number,
    isFeatured: boolean = false
  ) => {
    let placement = '';
    if (totalGames === 1) placement = 'Winner';
    else if (index === 0) placement = '1st';
    else if (index === 1) placement = '2nd';
    else if (index === 2) placement = '3rd';

    const containerClass = isFeatured ? 'winner-featured' : 'winner-item';

    return (
      <a
        key={game.id}
        href={game.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={containerClass}
      >
        <div className="showcase-thumb">
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
        <div className="winner-info">
          <div className="winner-title">
            {game.title}
          </div>
          <div className="winner-author">{game.author}</div>
        </div>
        {placement && <div className="placement-corner">{placement}</div>}
      </a>
    );
  };

  const renderJamSection = (jamName: string, games: typeof gameData) => {
    const jamType = games[0].jamType;
    const jamClass = `jam-winner-section jam-${jamType}`;
    const theme = games[0].jamTheme;

    return (
      <div key={jamName} className={jamClass}>
        <h3>
          <a href={games[0].jamUrl} target="_blank" rel="noopener noreferrer nofollow">
            {jamName}
          </a>
        </h3>
        <p className="jam-description">
          {theme && theme !== 'Work on your own project' && (
            <>Theme: "{theme}"</>
          )}
        </p>
        <div className="winner-list">
          {games.length > 0 && renderGameItem(games[0], 0, games.length, true)}
          {games.length > 1 && (
            <div className="winner-secondary">
              {games.slice(1).map((game, index) =>
                renderGameItem(game, index + 1, games.length)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="showcase-page">
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Showcase</h1>
          <p>Winning and standout entries from community jams</p>
        </div>
      </section>

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
              placeholder="Search games..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="winners-chronological" data-fade data-delay="3">
            {Object.keys(groupedGames).length === 0 ? (
              <div className="jam-winner-section">
                <h3>No games found</h3>
                <p className="jam-description">Try adjusting your search or browse a different category.</p>
              </div>
            ) : (
              Object.entries(groupedGames).map(([jamName, games]) =>
                renderJamSection(jamName, games)
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Showcase;
