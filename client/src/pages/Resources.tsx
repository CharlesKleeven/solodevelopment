import React from 'react';
import './resources.css';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

const Resources: React.FC = () => {
  useFadeInOnScroll();

  return (
    <div className="resources-page">
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Resources</h1>
          <p>Guides, tools, and links curated for solo developers — whether you're starting out or shipping something great.</p>
        </div>
      </section>

      <div className="container">
        <div className="resources-flow">

          <section className="toc-block" data-fade data-delay="2">
            <div className="container">
              <h2>Table of Contents</h2>
              <ul>
                <li><span className="toc-section">Start Here</span>
                  <ul>
                    <li><a href="#pick-an-engine">Pick an Engine</a></li>
                    <li><a href="#simple-setup">Simple Setup</a></li>
                  </ul>
                </li>
                <li><span className="toc-section">Level Up</span>
                  <ul>
                    <li><a href="#learn-dev">Learn Game Dev</a></li>
                    <li><a href="#work-smart">Work Smart</a></li>
                  </ul>
                </li>
                <li><span className="toc-section">Release & Beyond</span>
                  <ul>
                    <li><a href="#publish">Publish Your Game</a></li>
                    <li><a href="#community">Stay Connected</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          <section className="main-section" id="start-here" data-fade data-delay="3">
            <h2>Start Here</h2>
            <div className="subsections">
              <div className="subsection" id="pick-an-engine" data-fade>
                <h3>Pick an Engine</h3>
                <p>Don't overthink it. Pick one engine that feels right and start making something.</p>
                <ul className="tool-grid">
                  <li className="tool-item"><span className="tool-name">Godot</span><p className="tool-desc">Free, open-source, and beginner-friendly.</p></li>
                  <li className="tool-item"><span className="tool-name">Unity</span><p className="tool-desc">Versatile and widely used. Great for 2D/3D.</p></li>
                  <li className="tool-item"><span className="tool-name">Unreal</span><p className="tool-desc">Powerful for 3D and visual scripting (Blueprints).</p></li>
                  <li className="tool-item"><span className="tool-name">GameMaker</span><p className="tool-desc">Excellent for 2D games. Code optional.</p></li>
                  <li className="tool-item"><span className="tool-name">Construct</span><p className="tool-desc">Drag-and-drop interface. Great for beginners.</p></li>
                </ul>
              </div>

              <div className="subsection" id="simple-setup" data-fade>
                <h3>Simple Setup Tools</h3>
                <p>Speed up your workflow with lightweight helpers.</p>
                <ul className="tool-grid">
                  <li className="tool-item"><span className="tool-name">Tiled</span><p className="tool-desc">Map editor for 2D tile-based games.</p></li>
                  <li className="tool-item"><span className="tool-name">Aseprite</span><p className="tool-desc">Pixel art editor with animation support.</p></li>
                  <li className="tool-item"><span className="tool-name">Piskel</span><p className="tool-desc">Free browser-based pixel art tool.</p></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="main-section" id="level-up" data-fade data-delay="4">
            <h2>Level Up</h2>
            <div className="subsections">
              <div className="subsection" id="learn-dev" data-fade>
                <h3>Learn Game Dev</h3>
                <p>Build and learn at the same time — you don't need to know everything to start.</p>
                <ul className="resource-links">
                  <li className="resource-link">
                    <a href="https://gameprogrammingpatterns.com/" target="_blank" rel="noopener noreferrer">Game Programming Patterns</a>
                    <p className="resource-desc">Free book by Robert Nystrom</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://www.amazon.com/Art-Game-Design-Book-Lenses/dp/0123694965" target="_blank" rel="noopener noreferrer">The Art of Game Design</a>
                    <p className="resource-desc">Great for theory + creativity</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://godotshaders.com/" target="_blank" rel="noopener noreferrer">Godot Shaders</a>
                    <p className="resource-desc">Interactive shader editor + examples</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://drawingdatabase.com/" target="_blank" rel="noopener noreferrer">Drawing Database</a>
                    <p className="resource-desc">Anatomy and figure drawing</p>
                  </li>
                </ul>
              </div>

              <div className="subsection" id="work-smart" data-fade>
                <h3>Work Smart</h3>
                <p>Solo devs thrive when they keep things small and build iteratively.</p>
                <ul className="tips-list">
                  <li className="tip-item"><div className="tip-title">Agile vs Waterfall</div><p className="tip-desc">Start small and release early</p></li>
                  <li className="tip-item"><div className="tip-title">Duke Nukem Forever</div><p className="tip-desc">A cautionary tale of restarts and scope bloat</p></li>
                  <li className="tip-item"><div className="tip-title">Scope it down</div><p className="tip-desc">Ideas are cheap, finishing is gold</p></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="main-section" id="release" data-fade data-delay="5">
            <h2>Release & Beyond</h2>
            <div className="subsections">
              <div className="subsection" id="publish" data-fade>
                <h3>Publish Your Game</h3>
                <p>When you're ready to launch, these resources can help you release confidently.</p>
                <ul className="resource-links">
                  <li className="resource-link">
                    <a href="https://www.gamesindustry.biz/a-guide-to-gdpr-requirements-for-mobile-game-developers" target="_blank" rel="noopener noreferrer">GDPR Guide</a>
                    <p className="resource-desc">What to know about handling user data</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://docs.google.com/spreadsheets/d/11g8MCMFNrBM0CXIWrT8bej5vqR1fCJGMhoFfbS5ph3Q/edit#gid=0" target="_blank" rel="noopener noreferrer">Publisher List</a>
                    <p className="resource-desc">Shared spreadsheet of publishers</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://templatelab.com/service-agreement/" target="_blank" rel="noopener noreferrer">Contract Templates</a>
                    <p className="resource-desc">Sample agreements and service templates</p>
                  </li>
                </ul>
              </div>

              <div className="subsection" id="community" data-fade>
                <h3>Stay Connected</h3>
                <p>You don't have to go it alone. Share your work, ask questions, and find your pace.</p>
                <ul className="resource-links">
                  <li className="resource-link">
                    <a href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer">r/solodevelopment Discord</a>
                    <p className="resource-desc">Main community hangout</p>
                  </li>
                  <li className="resource-link">
                    <a href="https://reddit.com/r/gamedev" target="_blank" rel="noopener noreferrer">Other subs</a>
                    <p className="resource-desc">r/gamedev, r/IndieDev, r/IncrementalGames</p>
                  </li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Resources;
