import React from 'react';

const Community: React.FC = () => {
  return (
    <div>
      <h1>Community</h1>
      <p>Connect with other solo developers</p>

      <h2>Discord</h2>
      <p>Join our active Discord community for real-time chat, feedback, and collaboration.</p>
      <ul>
        <li>Get help with your projects</li>
        <li>Share progress and screenshots</li>
        <li>Find collaborators for game jams</li>
        <li>Participate in community events</li>
      </ul>
      <a href="https://discord.gg/your-discord-link" target="_blank" rel="noopener noreferrer">
        <button>Join Discord</button>
      </a>

      <h2>Reddit</h2>
      <p>r/solodevelopment subreddit for discussions, showcases, and community updates.</p>
      <ul>
        <li>Share your games and get feedback</li>
        <li>Ask questions and help others</li>
        <li>Participate in weekly threads</li>
        <li>Stay updated on jam announcements</li>
      </ul>
      <a href="https://reddit.com/r/solodevelopment" target="_blank" rel="noopener noreferrer">
        <button>Browse r/solodevelopment</button>
      </a>

      <h2>Community Guidelines</h2>
      <h3>Be Respectful</h3>
      <p>Treat all community members with respect and kindness.</p>

      <h3>Stay On Topic</h3>
      <p>Keep discussions related to solo game development.</p>

      <h3>No Spam</h3>
      <p>Don't spam your projects. Share thoughtfully and engage with others.</p>

      <h3>Help Others</h3>
      <p>Support fellow developers by offering feedback and assistance.</p>

      <h3>Follow Platform Rules</h3>
      <p>Respect Discord and Reddit's terms of service.</p>

      <h2>Community Stats</h2>
      <ul>
        <li>Discord Members: 2,847</li>
        <li>Reddit Subscribers: 15,230</li>
        <li>Active Developers: 1,247</li>
        <li>Games Submitted: 432</li>
        <li>Completed Jams: 15</li>
      </ul>

      <h2>Get Involved</h2>
      <h3>For New Members</h3>
      <ul>
        <li>Introduce yourself in Discord</li>
        <li>Share your current project</li>
        <li>Join the next game jam</li>
      </ul>

      <h3>For Experienced Developers</h3>
      <ul>
        <li>Mentor new developers</li>
        <li>Contribute resources and guides</li>
        <li>Help moderate discussions</li>
      </ul>

      <h2>Contact</h2>
      <p>Questions about the community? Reach out to the moderators.</p>
      <ul>
        <li>Discord: Message @moderators</li>
        <li>Reddit: Message the r/solodevelopment mods</li>
        <li>Email: community@solodevelopment.org</li>
      </ul>
    </div>
  );
};

export default Community;