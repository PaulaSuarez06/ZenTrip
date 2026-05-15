import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translateTexts } from '../../services/translationService';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT']);
const SKIP_PATTERN = /^[\d\s.,:/+%€$£¥°ºª·•→←↑↓✓✗×!?#@&()[\]{}"'`~_^-]+$|^.$/;

function collectTextNodes(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (el.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      if (el.isContentEditable) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text || text.length < 2 || SKIP_PATTERN.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  return nodes;
}

function applyCache(nodes, langCache) {
  nodes.forEach((n) => {
    const text = n.textContent.trim();
    if (langCache[text]) n.textContent = n.textContent.replace(text, langCache[text]);
  });
}

function collectPlaceholders(container) {
  return [...container.querySelectorAll('input[placeholder], textarea[placeholder]')]
    .filter((el) => !el.closest('[data-no-translate]'));
}

function applyPlaceholderCache(els, langCache, lang) {
  els.forEach((el) => {
    if (lang === 'es') {
      const original = el.getAttribute('data-orig-ph');
      if (original) el.setAttribute('placeholder', original);
      return;
    }
    if (!el.hasAttribute('data-orig-ph')) {
      el.setAttribute('data-orig-ph', el.getAttribute('placeholder'));
    }
    const original = el.getAttribute('data-orig-ph');
    if (original && langCache[original]) {
      el.setAttribute('placeholder', langCache[original]);
    }
  });
}

export default function TranslationApplier({ children }) {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const containerRef = useRef(null);
  const cacheRef = useRef({});
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const langRef = useRef(language);
  langRef.current = language;

  const observerRef = useRef(null);

  const scheduleTranslation = useRef((immediate = false) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const lang = langRef.current;
      if (!containerRef.current) return;

      const langCache = cacheRef.current[lang] || {};
      const nodes = collectTextNodes(containerRef.current);
      const phEls  = collectPlaceholders(containerRef.current);

      // Aplicar caché existente inmediatamente (texto + placeholders)
      applyCache(nodes, langCache);
      applyPlaceholderCache(phEls, langCache, lang);

      if (lang === 'es') return;

      const nodeTexts = nodes.map((n) => n.textContent.trim()).filter((t) => t.length > 1 && !langCache[t] && !SKIP_PATTERN.test(t));
      const phTexts   = phEls.map((el) => el.getAttribute('data-orig-ph') || el.getAttribute('placeholder')).filter((t) => t && t.length > 1 && !langCache[t] && !SKIP_PATTERN.test(t));
      const toFetch   = [...new Set([...nodeTexts, ...phTexts])];

      if (toFetch.length === 0) return;

      // Cancelar petición anterior
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      translateTexts(toFetch, lang)
        .then((translations) => {
          if (signal.aborted) return;
          if (!cacheRef.current[lang]) cacheRef.current[lang] = {};
          toFetch.forEach((text, i) => {
            if (translations[i]) cacheRef.current[lang][text] = translations[i];
          });
          // Pausar observer para que las mutaciones del DOM no se retraducen
          observerRef.current?.disconnect();
          const fresh   = collectTextNodes(containerRef.current);
          const freshPh = collectPlaceholders(containerRef.current);
          applyCache(fresh, cacheRef.current[lang]);
          applyPlaceholderCache(freshPh, cacheRef.current[lang], lang);
          // Reconectar observer
          if (containerRef.current) {
            observerRef.current?.observe(containerRef.current, { childList: true, subtree: true });
          }
        })
        .catch(() => {});
    }, immediate ? 0 : 120);
  }).current;

  // Cambio de idioma o ruta → traducir
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    scheduleTranslation(true);
  }, [language, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // MutationObserver con debounce: nuevo contenido dinámico
  useEffect(() => {
    if (language === 'es' || !containerRef.current) return;
    const observer = new MutationObserver(() => scheduleTranslation(false));
    observer.observe(containerRef.current, { childList: true, subtree: true });
    observerRef.current = observer;
    return () => { observer.disconnect(); observerRef.current = null; };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ display: 'contents' }}>{children}</div>;
}
