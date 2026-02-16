import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite DB im backend-Ordner
const dbPath = path.join(__dirname, "data.sqlite");
const db = new sqlite3.Database(dbPath);

// Tabelle + Beispieldaten
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
        if (err) return console.error(err);
        if (row.count === 0) {
            const stmt = db.prepare(
                "INSERT INTO products (name, price) VALUES (?, ?)"
            );
            stmt.run("Kaffee", 9.99);
            stmt.run("Tee", 5.49);
            stmt.run("Honig", 12.5);
            stmt.finalize();
        }
    });
});

// Test-Route
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
                price: numPrice
            });
        }
    );
});

// Root-Route (optional, nur Info)
app.get("/", (req, res) => {
    res.send("Backend läuft ✅ Nutze /api/health oder /api/products");
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend läuft auf http://localhost:${PORT}`);
});
