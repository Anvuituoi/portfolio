import { useModes } from '../flight/modes';
import { flyTo } from '../flight/scroll';

export function Navbar({ onToggleMotion }: { onToggleMotion: () => void }) {
  const { motion } = useModes();
  return (
    <header className="nav">
      <a
        href="#gate"
        className="wordmark"
        aria-label="ALTITUDE, back to the gate"
        onClick={(e) => {
          e.preventDefault();
          flyTo('gate');
        }}
      >
        ALTITUDE
      </a>
      <nav aria-label="Site" className="nav-links">
        <a className="nav-btn link-underline" href="#manifest">
          <span className="nav-long">Flight </span>Manifest
        </a>
        <button type="button" className="nav-btn" aria-pressed={motion} onClick={onToggleMotion}>
          Motion<span className="nav-long">:</span> {motion ? 'On' : 'Off'}
        </button>
        <a
          className="nav-btn link-underline nav-contact"
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            flyTo('contact');
          }}
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
