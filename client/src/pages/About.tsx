import React from 'react';
import './about.css';

const About: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>About SoloDevelopment</h1>
        
        <section className="page-section">
          <h2>What SoloDevelopment Is</h2>
          <p>A community for people making games mostly by themselves.</p>
        </section>

        <section className="page-section">
          <h2>Our Mission</h2>
          <p>
            To help solo game developers succeed by connecting them with other solo developers 
            and giving their work fair visibility.
          </p>
          <p>
            We're not trying to change the industry or revolutionize anything. We just think 
            people making games alone deserve a community that actually gets what that's like, 
            and good solo games deserve to be seen.
          </p>
          <p>
            We know how tough solo dev can be: no teammates to lean on, long hours, and the 
            feeling that no one's watching. This community exists to make that journey a little 
            less lonely — not with hype or hustle, but through honest feedback, shared experience, 
            and a sense of belonging.
          </p>
        </section>

        <section className="page-section">
          <h2>What Happens Here</h2>
          <p>
            SoloDevelopment is a quiet but active corner of the internet for solo game devs. 
            Here's what you'll find:
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <h3>People sharing what they're working on</h3>
              <p>Devlogs, prototypes, finished games, it's all welcome.</p>
            </div>

            <div className="feature-item">
              <h3>Helpful, honest feedback</h3>
              <p>No sugarcoating, no gatekeeping, just other devs who get what you're trying to do.</p>
            </div>

            <div className="feature-item">
              <h3>Game jams</h3>
              <p>We run monthly and seasonal jams to help you start (or finish) a project. No prizes, no pressure, just a reason to build.</p>
            </div>

            <div className="feature-item">
              <h3>Showcase highlights</h3>
              <p>We surface great games from the community so they don't get buried.</p>
            </div>

            <div className="feature-item">
              <h3>A focus on craft over clout</h3>
              <p>You don't need to be loud, polished, or productive every day to belong here.</p>
            </div>
          </div>

          <p>
            Whether you're in it for the long haul or just starting out, this is a place to 
            build at your own pace — alongside others doing the same.
          </p>
          
          <p>
            If you're working on games by yourself and want to be around others who get it, 
            you're in the right place.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;