import { useState, useMemo, useRef, useEffect } from 'react';
import { Wallet, Lock, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { EXPENSE_CATS } from '../utils/postHelpers';

// --- Local helpers ---

function fmtMoney(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDayShort(dateStr, locale = 'es') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dt);
  return `${day.charAt(0).toUpperCase() + day.slice(1, 3)} ${d}`;
}

function fmtDayFull(dateStr, locale = 'es') {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

function CategoryBar({ cat, amount, total, currency }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.color}`} />
      <span className="body-3 text-neutral-5 w-24 truncate shrink-0">{cat.label}</span>
      <div className="flex-1 h-2 bg-neutral-1 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="body-3 text-neutral-4 w-8 text-right shrink-0">{pct}%</span>
      <span className="body-3 font-semibold text-neutral-5 w-24 text-right shrink-0">
        {fmtMoney(amount)} <span className="font-normal text-neutral-3">{currency || ''}</span>
      </span>
    </div>
  );
}

function DaySelect({ days, selected, onSelect, fmtDayFull: fmtDayFullProp, currency }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedData = days.find((d) => d.date === selected);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
          open ? 'border-primary-3 ring-2 ring-primary-3/20' : 'border-neutral-2 hover:border-neutral-3'
        } bg-white`}
      >
        {selectedData ? (
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <span className="body-3 font-semibold text-secondary-5 truncate">{fmtDayFullProp(selectedData.date)}</span>
            <span className="body-3 font-semibold text-primary-3 shrink-0">{fmtMoney(selectedData.total)} {currency}</span>
          </div>
        ) : (
          <span className="body-3 text-neutral-3 flex-1">Selecciona un día...</span>
        )}
        <ChevronDown className={`w-4 h-4 shrink-0 text-neutral-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-2 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {days.map(({ date, total }) => (
            <button
              key={date}
              type="button"
              onClick={() => { onSelect(date); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 transition-colors ${
                selected === date ? 'bg-primary-1' : 'hover:bg-neutral-1'
              }`}
            >
              <span className={`body-3 font-semibold ${selected === date ? 'text-primary-4' : 'text-secondary-5'}`}>
                {fmtDayFullProp(date)}
              </span>
              <span className={`body-3 font-semibold shrink-0 ${selected === date ? 'text-primary-3' : 'text-neutral-4'}`}>
                {fmtMoney(total)} {currency}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PresupuestoTab({ post, perDay }) {
  const { language } = useLanguage();
  const [view, setView] = useState('resumen');
  const [selectedDay, setSelectedDay] = useState(null);

  const summary = post.expenseSummary;
  const displayTotal = summary?.totalSpent > 0 ? summary.totalSpent : post.totalBudget;
  const currency = post.budgetCurrency || '';
  const participantCount = post.participantCount || 1;
  const days = post.days || 1;

  const activeCats = useMemo(() => {
    if (!summary?.categoryTotals) return [];
    return EXPENSE_CATS
      .map((c) => ({ ...c, amount: summary.categoryTotals[c.key] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const sortedDays = useMemo(() => {
    if (!summary?.dailyTotals) return [];
    return Object.entries(summary.dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  }, [summary]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay || !summary?.dailyTotals) return null;
    return summary.dailyTotals[selectedDay] || null;
  }, [selectedDay, summary]);

  const selectedDayCats = useMemo(() => {
    if (!selectedDayData?.categories) return [];
    return EXPENSE_CATS
      .map((c) => ({ ...c, amount: selectedDayData.categories[c.key] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [selectedDayData]);

  function fmtDay(dateStr) { return fmtDayShort(dateStr, language); }
  function fmtDayFullLocal(dateStr) { return fmtDayFull(dateStr, language); }

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen de cifras */}
      <div className="bg-white rounded-2xl border border-neutral-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-neutral-4" />
            <p className="body-bold text-secondary-5">Presupuesto del viaje</p>
            {summary && <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">Gastos reales</span>}
          </div>
          {summary && (
            <div className="flex rounded-full border border-neutral-1 overflow-hidden">
              {['resumen', 'por-dia'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1 body-3 font-semibold transition-colors ${view === v ? 'bg-secondary-5 text-white' : 'text-neutral-4 hover:bg-neutral-1'}`}
                >
                  {v === 'resumen' ? 'Resumen' : 'Por día'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-28 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="body-3 text-green-700 font-semibold mb-0.5">Total del viaje</p>
            <p className="title-h2-desktop text-green-800 leading-tight">
              {fmtMoney(displayTotal)}
              {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
            </p>
          </div>
          {days > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-primary-1 border border-primary-2 rounded-xl px-4 py-3">
              <p className="body-3 text-primary-4 font-semibold mb-0.5">Por día</p>
              <p className="title-h2-desktop text-primary-5 leading-tight">
                {fmtMoney(displayTotal / days)}
                {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
              </p>
            </div>
          )}
          {participantCount > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="body-3 text-orange-700 font-semibold mb-0.5">Por persona</p>
              <p className="title-h2-desktop text-orange-800 leading-tight">
                {fmtMoney(displayTotal / participantCount)}
                {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
              </p>
            </div>
          )}
        </div>

        {/* Resumen general */}
        {view === 'resumen' && activeCats.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-4 border-t border-neutral-1">
            <p className="body-3 font-semibold text-neutral-5 mb-1">Desglose por categoría</p>
            {activeCats.map((cat) => (
              <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={summary.totalSpent} currency={currency} />
            ))}
          </div>
        )}

        {/* Por día */}
        {view === 'por-dia' && sortedDays.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-neutral-1">
            <div className="grid grid-cols-3 gap-3">
              <DaySelect
                days={sortedDays}
                selected={selectedDay}
                onSelect={setSelectedDay}
                fmtDayFull={fmtDayFullLocal}
                currency={currency}
              />
            </div>

            {selectedDay && selectedDayData && (
              <div className="bg-neutral-1/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="body-3 font-semibold text-secondary-5">{fmtDayFullLocal(selectedDay)}</p>
                  <p className="body-bold text-primary-3">{fmtMoney(selectedDayData.total)} {currency}</p>
                </div>
                {participantCount > 1 && (
                  <p className="body-3 text-neutral-4">≈ {fmtMoney(selectedDayData.total / participantCount)} {currency} por persona</p>
                )}
                {selectedDayCats.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-2">
                    {selectedDayCats.map((cat) => (
                      <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={selectedDayData.total} currency={currency} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-1 p-4 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-neutral-3 mt-0.5 shrink-0" />
        <p className="body-3 text-neutral-4">Los gastos individuales, comprobantes de pago y deudas entre participantes no están disponibles en la vista pública.</p>
      </div>
    </div>
  );
}
