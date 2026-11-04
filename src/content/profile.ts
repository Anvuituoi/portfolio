import type { Text } from './markers';

/** Chapter 01 — Gate. Text supplied in the brief. */
export const hero = {
  headline: ['BEYOND', 'THE ORDINARY.'],
  supporting: 'I work where airline commercial strategy, digital humanities, and accessibility technology meet.',
  dimensions: ['Aviation & Business', 'Technology & Innovation', 'Culture & Social Impact'],
};

/** Chapter 02 — Lounge. */
export const lounge = {
  headline: 'BEFORE WE BOARD.',
  supporting: 'A few things worth knowing first.',
};

export interface SkillGroup {
  id: 'commercial' | 'analytics' | 'languages' | 'braille';
  object: string;
  label: Text;
  items: { text: string; lang?: string; detail?: string }[];
  note?: string;
  link?: { label: string; href: string };
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'commercial',
    object: 'Leather folio',
    label: 'Commercial & Sales Operations',
    items: [
      { text: 'Sales process and channel policy design' },
      { text: 'Distribution channel management (OTA, wholesale, corporate, GDS, traditional agents)' },
      { text: 'Agency network development' },
      { text: 'Sales playbooks and market-entry planning' },
    ],
  },
  {
    id: 'analytics',
    object: 'Tablet',
    label: 'Analytics & Systems',
    items: [
      { text: 'Revenue, Pax and Yield performance analysis' },
      { text: 'KPI dashboards and management reporting' },
      { text: 'SAP S/4HANA (implementation coordination)' },
      { text: 'HubSpot CRM' },
      { text: 'Python (office automation)' },
      { text: 'Microsoft Office, Google Workspace, WordPress' },
    ],
    note: 'Chart on the tablet: illustrative data only.',
  },
  {
    id: 'languages',
    object: 'Information display',
    label: 'Languages',
    items: [
      { text: 'Vietnamese', detail: 'native' },
      { text: 'English', detail: 'advanced' },
      { text: 'Chinese', detail: 'intermediate' },
      { text: 'Khmer', detail: 'beginner' },
    ],
  },
  {
    id: 'braille',
    object: 'Grand piano with an open score',
    label: 'Braille Music Library',
    items: [
      { text: 'An accessibility initiative that makes Braille music scores more accessible' },
      { text: 'Development of a digital Braille music library' },
    ],
    note: 'The score shows the word “music” in literary Braille (uncontracted UEB), not Braille music notation.',
    link: { label: 'Read the case study', href: '#case/braille-music-library' },
  },
];

/** The lounge display greets once in each language. */
export const greetings = [
  { text: 'Xin chào', lang: 'vi', label: 'Vietnamese' },
  { text: 'Welcome', lang: 'en', label: 'English' },
  { text: '欢迎', lang: 'zh-Hans', label: 'Chinese' },
  { text: 'សូមស្វាគមន៍', lang: 'km', label: 'Khmer' },
];

/** Chapter 03 — Boarding pass. */
export const flightProfile = {
  focus: 'Aviation, Business Strategy, Data & Innovation',
  education: {
    degree: 'Bachelor of Arts, graduated with honors',
    school: 'Fulbright University Vietnam',
    major: 'Vietnam Studies',
    minor: 'Economics',
  },
  statement: 'I work on the systems behind an airline’s sales network, and outside it on projects that open culture and knowledge to more people: a digital humanities lab and a Braille music library. Both ask the same question: who can reach this, and what stands in the way? I bring that question, and the data to answer it, to every team I join.',
  interests: [
    'Commercial aviation',
    'Airline operations',
    'Business strategy',
    'Market development',
    'Data-driven decision-making',
    'Digital transformation',
    'Accessibility technology',
    'Digital humanities',
  ],
};

/** Chapter 08 — Contact. */
export const contact = {
  headline: 'READY FOR THE NEXT DESTINATION?',
  supporting: 'I am always interested in meaningful collaborations, ambitious ideas, and opportunities to create impact.',
};
