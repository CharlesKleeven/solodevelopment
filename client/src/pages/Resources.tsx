// Resources.tsx
import React from 'react';
import './resources.css';

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      {/* Header */}
      <section className="page-header-clean">
        <div className="container">
          <h1>Resources</h1>
          <p>Guides and tools curated by the community</p>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-header">
                <h3>Getting Started</h3>
              </div>
              <p>Core guides for new solo devs</p>
              <div className="resource-list">
                <a href="#" className="resource-link">Choosing a game engine</a>
                <a href="#" className="resource-link">Planning a small scope</a>
                <a href="#" className="resource-link">Solo dev workflow tips</a>
              </div>
            </div>

            <div className="category-card">
              <div className="category-header">
                <h3>Tools & Software</h3>
              </div>
              <p>Free and recommended software</p>
              <div className="resource-list">
                <a href="#" className="resource-link">Unity vs Godot comparison</a>
                <a href="#" className="resource-link">Art & audio toolkits</a>
                <a href="#" className="resource-link">Project management picks</a>
              </div>
            </div>

            <div className="category-card">
              <div className="category-header">
                <h3>Marketing & Launch</h3>
              </div>
              <p>Finish strong and get seen</p>
              <div className="resource-list">
                <a href="#" className="resource-link">Steam launch checklist</a>
                <a href="#" className="resource-link">Building an audience</a>
                <a href="#" className="resource-link">What to do post-release</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
