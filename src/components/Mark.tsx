import { markerOf, textOf, type Text } from '../content/markers';
import { site } from '../content/site';

/** Renders a content value, plus a visible review marker while review mode is on. */
export function T({ v, fallback = '' }: { v: Text; fallback?: string }) {
  const text = textOf(v);
  const marker = markerOf(v);
  const lang = typeof v === 'string' ? undefined : v.lang;
  if (lang) return <span lang={lang}>{text}</span>;
  if (!marker) return <>{text}</>;
  if (!site.reviewMode) return <>{text || fallback}</>;
  return (
    <>
      {text}
      <span className="marker" title={typeof v === 'string' ? undefined : v.note}>
        [{marker}]
      </span>
    </>
  );
}

/** True when a marked value has no real content and should be hidden in production. */
export const isEmpty = (v: Text) => !textOf(v);
