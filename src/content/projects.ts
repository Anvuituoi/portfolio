import { vi, type Text } from './markers';

export interface CaseStudy {
  context: Text[];
  role: Text[];
  did: Text[];
  outcome: Text[];
  learned: Text[];
}

export interface Project {
  slug: string;
  waypoint: string;
  code: string;
  title: Text;
  world: string;
  summary: string;
  facts: Text[];
  secondary?: { heading: string; facts: Text[] };
  /** External project site, opened in a new tab. */
  link?: { label: string; href: string };
  caseStudy: CaseStudy;
}


export const projects: Project[] = [
  {
    slug: 'aviation-commercial-operations',
    waypoint: 'Waypoint 1',
    code: 'WPT·OPS',
    title: 'Aviation Commercial Operations',
    world: 'Operations control room',
    summary: 'Building the processes, policies and reporting that a regional sales network runs on.',
    facts: [
      'Sales processes, channel policies and playbooks for field sales teams across regions',
      'Performance analysis of Revenue, Pax, Yield and channel effectiveness',
      'KPI dashboards and periodic reports to management',
      'Coordination across Marketing, Revenue Management, Legal, government agencies and agents',
      'Support for new route promotion and market development',
    ],
    secondary: {
      heading: 'Earlier roles',
      facts: [
        'Managed and developed relationships with 150+ travel agencies and strategic partners across Northern Vietnam',
        'Project Coordinator for SAP S/4HANA Phase 1',
        'Participated in evaluating and working with General Sales Agents across Taiwan, Korea, Singapore and China',
      ],
    },
    caseStudy: {
      context: [
        'A commercial airline in its startup phase, with sales teams working across regions and channels (OTA, wholesale, corporate, GDS and traditional agents).',
      ],
      role: ['Sales Operations & Policy Officer, Headquarters (HDQ). Coordination and support for the sales market system rather than direct selling.'],
      did: [
        'Designed sales processes, channel policies and playbooks for field sales teams across regions',
        'Analysed Revenue, Pax, Yield and channel effectiveness',
        'Built KPI dashboards and periodic reports to management',
        'Coordinated across Marketing, Revenue Management, Legal, government agencies and agents',
        'Supported new route promotion and market development',
      ],
      outcome: [
        'Field sales teams across regions work from one set of processes, channel policies and playbooks, and management receives regular KPI reporting on Revenue, Pax, Yield and channel effectiveness.',
      ],
      learned: [
        'A policy is finished only when a sales team in the field can apply it without calling headquarters. Clear rules, shared data and early agreement with Revenue, Legal and Marketing matter more than the document itself.',
      ],
    },
  },
  {
    slug: 'braille-music-library',
    waypoint: 'Waypoint 2',
    code: 'WPT·BRL',
    title: 'Braille Music Library',
    world: 'City lights through a night cabin window',
    summary: 'Making Braille music scores easier to find and read.',
    facts: [
      'An accessibility initiative that makes Braille music scores more accessible',
      'Collaboration with more than 20 schools and organizations serving blind and visually impaired communities',
      'Development of a digital Braille music library',
      'A database of thousands of Braille music scores',
      'Funding pitched successfully to IDP and Temasek',
    ],
    link: { label: 'Visit Braille Music Library', href: 'https://braille-music-library.web.app/' },
    caseStudy: {
      context: ['Braille music scores are hard to obtain for blind and visually impaired musicians and learners.'],
      role: ['Co-founder and Project Coordinator (2022)'],
      did: [
        'Collaborated with more than 20 schools and organizations serving blind and visually impaired communities',
        'Developed a digital Braille music library, with a database of thousands of scores',
        'Pitched successfully for funding from IDP and Temasek',
      ],
      outcome: [
        'A digital Braille music library, built together with more than 20 schools and organizations serving blind and visually impaired communities.',
      ],
      learned: [
        'Accessibility work starts with the people who will use it. The schools and organizations we worked with decided what the library needed to be; coordination was mostly listening, then turning what we heard into a plan.',
      ],
    },
  },
  {
    slug: 'fulbright-digital-humanities-lab',
    waypoint: 'Waypoint 3',
    code: 'WPT·FDH',
    title: 'Fulbright Digital Humanities Lab',
    world: 'An archive taking shape in the clouds',
    summary: 'A student-led lab bringing digital tools to the social sciences, humanities and arts.',
    facts: [
      'A student-led laboratory under the Vietnam Studies Center, integrating digital technology with social sciences, humanities and arts',
      'Co-founded and led as President (12/2022 – 06/2025)',
      'Partnerships with over 15 institutions, including the British Council and Goethe-Institut',
      'Over $15,000 in funding secured',
      'Seven projects launched',
      'Three workshops engaging more than 400 participants',
      'Supported the extension of digital resources for Digitizing Vietnam, a collaboration with Columbia University funded with $600,000 from the Henry Luce Foundation',
      'More than 20 academic and community-related activities over the project lifecycle',
    ],
    caseStudy: {
      context: ['The Vietnam Studies Center at Fulbright University Vietnam had no student-led space for digital methods in the humanities.'],
      role: ['Co-founder and President, 12/2022 – 06/2025'],
      did: [
        'Built partnerships with over 15 institutions, including the British Council and Goethe-Institut',
        'Secured over $15,000 in funding',
        'Launched seven projects and ran three workshops engaging more than 400 participants',
        'Supported the extension of digital resources for Digitizing Vietnam (a Columbia University collaboration funded with $600,000 from the Henry Luce Foundation; the funding belongs to Digitizing Vietnam, not to the lab)',
      ],
      outcome: [
        'Seven projects, three workshops with more than 400 participants and more than 20 activities, supported by over 15 partner institutions and over $15,000 in funding.',
      ],
      learned: [
        'A student-led lab runs on partnerships. Institutions said yes to clear, small first projects, and each finished project made the next partnership easier to build.',
      ],
    },
  },
  {
    slug: 'research-and-innovation',
    waypoint: 'Waypoint 4',
    code: 'WPT·RSH',
    title: 'Research & Innovation',
    world: 'A flight-recorder trace',
    summary: 'The research threads that run under the other three.',
    facts: ['Digital humanities', 'Vietnamese culture', 'Data analytics', 'Technology for social good'],
    secondary: {
      heading: 'Outputs',
      facts: [
        vi('Published paper “Vân Tiên Spoken Poetry: Something to Feel”, in Truyện thơ nôm Lục Vân Tiên Song Ngữ Việt – Hàn'),
        'Conference presentation “Developing a Centralized Digital Humanities Platform for Vietnam: Opportunities and Challenges”, Engaging with Vietnam International Conference 2023',
      ],
    },
    caseStudy: {
      context: [
        'Research on Vietnamese literature and on the digital infrastructure the humanities in Vietnam need, carried out alongside the Fulbright Digital Humanities Lab.',
      ],
      role: ['Author and conference presenter'],
      did: [
        vi('Wrote “Vân Tiên Spoken Poetry: Something to Feel”, published in Truyện thơ nôm Lục Vân Tiên Song Ngữ Việt – Hàn'),
        'Presented “Developing a Centralized Digital Humanities Platform for Vietnam: Opportunities and Challenges” at the Engaging with Vietnam International Conference 2023',
      ],
      outcome: ['One published paper and one international conference presentation.'],
      learned: [
        'The same questions run through my aviation, archive and accessibility work: who the data leaves out, and how technology can close that gap.',
      ],
    },
  },
];
