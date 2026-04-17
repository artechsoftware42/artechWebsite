import { useEffect, useState } from "react";
import {
    getAdminMe,
    clearAdminSessionMarkers,
    hasActiveAdminSessionMarker,
} from "../services/adminAuthService";

const AdminProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Tarayıcı/sekme kapanıp tekrar açıldıysa sessionStorage boş olur.
                // Bu durumda admin sayfasını göstermiyoruz.
                if (!hasActiveAdminSessionMarker()) {
                    setAuthorized(false);
                    setMessage("Admin session not active.");
                    setLoading(false);
                    return;
                }

                const data = await getAdminMe();

                if (data.success) {
                    setAuthorized(true);
                } else {
                    clearAdminSessionMarkers();
                    setAuthorized(false);
                    setMessage("Unauthorized.");
                }
            } catch (error) {
                clearAdminSessionMarkers();
                setAuthorized(false);
                setMessage(error.message || "Unauthorized.");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) return <p>Checking admin session...</p>;
    if (!authorized) return <p>{message || "Admin erişimi yok."}</p>;

    return children;
};

export default AdminProtectedRoute;