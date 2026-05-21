const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type LoginPayload = {
    username: string;
    password: string;
};

type ApiResponse = {
    success?: boolean;
    message?: string;
    error?: string;
    admin?: {
        username?: string;
        isAuthenticated?: boolean;
    };
};

async function parseResponse(response: Response): Promise<ApiResponse> {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return {
            success: false,
            message: text || "Sunucudan geçersiz cevap geldi.",
        };
    }
}

export async function loginAdmin(payload: LoginPayload) {
    const response = await fetch(`${API_BASE}/api/admin-auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw new Error(data.message || data.error || "Giriş başarısız.");
    }

    return data;
}

export async function getAdminMe() {
    const response = await fetch(`${API_BASE}/api/admin-auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw new Error(data.message || data.error || "Oturum bulunamadı.");
    }

    return data;
}