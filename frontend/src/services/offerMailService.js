export async function sendOfferMail(formData) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mail/send-offer-mail`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            selectedOption: formData.selectedOption || "",
            companyName: formData.companyName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            details: formData.details || "",
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            data.message || data.error || "Offer mail gönderilemedi"
        );
    }

    return data;
}