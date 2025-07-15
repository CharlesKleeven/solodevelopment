import React from 'react';
import './jams.css';

const Jams: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Game Jams</h1>
          <p className="page-subtitle">Regular challenges to make games in short timeframes. Practice, experiment, and learn with the community.</p>
        </div>
      </section>

      {/* Current Jam */}
      <section className="section">
        <div className="container">
          <div className="current-jam-card">
            <div className="jam-status">
              <span className="live-dot"></span>
              <span className="badge badge-success">Active Jam</span>
              <span className="jam-meta">• 95 participants • 64 submissions</span>
            </div>

            <h2>Marathon Jam #4</h2>
            <div className="jam-details">
              <div className="jam-info">
                <p><strong>Status:</strong> Active</p>
                <p><strong>Theme:</strong> No theme - work on your projects!</p>
                <p><strong>Duration:</strong> 1 month</p>
                <p><strong>Time Left:</strong> <span className="deadline-warning">12 days</span></p>
              </div>
              <div className="jam-description">
                <p>A month-long jam to encourage you to work on your projects! This is a great opportunity to make progress, finish your game, and share it with the community.</p>
              </div>
            </div>

            <div className="jam-actions">
              <button className="btn btn-primary">Join Marathon Jam #4</button>
              <button className="btn btn-secondary">View Submissions</button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Jams */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Upcoming Jams</h2>

          <div className="layout-grid-2">
            <div className="card jam-upcoming">
              <div className="jam-header">
                <h3>Spring Jam 2025</h3>
                <span className="badge badge-warning">Upcoming</span>
              </div>
              <div className="jam-details">
                <p><strong>Duration:</strong> 7 days</p>
                <p><strong>Start Date:</strong> March 15, 2025</p>
                <p><strong>Theme:</strong> TBA</p>
                <p><strong>Registered:</strong> 67 developers</p>
              </div>
              <p>A week-long jam focused on growth and renewal themes. Perfect for trying new mechanics or art styles.</p>
              <button className="btn btn-secondary btn-small">Register Interest</button>
            </div>

            <div className="card jam-upcoming">
              <div className="jam-header">
                <h3>Mini Jam</h3>
                <span className="badge badge-warning">Upcoming</span>
              </div>
              <div className="jam-details">
                <p><strong>Duration:</strong> 48 hours</p>
                <p><strong>Start Date:</strong> April 5, 2025</p>
                <p><strong>Theme:</strong> Announced Friday evening</p>
                <p><strong>Registered:</strong> 34 developers</p>
              </div>
              <p>Quick weekend jam for prototyping and experimentation. Theme announced Friday evening.</p>
              <button className="btn btn-secondary btn-small">Register Interest</button>
            </div>
          </div>
        </div>
      </section>

      {/* Past Jams */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Past Jams</h2>

          <div className="past-jams-list">
            <div className="card jam-completed">
              <div className="jam-header">
                <div>
                  <h3>Marathon Jam #3</h3>
                  <p className="jam-theme">Theme: No theme</p>
                </div>
                <span className="badge badge-neutral">Completed</span>
              </div>
              <div className="jam-stats">
                <div className="stat-item">
                  <span className="stat-number">156</span>
                  <span className="stat-label">Participants</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">89</span>
                  <span className="stat-label">Games submitted</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2.1k</span>
                  <span className="stat-label">Community votes</span>
                </div>
              </div>
              <div className="jam-actions">
                <button className="btn btn-secondary btn-small">View Results</button>
                <button className="btn btn-secondary btn-small">Browse Games</button>
              </div>
            </div>

            <div className="card jam-completed">
              <div className="jam-header">
                <div>
                  <h3>Halloween Jam 2024</h3>
                  <p className="jam-theme">Theme: "What Lurks Beneath"</p>
                </div>
                <span className="badge badge-neutral">Completed</span>
              </div>
              <div className="jam-stats">
                <div className="stat-item">
                  <span className="stat-number">203</span>
                  <span className="stat-label">Participants</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">127</span>
                  <span className="stat-label">Games submitted</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">3.4k</span>
                  <span className="stat-label">Community votes</span>
                </div>
              </div>
              <div className="jam-actions">
                <button className="btn btn-secondary btn-small">View Results</button>
                <button className="btn btn-secondary btn-small">Browse Games</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">How Jams Work</h2>

          <div className="layout-grid-4">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Register</h4>
              <p>Sign up for upcoming jams and get theme announcements</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Create</h4>
              <p>Make a game during the jam timeframe, get help in Discord</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Submit</h4>
              <p>Upload your game before the deadline with description</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Share</h4>
              <p>Play other games, give feedback, and celebrate together</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jams;