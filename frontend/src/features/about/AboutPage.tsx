"use client";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type AboutCard = {
    title: LocalizedText;
    desc: LocalizedText;
};

type LocalizedStringArray = Partial<Record<LanguageCode, string[]>>;

type AboutContentValue =
    | string
    | string[]
    | LocalizedText
    | LocalizedStringArray
    | AboutCard[];

type AboutContent = {
    key: string;
    value: AboutContentValue;
};

type AboutSection = {
    name?: string;
    contents?: AboutContent[];
};

type AboutPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: AboutSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getContent<T>(contents: AboutContent[], key: string, fallback: T): T {
    const found = contents.find((content) => content.key === key)?.value;

    if (found === undefined || found === null) {
        return fallback;
    }

    return found as T;
}

function normalizeLanguage(language: string): LanguageCode {
    const normalized = language.toLowerCase();

    if (normalized === "tr") return "tr";
    if (normalized === "en") return "en";
    if (normalized === "fr") return "fr";
    if (normalized === "ru") return "ru";

    return "tr";
}

function getText(value: LocalizedText | string | undefined, language: string) {
    if (!value) return "";

    if (typeof value === "string") return value;

    const lang = normalizeLanguage(language);

    return value[lang] || value.tr || value.en || value.fr || value.ru || "";
}

function getTextArray(
    value: LocalizedStringArray | string[] | undefined,
    language: string
): string[] {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    const lang = normalizeLanguage(language);

    return value[lang] || value.tr || value.en || value.fr || value.ru || [];
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

export default function AboutPage() {
    const { language } = useLanguage();

    const containerRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const [contents, setContents] = useState<AboutContent[]>([]);
    const [showScroll, setShowScroll] = useState(true);
    const [viewportHeight, setViewportHeight] = useState(900);
    const [viewportWidth, setViewportWidth] = useState(1200);
    const [revealedChars, setRevealedChars] = useState(1);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pages/AboutPage`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`About verisi alınamadı. Status: ${response.status}`);
                }

                const data = (await response.json()) as AboutPageResponse;

                const aboutSection = data.sections?.find(
                    (section) => section.name?.toLowerCase() === "about"
                );

                if (aboutSection?.contents) {
                    setContents(aboutSection.contents);
                }
            } catch (error) {
                console.error("About verisi alınamadı:", error);
            }
        };

        fetchAbout();
    }, []);

    useEffect(() => {
        const updateViewport = () => {
            setViewportHeight(window.innerHeight);
            setViewportWidth(window.innerWidth);
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);

        return () => window.removeEventListener("resize", updateViewport);
    }, []);

    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
    const isMediumScreen = viewportWidth >= 1024 && viewportWidth < 1536;

    const isShortHeight = viewportHeight < 760;
    const isVeryShortHeight = viewportHeight < 680;

    const codeTextClass = isVeryShortHeight
        ? "space-y-1 break-words font-mono text-[13px] leading-[1.55] sm:text-[14px] sm:leading-[1.6] md:text-[15px] md:leading-[1.65] lg:text-[16px] lg:leading-[1.7]"
        : isShortHeight
            ? "space-y-1 break-words font-mono text-[14px] leading-[1.65] sm:text-[15px] sm:leading-[1.7] md:text-[15px] md:leading-[1.75] lg:text-[17px] lg:leading-[1.75]"
            : "space-y-1.5 break-words font-mono text-sm leading-7 sm:text-base sm:leading-8 md:text-[16px] md:leading-[1.9] lg:text-[18px] lg:leading-relaxed";

    const titleClass = isVeryShortHeight
        ? "mb-5 text-2xl font-bold leading-tight sm:mb-6 sm:text-3xl md:mb-8 md:text-4xl lg:mb-10 lg:text-5xl"
        : isShortHeight
            ? "mb-6 text-2xl font-bold leading-tight sm:mb-8 sm:text-3xl md:mb-10 md:text-4xl lg:mb-12 lg:text-5xl"
            : "mb-8 text-2xl font-bold leading-tight sm:mb-10 sm:text-3xl md:mb-12 md:text-4xl lg:mb-14 lg:text-5xl";

    const contentWrapperClass = isVeryShortHeight
        ? "w-full max-w-4xl pb-12 md:max-w-5xl md:pb-14 lg:max-w-4xl"
        : isShortHeight
            ? "w-full max-w-4xl pb-16 md:max-w-5xl md:pb-16 lg:max-w-4xl"
            : "w-full max-w-4xl pb-24 md:max-w-5xl md:pb-20 lg:max-w-4xl";

    const pageTitlePrefix = getText(
        getContent<LocalizedText>(contents, "pageTitlePrefix", {}),
        language
    );

    const pageTitleHighlight = getText(
        getContent<LocalizedText>(contents, "pageTitleHighlight", {}),
        language
    );

    const scrollText = getText(
        getContent<LocalizedText>(contents, "scrollText", {}),
        language
    );

    const lines = getTextArray(
        getContent<LocalizedStringArray | string[]>(contents, "codeLines", []),
        language
    );

    const perspectiveEyebrow = getText(
        getContent<LocalizedText>(contents, "perspectiveEyebrow", {}),
        language
    );

    const perspectiveTitle = getText(
        getContent<LocalizedText>(contents, "perspectiveTitle", {}),
        language
    );

    const perspectiveHighlight = getText(
        getContent<LocalizedText>(contents, "perspectiveHighlight", {}),
        language
    );

    const perspectiveParagraph = getText(
        getContent<LocalizedText>(contents, "perspectiveParagraph", {}),
        language
    );

    const aboutCards = getContent<AboutCard[]>(contents, "aboutCards", []);

    const ctaImage = getPublicMediaUrl(getContent<string>(contents, "ctaImage", ""));
    const ctaEyebrow = getText(
        getContent<LocalizedText>(contents, "ctaEyebrow", {}),
        language
    );
    const ctaTitle = getText(
        getContent<LocalizedText>(contents, "ctaTitle", {}),
        language
    );
    const ctaHighlight = getText(
        getContent<LocalizedText>(contents, "ctaHighlight", {}),
        language
    );
    const ctaParagraph = getText(
        getContent<LocalizedText>(contents, "ctaParagraph", {}),
        language
    );
    const ctaButtonText = getText(
        getContent<LocalizedText>(contents, "ctaButtonText", {}),
        language
    );
    const ctaButtonLink = getContent<string>(contents, "ctaButtonLink", "");

    const joinedText = useMemo(() => lines.join("\n"), [lines]);
    const totalChars = joinedText.length;

    useEffect(() => {
        const measure = () => {
            if (contentRef.current) {
                setContentHeight(contentRef.current.scrollHeight);
            }
        };

        measure();

        let resizeObserver: ResizeObserver | undefined;

        if (typeof ResizeObserver !== "undefined" && contentRef.current) {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(contentRef.current);
        }

        window.addEventListener("resize", measure);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [revealedChars, viewportWidth, viewportHeight, codeTextClass, titleClass]);

    const totalHeight = Math.max(
        contentHeight + viewportHeight * 1.4,
        viewportHeight * 3
    );

    useEffect(() => {
        const handleScroll = () => {
            const el = containerRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const maxScroll = Math.max(el.offsetHeight - window.innerHeight, 1);
            const scrolled = Math.min(Math.max(-rect.top, 0), maxScroll);
            const progress = scrolled / maxScroll;

            setShowScroll(progress <= 0.04);

            const adjustedProgress = isMobile
                ? Math.min(progress * 1.02, 1)
                : isTablet
                    ? Math.min(progress * 1.01, 1)
                    : isMediumScreen
                        ? Math.min(progress * 1.005, 1)
                        : progress;

            const chars = Math.max(1, Math.floor(adjustedProgress * totalChars));
            setRevealedChars(chars);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [
        viewportHeight,
        viewportWidth,
        isMobile,
        isTablet,
        isMediumScreen,
        totalChars,
    ]);

    const revealData = useMemo(() => {
        let remaining = revealedChars;
        const fullyVisibleLines: string[] = [];
        let activeLine = "";
        let activeLineIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length;

            if (remaining > lineLength) {
                fullyVisibleLines.push(lines[i]);
                remaining -= lineLength + 1;
            } else {
                activeLine = lines[i].slice(0, Math.max(0, remaining));
                activeLineIndex = i;
                break;
            }
        }

        if (activeLineIndex === -1 && lines.length > 0) {
            activeLineIndex = lines.length - 1;
            activeLine = lines[lines.length - 1];
        }

        return {
            fullyVisibleLines,
            activeLine,
            activeLineIndex,
        };
    }, [revealedChars, lines]);

    return (
        <>
            <section
                ref={containerRef}
                className="relative bg-[#0d0d0d] text-white"
                style={{ height: `${totalHeight}px` }}
            >
                <div
                    className={`sticky top-[72px] md:top-[90px] min-h-[calc(100dvh-72px)] md:min-h-[calc(100vh-90px)] flex items-start justify-center overflow-visible px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 ${isVeryShortHeight
                        ? "pt-4 sm:pt-5 md:pt-5 lg:pt-6"
                        : isShortHeight
                            ? "pt-5 sm:pt-6 md:pt-6 lg:pt-8"
                            : "pt-6 sm:pt-8 md:pt-8 lg:pt-10 xl:pt-12"
                        }`}
                >
                    <div className={contentWrapperClass}>
                        <h1 className={titleClass}>
                            {pageTitlePrefix}{" "}
                            <span className="text-[#02acfa]">{pageTitleHighlight}</span>
                        </h1>

                        <div ref={contentRef} className={codeTextClass}>
                            {revealData.fullyVisibleLines.map((line, i) => (
                                <div key={i}>{highlight(line)}</div>
                            ))}

                            {revealData.activeLineIndex >= 0 && (
                                <div>
                                    {highlight(revealData.activeLine)}
                                    <span className="animate-pulse text-[#02acfa]">█</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showScroll && scrollText && (
                    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center text-white/60 animate-bounce">
                            <span className="mb-2 text-xs tracking-widest sm:text-sm">
                                {scrollText}
                            </span>

                            <div className="relative h-8 w-[2px] overflow-hidden bg-white/30 sm:h-10">
                                <div className="absolute left-0 top-0 h-1/2 w-full animate-[scrollLine_1.4s_ease-in-out_infinite] bg-[#02acfa]" />
                            </div>

                            <span className="mt-2 text-lg sm:text-xl">↓</span>
                        </div>
                    </div>
                )}
            </section>

            <section className="relative overflow-hidden bg-[#e8e8e8] px-4 py-16 sm:px-6 md:px-10 lg:px-16 xl:px-20 md:py-20">
                <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#02acfa]/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-[#02acfa]/10 blur-3xl" />

                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="mb-12 text-center md:mb-16"
                    >
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#02acfa] sm:text-sm">
                            {perspectiveEyebrow}
                        </p>

                        <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0d0d0d] sm:text-4xl md:text-5xl lg:text-6xl">
                            {perspectiveTitle}
                            <span className="block text-[#02acfa]">
                                {perspectiveHighlight}
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#0d0d0d]/65 sm:text-base md:text-lg md:leading-8">
                            {perspectiveParagraph}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-12">
                        {aboutCards.map((card, index) => (
                            <motion.div
                                key={`${getText(card.title, language)}-${index}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.18 }}
                                transition={{
                                    duration: 0.35,
                                    delay: index * 0.05,
                                    ease: "easeOut",
                                }}
                                whileHover={{ y: -6, scale: 1.01 }}
                                className="group relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-150 ease-out sm:p-7 md:p-8 xl:col-span-4"
                            >
                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#02acfa]/10 blur-2xl" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#02acfa]/[0.05] via-transparent to-transparent" />
                                </div>

                                <div className="relative z-10">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#02acfa]/20 bg-[#02acfa]/10 text-sm font-semibold text-[#02acfa] transition-all duration-150 ease-out group-hover:scale-105 group-hover:border-[#02acfa]/40 group-hover:bg-[#02acfa]/15">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-[#02acfa]/40 to-transparent transition-all duration-150 ease-out group-hover:from-[#02acfa]/80" />
                                    </div>

                                    <h3 className="max-w-sm text-xl font-bold leading-tight text-[#0d0d0d] transition-colors duration-150 ease-out group-hover:text-[#02131d] md:text-2xl">
                                        {getText(card.title, language)}
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-[#0d0d0d]/70 transition-colors duration-150 ease-out group-hover:text-[#0d0d0d]/80 md:text-base">
                                        {getText(card.desc, language)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {ctaImage && (
                <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[460px] md:min-h-[540px] lg:min-h-[620px] xl:min-h-[680px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
                        style={{ backgroundImage: `url(${ctaImage})` }}
                    />

                    <div className="absolute inset-0 bg-black/45" />

                    <div className="relative z-10 flex min-h-[420px] items-center py-14 sm:min-h-[460px] sm:py-16 md:min-h-[540px] md:py-20 lg:min-h-[620px] lg:py-24 xl:min-h-[680px] px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
                        <div className="mx-auto w-full max-w-6xl">
                            <div className="max-w-[760px] text-center md:max-w-[720px] md:text-left lg:max-w-[820px]">
                                <motion.p
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.25 }}
                                    transition={{ duration: 0.6 }}
                                    className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#02acfa] sm:mb-4 sm:text-xs md:text-sm"
                                >
                                    {ctaEyebrow}
                                </motion.p>

                                <motion.h2
                                    initial={{ opacity: 0, y: 60 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.25 }}
                                    transition={{ duration: 0.8 }}
                                    className="text-balance mb-4 text-[clamp(2rem,5vw,4.75rem)] font-bold leading-[1.05] tracking-[-0.035em] text-[#e8e8e8] sm:mb-5 md:mb-6"
                                >
                                    {ctaTitle}
                                    <span className="mt-2 block text-[#02acfa]">
                                        {ctaHighlight}
                                    </span>
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 60 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.25 }}
                                    transition={{ duration: 1 }}
                                    className="mx-auto mb-7 max-w-[640px] text-sm leading-7 text-white/85 sm:text-base sm:leading-8 md:mx-0 md:mb-8 md:max-w-[680px] md:text-lg md:leading-8 lg:text-[19px] lg:leading-9"
                                >
                                    {ctaParagraph}
                                </motion.p>

                                {ctaButtonLink && ctaButtonText && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 60 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.25 }}
                                        transition={{ duration: 1.2 }}
                                        className="flex justify-center md:justify-start"
                                    >
                                        <Link
                                            href={ctaButtonLink}
                                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#02acfa] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#181818] cursor-pointer sm:px-8 md:px-10 md:text-base"
                                        >
                                            <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />

                                            <span className="relative z-10 flex items-center gap-3">
                                                {ctaButtonText}
                                                <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <style jsx global>{`
        @keyframes scrollLine {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(200%);
          }
        }
      `}</style>
        </>
    );
}

function highlight(line: string): ReactNode {
    if (line.startsWith("@import")) {
        return <span className="text-purple-400">{line}</span>;
    }

    if (line.startsWith("const")) {
        return <span className="text-[#02acfa]">{line}</span>;
    }

    if (line.startsWith("//")) {
        return <span className="text-green-400">{line}</span>;
    }

    if (line.startsWith("export")) {
        return <span className="text-pink-400">{line}</span>;
    }

    return <span className="text-white/90">{line}</span>;
}