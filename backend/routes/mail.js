import express from "express";
import { sendContactMail, sendCareerMail, sendOfferMail } from "../specials/mailSender.js";
import multer from "multer";

const router = express.Router();

/* =========================
   RATE LIMIT STORAGE
========================= */
const rateLimitStore = {
    contact: new Map(),
    career: new Map(),
};

/* =========================
   RATE LIMIT FUNCTION
========================= */
const checkRateLimit = (store, ip) => {
    const now = Date.now();

    if (!store.has(ip)) {
        store.set(ip, []);
        return { allowed: true };
    }

    const timestamps = store.get(ip);

    const tenMinutesAgo = now - 10 * 60 * 1000;
    const recentRequests = timestamps.filter((t) => t > tenMinutesAgo);

    store.set(ip, recentRequests);

    if (recentRequests.length >= 3) {
        return {
            allowed: false,
            message: "Çok fazla istek attınız. Lütfen daha sonra tekrar deneyin.",
        };
    }

    const lastRequest = recentRequests[recentRequests.length - 1];

    if (lastRequest && now - lastRequest < 60 * 1000) {
        return {
            allowed: false,
            message: "Lütfen tekrar denemeden önce biraz bekleyin.",
        };
    }

    return { allowed: true };
};

const registerSuccessfulRequest = (store, ip) => {
    const timestamps = store.get(ip) || [];
    timestamps.push(Date.now());
    store.set(ip, timestamps);
};

/* =========================
   MULTER
========================= */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error('Sadece PDF yüklenebilir.'));
        }
    },
});

/* =========================
   CONTACT MAIL
========================= */
router.post("/send-mail", async (req, res) => {
    try {
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress;

        const rateCheck = checkRateLimit(rateLimitStore.contact, ip);

        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: rateCheck.message,
            });
        }

        await sendContactMail(req.body);

        registerSuccessfulRequest(rateLimitStore.contact, ip);

        res.json({ success: true });
    } catch (error) {
        console.error("Mail hatası:", error.message || error);
        res.status(500).json({ error: "Mail gönderilemedi" });
    }
});

/* =========================
   CAREER MAIL
========================= */
router.post("/send-career-mail", upload.single("file"), async (req, res) => {
    try {
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress;

        const rateCheck = checkRateLimit(rateLimitStore.career, ip);

        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: rateCheck.message,
            });
        }

        await sendCareerMail(req.body, req.file);

        registerSuccessfulRequest(rateLimitStore.career, ip);

        res.json({ success: true });
    } catch (error) {
        console.error("Career mail hatası:", error.message || error);
        res.status(500).json({ error: "Career mail gönderilemedi" });
    }
});

/* =========================
   OFFER MAIL
========================= */
router.post("/send-offer-mail", async (req, res) => {
    try {
        console.log("OFFER BODY:", req.body);

        const {
            selectedOption,
            companyName,
            email,
            phone,
            details,
        } = req.body;

        const result = await sendOfferMail({
            selectedOption,
            companyName,
            email,
            phone,
            details,
        });
        console.log("OFFER MAIL SENT");
        console.log("OFFER RESULT:", result);

        return res.status(200).json({
            success: true,
            message: "Offer mail başarıyla gönderildi.",
        });
    } catch (error) {
        console.error("OFFER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Offer mail gönderilemedi.",
        });
    }
});



export default router;