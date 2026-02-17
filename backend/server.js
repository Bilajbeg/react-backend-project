import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

// --------------------------------------------------
// Setup
// --------------------------------------------------
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// Admin-Key (ENV)
// --------------------------------------------------
const ADMIN_KEY = process.env.ADMIN_KEY || "dev-secret-key";

// --------------------------------------------------
// Upload-Verzeichnisse
// --------------------------------------------------
const uploadRoot = path.join(__dirname, "uploads");
const originalDir = path.join(uploadRoot, "original");

// Ordner sicherstellen
[uploadRoot, originalDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --------------------------------------------------
// Multer Konfiguration
// --------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, originalDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const safeName = base.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        cb(null, `${Date.now()}_${safeName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Nur Bilder erlaubt"));
        }
        cb(null, true);
    },
});

// --------------------------------------------------
// SQLite DB
// --------------------------------------------------
const dbPath = path.join(__dirname, "data.sqlite");
const db = new sqlite3.Database(dbPath);

// Tabellen
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      year INTEGER,
      filename TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// --------------------------------------------------
// Middleware: Admin-Key prüfen
// --------------------------------------------------
function requireAdmin(req, res, next) {
    const key = req.headers["x-admin-key"];
    if (!key || key !== ADMIN_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

// --------------------------------------------------
// Routes
// --------------------------------------------------

// Health
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "Backend läuft" });
});

// Produkte holen
app.get("/api/products", (req, res) => {
    db.all("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json(rows);
    });
});

// Produkt anlegen
app.post("/api/products", (req, res) => {
    const { name, price } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: "Name zu kurz" });
    }

    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: "Preis ungültig" });
    }

    db.run(
        "INSERT INTO products (name, price) VALUES (?, ?)",
        [name.trim(), numPrice],
        function (err) {
            if (err) return res.status(500).json({ error: "DB error" });
            res.status(201).json({
                id: this.lastID,
                name: name.trim(),
                price: numPrice,
            });
        }
    );
});

// --------------------------------------------------
// 🔐 Admin Upload Route
// --------------------------------------------------
app.post(
    "/api/admin/upload",
    requireAdmin,
    upload.single("image"),
    (req, res) => {
        const { title, category, year } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Kein Bild hochgeladen" });
        }

        if (!title || !category) {
            return res.status(400).json({ error: "Titel & Kategorie erforderlich" });
        }

        db.run(
            `
      INSERT INTO photos (title, category, year, filename)
      VALUES (?, ?, ?, ?)
    `,
            [title, category, Number(year) || null, req.file.filename],
            function (err) {
                if (err) return res.status(500).json({ error: "DB error" });

                res.status(201).json({
                    id: this.lastID,
                    title,
                    category,
                    year,
                    filename: req.file.filename,
                });
            }
        );
    }
);

// --------------------------------------------------
// Bilder & Uploads öffentlich machen
// --------------------------------------------------
app.use("/uploads", express.static(uploadRoot));

// Root
app.get("/", (req, res) => {
    res.send("Backend läuft ✅ Nutze /api/health");
});

// --------------------------------------------------
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend läuft auf http://localhost:${PORT}`);
});
