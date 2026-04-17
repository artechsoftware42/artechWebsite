export const fetchJson = async (url, options = {}) => {
    try {
        const res = await fetch(url, options);

        const rawText = await res.text();

        let data = {};
        try {
            data = rawText ? JSON.parse(rawText) : {};
        } catch {
            data = { rawText };
        }

        const errorDetails = {
            url,
            method: options?.method || "GET",
            status: res.status,
            statusText: res.statusText,
            response: data,
            timestamp: new Date().toISOString(),
        };

        if (res.status === 404) {
            console.error("fetchJson 404 error:", errorDetails);
            sessionStorage.setItem("lastFetchError", JSON.stringify(errorDetails));
            window.location.href = "/404";
            return null;
        }

        if (res.status === 401) {
            console.error("fetchJson 401 error:", errorDetails);
            sessionStorage.setItem("lastFetchError", JSON.stringify(errorDetails));
            window.location.href = "/admin-login";
            return null;
        }

        if (!res.ok) {
            console.error("fetchJson non-OK error:", errorDetails);
            sessionStorage.setItem("lastFetchError", JSON.stringify(errorDetails));
            throw new Error(
                data?.message ||
                data?.error ||
                `Request failed with status ${res.status}`
            );
        }

        return data;
    } catch (error) {
        const networkErrorDetails = {
            url,
            method: options?.method || "GET",
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        };

        console.error("fetchJson catch error:", networkErrorDetails);
        sessionStorage.setItem("lastFetchError", JSON.stringify(networkErrorDetails));

        window.location.href = "/404";
        return null;
    }
};