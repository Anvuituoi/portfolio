# Assets and licences

Every asset that ships with the site is listed here. No stock photography, no AI-generated imagery, and no third-party 3D models are used.

## 3D aircraft

| Item | Source | Author | Licence |
|---|---|---|---|
| Aircraft geometry (fuselage, wings, winglets, tail, nacelles, gear, windows, drawing lines) | Generated in code: `src/three/aircraftGeometry.ts` | Built for this project | Same as the repository |
| ALTITUDE livery (silver / burgundy tail / gold cheatline) | Materials in `src/three/Aircraft.tsx` | Built for this project | Same as the repository |

The aircraft is a generic twin-engine narrow-body. It carries no airline livery, registration, logo or manufacturer mark. **No GLB was supplied (brief Path A).** To use one later, it must have a licence that allows modification and public use; record it here and optimise it with glTF Transform (Meshopt + KTX2, decoders self-hosted under the base path).

## Lounge interior

| Item | Source | Licence |
|---|---|---|
| Lounge room, furniture, piano, information display | Vector drawing in code: `src/components/RoomArt.tsx` | Same as the repository |

Fictional room. No real airline, airport or brand. No human figures. Not a photograph.

## Generated images

| File | How it is made |
|---|---|
| `public/posters/*-d.webp`, `*-m.webp` | Rendered from the live scene by `scripts/posters.mjs` (headless Chromium, transparent background) |
| `public/og.jpg` | Composited from the gate poster by `scripts/og.mjs` |
| `public/favicon.svg` | Hand-written SVG |

Clouds and the ground fade are drawn into canvas textures at runtime (`src/three/Atmosphere.tsx`). Nothing is downloaded.

## Fonts (self-hosted, subsetted)

| Font | Use | Source | Licence |
|---|---|---|---|
| Newsreader (variable, wght 300–500, opsz 6–72) | Display | `@fontsource-variable/newsreader` (Production Type) | SIL Open Font License 1.1 |
| Manrope 400/500/600/700 | Interface, body | `@fontsource/manrope` (Mikhail Sharanda) | SIL Open Font License 1.1 |
| IBM Plex Mono 400/500 | Instruments, data | `@fontsource/ibm-plex-mono` (IBM) | SIL Open Font License 1.1 |
| Noto Sans SC 500, subset to 欢迎 | Lounge greeting | `@fontsource/noto-sans-sc` (Google) | SIL Open Font License 1.1 |
| Noto Sans Khmer 500, subset to សូមស្វាគមន៍ (with shaping tables) | Lounge greeting | `@fontsource/noto-sans-khmer` (Google) | SIL Open Font License 1.1 |

Subsetting: `pyftsubset` and `fonttools varLib.instancer` (fontTools). Newsreader Latin was cut to the characters used on the site; Vietnamese files cover all Vietnamese diacritics. Licence texts are in `src/assets/fonts/OFL-*.txt`.

## Code libraries

React, Three.js, React Three Fiber, Drei, GSAP + ScrollTrigger, Lenis, Motion, Lucide, Tailwind CSS. All MIT or similar permissive licences, except GSAP, which uses the GreenSock "Standard No Charge" licence (free for public websites, including ScrollTrigger).

## Needs attention

- **Owner photos and project images:** none supplied, none used. The site does not need them, but any added later must be the owner's own or properly licensed, and must not be AI-generated images presented as real.
- **CV:** not published on the site, by the owner's decision.
- **Photos on the previous site** (`Avatar.JPG`, `RMIT.JPG`, `GDSC.JPG`, `Fulbright.jpg` in Anvuituoi/portfolio) were not used. They are 0.1–4.7 MB each; if added later, resize to WebP and confirm the owner holds the rights to each.
