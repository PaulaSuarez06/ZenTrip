import { useEffect, useMemo, useState } from 'react';
import { X, Image, Wallet, Package, Shield, Folder, Users } from 'lucide-react';
import { getGalleryPhotos, getGroupLuggage, getTripById, getAllPersonalLuggage } from '../../services/tripService';
import { getPersonalBudgetsTotal } from '../../services/budgetService';
import { updatePostVisibility } from '../../services/communityService';

function Toggle({ checked, onChange, disabled, loading }) {
  if (loading) return <div className="w-11 h-6 bg-neutral-2 rounded-full animate-pulse" />;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      title={disabled ? 'No hay datos disponibles para compartir' : undefined}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-3' : 'bg-neutral-2'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function EditPostVisibilityModal({ post, onClose, onSaved }) {
  const [shareGallery, setShareGallery] = useState(post.shareGallery ?? false);
  const [shareBudget, setShareBudget] = useState(post.shareBudget ?? false);
  const [shareLuggage, setShareLuggage] = useState(post.shareLuggage ?? false);
  const [luggageScopeAll, setLuggageScopeAll] = useState(post.luggageScopeAll ?? false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [luggageCategories, setLuggageCategories] = useState([]);
  const [personalLuggageCategories, setPersonalLuggageCategories] = useState([]);
  const [tripBudget, setTripBudget] = useState(null);
  const [tripCurrency, setTripCurrency] = useState(post.budgetCurrency ?? null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const folderNames = useMemo(
    () => [...new Set(allPhotos.map((p) => p.folderName || ''))],
    [allPhotos]
  );

  const galleryImages = useMemo(
    () => allPhotos
      .filter((p) => selectedFolders.includes(p.folderName || ''))
      .map((p) => ({ url: p.url, folderName: p.folderName || '' })),
    [allPhotos, selectedFolders]
  );

  function toggleFolder(folder) {
    setSelectedFolders((prev) =>
      prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder]
    );
  }

  useEffect(() => {
    if (!post.tripId) { setLoading(false); return; }
    Promise.all([
      getGalleryPhotos(post.tripId).catch(() => []),
      getGroupLuggage(post.tripId).catch(() => []),
      getAllPersonalLuggage(post.tripId).catch(() => []),
      getTripById(post.tripId).catch(() => null),
      getPersonalBudgetsTotal(post.tripId).catch(() => 0),
    ]).then(([photos, groupLuggage, personalLuggage, trip, budgetTotal]) => {
      // Gallery
      const validPhotos = photos.filter((p) => p.url);
      setAllPhotos(validPhotos);
      const sharedUrls = new Set((post.galleryImages || []).map((i) => (typeof i === 'string' ? i : i.url)));
      const sharedFolders = post.galleryImages?.length > 0
        ? [...new Set(validPhotos.filter((p) => sharedUrls.has(p.url)).map((p) => p.folderName || ''))]
        : [...new Set(validPhotos.map((p) => p.folderName || ''))];
      setSelectedFolders(sharedFolders);

      // Group luggage
      const groupCats = [...new Set(groupLuggage.map((i) => i.item).filter(Boolean))];
      setLuggageCategories(groupCats.slice(0, 20));

      // Personal luggage (all users, deduplicated)
      const personalCats = [...new Set(personalLuggage.map((i) => i.item).filter(Boolean))];
      setPersonalLuggageCategories(personalCats.slice(0, 30));

      // Budget: prefer personalBudgets total, fallback to trip.budget
      const budget = budgetTotal > 0 ? budgetTotal : (trip?.budget ? Number(trip.budget) : null);
      setTripBudget(budget && budget > 0 ? budget : null);
      if (trip?.currency) setTripCurrency(trip.currency);

      setLoading(false);
    });
  }, [post.tripId]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const updates = {
        shareGallery,
        galleryImages,
        shareBudget,
        totalBudget: tripBudget,
        budgetCurrency: tripCurrency,
        shareLuggage,
        luggageScopeAll,
        luggageCategories,
        personalLuggageCategories: luggageScopeAll ? personalLuggageCategories : [],
      };
      await updatePostVisibility(post.id, updates);
      onSaved(updates);
      onClose();
    } catch (e) {
      console.error(e);
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const hasBudget = tripBudget != null && tripBudget > 0;
  const hasGroupLuggage = luggageCategories.length > 0;
  const hasPersonalLuggage = personalLuggageCategories.length > 0;
  const hasAnyLuggage = hasGroupLuggage || hasPersonalLuggage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-1 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide">Comunidad</p>
            <h2 className="title-h3-desktop text-secondary-5">Editar visibilidad</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-neutral-1 transition-colors">
            <X className="w-5 h-5 text-neutral-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="body-2 font-semibold text-neutral-5 mb-1">¿Qué quieres compartir?</p>
            <p className="body-3 text-neutral-4 mb-4">El itinerario de actividades siempre se comparte, sin información privada.</p>

            <div className="flex flex-col gap-3">
              {/* Galería */}
              <div className="border border-neutral-2 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Image className="w-5 h-5 text-neutral-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="body-3 font-semibold text-neutral-5">Galería de fotos</p>
                    <p className="body-3 text-neutral-3">
                      {loading ? 'Cargando...' : allPhotos.length === 0
                        ? 'Sin fotos en la galería del viaje'
                        : `${allPhotos.length} foto${allPhotos.length !== 1 ? 's' : ''} en ${folderNames.length} carpeta${folderNames.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Toggle
                    checked={shareGallery}
                    onChange={setShareGallery}
                    disabled={loading || allPhotos.length === 0}
                    loading={loading}
                  />
                </div>
                {shareGallery && folderNames.length > 1 && (
                  <div className="border-t border-neutral-1 px-4 py-3 bg-neutral-1/40 flex flex-col gap-2">
                    <p className="body-3 font-semibold text-neutral-5">Carpetas a compartir:</p>
                    {folderNames.map((folder) => {
                      const count = allPhotos.filter((p) => (p.folderName || '') === folder).length;
                      const isSelected = selectedFolders.includes(folder);
                      return (
                        <label key={folder || '__none__'} className="flex items-center gap-2.5 cursor-pointer body-3 text-neutral-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFolder(folder)}
                            className="w-4 h-4 rounded accent-primary-3"
                          />
                          <Folder className="w-3.5 h-3.5 text-neutral-4 shrink-0" />
                          <span className="flex-1">{folder || 'General'}</span>
                          <span className="body-3 text-neutral-3">{count} foto{count !== 1 ? 's' : ''}</span>
                        </label>
                      );
                    })}
                    <p className="body-3 text-neutral-3 mt-0.5">
                      {galleryImages.length} foto{galleryImages.length !== 1 ? 's' : ''} seleccionada{galleryImages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Presupuesto */}
              <div className="flex items-center gap-3 border border-neutral-2 rounded-xl px-4 py-3">
                <Wallet className="w-5 h-5 text-neutral-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="body-3 font-semibold text-neutral-5">Presupuesto total del viaje</p>
                  <p className="body-3 text-neutral-3">
                    {loading ? 'Cargando...' : hasBudget
                      ? `${tripBudget.toLocaleString('es-ES')} ${tripCurrency || ''}`
                      : 'Sin presupuesto definido en el viaje'}
                  </p>
                </div>
                <Toggle checked={shareBudget} onChange={setShareBudget} disabled={!hasBudget || loading} loading={loading} />
              </div>

              {/* Equipaje */}
              <div className="border border-neutral-2 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Package className="w-5 h-5 text-neutral-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="body-3 font-semibold text-neutral-5">Lista de equipaje</p>
                    <p className="body-3 text-neutral-3">
                      {loading ? 'Cargando...' : !hasAnyLuggage
                        ? 'Sin equipaje en el viaje'
                        : [
                            hasGroupLuggage && `${luggageCategories.length} artículo${luggageCategories.length !== 1 ? 's' : ''} grupales`,
                            hasPersonalLuggage && `${personalLuggageCategories.length} personales`,
                          ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Toggle
                    checked={shareLuggage}
                    onChange={(v) => { setShareLuggage(v); if (!v) setLuggageScopeAll(false); }}
                    disabled={loading || !hasAnyLuggage}
                    loading={loading}
                  />
                </div>

                {shareLuggage && (
                  <div className="border-t border-neutral-1 px-4 py-3 bg-neutral-1/40 flex flex-col gap-2">
                    <p className="body-3 font-semibold text-neutral-5">¿Qué equipaje compartir?</p>
                    <label className="flex items-center gap-2.5 cursor-pointer body-3 text-neutral-5">
                      <input
                        type="radio"
                        name="luggageScope"
                        checked={!luggageScopeAll}
                        onChange={() => setLuggageScopeAll(false)}
                        className="accent-primary-3"
                      />
                      <Package className="w-3.5 h-3.5 text-neutral-4 shrink-0" />
                      <span className="flex-1">Solo equipaje grupal</span>
                      {hasGroupLuggage && (
                        <span className="body-3 text-neutral-3">{luggageCategories.length} artículo{luggageCategories.length !== 1 ? 's' : ''}</span>
                      )}
                    </label>
                    <label className={`flex items-center gap-2.5 body-3 text-neutral-5 ${hasPersonalLuggage ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                      <input
                        type="radio"
                        name="luggageScope"
                        checked={luggageScopeAll}
                        onChange={() => setLuggageScopeAll(true)}
                        disabled={!hasPersonalLuggage}
                        className="accent-primary-3"
                      />
                      <Users className="w-3.5 h-3.5 text-neutral-4 shrink-0" />
                      <span className="flex-1">Grupal y personal</span>
                      {hasPersonalLuggage
                        ? <span className="body-3 text-neutral-3">{personalLuggageCategories.length} artículo{personalLuggageCategories.length !== 1 ? 's' : ''} más</span>
                        : <span className="body-3 text-neutral-3">Sin artículos personales</span>}
                    </label>
                    <p className="body-3 text-neutral-3 mt-0.5">Los artículos personales se muestran sin identificar a quién pertenecen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-700 body-3">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Las notas personales, los comprobantes de pago y los datos detallados de reservas nunca se compartirán.</span>
          </div>

          {error && (
            <p className="body-3 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3 sticky bottom-0 bg-white pt-3 border-t border-neutral-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-neutral-2 text-neutral-5 body-2-semibold py-2.5 rounded-full hover:bg-neutral-1 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-primary-3 hover:bg-orange-400 disabled:opacity-60 text-white body-2-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Guardando...</>
            ) : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
