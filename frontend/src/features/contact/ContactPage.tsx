"use client";

import {
    useEffect,
    useState,
    type ChangeEvent,
    type Dispatch,
    type FormEvent,
    type ReactNode,
    type SetStateAction,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiArrowUpRight,
    FiChevronDown,
    FiMail,
    FiMapPin,
    FiNavigation,
    FiPhone,
} from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type InfoIcon = "mail" | "phone" | "location";

type InfoItem = {
    id: string;
    icon: InfoIcon;
    title: LocalizedText;
    text: LocalizedText;
    href?: string;
    external?: boolean;
};

type DirectionLink = {
    id: string;
    label: LocalizedText;
    href: string;
};

type SubjectOption = {
    key: string;
    label: LocalizedText;
};

type ContactContentValue =
    | string
    | LocalizedText
    | InfoItem[]
    | DirectionLink[]
    | SubjectOption[]
    | Record<string, LocalizedText>;

type ContactContent = {
    key: string;
    value: ContactContentValue;
};

type ContactSection = {
    name?: string;
    contents?: ContactContent[];
};

type ContactPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: ContactSection[];
};

type ContactFormData = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    subjectType: string;
    message: string;
};

type FormErrors = Partial<Record<keyof ContactFormData | "agreement", string>>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const iconMap: Record<InfoIcon, ReactNode> = {
    mail: <FiMail />,
    phone: <FiPhone />,
    location: <FiMapPin />,
};

function normalizeLanguage(language: string): LanguageCode {
    const normalized = language.toLowerCase();

    if (normalized === "tr") return "tr";
    if (normalized === "en") return "en";
    if (normalized === "fr") return "fr";
    if (normalized === "ru") return "ru";

    return "tr";
}

function getContent<T>(contents: ContactContent[], key: string, fallback: T): T {
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

export default function ContactPage() {
    const { language } = useLanguage();

    const [contents, setContents] = useState<ContactContent[]>([]);
    const [subjectOpen, setSubjectOpen] = useState(false);
    const [agreementChecked, setAgreementChecked] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSending, setIsSending] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [formData, setFormData] = useState<ContactFormData>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        subjectType: "",
        message: "",
    });

    useEffect(() => {
        let isMounted = true;

        const fetchContactPage = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pages/ContactPage`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(
                        `ContactPage verisi alınamadı. Status: ${response.status}`
                    );
                }

                const data = (await response.json()) as ContactPageResponse;

                const contactSection =
                    data.sections?.find((section) => {
                        const sectionName = section.name?.toLowerCase();

                        return (
                            sectionName === "contact" ||
                            sectionName === "contactpage" ||
                            sectionName === "contact-page"
                        );
                    }) || data.sections?.[0];

                if (isMounted && contactSection?.contents) {
                    setContents(contactSection.contents);
                }
            } catch (error) {
                console.error("ContactPage verisi alınamadı:", error);
            }
        };

        fetchContactPage();

        return () => {
            isMounted = false;
        };
    }, []);

    const eyebrow = getText(
        getContent<LocalizedText>(contents, "eyebrow", {}),
        language
    );

    const title = getText(
        getContent<LocalizedText>(contents, "title", {}),
        language
    );

    const titleHighlight = getText(
        getContent<LocalizedText>(contents, "titleHighlight", {}),
        language
    );

    const infoItems = getContent<InfoItem[]>(contents, "infoItems", []);

    const directionTitle = getText(
        getContent<LocalizedText>(contents, "directionTitle", {}),
        language
    );

    const directionLinks = getContent<DirectionLink[]>(
        contents,
        "directionLinks",
        []
    );

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

    const subjectOptions = getContent<SubjectOption[]>(
        contents,
        "subjectOptions",
        []
    );

    const agreementUncheckedText = getText(
        getContent<LocalizedText>(contents, "agreementUncheckedText", {}),
        language
    );

    const agreementCheckedTextBefore = getText(
        getContent<LocalizedText>(contents, "agreementCheckedTextBefore", {}),
        language
    );

    const agreementCheckedLinkText = getText(
        getContent<LocalizedText>(contents, "agreementCheckedLinkText", {}),
        language
    );

    const agreementCheckedTextAfter = getText(
        getContent<LocalizedText>(contents, "agreementCheckedTextAfter", {}),
        language
    );

    const agreementLink = getContent<string>(contents, "agreementLink", "");

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

    const mapTitle = getText(
        getContent<LocalizedText>(contents, "mapTitle", {}),
        language
    );

    const mapSrc = getContent<string>(contents, "mapSrc", "");

    const selectedSubjectLabel = getText(
        subjectOptions.find((item) => item.key === formData.subjectType)?.label,
        language
    );

    const handleChange = (field: keyof ContactFormData, value: string) => {
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

    const getError = (key: string) => getText(formErrors[key], language);

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSending) return;

        const newErrors: FormErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = getError("required");
        if (!formData.lastName.trim()) newErrors.lastName = getError("required");
        if (!formData.phone.trim()) newErrors.phone = getError("required");

        if (!formData.email.trim()) {
            newErrors.email = getError("required");
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = getError("email") || getError("required");
        }

        if (!formData.subjectType) newErrors.subjectType = getError("subject");
        if (!formData.message.trim()) newErrors.message = getError("required");
        if (!agreementChecked) newErrors.agreement = getError("agreement");

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            setIsSending(true);
            setSubmitError("");

            const response = await fetch(`${API_BASE}/api/mail/send-mail`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.firstName,
                    surname: formData.lastName,
                    phone: formData.phone,
                    email: formData.email,
                    subjectType: selectedSubjectLabel || formData.subjectType,
                    message: `Konu: ${selectedSubjectLabel || formData.subjectType
                        }\n\n${formData.message}`,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || result.error || getError("sendFailed")
                );
            }

            setIsSubmitted(true);
            setFormData({
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                subjectType: "",
                message: "",
            });
            setAgreementChecked(false);
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
            <section className="mx-auto w-full max-w-[1500px] px-6 pt-32 pb-20 sm:px-8 md:px-10 lg:px-16 lg:pt-40 lg:pb-28">
                <div className="pt-6">
                    {eyebrow && (
                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65 }}
                            className="text-[11px] uppercase tracking-[0.34em] text-black/38"
                        >
                            {eyebrow}
                        </motion.p>
                    )}

                    {(title || titleHighlight) && (
                        <motion.h1
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.05 }}
                            className="mt-6 max-w-[1050px] text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-[58px] md:text-[78px] lg:text-[96px]"
                        >
                            {title}{" "}
                            <span className="text-[#02acfa]">{titleHighlight}</span>
                        </motion.h1>
                    )}
                </div>

                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 rounded-[28px] border border-[#02acfa]/20 bg-[#02acfa]/5 p-6 text-[#0d0d0d]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#02acfa] text-white">
                                <FaCheck />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    {successTitle || "Mesajınız gönderildi."}
                                </h2>

                                <p className="mt-2 text-sm leading-7 text-black/62">
                                    {successText || "En kısa sürede sizinle iletişime geçeceğiz."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.1 }}
                        className="lg:col-span-4"
                    >
                        <div className="mt-10 space-y-9">
                            {infoItems.map((item) => {
                                const itemTitle = getText(item.title, language);
                                const itemText = getText(item.text, language);

                                if (!itemTitle || !itemText) return null;

                                return (
                                    <InfoLine
                                        key={item.id}
                                        icon={iconMap[item.icon]}
                                        title={itemTitle}
                                        text={
                                            item.href ? (
                                                <a
                                                    href={item.href}
                                                    target={item.external ? "_blank" : undefined}
                                                    rel={item.external ? "noopener noreferrer" : undefined}
                                                    className="transition-colors duration-300 hover:text-[#02acfa]"
                                                >
                                                    {itemText}
                                                </a>
                                            ) : (
                                                itemText
                                            )
                                        }
                                    />
                                );
                            })}

                            {directionLinks.length > 0 && (
                                <div className="flex items-start gap-5">
                                    <div className="mt-1 text-[24px] text-[#02acfa] md:text-[26px]">
                                        <FiNavigation />
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-black/45 sm:text-[14px]">
                                            {directionTitle}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[17px] leading-8 text-black/70 sm:text-[18px]">
                                            {directionLinks.map((link) => {
                                                const linkLabel = getText(link.label, language);

                                                if (!linkLabel || !link.href) return null;

                                                return (
                                                    <a
                                                        key={link.id}
                                                        href={link.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="transition-colors duration-300 hover:text-[#02acfa]"
                                                    >
                                                        {linkLabel}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 34 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.14 }}
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
                            <SubjectSelect
                                label={getText(formLabels.subjectType, language)}
                                placeholder={getText(formPlaceholders.subjectType, language)}
                                selectedLabel={selectedSubjectLabel}
                                value={formData.subjectType}
                                error={errors.subjectType}
                                open={subjectOpen}
                                setOpen={setSubjectOpen}
                                options={subjectOptions}
                                language={language}
                                onSelect={(subjectKey) => {
                                    handleChange("subjectType", subjectKey);
                                    setSubjectOpen(false);
                                }}
                            />
                        </div>

                        <div className="mt-10">
                            <LineTextarea
                                label={getText(formLabels.message, language)}
                                placeholder={getText(formPlaceholders.message, language)}
                                value={formData.message}
                                error={errors.message}
                                onChange={(event) =>
                                    handleChange("message", event.target.value)
                                }
                            />
                        </div>

                        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <label className="group flex cursor-pointer items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAgreementChecked((prev) => !prev);
                                        setErrors((prev) => ({
                                            ...prev,
                                            agreement: "",
                                        }));
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
                                    {!agreementChecked ? (
                                        agreementUncheckedText || "KVKK metnini okudum ve onaylıyorum."
                                    ) : (
                                        <>
                                            {agreementCheckedTextBefore || "Lütfen"}{" "}
                                            {agreementLink && agreementCheckedLinkText && (
                                                <Link
                                                    href={agreementLink}
                                                    className="font-medium text-[#02acfa] transition-opacity duration-300 hover:opacity-80"
                                                >
                                                    {agreementCheckedLinkText}
                                                </Link>
                                            )}{" "}
                                            {agreementCheckedTextAfter || "metnini okuyunuz."}
                                        </>
                                    )}
                                </span>
                            </label>

                            {errors.agreement && (
                                <p className="text-[12px] text-red-500">
                                    {errors.agreement}
                                </p>
                            )}

                            {submitButtonText && (
                                <button
                                    type="submit"
                                    disabled={!agreementChecked || isSending}
                                    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-4 text-sm font-semibold text-white transition-all duration-300 ${agreementChecked && !isSending
                                        ? "cursor-pointer bg-[#181818] hover:bg-[#02acfa]"
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
                                        <FiArrowUpRight className="text-sm transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                                    </span>
                                </button>
                            )}
                        </div>

                        {submitError && (
                            <p className="mt-5 text-sm font-medium text-red-500">
                                {submitError}
                            </p>
                        )}
                    </motion.form>
                </div>

                {mapSrc && (
                    <motion.div
                        initial={{ opacity: 0, y: 34 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                        className="group mt-20 h-[320px] w-full overflow-hidden rounded-[32px] border border-black/10 bg-black/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.10)] md:h-[430px]"
                    >
                        <iframe
                            title={mapTitle || "Artech Software Konum"}
                            src={mapSrc}
                            className="h-full w-full border-0 transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </motion.div>
                )}
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
                    rows={5}
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

function SubjectSelect({
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
    options: SubjectOption[];
    language: string;
    onSelect: (subjectKey: string) => void;
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
                    className={`cursor-pointer group relative flex w-full items-center justify-between border-b bg-transparent pb-4 text-left text-[17px] outline-none transition-colors duration-300 ${error
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
                            {options.map((subject) => {
                                const optionLabel = getText(subject.label, language);

                                if (!optionLabel || !subject.key) return null;

                                return (
                                    <button
                                        key={subject.key}
                                        type="button"
                                        onClick={() => onSelect(subject.key)}
                                        className={`cursor-pointer w-full rounded-2xl px-4 py-3 text-left text-[14px] transition-all duration-200 ${value === subject.key
                                            ? "bg-[#02acfa] text-white"
                                            : "text-black/68 hover:bg-[#02acfa]/10 hover:text-[#02acfa]"
                                            }`}
                                    >
                                        {optionLabel}
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

function InfoLine({
    icon,
    title,
    text,
}: {
    icon: ReactNode;
    title: string;
    text: ReactNode;
}) {
    return (
        <div className="flex items-start gap-5">
            <div className="mt-1 text-[24px] text-[#02acfa] md:text-[26px]">
                {icon}
            </div>

            <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-black/45 sm:text-[14px]">
                    {title}
                </p>

                <p className="mt-3 whitespace-pre-line text-[17px] leading-8 text-black/70 sm:text-[18px]">
                    {text}
                </p>
            </div>
        </div>
    );
}