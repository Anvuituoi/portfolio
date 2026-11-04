# ALTITUDE

A personal portfolio for Lâm Vũ An (Chadd Lam), built as one continuous flight. Scroll position is altitude: it drives the camera, the aircraft, the colour of the sky and the altimeter, which is also the main navigation.

React · TypeScript · Vite · Tailwind CSS · React Three Fiber · Drei · Three.js · GSAP ScrollTrigger · Lenis · Motion · Lucide

- Concept and decisions: [`CREATIVE_RATIONALE.md`](CREATIVE_RATIONALE.md)
- Asset sources and licences: [`ASSETS.md`](ASSETS.md)
- Information still needed from the owner: [`CONTENT_GAPS.md`](CONTENT_GAPS.md)
- Measured results: [`QA_REPORT.md`](QA_REPORT.md)

## Run it

Requires Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Update the content

All text lives in typed data files. Components never hold copy.

| File | What it holds |
|---|---|
| `src/content/site.ts` | Name, employer, email, LinkedIn / GitHub / CV links, review mode, fictional flight code |
| `src/content/profile.ts` | Hero, lounge skills and languages, boarding pass, contact copy |
| `src/content/journey.ts` | Takeoff milestones |
| `src/content/projects.ts` | The four waypoints and their case studies |
| `src/content/achievements.ts` | Achievements and the Thinking topics |

Markers: wrap a value in `confirm('value', 'note')` or `placeholder('note')` (from `src/content/markers.ts`). While `site.reviewMode` is `true`, the page shows a visible `[TO CONFIRM]` or `[PLACEHOLDER]` tag next to it. `npm run gaps` lists every marker left. Set `reviewMode: false` only when the list is empty.

Links: an empty `href` in `site.links` is never rendered as a link. In review mode it shows as a dashed `[TO CONFIRM]` label; in production it is hidden. The site deliberately has no CV download.

## Change the flight

| File | What it controls |
|---|---|
| `src/flight/plan.ts` | Chapters, flight levels, sky palette per flight time |
| `src/flight/spline.ts` | Camera keyframes, aircraft pitch / roll / gear, world altitude, runway distance |
| `src/three/aircraftGeometry.ts` | Aircraft proportions and drawing lines |
| `src/components/RoomArt.tsx` | The lounge |

After changing the scene, regenerate the still frames used by phones, reduced motion and no-WebGL:

```bash
npm run dev                                   # keep running
POSTER_URL=http://localhost:5173/ npm run posters
node scripts/og.mjs                           # social preview image
```

`npm run posters` uses Playwright with Chromium. It looks for a global install first, then a local one (`npm i -D playwright && npx playwright install chromium`).

## Deploy to GitHub Pages

1. Push the repository to GitHub, on the `main` branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

The base path is set automatically from the repository name (`/<repository>/`) in `vite.config.ts`. For a user site (`<user>.github.io`) it is `/`. To build for another host, set `VITE_BASE`, for example `VITE_BASE=/ npm run build`. `VITE_SITE_URL` (the full site URL) is used for the social preview image; the workflow fills it in.

Routing uses the URL hash (`#lounge`, `#case/braille-music-library`, `#manifest`), so no `404.html` fallback is needed and deep links work on GitHub Pages.

## Quality checks

```bash
npm run build && npm run preview              # in one terminal
CHECK_URL=http://localhost:4173/ npm run check
CHECK_URL=http://localhost:4173/ npm run keyboard
npm run gaps
```

`npm run keyboard` tabs through the whole site in live and reduced-motion modes, opens and closes a lounge object, and checks the case-study dialog's focus trap and Escape. Measured results are in [`QA_REPORT.md`](QA_REPORT.md).

`npm run check` tests widths 390, 768, 1440 and 1920 for console errors and horizontal overflow, runs axe in live, reduced-motion, no-WebGL, mobile and manifest modes, scans the rendered page for phone numbers and GPA, and saves screenshots of every chapter to `screenshots/`. The report is written to `screenshots/check-report.json`.

Useful URL switches while testing: `?nowebgl` forces the no-WebGL path; `?poster=3.78` renders the scene alone at a given flight time.

## Modes

| Mode | When | What you get |
|---|---|---|
| Live | Desktop or tablet, WebGL, motion on | Lazy-loaded WebGL flight, scrubbed chapters, custom cursor |
| Live, reduced quality | Smaller screens, touch, ≤ 4 CPU cores | Lower pixel ratio, fewer clouds, cheaper shadows |
| Still | Phones, `prefers-reduced-motion`, the **Motion: Off** switch, or no WebGL | Poster frames from the same scene, stacked chapters, native cursor, no smooth scrolling |
| Flight Manifest | `#manifest`, linked in the navigation and footer | All content as plain HTML |

## Performance trade-offs

- Initial JavaScript is 149 KB gzipped. three.js and the scene are a separate 249 KB (gzip) chunk, loaded when the browser is idle and only in live mode. Phones never download it.
- The hero shows a pre-rendered poster immediately and crossfades to WebGL after the first frame.
- Pixel ratio is capped at 1.75 (1.25 on reduced quality) and drops to 1 when the frame rate falls.
- Newsreader is cut from the variable font into three static instances (about 21 KB each for Latin). Manrope and IBM Plex Mono ship two weights and one weight.
- The gate renders first; the other chapters mount in a time-sliced React transition after first paint. Canvas animations in the waypoints run only while on screen, and the 3D scene renders on demand.
