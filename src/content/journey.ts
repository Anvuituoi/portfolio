import type { Text } from './markers';
import { site } from './site';

export interface Milestone {
  date: Text;
  title: Text;
  detail?: Text;
  place?: Text;
}

const employer = site.employer.value;

/** Chapter 04 — Takeoff. Dates and titles follow the CV extract in the brief. */
export const journey: Milestone[] = [
  {
    date: '08/2021 – 06/2025',
    title: 'Fulbright University Vietnam',
    detail: 'Bachelor of Arts with honors, Vietnam Studies, minor in Economics',
  },
  {
    date: '12/2022 – 06/2025',
    title: 'Co-founder and President, Fulbright Digital Humanities Lab',
  },
  {
    date: '2022',
    title: 'Co-founder and Project Coordinator, Braille Music Library',
  },
  {
    date: '2024',
    title: 'International Summer School, National Chengchi University, Taiwan',
    detail: 'Fully funded by the Global Engagement Summer Study Grants',
  },
  {
    date: '2025',
    title: 'Vietnam Delegate, Regen Asia Summit and Asian Undergraduate Symposium',
    detail: 'Regen Asia Summit, NUS, Singapore; Asian Undergraduate Symposium, Singapore',
  },
  {
    date: '06/2025 – 02/2026',
    title: `Accountant, ${employer}`,
    place: 'Hanoi',
    detail: 'Core finance team during the startup phase; Project Coordinator for SAP S/4HANA Phase 1',
  },
  {
    date: '02/2026 – 06/2026',
    title: `Market Development Executive, ${employer}`,
    place: 'Hanoi',
  },
  {
    date: '06/2026 – Present',
    title: `Sales Operations & Policy Officer, Headquarters (HDQ), ${employer}`,
    place: 'Hanoi',
  },
];
