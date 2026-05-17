import { Package, Lock, UserCircle } from 'lucide-react';

function LuggageList({ items, accent = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 min-w-0">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${accent ? 'bg-blue-100 text-blue-600' : 'bg-primary-1 text-primary-4'}`}>✓</span>
          <span className="body-3 text-neutral-5 truncate">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function EquipajeTab({ categories, personalCategories, scopeAll }) {
  const hasGroup = categories.length > 0;
  const hasPersonal = scopeAll && personalCategories?.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-neutral-4" />
        <p className="body-bold text-secondary-5">Equipaje</p>
        <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">
          {categories.length + (hasPersonal ? personalCategories.length : 0)} artículos
        </span>
      </div>

      {hasGroup && (
        <div className="flex flex-col gap-3">
          {hasPersonal && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary-3 shrink-0" />
              <p className="body-3 font-semibold text-primary-3">Equipaje grupal · {categories.length} artículos</p>
            </div>
          )}
          <LuggageList items={categories} />
        </div>
      )}

      {hasPersonal && (
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-1">
          <div className="flex items-center gap-1.5">
            <UserCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <p className="body-3 font-semibold text-blue-600">Equipaje personal · {personalCategories.length} artículos</p>
          </div>
          <LuggageList items={personalCategories} accent />
          <p className="body-3 text-neutral-3">Los artículos personales se muestran sin identificar a quién pertenecen.</p>
        </div>
      )}

      <div className="flex items-center gap-2 bg-neutral-1/60 rounded-xl p-3">
        <Lock className="w-4 h-4 text-neutral-3 shrink-0" />
        <p className="body-3 text-neutral-3">La distribución del equipaje entre participantes no está disponible en la vista pública.</p>
      </div>
    </div>
  );
}
