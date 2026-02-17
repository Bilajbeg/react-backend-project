import PhotoCard from "./PhotoCard";

export default function GalleryGrid({ photos, onSelect }) {
    return (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {photos.map((p) => (
                <PhotoCard key={p.id} photo={p} onClick={() => onSelect(p)} />
            ))}
        </div>
    );
}
