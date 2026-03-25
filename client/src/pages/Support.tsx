import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './support.css';

const Support: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/contact', {
        email: email.trim() || undefined,
        message: message.trim()
      });

      setSuccess(true);
      setEmail('');
      setMessage('');
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <Helmet>
        <title>Contact — Solo Development</title>
        <meta name="description" content="Get help, report issues, or submit a ban appeal for the Solo Development community." />
        <link rel="canonical" href="https://solodevelopment.org/support" />
        <meta property="og:title" content="Contact — Solo Development" />
        <meta property="og:description" content="Get help, report issues, or submit a ban appeal for the Solo Development community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solodevelopment.org/support" />
        <meta property="og:site_name" content="Solo Development" />
      </Helmet>
      <h1>Get support</h1>
      <p>If you're having trouble with the site or need help, you're in the right place.</p>

      <section id="contact" className="support-section">
        <div className="contact-card">
          <p className="contact-note">
            The fastest way to get help is by messaging the moderators on{' '}
            <a href="https://discord.gg/uXeapAkAra" target="_blank" rel="noopener noreferrer nofollow">Discord</a> and{' '}
            <a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer nofollow">Reddit</a>. You can also leave us a note below.
          </p>

          {success && (
            <div className="success-message">
              Message sent successfully! We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email (optional)</label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message" 
                rows={4} 
                placeholder="Describe the issue or question..." 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                minLength={10}
                maxLength={1000}
              />
              <small className="char-count">{message.length}/1000</small>
            </div>
            <button 
              type="submit" 
              className="btn btn-secondary" 
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      <section className="support-section">
        <div className="contact-card">
          <h2>Ban Appeal</h2>
          <p className="contact-note">
            If you've been banned and believe it was a mistake or want to appeal, you can submit a ban appeal form.
          </p>
          <a href="https://forms.gle/XEuXXk6RNenQSAnU6" target="_blank" rel="noopener noreferrer nofollow" className="btn btn-secondary">
            Submit Ban Appeal
          </a>
        </div>
      </section>
    </div>
  );
};

export default Support;
