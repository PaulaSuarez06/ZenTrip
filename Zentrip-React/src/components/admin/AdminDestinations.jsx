import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../../services/destinationsService';
import { uploadImage, validateImageFile } from '../../services/cloudinaryService';
import { ROUTES } from '../../config/routes';

const EMPTY_FORM = { name: '', tip: '', imageUrl: '', active: true };

function cloneForm(dest) {
  return {
    name:     dest.name     ?? '',
    tip:      dest.tip      ?? '',
    imageUrl: dest.imageUrl ?? '',
    active:   dest.active   ?? true,
  };
}

/* ── Image upload ── */
function ImageUploadZone({ value, onChange }) {
  const inputRef  = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [error, setError]         = useState('');

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
      <label className="body-3 font-semibold text-secondary-5">Imagen del destino *</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden h-40">
          <img src={value} alt="destino" className="w-full h-full object-cover" />
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
          className={`h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary-3 bg-primary-1' : 'border-neutral-2 hover:border-primary-3 hover:bg-primary-1'}`}
        >
          {uploading ? (
            <p className="body-3 text-neutral-4">Subiendo...</p>
          ) : (
            <>
              <p className="body-3 text-neutral-4 text-center">Arrastra una imagen o <span className="text-primary-3 font-medium">selecciona archivo</span></p>
              <p className="text-xs text-neutral-3 mt-1">JPG, PNG, WebP · máx. 8 MB · formato horizontal recomendado</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      {error && <p className="body-3 text-red-500">{error}</p>}
    </div>
  );
}

/* ── Main component ── */
export default function AdminDestinations() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState(null);
  const [editingId, setEditingId]       = useState(null);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [deleteConfirm, setDeleteConfirm]       = useState(null);
  const [visibilityConfirm, setVisibilityConfirm] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const data = await getAllDestinations();
    setDestinations(data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setError('');
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(dest) {
    setEditingId(dest.id);
    setError('');
    setForm(cloneForm(dest));
  }

  function closeForm() { setForm(null); setEditingId(null); setError(''); }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre del destino es obligatorio.'); return; }
    if (!form.imageUrl)    { setError('La imagen es obligatoria.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateDestination(editingId, form);
      } else {
        await createDestination(form);
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
    await deleteDestination(id);
    setDeleteConfirm(null);
    await loadAll();
  }

  async function handleConfirmToggle() {
    await updateDestination(visibilityConfirm.id, { active: !visibilityConfirm.active });
    setVisibilityConfirm(null);
    await loadAll();
  }

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
          <h1 className="title-h2-desktop text-secondary-5">Inspiración</h1>
          <p className="body-3 text-neutral-4 mt-1">Gestiona las tarjetas de destino que rotan en el home</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-5 py-2 rounded-full transition-colors cursor-pointer"
        >
          + Nuevo destino
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-1 rounded-xl animate-pulse" />)}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 body-2 text-neutral-4">
          No hay destinos todavía. Crea el primero.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {destinations.map(dest => (
            <div
              key={dest.id}
              className="bg-white border border-neutral-1 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              {dest.imageUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={dest.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="body-bold text-secondary-5 truncate">{dest.name}</p>
                {dest.tip && (
                  <p className="body-3 text-neutral-4 truncate">✦ {dest.tip}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibilityConfirm(dest)}
                    title={dest.active ? 'Ocultar del home' : 'Mostrar en el home'}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      dest.active ? 'bg-green-500' : 'bg-neutral-3'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      dest.active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="body-3 text-neutral-4">{dest.active ? 'Visible' : 'Oculto'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(dest)}
                  className="body-3 text-primary-3 hover:underline cursor-pointer"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(dest)}
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
              <h3 className="title-h3-desktop text-secondary-5">¿Eliminar destino?</h3>
              <p className="body-3 text-neutral-4">
                Vas a eliminar <strong className="text-secondary-5">«{deleteConfirm.name}»</strong>.
                Esta acción es <strong className="text-red-500">definitiva</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                className="w-full px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white body-3 font-semibold transition-colors cursor-pointer"
              >
                Sí, eliminar
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
                {visibilityConfirm.active ? '¿Ocultar del home?' : '¿Mostrar en el home?'}
              </h3>
              <p className="body-3 text-neutral-4">
                {visibilityConfirm.active
                  ? <>«<strong className="text-secondary-5">{visibilityConfirm.name}</strong>» dejará de aparecer en la sección de Inspiración del home.</>
                  : <>«<strong className="text-secondary-5">{visibilityConfirm.name}</strong>» será visible en la sección de Inspiración del home.</>
                }
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmToggle}
                className="w-full px-5 py-2.5 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors cursor-pointer"
              >
                {visibilityConfirm.active ? 'Sí, ocultar' : 'Sí, mostrar'}
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

      {/* ── Modal crear / editar ── */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
              <h2 className="title-h3-desktop text-secondary-5">
                {editingId ? 'Editar destino' : 'Nuevo destino'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-neutral-4 hover:text-secondary-5 text-xl leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-8 pb-4 flex flex-col gap-5 flex-1">
              {/* Imagen */}
              <ImageUploadZone
                value={form.imageUrl}
                onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
              />

              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <label className="body-3 font-semibold text-secondary-5">Nombre del destino *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Santorini, Grecia"
                  className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                />
              </div>

              {/* Tip */}
              <div className="flex flex-col gap-1">
                <label className="body-3 font-semibold text-secondary-5">
                  Consejo rápido <span className="text-neutral-4 font-normal">(aparece debajo del nombre)</span>
                </label>
                <input
                  type="text"
                  value={form.tip}
                  onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                  placeholder="Reserva el atardecer desde Oia, el más famoso del Mediterráneo"
                  className="border border-neutral-2 rounded-lg px-3 py-2 body-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
                  maxLength={120}
                />
                <span className={`text-xs self-end ${form.tip.length >= 100 ? 'text-orange-500' : 'text-neutral-3'}`}>
                  {form.tip.length}/120
                </span>
              </div>

              {/* Visible toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="body-3 font-semibold text-secondary-5">Visible en el home</p>
                  <p className="body-3 text-neutral-4">Si está desactivado no aparece en la sección de Inspiración</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    form.active ? 'bg-green-500' : 'bg-neutral-3'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    form.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Footer */}
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
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear destino'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
