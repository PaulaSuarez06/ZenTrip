import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CityAutocomplete from '../ui/CityAutocomplete';
import {
  getAllInspirations,
  createInspiration,
  updateInspiration,
  deleteInspiration,
} from '../../services/inspirationsService';
import { uploadImage, validateImageFile } from '../../services/cloudinaryService';
import { ROUTES } from '../../config/routes';

const CATEGORIES = {
  ROADTRIP:    { emoji: '🚗', subcategories: ['Ruta clásica', 'Road trip en moto', 'Furgoneta / van', 'Ruta histórica'] },
  ISLAS:       { emoji: '🏝️', subcategories: ['Mediterráneo', 'Caribe', 'Asia-Pacífico', 'Atlántico'] },
  PLAYA:       { emoji: '🏖️', subcategories: ['Caribe', 'Mediterráneo', 'Surf', 'Playa virgen'] },
  MONTAÑA:     { emoji: '⛰️', subcategories: ['Senderismo', 'Esquí', 'Alta montaña', 'Ruta panorámica'] },
  AVENTURA:    { emoji: '🧗', subcategories: ['Deportes extremos', 'Safari', 'Buceo', 'Escalada'] },
  CIUDAD:      { emoji: '🏙️', subcategories: ['Fin de semana', 'Capital europea', 'Ciudad asiática', 'Arquitectura'] },
  CULTURAL:    { emoji: '🏛️', subcategories: ['Historia antigua', 'Arte y museos', 'Patrimonio UNESCO', 'Tradiciones'] },
  GASTRONOMÍA: { emoji: '🍽️', subcategories: ['Alta cocina', 'Street food', 'Enoturismo', 'Mercados locales'] },
  INVIERNO:    { emoji: '❄️', subcategories: ['Nieve y esquí', 'Mercados navideños', 'Aurora boreal', 'Fiordos'] },
  NATURALEZA:  { emoji: '🌿', subcategories: ['Parques nacionales', 'Fauna salvaje', 'Selva tropical', 'Desierto'] },
  ROMÁNTICO:   { emoji: '💑', subcategories: ['Luna de miel', 'Aniversario', 'Escapada en pareja', 'Spa y relax'] },
  FAMILIA:     { emoji: '👨‍👩‍👧', subcategories: ['Con bebés', 'Niños pequeños', 'Adolescentes', 'Parques temáticos'] },
  MOCHILERO:   { emoji: '🎒', subcategories: ['Europa low-cost', 'Asia mochilero', 'Sudamérica', 'Interrail'] },
  LUJO:        { emoji: '✨', subcategories: ['Resort 5 estrellas', 'Crucero de lujo', 'Safari premium', 'Experiencias exclusivas'] },
  FESTIVAL:    { emoji: '🎉', subcategories: ['Música', 'Cultura y arte', 'Carnaval', 'Tradiciones locales'] },
};

function calcReadingTime(body) {
  const text = (body ?? [])
    .flatMap(s => s.paragraphs ?? [])
    .map(p => p.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' '))
    .join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const EMPTY_FORM = {
  category: 'ROADTRIP',
  subcategory: '',
  emoji: '🚗',
  title: '',
  summary: '',
  image: '',
  destination: '',
  active: true,
  body: [{ heading: '', paragraphs: [''] }],
};

function cloneForm(article) {
  const cat = article.category ?? 'ROADTRIP';
  return {
    category: cat,
    subcategory: article.subcategory ?? '',
    emoji: article.emoji ?? CATEGORIES[cat]?.emoji ?? '',
    title: article.title ?? '',
    summary: article.summary ?? '',
    image: article.image ?? '',
    readingTime: article.readingTime ?? 5,
    destination: article.destination ?? '',
    active: article.active ?? true,
    body: article.body?.length > 0
      ? article.body.map(s => ({ heading: s.heading ?? '', paragraphs: [(s.paragraphs ?? ['']).join('')] }))
      : [{ heading: '', paragraphs: [''] }],
  };
}

/* ── Rich text editor ─────────────────────────────────────────── */
function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current && ref.current) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, value = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, value);
    onChange(ref.current.innerHTML);
  };

  const ToolBtn = ({ cmd, htmlValue, label }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        exec(htmlValue ? 'insertHTML' : cmd, htmlValue ?? null);
      }}
      className="px-2 py-1 rounded body-3 hover:bg-neutral-2 text-secondary-5 transition-colors cursor-pointer select-none"
    >
      {label}
    </button>
  );

  return (
    <div className="border border-neutral-2 rounded-lg overflow-hidden">
      <div className="flex gap-0.5 px-2 py-1 border-b border-neutral-2 bg-slate-50">
        <ToolBtn cmd="bold"      label={<strong>N</strong>} />
        <ToolBtn cmd="italic"    label={<em>K</em>} />
        <ToolBtn cmd="underline" label={<u>S</u>} />
        <span className="w-px bg-neutral-2 mx-1 self-stretch" />
        <ToolBtn cmd="insertUnorderedList" label="• Lista" />
        <ToolBtn cmd="insertOrderedList" label="1. Lista" />
      </div>
      <div className="relative">
        {!value && (
          <span className="absolute top-3 left-3 body-3 text-neutral-3 pointer-events-none select-none">
            {placeholder ?? 'Escribe el párrafo aquí...'}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; onChange(ref.current.innerHTML); }}
          onInput={() => onChange(ref.current.innerHTML)}
          className="min-h-20 p-3 body-3 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ── Inline image upload ──────────────────────────────────────── */
function ImageUploadZone({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch {
      setError('No se pudo subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="body-3 font-semibold text-secondary-5">Imagen de portada</label>

      {value ? (
        <div className="relative rounded-lg overflow-hidden h-36">
          <img src={value} alt="portada" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded-full cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
          className={`h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary-3 bg-primary-1' : 'border-neutral-2 hover:border-primary-3 hover:bg-primary-1'}`}
        >
          {uploading ? (
            <p className="body-3 text-neutral-4">Subiendo...</p>
          ) : (
            <>
              <p className="body-3 text-neutral-4 text-center">Arrastra una imagen o <span className="text-primary-3 font-medium">selecciona archivo</span></p>
              <p className="text-xs text-neutral-3 mt-1">JPG, PNG, WebP · máx. 8 MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      {error && <p className="body-3 text-red-500">{error}</p>}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function AdminInspirations() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [visibilityConfirm, setVisibilityConfirm] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const data = await getAllInspirations();
    setArticles(data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setError('');
    setForm({ ...EMPTY_FORM, body: [{ heading: '', paragraphs: [''] }] });
  }

  function openEdit(article) {
    setEditingId(article.id);
    setError('');
    setForm(cloneForm(article));
  }

  function closeForm() { setForm(null); setEditingId(null); setError(''); }

  function handleCategoryChange(cat) {
    setForm(f => ({
      ...f,
      category: cat,
      subcategory: '',
      emoji: CATEGORIES[cat]?.emoji ?? f.emoji,
    }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.summary.trim()) {
      setError('El título y el resumen son obligatorios.');
      return;
    }
    if (!form.emoji.trim()) {
      setError('El emoji es obligatorio.');
      return;
    }
    if (!form.destination.trim()) {
      setError('El destino es obligatorio.');
      return;
    }
    const readingTime = calcReadingTime(form.body);
    setSaving(true);
    setError('');
    try {
      const data = { ...form, readingTime };
      if (editingId) {
        await updateInspiration(editingId, data);
      } else {
        await createInspiration(data);
      }
      await loadAll();
      closeForm();
    } catch {
      setError('Ha ocurrido un error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteInspiration(id);
    setDeleteConfirm(null);
    await loadAll();
  }

  async function handleConfirmToggle() {
    await updateInspiration(visibilityConfirm.id, { active: !visibilityConfirm.active });
    setVisibilityConfirm(null);
    await loadAll();
  }

  // Body helpers
  function setBody(updater) { setForm(f => ({ ...f, body: updater(f.body) })); }
  function addSection() { setBody(b => [...b, { heading: '', paragraphs: [''] }]); }
  function removeSection(si) { setBody(b => b.filter((_, i) => i !== si)); }
  function updateSectionHeading(si, v) { setBody(b => b.map((s, i) => i === si ? { ...s, heading: v } : s)); }
  function updateSectionContent(si, v) { setBody(b => b.map((s, i) => i === si ? { ...s, paragraphs: [v] } : s)); }

  const subcategories = form ? (CATEGORIES[form.category]?.subcategories ?? []) : [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
        className="flex items-center gap-1 text-neutral-4 hover:text-secondary-5 body-3 mb-8 cursor-pointer transition-colors"
      >
        ← Volver al panel
      </button>

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="title-h2-desktop text-secondary-5">Inspiraciones</h1>
          <p className="body-3 text-neutral-4 mt-1">Gestiona los artículos que aparecen en el home</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-5 py-2 rounded-full transition-colors cursor-pointer"
        >
          + Nueva inspiración
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-1 rounded-xl animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 body-2 text-neutral-4">
          No hay artículos todavía. Crea el primero.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => navigate(`/inspiracion/${article.id}`)}
              className="bg-white border border-neutral-1 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              title="Ver previsualización"
            >
              {article.image && (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={article.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="body-bold text-secondary-5 truncate">{article.title}</p>
                <p className="body-3 text-neutral-4">{article.emoji} {article.category}{article.subcategory ? ` · ${article.subcategory}` : ''} · {article.readingTime} min</p>
              </div>
              <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibilityConfirm(article)}
                    title={article.active ? 'Ocultar del home' : 'Publicar en el home'}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      article.active ? 'bg-green-500' : 'bg-neutral-3'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      article.active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="body-3 text-neutral-4">{article.active ? 'Visible' : 'Oculto'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(article)}
                  className="body-3 text-primary-3 hover:underline cursor-pointer"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(article)}
                  className="body-3 text-red-500 hover:underline cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal eliminar ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-3xl">🗑️</div>
              <h3 className="title-h3-desktop text-secondary-5">¿Eliminar artículo?</h3>
              <p className="body-3 text-neutral-4">
                Vas a eliminar <strong className="text-secondary-5">«{deleteConfirm.title}»</strong>.
                Esta acción es <strong className="text-red-500">definitiva</strong> y borrará el artículo permanentemente de la base de datos sin posibilidad de recuperarlo.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                className="w-full px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white body-3 font-semibold transition-colors cursor-pointer"
              >
                Sí, eliminar definitivamente
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="w-full px-5 py-2.5 rounded-full border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal visibilidad ── */}
      {visibilityConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${visibilityConfirm.active ? 'bg-orange-50' : 'bg-green-50'}`}>
                {visibilityConfirm.active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              <h3 className="title-h3-desktop text-secondary-5">
                {visibilityConfirm.active ? '¿Ocultar del home?' : '¿Publicar en el home?'}
              </h3>
              <p className="body-3 text-neutral-4">
                {visibilityConfirm.active
                  ? <>«<strong className="text-secondary-5">{visibilityConfirm.title}</strong>» dejará de aparecer en el home para los usuarios.</>
                  : <>«<strong className="text-secondary-5">{visibilityConfirm.title}</strong>» será visible en el home para todos los usuarios.</>
                }
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmToggle}
                className="w-full px-5 py-2.5 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors cursor-pointer"
              >
                {visibilityConfirm.active ? 'Sí, ocultar' : 'Sí, publicar'}
              </button>
              <button
                type="button"
                onClick={() => setVisibilityConfirm(null)}
                className="w-full px-5 py-2.5 rounded-full border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal editar/crear ── */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header fijo */}
            <div className="flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
              <h2 className="title-h3-desktop text-secondary-5">
                {editingId ? 'Editar artículo' : 'Nueva inspiración'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-neutral-4 hover:text-secondary-5 text-xl leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo con scroll interno */}
            <div
              className="overflow-y-auto px-8 pb-4 flex flex-col gap-5 flex-1"
              style={{ scrollbarGutter: 'stable' }}
            >
              {/* Imagen */}
              <ImageUploadZone
                value={form.image}
                onChange={(url) => setForm(f => ({ ...f, image: url }))}
              />

              {/* Categoría + subcategoría */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="body-3 font-semibold text-secondary-5">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                  >
                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="body-3 font-semibold text-secondary-5">
                    Subcategoría <span className="text-neutral-4 font-normal">(solo interna)</span>
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                  >
                    <option value="">Sin subcategoría</option>
                    {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Emoji */}
              <div className="flex flex-col gap-1">
                <label className="body-3 font-semibold text-secondary-5">
                  Emoji * <span className="text-neutral-4 font-normal">(se asigna automáticamente, pero puedes cambiarlo)</span>
                </label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3 w-24"
                />
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="body-3 font-semibold text-secondary-5">Título *</label>
                  <span className={`text-xs ${form.title.length >= 75 ? 'text-orange-500' : 'text-neutral-3'}`}>{form.title.length}/80</span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="La ruta 66: el viaje que nunca olvidarás"
                  className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                />
              </div>

              {/* Resumen */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="body-3 font-semibold text-secondary-5">
                    Resumen * <span className="text-neutral-4 font-normal">(aparece en la card del home)</span>
                  </label>
                  <span className={`text-xs ${form.summary.length >= 120 ? 'text-orange-500' : 'text-neutral-3'}`}>{form.summary.length}/130</span>
                </div>
                <input
                  type="text"
                  maxLength={130}
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="3.900 km de historia, diners y paisajes imposibles"
                  className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                />
              </div>

              {/* Tiempo de lectura + destino */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="body-3 font-semibold text-secondary-5">Tiempo de lectura</label>
                  <div className="border border-neutral-1 rounded-lg px-3 py-2 body-3 bg-slate-50 text-secondary-5 flex items-center gap-2">
                    <span className="font-semibold">{calcReadingTime(form.body)}</span>
                    <span className="text-neutral-4">min</span>
                    <span className="text-xs text-neutral-3 ml-auto">calculado automáticamente</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="body-3 font-semibold text-secondary-5">
                    Destino * <span className="text-neutral-4 font-normal">(botón "Crear viaje")</span>
                  </label>
                  <CityAutocomplete
                    name="destination"
                    value={form.destination}
                    onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))}
                    placeholder="Estados Unidos"
                  />
                </div>
              </div>

              {/* Secciones del artículo */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="body-3 font-semibold text-secondary-5">Contenido del artículo</label>
                  <button
                    type="button"
                    onClick={addSection}
                    className="body-3 text-primary-3 font-semibold hover:underline cursor-pointer"
                  >
                    + Añadir sección
                  </button>
                </div>

                {form.body.map((section, si) => (
                  <div key={si} className="border border-neutral-1 rounded-xl p-4 flex flex-col gap-3 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={section.heading}
                        onChange={e => updateSectionHeading(si, e.target.value)}
                        placeholder="Título de la sección (opcional)"
                        className="flex-1 border border-neutral-2 rounded-lg px-3 py-2 body-3 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary-3"
                      />
                      {form.body.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSection(si)}
                          className="text-neutral-4 hover:text-red-500 cursor-pointer text-lg leading-none shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <RichTextEditor
                      value={section.paragraphs[0] ?? ''}
                      onChange={(v) => updateSectionContent(si, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer fijo */}
            <div className="px-8 pb-7 pt-4 shrink-0 border-t border-neutral-1">
              {error && <p className="body-3 text-red-500 mb-3">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 rounded-full border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear artículo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
