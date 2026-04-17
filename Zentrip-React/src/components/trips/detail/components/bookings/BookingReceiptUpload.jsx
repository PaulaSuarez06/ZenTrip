import { useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { uploadImage, validateImageFile } from '../../../../../services/cloudinaryService';

export default function BookingReceiptUpload({ onUpload, label = 'Adjuntar captura de la reserva', optional = true }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const validationError = validateImageFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setUploaded(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setUploaded(true);
      onUpload?.(url);
    } catch (err) {
      setError(err?.message || 'No se pudo subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Image className="w-3.5 h-3.5 text-neutral-4" />
        <p className="body-3 font-semibold text-neutral-5">
          {label}
          {optional && <span className="ml-1 font-normal text-neutral-3">(opcional)</span>}
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors
            ${dragging ? 'border-secondary-3 bg-secondary-1/40' : 'border-neutral-2 hover:border-secondary-3 hover:bg-secondary-1/20'}`}
        >
          <Upload className="w-5 h-5 text-neutral-3 pointer-events-none" />
          <p className="body-3 text-neutral-4 text-center pointer-events-none">
            Arrastra aquí o <span className="text-secondary-3 font-medium">selecciona imagen</span>
          </p>
          <p className="text-[11px] text-neutral-3 pointer-events-none">JPG, PNG, WebP · máx. 5 MB</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-neutral-2 h-36">
          <img src={preview} alt="Captura de reserva" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral-7/30 flex items-center justify-center gap-2">
            {uploaded ? (
              <span className="px-3 py-1.5 bg-auxiliary-green-4 text-white body-3 font-semibold rounded-full">
                ✓ Subida correctamente
              </span>
            ) : (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-secondary-3 text-white body-3 font-semibold rounded-full hover:bg-secondary-4 transition disabled:opacity-60"
              >
                {uploading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subiendo…
                  </span>
                ) : 'Subir captura'}
              </button>
            )}
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-neutral-5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {error && <p className="body-3 text-feedback-error">{error}</p>}
    </div>
  );
}
