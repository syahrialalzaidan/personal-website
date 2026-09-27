# Live from Center Court

The portfolio of Mochamad Syahrial Alzaidan, staged as a live tennis broadcast. Scroll from the
walkout to match point: a floodlit (or sunlit) stadium, a tournament draw of every job, Hawk-Eye
replays of projects, a trophy cabinet, four playable mini-games and a scoreboard that hands the
visitor advantage.

Every visual is drawn in code (SVG, CSS and canvas) and every sound is synthesized with the Web
Audio API, so the repo has no image or audio assets.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Dev server with hot reload                 |
| `npm run build`     | Type-check, then build to `dist/`          |
| `npm run preview`   | Serve the production build locally         |
| `npm run typecheck` | TypeScript only                            |
| `npm run lint`      | Oxlint                                     |
| `npm run format`    | Prettier (write); `format:check` to verify |

## The segments

| #   | Segment        | Content          | Interaction and parallax                                                                                          |
| --- | -------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 00  | Walkout        | Intro            | Countdown, tunnel doors open                                                                                      |
| 01  | Center court   | Hero             | Perspective-projected stadium in 5 planes; pointer parallax; scroll dolly; draggable ball; click for a crowd wave |
| 02  | The tour       | Experience       | Pinned horizontal draw with 4 speed layers; bracket lines draw in; tilt cards                                     |
| 03  | Player profile | About, education | Holographic trading card; count-up stats                                                                          |
| 04  | Hawk-Eye       | Projects         | Scroll-scrubbed 3D ball flight on a pinned monitor; "Challenge the call"                                          |
| 05  | Trophy room    | Hackathons       | Pointer spotlight; sweeping glass reflection; click to lift a trophy                                              |
| 06  | Off court      | Hobbies          | Sticky card stack with four canvas games: serve, padel, ping pong, golf                                           |
| 07  | Match point    | Contact          | Flip-digit scoreboard; tossed ball; magnetic buttons                                                              |

The switch in the top-right corner toggles **day session** (light) and **night session** (dark). The
choice is remembered, defaults to the system setting, and is applied before first paint.

## Project structure

```
src/
  App.tsx                 providers, smooth scroll, section order
  content/                all copy and data (edit these to update the site)
  styles/                 design tokens (day / night) and global styles
  theme/                  ThemeProvider, useTheme, useThemeColors (tokens → canvas colors)
  audio/                  synthesized sound engine and SoundProvider
  hooks/                  pointer parallax, canvas loop, horizontal scroll, tilt, …
  lib/                    math helpers and shared motion variants
  components/             reusable UI: Scoreboard HUD, Court, TennisBall, …
  sections/<Segment>/     one folder per segment, with its own CSS module
    OffCourt/games/       each game = a React shell + a framework-free *.engine.ts
```

### Notes

- **Content lives in `src/content/`**. Update your experience, projects or links there; the
  components don't hard-code copy.
- **Perspective:** the hero and Hawk-Eye courts use a real pinhole projection
  (`components/Court/geometry.ts`, `sections/CenterCourt/stadium.ts`), so lines, net, ball and
  shadows share one camera.
- **Theming:** components use CSS custom properties only. Canvas code resolves the same tokens
  through `useThemeColors`, so switching session repaints every scene.
- **Performance:** canvases only run while on screen and while the tab is visible. The crowd is
  cached to an offscreen canvas. The games are code-split and load on demand, and the framework
  libraries get their own cacheable chunks.
- **Accessibility:** semantic sections and headings, a skip link, visible focus states,
  keyboard controls for every game, ARIA labels on graphics, and `prefers-reduced-motion`
  support (no smooth scrolling, intro, custom cursor, pointer parallax or hero camera dolly).

## Stack

React 19, TypeScript (strict), Vite, Motion (`motion/react`), Lenis, CSS Modules, and self-hosted
variable fonts (Big Shoulders Display, Inter Tight, JetBrains Mono).
