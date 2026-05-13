import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function ImageLightbox({ photos, index, onClose, onChange }) {
  const total = photos.length;
  const prev = () => onChange((index - 1 + total) % total);
  const next = () => onChange((index + 1) % total);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && total > 1) prev();
      if (e.key === 'ArrowRight' && total > 1) next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, total]);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-neutral-7/92 backdrop-blur-sm" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4 p-4" onClick={(e) => e.stopPropagation()}>

        {/* Imagen principal */}
        <img
          src={photos[index]}
          alt={`Foto ${index + 1}`}
          className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
        />

        {/* Miniaturas */}
        {total > 1 && (
          <div className="flex gap-2 justify-center flex-wrap max-w-lg">
            {photos.map((url, i) => (
              <button
                key={i}
                onClick={() => onChange(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${i === index ? 'border-white' : 'border-transparent opacity-40 hover:opacity-70'}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-7/70 text-white flex items-center justify-center hover:bg-neutral-7 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Abrir en nueva pestaña */}
        <a
          href={photos[index]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-16 w-10 h-10 rounded-full bg-neutral-7/70 text-white flex items-center justify-center hover:bg-neutral-7 transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-7/70 text-white flex items-center justify-center hover:bg-neutral-7 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next */}
        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-7/70 text-white flex items-center justify-center hover:bg-neutral-7 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Contador */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-7/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none">
            {index + 1} / {total}
          </div>
        )}
      </div>
    </div>
  );
}
