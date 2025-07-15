import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Community</h4>
            <ul className="footer-links">
              <li><a href="https://discord.gg/your-discord-link" target="_blank" rel="noopener noreferrer">Discord Server</a></li>
              <li><a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer">Reddit</a></li>
              <li><a href="https://solodevelopment.itch.io" target="_blank" rel="noopener noreferrer">Itch.io</a></li>
              <li><a href="/community">Community Guidelines</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="/jams">Game Jams</a></li>
              <li><a href="/showcase">Hall of Fame</a></li>
              <li><a href="/resources">Getting Started</a></li>
              <li><a href="/resources">Tools & Software</a></li>
              <li><a href="#">Wiki</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>About</h4>
            <ul className="footer-links">
              <li><a href="#">About SoloDevelopment</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Contribute</a></li>
              <li><a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="/support#faq">FAQ</a></li>
              <li><a href="/support#help">Help</a></li>
              <li><a href="/support#privacy">Privacy Policy</a></li>
              <li><a href="/support#contact">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 SoloDevelopment.org — Built by solo devs, for solo devs</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;