import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';

const NAV_LINKS = [
  { label: 'Inicio', to: ROUTES.HOME },
  { label: 'Mis viajes', to: ROUTES.TRIPS.LIST },
  { label: 'Planificar viaje', to: ROUTES.TRIPS.CREATE },
  { label: 'Editar perfil', to: ROUTES.PROFILE.EDIT },
];

const LEGAL_LINKS = [
  { label: 'Política de privacidad', to: ROUTES.LEGAL.PRIVACY },
  { label: 'Términos de uso', to: ROUTES.LEGAL.TERMS },
];

const ZEN   = ['Z','e','n'];
const TRIP  = ['T','r','i','p'];

export default function Footer() {
  const [hovered, setHovered] = useState(false);

  return (
    <footer className="px-4 sm:px-6 md:px-16 py-6 sm:py-8 bg-secondary-5 text-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-4 sm:pb-6 border-b border-white/20">

        {/* Logo */}
        <div
          className="col-span-2 sm:col-span-1 flex items-center gap-2 cursor-pointer select-none"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src="/img/logo/Logo-white-png.png"
            alt="ZenTrip"
            className="h-10 sm:h-12 md:h-14 w-auto transition-transform duration-700"
            style={{
              animation: 'footerFloat 3s ease-in-out infinite',
              transform: hovered ? 'rotate(360deg) scale(1.15)' : undefined,
              transition: hovered ? 'transform 0.6s ease' : undefined,
            }}
          />
          <div className="flex flex-col leading-none">
            <p className="font-[Montserrat] text-xs sm:text-sm md:text-base font-bold flex">
              {ZEN.map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    transition: `color 0.2s ease, transform 0.3s ease`,
                    transitionDelay: `${i * 60}ms`,
                    color: hovered ? 'var(--color-secondary-2)' : 'white',
                    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                >
                  {char}
                </span>
              ))}
              {TRIP.map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    transition: `color 0.2s ease, transform 0.3s ease`,
                    transitionDelay: `${(ZEN.length + i) * 60}ms`,
                    color: hovered ? 'var(--color-primary-2)' : 'var(--color-primary-3)',
                    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                >
                  {char}
                </span>
              ))}
            </p>
            <p className="body-3 mt-0.5 sm:mt-1 text-white/70 text-[11px] sm:text-xs md:text-sm">Plan, Pack & Go.</p>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <p className="body-2-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">Navegación</p>
          <ul className="space-y-1.5 sm:space-y-2">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="body-2 text-white/70 hover:text-white transition-colors duration-200 text-xs sm:text-sm md:text-base"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="body-2-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">Legal</p>
          <ul className="space-y-1.5 sm:space-y-2">
            {LEGAL_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="body-2 text-white/70 hover:text-white transition-colors duration-200 text-xs sm:text-sm md:text-base"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-4 sm:pt-5 text-center">
        <p className="body-3 text-white/50 text-xs sm:text-sm">© 2026 ZenTrip · Proyecto TFG — Desarrollo de Aplicaciones Web</p>
      </div>

      <style>{`
        @keyframes footerFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </footer>
  );
}
