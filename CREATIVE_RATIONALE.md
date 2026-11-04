# ALTITUDE — Creative Rationale

## The idea in one sentence

The portfolio is one uninterrupted flight: scroll position is altitude, altitude sets the colour of the sky, and each phase of the flight carries one chapter of Lâm Vũ An's story.

## Why a flight

Lâm Vũ An works inside a commercial airline. Most portfolios use aviation as decoration. Here it is the structure: the altimeter is the navigation, the flight level is the progress bar, and the palette changes because the aircraft has climbed. If you remove the aircraft and the altitude system, the site has no navigation, no pacing and no colour logic. That dependency is the test of the concept.

## The system

| Layer | Rule |
|---|---|
| Time | Scroll maps to flight time `t` in [0, 8). The integer is the chapter, the fraction is progress inside it. Sky, camera, aircraft attitude and altimeter all read `t`. |
| Camera | One authored path (`src/flight/spline.ts`): keyframes joined by a clamped Hermite spline, so moves are continuous and never overshoot. |
| Colour | Warm Silver on the ground, Aviation Gold above the cloud deck, Deep Burgundy at cruise, then back through silver to a gold horizon. Gold is never used for text on silver. |
| Type | Newsreader at display optical size for statements, Manrope for reading, IBM Plex Mono for instruments. Oversized type is layered *with* the aircraft, not placed beside it. |
| Route | One golden line. It starts as the taxi line under the parked aircraft, lifts off at rotation, runs down the left margin of the site, and ends at the email button. |

## Signature moments, and how each is built

1. **Aircraft between the lines of the headline.** "BEYOND" sits behind the WebGL canvas, "THE ORDINARY." sits in front. The tail passes across the first line, the fuselage runs behind the second. The `<h1>` stays whole and readable in the DOM; the front copy is an aria-hidden duplicate.
2. **The lounge reveal.** The hero was a view through glass. The lounge is a vector room with a real hole for a window, scaled from 3.8× (only glass in frame) down to 1×, while the 3D camera also pulls back. No cut, no fade.
3. **Boarding-pass tear.** Drag the stub, or press the button. The information under the stub is in the DOM throughout.
4. **Takeoff rotation.** The aircraft pivots on its main gear, not its centre. Runway markers count down to rotation as milestones pass.
5. **Cloud breakthrough.** The sky goes from silver to diffuse grey inside the cloud, then to gold the moment the camera clears the deck above the wing.
6. **City lights resolving into Braille.** Night lights through a cabin window gather into the five cells of "music" in literary Braille. The dot patterns come from a documented UEB mapping in `src/lib/braille.ts`; the same pattern is embossed on the lounge piano score.
7. **The route arrives.** The aircraft flies away into a gold horizon while the route line turns in from the margin to the email button.

## What was left out, on purpose

- **A photoreal aircraft.** No licensed GLB was supplied. A primitive "realistic" model would look like a failed attempt, so the aircraft is lofted procedurally with correct proportions, and drawn as a technical illustration: station frames, door outlines, edge lines. It is a deliberate style (Path B of the brief).
- **Post-processing.** No bloom, no depth of field, no film grain. Light comes from a small set of light-formers and contact shadows.
- **Cards and grids.** Each project has its own world (control room, night window, cloud archive, flight recorder) instead of a shared card.
- **Invented numbers.** Only real ranks and years animate. Every chart on the site is labelled "Illustrative data".
- **Opinions.** The Thinking chapter shows topic titles and links them to facts already on the site. No viewpoints are written on the owner's behalf.
- **A horizontal-scroll project carousel.** One horizontal drift only (the departure board in Waypoint 1); vertical scrolling always works.
- **Sound.** Five optional piano notes in the Braille waypoint, off by default and behind a labelled button.

## Modes

- **Live (desktop and tablet):** WebGL flight, custom cursor, scrubbed chapters.
- **Still (phones, reduced motion, no WebGL):** poster frames rendered from the same scene with transparent backgrounds over the same DOM sky, so the concept, palette and layering survive; chapters stack vertically; nothing is scrubbed.
- **Flight Manifest:** the whole story as plain HTML (`#manifest`).
