import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyLinkButton({ postId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/p/${postId}`;

  async function handleCopy() {
    try { await navigator.clipboard.writeText(url); }
    catch {
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
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar enlace"
      className={`flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
      }`}
    >
      {copied ? <><Check className="w-3.5 h-3.5" />Copiado</> : <><Copy className="w-3.5 h-3.5" />Copiar enlace</>}
    </button>
  );
}
