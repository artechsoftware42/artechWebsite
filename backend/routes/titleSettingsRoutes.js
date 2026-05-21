import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/*
  Bu route TitleSettings sekmesinde görünen gerçek collection verilerini döndürür.
  Her collection içinde ilk dokümanı alır.
  İstemediğimiz collection'ları dışarıda bırakıyoruz.
*/
router.get("/title-settings", async (req, res) => {
    try {
        const db = mongoose.connection.db;

        const excludedCollections = new Set([
            "adminusers",
            "sessions",
        ]);

        const collections = await db.listCollections().toArray();
        const collectionNames = collections
            .map((c) => c.name)
            .filter((name) => !excludedCollections.has(name));

        const result = [];

        for (const collectionName of collectionNames) {
            const doc = await db.collection(collectionName).findOne({});

            if (!doc) continue;

            result.push({
                collectionName,
                doc,
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("TitleSettings verileri alınamadı:", error);
        res.status(500).json({
            error: "TitleSettings verileri alınamadı.",
        });
    }
});

/*
  Bu route gerçek collection içindeki dokümanı günceller.
  Yani artık ayrı bir TitleSettings collection'ına değil,
  doğrudan örn: Projects / About / Hero collection'ına yazar.

  Beklenen body örneği:
  {
    "name": "Projects",
    "sections": [...]
  }

  Eğer collection adını da değiştirmek istersen:
  {
    "name": "ProjectsNew",
    "sections": [...],
    "renameCollectionTo": "ProjectsNew"
  }
*/
router.put("/title-settings/:collectionName", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const { collectionName } = req.params;
        const { name, sections, renameCollectionTo } = req.body;

        const collection = db.collection(collectionName);
        const existingDoc = await collection.findOne({});

        if (!existingDoc) {
            return res.status(404).json({
                error: "Collection içinde güncellenecek doküman bulunamadı.",
            });
        }

        await collection.updateOne(
            { _id: existingDoc._id },
            {
                $set: {
                    ...(typeof name !== "undefined" ? { name } : {}),
                    ...(Array.isArray(sections) ? { sections } : {}),
                },
            }
        );

        let finalCollectionName = collectionName;

        // İstersen collection adını da gerçekten değiştirir
        if (
            renameCollectionTo &&
            typeof renameCollectionTo === "string" &&
            renameCollectionTo.trim() &&
            renameCollectionTo !== collectionName
        ) {
            const allCollections = await db.listCollections().toArray();
            const exists = allCollections.some(
                (c) => c.name === renameCollectionTo
            );

            if (exists) {
                return res.status(400).json({
                    error: `"${renameCollectionTo}" isminde başka bir collection zaten var.`,
                });
            }

            await collection.rename(renameCollectionTo);
            finalCollectionName = renameCollectionTo;
        }

        const updatedDoc = await db.collection(finalCollectionName).findOne({});

        res.status(200).json({
            success: true,
            collectionName: finalCollectionName,
            data: updatedDoc,
        });
    } catch (error) {
        console.error("Collection güncellenemedi:", error);
        res.status(500).json({
            error: "Collection güncellenemedi.",
        });
    }
});

export default router;