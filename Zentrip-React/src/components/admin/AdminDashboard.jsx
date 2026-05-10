import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

const ADMIN_SECTIONS = [
  {
    key: 'readings',
    emoji: '✍️',
    title: 'Lecturas',
    description: 'Crea, edita y gestiona los artículos que aparecen en el home',
    route: ROUTES.ADMIN.READINGS,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOME)}
        className="flex items-center gap-1 text-neutral-4 hover:text-secondary-5 body-3 mb-8 cursor-pointer transition-colors"
      >
        ← Volver al inicio
      </button>

      <div className="mb-10">
        <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">Administración</p>
        <h1 className="title-h2-desktop text-secondary-5">Panel de administrador</h1>
        <p className="body-2 text-neutral-4 mt-1">Gestiona el contenido de ZenTrip</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => navigate(section.route)}
            className="bg-white border border-neutral-1 rounded-2xl p-6 text-left hover:border-primary-3 hover:shadow-md transition-all cursor-pointer group"
          >
            <span className="text-3xl mb-4 block">{section.emoji}</span>
            <p className="body-bold text-secondary-5 group-hover:text-primary-3 transition-colors mb-1">
              {section.title}
            </p>
            <p className="body-3 text-neutral-4">{section.description}</p>
            <p className="body-3 text-primary-3 font-semibold mt-4">Gestionar →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
