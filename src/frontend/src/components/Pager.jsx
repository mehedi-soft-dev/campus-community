/**
 * Shared pager for every list in the app.
 *
 * Lists used to request a fixed `pageSize: 50` and never ask for page two, so
 * anything past the 50th row was silently unreachable — the API clamps pageSize
 * at 50. Paginating through the API instead means nothing can fall off the end.
 */
export default function Pager({ page, totalPages, onChange, label = 'Pages' }) {
  if (!totalPages || totalPages <= 1) return null;

  // Always the ends, plus one either side of where we are.
  const numbers = [];
  for (let index = 1; index <= totalPages; index += 1) {
    if (index === 1 || index === totalPages || Math.abs(index - page) <= 1) {
      numbers.push(index);
    } else if (numbers[numbers.length - 1] !== '…') {
      numbers.push('…');
    }
  }

  return (
    <nav className="pager" aria-label={label}>
      <button
        type="button"
        className="pager__step"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ← Previous
      </button>

      <span className="pager__pages">
        {numbers.map((number, index) =>
          number === '…' ? (
            <span className="pager__gap" key={`gap-${index}`}>
              …
            </span>
          ) : (
            <button
              key={number}
              type="button"
              className={`pager__page ${number === page ? 'is-current' : ''}`}
              onClick={() => onChange(number)}
              aria-current={number === page ? 'page' : undefined}
            >
              {number}
            </button>
          )
        )}
      </span>

      <button
        type="button"
        className="pager__step"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </nav>
  );
}
