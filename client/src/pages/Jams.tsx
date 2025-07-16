import { useState } from 'react';
import './jams.css';
import { gameData } from '../data/gameData';

interface JamEntry {
  jamName: string;
  jamUrl: string;
  jamTheme?: string;
}

function getTimeLeft(endTime: Date): { days: string; hours: string; minutes: string } {
  const diff = endTime.getTime() - new Date().getTime();
  if (diff <= 0) return { days: '00', hours: '00', minutes: '00' };

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0')
  };
}

function extractJamGroups(): {
  marathon: JamEntry[];
  themed: JamEntry[];
} {
  const seen = new Set<string>();
  const marathon: JamEntry[] = [];
  const themed: JamEntry[] = [];

  for (const game of gameData) {
    if (seen.has(game.jamName)) continue;
    seen.add(game.jamName);

    const entry = {
      jamName: game.jamName,
      jamUrl: game.jamUrl,
      jamTheme: game.jamTheme,
    };

    if (game.jamType === 'marathon') marathon.push(entry);
    else themed.push(entry);
  }

  marathon.reverse();
  themed.reverse();

  return { marathon, themed };
}

const Jams = () => {
  const [showMarathon, setShowMarathon] = useState(false);
  const [showThemed, setShowThemed] = useState(false);
  const { marathon, themed } = extractJamGroups();
  const fakeEndTime = new Date(Date.now() + 1000 * 60 * 60 * 62); // 2d 14h
  const timeLeft = getTimeLeft(fakeEndTime);

  return (
    <div className="jams-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <h1>Game Jams</h1>
          <p>SoloDevelopment hosts monthly and seasonal jams to help you build, learn, and finish projects — on your own terms.</p>
        </div>
      </section>

      {/* Featured Jam - Centerpiece */}
      <section className="jam-featured">
        <div className="container">
          <div className="jam-featured-card">
            <div className="jam-status">
              <div className="status-dot"></div>
              <span className="status-text">Active Jam</span>
              <span className="jam-participants">127 participants</span>
            </div>

            <h2 className="jam-title">Winter Jam 2025</h2>
            <p className="jam-theme">Theme: "Connections"</p>
            <p className="jam-description">
              Explore how systems, characters, or moments relate in this moody winter 72-hour jam.
            </p>

            {/* Prominent Timer */}
            <div className="jam-timer">
              <div className="timer-unit">
                <div className="timer-number">{timeLeft.days}</div>
                <div className="timer-label">Days</div>
              </div>
              <div className="timer-unit">
                <div className="timer-number">{timeLeft.hours}</div>
                <div className="timer-label">Hours</div>
              </div>
              <div className="timer-unit">
                <div className="timer-number">{timeLeft.minutes}</div>
                <div className="timer-label">Minutes</div>
              </div>
            </div>

            <div className="jam-actions">
              <button className="btn btn-primary">Join Now</button>
              <button className="btn btn-secondary">View Submissions</button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-info">
        <div className="container">
          <h2>What Are SoloDev Jams?</h2>
          <p>We run two kinds of jams:</p>
          <ul>
            <li><strong>Themed Jams</strong> — Short 72-hour bursts with a community-voted theme. Great for experimenting and finishing something small.</li>
            <li><strong>Marathon Jams</strong> — Month-long sprints for bigger ideas or ongoing solo projects. Relaxed, open-ended, and rewarding.</li>
          </ul>
          <p>You can join anytime. No experience required.</p>
        </div>
      </section>

      {/* Past Jams */}
      <section className="section-past-jams">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Past Jams</h2>
            <a href="/showcase" className="btn btn-ghost btn-sm">See Winners</a>
          </div>

          <div className="jam-group">
            <button className="accordion-toggle" onClick={() => setShowMarathon(!showMarathon)}>
              Marathon Jams {showMarathon ? '▾' : '▸'}
            </button>
            {showMarathon && (
              <ul className="jam-list">
                {marathon.map(jam => (
                  <li key={jam.jamName}>
                    <a href={jam.jamUrl} className="jam-title-link" target="_blank" rel="noopener noreferrer">
                      {jam.jamName}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="jam-group">
            <button className="accordion-toggle" onClick={() => setShowThemed(!showThemed)}>
              Themed Jams {showThemed ? '▾' : '▸'}
            </button>
            {showThemed && (
              <ul className="jam-list">
                {themed.map(jam => (
                  <li key={jam.jamName}>
                    <a href={jam.jamUrl} className="jam-title-link" target="_blank" rel="noopener noreferrer">
                      {jam.jamName}
                    </a>
                    {jam.jamTheme && <span className="jam-note">— {jam.jamTheme}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jams;