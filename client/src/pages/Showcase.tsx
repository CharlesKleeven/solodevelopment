// Showcase.tsx
import React, { useState } from 'react';
import './showcase.css';

// Game data structure
const gameData = [
  {
    id: 1,
    title: "Hack the Loop",
    author: "@ProYd",
    url: "https://proyd.itch.io/hack-the-loop",
    jamName: "SoloDevelopment Marathon Jam 4",
    jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
    jamType: "marathon",
    thumb: "H"
  },
  {
    id: 2,
    title: "YesterSol",
    author: "@NeatGames",
    url: "https://neatgames.itch.io/yestersol",
    jamName: "SoloDevelopment Marathon Jam 4",
    jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
    jamType: "marathon",
    thumb: "Y"
  },
  {
    id: 3,
    title: "Survive The Day: Dave's Coffee",
    author: "@Lou Bagel",
    url: "https://loubagel.itch.io/daves-coffee",
    jamName: "SoloDevelopment Marathon Jam 4",
    jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
    jamType: "marathon",
    thumb: "S"
  },
  {
    id: 4,
    title: "Operation MC: Codename Melting Point",
    author: "@drahmen",
    url: "https://drahmen.itch.io/operation-mc-codename-melting-point",
    jamName: "SoloDevelopment Game Jam 6",
    jamUrl: "https://itch.io/jam/solodevelopment-jam-6-winter-jam",
    jamType: "solodev",
    thumb: "O"
  },
  {
    id: 5,
    title: "Guardian of the Grave",
    author: "@drahmen",
    url: "https://drahmen.itch.io/guardian-of-the-grave",
    jamName: "SoloDevelopment Game Jam 5",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
    jamType: "solodev",
    thumb: "G"
  },
  {
    id: 6,
    title: "Hank The Imp",
    author: "@Emcee",
    url: "https://emceetheguy.itch.io/hanktheimp",
    jamName: "SoloDevelopment Game Jam 5",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
    jamType: "solodev",
    thumb: "H"
  },
  {
    id: 7,
    title: "Maybel in the Hazy Hotel",
    author: "@log64",
    url: "https://log64.itch.io/maybel-in-the-hazy-hotel",
    jamName: "SoloDevelopment Game Jam 5",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
    jamType: "solodev",
    thumb: "M"
  },
  {
    id: 8,
    title: "Mutual Assured Destruction Simulator",
    author: "@blackvoidtytan",
    url: "https://blackvoidmedia.itch.io/mutual-assured-destrtruction-simulator",
    jamName: "SoloDevelopment Game Jam 4",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
    jamType: "solodev",
    thumb: "M"
  },
  {
    id: 9,
    title: "Dodge the Question",
    author: "@gripgrap",
    url: "https://gripgrap.itch.io/dodge-the-question",
    jamName: "SoloDevelopment Game Jam 4",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
    jamType: "solodev",
    thumb: "D"
  },
  {
    id: 10,
    title: "Six Rolls Six",
    author: "@yikag",
    url: "https://yikag.itch.io/six-rolls-six",
    jamName: "SoloDevelopment Game Jam 4",
    jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
    jamType: "solodev",
    thumb: "S"
  },
  {
    id: 11,
    title: "Out Here Alone",
    author: "@blackvoidtytan",
    url: "https://blackvoidmedia.itch.io/out-here-alone",
    jamName: "Third Marathon Jam",
    jamUrl: "https://itch.io/jam/marathon-jam-3-by-solodevelopment",
    jamType: "marathon",
    thumb: "O"
  },
  {
    id: 12,
    title: "Scavengers from Planet X",
    author: "@fernandolv3",
    url: "https://fernandolv3.itch.io/scavengersfromplanetx",
    jamName: "Second Marathon Jam",
    jamUrl: "https://itch.io/jam/marathon-jam-2022-by-solodevelopment",
    jamType: "marathon",
    thumb: "S"
  },
  {
    id: 13,
    title: "Track Master",
    author: "@ensom_",
    url: "https://uppastgamer.itch.io/track-master",
    jamName: "Winter Jam",
    jamUrl: "https://itch.io/jam/winter-jam-by-solodevelopment",
    jamType: "themed",
    thumb: "T"
  },
  {
    id: 14,
    title: "I Came Home Tonight",
    author: "@blackvoidtytan and @radagast08",
    url: "https://blackvoidmedia.itch.io/i-came-home-tonight",
    jamName: "Halloween Jam",
    jamUrl: "https://itch.io/jam/halloween-jam-2021",
    jamType: "themed",
    thumb: "I"
  },
  {
    id: 15,
    title: "DF FBLA",
    author: "@lonelylily",
    url: "https://razzie-dev.itch.io/df-fbla",
    jamName: "First Marathon Jam",
    jamUrl: "https://itch.io/jam/marathon-jam-by-solodevelopment",
    jamType: "marathon",
    thumb: "D"
  },
  {
    id: 16,
    title: "There's Something Wrong With This World",
    author: "@blackvoidtytan",
    url: "https://blackvoidmedia.itch.io/theres-something-wrong-with-this-world",
    jamName: "First r/SoloDevelopment Jam",
    jamUrl: "https://itch.io/jam/solodevelopment-game-jam",
    jamType: "solodev",
    thumb: "T"
  }
];

const Showcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter games based on search term and active tab
  const filterGames = (games: typeof gameData, term: string, tab: string) => {
    let filtered = games;

    // Filter by tab
    if (tab !== 'all') {
      filtered = filtered.filter(game => game.jamType === tab);
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(term.toLowerCase()) ||
        game.author.toLowerCase().includes(term.toLowerCase()) ||
        game.jamName.toLowerCase().includes(term.toLowerCase())
      );
    }

    return filtered;
  };

  // Group games by jam for display
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

  // Render game item
  const renderGameItem = (game: typeof gameData[0]) => (
    <div key={game.id} className="winner-item">
      <div className="winner-thumb">{game.thumb}</div>
      <div className="winner-info">
        <strong>
          <a href={game.url} target="_blank" rel="noopener noreferrer">
            {game.title}
          </a>
        </strong>
        <p>{game.author}</p>
      </div>
    </div>
  );

  // Render jam section
  const renderJamSection = (jamName: string, games: typeof gameData) => (
    <div key={jamName} className="jam-winner-section">
      <h3>{jamName}</h3>
      <p className="jam-description">
        From{' '}
        <a href={games[0].jamUrl} target="_blank" rel="noopener noreferrer">
          {jamName}
        </a>
      </p>
      <div className="winner-list">
        {games.map(renderGameItem)}
      </div>
    </div>
  );

  return (
    <div className="showcase-page">
      {/* Header */}
      <section className="page-header-compact">
        <div className="container">
          <h1>Showcase</h1>
          <p>Winning and standout entries from community jams</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-compact">
        <div className="container showcase-controls">
          <div className="showcase-tabs">
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`tab ${activeTab === 'marathon' ? 'active' : ''}`}
              onClick={() => setActiveTab('marathon')}
            >
              Marathon
            </button>
            <button
              className={`tab ${activeTab === 'solodev' ? 'active' : ''}`}
              onClick={() => setActiveTab('solodev')}
            >
              Solo Dev
            </button>
            <button
              className={`tab ${activeTab === 'themed' ? 'active' : ''}`}
              onClick={() => setActiveTab('themed')}
            >
              Themed
            </button>
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

      {/* Content */}
      <section className="section-sm">
        <div className="container">
          <div className="winners-chronological">
            {Object.keys(groupedGames).length === 0 ? (
              <div className="jam-winner-section">
                <h3>No games found</h3>
                <p className="jam-description">
                  Try adjusting your search or browse a different category.
                </p>
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