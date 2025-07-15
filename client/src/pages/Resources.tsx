import React from 'react';
import './resources.css';

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      <h1>Resources</h1>
      <p>Guides, tools, and knowledge collected by the community. From beginner tutorials to advanced techniques.</p>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search resources..."
            className="search-input"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-grid">
        <div className="category-section">
          <h2>
            <div className="category-icon">📚</div>
            Getting Started
          </h2>
          <ul className="resource-list">
            <li><a href="#" className="resource-item">Choosing your first game engine</a></li>
            <li><a href="#" className="resource-item">Solo development workflow guide</a></li>
            <li><a href="#" className="resource-item">Scoping your first game project</a></li>
            <li><a href="#" className="resource-item">Basic game design principles</a></li>
            <li><a href="#" className="resource-item">Version control for solo devs</a></li>
          </ul>
          <a href="#" className="view-all-link">View all guides →</a>
        </div>

        <div className="category-section">
          <h2>
            <div className="category-icon">🛠️</div>
            Tools & Software
          </h2>
          <ul className="resource-list">
            <li><a href="#" className="resource-item">Unity vs Godot comparison</a></li>
            <li><a href="#" className="resource-item">Free art and audio tools</a></li>
            <li><a href="#" className="resource-item">Pixel art software guide</a></li>
            <li><a href="#" className="resource-item">Project management tools</a></li>
            <li><a href="#" className="resource-item">Marketing and social media</a></li>
          </ul>
          <a href="#" className="view-all-link">View all tools →</a>
        </div>

        <div className="category-section">
          <h2>
            <div className="category-icon">🚀</div>
            Advanced Topics
          </h2>
          <ul className="resource-list">
            <li><a href="#" className="resource-item">Steam release checklist</a></li>
            <li><a href="#" className="resource-item">Performance optimization</a></li>
            <li><a href="#" className="resource-item">Building a community</a></li>
            <li><a href="#" className="resource-item">Monetization strategies</a></li>
            <li><a href="#" className="resource-item">Post-launch support</a></li>
          </ul>
          <a href="#" className="view-all-link">View all topics →</a>
        </div>
      </section>

      {/* Featured Resource */}
      <section className="featured-section">
        <div className="featured-badge">Featured Guide</div>
        <h2>Complete Solo Developer Workflow</h2>
        <p className="featured-description">
          A comprehensive guide covering the entire journey from concept to release.
          Learn how to manage your time, stay motivated, and ship games consistently as a solo developer.
        </p>
        <div className="featured-meta">
          <span>By the community</span>
          <span>•</span>
          <span>Updated monthly</span>
        </div>
        <button className="btn">Read the guide →</button>
      </section>

      {/* Popular Tools */}
      <section className="tools-section">
        <h2>Popular Tools</h2>
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon unity">U</div>
            <h3>Unity</h3>
            <p className="tool-description">Popular 2D/3D game engine</p>
            <div className="tool-tags">
              <span className="tool-tag free">Free tier</span>
            </div>
          </div>

          <div className="tool-card">
            <div className="tool-icon godot">G</div>
            <h3>Godot</h3>
            <p className="tool-description">Open-source game engine</p>
            <div className="tool-tags">
              <span className="tool-tag free">Free</span>
            </div>
          </div>

          <div className="tool-card">
            <div className="tool-icon aseprite">A</div>
            <h3>Aseprite</h3>
            <p className="tool-description">Pixel art and animation</p>
            <div className="tool-tags">
              <span className="tool-tag paid">$19.99</span>
            </div>
          </div>

          <div className="tool-card">
            <div className="tool-icon krita">K</div>
            <h3>Krita</h3>
            <p className="tool-description">Free digital painting</p>
            <div className="tool-tags">
              <span className="tool-tag free">Free</span>
            </div>
          </div>
        </div>
        <div className="tools-link">
          <a href="#" className="view-all-link">View complete tool directory →</a>
        </div>
      </section>

      {/* Community Knowledge */}
      <section className="knowledge-section">
        <h2>Community Knowledge</h2>
        <div className="knowledge-grid">
          <div className="insight-card">
            <h3>Developer Insights</h3>
            <blockquote className="insight-quote">
              Start with the smallest possible version of your idea. You'll learn more
              from finishing three small games than spending years on one big project.
            </blockquote>
            <div className="insight-author">
              <div className="author-avatar">E</div>
              <div className="author-info">elena • 3 years solo dev</div>
            </div>
          </div>

          <div className="insight-card">
            <h3>Technical Tips</h3>
            <blockquote className="insight-quote">
              Don't optimize early, but do think about architecture. A clean codebase
              will save you weeks when you need to add new features.
            </blockquote>
            <div className="insight-author">
              <div className="author-avatar">M</div>
              <div className="author-info">marco • 5 years solo dev</div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Knowledge */}
      <section className="contribute-section">
        <h2>Share Your Knowledge</h2>
        <p>
          Help other solo developers by contributing guides, tools, or insights
          you've learned during your development journey.
        </p>
        <button className="btn">Contribute Resource</button>
      </section>
    </div>
  );
};

export default Resources;