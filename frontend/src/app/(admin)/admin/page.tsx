import AdminPanel from "@/features/admin/AdminPanel";
import AdminProtected from "@/features/admin/AdminProtected";

export default function Page() {
    return (
        <AdminProtected>
            <AdminPanel />
        </AdminProtected>
    );
}