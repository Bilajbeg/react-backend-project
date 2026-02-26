import Navbar from "../components/Navbar";

export default function AdminLayout({
                                        isAdminAuthed,
                                        onAdminClick,
                                        onLogout,
                                        children,
                                    }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar
                categories={[]}
                activeCategory=""
                onSelectCategory={() => {}}
                isAdminAuthed={isAdminAuthed}
                onAdminClick={onAdminClick}
                onLogout={onLogout}
                mode="admin"
            />

            <main className="flex-1">{children}</main>
        </div>
    );
}