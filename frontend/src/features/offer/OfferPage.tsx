"use client";

import {
    useEffect,
    useState,
    type KeyboardEvent,
    type ChangeEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type OfferOption = {
    key: string;
    label: LocalizedText;
};

type OfferSteps = Record<string, LocalizedText>;
type OfferPlaceholders = Record<string, LocalizedText>;
type OfferErrors = Record<string, LocalizedText>;
type OfferButtons = Record<string, LocalizedText>;

type OfferKvkk = {
    link: string;
    linkText: LocalizedText;
    textAfter: LocalizedText;
};

type OfferSubmitted = {
    title: LocalizedText;
    description: LocalizedText;
};

type OfferContentValue =
    | string
    | LocalizedText
    | OfferOption[]
    | OfferSteps
    | OfferPlaceholders
    | OfferErrors
    | OfferKvkk
    | OfferButtons
    | OfferSubmitted;

type OfferContent = {
    key: string;
    value: OfferContentValue;
};

type OfferSection = {
    name?: string;
    contents?: OfferContent[];
};

type OfferPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: OfferSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_TOTAL_STEPS = 5;

function normalizeLanguage(language: string): LanguageCode {
    const normalized = language.toLowerCase();

    if (normalized === "tr") return "tr";
    if (normalized === "en") return "en";
    if (normalized === "fr") return "fr";
    if (normalized === "ru") return "ru";

    return "tr";
}

function getContent<T>(contents: OfferContent[], key: string, fallback: T): T {
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

function getPublicMediaUrl(path: unknown): string {
    if (typeof path !== "string") return "";

    const cleanPath = path.trim();

    if (!cleanPath) return "";

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
        return cleanPath;
    }

    if (cleanPath.startsWith("/")) {
        return cleanPath;
    }

    return `/${cleanPath}`;
}

export default function OfferPage() {
    const router = useRouter();
    const { language } = useLanguage();

    const [contents, setContents] = useState<OfferContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [selectedOption, setSelectedOption] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [details, setDetails] = useState("");
    const [kvkkApproved, setKvkkApproved] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [showError, setShowError] = useState(false);
    const [companyError, setCompanyError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [detailsError, setDetailsError] = useState(false);
    const [kvkkError, setKvkkError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchOfferPage = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pages/OfferPage`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`OfferPage verisi alınamadı. Status: ${response.status}`);
                }

                const data = (await response.json()) as OfferPageResponse;

                const offerSection =
                    data.sections?.find((section) => {
                        const sectionName = section.name?.toLowerCase();

                        return (
                            sectionName === "offer-page" ||
                            sectionName === "offerpage" ||
                            sectionName === "offer"
                        );
                    }) || data.sections?.[0];

                if (isMounted && offerSection?.contents) {
                    setContents(offerSection.contents);
                }
            } catch (error) {
                console.error("OfferPage verisi alınamadı:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOfferPage();

        return () => {
            isMounted = false;
        };
    }, []);

    const logo = getPublicMediaUrl(
        getContent<string>(contents, "logo", "/images/logos/l1.png")
    );

    const totalStepsValue = Number(
        getContent<string>(contents, "totalSteps", String(DEFAULT_TOTAL_STEPS))
    );

    const totalSteps = Number.isFinite(totalStepsValue)
        ? totalStepsValue
        : DEFAULT_TOTAL_STEPS;

    const options = getContent<OfferOption[]>(contents, "options", []);

    const steps = getContent<OfferSteps>(contents, "steps", {});
    const placeholders = getContent<OfferPlaceholders>(contents, "placeholders", {});
    const errors = getContent<OfferErrors>(contents, "errors", {});
    const buttons = getContent<OfferButtons>(contents, "buttons", {});

    const kvkk = getContent<OfferKvkk>(contents, "kvkk", {
        link: "/kvkk",
        linkText: {},
        textAfter: {},
    });

    const submitted = getContent<OfferSubmitted>(contents, "submitted", {
        title: {},
        description: {},
    });

    const selectedOptionLabel = getText(
        options.find((option) => option.key === selectedOption)?.label,
        language
    );

    const progressWidth = `${(step / totalSteps) * 100}%`;

    const getStepTitle = (key: string) => getText(steps[key], language);
    const getPlaceholder = (key: string) => getText(placeholders[key], language);
    const getErrorText = (key: string) => getText(errors[key], language);
    const getButtonText = (key: string) => getText(buttons[key], language);

    const handleBack = () => router.back();
    const handleLogoClick = () => router.push("/");
    const handleGoHome = () => router.push("/");

    const handleSelect = (optionKey: string) => {
        setSelectedOption(optionKey);
        setShowError(false);
    };

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    };

    const isValidPhone = (value: string) => {
        const cleaned = value.replace(/\s+/g, "").trim();
        return /^(\+90|0)?5\d{9}$/.test(cleaned);
    };

    const sendOfferMail = async () => {
        const response = await fetch(`${API_BASE}/api/mail/send-offer-mail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                selectedOption: selectedOptionLabel || selectedOption,
                companyName,
                email,
                phone,
                details,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || getErrorText("sendFailed"));
        }

        return result;
    };

    const goToPrevStep = () => {
        if (step <= 1 || isSubmitted || isSending) return;
        setStep((prev) => prev - 1);
    };

    const goToNextStep = async () => {
        if (isSubmitted || isSending) return;

        setSubmitError("");

        if (step === 1) {
            if (!selectedOption) {
                setShowError(true);
                return;
            }

            setShowError(false);
            setStep(2);
            return;
        }

        if (step === 2) {
            if (!companyName.trim()) {
                setCompanyError(true);
                return;
            }

            setCompanyError(false);
            setStep(3);
            return;
        }

        if (step === 3) {
            if (!isValidEmail(email)) {
                setEmailError(true);
                return;
            }

            setEmailError(false);
            setStep(4);
            return;
        }

        if (step === 4) {
            if (!isValidPhone(phone)) {
                setPhoneError(true);
                return;
            }

            setPhoneError(false);
            setStep(5);
            return;
        }

        if (step === 5) {
            if (!details.trim()) {
                setDetailsError(true);
                setKvkkError(false);
                return;
            }

            setDetailsError(false);

            if (!kvkkApproved) {
                setKvkkError(true);
                return;
            }

            setKvkkError(false);

            try {
                setIsSending(true);
                await sendOfferMail();
                setIsSubmitted(true);
            } catch (error) {
                setSubmitError(
                    error instanceof Error ? error.message : getErrorText("sendFailed")
                );
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            void goToNextStep();
        }
    };

    const handleTextareaKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void goToNextStep();
        }
    };

    const handleDetailsChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDetails(event.target.value);
        setDetailsError(false);

        if (event.target.value.trim()) {
            setKvkkError(false);
        }
    };

    const stepMotionProps = {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -18 },
        transition: { duration: 0.28, ease: "easeOut" },
    } as const;

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#0d0d0d] px-4 text-white sm:px-6 lg:px-8">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-[#02acfa]" />
                </div>
            </main>
        );
    }

    return (
        <>
            <style>{`
        @property --sweep-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes sweepBorder {
          0% { --sweep-angle: 0deg; }
          100% { --sweep-angle: 360deg; }
        }

        .offer-border-animate {
          animation: sweepBorder 0.48s ease forwards;
        }

        .offer-border-static {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          border: 1.5px solid rgba(255, 255, 255, 0.10);
        }

        .offer-border-layer {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 1.5px;
          background: conic-gradient(
            from 225deg,
            #02acfa 0deg,
            #02acfa var(--sweep-angle),
            rgba(255,255,255,0.10) var(--sweep-angle),
            rgba(255,255,255,0.10) 360deg
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .offer-textarea-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .offer-textarea-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .offer-textarea-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
        }

        .offer-textarea-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
        }
      `}</style>

            <main className="min-h-screen bg-[#0d0d0d] px-4 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
                    <div className="mx-auto flex w-full max-w-5xl items-center justify-between pt-6 sm:pt-8">
                        <button
                            type="button"
                            onClick={handleLogoClick}
                            className="cursor-pointer transition-opacity duration-300 hover:opacity-85"
                            aria-label="Anasayfaya git"
                        >
                            {logo && (
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    width={180}
                                    height={72}
                                    className="h-10 w-auto select-none object-contain sm:h-12 md:h-14"
                                    draggable={false}
                                    priority
                                    unoptimized
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="group flex h-11 w-11 cursor-pointer items-center justify-center bg-transparent"
                            aria-label="Geri dön"
                        >
                            <X className="h-6 w-6 text-white transition-all duration-300 group-hover:rotate-90 group-hover:text-[#02acfa]" />
                        </button>
                    </div>

                    {isSubmitted ? (
                        <div className="flex flex-1 items-center justify-center py-10">
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full max-w-2xl text-center"
                            >
                                <div className="mb-5 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#02acfa]/30 bg-[#02acfa]/10">
                                        <Check
                                            className="h-8 w-8 text-[#02acfa]"
                                            strokeWidth={3}
                                        />
                                    </div>
                                </div>

                                <h1 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
                                    {getText(submitted.title, language)}
                                </h1>

                                <p className="mx-auto max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                                    {getText(submitted.description, language)}
                                </p>

                                <div className="mt-8">
                                    <button
                                        type="button"
                                        onClick={handleGoHome}
                                        className="cursor-pointer rounded-xl bg-[#02acfa] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:text-base"
                                    >
                                        {getButtonText("home")}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-1 items-center justify-center py-10">
                                <div className="w-full max-w-5xl">
                                    <AnimatePresence mode="wait">
                                        <motion.div key={step} {...stepMotionProps}>
                                            {step === 1 && (
                                                <>
                                                    <h1 className="mb-10 text-left text-2xl font-semibold">
                                                        1→ {getStepTitle("step1Title")}{" "}
                                                        <span className="text-[#02acfa]">*</span>
                                                    </h1>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                        {options.map((option) => {
                                                            const label = getText(option.label, language);
                                                            const isSelected = selectedOption === option.key;

                                                            if (!label) return null;

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={option.key}
                                                                    onClick={() => handleSelect(option.key)}
                                                                    className="relative min-h-[84px] cursor-pointer rounded-2xl text-left"
                                                                >
                                                                    {!isSelected && (
                                                                        <div className="offer-border-static" />
                                                                    )}

                                                                    {isSelected && (
                                                                        <div className="offer-border-layer offer-border-animate" />
                                                                    )}

                                                                    <div className="relative h-full rounded-2xl bg-white/5 px-5 py-5">
                                                                        {isSelected && (
                                                                            <Check className="absolute right-3 top-3 h-5 w-5 text-[#02acfa]" />
                                                                        )}

                                                                        <span className="text-white/90">
                                                                            {label}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="relative mt-4 h-0">
                                                        {showError && (
                                                            <p className="absolute left-0 top-0 text-red-500">
                                                                {getErrorText("optionRequired")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {step === 2 && (
                                                <>
                                                    <h1 className="mb-10 text-left text-2xl font-semibold">
                                                        2→ {getStepTitle("step2Title")}{" "}
                                                        <span className="text-[#02acfa]">*</span>
                                                    </h1>

                                                    <div className="relative w-full max-w-xl">
                                                        <input
                                                            type="text"
                                                            value={companyName}
                                                            onChange={(event) => {
                                                                setCompanyName(event.target.value);
                                                                setCompanyError(false);
                                                            }}
                                                            onKeyDown={handleInputKeyDown}
                                                            placeholder={getPlaceholder("companyName")}
                                                            className="peer w-full bg-transparent py-3 text-white outline-none placeholder:text-white/40"
                                                        />

                                                        <div className="h-[1px] w-full bg-white/20" />
                                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                                                        {companyError && (
                                                            <p className="absolute left-0 top-full mt-2 text-red-500">
                                                                {getErrorText("companyRequired")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {step === 3 && (
                                                <>
                                                    <h1 className="mb-10 text-left text-2xl font-semibold">
                                                        3→ {getStepTitle("step3Title")}{" "}
                                                        <span className="text-[#02acfa]">*</span>
                                                    </h1>

                                                    <div className="relative w-full max-w-xl">
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(event) => {
                                                                setEmail(event.target.value);
                                                                setEmailError(false);
                                                            }}
                                                            onKeyDown={handleInputKeyDown}
                                                            placeholder={getPlaceholder("email")}
                                                            className="peer w-full bg-transparent py-3 text-white outline-none placeholder:text-white/40"
                                                        />

                                                        <div className="h-[1px] w-full bg-white/20" />
                                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                                                        {emailError && (
                                                            <p className="absolute left-0 top-full mt-2 text-red-500">
                                                                {getErrorText("emailInvalid")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {step === 4 && (
                                                <>
                                                    <h1 className="mb-10 text-left text-2xl font-semibold">
                                                        4→ {getStepTitle("step4Title")}{" "}
                                                        <span className="text-[#02acfa]">*</span>
                                                    </h1>

                                                    <div className="relative w-full max-w-xl">
                                                        <input
                                                            type="tel"
                                                            value={phone}
                                                            onChange={(event) => {
                                                                setPhone(event.target.value);
                                                                setPhoneError(false);
                                                            }}
                                                            onKeyDown={handleInputKeyDown}
                                                            placeholder={getPlaceholder("phone")}
                                                            className="peer w-full bg-transparent py-3 text-white outline-none placeholder:text-white/40"
                                                        />

                                                        <div className="h-[1px] w-full bg-white/20" />
                                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                                                        {phoneError && (
                                                            <p className="absolute left-0 top-full mt-2 text-red-500">
                                                                {getErrorText("phoneInvalid")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {step === 5 && (
                                                <>
                                                    <h1 className="mb-10 text-left text-2xl font-semibold">
                                                        5→ {getStepTitle("step5Title")}{" "}
                                                        <span className="text-[#02acfa]">*</span>
                                                    </h1>

                                                    <div className="relative w-full max-w-2xl">
                                                        <textarea
                                                            value={details}
                                                            onChange={handleDetailsChange}
                                                            onKeyDown={handleTextareaKeyDown}
                                                            placeholder={getPlaceholder("details")}
                                                            rows={6}
                                                            className="offer-textarea-scroll w-full resize-none overflow-y-auto bg-transparent py-3 text-white outline-none placeholder:text-white/40"
                                                        />

                                                        <div className="mt-5 h-[1px] w-full bg-white/20" />
                                                        <div className="absolute bottom-[0px] left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 focus-within:w-full" />

                                                        <p className="mt-3 text-xs text-white/45">
                                                            {getButtonText("textareaHint")}
                                                        </p>

                                                        <label className="mt-4 flex cursor-pointer items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={kvkkApproved}
                                                                onChange={(event) => {
                                                                    setKvkkApproved(event.target.checked);
                                                                    setKvkkError(false);
                                                                }}
                                                                className="mt-1 h-4 w-4 cursor-pointer accent-[#02acfa]"
                                                            />

                                                            <span className="cursor-pointer text-sm text-white/80">
                                                                <Link
                                                                    href={kvkk.link || "/kvkk"}
                                                                    className="text-[#02acfa] transition-opacity duration-300 hover:opacity-80"
                                                                >
                                                                    {getText(kvkk.linkText, language)}
                                                                </Link>
                                                                {getText(kvkk.textAfter, language)}
                                                            </span>
                                                        </label>

                                                        {detailsError && (
                                                            <p className="absolute left-0 top-full mt-2 text-red-500">
                                                                {getErrorText("detailsRequired")}
                                                            </p>
                                                        )}

                                                        {kvkkError && (
                                                            <p className="absolute left-0 top-full mt-2 text-red-500">
                                                                {getErrorText("kvkkRequired")}
                                                            </p>
                                                        )}

                                                        {submitError && (
                                                            <p className="mt-4 text-red-500">
                                                                {submitError}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="mt-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                                        <span className="text-xs text-white/45">
                                            {getButtonText("enterHint")}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => void goToNextStep()}
                                            disabled={isSending}
                                            className={`rounded-xl bg-[#02acfa] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ${isSending
                                                ? "cursor-not-allowed opacity-70"
                                                : "cursor-pointer hover:scale-[1.03]"
                                                }`}
                                        >
                                            {isSending
                                                ? getButtonText("sending")
                                                : step === 5
                                                    ? getButtonText("send")
                                                    : getButtonText("next")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-5xl pb-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-white/35">
                                        {step}/{totalSteps}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={goToPrevStep}
                                            disabled={step === 1 || isSending}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${step === 1 || isSending
                                                ? "cursor-not-allowed bg-white/5 text-white/20"
                                                : "cursor-pointer bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                                                }`}
                                            aria-label="Önceki adım"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => void goToNextStep()}
                                            disabled={step === totalSteps || isSending}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${step === totalSteps || isSending
                                                ? "cursor-not-allowed bg-white/5 text-white/20"
                                                : "cursor-pointer bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                                                }`}
                                            aria-label="Sonraki adıma git"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[3px] w-full rounded-full bg-white/10">
                                    <div
                                        className="h-full bg-[#02acfa] transition-all duration-500"
                                        style={{ width: progressWidth }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}