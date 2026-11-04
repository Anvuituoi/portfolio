import { projects, type Project } from '../content/projects';
import { T } from './Mark';
import { OpsWorld } from './worlds/OpsWorld';
import { BrailleWorld } from './worlds/BrailleWorld';
import { ArchiveWorld } from './worlds/ArchiveWorld';
import { TraceWorld } from './worlds/TraceWorld';
import { textOf } from '../content/markers';

function World({ p }: { p: Project }) {
  switch (p.slug) {
    case 'aviation-commercial-operations':
      return <OpsWorld />;
    case 'braille-music-library':
      return <BrailleWorld />;
    case 'fulbright-digital-humanities-lab':
      return <ArchiveWorld />;
    default:
      return <TraceWorld lines={p.facts.map(textOf)} />;
  }
}

/** Chapter 05. Each project is a waypoint with its own world; each opens a deep-linked case study. */
export function ProjectWaypoints() {
  return (
    <section id="climb" className="climb content" data-chapters="4" aria-labelledby="climb-title">
      <div className="climb-intro section-pad">
        <p className="chapter-tag">05 · Climb · FL100 → FL350</p>
        <h2 id="climb-title" className="climb-h display">
          Selected Projects
        </h2>
        <p className="climb-sub serif">Four waypoints above the cloud deck.</p>
      </div>

      {projects.map((p, i) => (
        <article
          key={p.slug}
          id={`wpt-${p.slug}`}
          className={`wpt wpt-${i + 1} section-pad ${i % 2 ? 'wpt-flip' : ''}`}
          aria-labelledby={`wpt-title-${p.slug}`}
          data-route={`wpt${i + 1}`}
        >
          <div className="wpt-world">
            <World p={p} />
          </div>
          <div className="wpt-text">
            <p className="wpt-code mono">
              <span>{p.waypoint}</span>
              <span aria-hidden="true">{p.code}</span>
            </p>
            <h3 id={`wpt-title-${p.slug}`} className="wpt-title display">
              <T v={p.title} />
            </h3>
            <p className="wpt-summary serif">{p.summary}</p>
            <ul className="wpt-facts">
              {p.facts.map((f) => (
                <li key={textOf(f)}>
                  <T v={f} />
                </li>
              ))}
            </ul>
            {p.secondary && (
              <>
                <h4 className="wpt-sub mono">{p.secondary.heading}</h4>
                <ul className="wpt-facts">
                  {p.secondary.facts.map((f) => (
                    <li key={textOf(f)}>
                      <T v={f} />
                    </li>
                  ))}
                </ul>
              </>
            )}
            {p.link && (
              <p className="wpt-ext">
                <a className="link-underline" href={p.link.href} target="_blank" rel="noopener noreferrer">
                  {p.link.label}
                  <span className="sr-only"> (opens in a new tab)</span> ↗
                </a>
              </p>
            )}
            <a className="btn btn-solid wpt-open" href={`#case/${p.slug}`} data-cursor="project">
              Open case study<span className="sr-only">: {textOf(p.title)}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
