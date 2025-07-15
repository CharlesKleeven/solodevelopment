import React from 'react';

const Showcase: React.FC = () => {
  return (
    <div>
      <h1>Game Showcase</h1>
      <p>Discover incredible games built by solo developers. From indie darlings to experimental prototypes, see what our community creates.</p>

      <h2>Hall of Fame</h2>
      <p>Winners and standout games from our community jams</p>

      <h3>Marathon Jam Winners</h3>
      <div>
        <h4>Marathon Jam #4</h4>
        <ul>
          <li><strong>Hack the Loop</strong> by @ProYd</li>
          <li><strong>YesterSol</strong> by @NeatGames</li>
          <li><strong>Survive The Day: Dave's Coffee</strong> by @Lou Bagel</li>
        </ul>
      </div>

      <div>
        <h4>Marathon Jam #3</h4>
        <ul>
          <li><strong>Out Here Alone</strong> by @blackvoidtytan</li>
        </ul>
      </div>

      <div>
        <h4>Marathon Jam #2</h4>
        <ul>
          <li><strong>Scavengers from Planet X</strong> by @fernandolv3</li>
        </ul>
      </div>

      <div>
        <h4>Marathon Jam #1</h4>
        <ul>
          <li><strong>DF FBLA</strong> by @lonelylily</li>
        </ul>
      </div>

      <h3>Special Jam Winners</h3>
      <div>
        <h4>Winter Jam</h4>
        <ul>
          <li><strong>Operation MC: Codename Melting Point</strong> by @drahmen</li>
          <li><strong>Track Master</strong> by @ensom_</li>
        </ul>
      </div>

      <div>
        <h4>Spooky Jam</h4>
        <ul>
          <li><strong>Guardian of the Grave</strong> by @drahmen</li>
          <li><strong>Hank The Imp</strong> by @Emcee</li>
          <li><strong>Maybel in the Hazy Hotel</strong> by @log64</li>
        </ul>
      </div>

      <div>
        <h4>Halloween Jam 2021</h4>
        <ul>
          <li><strong>I Came Home Tonight</strong> by @blackvoidtytan and @radagast08</li>
        </ul>
      </div>

      <div>
        <h4>First r/SoloDevelopment Jam</h4>
        <ul>
          <li><strong>There's Something Wrong With This World</strong> by @blackvoidtytan</li>
        </ul>
      </div>

      <hr />

      <h2>Recent Submissions</h2>
      <p>Latest games from the community</p>
      <p><em>Community game submissions coming soon...</em></p>

      <hr />

      <h2>Submit Your Game</h2>
      <p>Share your game with the community</p>
      <button>Submit Project</button>
    </div>
  );
};

export default Showcase;