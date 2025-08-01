// --- Clean 3-Column Footer Layout ---
import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top-columns">
          {/* Column 1: Brand */}
          <div className="footer-column">
            <h4>SoloDevelopment</h4>
            <p className="footer-description">
              A community for independent game developers working solo.
            </p>
          </div>

          {/* Column 2: Community */}
          <div className="footer-column">
            <h4>Community</h4>
            <ul>
              <li>
                <a className="footer-link" href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer nofollow">
                  Discord
                </a>
              </li>
              <li>
                <a className="footer-link" href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer nofollow">
                  Reddit
                </a>
              </li>
              <li>
                <a className="footer-link" href="https://solodevelopment.itch.io/" target="_blank" rel="noopener noreferrer nofollow">
                  Itch.io
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a className="footer-link" href="/about">About</a></li>
              <li><a className="footer-link" href="/resources">Resources</a></li>
              <li><a className="footer-link" href="/support">Contact</a></li>
              <li><a className="footer-link" href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 SoloDevelopment.org — By solo developers, for solo developers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
