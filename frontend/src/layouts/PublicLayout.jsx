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

            {/* wichtig: flex-1 + full width */}
            <main className="flex-1 w-full">{children}</main>

            {/* wichtig: mt-auto sorgt dafür, dass Footer nach unten gedrückt wird */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}