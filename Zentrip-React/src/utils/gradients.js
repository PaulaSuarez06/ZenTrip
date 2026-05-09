const GRADIENTS = [
  'from-sky-300 to-blue-500',
  'from-orange-300 to-rose-500',
  'from-teal-300 to-emerald-500',
  'from-violet-400 to-indigo-600',
  'from-amber-300 to-orange-500',
  'from-cyan-300 to-teal-500',
];

export function getGradient(str) {
  const hash = [...(str || 'ZenTrip')].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export default GRADIENTS;
