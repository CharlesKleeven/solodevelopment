import React from 'react';
import './support.css';

const Support: React.FC = () => {
  return (
    <div className="support-page">
      <h1>Get support</h1>
      <p>If you’re having trouble with the site or need help, you’re in the right place.</p>

      <section id="contact" className="support-section">
        <div className="contact-card">
          <p className="contact-note">
            The fastest way to get help is by messaging the moderators on{' '}
            <a href="https://discord.gg/your-link" target="_blank" rel="noreferrer">Discord</a> and{' '}
            <a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noreferrer">Reddit</a>. You can also leave us a note below.
          </p>

          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={4} placeholder="Describe the issue or question..." required />
            </div>
            <button type="submit" className="btn btn-secondary" disabled>
              Send (coming soon)
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Support;
