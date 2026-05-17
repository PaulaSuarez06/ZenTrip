import { useState, useEffect, useRef } from 'react';

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];

function TimeInput({ options, value, onChange, placeholder, hasError, max }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { setDraft(value || ''); }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current || !value) return;
    const el = listRef.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ block: 'center' });
  }, [open, value]);

  function handleTyping(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDraft(raw);
  }

  function handleBlur() {
    if (!draft) { onChange(''); return; }
    const num = parseInt(draft, 10);
    const clamped = isNaN(num) ? 0 : Math.min(Math.max(0, num), max);
    const padded = String(clamped).padStart(2, '0');
    setDraft(padded);
    onChange(padded);
  }

  function handleSelect(opt) {
    setDraft(opt);
    onChange(opt);
    setOpen(false);
  }

  const borderClass = open
    ? 'border-primary-3 ring-2 ring-primary-3/20'
    : hasError ? 'border-feedback-error' : 'border-neutral-2 hover:border-primary-3';

  return (
    <div ref={ref} className="relative flex-1">
      <div className={`flex items-center border rounded-xl transition-colors bg-white ${borderClass}`}>
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={handleTyping}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 min-w-0 pl-3 py-2.5 body-3 font-semibold text-secondary-5 bg-transparent focus:outline-none placeholder:text-neutral-3 w-0"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
          className="pr-2.5 pl-1 text-neutral-3 hover:text-primary-3 transition-colors shrink-0"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white border border-neutral-2 rounded-xl shadow-lg overflow-hidden">
          <div ref={listRef} className="max-h-44 overflow-y-auto py-1 scrollbar-hide">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                data-selected={opt === value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                className={`w-full text-left px-3 py-2 body-3 font-semibold transition-colors ${
                  opt === value ? 'bg-primary-1 text-primary-3' : 'text-secondary-5 hover:bg-neutral-1'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimeSelect({ value, onChange, hasError }) {
  const [h, m] = value ? value.split(':') : ['', ''];

  function handleChange(newH, newM) {
    if (!newH && !newM) { onChange(''); return; }
    onChange(`${newH || '00'}:${newM || '00'}`);
  }

  return (
    <div className="flex items-center gap-2">
      <TimeInput options={HOURS}   value={h} onChange={(v) => handleChange(v, m)} placeholder="HH" hasError={hasError} max={23} />
      <span className="body-2 font-bold text-neutral-3 shrink-0">:</span>
      <TimeInput options={MINUTES} value={m} onChange={(v) => handleChange(h, v)} placeholder="MM" hasError={hasError} max={59} />
    </div>
  );
}
