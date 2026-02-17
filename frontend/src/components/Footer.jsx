export default function Footer() {
    return (
        <footer className="mt-12 bg-black text-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-3">
                <div>
                    <div className="text-white text-lg font-semibold">Elvis Photosite</div>
                    <p className="mt-2 text-sm text-gray-400">
                        Fotografie-Portfolio mit Kategorien, Modal-Ansicht und Download in
                        mehreren Größen.
                    </p>
                </div>

                <div>
                    <div className="text-white font-semibold">Kontakt</div>
                    <p className="mt-2 text-sm text-gray-400">
                        Wien, Österreich <br />
                        E-Mail: example@email.com <br />
                        Telefon: +43 ...
                    </p>
                </div>

                <div>
                    <div className="text-white font-semibold">Info</div>
                    <p className="mt-2 text-sm text-gray-400">
                        © {new Date().getFullYear()} Elvis Photosite. Alle Rechte vorbehalten.
                    </p>
                </div>
            </div>
        </footer>
    );
}
