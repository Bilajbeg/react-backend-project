import { useEffect, useState } from "react";

export default function AdminUpload() {
    const [adminKey, setAdminKey] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Natur");
    const [year, setYear] = useState("2026");
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState(null);

    // ✅ AUTOMATISCHER REDIRECT NACH ERFOLG
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => {
                window.location.href = "/";
            }, 3000);

            return () => clearTimeout(t);
        }
    }, [success]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setResponse(null);

        if (!file) {
            setError("Bitte eine Bilddatei auswählen.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("year", year);
        formData.append("image", file);

        try {
            setLoading(true);

            const res = await fetch("http://localhost:3001/api/admin/upload", {
                method: "POST",
                headers: {
                    "x-admin-key": adminKey,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload fehlgeschlagen");
            }

            setSuccess(true);
            setResponse(data);

            // Formular optional zurücksetzen
            setTitle("");
            setFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-bold mb-2">Admin Upload</h1>
            <p className="text-gray-600 mb-8">
                Nur für den Fotografen: Bilder hochladen (geschützt via Admin-Key).
            </p>

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border bg-white p-6 space-y-5"
            >
                {/* Admin Key */}
                <div>
                    <label className="block text-sm font-medium mb-1">Admin-Key</label>
                    <input
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Wird im Header <code>x-admin-key</code> gesendet.
                    </p>
                </div>

                {/* Titel */}
                <div>
                    <label className="block text-sm font-medium mb-1">Titel</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="z.B. Sonnenuntergang am See"
                        className="w-full rounded-lg border px-3 py-2"
                    />
                </div>

                {/* Kategorie + Jahr */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kategorie</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option>Natur</option>
                            <option>Architektur</option>
                            <option>Menschen</option>
                            <option>Tiere</option>
                            <option>Technik</option>
                            <option>Kunst</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Jahr</label>
                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>
                </div>

                {/* Datei */}
                <div>
                    <label className="block text-sm font-medium mb-1">Bilddatei</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? "Upload läuft..." : "Upload starten"}
                </button>

                {/* Fehler */}
                {error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
                        {error}
                    </div>
                )}

                {/* Erfolg */}
                {success && (
                    <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-green-700">
                        ✅ Upload erfolgreich!
                        <div className="text-sm mt-1">
                            Du wirst in 3 Sekunden zur Galerie weitergeleitet…
                        </div>
                    </div>
                )}

                {/* Server-Antwort */}
                {response && (
                    <pre className="mt-4 rounded-lg bg-gray-100 p-3 text-xs overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
                )}
            </form>
        </div>
    );
}
