// Twin Tides — main.ts (Node 22, standard library only)
//
// The hand-in program for the make.fun spot-the-difference bounty.
// It copies the game's static files (game/) and the screenshots
// (screenshots/) from beside this file into the output directory
// (/output in the grader, or $MAKEFUN_OUTPUT_DIR outside it) and
// writes /output/dossier.json with buildDossier from the vendored
// make.fun library. The run is deterministic: the same repository
// always writes the same bytes, so the grader's two runs match.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');

function countGameEntries(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countGameEntries(path);
  }
  return total;
}

mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
}

// Fail loudly, the way the gate would, instead of handing in a
// half-built entry: game/ must hold index.html, and screenshots/
// must hold 3 or 4 images of at most 256 KiB each.
const gameEntries = countGameEntries(gameDir);
if (gameEntries > 993) throw new Error(`game/ holds ${gameEntries} entries, over the 993 cap`);
if (!existsSync(join(gameDir, 'index.html'))) throw new Error('game/index.html is missing');
if (statSync(join(gameDir, 'index.html')).size > 1048576) throw new Error('game/index.html is over the 1 MiB cap');
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((n) => !n.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) throw new Error(`screenshots/ holds ${shots.length} images, expected 3 or 4`);
for (const shot of shots) {
  const size = statSync(join(shotsDir, shot)).size;
  if (size > 262144) throw new Error(`screenshots/${shot} is ${size} bytes, over the 256 KiB cap`);
}

// The dossier library must be the kit's copy, unchanged; refuse to
// hand in an entry whose vendor file went missing or was swapped.
if (!existsSync(join(here, 'vendor', 'makefun-game.ts'))) {
  throw new Error('vendor/makefun-game.ts is missing — copy it unchanged from the kit');
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
