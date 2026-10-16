
export default function Stars({ value = 0, count }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {'★'.repeat(full)}
      <span className="stars__empty">{'★'.repeat(5 - full)}</span>
      {count !== undefined && <small> ({count})</small>}
    </span>
  );
}
