import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';

export default function GuestBanner({ postId }) {
  const redirect = postId ? `?redirect=/p/${postId}` : '';
  return (
    <div className="bg-secondary-5 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="flex-1">
        <p className="body-bold text-white mb-1">¿Te inspira este viaje?</p>
        <p className="body-3 text-white/70">Únete a ZenTrip gratis y planifica tu propio viaje, guarda itinerarios y conecta con otros viajeros.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link to={`${ROUTES.AUTH.REGISTER}${redirect}`} className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">
          Crear cuenta gratis
        </Link>
        <Link to={`${ROUTES.AUTH.LOGIN}${redirect}`} className="bg-white/10 hover:bg-white/20 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
