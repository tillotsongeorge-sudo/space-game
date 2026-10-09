# Orbit Playground

A tapping game for kids. Critters (pumpkins, spiders, ghosts, vampires, bats, skulls, black cats, leopards, snow tigers, elephants, dogs and giraffes) appear on their own and orbit the sun. Tap them to make them explode.

## How to play

- **Tap a critter** to pop it. Small critters are worth 3 points, medium 2 and big 1.
- Pop critters within about a second of each other to build a **combo** (up to x5), which multiplies the points.
- New critters keep arriving, a little faster the more you pop. Any that fall into the sun sizzle away.
- Your best score is saved in the browser.
- Turn on slow motion, pause, restart, toggle trails, and mute sounds from the toolbar.

Keyboard shortcuts: `Space` pause, `S` slow-mo, `R` restart, `T` trails, `M` mute.

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:47321
```

Other scripts: `npm run build` (type-check and production build), `npm run preview`, `npm run lint`.

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`. In the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The site will be at `https://<your-username>.github.io/<repo-name>/`.

## How it works

- `src/game/sim.ts` handles the physics (inverse-square gravity toward the sun, integrated with 4 sub-steps per frame) and finding which critter was tapped.
- `src/game/characters.ts` draws each critter on the canvas.
- `src/game/sound.ts` makes the sound effects with the Web Audio API, so there are no audio files.
- `src/App.tsx` runs the game loop (spawning, scoring, combos), draws the scene on a canvas and holds the controls.
