import { useState, useEffect } from 'react';
import './jams.css';
import { gameData } from '../data/gameData';
import { useJam } from '../hooks/useJam'; // Add this import
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

interface JamEntry {
  jamName: string;
  jamUrl: string;
  jamTheme?: string;
}

function getTimeLeft(targetTime: Date, currentTime: Date) {
  const diff = targetTime.getTime() - currentTime.getTime();
  if (diff <= 0) return { days: '00', hours: '00', minutes: '00' };

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
  };
}

function extractJamGroups() {
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

  return {
    marathon: marathon.reverse(),
    themed: themed.reverse(),
  };
}

const Jams = () => {
  useFadeInOnScroll();
  const { jamData, loading: jamLoading } = useJam(); // Add this
  const [showMarathon, setShowMarathon] = useState(false);
  const [showThemed, setShowThemed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { marathon, themed } = extractJamGroups();
  
  // Update current time every minute for accurate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Use dynamic target time based on status
  let targetTime, timerLabel;
  if (jamData) {
    if (jamData.status === 'upcoming') {
      targetTime = new Date(jamData.startDate);
      timerLabel = 'starts in:';
    } else {
      targetTime = new Date(jamData.endDate);
      timerLabel = 'ends in:';
    }
  } else {
    targetTime = new Date(Date.now() + 1000 * 60 * 60 * 62);
    timerLabel = 'ends in:';
  }

  const timeLeft = getTimeLeft(targetTime, currentTime);

  return (
    <div className="jams-page">
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Game Jams</h1>
          <p>SoloDevelopment hosts monthly and seasonal jams to help you build, learn, and finish projects — on your own terms.</p>
        </div>
      </section>

      <section className="jam-featured" data-fade data-delay="2">
        <div className="container">
          {jamLoading ? (
            <div className="jam-featured-card">
              <div className="jam-status">
                <div className="status-dot"></div>
                <span className="status-text">Loading...</span>
              </div>
              <h2 className="jam-title">Loading jam data...</h2>
            </div>
          ) : jamData ? (
            <div className="jam-featured-card">
              <div className={`jam-status ${jamData.status}`}>
                <div className="status-dot"></div>
                <span className="status-text">
                  {jamData.status === 'upcoming' ? 'Upcoming' :
                    jamData.status === 'active' ? 'Active' : 'Ended'}
                </span>
                <span className="jam-participants">{jamData.participants} participants</span>
              </div>
              <h2 className="jam-title">{jamData.title}</h2>
              <p className="jam-theme">
                Theme: {jamData.theme !== 'TBD' ? `"${jamData.theme}"` : jamData.theme}
              </p>
              <p className="jam-description">{jamData.description}</p>

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
                <a href={jamData.url} className="btn btn-primary">
                  {jamData.status === 'upcoming' ? 'Learn More' :
                    jamData.status === 'active' ? 'Join Jam' : 'View Results'}
                </a>
                {(jamData.status === 'active' || jamData.status === 'ended') && (
                  <a href={jamData.url} className="btn btn-secondary">View Submissions</a>
                )}
              </div>
            </div>
          ) : (
            // Fallback if API fails - matches current jam config
            <div className="jam-featured-card">
              <div className="jam-status upcoming">
                <div className="status-dot"></div>
                <span className="status-text">Upcoming</span>
                <span className="jam-participants">0 participants</span>
              </div>
              <h2 className="jam-title">Summer Jam</h2>
              <p className="jam-theme">Theme: TBD</p>
              <p className="jam-description">3-day jam with theme to be announced</p>

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
                <a href="https://itch.io/jam/solodevelopment-summer-jam" className="btn btn-primary" target="_blank" rel="noopener noreferrer nofollow">Learn More</a>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section-info" data-fade data-delay="3">
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

      <section className="section-past-jams" data-fade data-delay="4">
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
                {marathon.map((jam) => (
                  <li key={jam.jamName}>
                    <a href={jam.jamUrl} className="jam-title-link" target="_blank" rel="noopener noreferrer nofollow">
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
                {themed.map((jam) => (
                  <li key={jam.jamName}>
                    <a href={jam.jamUrl} className="jam-title-link" target="_blank" rel="noopener noreferrer nofollow">
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