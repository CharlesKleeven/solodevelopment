// Current jam configuration
// UPDATE THIS FILE when you start a new jam!

export interface JamConfig {
  title: string;
  theme: string;
  description: string;
  url: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  status: 'upcoming' | 'active' | 'ended';
}

// UPDATE THIS FOR NEW JAMS:
export const currentJam: JamConfig = {
  title: "Summer Jam",
  theme: "TBD", // Update when theme is announced
  description: "3-day jam with theme to be announced",
  url: "https://itch.io/jam/solodevelopment-summer-jam",
  startDate: "2025-08-08T19:00:00.000Z", // August 8, 2025, 3:00 PM EDT
  endDate: "2025-08-11T19:00:00.000Z",   // August 11, 2025, 3:00 PM EDT
  status: "upcoming" // manually set: upcoming, active, or ended
};

// 📝 EXAMPLE FOR NEXT JAM:
// export const currentJam: JamConfig = {
//   title: "Fall Marathon",
//   theme: "Retro Vibes",
//   description: "30-day marathon exploring retro game aesthetics",
//   url: "https://itch.io/jam/solodevelopment-fall-marathon",
//   startDate: "2025-09-01T00:00:00.000Z",
//   endDate: "2025-09-30T23:59:59.000Z",
//   status: "upcoming"
// };