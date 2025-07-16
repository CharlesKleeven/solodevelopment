// Jams.tsx
import React from 'react';
import './jams.css';

const Jams: React.FC = () => {
  return (
    <div className="jams-page">
      {/* Page Header */}
      <section className="page-header-clean">
        <div className="container">
          <h1>Game Jams</h1>
          <p>Practice, experiment, and learn with the community through timed challenges.</p>
        </div>
      </section>

      {/* Active Jam */}
      <section className="section-sm">
        <div className="container">
          <div className="current-jam">
            <div className="jam-status">
              <div className="status-dot" />
              <span className="status-text">Active Jam</span>
              <span className="meta">127 participants • 64 submissions</span>
            </div>

            <h2>Winter Game Jam</h2>
            <p className="jam-description">
              Theme: "Connections" — Create a game exploring bonds between characters, systems, or ideas.
            </p>

            <div className="jam-details">
              <div className="detail-item">
                <strong>Duration</strong>
                <span>7 days</span>
              </div>
              <div className="detail-item">
                <strong>Time left</strong>
                <span className="urgent">4 days</span>
              </div>
              <div className="detail-item">
                <strong>Submissions</strong>
                <span>64 games</span>
              </div>
            </div>

            <div className="jam-actions">
              <button className="btn btn-primary">Join Jam</button>
              <button className="btn btn-secondary">View Submissions</button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming & Recent */}
      <section className="section-sm">
        <div className="container">
          <h2 className="section-title text-center">Upcoming & Recent</h2>

          <div className="jams-grid">
            {/* Upcoming */}
            <div className="jam-card upcoming">
              <div className="jam-card-header">
                <h3>Spring Jam 2025</h3>
                <span className="badge upcoming">Upcoming</span>
              </div>
              <p className="jam-theme">Theme: TBA</p>
              <div className="jam-meta">
                <div className="meta-item"><strong>Starts</strong> March 15, 2025</div>
                <div className="meta-item"><strong>Duration</strong> 7 days</div>
                <div className="meta-item"><strong>Registered</strong> 67 developers</div>
              </div>
              <button className="btn btn-ghost">Register Interest</button>
            </div>

            <div className="jam-card upcoming">
              <div className="jam-card-header">
                <h3>Mini Jam</h3>
                <span className="badge upcoming">Upcoming</span>
              </div>
              <p className="jam-theme">Theme: Friday reveal</p>
              <div className="jam-meta">
                <div className="meta-item"><strong>Starts</strong> April 5, 2025</div>
                <div className="meta-item"><strong>Duration</strong> 48 hours</div>
                <div className="meta-item"><strong>Registered</strong> 34 developers</div>
              </div>
              <button className="btn btn-ghost">Register Interest</button>
            </div>

            {/* Recent */}
            <div className="jam-card completed">
              <div className="jam-card-header">
                <h3>Marathon Jam #3</h3>
                <span className="badge completed">Completed</span>
              </div>
              <p className="jam-theme">Theme: No theme — work on your own project</p>
              <div className="jam-stats">
                <div className="stat"><span className="stat-number">156</span><span className="stat-label">Participants</span></div>
                <div className="stat"><span className="stat-number">89</span><span className="stat-label">Submissions</span></div>
                <div className="stat"><span className="stat-number">2.1k</span><span className="stat-label">Votes</span></div>
              </div>
              <div className="jam-actions-small">
                <button className="btn btn-ghost btn-sm">View Results</button>
                <button className="btn btn-ghost btn-sm">Browse Games</button>
              </div>
            </div>

            <div className="jam-card completed">
              <div className="jam-card-header">
                <h3>Halloween Jam 2024</h3>
                <span className="badge completed">Completed</span>
              </div>
              <p className="jam-theme">Theme: "What Lurks Beneath"</p>
              <div className="jam-stats">
                <div className="stat"><span className="stat-number">203</span><span className="stat-label">Participants</span></div>
                <div className="stat"><span className="stat-number">127</span><span className="stat-label">Submissions</span></div>
                <div className="stat"><span className="stat-number">3.4k</span><span className="stat-label">Votes</span></div>
              </div>
              <div className="jam-actions-small">
                <button className="btn btn-ghost btn-sm">View Results</button>
                <button className="btn btn-ghost btn-sm">Browse Games</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jams;
