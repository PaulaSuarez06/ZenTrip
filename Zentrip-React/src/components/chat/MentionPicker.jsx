export default function MentionPicker({ query, members, onSelect, compact = false }) {
  const allOptions = [{ uid: 'todos', displayName: 'todos' }, ...members];
  const lower = (query ?? '').toLowerCase();
  const filtered = lower
    ? allOptions.filter((m) => m.displayName.toLowerCase().includes(lower))
    : allOptions;

  if (!filtered.length) return null;

  return (
    <div
      className={`bg-white border border-neutral-2 rounded-xl shadow-lg overflow-hidden overflow-y-auto ${
        compact ? 'max-h-36' : 'max-h-52'
      }`}
    >
      {filtered.map((member) => (
        <button
          key={member.uid}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(member); }}
          className={`w-full text-left flex items-center gap-2 ${
            compact ? 'px-3 py-1.5' : 'px-4 py-2.5'
          } hover:bg-neutral-1 transition-colors`}
        >
          <span className="text-primary-3 font-bold text-sm shrink-0">@</span>
          {member.uid === 'todos' ? (
            <span className={`${compact ? 'text-sm' : 'body-3'}`}>
              <span className="font-semibold text-neutral-7">todos</span>
              <span className="text-neutral-3 ml-1.5">Mencionar a todos</span>
            </span>
          ) : (
            <span className={`${compact ? 'text-sm' : 'body-3'} text-neutral-7`}>{member.displayName}</span>
          )}
        </button>
      ))}
    </div>
  );
}