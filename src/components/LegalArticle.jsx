export default function LegalArticle({ sections }) {
  return (
    <article className="tuc-sheet tuc-legal">
      {sections.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.h}</h2>
          {s.ps.map((p, i) =>
            Array.isArray(p) ? (
              <p key={i}>{p.map((line, j) => (<span key={j}>{line}{j < p.length - 1 ? <br /> : null}</span>))}</p>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </section>
      ))}
    </article>
  );
}
