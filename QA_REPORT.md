# QA report

Measured on the production build (`npm run build` → `vite preview`) inside a cloud container: Linux, headless Chromium 1243, **software WebGL (SwiftShader), no GPU**. Raw output: `screenshots/check-report.json`.

## Definition of done

| Check | Result |
|---|---|
| `npm run build` | Passes, no type or build errors |
| Widths 390 / 768 / 1440 / 1920: console errors | None |
| Widths 390 / 768 / 1440 / 1920: horizontal overflow | None (`scrollWidth` = `clientWidth` at every width) |
| axe-core (WCAG 2.0/2.1/2.2 A + AA): live desktop, reduced motion, no WebGL, iPhone 13, Flight Manifest | **0 violations** of any impact in all five modes |
| Keyboard only (`scripts/keyboard.mjs`) | 37 tab stops from skip link to footer in live and reduced modes; every stop scrolled into view with a visible focus style; lounge object opens with Enter, closes with Escape, focus returns; case-study dialog takes focus, traps Tab, closes with Escape and returns focus |
| WebGL off (`?nowebgl`) and reduced motion | Work: poster frames, same sky, same layering, stacked chapters (screenshots in `screenshots/`) |
| Vietnamese, Chinese, Khmer glyphs | Every Vietnamese character used on the site is in all four font families; 欢迎 and សូមស្វាគមន៍ are in their subsets, with Khmer shaping tables (GSUB/GPOS) kept |
| Phone number and GPA | Not in the source. Rendered-text scan in four modes: no phone-number pattern, no GPA |
| Placeholders | None on the site; review mode is off |
| Screenshots | 8 chapters × desktop and mobile, the manifest, and 4 key frames in `screenshots/keyframes/` |

## Performance

| Metric | Target | Measured | Note |
|---|---|---|---|
| Initial JavaScript (gzip) | < 200 KB | **148.9 KB** | React, GSAP, Lenis, Motion, app. three.js is not in it |
| Lazy 3D chunk (gzip) | — | 248.8 KB | three.js + R3F + scene; desktop/tablet live mode only, loaded on idle |
| Aircraft model | < 5 MB / < 1.5 MB | 0 KB download | Procedural geometry, part of the 3D chunk |
| Poster frames | — | 11–142 KB each (WebP, alpha) | Only the current and neighbouring chapter are fetched |
| Lighthouse mobile, simulated throttling (3 runs) | ≥ 85 | **Performance 82 / 84 / 87** | Accessibility 100, Best Practices 100, SEO 100 in every run |
| LCP mobile, simulated | < 2.5 s | 2.7–2.8 s | Lighthouse's model counts the module script as blocking first paint; see applied throttling below |
| LCP mobile, applied throttling (devtools) | < 2.5 s | **1.6 s** | Real network and 4× CPU slowdown |
| CLS | < 0.1 | **0.001** | |
| TBT mobile | proxy for INP < 200 ms | 280–430 ms simulated; 1.7 s applied | The container CPU is slow; React mounts the later chapters in a time-sliced transition. INP itself was not measured (needs real interaction) |
| Lighthouse desktop, no WebGL | — | Performance 99, LCP 0.8 s, TBT 0 ms | |
| Lighthouse desktop, live WebGL | — | Performance 60, TBT ≈ 17 s | WebGL runs on the CPU here (SwiftShader). Not representative of a GPU |
| Frame rate | 60 fps desktop / 30 fps mid phone | **Not measured** | No GPU or physical phone available. Phones use poster frames, not live 3D |

## Accessibility testing done and not done

- Done: axe in five modes, keyboard-only traversal, focus trap and Escape, reduced motion via the OS setting and the in-page switch, no-WebGL path, `lang` attributes on vi / zh-Hans / km text, contrast scrims on text over the scene.
- **Not done:** NVDA or VoiceOver. No screen reader is available in this environment. The semantic structure (landmarks, one `h1`, ordered chapter `h2`s, labelled dialog, disclosure buttons with `aria-expanded`) was checked with axe and by reading the DOM, which is not a substitute. Please test with NVDA (Windows) and VoiceOver (macOS / iOS) before publishing.

## Creative self-review

| Criterion | Score | Evidence |
|---|---|---|
| Concept | 8 | The altimeter is the navigation, and the sky changes with flight level. One sentence: "a portfolio flown as one flight from gate to horizon." |
| First impression | 8 | Key frame 1: oversized headline, aircraft between the two lines, drawing callouts, altimeter. Reads as a poster without any interaction. |
| Originality | 8 | Remove the aircraft and the altitude system and the site loses its navigation, its palette logic and its transitions. |
| Art direction | 8 | Three brand colours used as atmosphere; one typographic voice; no cards or glass. The procedural aircraft is credible at hero scale but is not photoreal up close (boarding close-up). |
| Motion | 8 | Damped flight time gives weight; rotation pivots on the main gear; the camera spline is clamped so it never overshoots. Not verified at 60 fps on real hardware. |
| Usability | 8 | Altimeter chapters plus a Contact link in the nav. The profile is one click (03), projects one click (05), contact one click. The lounge skill list is visible as plain text. |
| Accessibility | 8 | 0 axe violations, full keyboard path, Flight Manifest. Held back by the lack of screen-reader testing. |
| Performance | 7 | Mobile LCP 1.6 s with applied throttling and CLS 0.001, but simulated Lighthouse Performance is 82–87 (target 85), and desktop frame rate was not measured on a GPU. |

## Fixes after owner review (4 Nov 2026)

- Hero: headline size is bounded by window height and the aircraft sits lower, so the tagline never overlaps the headline (checked at 1440×900 and 1440×650); the front headline has a silver outline where the burgundy tail passes behind it.
- Journey: stronger scrim with blur behind the list; a one-line key explains the 8 → 1 countdown; on screens narrower than 900 px or shorter than 720 px the list scrolls normally and clears the bottom altimeter bar (checked at 860×700).
- Navigation: a soft backing appears once past the hero; silver instruments are limited to the night cruise (the descent cabin wall is light).
- Departure board: words are grouped so rows read as words.
- Thinking & Interests: inactive topics stay at 62 % opacity instead of 28 %.
- Descent on 768–899 px live screens: the cabin window keeps its shape beside the text.

## Known issues

- The lounge panel heading takes focus a beat late when the main thread is busy (focus lands on it after the transition).
- Lighthouse Performance on simulated mobile varies between 82 and 87 across runs.
