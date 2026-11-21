// Hand-in driver for "The Witch's Apothecary" — a 3D spot-the-difference game.
// The game itself is the static site in game/ (open game/index.html in a desktop
// browser; it runs fully offline). This program prepares the judge's copy:
// it sweeps the output's game/ and screenshots/ subfolders clean of stale
// files, copies the current build across in a fixed sorted order so repeated
// hand-ins are byte-stable, and writes dossier.json with the vendored
// make.fun library. Node 22, standard library only.
//
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for the grader's /output.)

import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Remove everything inside a folder without removing the folder itself, so a
// previous hand-in can never leak stale files into this one. Only ever called
// on subfolders of the output directory, never on the output directory.
function sweepContents(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) rmSync(join(dir, name), { recursive: true, force: true });
}

// Copy a directory tree file by file, entries in sorted order at every level,
// creating folders as needed. Returns the number of files copied.
function copyTreeSorted(src, dst) {
  mkdirSync(dst, { recursive: true });
  let copied = 0;
  for (const name of readdirSync(src, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const from = join(src, name.name);
    const to = join(dst, name.name);
    if (name.isDirectory()) copied += copyTreeSorted(from, to);
    else if (name.isFile()) {
      copyFileSync(from, to);
      copied += 1;
    }
  }
  return copied;
}

mkdirSync(out, { recursive: true });

const outGame = join(out, 'game');
sweepContents(outGame);
const gameFiles = copyTreeSorted(join(here, 'game'), outGame);

const outShots = join(out, 'screenshots');
mkdirSync(outShots, { recursive: true });
sweepContents(outShots);
if (existsSync(join(here, 'screenshots'))) copyTreeSorted(join(here, 'screenshots'), outShots);

if (gameFiles === 0) throw new Error('hand-in copied no game files — is game/ beside main.ts?');

// The dossier describes the output folder the judge will receive. The caps
// below are the scorer's own (reference/gate.json): an entry the scorer would
// refuse (too many screenshots, an oversized screenshot, too many or too
// large game files) is refused here instead.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
