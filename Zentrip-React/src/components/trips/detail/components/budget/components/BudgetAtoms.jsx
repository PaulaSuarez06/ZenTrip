import {
  BedDouble, Plane, UtensilsCrossed, Sparkles, Package,
  ShoppingCart, ShoppingBag, Heart, Tag,
} from 'lucide-react';
import { CATEGORIES } from '../AddExpenseModal';
import { DIVISAS } from '../../../../../../utils/divisas';

export const CATEGORY_META = {
  alojamiento:   { Icon: BedDouble,       bar: 'bg-secondary-3',       badge: 'bg-secondary-1 text-secondary-5 border-secondary-2'                    },
  transporte:    { Icon: Plane,           bar: 'bg-primary-3',         badge: 'bg-primary-1 text-primary-4 border-primary-2'                          },
  comida:        { Icon: UtensilsCrossed, bar: 'bg-auxiliary-green-4', badge: 'bg-auxiliary-green-2 text-auxiliary-green-5 border-auxiliary-green-3'   },
  actividades:   { Icon: Sparkles,        bar: 'bg-violet-400',        badge: 'bg-violet-50 text-violet-600 border-violet-200'                        },
  supermercado:  { Icon: ShoppingCart,    bar: 'bg-emerald-400',       badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'                     },
  compras:       { Icon: ShoppingBag,     bar: 'bg-pink-400',          badge: 'bg-pink-50 text-pink-600 border-pink-200'                              },
  salud:         { Icon: Heart,           bar: 'bg-red-400',           badge: 'bg-red-50 text-red-600 border-red-200'                                 },
  otros:         { Icon: Package,         bar: 'bg-neutral-3',         badge: 'bg-neutral-1 text-neutral-5 border-neutral-2'                          },
  personalizada: { Icon: Tag,             bar: 'bg-amber-400',         badge: 'bg-amber-50 text-amber-700 border-amber-200'                           },
};

export function getCatMeta(key) {
  return CATEGORY_META[key] ?? CATEGORY_META.otros;
}

export function getCatLabel(exp) {
  if (exp.category === 'personalizada' && exp.categoryLabel) return exp.categoryLabel;
  return CATEGORIES.find((c) => c.key === exp.category)?.label ?? exp.category;
}

export function fmt(amount, currency = 'EUR') {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency', currency: currency || 'EUR',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    const sym = DIVISAS.find((d) => d.code === currency)?.symbol ?? currency;
    return `${(amount ?? 0).toFixed(2)} ${sym}`;
  }
}

export function fmtDateLabel(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
    const d   = new Date(dateStr + 'T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const diff = Math.round((now - d) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch { return dateStr; }
}

export function Avatar({ member, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  if (member?.avatar) {
    return <img src={member.avatar} alt={member?.name} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  const color    = member?.avatarColor ?? '#FE6B01';
  const initials = (member?.name ?? '?').slice(0, 1).toUpperCase();
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export function ProgressBar({ value, max, colorClass = 'bg-primary-3', warn = false }) {
  const pct      = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = warn ? 'bg-feedback-error' : colorClass;
  return (
    <div className="w-full h-2 bg-neutral-1 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="body-3 text-neutral-4 shrink-0">{label}</span>
      {children}
    </div>
  );
}
