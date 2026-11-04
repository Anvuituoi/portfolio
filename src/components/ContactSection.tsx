import { contact } from '../content/profile';
import { site } from '../content/site';

type LinkKey = keyof typeof site.links;

/** Chapter 08. The golden route that began at the gate arrives here. No dead links are rendered. */
export function ContactSection() {
  const optional: LinkKey[] = ['linkedin', 'github'];
  return (
    <section id="contact" className="contact content section-pad" data-chapters="7" data-enter="early" aria-labelledby="contact-title">
      <p className="chapter-tag">08 · Next Destination · Horizon</p>
      <h2 id="contact-title" className="contact-h display">
        {contact.headline}
      </h2>
      <p className="contact-sub serif">{contact.supporting}</p>
      <ul className="contact-links">
        <li data-route="cta">
          <a className="btn btn-solid contact-primary" href={`mailto:${site.email}`} data-cursor="link">
            Email <span className="contact-email">{site.email}</span>
          </a>
        </li>
        {optional.map((k) => {
          const l = site.links[k];
          if (l.href)
            return (
              <li key={k}>
                <a
                  className="btn"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            );
          if (!site.reviewMode) return null;
          return (
            <li key={k} className="contact-pending">
              <span className="btn btn-pending" aria-disabled="true">
                {l.label}
                <span className="marker">[TO CONFIRM]</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer content section-pad">
      <span className="wordmark">ALTITUDE</span>
      <span className="mono">{site.tagline}</span>
      <span className="mono">
        <a href="#manifest" className="link-underline">
          Flight Manifest (plain text)
        </a>
      </span>
    </footer>
  );
}
