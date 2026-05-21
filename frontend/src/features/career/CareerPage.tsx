"use client";

import {
    useEffect,
    useState,
    type ChangeEvent,
    type Dispatch,
    type FormEvent,
    type SetStateAction,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiChevronDown } from "react-icons/fi";
import { FaCheck, FaArrowRight } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;
type LocalizedArray = Partial<Record<LanguageCode, string[]>>;

type RoleOption = {
    key: string;
    label: LocalizedText;
};

type AgreementContent = {
    link: string;
    linkText: LocalizedText;
    text: LocalizedText;
};

type CareerContentValue =
    | string
    | LocalizedText
    | LocalizedArray
    | RoleOption[]
    | AgreementContent
    | Record<string, LocalizedText>;

type CareerContent = {
    key: string;
    value: CareerContentValue;
};

type CareerSection = {
    name?: string;
    contents?: CareerContent[];
};

type CareerPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: CareerSection[];
};

type CareerFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    portfolio: string;
    coverLetter: string;
    cv: File | null;
};

type FormErrors = Partial<Record<keyof CareerFormData | "agreement", string>>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function normalizeLanguage(language: string): LanguageCode {
    const normalized = language.toLowerCase();

    if (normalized === "tr") return "tr";
    if (normalized === "en") return "en";
    if (normalized === "fr") return "fr";
    if (normalized === "ru") return "ru";

    return "tr";
}

function getContent<T>(contents: CareerContent[], key: string, fallback: T): T {
    const found = contents.find((content) => content.key === key)?.value;

    if (found === undefined || found === null) {
        return fallback;
    }

    return found as T;
}

function getText(value: LocalizedText | string | undefined, language: string) {
    if (!value) return "";

    if (typeof value === "string") return value;

    const lang = normalizeLanguage(language);

    return value[lang] || value.tr || value.en || value.fr || value.ru || "";
}

function getTextArray(
    value: LocalizedArray | string[] | undefined,
    language: string
): string[] {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    const lang = normalizeLanguage(language);

    return value[lang] || value.tr || value.en || value.fr || value.ru || [];
}

export default function CareerPage() {
    const { language } = useLanguage();

    const [contents, setContents] = useState<CareerContent[]>([]);
    const [agreementChecked, setAgreementChecked] = useState(false);
    const [cvName, setCvName] = useState("");
    const [roleOpen, setRoleOpen] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSending, setIsSending] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [formData, setFormData] = useState<CareerFormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        portfolio: "",
        coverLetter: "",
        cv: null,
    });

    useEffect(() => {
        let isMounted = true;

        const fetchCareerPage = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pages/CareerPage`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(
                        `CareerPage verisi alınamadı. Status: ${response.status}`
                    );
                }

                const data = (await response.json()) as CareerPageResponse;

                const careerSection =
                    data.sections?.find((section) => {
                        const sectionName = section.name?.toLowerCase();

                        return (
                            sectionName === "career-page" ||
                            sectionName === "careerpage" ||
                            sectionName === "career"
                        );
                    }) || data.sections?.[0];

                if (isMounted && careerSection?.contents) {
                    setContents(careerSection.contents);
                }
            } catch (error) {
                console.error("CareerPage verisi alınamadı:", error);
            }
        };

        fetchCareerPage();

        return () => {
            isMounted = false;
        };
    }, []);

    const heroBackgroundText = getText(
        getContent<LocalizedText>(contents, "heroBackgroundText", {}),
        language
    );

    const heroEyebrow = getText(
        getContent<LocalizedText>(contents, "heroEyebrow", {}),
        language
    );

    const heroTitleLine1 = getText(
        getContent<LocalizedText>(contents, "heroTitleLine1", {}),
        language
    );

    const heroTitleLine2 = getText(
        getContent<LocalizedText>(contents, "heroTitleLine2", {}),
        language
    );

    const heroParagraph = getText(
        getContent<LocalizedText>(contents, "heroParagraph", {}),
        language
    );

    const sideEyebrow = getText(
        getContent<LocalizedText>(contents, "sideEyebrow", {}),
        language
    );

    const sideTitle = getText(
        getContent<LocalizedText>(contents, "sideTitle", {}),
        language
    );

    const sideParagraph = getText(
        getContent<LocalizedText>(contents, "sideParagraph", {}),
        language
    );

    const workModelCardTitle = getText(
        getContent<LocalizedText>(contents, "workModelCardTitle", {}),
        language
    );

    const workModelCardText = getText(
        getContent<LocalizedText>(contents, "workModelCardText", {}),
        language
    );

    const expectationsTitle = getText(
        getContent<LocalizedText>(contents, "expectationsTitle", {}),
        language
    );

    const expectations = getTextArray(
        getContent<LocalizedArray>(contents, "expectations", {}),
        language
    );

    const roleOptions = getContent<RoleOption[]>(contents, "roleOptions", []);

    const formLabels = getContent<Record<string, LocalizedText>>(
        contents,
        "formLabels",
        {}
    );

    const formPlaceholders = getContent<Record<string, LocalizedText>>(
        contents,
        "formPlaceholders",
        {}
    );

    const formErrors = getContent<Record<string, LocalizedText>>(
        contents,
        "formErrors",
        {}
    );

    const agreement = getContent<AgreementContent>(contents, "agreement", {
        link: "/kvkk",
        linkText: {},
        text: {},
    });

    const submitButtonText = getText(
        getContent<LocalizedText>(contents, "submitButtonText", {}),
        language
    );

    const sendingButtonText = getText(
        getContent<LocalizedText>(contents, "sendingButtonText", {}),
        language
    );

    const successTitle = getText(
        getContent<LocalizedText>(contents, "successTitle", {}),
        language
    );

    const successText = getText(
        getContent<LocalizedText>(contents, "successText", {}),
        language
    );

    const selectedRoleLabel = getText(
        roleOptions.find((role) => role.key === formData.role)?.label,
        language
    );

    const getError = (key: string) => getText(formErrors[key], language);

    const handleChange = (
        field: keyof CareerFormData,
        value: string | File | null
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));

        setSubmitError("");
    };

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    };

    const isValidPhone = (value: string) => {
        const cleaned = value.replace(/\s+/g, "").trim();
        return /^(\+90|0)?5\d{9}$/.test(cleaned);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setCvName("");
            handleChange("cv", null);
            return;
        }

        if (file.type !== "application/pdf") {
            setCvName("");
            setFormData((prev) => ({
                ...prev,
                cv: null,
            }));
            setErrors((prev) => ({
                ...prev,
                cv: getError("cv") || "Lütfen PDF dosyası yükleyiniz.",
            }));
            return;
        }

        setCvName(file.name);
        handleChange("cv", file);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSending) return;

        const newErrors: FormErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = getError("required");
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = getError("required");
        }

        if (!formData.email.trim()) {
            newErrors.email = getError("required");
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = getError("required");
        }

        if (!formData.phone.trim()) {
            newErrors.phone = getError("required");
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = getError("required");
        }

        if (!formData.role) {
            newErrors.role = getError("role");
        }

        if (!formData.portfolio.trim()) {
            newErrors.portfolio = getError("portfolio");
        }

        if (!formData.coverLetter.trim()) {
            newErrors.coverLetter = getError("coverLetter");
        }

        if (!formData.cv) {
            newErrors.cv = getError("cv");
        }

        if (!agreementChecked) {
            newErrors.agreement = getError("agreement");
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            setIsSending(true);
            setSubmitError("");

            const careerFormData = new FormData();

            careerFormData.append("firstName", formData.firstName);
            careerFormData.append("lastName", formData.lastName);
            careerFormData.append("phone", formData.phone);
            careerFormData.append("email", formData.email);

            careerFormData.append("position", selectedRoleLabel || formData.role);
            careerFormData.append("employmentType", "-");
            careerFormData.append("degree", "-");
            careerFormData.append("graduationStatus", "-");
            careerFormData.append("school", "-");
            careerFormData.append("department", "-");

            careerFormData.append(
                "coverLetter",
                `Portfolio / Github / Linkedin: ${formData.portfolio}\n\n${formData.coverLetter}`
            );

            if (formData.cv) {
                careerFormData.append("file", formData.cv);
            }

            const response = await fetch(`${API_BASE}/api/mail/send-career-mail`, {
                method: "POST",
                credentials: "include",
                body: careerFormData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || result.error || getError("sendFailed")
                );
            }

            setIsSubmitted(true);
            setAgreementChecked(false);
            setCvName("");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                role: "",
                portfolio: "",
                coverLetter: "",
                cv: null,
            });
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : getError("sendFailed")
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen w-full overflow-hidden bg-white text-[#0d0d0d]">
            <section className="relative overflow-hidden px-6 pt-40 pb-24 sm:px-8 md:px-10 lg:px-16 lg:pt-48 lg:pb-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(2,172,250,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(2,172,250,0.14),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f6f8fa_72%,#f4f7f9_100%)]" />

                <div className="pointer-events-none absolute bottom-[-1px] left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#f4f7f9]/80 to-[#f4f7f9]" />

                {heroBackgroundText && (
                    <motion.h1
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9 }}
                        className="pointer-events-none absolute left-1/2 top-1/2 select-none -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black tracking-[-1vw] text-black/[0.035]"
                    >
                        {heroBackgroundText}
                    </motion.h1>
                )}

                <div className="relative z-10 mx-auto w-full max-w-[1200px] text-center">
                    {heroEyebrow && (
                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-[11px] uppercase tracking-[0.4em] text-black/45"
                        >
                            {heroEyebrow}
                        </motion.p>
                    )}

                    {(heroTitleLine1 || heroTitleLine2) && (
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.05 }}
                            className="mt-6 text-[48px] font-semibold leading-[0.95] tracking-[-0.06em] sm:text-[68px] md:text-[88px] lg:text-[110px]"
                        >
                            <span className="bg-gradient-to-b from-[#0d0d0d] to-[#0d0d0d]/70 bg-clip-text text-transparent">
                                {heroTitleLine1}
                            </span>

                            <br />

                            <span className="bg-gradient-to-b from-[#02acfa] to-[#026fa3] bg-clip-text text-transparent">
                                {heroTitleLine2}
                            </span>
                        </motion.h1>
                    )}

                    {heroParagraph && (
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.12 }}
                            className="mx-auto mt-8 max-w-[680px] text-[16px] leading-8 text-black/60 sm:text-[18px]"
                        >
                            {heroParagraph}
                        </motion.p>
                    )}
                </div>
            </section>

            <section className="relative bg-gradient-to-b from-[#f4f7f9] via-white to-white px-6 py-20 sm:px-8 md:px-10 lg:px-16 lg:py-28">
                <div className="mx-auto w-full max-w-[1500px]">
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 rounded-[28px] border border-[#02acfa]/20 bg-[#02acfa]/5 p-6 text-[#0d0d0d]"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#02acfa] text-white">
                                    <FaCheck />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">{successTitle}</h2>
                                    <p className="mt-2 text-sm leading-7 text-black/62">
                                        {successText}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75 }}
                            viewport={{ once: true, amount: 0.25 }}
                            className="lg:col-span-4"
                        >
                            {sideEyebrow && (
                                <p className="text-[11px] uppercase tracking-[0.3em] text-black/38">
                                    {sideEyebrow}
                                </p>
                            )}

                            {sideTitle && (
                                <h2 className="mt-5 max-w-[420px] text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[44px]">
                                    {sideTitle}
                                </h2>
                            )}

                            {sideParagraph && (
                                <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-black/62 sm:text-[16px]">
                                    {sideParagraph}
                                </p>
                            )}

                            {(workModelCardTitle || workModelCardText) && (
                                <div className="mt-8 max-w-[420px] rounded-[26px] border border-black/10 bg-black/[0.025] p-5">
                                    {workModelCardTitle && (
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-black/35">
                                            {workModelCardTitle}
                                        </p>
                                    )}

                                    {workModelCardText && (
                                        <p className="mt-3 text-[15px] leading-7 text-black/65">
                                            {workModelCardText}
                                        </p>
                                    )}
                                </div>
                            )}

                            {expectations.length > 0 && (
                                <div className="mt-8 max-w-[420px]">
                                    {expectationsTitle && (
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-black/35">
                                            {expectationsTitle}
                                        </p>
                                    )}

                                    <ul className="mt-5 space-y-4 text-[14px] leading-7 text-black/58">
                                        {expectations.map((item, index) => (
                                            <li key={`${item}-${index}`} className="flex gap-3">
                                                <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#02acfa]" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>

                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 34 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.85, delay: 0.08 }}
                            viewport={{ once: true, amount: 0.2 }}
                            className="lg:col-span-8"
                        >
                            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                                <LineInput
                                    label={getText(formLabels.firstName, language)}
                                    placeholder={getText(formPlaceholders.firstName, language)}
                                    value={formData.firstName}
                                    error={errors.firstName}
                                    onChange={(event) =>
                                        handleChange("firstName", event.target.value)
                                    }
                                />

                                <LineInput
                                    label={getText(formLabels.lastName, language)}
                                    placeholder={getText(formPlaceholders.lastName, language)}
                                    value={formData.lastName}
                                    error={errors.lastName}
                                    onChange={(event) =>
                                        handleChange("lastName", event.target.value)
                                    }
                                />

                                <LineInput
                                    type="email"
                                    label={getText(formLabels.email, language)}
                                    placeholder={getText(formPlaceholders.email, language)}
                                    value={formData.email}
                                    error={errors.email}
                                    onChange={(event) =>
                                        handleChange("email", event.target.value)
                                    }
                                />

                                <LineInput
                                    type="tel"
                                    label={getText(formLabels.phone, language)}
                                    placeholder={getText(formPlaceholders.phone, language)}
                                    value={formData.phone}
                                    error={errors.phone}
                                    onChange={(event) =>
                                        handleChange("phone", event.target.value)
                                    }
                                />
                            </div>

                            <div className="mt-10">
                                <RoleSelect
                                    label={getText(formLabels.role, language)}
                                    placeholder={getText(formPlaceholders.role, language)}
                                    selectedLabel={selectedRoleLabel}
                                    value={formData.role}
                                    error={errors.role}
                                    open={roleOpen}
                                    setOpen={setRoleOpen}
                                    options={roleOptions}
                                    language={language}
                                    onSelect={(roleKey) => {
                                        handleChange("role", roleKey);
                                        setRoleOpen(false);
                                    }}
                                />
                            </div>

                            <div className="mt-10">
                                <LineInput
                                    label={getText(formLabels.portfolio, language)}
                                    placeholder={getText(formPlaceholders.portfolio, language)}
                                    value={formData.portfolio}
                                    error={errors.portfolio}
                                    onChange={(event) =>
                                        handleChange("portfolio", event.target.value)
                                    }
                                />
                            </div>

                            <div className="mt-10">
                                <LineTextarea
                                    label={getText(formLabels.coverLetter, language)}
                                    placeholder={getText(formPlaceholders.coverLetter, language)}
                                    value={formData.coverLetter}
                                    error={errors.coverLetter}
                                    onChange={(event) =>
                                        handleChange("coverLetter", event.target.value)
                                    }
                                />
                            </div>

                            <div className="mt-10">
                                <label className="text-[11px] uppercase tracking-[0.24em] text-black/38">
                                    {getText(formLabels.cv, language)}
                                </label>

                                <label
                                    className={`group mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-10 text-center transition-all duration-300 ${errors.cv
                                        ? "border-red-500 bg-red-500/10"
                                        : "border-black/15 bg-black/[0.02] hover:border-[#02acfa]/45 hover:bg-[#02acfa]/[0.04]"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    <FiUploadCloud
                                        className={`text-[34px] transition-transform duration-300 group-hover:-translate-y-1 ${errors.cv ? "text-red-500" : "text-black/45"
                                            }`}
                                    />

                                    <span
                                        className={`mt-4 text-[15px] ${errors.cv ? "text-red-500" : "text-black/65"
                                            }`}
                                    >
                                        {cvName || getText(formPlaceholders.cv, language)}
                                    </span>

                                    <span className="mt-2 text-[12px] text-black/35">
                                        PDF
                                    </span>
                                </label>

                                {errors.cv && (
                                    <p className="mt-3 text-[12px] text-red-500">{errors.cv}</p>
                                )}
                            </div>

                            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <label className="group flex cursor-pointer items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAgreementChecked((prev) => !prev);
                                            setErrors((prev) => ({ ...prev, agreement: "" }));
                                            setSubmitError("");
                                        }}
                                        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-all duration-300 ${agreementChecked
                                            ? "border-[#02acfa] bg-[#02acfa]"
                                            : "border-black/25 bg-transparent hover:border-[#02acfa]"
                                            }`}
                                    >
                                        {agreementChecked && (
                                            <FaCheck className="text-[13px] text-white" />
                                        )}
                                    </button>

                                    <span className="text-[13px] leading-6 text-black/58">
                                        {getText(agreement.text, language)}{" "}
                                        {agreement.link && getText(agreement.linkText, language) && (
                                            <Link
                                                href={agreement.link}
                                                className="font-medium text-[#02acfa] transition-opacity duration-300 hover:opacity-80"
                                            >
                                                {getText(agreement.linkText, language)}
                                            </Link>
                                        )}
                                    </span>
                                </label>

                                {errors.agreement && (
                                    <p className="text-[12px] text-red-500">
                                        {errors.agreement}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!agreementChecked || isSending}
                                    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-7 py-4 text-sm font-semibold text-white transition-all duration-300 ${agreementChecked && !isSending
                                        ? "cursor-pointer bg-[#02acfa] hover:bg-[#181818]"
                                        : "cursor-not-allowed bg-black/20 text-black/35"
                                        }`}
                                >
                                    {agreementChecked && !isSending && (
                                        <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />
                                    )}

                                    <span className="relative z-10 flex items-center gap-3">
                                        {isSending
                                            ? sendingButtonText || "Gönderiliyor..."
                                            : submitButtonText}
                                        <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </button>
                            </div>

                            {submitError && (
                                <p className="mt-5 text-sm font-medium text-red-500">
                                    {submitError}
                                </p>
                            )}
                        </motion.form>
                    </div>
                </div>
            </section>
        </main>
    );
}

function LineInput({
    label,
    placeholder,
    value,
    onChange,
    error,
    type = "text",
}: {
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    type?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label className="text-[11px] uppercase tracking-[0.24em] text-black/38">
                {label}
            </label>

            <div
                className={`group relative mt-4 border-b transition-colors duration-300 ${error ? "border-red-500" : "border-black/15"
                    }`}
            >
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent pb-4 text-[17px] text-[#0d0d0d] outline-none placeholder:text-black/25"
                />

                <span
                    className={`absolute bottom-[-1px] left-0 h-[1px] w-full origin-left transition-transform duration-300 ease-out group-focus-within:scale-x-100 ${error ? "scale-x-100 bg-red-500" : "scale-x-0 bg-[#02acfa]"
                        }`}
                />
            </div>

            {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
        </div>
    );
}

function LineTextarea({
    label,
    placeholder,
    value,
    onChange,
    error,
}: {
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    return (
        <div>
            <label className="text-[11px] uppercase tracking-[0.24em] text-black/38">
                {label}
            </label>

            <div
                className={`group relative mt-4 border-b transition-colors duration-300 ${error ? "border-red-500" : "border-black/15"
                    }`}
            >
                <textarea
                    rows={6}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full resize-none bg-transparent pb-4 text-[17px] leading-7 text-[#0d0d0d] outline-none placeholder:text-black/25"
                />

                <span
                    className={`absolute bottom-[-1px] left-0 h-[1px] w-full origin-left transition-transform duration-300 ease-out group-focus-within:scale-x-100 ${error ? "scale-x-100 bg-red-500" : "scale-x-0 bg-[#02acfa]"
                        }`}
                />
            </div>

            {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
        </div>
    );
}

function RoleSelect({
    label,
    placeholder,
    selectedLabel,
    value,
    error,
    open,
    setOpen,
    options,
    language,
    onSelect,
}: {
    label: string;
    placeholder: string;
    selectedLabel: string;
    value: string;
    error?: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    options: RoleOption[];
    language: string;
    onSelect: (roleKey: string) => void;
}) {
    return (
        <div>
            <label className="text-[11px] uppercase tracking-[0.24em] text-black/38">
                {label}
            </label>

            <div className="relative mt-4">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className={`group relative flex w-full items-center justify-between border-b bg-transparent pb-4 text-left text-[17px] outline-none transition-colors duration-300 ${error
                        ? "border-red-500 text-red-500"
                        : "border-black/15 text-[#0d0d0d] hover:border-[#02acfa]"
                        }`}
                >
                    <span className={value ? "text-[#0d0d0d]" : "text-black/25"}>
                        {selectedLabel || placeholder}
                    </span>

                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <FiChevronDown />
                    </motion.span>

                    <span
                        className={`absolute bottom-[-1px] left-0 h-[1px] w-full origin-left transition-transform duration-300 ease-out ${open || error ? "scale-x-100" : "scale-x-0"
                            } ${error ? "bg-red-500" : "bg-[#02acfa]"}`}
                    />
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                            className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 overflow-hidden rounded-[22px] border border-black/10 bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.16)]"
                        >
                            {options.map((role) => {
                                const roleLabel = getText(role.label, language);

                                if (!role.key || !roleLabel) return null;

                                return (
                                    <button
                                        key={role.key}
                                        type="button"
                                        onClick={() => onSelect(role.key)}
                                        className={`w-full rounded-2xl px-4 py-3 text-left text-[14px] transition-all duration-200 ${value === role.key
                                            ? "bg-[#02acfa] text-white"
                                            : "text-black/68 hover:bg-[#02acfa]/10 hover:text-[#02acfa]"
                                            }`}
                                    >
                                        {roleLabel}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
        </div>
    );
}