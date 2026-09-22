import { ExternalLink, X } from "lucide-react";
import { getYouTubeEmbedUrl } from "../lib/youtube";

export function VideoModal({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-xl">
        <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
          <p className="truncate text-sm font-medium text-white">{title}</p>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-slate-800 text-slate-300">
            <p className="text-sm">No se puede previsualizar este enlace.</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
            >
              <ExternalLink size={14} /> Abrir enlace
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
