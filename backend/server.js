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
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 30,
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
        const collections = await mongoose.connection.db.listCollections().toArray();

        const pages = collections
            .map((collection) => collection.name)
            .filter(
                (name) =>
                    !name.startsWith("system.") &&
                    name !== "sessions" &&
                    name !== "adminusers"
            )
            .map((name) => ({ name }));

        res.json(pages);
    } catch (error) {
        console.error("❌ Collection listesi alınamadı:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/pages/:name", async (req, res) => {
    try {
        const collectionName = req.params.name;

        const doc = await mongoose.connection.db.collection(collectionName).findOne({});

        if (!doc) {
            return res.status(404).json({ error: "Bu collection içinde veri yok." });
        }

        res.json(doc);
    } catch (error) {
        console.error("❌ Sayfa detayı alınamadı:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put(
    "/api/pages/:name",
    adminAuthMiddleware,
    async (req, res) => {
        try {
            const collectionName = req.params.name;
            const { sections } = req.body;

            if (!Array.isArray(sections)) {
                return res.status(400).json({ error: "sections array olmalı." });
            }

            const collection = mongoose.connection.db.collection(collectionName);
            const existingDoc = await collection.findOne({});

            if (!existingDoc) {
                return res.status(404).json({ error: "Güncellenecek belge bulunamadı." });
            }

            const result = await collection.updateOne(
                { _id: existingDoc._id },
                { $set: { sections } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "Belge eşleşmedi." });
            }

            const updatedDoc = await collection.findOne({ _id: existingDoc._id });

            res.json({
                message: "Belge başarıyla güncellendi.",
                data: updatedDoc,
            });
        } catch (error) {
            console.error("❌ Güncelleme hatası:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

app.use("/api", titleSettingsRoutes);

app.use("/api/upload", uploadRoutes);
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
