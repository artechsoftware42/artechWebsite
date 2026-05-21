import mongoose from "mongoose";

export async function getMailSettings() {
    const db = mongoose.connection.db;

    const doc =
        (await db.collection("MailSettings").findOne({ name: "MailSettings" })) ||
        (await db.collection("MailSettings").findOne({ pageKey: "MailSettings" })) ||
        (await db.collection("MailSettings").findOne({}));

    if (!doc) {
        throw new Error("MailSettings collection içinde ayar bulunamadı.");
    }

    const resendSection = doc.sections?.find(
        (section) => section.name?.toLowerCase().trim() === "resend"
    );

    if (!resendSection) {
        throw new Error("MailSettings içinde resend section bulunamadı.");
    }

    const getValue = (key, fallback = "") =>
        resendSection.contents?.find((item) => item.key === key)?.value ?? fallback;

    const resendApiKey = getValue("resendApiKey");
    const contactFrom = getValue("contactFrom");
    const careerFrom = getValue("careerFrom");
    const offerFrom = getValue("offerFrom", contactFrom);
    const mailTo = getValue("mailTo");

    if (!resendApiKey) {
        throw new Error("MailSettings içinde resendApiKey eksik.");
    }

    if (!mailTo) {
        throw new Error("MailSettings içinde mailTo eksik.");
    }

    return {
        resendApiKey,
        contactFrom,
        careerFrom,
        offerFrom,
        mailTo,
    };
}