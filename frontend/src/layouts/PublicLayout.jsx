import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

export default function PublicLayout({
                                         categories,
                                         activeCategory,
                                         onSelectCategory,
                                         isAdminAuthed,
                                         onAdminClick,
                                         onLogout,
                                         sortOrder,          // NEU
                                         onChangeSortOrder,  // NEU
                                         children,
                                     }) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={onSelectCategory}
                isAdminAuthed={isAdminAuthed}
                onAdminClick={onAdminClick}
                onLogout={onLogout}
                mode="public"
            />

            <Hero />

            {/* Sort Filter (Public) */}
            <div className="w-full px-6 mt-4">
                <div className="max-w-7xl mx-auto flex items-center justify-end gap-2">
                    <label className="text-sm text-gray-600">Sortieren:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => onChangeSortOrder(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value="newest">Neueste zuerst</option>
                        <option value="oldest">Älteste zuerst</option>
                    </select>
                </div>
            </div>

            {/* wichtig: flex-1 + full width */}
            <main className="flex-1 w-full">{children}</main>

            {/* wichtig: mt-auto sorgt dafür, dass Footer nach unten gedrückt wird */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}