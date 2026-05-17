import { MapPin, Plane, Hotel, Car, Compass, Utensils } from 'lucide-react';

export const TYPE_CONFIG = {
  actividad:   { label: 'Actividad',   Icon: Compass,  badgeClass: 'bg-violet-50 text-violet-600',   dotClass: 'bg-violet-400' },
  vuelo:       { label: 'Vuelo',       Icon: Plane,    badgeClass: 'bg-blue-50 text-blue-700',       dotClass: 'bg-blue-400' },
  hotel:       { label: 'Hotel',       Icon: Hotel,    badgeClass: 'bg-teal-50 text-teal-700',       dotClass: 'bg-teal-400' },
  restaurante: { label: 'Restaurante', Icon: Utensils, badgeClass: 'bg-orange-50 text-orange-700',  dotClass: 'bg-orange-400' },
  restaurant:  { label: 'Restaurante', Icon: Utensils, badgeClass: 'bg-orange-50 text-orange-700',  dotClass: 'bg-orange-400' },
  coche:       { label: 'Coche',       Icon: Car,      badgeClass: 'bg-amber-50 text-amber-600',    dotClass: 'bg-amber-400' },
  car:         { label: 'Coche',       Icon: Car,      badgeClass: 'bg-amber-50 text-amber-600',    dotClass: 'bg-amber-400' },
  tren:        { label: 'Tren',        Icon: MapPin,   badgeClass: 'bg-indigo-50 text-indigo-600',  dotClass: 'bg-indigo-400' },
  ruta:        { label: 'Ruta',        Icon: MapPin,   badgeClass: 'bg-emerald-50 text-emerald-600', dotClass: 'bg-emerald-400' },
};
