import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, ShieldCheck } from "lucide-react";
import { loginAdmin } from "../services/adminAuthService";

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const data = await loginAdmin(formData);

            if (data.success) {
                setMessage("Login successful.");
                window.location.href = "/admin";
            } else {
                setMessage(data.message || "Login failed.");
            }
        } catch (error) {
            console.error("Admin login error:", error);
            setMessage(error.message || "Login request failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#e8e8e8]">
            <div className="absolute inset-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#02acfa]/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#02acfa]/10 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,13,13,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,13,13,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                        <div className="h-1 w-full bg-[#02acfa]" />

                        <div className="px-6 pb-8 pt-7 sm:px-8">
                            <div className="mb-8 text-center">
                                <h1 className="text-[30px] font-bold tracking-tight text-[#0d0d0d] sm:text-[34px]">
                                    Artech Admin Panel
                                </h1>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/55 sm:text-[15px]">
                                    Yönetim paneline erişmek için kullanıcı bilgilerinizle giriş yapın.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-semibold text-[#0d0d0d]"
                                    >
                                        Kullanıcı Adı
                                    </label>

                                    <div className="group relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35 transition-colors group-focus-within:text-[#02acfa]">
                                            <User size={18} />
                                        </span>

                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Kullanıcı adınızı girin"
                                            className="w-full rounded-2xl border border-black/10 bg-[#f6f7f8] py-3.5 pl-12 pr-4 text-[#0d0d0d] outline-none transition-all duration-300 placeholder:text-black/35 focus:border-[#02acfa]/40 focus:bg-white focus:ring-4 focus:ring-[#02acfa]/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-[#0d0d0d]"
                                    >
                                        Şifre
                                    </label>

                                    <div className="group relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35 transition-colors group-focus-within:text-[#02acfa]">
                                            <Lock size={18} />
                                        </span>

                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Şifrenizi girin"
                                            className="w-full rounded-2xl border border-black/10 bg-[#f6f7f8] py-3.5 pl-12 pr-14 text-[#0d0d0d] outline-none transition-all duration-300 placeholder:text-black/35 focus:border-[#02acfa]/40 focus:bg-white focus:ring-4 focus:ring-[#02acfa]/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-black/40 transition hover:text-[#02acfa]"
                                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {message && (
                                    <div
                                        className={`rounded-2xl border px-4 py-3 text-sm ${message.toLowerCase().includes("successful")
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                            }`}
                                    >
                                        {message}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full cursor-pointer rounded-2xl bg-[#0d0d0d] px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#02acfa] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                                    >
                                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#02acfa]/15 bg-[#02acfa]/5 p-4">
                                <div className="mt-0.5 text-[#02acfa]">
                                    <ShieldCheck size={18} />
                                </div>
                                <p className="text-left text-xs leading-5 text-black/60 sm:text-[13px]">
                                    Bu panel yalnızca firma yetkilileri ve yetkili personel tarafından
                                    görüntülenebilir. Yetkisiz erişim girişimleri kayıt altına alınabilir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;