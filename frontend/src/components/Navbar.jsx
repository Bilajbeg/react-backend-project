export default function Navbar({ categories, activeCategory, onSelectCategory }) {
    return (
        <nav className="sticky top-0 z-50 bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <a href="/" className="text-2xl font-semibold tracking-wide">
                    Elvis Photosite
                </a>

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
            </div>
        </nav>
    );
}
