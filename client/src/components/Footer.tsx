import React from 'react';
import { DiscordIcon, RedditIcon, ItchIcon, BlueskyIcon } from './Icons';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top-columns">
          {/* Column 1: Brand */}
          <div className="footer-column">
            <h4>Solo Development</h4>
            <p className="footer-description">
              A community for independent game developers working solo.
            </p>
          </div>

          {/* Column 2: Site */}
          <div className="footer-column">
            <h4>Site</h4>
            <ul>
              <li><a className="footer-link" href="/jams">Game Jams</a></li>
              <li><a className="footer-link" href="/showcase">Showcase</a></li>
              <li><a className="footer-link" href="/streams">Streams</a></li>
              <li><a className="footer-link" href="/resources">Resources</a></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="footer-column">
            <h4>Community</h4>
            <ul>
              <li>
                <a className="footer-link footer-discord" href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer nofollow">
                  <DiscordIcon size={13} /> Discord
                </a>
              </li>
              <li>
                <a className="footer-link footer-reddit" href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer nofollow">
                  <RedditIcon size={13} /> Reddit
                </a>
              </li>
              <li>
                <a className="footer-link footer-itch" href="https://solodevelopment.itch.io/" target="_blank" rel="noopener noreferrer nofollow">
                  <ItchIcon size={13} /> Itch.io
                </a>
              </li>
              <li>
                <a className="footer-link footer-bluesky" href="https://bsky.app/profile/solodevelopment.bsky.social" target="_blank" rel="noopener noreferrer nofollow">
                  <BlueskyIcon size={13} /> Bluesky
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a className="footer-link" href="/about">About</a></li>
              <li><a className="footer-link" href="/support">Contact</a></li>
              <li><a className="footer-link" href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Solo Development — By solo developers, for solo developers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
