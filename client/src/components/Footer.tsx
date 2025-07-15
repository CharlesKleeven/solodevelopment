import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <hr />
      <div>
        <div>
          <h3>Community</h3>
          <ul>
            <li><a href="https://discord.gg/your-discord-link" target="_blank" rel="noopener noreferrer">Discord Server</a></li>
            <li><a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer">Reddit</a></li>
            <li><a href="https://solodevelopment.itch.io" target="_blank" rel="noopener noreferrer">Itch.io</a></li>
            <li><a href="/community">Community Guidelines</a></li>
          </ul>
        </div>

        <div>
          <h3>Resources</h3>
          <ul>
            <li><a href="/jams">Game Jams</a></li>
            <li><a href="/showcase">Hall of Fame</a></li>
            <li><a href="/resources">Getting Started</a></li>
            <li><a href="/resources">Tools & Software</a></li>
            <li><a href="#">Wiki</a></li>
          </ul>
        </div>

        <div>
          <h3>About</h3>
          <ul>
            <li><a href="#">About SoloDevelopment</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Contribute</a></li>
            <li><a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>

        <div>
          <h3>Support</h3>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Help</a></li>
            <li><a href="#">Feedback</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div>
        <p>&copy; 2025 SoloDevelopment.org — Built by solo devs, for solo devs</p>
      </div>
    </footer>
  );
};

export default Footer;