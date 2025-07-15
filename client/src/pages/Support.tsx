import React from 'react';

const Support: React.FC = () => {
  return (
    <div>
      <h1>Support</h1>
      <p>Help, FAQ, and community guidelines</p>

      <nav>
        <a href="#faq">FAQ</a> | <a href="#help">Help</a> | <a href="#privacy">Privacy</a> | <a href="#contact">Contact</a>
      </nav>

      <hr />

      <section id="faq">
        <h2>FAQ</h2>

        <h3>What is SoloDevelopment?</h3>
        <p>A community for independent game developers working alone. We host game jams, share resources, and support each other.</p>

        <h3>How do I join game jams?</h3>
        <p>Check our Jams page for upcoming events. Click the itch.io link to join, then develop your game during the jam period.</p>

        <h3>How do I submit my game?</h3>
        <p>Use the "Submit Project" button on the Showcase page. You can submit jam entries or independent projects.</p>

        <h3>What are the community rules?</h3>
        <p>Be respectful, stay on topic, help others, and follow platform guidelines. No spam or self-promotion without community engagement.</p>

        <h3>Can beginners participate?</h3>
        <p>Absolutely! Our community welcomes all skill levels. Game jams are great for learning and practicing.</p>
      </section>

      <hr />

      <section id="help">
        <h2>Help</h2>

        <h3>Getting Help</h3>
        <ul>
          <li><strong>Discord:</strong> Join our server for real-time help (#support channel)</li>
          <li><strong>Reddit:</strong> Post questions in r/solodevelopment</li>
          <li><strong>Email:</strong> help@solodevelopment.org</li>
        </ul>

        <h3>Common Issues</h3>
        <ul>
          <li><strong>Can't log in:</strong> Try password reset or contact us</li>
          <li><strong>Upload problems:</strong> Check file size and format</li>
          <li><strong>Website bugs:</strong> Refresh page or try different browser</li>
        </ul>
      </section>

      <hr />

      <section id="privacy">
        <h2>Privacy Policy</h2>

        <h3>What We Collect</h3>
        <p>Username, email, optional bio, and games you submit. Basic usage data to improve the site.</p>

        <h3>How We Use It</h3>
        <p>To provide the website, manage your account, display your games, and send important updates.</p>

        <h3>Your Rights</h3>
        <p>You can access, correct, or delete your data anytime. Contact us for data requests.</p>

        <h3>Cookies</h3>
        <p>We use cookies to keep you logged in. You can disable them, but some features won't work.</p>

        <p><em>Last updated: January 2025</em></p>
      </section>

      <hr />

      <section id="contact">
        <h2>Contact</h2>

        <h3>Community</h3>
        <ul>
          <li><a href="https://discord.gg/your-link" target="_blank" rel="noopener noreferrer">Discord Server</a></li>
          <li><a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer">Reddit Community</a></li>
        </ul>

        <h3>Support</h3>
        <ul>
          <li>General Help: help@solodevelopment.org</li>
          <li>Privacy/Account: privacy@solodevelopment.org</li>
          <li>Technical Issues: Discord #support</li>
        </ul>
      </section>
    </div>
  );
};

export default Support;