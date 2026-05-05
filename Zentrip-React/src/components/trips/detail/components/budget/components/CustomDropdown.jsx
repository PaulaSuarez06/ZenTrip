import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({
  value,
  options = [],
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 rounded-2xl bg-white border-0 ring-1 ring-inset ring-neutral-2 shadow-sm px-4 py-2.5 body-3 font-medium text-neutral-6 hover:ring-primary-3 focus:outline-none focus:ring-2 focus:ring-primary-3 transition-colors ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selected?.label ?? placeholder}</span>
        <ChevronDown className="w-4 h-4 shrink-0 text-neutral-4" />
      </button>

      {open && (
        <div className={`absolute left-0 top-full mt-2 z-50 min-w-full max-h-64 overflow-y-auto rounded-2xl border border-neutral-2 bg-white shadow-xl ${menuClassName}`} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 body-3 transition-colors ${isSelected ? 'bg-primary-3 text-white' : 'text-neutral-6 hover:bg-primary-1 hover:text-primary-3'} ${optionClassName}`}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}