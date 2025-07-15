import React from 'react';
import './community.css';

const Community: React.FC = () => {
  return (
    <div className="community-page">
      <h1>Community</h1>
      <p>Connect with other solo developers in our growing community. Share your progress, get feedback, and collaborate with like-minded creators.</p>

      <section className="platform-section">
        <h2>Discord</h2>
        <p>Join our active Discord community for real-time chat, feedback, and collaboration.</p>
        <ul className="platform-features">
          <li>Get help with your projects</li>
          <li>Share progress and screenshots</li>
          <li>Find collaborators for game jams</li>
          <li>Participate in community events</li>
        </ul>
        <a href="https://discord.gg/your-discord-link" target="_blank" rel="noopener noreferrer">
          <button className="platform-button">Join Discord</button>
        </a>
      </section>

      <section className="platform-section">
        <h2>Reddit</h2>
        <p>r/solodevelopment subreddit for discussions, showcases, and community updates.</p>
        <ul className="platform-features">
          <li>Share your games and get feedback</li>
          <li>Ask questions and help others</li>
          <li>Participate in weekly threads</li>
          <li>Stay updated on jam announcements</li>
        </ul>
        <a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer">
          <button className="platform-button">Browse r/solodevelopment</button>
        </a>
      </section>

      <section className="guidelines-section">
        <h2>Community Guidelines</h2>

        <div className="guideline-item">
          <h3>Be Respectful</h3>
          <p>Treat all community members with respect and kindness. We're all here to learn and grow together.</p>
        </div>

        <div className="guideline-item">
          <h3>Stay On Topic</h3>
          <p>Keep discussions related to solo game development, from programming to art to marketing.</p>
        </div>

        <div className="guideline-item">
          <h3>No Spam</h3>
          <p>Don't spam your projects. Share thoughtfully and engage meaningfully with the community.</p>
        </div>

        <div className="guideline-item">
          <h3>Help Others</h3>
          <p>Support fellow developers by offering feedback, assistance, and encouragement when you can.</p>
        </div>

        <div className="guideline-item">
          <h3>Follow Platform Rules</h3>
          <p>Respect Discord and Reddit's terms of service and community standards.</p>
        </div>
      </section>

      <section className="stats-section">
        <h2>Community Stats</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">2,847</span>
            <span className="stat-label">Discord Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15,230</span>
            <span className="stat-label">Reddit Subscribers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1,247</span>
            <span className="stat-label">Active Developers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">432</span>
            <span className="stat-label">Games Submitted</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15</span>
            <span className="stat-label">Completed Jams</span>
          </div>
        </div>
      </section>

      <section className="involvement-section">
        <h2>Get Involved</h2>
        <div className="involvement-grid">
          <div className="involvement-card">
            <h3>For New Members</h3>
            <ul>
              <li>Introduce yourself in Discord</li>
              <li>Share your current project</li>
              <li>Join the next game jam</li>
              <li>Ask questions in the help channels</li>
            </ul>
          </div>

          <div className="involvement-card">
            <h3>For Experienced Developers</h3>
            <ul>
              <li>Mentor new developers</li>
              <li>Contribute resources and guides</li>
              <li>Help moderate discussions</li>
              <li>Share your development journey</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h2>Contact</h2>
        <p>Questions about the community? Need help with something? Reach out to our moderators.</p>
        <ul className="contact-methods">
          <li><strong>Discord:</strong> <span>Message @moderators</span></li>
          <li><strong>Reddit:</strong> <span>Message the r/solodevelopment mods</span></li>
          <li><strong>Email:</strong> <span>community@solodevelopment.org</span></li>
        </ul>
      </section>
    </div>
  );
};

export default Community;