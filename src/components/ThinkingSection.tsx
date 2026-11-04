import { useEffect, useRef } from 'react';
import { topics } from '../content/achievements';
import { useModes } from '../flight/modes';
import { ScrollTrigger } from '../flight/scroll';
import { posterUrl } from './SceneHost';

/** Chapter 07. The pace slows: a cabin window, large editorial type, generous space. */
export function ThinkingSection() {
  const { live, compact } = useModes();
  const wrap = useRef<HTMLElement>(null);
  const items = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (!live) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: ({ progress: p }) => {
        items.current.forEach((el, i) => {
          if (!el) return;
          const k = Math.min(1, Math.max(0, (p - 0.05 - i * 0.12) / 0.14));
          // inactive topics stay clearly readable; the active one simply comes forward
          el.style.opacity = String(0.62 + 0.38 * k);
          el.style.transform = `translate3d(0, ${(1 - k) * 18}px, 0)`;
        });
      },
    });
    return () => st.kill();
  }, [live]);

  return (
    <section id="descent" ref={wrap} className={`descent content ${live ? 'descent-live' : ''}`} data-chapters="6" aria-labelledby="descent-title">
      <div className="descent-stage">
        <div className="cabin-cut" aria-hidden="true">
          {compact && <img className="cabin-img" src={posterUrl('descent', false)} alt="" loading="lazy" decoding="async" />}
          <div className="cabin-shade" />
        </div>
        <div className="descent-text section-pad">
          <p className="chapter-tag">07 · Descent · FL410 → FL100</p>
          <h2 id="descent-title" className="descent-h mono">
            Thinking &amp; Interests
          </h2>
          <ol className="topics">
            {topics.map((t, i) => (
              <li key={t.title} ref={(el) => { if (el) items.current[i] = el; }} className="topic">
                <span className="topic-num mono" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="topic-title display">{t.title}</span>
                {t.seeAlso && (
                  <span className="topic-see mono">
                    See{' '}
                    {t.seeAlso.map((s) => (
                      <a key={s.href} href={s.href} className="link-underline">
                        {s.label}
                      </a>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
