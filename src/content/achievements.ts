export interface Achievement {
  rank: string;
  title: string;
  year?: number;
  where?: string;
}

/** Chapter 06 — Cruise. Only ranks and years are animated, because only they are numbers in the source. */
export const achievements: Achievement[] = [
  { rank: 'First Prize', title: 'RMIT Accessibility Design Competition', year: 2024 },
  { rank: 'Top 5', title: 'Microsoft ASEAN AI for Accessibility Hackathon, Vietnam', year: 2024 },
  { rank: 'First Prize', title: 'GDSC IDEA Contest: THiNK', year: 2023 },
  { rank: 'Third Prize', title: 'Policy Pitch Adventure: Navigating Digital Transformation Challenges', year: 2024 },
  {
    rank: 'Fully funded recipient',
    title: 'Global Engagement Summer Study Grants',
    year: 2024,
    where: 'International Summer School at National Chengchi University, Taiwan',
  },
  { rank: 'Vietnam Delegate', title: 'Regen Asia Summit (RAS)', year: 2025, where: 'NUS, Singapore' },
  { rank: 'Vietnam Delegate', title: 'Asian Undergraduate Symposium (AUS)', year: 2025, where: 'Singapore' },
  { rank: 'Second Prize', title: 'Film Essay: “Negotiating with Modernity”', where: 'In collaboration with Dartmouth College' },
];

/** Press coverage. Headlines quoted as published. */
export const press: { outlet: string; headline: string; lang?: string; href: string }[] = [
  {
    outlet: 'Báo Thanh Niên',
    headline: 'Tân khoa Trường Fulbright bảo tồn tri thức nhân văn bằng tư duy liên ngành',
    lang: 'vi',
    href: 'https://thanhnien.vn/tan-khoa-truong-fulbright-bao-ton-tri-thuc-nhan-van-bang-tu-duy-lien-nganh-185250703094616573.htm',
  },
  {
    outlet: 'Fulbright University Vietnam',
    headline: 'Fulbright Pioneer Leads Digital Humanities Initiative',
    href: 'https://fulbright.edu.vn/fulbright-pioneer-leads-digital-humanities-initiative/',
  },
  {
    outlet: 'Fulbright University Vietnam',
    headline: 'DHLab@Fulbright: Exploring the Intersection of Digital Technology and the Humanities',
    href: 'https://fulbright.edu.vn/dhlabfulbright-exploring-the-intersection-of-digital-technology-and-the-humanities/',
  },
];

/** Chapter 07 — Descent. Titles only; cross-references point to facts elsewhere on the site. */
export const topics: { title: string; seeAlso?: { label: string; href: string }[] }[] = [
  { title: 'The future of commercial aviation', seeAlso: [{ label: 'Waypoint 1', href: '#case/aviation-commercial-operations' }] },
  { title: 'Aviation business models' },
  { title: 'Data-driven decision-making', seeAlso: [{ label: 'Analytics & Systems', href: '#lounge' }] },
  { title: 'Digital transformation', seeAlso: [{ label: 'Policy Pitch Adventure', href: '#cruise' }] },
  {
    title: 'Vietnamese culture and digital humanities',
    seeAlso: [{ label: 'Waypoint 3', href: '#case/fulbright-digital-humanities-lab' }],
  },
  {
    title: 'Accessibility through technology',
    seeAlso: [{ label: 'Waypoint 2', href: '#case/braille-music-library' }],
  },
];
