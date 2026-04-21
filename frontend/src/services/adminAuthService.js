const API_BASE = import.meta.env.VITE_API_URL;

const parseResponse = async (response) => {
    const text = await response.text();

    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
};

export const loginAdmin = async ({ username, password }) => {
    const response = await fetch(`${API_BASE}/api/admin-auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await parseResponse(response);

    if (data.success) {
        sessionStorage.setItem("adminSessionActive", "true");
    }

    return data;
};

export const getAdminMe = async () => {
    const response = await fetch(`${API_BASE}/api/admin-auth/me`, {
        method: "GET",
        credentials: "include",
    });

    return parseResponse(response);
};

export const logoutAdmin = async () => {
    const response = await fetch(`${API_BASE}/api/admin-auth/logout`, {
        method: "POST",
        credentials: "include",
    });

    try {
        const data = await parseResponse(response);
        sessionStorage.removeItem("adminSessionActive");
        return data;
    } catch (error) {
        sessionStorage.removeItem("adminSessionActive");
        throw error;
    }
};

export const clearAdminSessionMarkers = () => {
    sessionStorage.removeItem("adminSessionActive");
};

export const hasActiveAdminSessionMarker = () => {
    return sessionStorage.getItem("adminSessionActive") === "true";
};
