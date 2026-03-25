import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './jams.css';
import { gameData } from '../data/gameData';
import { useJam } from '../hooks/useJam';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import ThemeVoting from '../components/ThemeVoting';
import DateVoting from '../components/DateVoting';

interface JamEntry {
  jamName: string;
  jamUrl: string;
  jamTheme?: string;
  startDate?: string;
  endDate?: string;
  submissions?: number;
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

const jamMeta: { [key: string]: { startDate: string; endDate: string; submissions: number } } = {
  'Marathon Jam #5 — Community Voted': { startDate: 'Jan 9, 2026', endDate: 'Feb 9, 2026', submissions: 139 },
  'Marathon Jam #5 — Cash Prize (Judge Selected)': { startDate: 'Jan 9, 2026', endDate: 'Feb 9, 2026', submissions: 139 },
  'Solo Development Marathon Jam 4': { startDate: 'Feb 7, 2025', endDate: 'Mar 7, 2025', submissions: 95 },
  'Third Marathon Jam': { startDate: 'Apr 1, 2023', endDate: 'May 1, 2023', submissions: 24 },
  'Second Marathon Jam': { startDate: 'Mar 18, 2022', endDate: 'Apr 23, 2022', submissions: 32 },
  'First Marathon Jam': { startDate: 'Jun 25, 2021', endDate: 'Jul 25, 2021', submissions: 111 },
  'Halloween Jam #9': { startDate: 'Oct 24, 2025', endDate: 'Oct 27, 2025', submissions: 88 },
  'Summer Jam #8': { startDate: 'Aug 8, 2025', endDate: 'Aug 11, 2025', submissions: 62 },
  'Solo Development 72hr Jam 7': { startDate: 'May 2, 2025', endDate: 'May 5, 2025', submissions: 61 },
  'Solo Development Game Jam 6 (Winter Jam)': { startDate: 'Dec 13, 2024', endDate: 'Dec 16, 2024', submissions: 47 },
  'Solo Development Game Jam 5 (Spooky Jam)': { startDate: 'Oct 25, 2024', endDate: 'Oct 28, 2024', submissions: 44 },
  'Solo Development Game Jam 4': { startDate: 'Aug 23, 2024', endDate: 'Aug 26, 2024', submissions: 197 },
  'Winter Jam': { startDate: 'Jan 13, 2023', endDate: 'Jan 16, 2023', submissions: 85 },
  'Halloween Jam 2021': { startDate: 'Oct 29, 2021', endDate: 'Nov 1, 2021', submissions: 38 },
  'First r/SoloDevelopment Jam': { startDate: 'Apr 30, 2021', endDate: 'May 3, 2021', submissions: 46 },
};

function extractJamGroups() {
  const seen = new Set<string>();
  const marathon: JamEntry[] = [];
  const themed: JamEntry[] = [];

  for (const game of gameData) {
    if (seen.has(game.jamName)) continue;
    seen.add(game.jamName);
    const meta = jamMeta[game.jamName];
    const entry: JamEntry = {
      jamName: game.jamName,
      jamUrl: game.jamUrl,
      jamTheme: game.jamTheme,
      ...(meta && { startDate: meta.startDate, endDate: meta.endDate, submissions: meta.submissions }),
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
      <Helmet>
        <title>Game Jams — Solo Development</title>
        <meta name="description" content="Monthly and seasonal game jams for solo developers. Themed 72-hour jams and month-long marathon jams with cash prizes." />
        <link rel="canonical" href="https://solodevelopment.org/jams" />
        <meta property="og:title" content="Game Jams — Solo Development" />
        <meta property="og:description" content="Monthly and seasonal game jams for solo developers. Themed 72-hour jams and month-long marathon jams with cash prizes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solodevelopment.org/jams" />
        <meta property="og:site_name" content="Solo Development" />
      </Helmet>
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Game Jams</h1>
          <p>Monthly and seasonal jams for solo game developers.</p>
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
          ) : jamData && jamData.status === 'ended' ? (
            <div className="jam-featured-card jam-ended-card">
              <div className="jam-ended-layout">
                <div className="jam-ended-info">
                  <span className="jam-ended-badge">Ended</span>
                  <h2 className="jam-title">{jamData.title}</h2>
                  <p className="jam-ended-meta">
                    {new Date(jamData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(jamData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {jamData.theme && jamData.theme !== 'TBD' && <> &middot; Theme: "{jamData.theme}"</>}
                  </p>
                  <p className="jam-ended-stats">{jamData.participants} joined &middot; {jamData.submissions} games submitted</p>
                </div>
                <div className="jam-ended-actions">
                  <a href={jamData.url} className="btn btn-secondary" target="_blank" rel="noopener noreferrer nofollow">View Results</a>
                  <a href="https://forms.gle/gpvm9AZaft4uK7oYA" className="btn btn-ghost" target="_blank" rel="noopener noreferrer nofollow">Suggest a Theme</a>
                </div>
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
                    {jamData.status === 'upcoming' ? 'itch.io page' : 'Join Jam'}
                  </a>
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
          votingRoundName={jamData.votingRoundName}
        />
      )}

      {/* Date Voting Section */}
      {jamData && jamData.isDateVotingOpen && (
        <DateVoting
          jamId={jamData.id || ''}
          isDateVotingOpen={jamData.isDateVotingOpen}
        />
      )}

      <section className="section-past-jams" data-fade data-delay="5">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Past Jams</h2>
            <a href="/showcase" className="btn btn-ghost btn-sm">See Winners</a>
          </div>

          <h3 className="jam-group-title">Marathon Jams <span className="jam-group-desc">— Month-long sprints for bigger ideas or ongoing solo projects</span></h3>
          <div className="jam-table">
            <div className="jam-table-header">
              <span className="jam-col-name">Jam</span>
              <span className="jam-col-dates">Dates</span>
              <span className="jam-col-games">Games</span>
            </div>
            {marathon.map((jam) => (
              <a key={jam.jamName} href={jam.jamUrl} className="jam-table-row" target="_blank" rel="noopener noreferrer nofollow">
                <span className="jam-col-name">{jam.jamName}</span>
                <span className="jam-col-dates">{jam.startDate && jam.endDate ? `${jam.startDate} — ${jam.endDate}` : '—'}</span>
                <span className="jam-col-games">{jam.submissions || '—'}</span>
              </a>
            ))}
          </div>

          <h3 className="jam-group-title">Themed Jams <span className="jam-group-desc">— 72-hour jams with a community-voted theme</span></h3>
          <div className="jam-table">
            <div className="jam-table-header">
              <span className="jam-col-name">Jam</span>
              <span className="jam-col-theme">Theme</span>
              <span className="jam-col-dates">Dates</span>
              <span className="jam-col-games">Games</span>
            </div>
            {themed.map((jam) => (
              <a key={jam.jamName} href={jam.jamUrl} className="jam-table-row" target="_blank" rel="noopener noreferrer nofollow">
                <span className="jam-col-name">{jam.jamName}</span>
                <span className="jam-col-theme">{jam.jamTheme || '—'}</span>
                <span className="jam-col-dates">{jam.startDate && jam.endDate ? `${jam.startDate} — ${jam.endDate}` : '—'}</span>
                <span className="jam-col-games">{jam.submissions || '—'}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jams;