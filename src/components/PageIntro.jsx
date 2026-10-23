import StarDivider from './StarDivider.jsx';

export const EYEBROW = { fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#96745A' };
export const H1 = { margin: 0, fontFamily: "'Brygada 1918', 'Brygada 1918 Fallback', 'Brygada 1918 Fallback Android', 'Brygada 1918 Fallback Linux', Georgia, serif", fontWeight: 400, fontSize: 'clamp(40px, 5.4vw, 72px)', lineHeight: 1.06, color: '#1B2B4A' };
export const LEAD = { margin: 0, maxWidth: 560, fontFamily: "'Roxie Rossa', 'Roxie Rossa Fallback', 'Roxie Rossa Fallback Android', 'Roxie Rossa Fallback Linux', 'Brygada 1918', 'Brygada 1918 Fallback', 'Brygada 1918 Fallback Android', 'Brygada 1918 Fallback Linux', Georgia, serif", fontSize: 17, lineHeight: 2, color: '#454B50' };

export function Chapter() {
  return <span style={{ fontFamily: "'Italianno', cursive", fontSize: '1.42em', lineHeight: 0.8, color: '#1B2B4A' }}>chapter</span>;
}

export default function PageIntro({ eyebrow, title, lead, note, center = false }) {
  return (
    <div className="tuc-intro" style={center ? { alignItems: 'center', textAlign: 'center', padding: '60px 0 40px' } : undefined}>
      <span style={EYEBROW}>{eyebrow}</span>
      <h1 style={H1}>{title}</h1>
      {note ? <p className="tuc-draft">{note}</p> : null}
      {lead ? <p style={LEAD}>{lead}</p> : null}
      <StarDivider />
    </div>
  );
}
