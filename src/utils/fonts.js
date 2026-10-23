// Inserts the metric-matched fallback faces (styles/font-fallbacks.css) right after each brand font in a
// font-family list, e.g. "'Brygada 1918', Georgia" -> "'Brygada 1918', 'Brygada 1918 Fallback', ..., Georgia".
const FALLBACKS = {"Brygada 1918": ["Brygada 1918 Fallback", "Brygada 1918 Fallback Android", "Brygada 1918 Fallback Linux"], "Cinzel Decorative": ["Cinzel Decorative Fallback", "Cinzel Decorative Fallback Android", "Cinzel Decorative Fallback Linux"], "Roxie Rossa": ["Roxie Rossa Fallback", "Roxie Rossa Fallback Android", "Roxie Rossa Fallback Linux"], "Montserrat": ["Montserrat Fallback", "Montserrat Fallback Android", "Montserrat Fallback Linux"]};
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function withFontFallbacks(text) {
  let out = text;
  for (const [family, list] of Object.entries(FALLBACKS)) {
    const re = new RegExp(`'${escape(family)}'(?=\\s*,)(?!\\s*,\\s*'${escape(family)} Fallback)`, 'g');
    out = out.replace(re, [`'${family}'`, ...list.map((n) => `'${n}'`)].join(', '));
  }
  return out;
}
