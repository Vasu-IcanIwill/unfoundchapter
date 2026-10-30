import { useEffect, useState } from 'react';
import { readChoice, saveChoice, applyChoice, OPEN_EVENT } from '../utils/consent.js';

// The consent notice (DPDP Rules 2025, Rule 3): per purpose, itemised data, how to withdraw, link to rights and
// complaints. Offered in English and Hindi. Keep both languages saying the same thing.
const T = {
  en: {
    title: 'Your privacy, kept',
    intro: 'This website works without any optional cookies. With your permission we would use two kinds. You can change your mind at any time with “Cookie settings” at the foot of every page.',
    all: 'Accept all', none: 'Only essential', choose: 'Choose', save: 'Save my choices',
    purposes: [
      ['analytics', 'Analytics', 'Google Analytics shows us which pages are read and which journeys interest people. It records the pages you view, how you arrived (for example from an ad or a search), your approximate city, your device and browser, and whether you sent an enquiry or tapped WhatsApp, linked to a cookie ID. Not your name, email or phone number. Google keeps it for 2 months.'],
      ['ads', 'Advertising', 'Google Ads and Meta (Facebook and Instagram) show us which of our ads brought you here. They record the ad you clicked, the pages you view, and whether you sent an enquiry or tapped WhatsApp, linked to a cookie ID. Not your name, email or phone number.'],
    ],
    more: 'Full notice, your rights and how to complain',
  },
  hi: {
    title: 'आपकी निजता, सुरक्षित',
    intro: 'यह वेबसाइट किसी भी वैकल्पिक कुकी के बिना काम करती है। आपकी अनुमति से हम दो तरह की कुकी का उपयोग करेंगे। आप हर पेज के नीचे “Cookie settings” से कभी भी अपना निर्णय बदल सकते हैं।',
    all: 'सभी स्वीकार करें', none: 'केवल आवश्यक', choose: 'चुनें', save: 'मेरी पसंद सहेजें',
    purposes: [
      ['analytics', 'विश्लेषण (Analytics)', 'Google Analytics से हम जानते हैं कि कौन-से पेज पढ़े जाते हैं और किन यात्राओं में लोगों की रुचि है। यह आपके देखे गए पेज, आप यहाँ कैसे पहुँचे (जैसे किसी विज्ञापन या खोज से), आपका अनुमानित शहर, आपका डिवाइस और ब्राउज़र, और यह कि आपने पूछताछ भेजी या WhatsApp पर टैप किया, एक कुकी ID के साथ दर्ज करता है। आपका नाम, ईमेल या फ़ोन नंबर नहीं। Google इसे 2 महीने तक रखता है।'],
      ['ads', 'विज्ञापन (Advertising)', 'Google Ads और Meta (Facebook और Instagram) से हम जानते हैं कि हमारा कौन-सा विज्ञापन आपको यहाँ लाया। ये आपके द्वारा क्लिक किया गया विज्ञापन, आपके देखे गए पेज, और यह कि आपने पूछताछ भेजी या WhatsApp पर टैप किया, एक कुकी ID के साथ दर्ज करते हैं। आपका नाम, ईमेल या फ़ोन नंबर नहीं।'],
    ],
    more: 'पूरी सूचना, आपके अधिकार और शिकायत कैसे करें',
  },
};

/** Cookie notice. Shown after hydration until the visitor chooses; reopened by "Cookie settings". */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [lang, setLang] = useState('en');
  const [sel, setSel] = useState({ analytics: false, ads: false });

  useEffect(() => {
    const c = readChoice();
    if (c) { applyChoice(c); setSel({ analytics: c.analytics, ads: c.ads }); if (c.lang) setLang(c.lang); }
    else setOpen(true); // always opens in English; Hindi is one tap away
    const reopen = () => {
      const now = readChoice();
      if (now) setSel({ analytics: now.analytics, ads: now.ads });
      setDetail(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;
  const t = T[lang];
  const done = (choice) => { setOpen(false); setDetail(false); saveChoice({ ...choice, lang }); };

  return (
    <div className="tuc-consent-bar" role="dialog" aria-live="polite" aria-label={t.title} lang={lang}>
      <div className="tuc-consent-tabs" role="group" aria-label="Language / भाषा">
        <button type="button" data-tuc-orbit="off" lang="en" aria-pressed={lang === 'en'} className={lang === 'en' ? 'is-on' : ''} onClick={() => setLang('en')}>English</button>
        <button type="button" data-tuc-orbit="off" lang="hi" aria-pressed={lang === 'hi'} className={lang === 'hi' ? 'is-on' : ''} onClick={() => setLang('hi')}>हिन्दी</button>
      </div>
      <p className="tuc-consent-title">{t.title}</p>
      <p className="tuc-consent-text">{t.intro}</p>
      {detail ? (
        <div className="tuc-consent-purposes">
          {t.purposes.map(([key, name, text]) => (
            <label key={key} className="tuc-consent-purpose">
              <span className="tuc-consent-row">
                <span className="tuc-consent-name">{name}</span>
                <input type="checkbox" role="switch" name={key} checked={sel[key]} onChange={(e) => setSel((s) => ({ ...s, [key]: e.target.checked }))} />
              </span>
              <span className="tuc-consent-what">{text}</span>
            </label>
          ))}
        </div>
      ) : null}
      <p className="tuc-consent-more"><a href="/privacy.html#website">{t.more}</a></p>
      <div className="tuc-consent-btns">
        <button type="button" data-tuc-orbit="off" className="tuc-consent-yes" onClick={() => done({ analytics: true, ads: true })}>{t.all}</button>
        <button type="button" data-tuc-orbit="off" className="tuc-consent-no" onClick={() => done({ analytics: false, ads: false })}>{t.none}</button>
        {detail
          ? <button type="button" data-tuc-orbit="off" className="tuc-consent-no tuc-consent-save" onClick={() => done(sel)}>{t.save}</button>
          : <button type="button" data-tuc-orbit="off" className="tuc-consent-no tuc-consent-choose" onClick={() => setDetail(true)}>{t.choose}</button>}
      </div>
    </div>
  );
}
