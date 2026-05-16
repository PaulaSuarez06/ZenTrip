import { apiClient } from './apiClient';

// Cache: { 'en::Hola mundo': 'Hello world', ... }
const cache = new Map();

function cacheKey(text, target) {
  return `${target}::${text}`;
}

export async function translateTexts(texts, target, source = 'es') {
  if (target === source) return texts;

  const results = new Array(texts.length);
  const toFetch = [];
  const toFetchIdx = [];

  texts.forEach((text, i) => {
    const key = cacheKey(text, target);
    if (cache.has(key)) {
      results[i] = cache.get(key);
    } else {
      toFetch.push(text);
      toFetchIdx.push(i);
    }
  });

  if (toFetch.length > 0) {
    const { translations } = await apiClient.post('/translate', { texts: toFetch, target, source });
    translations.forEach((t, i) => {
      const original = toFetch[i];
      cache.set(cacheKey(original, target), t);
      results[toFetchIdx[i]] = t;
    });
  }

  return results;
}

export async function translateText(text, target, source = 'es') {
  const [result] = await translateTexts([text], target, source);
  return result;
}
