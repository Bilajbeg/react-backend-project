import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import multer from "multer";
import bcrypt from "bcrypt";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import csrf from "csurf";
import { fileURLToPath } from "url";
import db from "./db.js";

dotenv.config();

const app = express();

// --------------------------------------------------
// __dirname
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// Env / Flags
// --------------------------------------------------
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";

// Wenn du später hinter Nginx/Render/Proxy bist:
app.set("trust proxy", 1);

// --------------------------------------------------
// Security Headers
// --------------------------------------------------
app.use(
    helmet({
        // CSP ist in dev oft nervig (Vite/HMR). Später kannst du CSP sauber konfigurieren.
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

// --------------------------------------------------
// Body
// --------------------------------------------------
app.use(express.json());

// --------------------------------------------------
// CORS (nur DEV nötig, weil Frontend auf 5173 läuft)
// In PROD (One-Port) ist CORS nicht nötig.
// --------------------------------------------------
if (!isProd) {
    app.use(
        cors({
            origin: "http://localhost:5173",
            credentials: true,
        })
    );
}

// --------------------------------------------------
// Session Store (SQLite)
// --------------------------------------------------
const SQLiteStore = SQLiteStoreFactory(session);

app.use(
    session({
        store: new SQLiteStore({ db: "sessions.sqlite", dir: __dirname }),
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // lokal: false. Bei echtem HTTPS später true
            maxAge: 1000 * 60 * 60 * 8, // 8h
        },
    })
);

// --------------------------------------------------
// CSRF (session-basiert, NICHT localStorage)
// --------------------------------------------------
const csrfProtection = csrf(); // nutzt req.session

// CSRF nur für "unsafe" Requests aktivieren (POST/PATCH/DELETE)
// GET/HEAD/OPTIONS dürfen ohne Token laufen.
app.use((req, res, next) => {
    const m = req.method.toUpperCase();
    if (m === "GET" || m === "HEAD" || m === "OPTIONS") return next();
    return csrfProtection(req, res, next);
});

// Endpoint, damit Frontend ein Token holen kann:
app.get("/api/csrf", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// CSRF Fehler hübsch als JSON:
app.use((err, req, res, next) => {
    if (err && err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "CSRF token invalid/expired" });
    }
    next(err);
});

// --------------------------------------------------
// Upload Verzeichnisse
// --------------------------------------------------
const uploadRoot = path.join(__dirname, "uploads");
const originalDir = path.join(uploadRoot, "original");

[uploadRoot, originalDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --------------------------------------------------
// Multer
// --------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, originalDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const safeName = base.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        cb(null, `${Date.now()}_${safeName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Nur Bilder erlaubt"));
        cb(null, true);
    },
});

// --------------------------------------------------
// Admin middleware
// --------------------------------------------------
function requireAdmin(req, res, next) {
    if (req.session?.isAdmin) return next();
    return res.status(401).json({ error: "Unauthorized" });
}

// --------------------------------------------------
// Rate limit / slowdown fürs Login
// --------------------------------------------------
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Zu viele Login-Versuche. Bitte später erneut versuchen." },
});

const loginSlowdown = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 3,
    delayMs: () => 1000,
});

// --------------------------------------------------
// Auth Routes
// --------------------------------------------------
app.post("/api/auth/login", loginLimiter, loginSlowdown, async (req, res) => {
    const { username, password } = req.body || {};
    const ADMIN_USER = process.env.ADMIN_USER || "admin";
    const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || "";

    if (!username || !password) return res.status(400).json({ error: "Fehlende Daten" });
    if (username !== ADMIN_USER) return res.status(401).json({ error: "Login falsch" });

    const ok = await bcrypt.compare(password, ADMIN_PASS_HASH);
    if (!ok) return res.status(401).json({ error: "Login falsch" });

    req.session.isAdmin = true;
    req.session.username = username;

    res.json({ ok: true, username });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/auth/me", (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin, username: req.session?.username || null });
});

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.get("/api/photos", (req, res) => {
    db.all("SELECT * FROM photos ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });

        const mapped = rows.map((r) => ({
            ...r,
            src: `/uploads/original/${r.filename}`,
        }));

        res.json(mapped);
    });
});

app.post("/api/admin/upload", requireAdmin, upload.single("image"), (req, res) => {
    const { title, category, year } = req.body;

    if (!req.file) return res.status(400).json({ error: "Kein Bild hochgeladen" });
    if (!title || !category) return res.status(400).json({ error: "Titel & Kategorie erforderlich" });

    db.run(
        `INSERT INTO photos (title, category, year, filename, created_at) VALUES (?, ?, ?, ?, ?)`,
        [title, category, Number(year) || null, req.file.filename, createdAt],
        function (err) {
            if (err) return res.status(500).json({ error: "DB error" });

            res.status(201).json({
                id: this.lastID,
                title,
                category,
                year,
                filename: req.file.filename,
                url_original: `/uploads/original/${req.file.filename}`,
            });
        }
    );
});

app.patch("/api/admin/photos/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { title, category, year } = req.body || {};

    if (!id) return res.status(400).json({ error: "Ungültige ID" });
    if (!title || !category) return res.status(400).json({ error: "Titel & Kategorie erforderlich" });

    db.run(
        `UPDATE photos SET title = ?, category = ?, year = ? WHERE id = ?`,
        [title, category, Number(year) || null, id],
        function (err) {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ ok: true, id, title, category, year });
        }
    );
});

app.delete("/api/admin/photos/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Ungültige ID" });

    db.get("SELECT * FROM photos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!row) return res.status(404).json({ error: "Nicht gefunden" });

        const filePath = path.join(originalDir, row.filename);

        db.run("DELETE FROM photos WHERE id = ?", [id], (err2) => {
            if (err2) return res.status(500).json({ error: "DB error" });

            fs.unlink(filePath, () => {
                res.json({ ok: true, deletedId: id });
            });
        });
    });
});

// --------------------------------------------------
// Static: uploads
// --------------------------------------------------
app.use("/uploads", express.static(uploadRoot));

// --------------------------------------------------
// Production: serve frontend/dist + SPA fallback
// --------------------------------------------------
const frontendDist = path.join(__dirname, "..", "frontend", "dist");

if (isProd && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // SPA fallback (Express 5: Regex)
    app.get(/^(?!\/api\/)(?!\/uploads\/).*/, (req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("Backend läuft ✅ (DEV). Frontend: http://localhost:5173");
    });
}

// --------------------------------------------------
app.listen(PORT, () => {
    console.log(`✅ Backend läuft auf http://localhost:${PORT} (${isProd ? "PROD" : "DEV"})`);
});