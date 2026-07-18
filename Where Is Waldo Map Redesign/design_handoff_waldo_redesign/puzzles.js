// Static puzzle list — no server or fetch needed, just open index.html directly.
// Only maps living in images/Maps/ are used. Drop a new image in that folder,
// generate a thumbnail (see images/Maps or images/README.md), add an entry
// here, then use tools/coord-finder.html to set the real target coordinates.
//
// difficulty is one of: "easy", "medium", "hard", "very-hard".
const PUZZLES = [
  {
    id: "4B42MkD",
    title: "Town Square",
    image: "images/Maps/4B42MkD.jpeg",
    thumbnail: "images/Maps/thumbs/4B42MkD.jpeg",
    difficulty: "easy",
    target: { xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
  },
  {
    id: "waldo-1",
    title: "Beach",
    image: "images/Maps/waldo-1.jpeg",
    thumbnail: "images/Maps/thumbs/waldo-1.jpeg",
    difficulty: "medium",
    target: { xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
  },
  {
    id: "OTfytjA",
    title: "Department Store",
    image: "images/Maps/OTfytjA.jpeg",
    thumbnail: "images/Maps/thumbs/OTfytjA.jpeg",
    difficulty: "medium",
    target: { xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
  },
  {
    id: "nf6oSGR",
    title: "The Gobbling Gluttons",
    image: "images/Maps/nf6oSGR.jpeg",
    thumbnail: "images/Maps/thumbs/nf6oSGR.jpeg",
    difficulty: "hard",
    target: { xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
  },
  {
    id: "btsRJjC",
    title: "Ancient Battle",
    image: "images/Maps/btsRJjC.jpeg",
    thumbnail: "images/Maps/thumbs/btsRJjC.jpeg",
    difficulty: "very-hard",
    target: { xPercent: 50, yPercent: 50, radiusPercent: 3 }, // TODO: set with tools/coord-finder.html
  },
];
