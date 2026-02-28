import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import GalleryGrid from "./components/GalleryGrid";
import PhotoModal from "./components/PhotoModal";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
    const navigate = useNavigate();

    // Photos
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

    // Gallery UI
    const [selected, setSelected] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Alle");

    // Auth (Session)
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdminAuthed, setIsAdminAuthed] = useState(false);

    const categories = useMemo(
        () => ["Alle", "Natur", "Architektur", "Menschen", "Tiere", "Technik", "Kunst"],
        []
    );

    // Nur filtern – Sortierung kommt vom Backend bereits richtig rein
    const filteredPhotos = useMemo(() => {
        return activeCategory === "Alle"
            ? photos
            : photos.filter((p) => p.category === activeCategory);
    }, [activeCategory, photos]);

    async function loadPhotos() {
        try {
            setLoading(true);
            const res = await fetch(`/api/photos?sort=${encodeURIComponent(sortOrder)}`);
            const data = await res.json();
            setPhotos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fehler beim Laden:", err);
        } finally {
            setLoading(false);
        }
    }

    async function checkMe() {
        try {
            setAuthLoading(true);
            const res = await fetch("/api/auth/me", { credentials: "include" });
            const data = await res.json();
            setIsAdminAuthed(!!data?.isAdmin);
        } catch {
            setIsAdminAuthed(false);
        } finally {
            setAuthLoading(false);
        }
    }

    async function logout() {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } finally {
            setIsAdminAuthed(false);
            navigate("/");
        }
    }

    // Fotos laden – beim Start UND wenn sortOrder wechselt
    useEffect(() => {
        loadPhotos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOrder]);

    useEffect(() => {
        checkMe();
    }, []);

    return (
        <Routes>
            {/* PUBLIC */}
            <Route
                path="/"
                element={
                    <PublicLayout
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        isAdminAuthed={isAdminAuthed}
                        onAdminClick={() => navigate("/admin")}
                        onLogout={logout}
                        sortOrder={sortOrder}
                        onChangeSortOrder={(val) => {
                            setSortOrder(val);
                            setSelected(null); // optional: Modal schließen beim Sortwechsel
                        }}
                    >
                        <div className="max-w-7xl mx-auto px-6 py-10 min-h-[40vh]">
                            {loading ? (
                                <div className="text-gray-500">Lade Fotos...</div>
                            ) : filteredPhotos.length === 0 ? (
                                <div className="rounded-2xl border bg-white p-8 text-center">
                                    <div className="text-xl font-semibold">Keine Fotos gefunden</div>
                                    <div className="text-gray-600 mt-2">
                                        In der Kategorie <b>{activeCategory}</b> gibt es aktuell keine Bilder.
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setActiveCategory("Alle")}
                                        className="mt-6 rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-900"
                                    >
                                        Zurück zu Alle
                                    </button>
                                </div>
                            ) : (
                                <GalleryGrid photos={filteredPhotos} onSelect={setSelected} />
                            )}
                        </div>

                        {selected && <PhotoModal photo={selected} onClose={() => setSelected(null)} />}
                    </PublicLayout>
                }
            />

            {/* ADMIN */}
            <Route
                path="/admin"
                element={
                    <AdminLayout
                        isAdminAuthed={isAdminAuthed}
                        onAdminClick={() => navigate("/admin")}
                        onLogout={logout}
                    >
                        {authLoading ? (
                            <div className="max-w-3xl mx-auto px-6 py-16 text-gray-500">
                                Prüfe Login...
                            </div>
                        ) : isAdminAuthed ? (
                            <AdminDashboard photos={photos} onReloadPhotos={loadPhotos} onLogout={logout} />
                        ) : (
                            <AdminLogin
                                onLoginSuccess={async () => {
                                    await checkMe();
                                    await loadPhotos();
                                    navigate("/admin");
                                }}
                            />
                        )}
                    </AdminLayout>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}