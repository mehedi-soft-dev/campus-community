export default function Loading({ label = 'Loading…', rows = 3 }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="loading__label">{label}</span>

      {rows > 0 && (
        <span className="loading__skeleton" aria-hidden="true">
          {Array.from({ length: rows }, (_, index) => (
            <span
              key={index}
              className="skeleton-line"
              style={{ width: `${[92, 74, 58][index % 3]}%` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
