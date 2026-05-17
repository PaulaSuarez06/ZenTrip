import { useMemo, useRef, useState } from 'react';
import currency from 'currency.js';
import Select from 'react-select';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';
import CityAutocomplete from '../../../../ui/CityAutocomplete';
import TripLegsEditor from '../../../../trips/shared/TripLegsEditor';
import { DIVISAS } from '../../../../../utils/divisas';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'transparent' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px #f97316' : 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#334155',
    '&:hover': { borderColor: '#cbd5e1' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fff7ed' : 'white',
    color: state.isSelected ? 'white' : '#334155',
  }),
  singleValue: (base) => ({ ...base, color: '#334155' }),
};

export function formatCurrency(amount, currencyCode) {
  const divisa = DIVISAS.find((d) => d.code === currencyCode) ?? DIVISAS[0];
  return currency(amount, {
    symbol: divisa.symbol,
    decimal: divisa.decimal,
    separator: divisa.separator,
    precision: divisa.precision ?? 2,
  }).format();
}

const CURRENCY_OPTIONS = DIVISAS.map((d) => ({ value: d.code, label: d.label }));

const labelClass = 'block text-slate-600 mb-1 body-bold';

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function DetailsForm({
  form,
  fieldErrors,
  onChange,
  onNext,
  onCancel,
}) {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 2); return d.toISOString().split('T')[0]; })();
  const minEndDate = form.startDate ? addDays(form.startDate, 1) : today;

  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '' });

  const destStopId = useRef(crypto.randomUUID()).current;
  const stopsForEditor = useMemo(() => {
    if (form.stops?.length > 0) {
      const normDest = (form.destination || '').split(',')[0].trim().toLowerCase();
      const destInStops = normDest && form.stops.some(
        (s) => (s.name || '').split(',')[0].trim().toLowerCase() === normDest
      );
      if (!destInStops && form.destination) {
        // Destination existed before flight-added stops — insert it first in the chain
        const destStop = { id: destStopId, name: form.destination, order: 0, startDate: '', endDate: '' };
        return [destStop, ...form.stops].map((s, i) => ({ ...s, order: i + 1 }));
      }
      return form.stops;
    }
    if (form.destination) return [{ id: destStopId, name: form.destination, order: 1, startDate: '', endDate: '' }];
    return [];
  }, [form.stops, form.destination, destStopId]);

  const handleMultiStopToggle = () => {
    const next = !form.hasMultipleStops;
    onChange({ target: { name: 'hasMultipleStops', type: 'checkbox', checked: next } });
    if (next) {
      const initialStop = { id: crypto.randomUUID(), name: form.destination || '', order: 1, startDate: '', endDate: '' };
      onChange({ target: { name: 'stops', value: [initialStop] } });
    } else {
      const lastStop = form.stops?.[form.stops.length - 1];
      if (lastStop?.name) onChange({ target: { name: 'destination', value: lastStop.name } });
      onChange({ target: { name: 'stops', value: [] } });
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setDateErrors((prev) => ({ ...prev, [name]: '' }));
      return onChange(e);
    }
    if (value > maxDate) {
      setDateErrors((prev) => ({ ...prev, [name]: 'La fecha no puede ser más de 2 años en el futuro' }));
    } else if (name === 'startDate' && value < today) {
      setDateErrors((prev) => ({ ...prev, startDate: 'No puedes seleccionar una fecha anterior a hoy' }));
    } else if (name === 'endDate' && value < minEndDate) {
      setDateErrors((prev) => ({ ...prev, endDate: 'La fecha fin no puede ser anterior a la fecha inicio' }));
    } else {
      setDateErrors((prev) => ({ ...prev, [name]: '' }));
      onChange(e);
      if (name === 'endDate' && form.stops?.length > 0) {
        const updated = form.stops.map((s, i) =>
          i === form.stops.length - 1 && !s.endDate ? { ...s, endDate: value } : s
        );
        if (JSON.stringify(updated) !== JSON.stringify(form.stops)) {
          onChange({ target: { name: 'stops', value: updated } });
        }
      }
    }
  };

  return (
    <form onSubmit={onNext} noValidate>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="title-h3-desktop text-secondary-5 mb-5">Información básica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              variant="light"
              label="Nombre del viaje"
              name="name"
              placeholder="Ej. Roadtrip Costa Oeste"
              value={form.name}
              onChange={onChange}
              error={fieldErrors.name}
              maxLength={50}
              required
            />
            {form.name?.length >= 50 && (
              <p className="mt-1 body-3 text-feedback-error">No puedes poner más de 50 caracteres</p>
            )}
          </div>
          <div />
        </div>

        <div className="mb-4">
          <div className={`flex items-center mb-2 ${form.hasMultipleStops ? 'justify-between' : 'justify-end'}`}>
            {form.hasMultipleStops && <label className={labelClass}>Ruta</label>}
            <div className="flex items-center gap-2">
              <span className="body-3 text-slate-500">¿Varias paradas?</span>
              <button
                type="button"
                role="switch"
                aria-checked={form.hasMultipleStops}
                onClick={handleMultiStopToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-3 focus:ring-offset-1 ${
                  form.hasMultipleStops ? 'bg-secondary-3' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    form.hasMultipleStops ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {form.hasMultipleStops ? (
            <TripLegsEditor
              stops={stopsForEditor}
              origin={form.origin}
              onOriginChange={(value) => onChange({ target: { name: 'origin', value } })}
              onChange={(stops) => {
                onChange({ target: { name: 'stops', value: stops } });
                const first = stops[0];
                const last = stops[stops.length - 1];
                onChange({ target: { name: 'destination', value: last?.name || '' } });
                if (first?.startDate) onChange({ target: { name: 'startDate', value: first.startDate } });
                if (last?.endDate) onChange({ target: { name: 'endDate', value: last.endDate } });
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CityAutocomplete
                label="Origen"
                name="origin"
                placeholder="¿Desde dónde sales?"
                value={form.origin}
                onChange={onChange}
              />
              <CityAutocomplete
                label="Destino"
                name="destination"
                placeholder="¿A dónde vas?"
                value={form.destination}
                onChange={onChange}
              />
              <div>
                <Input
                  variant="light"
                  label="Fecha inicio"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleDateChange}
                  error={fieldErrors.startDate}
                  min={today}
                  max={maxDate}
                />
                {dateErrors.startDate && (
                  <p className="mt-1 body-3 text-feedback-error">{dateErrors.startDate}</p>
                )}
              </div>
              <div>
                <Input
                  variant="light"
                  label="Fecha fin"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleDateChange}
                  error={fieldErrors.endDate}
                  min={minEndDate}
                  max={maxDate}
                  disabled={!form.startDate}
                />
                {dateErrors.endDate && (
                  <p className="mt-1 body-3 text-feedback-error">{dateErrors.endDate}</p>
                )}
              </div>
            </div>
          )}
          {fieldErrors.destination && (
            <p className="mt-1 body-3 text-feedback-error">{fieldErrors.destination}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>
              Divisa <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Select
              inputId="currency"
              options={CURRENCY_OPTIONS}
              value={CURRENCY_OPTIONS.find((o) => o.value === form.currency) ?? null}
              onChange={(option) =>
                onChange({ target: { name: 'currency', value: option?.value ?? '' } })
              }
              styles={selectStyles}
              placeholder="Selecciona divisa..."
              noOptionsMessage={() => 'Sin resultados'}
            />
            {fieldErrors.currency && (
              <p className="mt-1 body-3 text-feedback-error">{fieldErrors.currency}</p>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end sm:self-end sm:pb-1.5">
            <span className="body-3 text-slate-500">¿Viajas solo?</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.soloTravel}
              onClick={() =>
                onChange({ target: { name: 'soloTravel', type: 'checkbox', checked: !form.soloTravel } })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-3 focus:ring-offset-1 ${
                form.soloTravel ? 'bg-secondary-3' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  form.soloTravel ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1 sm:flex-none sm:w-auto! px-4 sm:px-6 py-1.5! sm:py-2! text-xs! sm:text-sm!">
          Cancelar
        </Button>
        <Button variant="orange" type="submit" className="flex-1 sm:flex-none sm:w-auto! px-4 sm:px-6 py-1.5! sm:py-2! text-xs! sm:text-sm!">
          Siguiente
        </Button>
      </div>
    </form>
  );
}
