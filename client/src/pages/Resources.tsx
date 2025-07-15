import React from 'react';

const Resources: React.FC = () => {
  return (
    <div>
      <h1>Resources</h1>
      <p>Guides, tools, and knowledge collected by the community. From beginner tutorials to advanced techniques.</p>

      <input type="text" placeholder="Search resources..." />

      <h2>Getting Started</h2>
      <ul>
        <li><a href="#">Choosing your first game engine</a></li>
        <li><a href="#">Solo development workflow guide</a></li>
        <li><a href="#">Scoping your first game project</a></li>
        <li><a href="#">Basic game design principles</a></li>
        <li><a href="#">Version control for solo devs</a></li>
      </ul>
      <a href="#">View all guides →</a>

      <h2>Tools & Software</h2>
      <ul>
        <li><a href="#">Unity vs Godot comparison</a></li>
        <li><a href="#">Free art and audio tools</a></li>
        <li><a href="#">Pixel art software guide</a></li>
        <li><a href="#">Project management tools</a></li>
        <li><a href="#">Marketing and social media</a></li>
      </ul>
      <a href="#">View all tools →</a>

      <h2>Advanced Topics</h2>
      <ul>
        <li><a href="#">Steam release checklist</a></li>
        <li><a href="#">Performance optimization</a></li>
        <li><a href="#">Building a community</a></li>
        <li><a href="#">Monetization strategies</a></li>
        <li><a href="#">Post-launch support</a></li>
      </ul>
      <a href="#">View all topics →</a>

      <h2>Featured Resource</h2>
      <h3>Complete Solo Developer Workflow</h3>
      <p>A comprehensive guide covering the entire journey from concept to release. Learn how to manage your time, stay motivated, and ship games consistently as a solo developer.</p>
      <p>By the community • Updated monthly</p>
      <a href="#">Read the guide →</a>

      <h2>Popular Tools</h2>
      <div>
        <h3>Unity</h3>
        <p>Popular 2D/3D game engine</p>
        <span>Free tier</span>
      </div>

      <div>
        <h3>Godot</h3>
        <p>Open-source game engine</p>
        <span>Free</span>
      </div>

      <div>
        <h3>Aseprite</h3>
        <p>Pixel art and animation</p>
        <span>$19.99</span>
      </div>

      <div>
        <h3>Krita</h3>
        <p>Free digital painting</p>
        <span>Free</span>
      </div>

      <h2>Community Knowledge</h2>
      <div>
        <h3>Developer Insights</h3>
        <blockquote>"Start with the smallest possible version of your idea. You'll learn more from finishing three small games than spending years on one big project."</blockquote>
        <p>— elena • 3 years solo dev</p>
      </div>

      <div>
        <h3>Technical Tips</h3>
        <blockquote>"Don't optimize early, but do think about architecture. A clean codebase will save you weeks when you need to add new features."</blockquote>
        <p>— marco • 5 years solo dev</p>
      </div>

      <h2>Share Your Knowledge</h2>
      <p>Help other solo developers by contributing guides, tools, or insights you've learned during your development journey.</p>
      <button>Contribute Resource</button>
    </div>
  );
};

export default Resources;