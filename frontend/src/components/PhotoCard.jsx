export default function PhotoCard({ photo, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group text-left rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            title={photo.title}
        >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://via.placeholder.com/800x600?text=Bild+nicht+verf%C3%BCgbar";
                    }}
                />
            </div>

            <div className="p-3">
                <div className="font-medium text-gray-900 truncate">
                    {photo.title}
                </div>
                <div className="text-sm text-gray-600">
                    {photo.category} · {photo.year}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {photo.created_at ? new Date(photo.created_at).toLocaleString() : ""}
                </div>
            </div>
        </button>
    );
}
