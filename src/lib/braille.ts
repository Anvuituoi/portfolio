/**
 * Literary Braille, uncontracted (Grade 1) Unified English Braille, letters a–z.
 *
 * Dot numbering of a six-dot cell:
 *   1 • • 4
 *   2 • • 5
 *   3 • • 6
 *
 * Source: the standard UEB alphabet (ICEB, "The Rules of Unified English Braille", 2nd ed., 2013, §3).
 * Each entry lists raised dots. `toUnicode` converts to the Unicode Braille Patterns block
 * (U+2800 + bit (n-1) for each dot n), so the mapping can be checked against any Braille font.
 *
 * Note: this is literary Braille. It is NOT Braille music notation. Music notation must be
 * validated by a Braille music reader before it is used anywhere on the site.
 */
export const UEB_LETTERS: Record<string, number[]> = {
  a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5],
  f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5],
  k: [1, 3], l: [1, 2, 3], m: [1, 3, 4], n: [1, 3, 4, 5], o: [1, 3, 5],
  p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4], t: [2, 3, 4, 5],
  u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6],
};

export interface Cell {
  letter: string;
  dots: number[];
  unicode: string;
}

export const toUnicode = (dots: number[]) =>
  String.fromCharCode(0x2800 + dots.reduce((bits, d) => bits | (1 << (d - 1)), 0));

/** Encode a lowercase word. Throws on characters outside a–z so nothing unverified is rendered. */
export function encodeWord(word: string): Cell[] {
  return [...word].map((ch) => {
    const dots = UEB_LETTERS[ch];
    if (!dots) throw new Error(`No verified Braille mapping for "${ch}"`);
    return { letter: ch, dots, unicode: toUnicode(dots) };
  });
}

/** Position of dot n inside a cell, in cell units (column 0–1, row 0–2). */
export const dotPosition = (n: number): [number, number] => [n <= 3 ? 0 : 1, (n - 1) % 3];

/** The single message used on the lounge score and in the Braille Music Library waypoint. */
export const BRAILLE_WORD = 'music';
export const BRAILLE_CELLS = encodeWord(BRAILLE_WORD);
/** Expected: ⠍⠥⠎⠊⠉ */
export const BRAILLE_UNICODE = BRAILLE_CELLS.map((c) => c.unicode).join('');
