import { useEffect } from 'react';
import { contact, flightProfile, greetings, hero, lounge, skillGroups } from '../content/profile';
import { journey } from '../content/journey';
import { projects } from '../content/projects';
import { achievements, press, topics } from '../content/achievements';
import { site } from '../content/site';
import { T } from './Mark';
import { textOf } from '../content/markers';
import { BRAILLE_UNICODE, BRAILLE_WORD } from '../lib/braille';

/** The whole story as plain text. Works without WebGL, motion, or sight of the visuals. */
export function FlightManifest() {
  useEffect(() => {
    document.title = 'Flight Manifest — ALTITUDE';
    window.scrollTo(0, 0);
    document.getElementById('manifest-title')?.focus();
    return () => {
      document.title = `ALTITUDE — ${site.person.value}`;
    };
  }, []);
  const links = Object.values(site.links).filter((l) => l.href);
  return (
    <main id="main" className="manifest">
      <p>
        <a href="#gate" className="link-underline">
          ← Back to the flight
        </a>
      </p>
      <h1 id="manifest-title" tabIndex={-1}>
        Flight Manifest
      </h1>
      <p>A plain-text version of everything on ALTITUDE, in the order of the flight.</p>

      <h2>01 Gate</h2>
      <p>
        <strong>{hero.headline.join(' ')}</strong>
      </p>
      <p>{hero.supporting}</p>
      <p>
        <T v={site.person} /> — {hero.dimensions.join(' | ')}
      </p>

      <h2>02 Lounge: Skills &amp; Languages</h2>
      <p>
        {lounge.headline} {lounge.supporting}
      </p>
      {skillGroups.map((g) => (
        <section key={g.id}>
          <h3>
            <T v={g.label} />
          </h3>
          <ul>
            {g.items.map((i) => (
              <li key={i.text}>
                {i.text}
                {i.detail && ` (${i.detail})`}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p>
        Greetings on the lounge display:{' '}
        {greetings.map((g, i) => (
          <span key={g.lang}>
            {i > 0 && ', '}
            <span lang={g.lang}>{g.text}</span> ({g.label})
          </span>
        ))}
        .
      </p>

      <h2>03 Boarding: Flight Profile</h2>
      <ul>
        <li>
          Name: <span lang="vi">{site.person.value}</span> ({site.englishName})
        </li>
        <li>Professional focus: {flightProfile.focus}</li>
        <li>
          Education: {flightProfile.education.degree}, {flightProfile.education.school}. Major: {flightProfile.education.major};
          Minor: {flightProfile.education.minor}
        </li>
        <li>
          Personal statement: <T v={flightProfile.statement} />
        </li>
        <li>Key professional interests: {flightProfile.interests.join(', ')}</li>
      </ul>

      <h2>04 Takeoff: My Journey</h2>
      <ol>
        {journey.map((m, i) => (
          <li key={i}>
            <T v={m.date} /> — <T v={m.title} />
            {m.place && (
              <>
                , <T v={m.place} />
              </>
            )}
            {m.detail && (
              <>
                . <T v={m.detail} />
              </>
            )}
          </li>
        ))}
      </ol>

      <h2>05 Climb: Selected Projects</h2>
      {projects.map((p) => (
        <section key={p.slug}>
          <h3>
            {p.waypoint}: <T v={p.title} />
          </h3>
          <p>{p.summary}</p>
          <ul>
            {p.facts.map((f) => (
              <li key={textOf(f)}>
                <T v={f} />
              </li>
            ))}
            {p.secondary?.facts.map((f) => (
              <li key={textOf(f)}>
                {p.secondary!.heading}: <T v={f} />
              </li>
            ))}
          </ul>
          {p.slug === 'braille-music-library' && (
            <p>
              The visual for this waypoint shows city lights resolving into the word “{BRAILLE_WORD}” in literary Braille
              (uncontracted UEB): <span aria-hidden="true">{BRAILLE_UNICODE}</span>.
            </p>
          )}
          <p>
            <a href={`#case/${p.slug}`}>Case study</a>
          </p>
        </section>
      ))}

      <h2>06 Cruise: Achievements &amp; Milestones</h2>
      <ul>
        {achievements.map((a) => (
          <li key={a.title}>
            {a.rank} — {a.title}
            {a.year ? `, ${a.year}` : ''}
            {a.where ? `, ${a.where}` : ''}
          </li>
        ))}
      </ul>

      <h3>In the media</h3>
      <ul>
        {press.map((p) => (
          <li key={p.href}>
            {p.outlet}:{' '}
            <a href={p.href} lang={p.lang}>
              {p.headline}
            </a>
          </li>
        ))}
      </ul>

      <h2>07 Descent: Thinking &amp; Interests</h2>
      <ul>
        {topics.map((t) => (
          <li key={t.title}>{t.title}</li>
        ))}
      </ul>

      <h2>08 Next Destination: Contact</h2>
      <p>
        <strong>{contact.headline}</strong> {contact.supporting}
      </p>
      <ul>
        <li>
          Email: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
