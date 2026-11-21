// rounds.js — the three rounds of one night in the apothecary.
//
// The shop is re-lit for each round (dusk, midnight, first light), hides a
// fresh twelve differences from the catalogue, and tightens the clock and
// the purse of hints as the hiding grows slyer. Scoring lives here too,
// so the shape of the night can be read in one file.

export const ROUNDS = [
  {
    title: 'Round 1 — Dusk Shop',
    phase: 'dusk',
    seconds: 300,
    hints: 3,
    blurb: 'Candlelight and a violet window. Twelve changes, fairly hidden.',
    differences: [
      'brew-hue', 'tall-candle-out', 'amber-label-rune', 'herb-untied',
      'scroll-seal', 'moon-waxing', 'cat-bell', 'pestle-lean',
      'green-level', 'book-band', 'jar-lid', 'weight-small',
    ],
  },
  {
    title: 'Round 2 — Midnight Brewing',
    phase: 'midnight',
    seconds: 270,
    hints: 3,
    blurb: 'Moon-blue dark. The changes shrink and slip to the back shelves.',
    differences: [
      'vial-rune', 'vial-level', 'herb-knot', 'short-candle',
      'brew-sheen', 'scroll-end-rune', 'cat-eyes', 'bright-star',
      'book-ribbon', 'mushroom-spots', 'key-turned', 'ladle-gem',
    ],
  },
  {
    title: 'Round 3 — First Light',
    phase: 'firstlight',
    seconds: 240,
    hints: 2,
    blurb: 'Pale gold at the window. Twelve whispers: tilts, tints and fades.',
    differences: [
      'cork-tint', 'smallest-rune', 'herb-leaf', 'flame-lean',
      'steam-tint', 'seal-letter', 'cat-paw', 'moon-halo',
      'page-edges', 'scale-needle', 'spot-hue', 'glass-amber',
    ],
  },
];

export const SCORE = {
  find: 100,       // points per difference found
  hintCost: 40,    // points a hint takes away
  missSeconds: 5,  // countdown seconds a misclick takes away
  missPoints: 25,  // points a misclick takes away
  secondBonus: 2,  // points per second left when a round is cleared
};
