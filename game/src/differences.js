// differences.js — the catalogue of every difference that can hide in
// the apothecary. Each entry carries the radius (in panel pixels) a click
// must land inside; the position itself comes from the 3D scene, which
// projects each difference's anchor into the panel when the round opens.
// The left panel is always rendered honest; the right panel is rendered
// with the round's twelve applied. Nothing here draws — the scene
// builders consult this map by id and register how each change is made.
//
// HOW THE HIDING ESCALATES (the design this catalogue documents):
//   Round 1, Dusk Shop, teaches the eye. Its twelve are changes of state
//   a browser notices on a second look — a flame out, a seal the wrong
//   colour, a brew gone violet — on the counter and the front shelves,
//   with generous click radii (16–30 px).
//   Round 2, Midnight Brewing, hides smaller and closer to home: the
//   targets move to the back shelves and the tiny goods (a vial's rune,
//   a mushroom's spots, a key's angle), the colours step to neighbours
//   (green to teal, gold to dark twine), and the radii shrink (12–16 px,
//   one wide brew-sheen at 26 because the cauldron is a wide target).
//   Round 3, First Light, whispers. Nothing changes colour outright and
//   nothing leaves; the changes are tilts, tints, fades and shifts of a
//   few pixels — a flame leaning, a halo thinned, a paw moved a finger's
//   width — and the radii shrink again (11–15 px, the steam and the moon
//   halo wider only because they are wide, soft things). A player who
//   learned the shop in round 1 is tested on whether they truly know it.

export const DIFFERENCES = {
  // ——— Round 1 — Dusk Shop: fair changes, on the counter ———
  'brew-hue': {
    name: 'The cauldron’s brew has turned violet',
    hint: 'Something over the fire is the wrong colour entirely.',
    r: 30,
  },
  'tall-candle-out': {
    name: 'The tallest candle of the three is out',
    hint: 'Count the flames on the candelabrum.',
    r: 16,
  },
  'amber-label-rune': {
    name: 'The great amber bottle’s label bears a different rune',
    hint: 'Read the big bottle’s label — slowly.',
    r: 20,
  },
  'herb-untied': {
    name: 'A hanging herb bundle has come untied and droops',
    hint: 'One of the bundles overhead hangs wrong.',
    r: 20,
  },
  'scroll-seal': {
    name: 'The scroll’s seal is teal, not crimson',
    hint: 'The seal on the scroll has changed its wax.',
    r: 16,
  },
  'moon-waxing': {
    name: 'The crescent moon has swollen full',
    hint: 'Look out of the round window.',
    r: 24,
  },
  'cat-bell': {
    name: 'The cat’s collar bell is silver, not gold',
    hint: 'The cat wears something different at her throat.',
    r: 14,
  },
  'pestle-lean': {
    name: 'The pestle leans the other way in the mortar',
    hint: 'The mortar’s pestle rests at a new angle.',
    r: 16,
  },
  'green-level': {
    name: 'The tall green bottle stands half-emptied',
    hint: 'One tall bottle has less in it than it did.',
    r: 18,
  },
  'book-band': {
    name: 'A book’s spine band is blue, not gold',
    hint: 'The books on the shelf have changed their dress.',
    r: 18,
  },
  'jar-lid': {
    name: 'The squat jar’s lid is brass, not wood',
    hint: 'A jar near the front has a grander lid than it should.',
    r: 16,
  },
  'weight-small': {
    name: 'One weight on the balance pan has shrunk',
    hint: 'Weigh the balance’s weights with your eye.',
    r: 16,
  },

  // ——— Round 2 — Midnight Brewing: smaller, slyer, further back ———
  'vial-rune': {
    name: 'A top-shelf vial’s label bears a different rune',
    hint: 'The smallest labels are worth reading twice.',
    r: 13,
  },
  'vial-level': {
    name: 'A top-shelf vial’s liquid has sunk a little',
    hint: 'High up, one vial is not as full as its sisters.',
    r: 13,
  },
  'herb-knot': {
    name: 'A herb bundle’s twine has darkened',
    hint: 'One bundle overhead is tied with darker string.',
    r: 15,
  },
  'short-candle': {
    name: 'A shelf candle has burned much shorter',
    hint: 'Not every candle on the shelves stands the same height.',
    r: 14,
  },
  'brew-sheen': {
    name: 'The brew’s sheen has slid from green toward teal',
    hint: 'The cauldron’s surface shines a different green.',
    r: 26,
  },
  'scroll-end-rune': {
    name: 'The rune stamped on the scroll’s end has changed',
    hint: 'Turn the scroll over in your mind and read its end.',
    r: 13,
  },
  'cat-eyes': {
    name: 'The cat’s eyes have gone green',
    hint: 'The cat is watching you with different eyes.',
    r: 12,
  },
  'bright-star': {
    name: 'The bright star left of the moon is gone',
    hint: 'The sky outside is missing its brightest point.',
    r: 14,
  },
  'book-ribbon': {
    name: 'A book’s bookmark ribbon is red, not blue',
    hint: 'A ribbon marks a page in a new colour.',
    r: 13,
  },
  'mushroom-spots': {
    name: 'The great mushroom has lost two of its spots',
    hint: 'Count the spots on the big mushroom.',
    r: 15,
  },
  'key-turned': {
    name: 'The key on its hook hangs at a new angle',
    hint: 'The key by the door does not hang as it did.',
    r: 13,
  },
  'ladle-gem': {
    name: 'The ladle’s handle gem is an emerald, not a ruby',
    hint: 'The ladle by the cauldron wears a different stone.',
    r: 12,
  },

  // ——— Round 3 — First Light: tilts, tints, fades, shifts ———
  'cork-tint': {
    name: 'A vial’s cork has darkened',
    hint: 'High up, one cork is not the pale thing it was.',
    r: 12,
  },
  'smallest-rune': {
    name: 'The smallest bottle’s label bears a different rune',
    hint: 'The tiniest label in the shop. Read it last, find it first.',
    r: 11,
  },
  'herb-leaf': {
    name: 'A leaf is missing from a hanging bundle',
    hint: 'One bundle overhead is a leaf lighter.',
    r: 12,
  },
  'flame-lean': {
    name: 'The middle candle’s flame leans sideways',
    hint: 'One flame is not standing straight, though no wind blows.',
    r: 12,
  },
  'steam-tint': {
    name: 'The cauldron’s steam rises cool and blue-grey',
    hint: 'Even the steam over the brew has changed its temper.',
    r: 22,
  },
  'seal-letter': {
    name: 'The seal’s stamped letter has changed',
    hint: 'The wax seal signs a different initial now.',
    r: 12,
  },
  'cat-paw': {
    name: 'The cat’s paw has slipped off the counter’s edge',
    hint: 'The cat has rearranged a paw.',
    r: 13,
  },
  'moon-halo': {
    name: 'The moon’s halo has thinned almost to nothing',
    hint: 'The ring of light around the moon is fading.',
    r: 20,
  },
  'page-edges': {
    name: 'The open book’s page edges have greyed',
    hint: 'The book open on the counter is not as fresh as it was.',
    r: 14,
  },
  'scale-needle': {
    name: 'The balance dial’s needle has swung',
    hint: 'The little dial on the balance tells a new weight.',
    r: 12,
  },
  'spot-hue': {
    name: 'The mushroom’s spots have blushed pink',
    hint: 'The big mushroom’s spots are not cream any more.',
    r: 13,
  },
  'glass-amber': {
    name: 'A green bottle’s glass has warmed to amber',
    hint: 'One bottle’s glass is not the green it was.',
    r: 15,
  },
};
