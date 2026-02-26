export default function Navbar({
                                   categories,
                                   activeCategory,
                                   onSelectCategory,
                                   isAdminAuthed,
                                   onLogout,
                                   onAdminClick,
                                   mode = "public", // "public" | "admin"
                               }) {
    return (
        <nav className="sticky top-0 z-50 bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="text-2xl font-semibold tracking-wide">
                    {mode === "admin" ? "Admin Panel" : "Elvis Photosite"}
                </a>

                {/* Kategorien nur im Public */}
                {mode === "public" && (
                    <ul className="hidden md:flex gap-7 text-base uppercase tracking-wider">
                        {categories.map((c) => (
                            <li
                                key={c}
                                onClick={() => onSelectCategory(c)}
                                className={`cursor-pointer transition hover:text-gray-300 ${
                                    activeCategory === c ? "text-white" : "text-gray-200"
                                }`}
                            >
                                {c}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Admin Buttons */}
                <div className="flex items-center gap-3">
                    {isAdminAuthed ? (
                        <>
                            <button
                                onClick={onAdminClick}
                                className="rounded-lg border border-white/30 px-3 py-1 text-sm hover:bg-white/10"
                                type="button"
                            >
                                Dashboard
                            </button>

                            <button
                                onClick={onLogout}
                                className="rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                                type="button"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onAdminClick}
                            className="rounded-lg border border-white/30 px-3 py-1 text-sm hover:bg-white/10"
                            type="button"
                        >
                            Admin
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}