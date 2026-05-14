const PALETTE = [
  '#E05C5C', '#D97C3A', '#C8A515', '#47A96A', '#3C9EAE',
  '#4C7FE0', '#7B5CE0', '#C05CE0', '#E05CA0', '#1BA37E',
];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getUserColor(uid) {
  if (!uid) return PALETTE[0];
  return PALETTE[hashCode(uid) % PALETTE.length];
}