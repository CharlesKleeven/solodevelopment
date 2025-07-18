// data/gameData.ts

export interface Game {
    id: number;
    title: string;
    author: string;
    url: string;
    jamName: string;
    jamUrl: string;
    jamType: 'marathon' | 'themed'; // Simplified to just marathon vs themed
    jamTheme?: string; // Added theme field
    placement?: number; // Winner placement (1st, 2nd, 3rd)
    thumb: string;
    image?: string;
}

export const gameData: Game[] = [
    {
        id: 1,
        title: "There's Something Wrong With This World",
        author: "@blackvoidtytan",
        url: "https://blackvoidmedia.itch.io/theres-something-wrong-with-this-world",
        jamName: "First r/SoloDevelopment Jam",
        jamUrl: "https://itch.io/jam/solodevelopment-game-jam",
        jamType: "themed",
        jamTheme: "Minimalism",
        thumb: "T",
        image: "/images/games/something-wrong-world.png"
    },
    {
        id: 2,
        title: "DF FBLA",
        author: "@lonelylily",
        url: "https://razziefox.itch.io/df-fbla",
        jamName: "First Marathon Jam",
        jamUrl: "https://itch.io/jam/marathon-jam-by-solodevelopment",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "D",
        image: "/images/games/df-fbla.png"
    },
    {
        id: 3,
        title: "I Came Home Tonight",
        author: "@blackvoidtytan and @radagast08",
        url: "https://blackvoidmedia.itch.io/i-came-home-tonight",
        jamName: "Halloween Jam 2021",
        jamUrl: "https://itch.io/jam/halloween-jam-2021",
        jamType: "themed",
        jamTheme: "Ghosts doing Normal People Things",
        thumb: "I",
        image: "/images/games/i-came-home-tonight.png"
    },
    {
        id: 4,
        title: "Track Master",
        author: "@ensom_",
        url: "https://uppastgamer.itch.io/track-master",
        jamName: "Winter Jam",
        jamUrl: "https://itch.io/jam/winter-jam-by-solodevelopment",
        jamType: "themed",
        jamTheme: "End is Near",
        thumb: "T",
        image: "/images/games/track-master.png"
    },
    {
        id: 5,
        title: "Scavengers from Planet X",
        author: "@fernandolv3",
        url: "https://fernandolv3.itch.io/scavengersfromplanetx",
        jamName: "Second Marathon Jam",
        jamUrl: "https://itch.io/jam/marathon-jam-2022-by-solodevelopment",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "S",
        image: "/images/games/scavengers-planet-x.png"
    },
    {
        id: 6,
        title: "Out Here Alone",
        author: "@blackvoidtytan",
        url: "https://blackvoidmedia.itch.io/out-here-alone",
        jamName: "Third Marathon Jam",
        jamUrl: "https://itch.io/jam/marathon-jam-3-by-solodevelopment",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "O",
        image: "/images/games/out-here-alone.png"
    },
    {
        id: 7,
        title: "Mutual Assured Destruction Simulator",
        author: "@blackvoidtytan",
        url: "https://blackvoidmedia.itch.io/mutual-assured-destruction-simulatorr",
        jamName: "SoloDevelopment Game Jam 4",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
        jamType: "themed",
        jamTheme: "Two Button Controls",
        thumb: "M",
        image: "/images/games/mutual-destruction.png"
    },
    {
        id: 8,
        title: "Dodge the Question",
        author: "@gripgrap",
        url: "https://gripgrap.itch.io/dodge-the-question",
        jamName: "SoloDevelopment Game Jam 4",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
        jamType: "themed",
        jamTheme: "Two Button Controls",
        thumb: "D",
        image: "/images/games/dodge-the-question.png"
    },
    {
        id: 9,
        title: "Six Rolls Six",
        author: "@yikag",
        url: "https://yikag.itch.io/six-rolls-six",
        jamName: "SoloDevelopment Game Jam 4",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-4",
        jamType: "themed",
        jamTheme: "Two Button Controls",
        thumb: "S",
        image: "/images/games/six-rolls-six.png"
    },
    {
        id: 10,
        title: "Guardian of the Grave",
        author: "@drahmen",
        url: "https://drahmen.itch.io/guardian-of-the-grave",
        jamName: "SoloDevelopment Game Jam 5 (Spooky Jam)",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
        jamType: "themed",
        jamTheme: "Fight The Dark",
        thumb: "G",
        image: "/images/games/guardian-of-the-grave.png"
    },
    {
        id: 11,
        title: "Hank The Imp",
        author: "@Emcee",
        url: "https://emceetheguy.itch.io/hanktheimp",
        jamName: "SoloDevelopment Game Jam 5 (Spooky Jam)",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
        jamType: "themed",
        jamTheme: "Fight The Dark",
        thumb: "H",
        image: "/images/games/hank-the-imp.png"
    },
    {
        id: 12,
        title: "Maybel in the Hazy Hotel",
        author: "@log64",
        url: "https://log64.itch.io/maybel-in-the-hazy-hotel",
        jamName: "SoloDevelopment Game Jam 5 (Spooky Jam)",
        jamUrl: "https://itch.io/jam/solo-dev-game-jam-5-spooky-jam",
        jamType: "themed",
        jamTheme: "Fight The Dark",
        thumb: "M",
        image: "/images/games/maybel-hazy-hotel.png"
    },
    {
        id: 13,
        title: "Operation MC: Codename Melting Point",
        author: "@drahmen",
        url: "https://drahmen.itch.io/operation-mc-codename-melting-point",
        jamName: "SoloDevelopment Game Jam 6 (Winter Jam)",
        jamUrl: "https://itch.io/jam/solodevelopment-jam-6-winter-jam",
        jamType: "themed",
        jamTheme: "Under the Surface / Hot and Cold",
        thumb: "O",
        image: "/images/games/operation-mc.png"
    },
    {
        id: 14,
        title: "Hack the Loop",
        author: "@ProYd",
        url: "https://proyd.itch.io/hack-the-loop",
        jamName: "SoloDevelopment Marathon Jam 4",
        jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "H",
        image: "/images/games/hack-the-loop.png"
    },
    {
        id: 15,
        title: "YesterSol",
        author: "@NeatGames",
        url: "https://neatgames.itch.io/yestersol",
        jamName: "SoloDevelopment Marathon Jam 4",
        jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "Y",
        image: "/images/games/yestersol.png"
    },
    {
        id: 16,
        title: "Survive The Day: Dave's Coffee",
        author: "@Lou Bagel",
        url: "https://loubagel.itch.io/daves-coffee",
        jamName: "SoloDevelopment Marathon Jam 4",
        jamUrl: "https://itch.io/jam/solodev-marathon-jam-4",
        jamType: "marathon",
        jamTheme: "Work on your own project",
        thumb: "S",
        image: "/images/games/daves-coffee.png"
    },
    {
        id: 17,
        title: "Star Modulus",
        author: "@Blurr507",
        url: "https://blurr507.itch.io/star-modulus",
        jamName: "SoloDevelopment 72hr Jam 7",
        jamUrl: "https://itch.io/jam/solodevelopment-jam-7",
        jamType: "themed",
        jamTheme: "Parts and Upgrades",
        placement: 1,
        thumb: "S",
        image: "/images/games/star-modulus.png"
    },
    {
        id: 18,
        title: "Cow Combo",
        author: "@LateAFCoffee",
        url: "https://lateafcoffee.itch.io/cow-combo",
        jamName: "SoloDevelopment 72hr Jam 7",
        jamUrl: "https://itch.io/jam/solodevelopment-jam-7",
        jamType: "themed",
        jamTheme: "Parts and Upgrades",
        placement: 2,
        thumb: "C",
        image: "/images/games/cow-combo.png"
    },
    {
        id: 19,
        title: "Modular Mayhem",
        author: "@Unremarkable1",
        url: "https://unremarkable1.itch.io/modular-mayhem",
        jamName: "SoloDevelopment 72hr Jam 7",
        jamUrl: "https://itch.io/jam/solodevelopment-jam-7",
        jamType: "themed",
        jamTheme: "Parts and Upgrades",
        placement: 3,
        thumb: "M",
        image: "/images/games/modular-mayhem.png"
    }
];

// Featured games for homepage (subset of gameData)
export const featuredGames = [
    gameData[0], // There's Something Wrong With This World
    gameData[9], // Guardian of the Grave  
    gameData[14], // YesterSol
    gameData[3] // Track Master
];