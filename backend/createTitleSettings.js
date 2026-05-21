import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, ".env"),
});

const EXCLUDED_COLLECTIONS = new Set([
    "adminusers",
    "sessions",
    "TitleSettings",
]);

const prettifyLabel = (text = "") => {
    return String(text)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (str) => str.toUpperCase());
};

const getPageName = (doc, fallbackCollectionName = "") => {
    if (doc?.name && String(doc.name).trim()) return doc.name;

    if (doc?.sections?.[0]?.name && String(doc.sections[0].name).trim()) {
        return doc.sections[0].name;
    }

    return fallbackCollectionName || null;
};

const pushUnique = (arr, item, seen) => {
    if (!item?.key) return;
    if (seen.has(item.key)) return;
    seen.add(item.key);
    arr.push(item);
};

const buildTitleSettingsDoc = (docs) => {
    const pagesSection = { name: "pages", contents: [] };
    const sectionsSection = { name: "sections", contents: [] };
    const fieldsSection = { name: "fields", contents: [] };

    const seenPages = new Set();
    const seenSections = new Set();
    const seenFields = new Set();

    for (const rawDoc of docs) {
        const pageName = getPageName(rawDoc.doc, rawDoc.collectionName);

        if (!pageName || pageName === "TitleSettings") continue;

        pushUnique(
            pagesSection.contents,
            {
                key: pageName,
                value: {
                    tr: prettifyLabel(pageName),
                    en: prettifyLabel(pageName),
                },
            },
            seenPages
        );

        for (const section of rawDoc.doc.sections || []) {
            if (!section?.name) continue;

            pushUnique(
                sectionsSection.contents,
                {
                    key: `${pageName}::${section.name}`,
                    value: {
                        tr: prettifyLabel(section.name),
                        en: prettifyLabel(section.name),
                    },
                },
                seenSections
            );

            for (const content of section.contents || []) {
                if (!content?.key) continue;

                pushUnique(
                    fieldsSection.contents,
                    {
                        key: `${pageName}::${section.name}::${content.key}`,
                        value: {
                            tr: prettifyLabel(content.key),
                            en: prettifyLabel(content.key),
                        },
                    },
                    seenFields
                );
            }
        }
    }

    return {
        name: "TitleSettings",
        sections: [pagesSection, sectionsSection, fieldsSection],
    };
};

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error(".env içinde MONGODB_URI veya MONGO_URI bulunamadı.");
        }

        await mongoose.connect(mongoUri);

        const db = mongoose.connection.db;

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        console.log("Collection listesi:", collectionNames);

        const targetCollections = collectionNames.filter(
            (name) => !EXCLUDED_COLLECTIONS.has(name)
        );

        const allDocs = [];

        for (const collectionName of targetCollections) {
            const docs = await db.collection(collectionName).find({}).toArray();

            console.log(`${collectionName} -> ${docs.length} doküman`);

            docs.forEach((doc) => {
                allDocs.push({
                    collectionName,
                    doc,
                });
            });
        }

        console.log("Toplam toplanan doküman sayısı:", allDocs.length);

        const titleSettingsDoc = buildTitleSettingsDoc(allDocs);

        console.log(
            "Pages count:",
            titleSettingsDoc.sections.find((s) => s.name === "pages")?.contents.length || 0
        );
        console.log(
            "Sections count:",
            titleSettingsDoc.sections.find((s) => s.name === "sections")?.contents.length || 0
        );
        console.log(
            "Fields count:",
            titleSettingsDoc.sections.find((s) => s.name === "fields")?.contents.length || 0
        );

        await db.collection("TitleSettings").updateOne(
            { name: "TitleSettings" },
            { $set: titleSettingsDoc },
            { upsert: true }
        );

        console.log("TitleSettings oluşturuldu / güncellendi.");
        process.exit(0);
    } catch (error) {
        console.error("Hata:", error);
        process.exit(1);
    }
};

run();