/** Content markers. A marked value is shown with a visible tag while `site.reviewMode` is true. */
export type MarkerKind = 'TO CONFIRM' | 'PLACEHOLDER' | 'DRAFT FOR OWNER REVIEW';
export interface Marked {
  value: string;
  marker?: MarkerKind;
  note?: string;
  /** BCP 47 language of the text when it is not English (e.g. 'vi'). */
  lang?: string;
}
export type Text = string | Marked;

export const confirm = (value: string, note: string): Marked => ({ value, marker: 'TO CONFIRM', note });
export const placeholder = (note: string, value = ''): Marked => ({ value, marker: 'PLACEHOLDER', note });
/** Text suggested on the owner's behalf. Shown with [DRAFT FOR OWNER REVIEW] until approved. */
export const draft = (value: string, note = 'Suggested wording: owner to approve or rewrite'): Marked => ({ value, marker: 'DRAFT FOR OWNER REVIEW', note });

/** Vietnamese text inside English copy, so screen readers switch pronunciation. */
export const vi = (value: string): Marked => ({ value, lang: 'vi' });

export const textOf = (t: Text): string => (typeof t === 'string' ? t : t.value);
export const markerOf = (t: Text): MarkerKind | undefined => (typeof t === 'string' ? undefined : t.marker);
