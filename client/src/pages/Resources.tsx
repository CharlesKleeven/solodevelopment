import React from 'react';
import { Helmet } from 'react-helmet-async';
import './resources.css';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

const sections = [
  {
    id: 'engines', title: 'Game Engines', items: [
      { name: 'Godot', desc: 'Open-source engine. Uses GDScript, C#, or C++', url: 'https://godotengine.org/', icon: '/images/engines/godot.svg', tags: ['free', 'open source', '2d', '3d', 'beginner'] },
      { name: 'Unity', desc: 'C# engine. Free under $200K revenue. Large asset store', url: 'https://unity.com/', icon: '/images/engines/unity.svg', tags: ['free', '2d', '3d'] },
      { name: 'Unreal', desc: 'C++ engine by Epic. Includes Blueprints visual scripting', url: 'https://www.unrealengine.com/', icon: '/images/engines/unreal.png', tags: ['free', '3d'] },
      { name: 'GameMaker', desc: '2D-focused engine. Free for non-commercial use. Used for Undertale, Hyper Light Drifter', url: 'https://gamemaker.io/', icon: '/images/engines/gamemaker.png', tags: ['free', '2d', 'beginner'] },
      { name: 'Construct', desc: 'Browser-based engine. Drag-and-drop, no code required', url: 'https://www.construct.net/', icon: '/images/engines/construct.png', tags: ['paid', '2d', 'browser', 'beginner'] },
      { name: 'Defold', desc: 'Lua-based engine by King. Focused on 2D and mobile', url: 'https://defold.com/', tags: ['free', '2d'] },
      { name: 'Love2D', desc: 'Lua-based 2D framework. Small footprint', url: 'https://love2d.org/', tags: ['free', 'open source', '2d'] },
      { name: 'Raylib', desc: 'C library for 2D and 3D. Minimal dependencies', url: 'https://www.raylib.com/', tags: ['free', 'open source', '2d', '3d'] },
      { name: 'Bevy', desc: 'Rust engine with ECS architecture. Supports 2D and 3D', url: 'https://bevyengine.org/', tags: ['free', 'open source', '2d', '3d'] },
      { name: 'Pygame', desc: 'Python library for 2D games and prototypes', url: 'https://www.pygame.org/', tags: ['free', 'open source', '2d', 'beginner'] },
      { name: 'RPG Maker', desc: 'RPG-focused engine. No code required. Active plugin community', url: 'https://www.rpgmakerweb.com/', tags: ['paid', '2d', 'beginner'] },
      { name: "Ren'Py", desc: 'Python-based visual novel engine. Widely used in the VN space', url: 'https://www.renpy.org/', tags: ['free', 'open source', '2d'] },
    ]
  },
  {
    id: 'languages', title: 'Languages', items: [
      { name: 'GDScript', desc: 'Godot-specific. Python-like syntax, integrated with the editor', url: 'https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html', tags: ['beginner'] },
      { name: 'C#', desc: 'Used in Unity and Godot. Statically typed, large standard library', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/', tags: [] },
      { name: 'C++', desc: 'Used in Unreal and custom engines. Manual memory management, high performance', url: 'https://www.learncpp.com/', tags: [] },
      { name: 'Lua', desc: 'Used in Love2D, Defold, and game modding. Small runtime, embeddable', url: 'https://www.lua.org/start.html', tags: ['beginner'] },
      { name: 'Rust', desc: 'Used in Bevy. Memory-safe without garbage collector, strict compiler', url: 'https://www.rust-lang.org/learn', tags: [] },
      { name: 'Python', desc: 'Used in Pygame and Ren\'Py. Dynamically typed, widely taught', url: 'https://www.python.org/about/gettingstarted/', tags: ['beginner'] },
    ]
  },
  {
    id: 'tools', title: 'Tools', items: [
      { name: 'Aseprite', desc: 'Pixel art editor with animation support', url: 'https://www.aseprite.org/', tags: ['paid', 'art', '2d'] },
      { name: 'LibreSprite', desc: 'Open source fork of Aseprite. Free pixel art editor', url: 'https://github.com/LibreSprite/LibreSprite', tags: ['free', 'open source', 'art', '2d'] },
      { name: 'Piskel', desc: 'Free browser-based pixel art tool', url: 'https://www.piskelapp.com/', tags: ['free', 'browser', 'art', '2d'] },
      { name: 'Tiled', desc: 'Map editor for 2D tile-based games', url: 'https://www.mapeditor.org/', tags: ['free', 'open source', '2d'] },
      { name: 'SFXR', desc: 'Quick retro sound effect generator', url: 'https://sfxr.me/', tags: ['free', 'browser', 'audio'] },
      { name: 'BeepBox', desc: 'Free browser-based music maker', url: 'https://www.beepbox.co/', tags: ['free', 'browser', 'audio'] },
      { name: 'Ink by Inkle', desc: 'Free narrative scripting tool', url: 'https://www.inklestudios.com/ink/', tags: ['free', 'open source'] },
      { name: 'PureRef', desc: 'Reference image board. Free for personal use', url: 'https://www.pureref.com/', tags: ['free', 'art'] },
      { name: 'Reaper', desc: 'Full DAW for game audio. Free to evaluate, $60 license', url: 'https://www.reaper.fm/', tags: ['paid', 'audio'] },
      { name: 'Audacity', desc: 'Free open source audio editor. Record, edit, export', url: 'https://www.audacityteam.org/', tags: ['free', 'open source', 'audio'] },
    ]
  },
  {
    id: 'assets', title: 'Free Assets', items: [
      { name: 'Kenney', desc: 'Free 2D and 3D game assets. CC0 licensed', url: 'https://kenney.nl/', tags: ['art', '2d', '3d'] },
      { name: 'Open Game Art', desc: 'Community-contributed free game art', url: 'https://opengameart.org/', tags: ['art', '2d'] },
      { name: 'Poly Haven', desc: 'Free textures, HDRIs, and 3D models', url: 'https://polyhaven.com/', tags: ['art', '3d'] },
      { name: 'LoSpec', desc: 'Palettes, tutorials, and job board for pixel artists', url: 'https://lospec.com/', tags: ['art', '2d'] },
      { name: 'Game Icons', desc: 'Free SVG icons for games', url: 'https://game-icons.net/', tags: ['art', '2d'] },
      { name: 'Freesound', desc: 'Collaborative sound library. CC licensed', url: 'https://freesound.org/', tags: ['audio'] },
      { name: 'Sonniss GDC Freebies', desc: 'Royalty-free sound samples from GDC', url: 'https://sonniss.com/gameaudiogdc', tags: ['audio'] },
      { name: 'Poly.Pizza', desc: 'Free low-poly 3D models', url: 'https://poly.pizza', tags: ['art', '3d'] },
    ]
  },
  {
    id: 'learn', title: 'Learn', items: [
      { name: 'Game Programming Patterns', desc: 'Free book by Robert Nystrom', url: 'https://gameprogrammingpatterns.com/', tags: ['free', 'book'] },
      { name: 'The Art of Game Design', desc: 'Design theory book by Jesse Schell. Lens-based framework', url: 'https://www.amazon.com/Art-Game-Design-Book-Lenses/dp/0123694965', tags: ['paid', 'book'] },
      { name: 'Red Blob Games', desc: 'Interactive visual tutorials for pathfinding, grids, noise', url: 'https://www.redblobgames.com/', tags: ['free', 'interactive'] },
      { name: 'The Book of Shaders', desc: 'Free intro to shader programming', url: 'https://thebookofshaders.com/', tags: ['free', 'interactive'] },
      { name: 'DrawABox', desc: 'Free structured art fundamentals course', url: 'https://drawabox.com/', tags: ['free', 'art', 'beginner'] },
      { name: 'Saint11 Pixel Art Tutorials', desc: 'Animated pixel art tutorials by Pedro Medeiros', url: 'https://saint11.org/blog/pixel-art-tutorials/', tags: ['free', 'art', '2d'] },
      { name: 'The Level Design Book', desc: 'Free level design resource', url: 'https://book.leveldesignbook.com/', tags: ['free', 'book'] },
      { name: 'Pattern Language for Game Design', desc: 'Design patterns database with exercises', url: 'https://patternlanguageforgamedesign.com/', tags: ['free', 'interactive'] },
      { name: 'The Platformer Toolkit', desc: 'Playable video essay by Mark Brown (GMTK)', url: 'https://gmtk.itch.io/platformer-toolkit', tags: ['free', 'interactive'] },
      { name: 'The Evolution of Trust', desc: 'Interactive game theory walkthrough', url: 'https://ncase.me/trust/', tags: ['free', 'interactive'] },
      { name: 'Game Accessibility Guidelines', desc: 'Practical accessibility checklist sorted by difficulty', url: 'https://gameaccessibilityguidelines.com/', tags: ['free'] },
      { name: 'Game UI Database', desc: 'Searchable game UI design reference', url: 'https://www.gameuidatabase.com/', tags: ['free', 'art'] },
      { name: 'Math for Game Devs', desc: 'Video series on game math by Freya Holmer', url: 'https://www.youtube.com/watch?v=MOYiVLEnhrw&list=PLImQaTpSAdsD88wprTConznD1OY1EfK_V', tags: ['free', 'video'] },
      { name: 'Laws of UX', desc: 'Collection of UX design principles with examples', url: 'https://lawsofux.com/', tags: ['free', 'art'] },
    ]
  },
  {
    id: 'marketing', title: 'Marketing', items: [
      { name: 'How to Market a Game', desc: 'Blog by Chris Zukowski on indie game marketing and Steam visibility', url: 'https://howtomarketagame.com', tags: ['free'] },
      { name: 'Leveling the Playing Field', desc: 'Rami Ismail on business, marketing, and indie survival', url: 'https://ltpf.ramiismail.com', tags: ['free'] },
      { name: "Derek Lieu's Blog", desc: 'Game trailer advice from a professional', url: 'https://www.derek-lieu.com/blog/', tags: ['free', 'video'] },
      { name: 'Publisher Pitch Deck Template', desc: 'Real pitch deck revised with publisher feedback', url: 'https://docs.google.com/presentation/d/1gcoaQfOpHfc6XBkiO6dJUIyd9DDotB4_2TPpZe1S144/edit', tags: ['free'] },
      { name: "Seyed's Publisher Database", desc: 'Curated list of PC/Console indie game publishers', url: 'https://docs.google.com/spreadsheets/d/15AN1I1mB67AJkpMuUUfM5ZUALkQmrvrznnPYO5QbqD0/edit', tags: ['free'] },
    ]
  },
  {
    id: 'community', title: 'Community', items: [
      { name: 'Solo Development Discord', desc: 'Main community hangout', url: 'https://discord.gg/uXeapAkAra', tags: ['free'] },
      { name: 'r/solodevelopment', desc: 'Our subreddit', url: 'https://reddit.com/r/solodevelopment', tags: ['free'] },
      { name: 'r/gamedev', desc: 'General game development', url: 'https://reddit.com/r/gamedev', tags: ['free'] },
      { name: 'r/IndieDev', desc: 'Indie game development', url: 'https://reddit.com/r/indiedev', tags: ['free'] },
      { name: 'Itch.io', desc: 'Our game jams and community page', url: 'https://solodevelopment.itch.io/', tags: ['free'] },
      { name: 'Music for Programming', desc: 'Background music for focus', url: 'https://musicforprogramming.net/', tags: ['free', 'audio'] },
    ]
  },
];

const Resources: React.FC = () => {
  useFadeInOnScroll();

  return (
    <div className="resources-page">
      <Helmet>
        <title>Resources — Solo Development</title>
        <meta name="description" content="Game engines, tools, free assets, and learning resources curated for solo game developers." />
      </Helmet>
      <section className="page-header" data-fade data-delay="1">
        <div className="container">
          <h1>Resources</h1>
          <p>Tools and links curated for solo game developers.</p>
        </div>
      </section>

      <div className="container">
        <nav className="res-toc" data-fade data-delay="2">
          {sections.map((s, i) => (
            <span key={s.id}>
              <a href={`#${s.id}`} className="res-toc-link">{s.title}</a>
              {i < sections.length - 1 && <span className="res-toc-sep">/</span>}
            </span>
          ))}
        </nav>
        <div className="res-content" data-fade data-delay="3">
            {sections.map(s => (
              <section key={s.id} id={s.id} className="res-section">
                <h2>{s.title}</h2>
                <div className="res-table">
                  <div className="res-table-header">
                    <span className="res-col-name">Name</span>
                    <span className="res-col-desc">Description</span>
                    <span className="res-col-tags">Tags</span>
                  </div>
                  {s.items.map((item, i) => (
                    <a key={i} href={item.url} className="res-row" target="_blank" rel="noopener noreferrer nofollow">
                      <span className="res-col-name">
                        {item.name}
                        {(item as any).icon && <img src={(item as any).icon} alt="" className="res-row-icon" />}
                      </span>
                      <span className="res-col-desc">{item.desc}</span>
                      <span className="res-col-tags">
                        {item.tags && item.tags.length > 0 && item.tags.map((tag, j) => (
                          <span key={j} className="res-tag">{tag}</span>
                        ))}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
