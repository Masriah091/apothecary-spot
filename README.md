[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Masriah091/apothecary-spot/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Masriah091/apothecary-spot/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# The Witch's Apothecary — a spot-the-difference game

Two near-identical pictures of a candlelit apothecary, side by side — both
of them renders of the same 3D shop. While the witch was out, a meddler
rearranged it: a seal's wax changed, a candle went out, the brew turned the
wrong colour. Find the twelve changes in each of the shop's three lights
before the clock runs out.

## How to play

- **Three rounds, one shop, changing light:** Dusk Shop (candlelight),
  Midnight Brewing (moon-blue) and First Light (pale gold). Each round
  hides **12 differences**, each round's clock is shorter than the last,
  and the hiding escalates — round 1 changes states, round 2 shrinks to
  the back shelves and the tiny goods, round 3 only tilts, tints and fades.
- **Mouse:** click a difference in either panel. An emerald ring with a
  check blooms on both panels when you find one.
- **Keyboard:** arrow keys or WASD move the lens, `Enter` checks the spot
  under it, `H` asks for a hint, `P` pauses, `M` silences the shop.
- **Wrong clicks cost 5 seconds** and 25 points. Hints are limited — a
  hint makes one unfound difference pulse gently, and costs 40 points.
- The counter at the top always shows how many differences remain, and
  how many you have found.

## Running it

The game is plain static files under `game/` — no build step, no network.
Serve the folder with any static server, for example the one bundled here:

```
node serve.ts        # then open http://localhost:8080
```

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged.
- `game/index.html` — the page: HUD, the two panels, the start and end screens.
- `game/vendor/three.min.js` — Three.js, vendored so the game plays offline.
- `game/src/palette.js` — the shop's three lights and every material colour.
- `game/src/textures.js` — the procedural canvas paintings: wood, plaster,
  runed bottle labels, wax seals, the moon, the sky, mushroom spots.
- `game/src/differences.js` — the catalogue of all 36 hiding places, with
  the escalation design written down.
- `game/src/rounds.js` — the three rounds, their clocks, hints and scoring.
- `game/src/builder-kit.js` — shared tools for the scene builders.
- `game/src/shop-room.js` — the shell: floor, walls, moon window, shelves,
  counter, beam and rug.
- `game/src/shelf-goods.js` — the stocked shelves: bottles, jars, books,
  vials, the great mushroom.
- `game/src/counter-craft.js` — the counter's craft: cauldron and steam,
  mortar, candelabrum, scrolls, balance, the open book, the cat, the herbs.
- `game/src/scene3d.js` — assembles the shop under each round's light.
- `game/src/scene-paint.js` — renders the two panels from the one scene and
  draws the found rings, hint pulses and misclick marks.
- `game/src/audio.js` — the shop's small synthesised sounds.
- `game/src/game.js` — rounds, clock, scoring, screens and the hunt.
- `game/src/main.js` — the page's bootstrap and screenshot staging.
- `screenshots/` — real renders of the game, taken in a browser.
