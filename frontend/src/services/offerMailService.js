export async function sendOfferMail(formData) {
    const payload = new FormData();

    payload.append("selectedOption", formData.selectedOption || "");
    payload.append("companyName", formData.companyName || "");
    payload.append("email", formData.email || "");
    payload.append("phone", formData.phone || "");
    payload.append("details", formData.details || "");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mail/send-offer-mail`, {
        method: "POST",
        body: payload,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            data.message || data.error || "Offer mail gönderilemedi"
        );
    }

    return data;
}