import { useMemo, useState } from "react";

const API_BASE = "http://localhost:3001";

export default function AdminUpload() {
    const categories = useMemo(
        () => ["Natur", "Architektur", "Menschen", "Tiere", "Technik", "Kunst"],
        []
    );

    const [adminKey, setAdminKey] = useState("ELVIS_ADMIN_2026");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Natur");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [file, setFile] = useState(null);

    const [status, setStatus] = useState({ type: "idle", message: "" });
    const [lastResult, setLastResult] = useState(null);

    async function handleUpload(e) {
        e.preventDefault();

        if (!file) {
            setStatus({ type: "error", message: "Bitte ein Bild auswählen." });
            return;
        }
        if (!title.trim()) {
            setStatus({ type: "error", message: "Bitte einen Titel eingeben." });
            return;
        }
        if (!adminKey.trim()) {
            setStatus({ type: "error", message: "Admin-Key fehlt." });
            return;
        }

        try {
            setStatus({ type: "loading", message: "Upload läuft..." });
            setLastResult(null);

            const form = new FormData();
            form.append("image", file); // muss zum Backend passen: upload.single("image")
            form.append("title", title.trim());
            form.append("category", category);
            form.append("year", year);

            const res = await fetch(`${API_BASE}/api/admin/upload`, {
                method: "POST",
                headers: {
                    "x-admin-key": adminKey.trim(),
                },
                body: form,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || `Upload fehlgeschlagen (HTTP ${res.status})`,
                });
                return;
            }

            setStatus({ type: "success", message: "✅ Upload erfolgreich!" });
            setLastResult(data);

            // reset file input
            setFile(null);
            // Titel optional leeren:
            setTitle("");
        } catch (err) {
            setStatus({
                type: "error",
                message: `Fehler: ${err?.message || "Unbekannt"}`,
            });
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <h2 className="text-2xl font-bold text-gray-900">Admin Upload</h2>
            <p className="text-gray-600 mt-2">
                Nur für den Fotografen: Bilder hochladen (geschützt via Admin-Key).
            </p>

            <form
                onSubmit={handleUpload}
                className="mt-6 rounded-2xl bg-white shadow-sm border p-6 space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Admin-Key
                    </label>
                    <input
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="ELVIS_ADMIN_2026"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Wird im Header <code>x-admin-key</code> gesendet.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Titel</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="z.B. Sonnenuntergang am See"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Kategorie
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jahr</label>
                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="2026"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Bilddatei
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status.type === "loading"}
                    className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition disabled:opacity-60"
                >
                    {status.type === "loading" ? "Upload..." : "Upload starten"}
                </button>

                {status.type !== "idle" && (
                    <div
                        className={`rounded-xl px-4 py-3 text-sm ${
                            status.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : status.type === "error"
                                    ? "bg-red-50 text-red-800 border border-red-200"
                                    : "bg-gray-50 text-gray-800 border"
                        }`}
                    >
                        {status.message}
                    </div>
                )}

                {lastResult && (
                    <div className="rounded-xl border bg-gray-50 p-4 text-sm">
                        <div className="font-semibold text-gray-900">Server Antwort:</div>
                        <pre className="mt-2 overflow-auto">{JSON.stringify(lastResult, null, 2)}</pre>
                        {lastResult?.filename && (
                            <div className="mt-3">
                                <a
                                    className="underline"
                                    href={`${API_BASE}/uploads/original/${lastResult.filename}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Bild öffnen (original)
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}


