const SIZE_STYLES = {
  sm: {
    input: 'px-3 py-1.5',
    label: 'cuerpo-3',
    error: 'cuerpo-3',
    inputText: 'cuerpo-3',
  },
  md: {
    input: 'px-4 py-2',
    label: 'cuerpo-2',
    error: 'cuerpo-3',
    inputText: 'cuerpo-2',
  },
  lg: {
    input: 'px-5 py-3',
    label: 'cuerpo',
    error: 'cuerpo-2',
    inputText: 'cuerpo',
  },
};

const Input = ({ label, error, variant = 'dark', size = 'md', focusOrange = false, className = '', ...props }) => {
  const s = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  const focusClass = focusOrange
    ? 'focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/30'
    : 'focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/30';

  const inputClass = variant === 'light'
    ? `w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${s.input} ${s.inputText} ${className}`
    : `mt-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 outline-none transition ${focusClass} ${s.input} ${s.inputText} ${className}`;

  const labelClass = variant === 'light'
    ? `block font-medium text-slate-600 mb-1 ${s.label}`
    : `text-white/70 ${s.label}`;

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <input className={inputClass} {...props} />
      {error && (
        <p className={`mt-1 ${s.error} ${variant === 'light' ? 'text-red-600' : 'text-red-400'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;