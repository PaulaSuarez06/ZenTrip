import { useEffect, useMemo, useState } from 'react';
import { X, Image, Wallet, Package, Shield, Users, AlertCircle, CheckCircle2, Link, Copy, Check, Folder, Ticket, Globe, ChevronLeft } from 'lucide-react';
import { getGalleryPhotos, getGroupLuggage, getUserLuggage, getBookings } from '../../services/tripService';
import { getPersonalBudgetsTotal, getExpenseAggregates } from '../../services/budgetService';
import { publishTrip } from '../../services/communityService';
import { getOrCreateTripShare, getSharePermissionStatus, requestSharePermission } from '../../services/tripShareService';

const STEPS = ['titulo', 'opciones', 'confirmar'];

const PUBLIC_BASE = `${window.location.origin}/p`;

function PrivacyNote({ children }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-700 body-3">
      <Shield className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Toggle({ checked, onChange, disabled, loading }) {
  if (loading) {
    return <div className="w-11 h-6 bg-neutral-2 rounded-full animate-pulse" />;
  }
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
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function CopyLinkButton({ postId }) {
  const [copied, setCopied] = useState(false);
  const url = `${PUBLIC_BASE}/${postId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-1/60 border border-neutral-2 rounded-xl px-3 py-2.5">
      <Link className="w-4 h-4 text-neutral-4 shrink-0" />
      <span className="body-3 text-neutral-5 flex-1 truncate">{url}</span>
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1.5 body-3 font-semibold px-3 py-1 rounded-full transition-colors shrink-0 ${
          copied
            ? 'bg-green-100 text-green-700'
            : 'bg-primary-1 text-primary-3 hover:bg-primary-2'
        }`}
      >
        {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
      </button>
    </div>
  );
}

function CopyTripLinkPanel({ trip, activities, memberCount }) {
  const [shareId, setShareId] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [genError, setGenError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getOrCreateTripShare(trip, activities, memberCount)
      .then(setShareId)
      .catch(() => setGenError('No se pudo generar el enlace. Inténtalo de nuevo.'))
      .finally(() => setGenerating(false));
  }, []);

  const url = shareId ? `${window.location.origin}/s/${shareId}` : '';

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 bg-primary-1 rounded-2xl flex items-center justify-center">
          <Link className="w-7 h-7 text-primary-3" />
        </div>
        <div>
          <p className="title-h3-desktop text-secondary-5 mb-1">Enlace privado del viaje</p>
          <p className="body-3 text-neutral-4">Cualquier persona con este enlace podrá ver el itinerario, aunque no tenga cuenta en ZenTrip.</p>
        </div>
      </div>

      {generating ? (
        <div className="flex items-center gap-2 bg-neutral-1/60 border border-neutral-2 rounded-xl px-3 py-3">
          <span className="w-4 h-4 border-2 border-neutral-3 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="body-3 text-neutral-4">Generando enlace…</span>
        </div>
      ) : genError ? (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 body-3 text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {genError}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-neutral-1/60 border border-neutral-2 rounded-xl px-3 py-2.5">
          <Link className="w-4 h-4 text-neutral-4 shrink-0" />
          <span className="body-3 text-neutral-5 flex-1 truncate">{url}</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 body-3 font-semibold px-3 py-1 rounded-full transition-colors shrink-0 ${
              copied ? 'bg-green-100 text-green-700' : 'bg-primary-1 text-primary-3 hover:bg-primary-2'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
        </div>
      )}

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-blue-700 body-3">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Solo incluye el itinerario. Notas personales, presupuesto y datos privados nunca se comparten.</span>
      </div>
    </div>
  );
}

export default function ShareTripModal({ trip, members, activities, user, profile, isCreator, onClose }) {
  const [mode, setMode] = useState(null); // null | 'copy' | 'publish'
  const [step, setStep] = useState(0);
  const [permStatus, setPermStatus] = useState(null); // null=loading | 'not_requested' | 'pending' | 'approved' | 'denied'
  const [permLoading, setPermLoading] = useState(!isCreator);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (isCreator) return;
    getSharePermissionStatus(trip.id, user.uid)
      .then(({ status }) => setPermStatus(status))
      .catch(() => setPermStatus('not_requested'))
      .finally(() => setPermLoading(false));
  }, [isCreator, trip.id, user.uid]);

  async function handleRequestPermission() {
    setRequesting(true);
    setPermStatus('pending');
    try {
      await requestSharePermission({
        tripId: trip.id,
        tripName: trip.name || 'Viaje',
        creatorId: trip.uid,
        requesterId: user.uid,
        requesterName: profile?.username || profile?.displayName || user.email || 'Un participante',
        requesterAvatar: profile?.avatarUrl || null,
        requesterAvatarColor: profile?.avatarColor || null,
      });
    } catch {
      setPermStatus('not_requested');
    } finally {
      setRequesting(false);
    }
  }
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(trip.coverImage || null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [shareGallery, setShareGallery] = useState(false);
  const [shareBudget, setShareBudget] = useState(false);
  const [shareLuggage, setShareLuggage] = useState(false);
  const [luggageScopeAll, setLuggageScopeAll] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [luggageCategories, setLuggageCategories] = useState([]);
  const [personalLuggageCategories, setPersonalLuggageCategories] = useState([]);
  const [groupBudgetTotal, setGroupBudgetTotal] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [shareBookings, setShareBookings] = useState(false);
  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState(null);
  const [error, setError] = useState('');

  const hasBudget = (groupBudgetTotal != null && groupBudgetTotal > 0) || (trip?.budget != null && Number(trip.budget) > 0);
  const effectiveBudget = groupBudgetTotal > 0 ? groupBudgetTotal : (trip?.budget ? Number(trip.budget) : null);

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

  const acceptedCount = (members || []).filter(
    (m) => m.invitationStatus === 'accepted' || !m.invitationStatus
  ).length;

  useEffect(() => {
    if (!trip?.id) return;
    Promise.all([
      getGalleryPhotos(trip.id).catch(() => []),
      getGroupLuggage(trip.id).catch(() => []),
      getUserLuggage(trip.id, user.uid).catch(() => []),
      getPersonalBudgetsTotal(trip.id).catch(() => 0),
      getExpenseAggregates(trip.id).catch(() => null),
      getBookings(trip.id).catch(() => []),
    ]).then(([photos, luggage, personalLuggage, budgetTotal, aggregates, bookings]) => {
      const validPhotos = photos.filter((p) => p.url);
      setAllPhotos(validPhotos);
      const folders = [...new Set(validPhotos.map((p) => p.folderName || ''))];
      setSelectedFolders(folders);
      const cats = [...new Set(luggage.map((i) => i.item).filter(Boolean))];
      setLuggageCategories(cats.slice(0, 20));
      const personalCats = [...new Set(personalLuggage.map((i) => i.item).filter(Boolean))];
      setPersonalLuggageCategories(personalCats.slice(0, 30));
      if (budgetTotal > 0) setGroupBudgetTotal(budgetTotal);
      if (aggregates && aggregates.totalSpent > 0) setExpenseSummary(aggregates);
      setRawBookings(bookings || []);
      setLoading(false);
    });
  }, [trip?.id]);

  async function handlePublish() {
    setSubmitting(true);
    setError('');
    try {
      const postId = await publishTrip({
        trip,
        members,
        activities,
        userId: user.uid,
        userProfile: profile,
        options: {
          title: title.trim(),
          coverImage,
          shareGallery,
          galleryImages,
          shareBudget,
          totalBudget: effectiveBudget,
          shareLuggage,
          luggageScopeAll,
          luggageCategories,
          personalLuggageCategories: luggageScopeAll ? personalLuggageCategories : [],
          expenseSummary,
          shareBookings,
          rawBookings,
        },
      });
      setPublishedPostId(postId);
    } catch (e) {
      console.error(e);
      setError('No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const canNext0 = title.trim().length >= 5;

  function days() {
    if (!trip?.startDate || !trip?.endDate) return null;
    const s = new Date(trip.startDate + 'T00:00:00');
    const e = new Date(trip.endDate + 'T00:00:00');
    return Math.round((e - s) / 86400000) + 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-1 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            {mode !== null && (
              <button
                type="button"
                onClick={() => { setMode(null); setStep(0); }}
                className="p-1.5 rounded-full hover:bg-neutral-1 transition-colors -ml-1"
                aria-label="Volver"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-4" />
              </button>
            )}
            <div>
              {mode === 'publish'
                ? <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide">Comunidad</p>
                : null}
              <h2 className="title-h3-desktop text-secondary-5">
                {mode === 'copy' ? 'Copiar enlace' : 'Compartir viaje'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-1 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-4" />
          </button>
        </div>

        {/* Step indicator */}
        {mode === 'publish' && !publishedPostId && (
          <div className="flex items-center gap-2 px-6 pt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step ? 'bg-primary-3 text-white' :
                  i === step ? 'bg-primary-3 text-white' : 'bg-neutral-1 text-neutral-3'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 ${i < step ? 'bg-primary-3' : 'bg-neutral-1'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* ── MODE SELECTION ── */}
          {mode === null && (
            <>
              {/* Creador o permiso aprobado: opciones normales */}
              {(isCreator || permStatus === 'approved') && (
                <div className="flex flex-col gap-4 py-2">
                  <p className="body-3 text-neutral-4 text-center">¿Cómo quieres compartir este viaje?</p>
                  <button
                    type="button"
                    onClick={() => setMode('copy')}
                    className="flex items-center gap-4 border border-neutral-2 rounded-2xl px-5 py-4 hover:border-primary-3 hover:bg-primary-1/40 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 bg-primary-1 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-2 transition-colors">
                      <Link className="w-5 h-5 text-primary-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-2 font-semibold text-secondary-5">Copiar enlace</p>
                      <p className="body-3 text-neutral-4 mt-0.5">Comparte el enlace directo con quien quieras, sin publicarlo.</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('publish')}
                    className="flex items-center gap-4 border border-neutral-2 rounded-2xl px-5 py-4 hover:border-primary-3 hover:bg-primary-1/40 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 bg-primary-1 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-2 transition-colors">
                      <Globe className="w-5 h-5 text-primary-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-2 font-semibold text-secondary-5">Publicar en comunidad</p>
                      <p className="body-3 text-neutral-4 mt-0.5">Comparte tu aventura con todos los viajeros de ZenTrip.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Cargando estado de permisos */}
              {!isCreator && permLoading && (
                <div className="flex items-center justify-center py-12 gap-3 text-neutral-4 body-3">
                  <span className="w-5 h-5 border-2 border-neutral-2 border-t-primary-3 rounded-full animate-spin" />
                  Comprobando permisos…
                </div>
              )}

              {/* Sin solicitud enviada */}
              {!isCreator && !permLoading && permStatus === 'not_requested' && (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="title-h3-desktop text-secondary-5 mb-1">Permiso necesario</p>
                    <p className="body-3 text-neutral-4">Solo el creador del viaje puede compartirlo. Puedes solicitar permiso y recibirás una notificación cuando te lo aprueben.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    disabled={requesting}
                    className="w-full bg-primary-3 hover:bg-orange-400 disabled:opacity-60 text-white body-2-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    {requesting
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando solicitud…</>
                      : 'Solicitar permiso para compartir'}
                  </button>
                </div>
              )}

              {/* Solicitud pendiente */}
              {!isCreator && !permLoading && permStatus === 'pending' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="title-h3-desktop text-secondary-5 mb-1">Solicitud enviada</p>
                    <p className="body-3 text-neutral-4">El creador del viaje recibirá una notificación. Te avisaremos en cuanto tome una decisión.</p>
                  </div>
                </div>
              )}

              {/* Solicitud denegada */}
              {!isCreator && !permLoading && permStatus === 'denied' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <div>
                    <p className="title-h3-desktop text-secondary-5 mb-1">Permiso denegado</p>
                    <p className="body-3 text-neutral-4">El creador del viaje no ha autorizado compartir este viaje.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COPY LINK ── */}
          {mode === 'copy' && (
            <CopyTripLinkPanel trip={trip} activities={activities} memberCount={acceptedCount} />
          )}

          {/* ── DONE ── */}
          {mode === 'publish' && publishedPostId && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <div>
                <p className="title-h3-desktop text-secondary-5 mb-1">¡Viaje publicado!</p>
                <p className="body-2 text-neutral-4">Ya puedes verlo en la sección de la comunidad.</p>
              </div>

              <div className="w-full text-left">
                <p className="body-3 font-semibold text-neutral-5 mb-2">Comparte el enlace directo:</p>
                <CopyLinkButton postId={publishedPostId} />
                <p className="body-3 text-neutral-3 mt-2">
                  Cualquier persona con el enlace puede verlo, aunque no tenga cuenta en ZenTrip.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-primary-3 hover:bg-orange-400 text-white body-2-semibold py-2.5 rounded-full transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* ── STEP 0: Título ── */}
          {mode === 'publish' && !publishedPostId && step === 0 && (
            <>
              <div>
                <p className="body-2 text-neutral-5 mb-1 font-semibold">Título público del viaje</p>
                <p className="body-3 text-neutral-4 mb-3">
                  Ponle un título descriptivo que cuente de qué va tu aventura. Este será el que vean los demás viajeros.
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Perú en 3 semanas: Machu Picchu, Cusco y la Amazonía"
                  maxLength={100}
                  className="w-full border border-neutral-2 rounded-xl px-4 py-3 body-2 text-secondary-5 placeholder:text-neutral-3 focus:outline-none focus:border-primary-3 transition-colors"
                />
                <p className="text-right body-3 text-neutral-3 mt-1">{title.length}/100</p>
              </div>

              <div className="bg-neutral-1/60 rounded-xl p-4 flex flex-col gap-3">
                <p className="body-3 font-semibold text-neutral-5">Vista previa de la tarjeta</p>
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-2 flex items-center justify-center text-3xl">
                    {coverImage
                      ? <img src={coverImage} alt="" className="w-full h-full object-cover" />
                      : '✈️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-bold text-secondary-5 line-clamp-2 leading-tight">
                      {title.trim() || <span className="text-neutral-3 italic">Tu título aparecerá aquí</span>}
                    </p>
                    <p className="body-3 text-neutral-4 mt-1">
                      {trip.destination || '—'}
                      {days() && ` · ${days()} días`}
                      {acceptedCount > 0 && ` · ${acceptedCount} ${acceptedCount === 1 ? 'persona' : 'personas'}`}
                    </p>
                  </div>
                </div>

                {/* Image picker */}
                {(allPhotos.length > 0 || trip.coverImage) && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker((v) => !v)}
                      className="body-3 text-primary-3 font-semibold hover:underline"
                    >
                      {showImagePicker ? 'Ocultar imágenes' : 'Cambiar imagen de portada'}
                    </button>
                    {showImagePicker && (
                      <div className="mt-2 grid grid-cols-4 gap-2 max-h-44 overflow-y-auto">
                        {[
                          ...(trip.coverImage ? [trip.coverImage] : []),
                          ...allPhotos.map((p) => p.url).filter((url) => url !== trip.coverImage),
                        ].map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setCoverImage(url); setShowImagePicker(false); }}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                              coverImage === url ? 'border-primary-3' : 'border-transparent hover:border-neutral-3'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <PrivacyNote>
                Solo se mostrará el número de participantes, nunca sus nombres ni datos personales.
              </PrivacyNote>
            </>
          )}

          {/* ── STEP 1: Opciones de privacidad ── */}
          {mode === 'publish' && !publishedPostId && step === 1 && (
            <>
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
                          ? `${effectiveBudget.toLocaleString('es-ES')} ${trip.currency || ''}`
                          : 'Sin presupuesto definido en el viaje'}
                      </p>
                    </div>
                    <Toggle
                      checked={shareBudget}
                      onChange={setShareBudget}
                      disabled={!hasBudget || loading}
                      loading={loading}
                    />
                  </div>

                  {/* Equipaje */}
                  <div className="border border-neutral-2 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Package className="w-5 h-5 text-neutral-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="body-3 font-semibold text-neutral-5">Lista de equipaje</p>
                        <p className="body-3 text-neutral-3">
                          {loading ? 'Cargando...' : (luggageCategories.length === 0 && personalLuggageCategories.length === 0)
                            ? 'Sin equipaje en el viaje'
                            : [
                                luggageCategories.length > 0 && `${luggageCategories.length} grupales`,
                                personalLuggageCategories.length > 0 && `${personalLuggageCategories.length} personales`,
                              ].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <Toggle
                        checked={shareLuggage}
                        onChange={(v) => { setShareLuggage(v); if (!v) setLuggageScopeAll(false); }}
                        disabled={loading || (luggageCategories.length === 0 && personalLuggageCategories.length === 0)}
                        loading={loading}
                      />
                    </div>
                    {shareLuggage && (
                      <div className="border-t border-neutral-1 px-4 py-3 bg-neutral-1/40 flex flex-col gap-2">
                        <p className="body-3 font-semibold text-neutral-5">¿Qué equipaje compartir?</p>
                        <label className="flex items-center gap-2.5 cursor-pointer body-3 text-neutral-5">
                          <input type="radio" name="luggageScopeShare" checked={!luggageScopeAll} onChange={() => setLuggageScopeAll(false)} className="accent-primary-3" />
                          <Package className="w-3.5 h-3.5 text-neutral-4 shrink-0" />
                          <span className="flex-1">Solo equipaje grupal</span>
                          {luggageCategories.length > 0 && <span className="body-3 text-neutral-3">{luggageCategories.length} artículo{luggageCategories.length !== 1 ? 's' : ''}</span>}
                        </label>
                        <label className={`flex items-center gap-2.5 body-3 text-neutral-5 ${personalLuggageCategories.length > 0 ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                          <input type="radio" name="luggageScopeShare" checked={luggageScopeAll} onChange={() => setLuggageScopeAll(true)} disabled={personalLuggageCategories.length === 0} className="accent-primary-3" />
                          <Users className="w-3.5 h-3.5 text-neutral-4 shrink-0" />
                          <span className="flex-1">Grupal y personal</span>
                          {personalLuggageCategories.length > 0
                            ? <span className="body-3 text-neutral-3">{personalLuggageCategories.length} artículo{personalLuggageCategories.length !== 1 ? 's' : ''} más</span>
                            : <span className="body-3 text-neutral-3">Sin artículos personales</span>}
                        </label>
                        <p className="body-3 text-neutral-3 mt-0.5">Los artículos personales se muestran sin identificar a quién pertenecen.</p>
                      </div>
                    )}
                  </div>

                  {/* Reservas */}
                  <div className="flex items-center gap-3 border border-neutral-2 rounded-xl px-4 py-3">
                    <Ticket className="w-5 h-5 text-neutral-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="body-3 font-semibold text-neutral-5">Reservas del viaje</p>
                      <p className="body-3 text-neutral-3">
                        {loading ? 'Cargando...' : rawBookings.length === 0
                          ? 'Sin reservas guardadas en el viaje'
                          : `${rawBookings.length} reserva${rawBookings.length !== 1 ? 's' : ''} (vuelos, hoteles, actividades…)`}
                      </p>
                    </div>
                    <Toggle
                      checked={shareBookings}
                      onChange={setShareBookings}
                      disabled={loading || rawBookings.length === 0}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>

              <PrivacyNote>
                Las notas personales, los comprobantes de pago y los datos detallados de reservas nunca se compartirán.
              </PrivacyNote>

              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-blue-700 body-3">
                <Users className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Solo se mostrará el número de participantes ({acceptedCount}), nunca sus nombres ni perfiles.</span>
              </div>
            </>
          )}

          {/* ── STEP 2: Confirmación ── */}
          {mode === 'publish' && !publishedPostId && step === 2 && (
            <>
              <div className="bg-neutral-1/60 rounded-xl p-4 flex flex-col gap-3">
                <p className="body-2 font-semibold text-neutral-5">Tu publicación incluirá:</p>
                <ul className="flex flex-col gap-2 body-3 text-neutral-5">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Título: <span className="font-semibold line-clamp-1">{title}</span></li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Destino, duración y número de participantes</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Itinerario de actividades (sin notas ni datos sensibles)</li>
                  {shareGallery && galleryImages.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Galería ({galleryImages.length} fotos
                      {selectedFolders.length < folderNames.length && `, ${selectedFolders.length} de ${folderNames.length} carpetas`})
                    </li>
                  )}
                  {shareBudget && hasBudget && (
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Presupuesto total: {effectiveBudget?.toLocaleString('es-ES')} {trip.currency}</li>
                  )}
                  {shareLuggage && (luggageCategories.length > 0 || personalLuggageCategories.length > 0) && (
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lista de equipaje {luggageScopeAll ? 'grupal y personal' : 'grupal'}</li>
                  )}
                  {shareBookings && rawBookings.length > 0 && (
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Reservas del viaje ({rawBookings.length} — sin datos privados)</li>
                  )}
                </ul>
                <div className="border-t border-neutral-2 pt-3 flex flex-col gap-1.5">
                  <p className="body-3 font-semibold text-neutral-4">Nunca se compartirá:</p>
                  <ul className="flex flex-col gap-1 body-3 text-neutral-3">
                    <li className="flex items-center gap-2"><span>✗</span> Notas personales de actividades</li>
                    <li className="flex items-center gap-2"><span>✗</span> Comprobantes de pago</li>
                    <li className="flex items-center gap-2"><span>✗</span> Nombres ni datos de participantes</li>
                    <li className="flex items-center gap-2"><span>✗</span> Detalles privados de reservas</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-blue-700 body-3">
                <Link className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Al publicar obtendrás un enlace directo. Cualquier persona, aunque no tenga cuenta, podrá verlo.</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 body-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer buttons */}
        {mode === 'publish' && !publishedPostId && (
          <div className="px-6 pb-5 flex gap-3 sticky bottom-0 bg-white pt-3 border-t border-neutral-1">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 border border-neutral-2 text-neutral-5 body-2-semibold py-2.5 rounded-full hover:bg-neutral-1 transition-colors"
              >
                Atrás
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !canNext0}
                className="flex-1 bg-primary-3 hover:bg-orange-400 disabled:bg-neutral-2 disabled:text-neutral-3 text-white body-2-semibold py-2.5 rounded-full transition-colors"
              >
                Siguiente
              </button>
            )}
            {step === STEPS.length - 1 && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={submitting}
                className="flex-1 bg-primary-3 hover:bg-orange-400 disabled:opacity-60 text-white body-2-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Publicando...</>
                ) : 'Publicar en comunidad'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
