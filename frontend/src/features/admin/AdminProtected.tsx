"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";

import { getAdminMe } from "@/services/adminAuthService";

export default function AdminProtected({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            const tabSession = sessionStorage.getItem("admin_tab_session");

            if (tabSession !== "active") {
                router.replace("/");
                return;
            }

            try {
                const data = await getAdminMe();

                if (!data.success) {
                    sessionStorage.removeItem("admin_tab_session");
                    router.replace("/");
                    return;
                }

                if (isMounted) {
                    setChecking(false);
                }
            } catch {
                sessionStorage.removeItem("admin_tab_session");
                router.replace("/");
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [router]);

    if (checking) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#f4f6fb] text-[#101418]">
                <div className="flex items-center gap-3 rounded-3xl border border-black/10 bg-white px-6 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
                    <FiRefreshCw className="animate-spin text-[#02acfa]" />
                    <span className="text-sm font-semibold">Oturum kontrol ediliyor...</span>
                </div>
            </main>
        );
    }

    return <>{children}</>;
}