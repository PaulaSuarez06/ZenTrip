export default function PasswordVisibilityToggle({
  isVisible,
  onToggle,
  showLabel = 'Mostrar contraseña',
  hideLabel = 'Ocultar contraseña',
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-neutral-4 hover:text-secondary-5 transition cursor-pointer"
      aria-label={isVisible ? hideLabel : showLabel}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12C3.8 7.8 7.6 5 12 5C16.4 5 20.2 7.8 22 12C20.2 16.2 16.4 19 12 19C7.6 19 3.8 16.2 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        {!isVisible && <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
