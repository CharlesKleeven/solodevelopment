import React from 'react';

const Jams: React.FC = () => {
  return (
    <div>
      <h1>Game Jams</h1>
      <p>Regular challenges to make games in short timeframes. Practice, experiment, and learn with the community.</p>

      <h2>Current Jam</h2>
      <div>
        <h3>Marathon Jam #4</h3>
        <p><strong>Status:</strong> Active</p>
        <p><strong>Theme:</strong> No theme - work on your projects!</p>
        <p><strong>Duration:</strong> 1 month</p>
        <p><strong>Participants:</strong> 95</p>
        <p><strong>Submissions:</strong> 564</p>
        <p>A month-long jam to encourage you to work on your projects! This is a great opportunity to make progress, finish your game, and share it with the community.</p>
        <a href="https://itch.io/jam/solodev-marathon-jam-4" target="_blank" rel="noopener noreferrer">
          <button>Join Marathon Jam #4</button>
        </a>
      </div>

      <h2>Upcoming Jams</h2>
      <div>
        <h3>Spring Jam 2025</h3>
        <p>Duration: 7 days</p>
        <p>Start Date: March 15, 2025</p>
        <p>Theme: TBA</p>
      </div>

      <div>
        <h3>Mini Jam</h3>
        <p>Duration: 48 hours</p>
        <p>Start Date: April 5, 2025</p>
        <p>Theme: Announced Friday evening</p>
      </div>

      <h2>Past Jams</h2>
      <div>
        <h3>Marathon Jam #3</h3>
        <p>Theme: No theme</p>
        <p>Participants: 156</p>
        <p>Games submitted: 89</p>
        <p>Status: Completed</p>
        <a href="https://itch.io/jam/solodev-marathon-jam-3" target="_blank" rel="noopener noreferrer">View results</a>
      </div>

      <div>
        <h3>Halloween Jam 2024</h3>
        <p>Theme: "What Lurks Beneath"</p>
        <p>Participants: 203</p>
        <p>Games submitted: 127</p>
        <p>Status: Completed</p>
        <a href="https://itch.io/jam/halloween-jam-2024" target="_blank" rel="noopener noreferrer">View results</a>
      </div>

      <h2>How Jams Work</h2>
      <ol>
        <li>Register for upcoming jams</li>
        <li>Create your game during the jam timeframe</li>
        <li>Submit to itch.io before the deadline</li>
        <li>Play other games and give feedback</li>
      </ol>
    </div>
  );
};

export default Jams;