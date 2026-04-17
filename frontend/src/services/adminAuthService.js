const API_BASE = import.meta.env.VITE_API_URL;

const generateDeviceId = () => {
    if (
        typeof window !== "undefined" &&
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

const getDeviceId = () => {
    let deviceId = localStorage.getItem("adminDeviceId");

    if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem("adminDeviceId", deviceId);
    }

    return deviceId;
};

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
            deviceId: getDeviceId(),
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
        localStorage.removeItem("adminDeviceId");
        throw error;
    }
};

export const clearAdminSessionMarkers = () => {
    sessionStorage.removeItem("adminSessionActive");
    localStorage.removeItem("adminDeviceId");
};

export const hasActiveAdminSessionMarker = () => {
    return sessionStorage.getItem("adminSessionActive") === "true";
};