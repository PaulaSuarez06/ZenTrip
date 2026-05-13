import { useState } from 'react';
import { Search, MapPin, Calendar, BedDouble, Users, Baby } from 'lucide-react';
import { SectionLabel } from './HotelAtoms';

function FieldError({ msg }) {
  return <p className="body-3 text-red-500 mt-1">{msg}</p>;
}

function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 body-3 font-bold text-neutral-5 uppercase tracking-wider mb-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min = 1 }) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3 border border-neutral-2 rounded-lg body-2 text-neutral-7 bg-white outline-none focus:border-secondary-3 focus:ring-2 focus:ring-secondary-3/20 transition"
    />
  );
}

export default function HotelSearchForm({
  dest, onDestChange,
  checkIn, onCheckInChange,
  checkOut, onCheckOutChange,
  rooms, onRoomsChange,
  adults, onAdultsChange,
  children, onChildrenChange,
  loading, canSearch,
  onSearch,
}) {
  const [attempted, setAttempted] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 2); return d.toISOString().split('T')[0]; })();

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut + 'T00:00:00') - new Date(checkIn + 'T00:00:00')) / 86400000)
    : null;
  const sameDayError = attempted && checkIn && checkOut && nights !== null && nights <= 0;

  const handleSearch = () => {
    setAttempted(true);
    if (!canSearch) return;
    onSearch();
  };

  return (
    <div className="bg-white border border-neutral-1 rounded-2xl p-4 sm:p-6 shadow-sm">
      <SectionLabel>Buscar alojamiento</SectionLabel>

      {/* Destino */}
      <div className="mb-4">
        <FormField label="Destino" icon={MapPin}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-3 pointer-events-none" />
            <input
              type="text"
              value={dest}
              onChange={(e) => onDestChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ciudad, hotel o zona…"
              className={`w-full h-12 pl-9 pr-3 border-2 rounded-lg body-2 text-neutral-7 bg-white outline-none focus:border-primary-3 focus:ring-2 focus:ring-primary-3/10 transition placeholder:text-neutral-3 ${attempted && !dest.trim() ? 'border-red-400' : 'border-neutral-2'}`}
            />
          </div>
          {attempted && !dest.trim() && <FieldError msg="Introduce un destino" />}
        </FormField>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <FormField label="Entrada" icon={Calendar}>
          <input
            type="date"
            value={checkIn}
            min={today}
            max={maxDate}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full h-10 px-3 border border-neutral-2 rounded-lg body-2 text-neutral-7 bg-white outline-none focus:border-secondary-3 focus:ring-2 focus:ring-secondary-3/20 transition"
          />
          {attempted && !checkIn && <FieldError msg="Selecciona la fecha de entrada" />}
        </FormField>
        <FormField label="Salida" icon={Calendar}>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            max={maxDate}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full h-10 px-3 border border-neutral-2 rounded-lg body-2 text-neutral-7 bg-white outline-none focus:border-secondary-3 focus:ring-2 focus:ring-secondary-3/20 transition"
          />
          {attempted && !checkOut && <FieldError msg="Selecciona la fecha de salida" />}
          {sameDayError && <FieldError msg="La salida debe ser al menos un día después de la entrada" />}
        </FormField>
      </div>

      {/* Ocupación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <FormField label="Habitaciones" icon={BedDouble}>
          <NumberInput value={rooms} onChange={(e) => onRoomsChange(Math.max(1, Number(e.target.value)))} />
        </FormField>
        <FormField label="Adultos" icon={Users}>
          <NumberInput value={adults} onChange={(e) => onAdultsChange(Math.max(1, Number(e.target.value)))} />
        </FormField>
        <FormField label="Niños" icon={Baby}>
          <NumberInput min={0} value={children} onChange={(e) => onChildrenChange(Math.max(0, Number(e.target.value)))} />
        </FormField>
      </div>

      <div className="border-t border-neutral-1 mb-6" />

      <button
        onClick={handleSearch}
        disabled={loading}
        className={`w-full h-12 rounded-lg font-titles font-bold text-white flex items-center justify-center gap-2 transition ${
          canSearch && !loading ? 'bg-primary-3 hover:bg-primary-4' : 'bg-neutral-2 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Buscando…
          </>
        ) : (
          <><Search className="w-4 h-4" /> Buscar hoteles</>
        )}
      </button>
    </div>
  );
}
