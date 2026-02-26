import { useEffect, useMemo, useState } from "react";
import useCsrf from "../hooks/useCsrf";
import { apiFetch, fetchCsrfToken } from "../lib/api";

const CATEGORIES = ["Natur", "Architektur", "Menschen", "Tiere", "Technik", "Kunst"];

export default function AdminDashboard({ photos, onReloadPhotos, onLogout }) {
    // CSRF (für Upload/Edit/Delete/Logout)
    const { loading: csrfLoading, error: csrfError } = useCsrf(true);

    // ----------------------------
    // Upload state
    // ----------------------------
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Natur");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [file, setFile] = useState(null);

    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");

    // ----------------------------
    // Delete state
    // ----------------------------
    const [deletingId, setDeletingId] = useState(null);

    // ----------------------------
    // Edit state
    // ----------------------------
    const [editing, setEditing] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("Natur");
    const [editYear, setEditYear] = useState("");
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [reloading, setReloading] = useState(false);
    // ----------------------------
    // UI state
    // ----------------------------
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (typeof onReloadPhotos === "function") onReloadPhotos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return photos || [];
        return (photos || []).filter((p) => {
            const t = (p.title || "").toLowerCase();
            const c = (p.category || "").toLowerCase();
            const y = String(p.year ?? "").toLowerCase();
            return t.includes(q) || c.includes(q) || y.includes(q) || String(p.id).includes(q);
        });
    }, [photos, query]);

    // ----------------------------
    // Helpers
    // ----------------------------
    async function handleLogout() {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } finally {
            onLogout?.();
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        setUploadError("");
        setUploadSuccess("");

        if (!file) return setUploadError("Bitte eine Bilddatei auswählen.");
        if (!title.trim()) return setUploadError("Bitte einen Titel eingeben.");
        if (!category) return setUploadError("Bitte eine Kategorie wählen.");

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("category", category);
        formData.append("year", year);
        formData.append("image", file);

        try {
            setUploadLoading(true);

            // apiFetch kann FormData – aber wir schicken keinen Content-Type manuell!
            await apiFetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            setUploadSuccess("✅ Upload erfolgreich!");
            setTitle("");
            setFile(null);

            await onReloadPhotos?.();
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploadLoading(false);
        }
    }

    async function handleDelete(photo) {
        if (!photo?.id) return;

        const ok = window.confirm(
            `Wirklich löschen?\n\n#${photo.id} – ${photo.title}\n(${photo.category}${photo.year ? " · " + photo.year : ""})`
        );
        if (!ok) return;

        try {
            setDeletingId(photo.id);
            await apiFetch(`/api/admin/photos/${photo.id}`, { method: "DELETE" });
            await onReloadPhotos?.();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    function openEdit(photo) {
        setEditing(photo);
        setEditTitle(photo?.title || "");
        setEditCategory(photo?.category || "Natur");
        setEditYear(photo?.year != null ? String(photo.year) : "");
        setEditError("");
    }

    function closeEdit() {
        setEditing(null);
        setEditSaving(false);
        setEditError("");
    }

    async function saveEdit(e) {
        e.preventDefault();
        if (!editing?.id) return;

        setEditError("");

        const t = editTitle.trim();
        if (!t) return setEditError("Titel darf nicht leer sein.");
        if (!editCategory) return setEditError("Kategorie erforderlich.");

        try {
            setEditSaving(true);

            await apiFetch(`/api/admin/photos/${editing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: t,
                    category: editCategory,
                    year: editYear ? Number(editYear) : null,
                }),
            });

            closeEdit();
            await onReloadPhotos?.();
        } catch (err) {
            setEditError(err.message);
        } finally {
            setEditSaving(false);
        }
    }

    // Falls CSRF mal abläuft/neu nötig ist (optional Button)
    async function refreshCsrf() {
        try {
            await fetchCsrfToken();
            alert("CSRF Token aktualisiert ✅");
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Upload, Bearbeiten und Löschen von Fotos (Session + CSRF).</p>

                    {csrfLoading && <div className="text-sm text-gray-500 mt-2">Sicherheits-Token wird geladen…</div>}
                    {csrfError && <div className="text-sm text-red-600 mt-2">{csrfError}</div>}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            try {
                                setReloading(true);
                                await onReloadPhotos?.();
                            } finally {
                                setReloading(false);
                            }
                        }}
                        className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                        type="button"
                        disabled={reloading}
                    >
                        {reloading ? "Aktualisiere..." : "↻ Aktualisieren"}
                    </button>

                    <button
                        onClick={async () => {
                            await refreshCsrf();
                            alert("CSRF Token erneuert ✅");
                        }}
                        className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                        type="button"
                        disabled={csrfLoading}
                    >
                        {csrfLoading ? "..." : "CSRF neu"}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
                        type="button"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Upload */}
            <div className="mt-8 rounded-2xl border bg-white p-6">
                <h2 className="text-xl font-semibold mb-4">Neues Foto hochladen</h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Titel</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="z.B. Sonnenuntergang am See"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Kategorie</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Jahr</label>
                            <input
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="2026"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Bilddatei</label>

                            <div className="flex items-center gap-3">
                                <label
                                    className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                    Durchsuchen…
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </label>

                                <div className="text-sm text-gray-600 truncate">
                                    {file ? file.name : "Keine Datei ausgewählt"}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploadLoading || csrfLoading}
                            className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {uploadLoading ? "Upload läuft..." : "Upload starten"}
                        </button>
                    </div>

                    {uploadError && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">{uploadError}</div>
                    )}
                    {uploadSuccess && (
                        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-green-700">{uploadSuccess}</div>
                    )}
                </form>
            </div>

            {/* List header */}
            <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-xl font-semibold">
                    Vorhandene Fotos <span className="text-gray-400">({filtered.length})</span>
                </h2>

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full md:w-96 rounded-lg border px-3 py-2"
                    placeholder="Suchen (Titel, Kategorie, Jahr, ID)..."
                />
            </div>

            {/* Grid */}
            <div className="mt-4 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                    <div key={p.id} className="rounded-2xl border bg-white overflow-hidden">
                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                            <img
                                src={p.src}
                                alt={p.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=Bild+nicht+verf%C3%BCgbar";
                                }}
                            />
                        </div>

                        <div className="p-4">
                            <div className="font-semibold text-gray-900 truncate" title={p.title}>
                                {p.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                #{p.id} · {p.category}
                                {p.year ? ` · ${p.year}` : ""}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEdit(p)}
                                    className="flex-1 rounded-lg border px-3 py-2 hover:bg-gray-50"
                                >
                                    Bearbeiten
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(p)}
                                    disabled={deletingId === p.id || csrfLoading}
                                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletingId === p.id ? "Lösche..." : "Löschen"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && <div className="col-span-full text-gray-500 mt-6">Keine Fotos gefunden.</div>}
            </div>

            {/* Edit Modal */}
            {editing && (
                <div
                    className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeEdit();
                    }}
                >
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <div className="text-lg font-semibold">Foto bearbeiten</div>
                                <div className="text-sm text-gray-500">#{editing.id}</div>
                            </div>
                            <button type="button" onClick={closeEdit} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Schließen">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={saveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titel</label>
                                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kategorie</label>
                                    <select
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Jahr</label>
                                    <input value={editYear} onChange={(e) => setEditYear(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="z.B. 2026" />
                                </div>
                            </div>

                            {editError && (
                                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">{editError}</div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={closeEdit} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                                    Abbrechen
                                </button>

                                <button
                                    type="submit"
                                    disabled={editSaving || csrfLoading}
                                    className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
                                >
                                    {editSaving ? "Speichere..." : "Speichern"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}