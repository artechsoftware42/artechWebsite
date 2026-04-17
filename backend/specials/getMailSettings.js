import Page from "../models/Page.js";

export async function getMailSettings() {
    // 🔥 Tüm sayfaları çek (debug + garanti bulma)
    const pages = await Page.find().lean();

    // 🔥 MailSettings'i case-insensitive bul
    const doc = pages.find(
        (p) => p.name?.toLowerCase().trim() === "mailsettings"
    );

    if (!doc) {
        console.log("BULUNAN SAYFALAR:", pages.map(p => p.name));
        throw new Error("MailSettings bulunamadı.");
    }

    const resendSection = doc.sections?.find(
        (section) => section.name?.toLowerCase().trim() === "resend"
    );

    if (!resendSection) {
        throw new Error("resend section bulunamadı.");
    }

    const getValue = (key, fallback = "") =>
        resendSection.contents?.find((item) => item.key === key)?.value ?? fallback;

    return {
        resendApiKey: getValue("resendApiKey"),
        contactFrom: getValue("contactFrom"),
        careerFrom: getValue("careerFrom"),
        mailTo: getValue("mailTo"),
    };
}