export default function Hero() {
    return (
        <section className="relative w-full h-[48vh] min-h-[360px]">
            <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80"
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />

            <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Capturing Moments
                </h1>

                <p className="text-lg md:text-xl text-gray-200">
                    Natur · Architektur · Menschen · Tiere · Technik · Kunst
                </p>
            </div>
        </section>
    );
}
