const SIZE_STYLES = {
  light: {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      label: 'text-xs',
      error: 'text-[11px]'
    },
    md: {
      input: 'px-4 py-2 text-base',
      label: 'text-sm',
      error: 'text-xs'
    },
    lg: {
      input: 'px-5 py-3 text-lg',
      label: 'text-base',
      error: 'text-sm'
    }
  },
  dark: {
    sm: {
      input: 'px-3 py-2 text-xs',
      label: 'text-[11px]',
      error: 'text-[11px]'
    },
    md: {
      input: 'px-4 py-3 text-sm',
      label: 'text-xs',
      error: 'text-xs'
    },
    lg: {
      input: 'px-5 py-3.5 text-base',
      label: 'text-sm',
      error: 'text-sm'
    }
  }
};

const Input = ({ label, error, variant = 'dark', size = 'md', focusOrange = false, className = '', ...props }) => {
  const currentVariant = variant === 'light' ? 'light' : 'dark';
  const currentSize = SIZE_STYLES[currentVariant][size] ? size : 'md';
  const sizeStyles = SIZE_STYLES[currentVariant][currentSize];

  const focusClass = focusOrange
    ? 'focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/30'
    : 'focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/30';

  const inputClass = variant === 'light'
    ? `w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${sizeStyles.input} ${className}`
    : `mt-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 outline-none transition ${focusClass} ${sizeStyles.input} ${className}`;

  const labelClass = variant === 'light'
    ? `block font-medium text-slate-600 mb-1 ${sizeStyles.label}`
    : `text-white/70 ${sizeStyles.label}`;

  const errorSizeClass = sizeStyles.error;

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <input className={inputClass} {...props} />
      {error && (
        <p className={`mt-1 ${errorSizeClass} ${variant === 'light' ? 'text-red-600' : 'text-red-400'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
