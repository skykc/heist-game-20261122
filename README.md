# VAULTBREAK — Midnight at the Meridian Museum

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/skykc/heist-game-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/skykc/heist-game-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). One thief, three rooms of the Meridian Museum, and every guard watching. Play it free with referral code `6en97dxm`.

## The game

You are the thief. Slip through the Meridian Museum after midnight, lift every piece of loot in the room, and reach the exit before the alarm hits 100%.

- **The Gallery** — lift the Star Sapphire portrait, the gold bars and the Meridian Diamond past two patrolling guards and two sweeping cameras.
- **The Vault** — crack the central safe room: three guards, three cameras, four loot pieces.
- **The Rooftop** — grab the Meridian Crown under a fast roving guard and reach the helicopter on the helipad.

## How to play

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move quietly (walls and display cases block you — and block sight) |
| Mouse click | Throw a coin (3 per room) — a nearby guard walks over to look |
| Q or Space | Smoke bomb (2 per room) — cones cannot see through smoke |
| E | EMP (1 per room) — every camera goes dark for 8 seconds |
| Enter | Start / next room |
| R | Retry the room / play again |
| H | Help |
| M | Mute |

**The alarm** rises while any guard or camera sees you and cools down while nobody does. At 100% the museum locks down and you are caught. A guard who touches you ends the run at once. Break line of sight, hide behind cases and pillars, read the cones before you move.

## Running it

The game is plain static files under `game/` — no build step, no network:

```sh
python3 -m http.server 8080 --directory game/   # serves game/ at http://localhost:8080
```

Or open `game/index.html` from any static HTTP server in desktop Chrome.

## Structure

- `game/index.html` — the page: a 1280×720 canvas and the module entry point
- `game/src/main.js` — the game loop and the state machine (title → playing → caught / room clear → getaway)
- `game/src/levels.js` — the three rooms: walls, cover, patrols, cameras, loot, exits
- `game/src/guards.js` — guard patrols, vision cones, coin investigation, chases, and CCTV sweep
- `game/src/player.js` — movement with wall collision, and the coin / smoke / EMP tools
- `game/src/render.js` — every pixel, drawn procedurally on canvas (no image files)
- `game/src/audio.js` — every sound synthesized with WebAudio (no audio files)
- `game/src/input.js` — keyboard and mouse
- `game/src/hud.js` — the giant alarm meter, loot and tool counts, and the win / lose screens
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
