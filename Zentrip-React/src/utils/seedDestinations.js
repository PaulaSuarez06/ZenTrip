import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const DESTINATIONS = [
  { name: 'Santorini, Grecia',        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop&auto=format', priceFrom: 320,  currency: '€', season: 'Abr - Oct', category: 'playa',     active: true },
  { name: 'Tokio, Japón',             imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&auto=format', priceFrom: 750,  currency: '€', season: 'Mar - May', category: 'ciudad',    active: true },
  { name: 'Nueva York, EEUU',         imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop&auto=format', priceFrom: 580,  currency: '€', season: 'Todo el año', category: 'ciudad',  active: true },
  { name: 'Bali, Indonesia',          imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&auto=format', priceFrom: 290,  currency: '€', season: 'May - Sep', category: 'naturaleza', active: true },
  { name: 'Lisboa, Portugal',         imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop&auto=format', priceFrom: 180,  currency: '€', season: 'Todo el año', category: 'ciudad',  active: true },
  { name: 'Marrakech, Marruecos',     imageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&h=400&fit=crop&auto=format', priceFrom: 210,  currency: '€', season: 'Mar - May', category: 'cultura',   active: true },
  { name: 'Maldivas',                 imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format', priceFrom: 1200, currency: '€', season: 'Nov - Abr', category: 'playa',     active: true },
  { name: 'París, Francia',           imageUrl: 'https://images.unsplash.com/photo-1499856374851-78884e6e3525?w=600&h=400&fit=crop&auto=format', priceFrom: 250,  currency: '€', season: 'Todo el año', category: 'ciudad',  active: true },
  { name: 'Islandia',                 imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&h=400&fit=crop&auto=format', priceFrom: 490,  currency: '€', season: 'Jun - Ago', category: 'naturaleza', active: true },
  { name: 'Roma, Italia',             imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop&auto=format', priceFrom: 220,  currency: '€', season: 'Mar - Jun', category: 'cultura',   active: true },
  { name: 'Bangkok, Tailandia',       imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop&auto=format', priceFrom: 340,  currency: '€', season: 'Nov - Feb', category: 'ciudad',  active: true },
  { name: 'Dubái, EAU',              imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format', priceFrom: 520,  currency: '€', season: 'Oct - Abr', category: 'ciudad',  active: true },
  { name: 'Praga, Rep. Checa',        imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&h=400&fit=crop&auto=format', priceFrom: 160,  currency: '€', season: 'May - Sep', category: 'ciudad',  active: true },
  { name: 'Costa Rica',               imageUrl: 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=600&h=400&fit=crop&auto=format', priceFrom: 680,  currency: '€', season: 'Dic - Abr', category: 'naturaleza', active: true },
  { name: 'Kioto, Japón',             imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&auto=format', priceFrom: 700,  currency: '€', season: 'Mar - May', category: 'cultura', active: true },
  { name: 'Ámsterdam, Países Bajos',  imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop&auto=format', priceFrom: 230,  currency: '€', season: 'Abr - Sep', category: 'ciudad',  active: true },
  { name: 'Patagonia, Argentina',     imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&auto=format', priceFrom: 890,  currency: '€', season: 'Nov - Mar', category: 'naturaleza', active: true },
  { name: 'Hawái, EEUU',             imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format', priceFrom: 760,  currency: '€', season: 'Abr - Oct', category: 'playa',     active: true },
  { name: 'Barcelona, España',        imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop&auto=format', priceFrom: 190,  currency: '€', season: 'May - Oct', category: 'ciudad',  active: true },
  { name: 'Río de Janeiro, Brasil',   imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=400&fit=crop&auto=format', priceFrom: 620,  currency: '€', season: 'Dic - Mar', category: 'ciudad',  active: true },
];

export async function seedDestinations() {
  const col = collection(db, 'destinations');
  for (const dest of DESTINATIONS) {
    await addDoc(col, dest);
  }
  console.log('✅ 20 destinos añadidos a Firestore');
}
