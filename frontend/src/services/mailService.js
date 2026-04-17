export async function sendContactMail(data) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mail/send-mail`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            responseData.message || responseData.error || "Mail gönderilemedi"
        );
    }

    return responseData;
} 