import { useState, useEffect } from 'react';
import './jams.css';
import { gameData } from '../data/gameData';
import { useJam } from '../hooks/useJam';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import ThemeVoting from '../components/ThemeVoting';

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
  const { jamData, loading: jamLoading } = useJam();
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
  let targetTime;
  if (jamData) {
    if (jamData.status === 'upcoming') {
      targetTime = new Date(jamData.startDate);
    } else {
      targetTime = new Date(jamData.endDate);
    }
  } else {
    targetTime = new Date(Date.now() + 1000 * 60 * 60 * 62);
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
              <div className="jam-header">
                <h2 className="jam-title">Loading jam data...</h2>
              </div>
            </div>
          ) : jamData ? (
            <div className="jam-featured-card">
              <div className="jam-header">
                <h2 className="jam-title">{jamData.title}</h2>
                <p className="jam-theme">
                  {jamData.theme !== 'TBD' ? 
                    `theme: "${jamData.theme}"` : 
                    'theme: TBD'}
                </p>
              </div>

              <div className="jam-timer-section">
                <div className="timer-label-main">
                  {jamData.status === 'upcoming' ? 'starts in' : 'ends in'}
                </div>
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
                <div className="timer-participants">
                  {jamData.participants} joined
                </div>
              </div>

              <div className="jam-bottom-section">
                <div className="jam-actions">
                  <a href={jamData.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer nofollow">
                    {jamData.status === 'upcoming' ? 'itch.io page' :
                      jamData.status === 'active' ? 'Join Jam' : 'View Results'}
                  </a>
                  {(jamData.status === 'active' || jamData.status === 'ended') && (
                    <a href={jamData.url} className="btn btn-ghost" target="_blank" rel="noopener noreferrer nofollow">View Submissions</a>
                  )}
                </div>
                
                {jamData.isVotingOpen && (
                  <div className="voting-flow">
                    <div className="voting-hint">
                      <span>↓ vote on themes below</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Fallback if API fails - matches current jam config
            <div className="jam-featured-card">
              <div className="jam-header">
                <h2 className="jam-title">Summer Jam</h2>
                <p className="jam-theme">theme: TBD</p>
              </div>

              <div className="jam-timer-section">
                <div className="timer-label-main">starts in</div>
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
              </div>

              <div className="jam-bottom-section">
                <div className="jam-actions">
                  <a href="https://itch.io/jam/solodevelopment-summer-jam" className="btn btn-primary" target="_blank" rel="noopener noreferrer nofollow">itch.io page</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Theme Voting Section - Component handles its own rendering */}
      {jamData && jamData.status === 'upcoming' && (
        <ThemeVoting 
          jamId={jamData.id || 'summer-jam-2025'} 
          votingDeadline={new Date(jamData.startDate)}
          isVotingOpen={jamData.isVotingOpen ?? true}
        />
      )}

      <section className="section-info" data-fade data-delay="5">
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

      <section className="section-past-jams" data-fade data-delay="6">
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