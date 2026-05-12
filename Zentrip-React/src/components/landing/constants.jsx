import { Calendar, PiggyBank, ThumbsUp, Briefcase, MessageCircle, Navigation, Sparkles, Users, CheckSquare, Plane } from 'lucide-react';

export const FEATURES = [
  { icon: Calendar,       bg: "bg-blue-50",   color: "text-blue-500",   title: "Calendario interactivo",  desc: "Planifica cada día con actividades, horarios y notas. Todo visible de un vistazo." },
  { icon: PiggyBank,      bg: "bg-orange-50", color: "text-orange-500", title: "Control de presupuesto",  desc: "Registra gastos, divide costes automáticamente y haz seguimiento en tiempo real." },
  { icon: ThumbsUp,       bg: "bg-green-50",  color: "text-green-500",  title: "Votaciones en grupo",     desc: "Propón destinos, hoteles o actividades y decide en equipo sin dramas ni WhatsApps eternos." },
  { icon: Briefcase,      bg: "bg-purple-50", color: "text-purple-500", title: "Equipaje colaborativo",   desc: "Crea listas compartidas, evita duplicados y marca lo que ya tienes preparado." },
  { icon: MessageCircle,  bg: "bg-red-50",    color: "text-red-500",    title: "Chat del viaje",          desc: "Un chat exclusivo con moderación inteligente para mantener la conversación organizada." },
  { icon: Navigation,     bg: "bg-sky-50",    color: "text-sky-500",    title: "Rutas y transportes",     desc: "Compara vuelos, trenes, alquiler de coches y calcula rutas combinadas desde la app." },
];

export const STEPS = [
  { icon: Sparkles,    title: "Crea tu viaje",    desc: "Dale un nombre, define fechas, destino y presupuesto inicial en segundos." },
  { icon: Users,       title: "Invita a tu gente", desc: "Añade compañeros por email o enlace. Cada uno accede a su rol." },
  { icon: CheckSquare, title: "Decidid juntos",    desc: "Proponed destinos, alojamientos y actividades. Votad sin dramas." },
  { icon: Plane,       title: "¡A volar!",         desc: "Con el itinerario listo y el equipaje organizado, solo queda disfrutar." },
];

export const TESTIMONIALS = [
  { stars: "★★★★★", quote: "Antes organizábamos el viaje en 4 grupos de WhatsApp. Con ZenTrip lo tenemos todo en un solo lugar.", highlight: "Un antes y un después.", name: "Sara M.", role: "Viajera frecuente · Madrid", img: "https://i.pravatar.cc/80?img=47" },
  { stars: "★★★★★", quote: "La función de votaciones nos salvó de discusiones épicas.", highlight: "En 5 minutos decidimos el destino entre 8 personas.", name: "Carlos R.", role: "Trips en grupo · Barcelona", img: "https://i.pravatar.cc/80?img=11" },
  { stars: "★★★★★", quote: "Viajamos con nuestro perro y los filtros pet-friendly son justo lo que necesitábamos.", highlight: "Nunca más sorpresas en el hotel.", name: "Lucía F.", role: "Viajera con mascota · Valencia", img: "https://i.pravatar.cc/80?img=9" },
];

export const PET_FEATURES = [
  "Hoteles pet-friendly con filtros por peso y especie",
  "Políticas de aerolíneas actualizadas en tiempo real",
  "Cálculo automático del suplemento por mascota",
  "Condiciones específicas: número de animales, restricciones",
];

export const INTEGRATIONS = ["Google Maps", "Booking.com", "Firebase", "Cloudinary", "Open-Meteo"];
