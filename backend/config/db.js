import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const uri =
    "mongodb://Admin:admin000@ac-pdfiens-shard-00-00.enppv4j.mongodb.net:27017,ac-pdfiens-shard-00-01.enppv4j.mongodb.net:27017,ac-pdfiens-shard-00-02.enppv4j.mongodb.net:27017/websiteCMS?ssl=true&replicaSet=atlas-8yzfuv-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(uri)
    .then(() => {
        console.log("✅ MongoDB Atlas'a başarıyla bağlandı");
    })
    .catch((err) => {
        console.log("❌ Bağlantı hatası:", err.message);
    });

// 1) Tüm collection isimlerini getir
app.get("/api/pages", async (req, res) => {
    try {
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();

        const filtered = collections
            .map((c) => c.name)
            .filter((name) => !name.startsWith("system."));

        res.json(filtered.map((name) => ({ name })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2) Seçilen collection içindeki ilk document'i getir
app.get("/api/pages/:name", async (req, res) => {
    try {
        const collectionName = req.params.name;

        const doc = await mongoose.connection.db
            .collection(collectionName)
            .findOne({});

        if (!doc) {
            return res.status(404).json({ error: "Bu collection içinde veri yok." });
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log("🚀 Server 5000 portunda çalışıyor");
});