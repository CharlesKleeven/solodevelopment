import React from 'react';
import './showcase.css';

const Showcase: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Game Showcase</h1>
          <p className="page-subtitle">Discover incredible games built by solo developers. From indie darlings to experimental prototypes, see what our community creates.</p>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Hall of Fame</h2>
          <p className="section-description">Winners and standout games from our community jams</p>

          <div className="winners-grid">
            {/* Marathon Jam Winners */}
            <div className="winners-category">
              <h3>Marathon Jam Winners</h3>

              <div className="winner-card featured">
                <div className="winner-header">
                  <h4>Marathon Jam #4</h4>
                  <span className="badge badge-primary">Latest</span>
                </div>
                <div className="winner-games">
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-1">H</div>
                    <div className="game-info">
                      <h5>Hack the Loop</h5>
                      <p>by @ProYd</p>
                    </div>
                  </div>
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-2">Y</div>
                    <div className="game-info">
                      <h5>YesterSol</h5>
                      <p>by @NeatGames</p>
                    </div>
                  </div>
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-3">S</div>
                    <div className="game-info">
                      <h5>Survive The Day: Dave's Coffee</h5>
                      <p>by @Lou Bagel</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="winner-card">
                <div className="winner-header">
                  <h4>Marathon Jam #3</h4>
                </div>
                <div className="winner-games">
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-1">O</div>
                    <div className="game-info">
                      <h5>Out Here Alone</h5>
                      <p>by @blackvoidtytan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Jam Winners */}
            <div className="winners-category">
              <h3>Special Jam Winners</h3>

              <div className="winner-card">
                <div className="winner-header">
                  <h4>Winter Jam</h4>
                </div>
                <div className="winner-games">
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-2">O</div>
                    <div className="game-info">
                      <h5>Operation MC: Codename Melting Point</h5>
                      <p>by @drahmen</p>
                    </div>
                  </div>
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-3">T</div>
                    <div className="game-info">
                      <h5>Track Master</h5>
                      <p>by @ensom_</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="winner-card">
                <div className="winner-header">
                  <h4>Spooky Jam</h4>
                </div>
                <div className="winner-games">
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-1">G</div>
                    <div className="game-info">
                      <h5>Guardian of the Grave</h5>
                      <p>by @drahmen</p>
                    </div>
                  </div>
                  <div className="winner-game">
                    <div className="game-thumbnail gradient-2">H</div>
                    <div className="game-info">
                      <h5>Hank The Imp</h5>
                      <p>by @Emcee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Submissions */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Submissions</h2>
            <button className="btn btn-secondary btn-small">View All</button>
          </div>

          <div className="layout-grid-3">
            <div className="game-card">
              <div className="game-image gradient-1">
                <div className="game-placeholder">N</div>
              </div>
              <h4>Neon Runner</h4>
              <p className="game-description">Fast-paced cyberpunk endless runner with synthwave aesthetics.</p>
              <p className="game-author">by @neon_coder</p>
              <div className="game-stats">
                <span>★ 4.2</span>
                <span>↓ 1.1k</span>
              </div>
            </div>

            <div className="game-card">
              <div className="game-image gradient-2">
                <div className="game-placeholder">G</div>
              </div>
              <h4>Garden Keeper</h4>
              <p className="game-description">Relaxing farming sim with hand-drawn art and seasonal cycles.</p>
              <p className="game-author">by @garden_dev</p>
              <div className="game-stats">
                <span>★ 4.8</span>
                <span>↓ 892</span>
              </div>
            </div>

            <div className="game-card">
              <div className="game-image gradient-3">
                <div className="game-placeholder">Q</div>
              </div>
              <h4>Quantum Maze</h4>
              <p className="game-description">Mind-bending puzzle game with quantum mechanics as core gameplay.</p>
              <p className="game-author">by @quantum_dev</p>
              <div className="game-stats">
                <span>★ 4.5</span>
                <span>↓ 654</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="section">
        <div className="container">
          <div className="showcase-filters">
            <h2 className="section-title">Browse All Games</h2>

            <div className="filter-controls">
              <div className="filter-tabs">
                <button className="filter-tab active">All</button>
                <button className="filter-tab">Featured</button>
                <button className="filter-tab">Recent</button>
                <button className="filter-tab">Top Rated</button>
              </div>

              <div className="filter-dropdowns">
                <select className="filter-select">
                  <option>All Engines</option>
                  <option>Unity</option>
                  <option>Godot</option>
                  <option>Unreal Engine</option>
                </select>
                <select className="filter-select">
                  <option>All Platforms</option>
                  <option>PC</option>
                  <option>Mobile</option>
                  <option>Web</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search games..."
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Submit Game CTA */}
      <section className="section">
        <div className="container">
          <div className="submit-cta">
            <h2>Submit Your Game</h2>
            <p>Share your game with the community and get feedback from fellow developers.</p>
            <button className="btn btn-primary">Submit Project</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Showcase;