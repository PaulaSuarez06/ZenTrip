import { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Folder } from 'lucide-react';

export default function GaleriaTab({ photos }) {
  const folderNames = useMemo(
    () => [...new Set(photos.map((p) => p.folderName || ''))],
    [photos]
  );

  const showFolders = folderNames.length > 1 || (folderNames.length === 1 && folderNames[0] !== '');

  const [selectedFolder, setSelectedFolder] = useState('__all__');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const visiblePhotos = useMemo(
    () => selectedFolder === '__all__' ? photos : photos.filter((p) => (p.folderName || '') === selectedFolder),
    [photos, selectedFolder]
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1));
      if (e.key === 'ArrowLeft')  setLightboxIdx((i) => Math.max(i - 1, 0));
      if (e.key === 'Escape')     setLightboxIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, visiblePhotos.length]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-neutral-4" />
        <p className="body-bold text-secondary-5">Galería del viaje</p>
        <span className="body-3 text-neutral-3">({photos.length} foto{photos.length !== 1 ? 's' : ''})</span>
      </div>

      {showFolders && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedFolder('__all__')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
              selectedFolder === '__all__'
                ? 'bg-primary-1 text-primary-4 border-primary-2'
                : 'bg-white text-neutral-5 border-neutral-2 hover:bg-neutral-1'
            }`}
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
            Todas
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              selectedFolder === '__all__' ? 'bg-primary-2 text-primary-5' : 'bg-neutral-1 text-neutral-4'
            }`}>{photos.length}</span>
          </button>
          {folderNames.map((folder) => {
            const count = photos.filter((p) => (p.folderName || '') === folder).length;
            const isActive = selectedFolder === folder;
            return (
              <button
                key={folder || '__none__'}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                  isActive
                    ? 'bg-primary-1 text-primary-4 border-primary-2'
                    : 'bg-white text-neutral-5 border-neutral-2 hover:bg-neutral-1'
                }`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0" />
                {folder || 'General'}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isActive ? 'bg-primary-2 text-primary-5' : 'bg-neutral-1 text-neutral-4'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visiblePhotos.map((photo, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group"
            onClick={() => setLightboxIdx(i)}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 flex flex-col p-3 sm:p-4" onClick={() => setLightboxIdx(null)}>
          <div className="absolute inset-0 bg-neutral-7/80 backdrop-blur-sm" />
          <div className="relative z-10 flex items-center justify-between mb-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs">{lightboxIdx + 1} / {visiblePhotos.length}</p>
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
            <img
              src={visiblePhotos[lightboxIdx].url}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxIdx((i) => Math.max(i - 1, 0))}
              disabled={lightboxIdx === 0}
              className="absolute left-1 sm:left-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1))}
              disabled={lightboxIdx === visiblePhotos.length - 1}
              className="absolute right-1 sm:right-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
