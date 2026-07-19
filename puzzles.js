// Static puzzle list — no server or fetch needed, just open index.html directly.
// Only maps living in images/Maps/ are used. Drop a new image in that folder,
// generate a thumbnail (see images/Maps or images/README.md), add an entry
// here, then use tools/coord-finder.html to set the real target coordinates.
//
// difficulty is one of: "easy", "medium", "hard", "very-hard".
//
// characters is a list of findable characters in the scene. Each id must be
// one of: waldo, woof, wenda, wizard, odlaw (see CHARACTER_META in app.js).
// Not every scene has all five — only include the ones actually present.
const PUZZLES = [
  {
    id: "4B42MkD",
    title: "Town Square",
    image: "images/Maps/4B42MkD.jpeg",
    thumbnail: "images/Maps/thumbs/4B42MkD.jpeg",
    difficulty: "easy",
    // Coordinates measured in-game with the live x/y readout.
    characters: [
      { id: "waldo", xPercent: 43.2, yPercent: 75.6, radiusPercent: 3 },
      { id: "wenda", xPercent: 43.8, yPercent: 60.3, radiusPercent: 3 },
      { id: "woof", xPercent: 57.7, yPercent: 31.4, radiusPercent: 3 },
      { id: "odlaw", xPercent: 59.4, yPercent: 95.2, radiusPercent: 3 },
      { id: "wizard", xPercent: 66.1, yPercent: 77.8, radiusPercent: 3 },
    ],
  },
  {
    id: "waldo-1",
    title: "Beach",
    image: "images/Maps/waldo-1.jpeg",
    thumbnail: "images/Maps/thumbs/waldo-1.jpeg",
    difficulty: "medium",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "OTfytjA",
    title: "Department Store",
    image: "images/Maps/OTfytjA.jpeg",
    thumbnail: "images/Maps/thumbs/OTfytjA.jpeg",
    difficulty: "medium",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "nf6oSGR",
    title: "The Gobbling Gluttons",
    image: "images/Maps/nf6oSGR.jpeg",
    thumbnail: "images/Maps/thumbs/nf6oSGR.jpeg",
    difficulty: "hard",
    // Coordinates measured in-game with the live x/y readout.
    characters: [
      { id: "waldo", xPercent: 57.1, yPercent: 35.2, radiusPercent: 3 },
      { id: "woof", xPercent: 68.2, yPercent: 61.8, radiusPercent: 3 },
      { id: "wenda", xPercent: 39.0, yPercent: 32.6, radiusPercent: 3 },
      { id: "wizard", xPercent: 85.0, yPercent: 84.6, radiusPercent: 3 },
      { id: "odlaw", xPercent: 40.3, yPercent: 60.1, radiusPercent: 3 },
    ],
    // Waldo-Watchers: findable but their total count stays secret (shown as
    // "found/?") until every one of them has been found.
    watchers: [
      { xPercent: 35.2, yPercent: 40.8, radiusPercent: 3 },
      { xPercent: 37.9, yPercent: 80.0, radiusPercent: 3 },
      { xPercent: 96.0, yPercent: 90.1, radiusPercent: 3 },
      { xPercent: 81.8, yPercent: 19.5, radiusPercent: 3 },
      { xPercent: 58.1, yPercent: 18.8, radiusPercent: 3 },
    ],
  },
  {
    id: "btsRJjC",
    title: "Ancient Battle",
    image: "images/Maps/btsRJjC.jpeg",
    thumbnail: "images/Maps/thumbs/btsRJjC.jpeg",
    difficulty: "very-hard",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "wp7156926",
    title: "Hedge Maze",
    image: "images/Maps/wp7156926-wheres-wally-wallpapers.jpg",
    thumbnail: "images/Maps/thumbs/wp7156926-wheres-wally-wallpapers.jpg",
    difficulty: "hard",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "wp7156929",
    title: "Amusement Park",
    image: "images/Maps/wp7156929-wheres-wally-wallpapers.jpg",
    thumbnail: "images/Maps/thumbs/wp7156929-wheres-wally-wallpapers.jpg",
    difficulty: "medium",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "wp7156930",
    title: "The Unfriendly Giants",
    image: "images/Maps/wp7156930.jpg",
    thumbnail: "images/Maps/thumbs/wp7156930.jpg",
    difficulty: "medium",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "h13Dsf1",
    title: "The Gold Rush",
    image: "images/Maps/h13Dsf1.jpg",
    thumbnail: "images/Maps/thumbs/h13Dsf1.jpg",
    difficulty: "medium",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
  {
    id: "wp7156928",
    title: "The Feast",
    image: "images/Maps/wp7156928-wheres-wally-wallpapers.jpg",
    thumbnail: "images/Maps/thumbs/wp7156928-wheres-wally-wallpapers.jpg",
    difficulty: "easy",
    characters: [
      { id: "waldo", xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
    ],
  },
];
