# Twin Tides — Spot the Difference

![Competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/taufik52/twin-tides-spot-the-difference/rank.svg)
![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/taufik52/twin-tides-spot-the-difference/reward.svg)

Entry for [Make the best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451) on make.fun.

Two harbor pictures hang side by side. They look the same — they are not.
**Twin Tides** is an original spot-the-difference game that runs fully
offline in a desktop browser from static files, with keyboard and mouse.

## How to play

- **Click** a difference on either panel to mark it with a teal ring and a
  chime. The counter shows how many are left.
- **Wrong clicks** cost 3 seconds and leave a soft grey X.
- **H** — hint (3 per round): a pulsing gold ring circles one difference
  you have not found yet.
- **R** — restart the current round.
- Find every difference before the timer runs out to reach the next round.

## The three rounds

| Round | Scene | Differences | Time |
| --- | --- | --- | --- |
| 1 | Harbor Dawn | 7 | 2:30 |
| 2 | Midday Market | 9 | 2:30 |
| 3 | Dusk Lighthouse | 11 | 3:00 |

Difficulty rises each round: the changes get smaller, quieter and better
hidden — a missing bird, a swapped flag colour, a sleeping cat that was
never there, a lighthouse beam that went out. Every scene is drawn
procedurally on canvas in `game/scenes.js`: no copied art, no external
images. All sound is synthesised WebAudio (chime, miss blip, hint
sparkle, win arpeggio) — no audio files, no network requests.

Finish all three rounds to see the win screen with your total score and
time bonus.

## Run it locally

Serve `game/` with any static server and open `index.html`, for example:

```sh
python3 -m http.server 8080 --directory game
```

Then open <http://localhost:8080> in a desktop browser.

## Files

- `game/index.html` — page shell: HUD, two panels, overlays
- `game/styles.css` — harbor theme styling
- `game/scenes.js` — the three original procedural harbor scenes and
  every difference coordinate
- `game/game.js` — clicks, markers, counter, timer, hints, rounds, score
- `game/audio.js` — synthesised WebAudio sounds
- `game/main.js` — boot, wiring, keyboard, screenshot staging
- `main.ts` — the make.fun hand-in program (Node 22, standard library
  only): copies `game/` and `screenshots/` to the output directory and
  writes `dossier.json` via `vendor/makefun-game.ts`
- `screenshots/` — real renders of the game running in a headless browser

## License

MIT — see [LICENSE](LICENSE).
