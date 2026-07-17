# Sky Runner 🏃🟧

A 2D platformer web game. Run, double-jump, stomp enemies, grab all 22 coins, dodge the spikes and pits, and reach the flag.

## Controls

| Action | Keys |
| --- | --- |
| Move | Arrow keys or A / D |
| Jump / double jump | Space, Up, or W |
| Stomp enemy | Land on it from above |
| Restart after win/lose | Space |

You have 3 lives. Falling into a pit respawns you at the last ground section; enemies and spikes knock a heart off (with a short invulnerability window). Finishing with spare lives earns a bonus.

## Stack

- **[Phaser 4](https://phaser.io/)** — 2D game framework (arcade physics, scenes, input, camera)
- **TypeScript** (strict) + **Vite 6** — dev server and static production build
- Zero binary assets: every texture is generated at runtime with Phaser Graphics

## Develop

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build locally
```

## Deploy to Vercel

The build output is fully static — no server, no config needed.

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Vercel auto-detects Vite (build command `npm run build`, output `dist/`). Click **Deploy**.

Or from the CLI: `npm i -g vercel && vercel`.

## Project layout

```
index.html              entry page
src/main.ts             Phaser game config
src/scenes/BootScene.ts runtime texture generation
src/scenes/TitleScene.ts title screen
src/scenes/GameScene.ts level data, physics, enemies, HUD, win/lose
```
