import { BRAILLE_CELLS, dotPosition } from '../lib/braille';
import { greetings } from '../content/profile';
import { site } from '../content/site';

/**
 * The ALTITUDE lounge, drawn as art-directed 2.5D vector layers on a 1600 × 1000 stage.
 * Fictional room: no real airline, airport or brand reference. No human figures.
 * The window is a real hole, so the aircraft (canvas or poster) shows through it.
 */
export const ROOM = {
  w: 1600,
  h: 1000,
  glass: { x0: 40, x1: 1010, y0: 70, y1: 700 },
  mullions: [40, 170, 300, 760, 885, 1010],
  /** Centre of the large central pane: the origin of the camera pull-back. */
  focus: { x: 530, y: 385 },
  objects: {
    commercial: { x: 478, y: 736, w: 116, h: 80, label: [470, 712], tag: 'Commercial' },
    analytics: { x: 594, y: 736, w: 96, h: 80, label: [600, 830], tag: 'Analytics' },
    languages: { x: 812, y: 82, w: 196, h: 128, label: [812, 232], tag: 'Languages' },
    braille: { x: 76, y: 572, w: 372, h: 320, label: [96, 552], tag: 'Braille Music' },
  },
  pass: { x: 716, y: 781 },
} as const;

const C = {
  burgundy: '#3A0F34',
  deep: '#22081F',
  wall: '#3A0F34',
  plum: '#4A1642',
  silver: '#E5E4E2',
  stone: '#D8D4CD',
  gold: '#EAAA00',
};

export type RoomObject = keyof typeof ROOM.objects;

export function RoomArt({
  viewBox = `0 0 ${ROOM.w} ${ROOM.h}`,
  greet = 3,
  boarding = false,
  highlight,
  showWindowFill = false,
}: {
  viewBox?: string;
  greet?: number;
  boarding?: boolean;
  highlight?: RoomObject | null;
  showWindowFill?: boolean;
}) {
  const { x0, x1, y0, y1 } = ROOM.glass;
  const vp = ROOM.focus;
  const floorLine = (xb: number) => [vp.x + (xb - vp.x) * 0.5, 700, xb, 1000];
  const g = greetings[Math.min(greet, greetings.length - 1)];
  const greetFont =
    g.lang === 'zh-Hans' ? "'Noto Sans SC Greeting'" : g.lang === 'km' ? "'Noto Sans Khmer Greeting'" : "'Newsreader Display'";
  const hl = (k: RoomObject) => (highlight === k ? C.gold : 'none');

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className="room-svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFCAC2" />
          <stop offset="1" stopColor="#E3E0DA" />
        </linearGradient>
        <linearGradient id="sunwash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6D27A" stopOpacity="0.38" />
          <stop offset="0.6" stopColor="#F6D27A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.56" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2C0B28" />
          <stop offset="0.35" stopColor={C.wall} />
          <stop offset="1" stopColor="#2E0C2A" />
        </linearGradient>
        <linearGradient id="lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b1534" />
          <stop offset="0.25" stopColor="#1a0617" />
          <stop offset="1" stopColor="#12040f" />
        </linearGradient>
        <linearGradient id="upholstery" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a0f34" />
          <stop offset="0.6" stopColor="#5a2150" />
          <stop offset="1" stopColor="#3a0f34" />
        </linearGradient>
      </defs>

      {showWindowFill && <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="transparent" />}

      {/* glass sheen and faint reflection of the room */}
      <g className="room-reflection">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#sheen)" />
        <g opacity="0.07" transform={`translate(0 ${y1 + 640}) scale(1 -1)`}>
          <rect x="800" y="640" width="130" height="160" rx="22" fill="#fff" />
          <rect x="460" y="770" width="330" height="30" fill="#fff" />
        </g>
      </g>

      {/* ceiling */}
      <rect x="0" y="0" width="1600" height={y0} fill={C.deep} />
      <rect x="0" y={y0 - 3} width="1600" height="3" fill={C.gold} />
      <rect x="120" y="30" width="760" height="4" fill="#F3E7C8" opacity="0.6" />

      {/* left wall sliver */}
      <rect x="0" y={y0} width={x0} height={y1 - y0} fill={C.deep} />

      {/* right wall with panel seams and gold skirting */}
      <rect x={x1} y="0" width={1600 - x1} height={y1} fill="url(#wall)" />
      {[1100, 1190, 1280, 1370, 1460, 1550].map((x) => (
        <rect key={x} x={x} y={y0} width="1" height={y1 - y0} fill="#ffffff" opacity="0.06" />
      ))}
      <rect x={x1} y={y1 - 6} width={1600 - x1} height="2" fill={C.gold} opacity="0.85" />

      {/* mullions and transom */}
      {ROOM.mullions.map((x) => (
        <rect key={x} x={x - 5} y={y0} width="10" height={y1 - y0} fill="#2a0a26" />
      ))}
      <rect x={x0} y={y1 - 8} width={x1 - x0} height="8" fill="#2a0a26" />

      {/* floor */}
      <rect x="0" y={y1} width="1600" height={1000 - y1} fill="url(#floor)" />
      <rect x="0" y={y1} width="1600" height={1000 - y1} fill="url(#sunwash)" />
      {[-500, 120, 940, 1600, 2300].map((xb) => {
        const [ax, ay, bx, by] = floorLine(xb);
        return <line key={xb} x1={ax} y1={ay} x2={bx} y2={by} stroke={C.gold} strokeWidth="2" opacity="0.8" />;
      })}
      {[760, 850, 960].map((y) => (
        <line key={y} x1="0" x2="1600" y1={y} y2={y} stroke="#b9b3aa" strokeWidth="1" opacity="0.6" />
      ))}

      {/* low sun: mullion shadows rake across the floor and move with scroll */}
      <g className="room-shadows">
        {ROOM.mullions.map((x) => (
          <polygon key={x} points={`${x - 6},${y1} ${x + 6},${y1} ${x + 26},1000 ${x - 22},1000`} fill={C.burgundy} opacity="0.16" />
        ))}
      </g>

      {/* hanging information display */}
      <g>
        <line x1="850" y1={y0} x2="850" y2="92" stroke="#1a0618" strokeWidth="2" />
        <line x1="970" y1={y0} x2="970" y2="92" stroke="#1a0618" strokeWidth="2" />
        <rect x="818" y="90" width="184" height="112" fill={C.deep} stroke={hl('languages') === 'none' ? '#5a2a52' : C.gold} strokeWidth="2" />
        <text x="832" y="112" fill={C.gold} fontFamily="'IBM Plex Mono'" fontSize="10" letterSpacing="1.5">
          {boarding ? 'NOW BOARDING' : 'ALTITUDE LOUNGE'}
        </text>
        {boarding ? (
          <>
            <text x="832" y="152" fill={C.silver} fontFamily="'IBM Plex Mono'" fontSize="22" letterSpacing="1">
              {site.fictionalFlight}
            </text>
            <text x="832" y="186" fill="#c9b9c4" fontFamily="'IBM Plex Mono'" fontSize="9" letterSpacing="1.2">
              FICTIONAL FLIGHT · GATE 01
            </text>
          </>
        ) : (
          <>
            <text key={g.lang} className="greet" x="832" y="164" fill={C.silver} fontFamily={greetFont} fontSize="28" lang={g.lang}>
              {g.text}
            </text>
            <text x="832" y="188" fill="#c9b9c4" fontFamily="'IBM Plex Mono'" fontSize="9" letterSpacing="1.2">
              {g.label.toUpperCase()}
            </text>
          </>
        )}
      </g>

      {/* closed grand piano with an open score */}
      <g>
        <path
          d="M96 690 C 96 650, 140 640, 200 640 L 330 640 C 380 640, 420 660, 430 700 L 430 742 L 96 742 Z"
          fill="url(#lacquer)"
          stroke={hl('braille')}
          strokeWidth="3"
        />
        <path d="M100 676 C 120 652, 160 648, 210 648 L 330 648 C 370 648, 404 662, 418 690" fill="none" stroke="#9c8796" strokeWidth="1.2" opacity="0.6" />
        <rect x="96" y="742" width="334" height="22" fill="#1a0617" />
        <rect x="112" y="764" width="10" height="112" fill="#12040f" />
        <rect x="402" y="764" width="10" height="112" fill="#12040f" />
        <rect x="250" y="764" width="10" height="96" fill="#12040f" />
        <rect x="200" y="866" width="120" height="6" fill="#12040f" />
        {/* music desk and score */}
        <path d="M238 642 L 252 596 L 382 596 L 368 642 Z" fill="#1a0617" />
        <rect x="258" y="600" width="104" height="38" fill="#EEECE7" />
        {BRAILLE_CELLS.map((cell, ci) =>
          cell.dots.map((d) => {
            const [cx, cy] = dotPosition(d);
            return <circle key={`${ci}-${d}`} cx={270 + ci * 19 + cx * 6} cy={609 + cy * 7} r="1.9" fill="#3A0F34" />;
          }),
        )}
      </g>

      {/* low table with folio, tablet and boarding pass */}
      <g>
        <polygon points="470,772 772,772 804,804 438,804" fill={C.deep} />
        <polygon points="438,804 804,804 804,814 438,814" fill="#120410" />
        <line x1="438" y1="804" x2="804" y2="804" stroke="#B9B2AC" strokeWidth="1.5" />
        <rect x="470" y="814" width="10" height="60" fill="#120410" />
        <rect x="764" y="814" width="10" height="60" fill="#120410" />
        {/* folio */}
        <polygon points="496,774 586,774 594,796 490,796" fill="#5A1E4F" stroke={hl('commercial') === 'none' ? '#7a3a6e' : C.gold} strokeWidth="2" />
        <line x1="500" y1="791" x2="589" y2="791" stroke={C.gold} strokeWidth="1" strokeDasharray="3 2" />
        {/* tablet with an illustrative chart */}
        <polygon points="604,776 670,776 676,794 600,794" fill="#140a12" stroke={hl('analytics') === 'none' ? '#3c2a37' : C.gold} strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={612 + i * 11} y={790 - [8, 11, 6, 13, 9][i]} width="6" height={[8, 11, 6, 13, 9][i]} fill={C.gold} opacity="0.9" />
        ))}
        {/* boarding pass */}
        <polygon points="690,778 740,778 744,790 687,790" fill={C.silver} />
        <line x1="728" y1="778" x2="731" y2="790" stroke={C.burgundy} strokeWidth="1" strokeDasharray="1.5 1.5" />
      </g>

      {/* one empty chair, facing the window */}
      <g>
        <path d="M818 660 C 818 646, 832 640, 846 640 L 902 640 C 916 640, 930 646, 930 660 L 930 800 L 818 800 Z" fill="url(#upholstery)" />
        <path d="M806 760 L 942 760 L 946 820 L 802 820 Z" fill="#2c0b28" />
        <rect x="806" y="700" width="16" height="110" rx="6" fill="#4a1642" />
        <rect x="926" y="700" width="16" height="110" rx="6" fill="#4a1642" />
        <line x1="874" y1="652" x2="874" y2="790" stroke="#7b3a70" strokeWidth="1" opacity="0.7" />
        <rect x="812" y="820" width="6" height="56" fill="#9b9590" />
        <rect x="930" y="820" width="6" height="56" fill="#9b9590" />
      </g>
    </svg>
  );
}
