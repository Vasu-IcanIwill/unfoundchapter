import { useEffect, useState } from 'react';
import { readChoice, saveChoice, OPEN_EVENT } from '../utils/consent.js';

/** Cookie notice. Shown after hydration, only until the visitor chooses; reopened by "Cookie settings". */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!readChoice()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);
  if (!open) return null;
  const choose = (c) => { setOpen(false); saveChoice(c); };
  return (
    <div className="tuc-consent-bar" role="dialog" aria-live="polite" aria-label="Cookie choice">
      <p className="tuc-consent-title">Your privacy, kept</p>
      <p className="tuc-consent-text">
        With your permission, we use cookies from Google and Meta to count visits and see which of our ads bring you here.
        Choose “Only essential” and no tracking cookies are set. <a href="/privacy.html#website">Privacy</a>
      </p>
      <div className="tuc-consent-btns">
        <button type="button" className="tuc-consent-yes" onClick={() => choose('all')}>Accept</button>
        <button type="button" className="tuc-consent-no" onClick={() => choose('essential')}>Only essential</button>
      </div>
    </div>
  );
}
