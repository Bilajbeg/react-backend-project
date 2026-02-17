import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GalleryGrid from "./components/GalleryGrid";
import PhotoModal from "./components/PhotoModal";
import Footer from "./components/Footer";

const photos = [
    {
        id: 1,
        title: "Nature Road",
        category: "Natur",
        year: "2025",
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2048&q=80",
        },
    },
    {
        id: 2,
        title: "City Geometry",
        category: "Architektur",
        year: "2025",
        src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=2048&q=80",
        },
    },
    {
        id: 3,
        title: "Portrait Mood",
        category: "Menschen",
        year: "2025",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2048&q=80",
        },
    },
    {
        id: 4,
        title: "Wildlife",
        category: "Tiere",
        year: "2025",
        src: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=2048&q=80",
        },
    },
    {
        id: 5,
        title: "Tech Geometry",
        category: "Technik",
        year: "2025",
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2048&q=80",
        },
    },
    {
        id: 6,
        title: "Art Abstract",
        category: "Kunst",
        year: "2025",
        src: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1600&q=80",
        sizes: {
            small: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=640&q=80",
            medium: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1280&q=80",
            large: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=2048&q=80",
        },
    },
];

export default function App() {
    const [selected, setSelected] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Alle");

    const categories = useMemo(
        () => ["Alle", "Natur", "Architektur", "Menschen", "Tiere", "Technik", "Kunst"],
        []
    );

    const filteredPhotos = useMemo(() => {
        if (activeCategory === "Alle") return photos;
        return photos.filter((p) => p.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />
            <Hero />

            <div className="max-w-7xl mx-auto px-6 py-10">
                <GalleryGrid photos={filteredPhotos} onSelect={setSelected} />
            </div>

            {selected && (
                <PhotoModal photo={selected} onClose={() => setSelected(null)} />
            )}

            <Footer />
        </div>
    );
}
