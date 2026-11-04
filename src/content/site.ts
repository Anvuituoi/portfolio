/**
 * Site-wide configuration. Edit this file to update identity, links and review markers.
 * Every value still marked `confirm(...)` or `placeholder(...)` is listed by `npm run gaps`.
 */
import type { Marked } from './markers';

export const site = {
  name: 'ALTITUDE',
  tagline: 'Beyond the Ordinary. Connecting Ideas, People & Possibilities.',
  /** Public display name (confirmed by the owner). */
  person: { value: 'Lâm Vũ An' } as Marked,
  /** English name, shown beside the Vietnamese name. */
  englishName: 'Chadd Lam',
  /** Confirmed by the owner for public use. */
  employer: { value: 'Sun PhuQuoc Airways' } as Marked,
  email: 'lamvuan02@gmail.com',
  /**
   * Optional links. Leave `href` empty to hide the link in production.
   * In review mode an unset link is shown as a non-interactive [TO CONFIRM] label, never as a dead link.
   */
  links: {
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/anvuituoi/' },
    github: { label: 'GitHub', href: 'https://github.com/anvuituoi' },
    website: { label: 'Website', href: '' },
  },
  /**
   * Review mode shows [TO CONFIRM] / [PLACEHOLDER] / [DRAFT FOR OWNER REVIEW] markers on the page.
   * Set to false only after every item in CONTENT_GAPS.md is resolved.
   */
  reviewMode: false,
  /** Clearly fictional flight code used on the lounge display and boarding pass. */
  fictionalFlight: 'ALT·0001',
} as const;

export type SiteLinks = typeof site.links;
export type { Marked };
