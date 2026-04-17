export async function sendCareerMail(formData) {
    const payload = new FormData();

    payload.append("firstName", formData.firstName || "");
    payload.append("lastName", formData.lastName || "");
    payload.append("phone", formData.phone || "");
    payload.append("email", formData.email || "");
    payload.append("coverLetter", formData.coverLetter || "");
    payload.append("position", formData.position || "");
    payload.append("employmentType", formData.employmentType || "");
    payload.append("degree", formData.degree || "");
    payload.append("graduationStatus", formData.graduationStatus || "");
    payload.append("school", formData.school || "");
    payload.append("department", formData.department || "");

    if (formData.file) {
        payload.append("file", formData.file);
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mail/send-career-mail`, {
        method: "POST",
        body: payload,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            data.message || data.error || "Career mail gönderilemedi"
        );
    }

    return data;
}