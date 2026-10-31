import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Shown after an enquiry is sent: a navy invitation envelope opens and a white card rises out with
 * "Thank you" in script. It closes by itself 3 seconds after the card is out (paused while the pointer is over it),
 * or straight away with the close button, Escape, or a click outside. The thank-you line under the form stays.
 */
const OUT_MS = 1400; // the card is fully out of the envelope
const HOLD_MS = 3000; // then it stays this long
export default function ThankYouEnvelope({ onClose }) {
  const closeRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const paused = useRef(false);
  useEffect(() => {
    let t;
    const tick = () => { t = setTimeout(() => { if (paused.current) tick(); else setLeaving(true); }, HOLD_MS); };
    const start = setTimeout(tick, OUT_MS);
    return () => { clearTimeout(start); clearTimeout(t); };
  }, []);
  useEffect(() => { if (!leaving) return undefined; const t = setTimeout(onClose, 450); return () => clearTimeout(t); }, [leaving, onClose]);
  useEffect(() => {
    const prev = document.activeElement;
    const t = setTimeout(() => closeRef.current && closeRef.current.focus({ preventScroll: true }), OUT_MS);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus({ preventScroll: true }); };
  }, [onClose]);

  return createPortal(
    <div className={leaving ? 'tuc-ty is-leaving' : 'tuc-ty'} role="dialog" aria-modal="true" aria-label="Thank you" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tuc-ty-stage" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
        <div className="tuc-ty-back" />
        <div className="tuc-ty-card">
          <button ref={closeRef} type="button" className="tuc-ty-close" aria-label="Close" data-tuc-orbit="off" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
          <p className="tuc-ty-word">Thank you</p>
          <svg className="tuc-ty-star" width="120" height="14" viewBox="0 0 120 14" aria-hidden="true"><line x1="0" y1="7" x2="50" y2="7" stroke="#B89B65" strokeWidth="1" /><g transform="translate(60 7) scale(0.62)"><path d="M0.15 -8.75 L2.24 -2.31 L9.23 -1.82 L3.85 2.08 L5.84 8.77 L-0.15 5.20 L-5.59 8.52 L-3.85 2.38 L-9.33 -2.02 L-2.29 -2.31Z" fill="none" stroke="#B89B65" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round" /></g><line x1="70" y1="7" x2="120" y2="7" stroke="#B89B65" strokeWidth="1" /></svg>
        </div>
        <div className="tuc-ty-front" />
        <div className="tuc-ty-flap"><span className="tuc-ty-seal" aria-hidden="true">UC</span></div>
      </div>
    </div>,
    document.body,
  );
}
