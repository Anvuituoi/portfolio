import { useEffect, useRef } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from 'lucide-react';
import { projects } from '../content/projects';
import { T } from './Mark';
import { textOf, type Text } from '../content/markers';
import { lenis } from '../flight/scroll';

const SECTIONS: [keyof (typeof projects)[number]['caseStudy'], string][] = [
  ['context', 'Context'],
  ['role', 'My role'],
  ['did', 'What I did'],
  ['outcome', 'Outcome'],
  ['learned', 'What I learned'],
];

function Items({ items }: { items: Text[] }) {
  if (items.length === 1)
    return (
      <p>
        <T v={items[0]} />
      </p>
    );
  return (
    <ul>
      {items.map((t) => (
        <li key={textOf(t)}>
          <T v={t} />
        </li>
      ))}
    </ul>
  );
}

/** Case study dialog. Deep link: #case/<slug>. Focus is trapped; Escape and Back close it. */
export function ProjectModal({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const project = projects.find((p) => p.slug === slug) ?? null;
  const dialog = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;
    returnTo.current = document.activeElement as HTMLElement;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    const prevInert: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>('#root > *:not(.modal-root)').forEach((el) => {
      if (!el.inert) {
        el.inert = true;
        prevInert.push(el);
      }
    });
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('h2')?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialog.current) {
        const f = [...dialog.current.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])')];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prevInert.forEach((el) => (el.inert = false));
      document.body.style.overflow = '';
      lenis?.start();
      const back = document.getElementById(`wpt-${project.slug}`)?.querySelector<HTMLElement>('.wpt-open');
      (back ?? returnTo.current)?.focus({ preventScroll: true });
    };
  }, [project, onClose]);

  return (
    <div className="modal-root">
      <AnimatePresence>
        {project && (
          <m.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <m.div
              ref={dialog}
              className="modal on-dark"
              role="dialog"
              aria-modal="true"
              aria-labelledby="case-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 0.61, 0.18, 1] } }}
              exit={{ y: 20, opacity: 0, transition: { duration: 0.25 } }}
              data-lenis-prevent
            >
              <div className="modal-top">
                <span className="mono">
                  {project.waypoint} · Case study · {project.world}
                </span>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Close case study">
                  <X size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <h2 id="case-title" className="modal-title display" tabIndex={-1}>
                <T v={project.title} />
              </h2>
              <p className="modal-summary serif">{project.summary}</p>
              {project.link && (
                <p className="modal-ext">
                  <a className="link-underline" href={project.link.href} target="_blank" rel="noopener noreferrer">
                    {project.link.label}
                    <span className="sr-only"> (opens in a new tab)</span> ↗
                  </a>
                </p>
              )}
              <div className="modal-grid">
                {SECTIONS.map(([k, label]) => (
                  <section key={k} className="modal-sec" aria-labelledby={`case-${k}`}>
                    <h3 id={`case-${k}`} className="mono">
                      {label}
                    </h3>
                    <Items items={project.caseStudy[k]} />
                  </section>
                ))}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
