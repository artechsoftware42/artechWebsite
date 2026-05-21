import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";

import mailRoutes from "./routes/mail.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminAuthMiddleware from "./middleware/adminAuthMiddleware.js";
import titleSettingsRoutes from "./routes/titleSettingsRoutes.js";
import uploadRoutes from "./routes/upload.routes.js";
import path from "path";
import Page from "./models/Page.js";

const app = express();

const uri = process.env.MONGO_URI;
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

const allowedOrigins = [
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("CORS hatası: origin izinli değil"));
        },
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use(
    session({
        name: "admin_sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: uri,
            collectionName: "sessions",
        }),
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 1000 * 60 * 10,
        },
    })
);

app.use("/api/mail", mailRoutes);
app.use("/api/admin-auth", adminAuthRoutes);

mongoose
    .connect(uri)
    .then(() => {
        console.log("✅ MongoDB Atlas'a bağlandı");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB bağlantı hatası:", err.message);
    });

app.get("/api/pages", async (req, res) => {
    try {
        const pages = await Page.find({}, { pageKey: 1, title: 1, _id: 0 }).sort({
            pageKey: 1,
        });

        res.json(
            pages.map((page) => ({
                name: page.pageKey,
                title: page.title || page.pageKey,
            }))
        );
    } catch (error) {
        console.error("❌ Sayfa listesi alınamadı:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/pages/:pageKey", async (req, res) => {
    try {
        const { pageKey } = req.params;

        const doc = await Page.findOne({ pageKey });

        if (!doc) {
            return res.status(404).json({
                error: `${pageKey} pageKey değerine sahip veri bulunamadı.`,
            });
        }

        res.json(doc);
    } catch (error) {
        console.error("❌ Sayfa detayı alınamadı:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put("/api/pages/:pageKey", adminAuthMiddleware, async (req, res) => {
    try {
        const { pageKey } = req.params;
        const { sections } = req.body;

        if (!Array.isArray(sections)) {
            return res.status(400).json({ error: "sections array olmalı." });
        }

        const updatedDoc = await Page.findOneAndUpdate(
            { pageKey },
            { $set: { sections } },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({
                error: `${pageKey} pageKey değerine sahip güncellenecek belge bulunamadı.`,
            });
        }

        res.json({
            message: "Belge başarıyla güncellendi.",
            data: updatedDoc,
        });
    } catch (error) {
        console.error("❌ Güncelleme hatası:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.use("/api", titleSettingsRoutes);

app.use("/api/upload", uploadRoutes);
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
