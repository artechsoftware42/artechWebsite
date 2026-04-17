import { Resend } from "resend";
import { getMailSettings } from "./getMailSettings.js";

export async function sendContactMail({ name, surname, phone, email, message }) {
    try {
        const { resendApiKey, contactFrom, mailTo } = await getMailSettings();
        const resend = new Resend(resendApiKey);

        const response = await resend.emails.send({
            from: contactFrom,
            to: mailTo,
            subject: "İletişim Mesajı",
            html: `
        <h1>Müşteri Bilgileri</h1>
        <p><strong>İsim:</strong> ${name}</p>
        <p><strong>Soyisim:</strong> ${surname}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <h2><strong>İleti:</strong></h2>
        <p>${message}</p>
      `,
        });

        return response;
    } catch (error) {
        console.error("Mail gönderme hatası:", error);
        throw error;
    }
}

export async function sendCareerMail(data, file) {
    try {
        const { resendApiKey, careerFrom, mailTo } = await getMailSettings();
        const resend = new Resend(resendApiKey);

        const {
            firstName,
            lastName,
            phone,
            email,
            coverLetter,
            position,
            employmentType,
            degree,
            graduationStatus,
            school,
            department,
        } = data;

        const attachments = [];

        if (file) {
            attachments.push({
                filename: file.originalname,
                content: file.buffer.toString("base64"),
                content_type: file.mimetype,
            });
        }

        const response = await resend.emails.send({
            from: careerFrom,
            to: mailTo,
            subject: `Kariyer Başvurusu - ${firstName} ${lastName}`,
            attachments,
            html: `
        <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
          <h1 style="margin-bottom: 20px;">Yeni Kariyer Başvurusu</h1>

          <h2 style="margin-top: 24px;">Aday Bilgileri</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>İsim</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${firstName || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Soyisim</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${lastName || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Telefon</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${phone || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>E-posta</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${email || "-"}</td></tr>
          </table>

          <h2 style="margin-top: 24px;">Başvuru Bilgileri</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Pozisyon</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${position || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>İstihdam Türü</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${employmentType || "-"}</td></tr>
          </table>

          <h2 style="margin-top: 24px;">Eğitim Bilgileri</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Derece</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${degree || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Mezuniyet Durumu</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${graduationStatus || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Okul</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${school || "-"}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Bölüm</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${department || "-"}</td></tr>
          </table>

          <h2 style="margin-top: 24px;">Ön Yazı</h2>
          <div style="border: 1px solid #ddd; padding: 12px; background: #fafafa; max-width: 700px; white-space: pre-wrap;">
            ${coverLetter || "-"}
          </div>

          <h2 style="margin-top: 24px;">Ek Dosya</h2>
          <p>${file ? file.originalname : "CV eklenmedi."}</p>
        </div>
      `,
        });

        return response;
    } catch (error) {
        console.error("Career mail hatası:", error);
        throw error;
    }
}