# Orbit Playground

A gravity sandbox for kids (and curious grown-ups). Drag anywhere to throw a smiley planet, then watch the sun's gravity pull it into a loop, a wild comet path, or a fiery crash. Every full lap around the sun earns a star.

## How to play

- **Drag and let go** to throw a planet. The dotted line shows where it will go.
- Throw **sideways** past the sun to get an orbit. Throw straight at it and the planet sizzles.
- If two planets bump into each other, they stick together into a bigger one.
- **✨ Magic orbit** drops in a planet that's already in a perfect circle, so even little kids get a win.
- Pick small, medium, or big planets, turn on slow motion, pause, toggle trails, and mute sounds.

Keyboard shortcuts: `Space` pause, `A` magic orbit, `S` slow-mo, `T` trails, `M` mute, `C` clear, `1`/`2`/`3` planet size.

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

- `src/game/sim.ts` handles the physics: inverse-square gravity toward the sun, integrated with 4 sub-steps per frame, plus orbit counting (it adds up the angle swept around the sun) and merging planets by volume while keeping momentum.
- `src/game/sound.ts` makes the sound effects with the Web Audio API, so there are no audio files.
- `src/App.tsx` draws everything on a canvas and holds the controls.
