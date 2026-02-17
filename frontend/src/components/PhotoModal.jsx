import { useEffect, useMemo, useState } from "react";

export default function PhotoModal({ photo, onClose }) {
    const [open, setOpen] = useState(false);

    const options = useMemo(
        () => [
            { key: "small", label: "Klein (640px)", url: photo?.sizes?.small },
            { key: "medium", label: "Mittel (1280px)", url: photo?.sizes?.medium },
            { key: "large", label: "Groß (2048px)", url: photo?.sizes?.large },
        ],
        [photo]
    );

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const download = (url, filename) => {
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "photo.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setOpen(false);
    };

    if (!photo) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onMouseDown={(e) => {
                // Klick außerhalb schließen
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b">
                    <div>
                        <div className="text-lg font-semibold text-gray-900">{photo.title}</div>
                        <div className="text-sm text-gray-500">
                            {photo.category} · {photo.year}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100 transition"
                        aria-label="Schließen"
                        title="Schließen"
                    >
                        ✕
                    </button>
                </div>

                {/* Image */}
                <div className="p-6">
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={photo.src}
                            alt={photo.title}
                            className="w-full max-h-[70vh] object-contain bg-black/5"
                        />
                    </div>

                    {/* Footer area */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <div>
                                <b>Kategorie:</b> {photo.category}
                            </div>
                            <div>
                                <b>Jahr:</b> {photo.year}
                            </div>
                            <div className="mt-2 text-gray-400">
                                Tipp: ESC oder Klick außerhalb schließt das Fenster.
                            </div>
                        </div>

                        {/* Download dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setOpen((v) => !v)}
                                className="bg-black text-white px-5 py-3 rounded-xl shadow-sm hover:bg-gray-900 transition flex items-center gap-2"
                            >
                                Download <span className="text-xs">▲</span>
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white shadow-lg overflow-hidden">
                                    {options.map((o) => (
                                        <button
                                            key={o.key}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                                            onClick={() =>
                                                download(o.url, `${photo.title}-${o.key}.jpg`)
                                            }
                                        >
                                            <span>{o.label}</span>
                                            <span className="text-gray-400">→</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
