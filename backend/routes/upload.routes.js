import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// routes klasöründen çık -> backend'e çık -> frontend/public/images'e git
const imagesDir = path.resolve(__dirname, "../../frontend/public/images");

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const normalizeTurkish = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-");

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, imagesDir);
    },
    filename: (_req, file, cb) => {
        const originalName = normalizeTurkish(file.originalname);
        cb(null, originalName);
    },
});

const fileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Sadece görsel yükleyebilirsin."));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
});

router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Dosya bulunamadı." });
        }

        return res.status(200).json({
            message: "Dosya yüklendi.",
            path: `/images/${req.file.filename}`,
        });
    } catch (error) {
        console.error("Upload route error:", error);
        return res.status(500).json({ error: "Dosya yüklenemedi." });
    }
});

export default router;