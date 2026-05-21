"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

import ProjectCard from "./components/ProjectCard";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;
type LocalizedStringArray = Partial<Record<LanguageCode, string[]>>;

type ProjectTab = {
    key: string;
    label: LocalizedText;
};

type ProjectItem = {
    id: number;
    slug: string;
    categoryKey: string;
    type: LocalizedText;
    company: LocalizedText;
    description: LocalizedText;
    year: string;
    primaryImage: string;
    secondaryImage: string;
};

type ProjectHighlight = {
    id: number;
    title: LocalizedText;
    text: LocalizedText;
};

type ProjectsContentValue =
    | string
    | LocalizedText
    | LocalizedStringArray
    | ProjectTab[]
    | ProjectItem[]
    | ProjectHighlight[];

type ProjectsContent = {
    key: string;
    value: ProjectsContentValue;
};

type ProjectsSection = {
    name?: string;
    contents?: ProjectsContent[];
};

type ProjectsPageResponse = {
    pageKey?: string;
    title?: string;
    sections?: ProjectsSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

function normalizeLanguage(language: string): LanguageCode {
    const normalized = language.toLowerCase();

    if (normalized === "tr") return "tr";
    if (normalized === "en") return "en";
    if (normalized === "fr") return "fr";
    if (normalized === "ru") return "ru";

    return "tr";
}

function getContent<T>(
    contents: ProjectsContent[],
    key: string,
    fallback: T
): T {
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
    value: LocalizedStringArray | string[] | undefined,
    language: string
): string[] {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    const lang = normalizeLanguage(language);

    return value[lang] || value.tr || value.en || value.fr || value.ru || [];
}

function buildRow(words: string[], repeatCount = 3) {
    const result: string[] = [];

    for (let i = 0; i < repeatCount; i++) {
        result.push(...words);
    }

    return result;
}

type MarqueeRowProps = {
    items: string[];
    direction: "left" | "right";
    progress: MotionValue<number>;
};

function MarqueeRow({ items, direction, progress }: MarqueeRowProps) {
    const x = useTransform(
        progress,
        [0, 1],
        direction === "right" ? [-120, 120] : [120, -120]
    );

    return (
        <div className="overflow-hidden">
            <motion.div
                style={{ x }}
                className="flex w-max items-center gap-10 whitespace-nowrap"
            >
                {items.map((item, index) => {
                    const outlined = index % 2 === 1;

                    return (
                        <span
                            key={`${item}-${index}`}
                            className={[
                                "select-none font-extrabold uppercase leading-none tracking-tight",
                                "text-[21px] sm:text-[29px] md:text-[44px] lg:text-[56px]",
                                outlined
                                    ? "text-transparent [-webkit-text-stroke:1.5px_#7a7a7a]"
                                    : "text-[#111111]",
                            ].join(" ")}
                        >
                            {item}
                        </span>
                    );
                })}
            </motion.div>
        </div>
    );
}

type ProjectsScrollTextSectionProps = {
    words: string[];
};

function ProjectsScrollTextSection({ words }: ProjectsScrollTextSectionProps) {
    const sectionRef = useRef<HTMLElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const rows = useMemo(
        () => [
            buildRow(words, 3),
            buildRow([...words].reverse(), 3),
            buildRow(words, 3),
            buildRow([...words].reverse(), 3),
        ],
        [words]
    );

    return (
        <section
            ref={sectionRef}
            className="bg-[#e8e8e8] pt-16 md:pt-24 pb-10 md:pb-14"
        >
            <div className="space-y-4 md:space-y-6">
                <MarqueeRow items={rows[0]} direction="right" progress={scrollYProgress} />
                <MarqueeRow items={rows[1]} direction="left" progress={scrollYProgress} />
                <MarqueeRow items={rows[2]} direction="right" progress={scrollYProgress} />
                <MarqueeRow items={rows[3]} direction="left" progress={scrollYProgress} />
            </div>
        </section>
    );
}

type ProjectsTabsProps = {
    tabs: ProjectTab[];
    activeTabKey: string;
    language: string;
    onTabChange: (tabKey: string) => void;
};

function ProjectsTabs({
    tabs,
    activeTabKey,
    language,
    onTabChange,
}: ProjectsTabsProps) {
    if (tabs.length === 0) return null;

    return (
        <section className="bg-[#e8e8e8] px-4 md:px-10 pb-8 md:pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap gap-3 justify-center">
                    {tabs.map((tab) => {
                        const label = getText(tab.label, language);
                        const isActive = activeTabKey === tab.key;

                        if (!tab.key || !label) return null;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => onTabChange(tab.key)}
                                className="relative px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium overflow-hidden cursor-pointer"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeProjectTab"
                                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                        className="absolute inset-0 rounded-full bg-[#02acfa]"
                                    />
                                )}

                                <span
                                    className={`relative z-10 transition-colors duration-300 ${isActive ? "text-white" : "text-[#181818]"
                                        }`}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

type ProjectsShowcaseIntroProps = {
    contents: ProjectsContent[];
    language: string;
};

function ProjectsShowcaseIntro({
    contents,
    language,
}: ProjectsShowcaseIntroProps) {
    const introBadge = getText(
        getContent<LocalizedText>(contents, "introBadge", {}),
        language
    );

    const introTitleBefore = getText(
        getContent<LocalizedText>(contents, "introTitleBefore", {}),
        language
    );

    const introTitleHighlight = getText(
        getContent<LocalizedText>(contents, "introTitleHighlight", {}),
        language
    );

    const introTitleAfter = getText(
        getContent<LocalizedText>(contents, "introTitleAfter", {}),
        language
    );

    const introParagraph = getText(
        getContent<LocalizedText>(contents, "introParagraph", {}),
        language
    );

    const introTags = getTextArray(
        getContent<LocalizedStringArray>(contents, "introTags", {}),
        language
    );

    const highlights = getContent<ProjectHighlight[]>(
        contents,
        "projectHighlights",
        []
    );

    return (
        <section className="bg-[#e8e8e8] pt-6 md:pt-10 pb-24 md:pb-32">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="xl:col-span-7 rounded-[32px] border border-white/50 bg-white/60 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
                    >
                        {introBadge && (
                            <div className="inline-flex items-center rounded-full border border-[#02acfa]/20 bg-[#02acfa]/10 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#028ac9]">
                                {introBadge}
                            </div>
                        )}

                        {(introTitleBefore || introTitleHighlight || introTitleAfter) && (
                            <motion.h2
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                                className="mt-6 text-3xl sm:text-4xl md:text-5xl leading-[1.05] font-semibold tracking-tight text-[#111111]"
                            >
                                {introTitleBefore}{" "}
                                {introTitleHighlight && (
                                    <span className="text-[#02acfa]">{introTitleHighlight}</span>
                                )}{" "}
                                {introTitleAfter}
                            </motion.h2>
                        )}

                        {introParagraph && (
                            <motion.p
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
                                className="mt-6 max-w-3xl text-sm sm:text-base md:text-lg leading-7 text-[#555555]"
                            >
                                {introParagraph}
                            </motion.p>
                        )}

                        {introTags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: 0.7, delay: 0.26, ease: "easeOut" }}
                                className="mt-8 flex flex-wrap gap-3"
                            >
                                {introTags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium ${index === 0
                                            ? "bg-[#111111] text-white"
                                            : "bg-white text-[#111111] border border-black/10"
                                            }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.005, ease: "easeOut" }}
                        className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4"
                    >
                        {highlights.map((item, index) => {
                            const title = getText(item.title, language);
                            const text = getText(item.text, language);

                            if (!title && !text) return null;

                            return (
                                <motion.div
                                    key={`${item.id}-${index}`}
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group rounded-[28px] bg-[#111111] text-white p-6 sm:p-6 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.16)] hover:-translate-y-1 transition-transform duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/45">
                                            {String(item.id).padStart(2, "0")}
                                        </span>
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#02acfa]" />
                                    </div>

                                    {title && (
                                        <h3 className="mt-6 text-lg sm:text-xl font-semibold leading-snug">
                                            {title}
                                        </h3>
                                    )}

                                    {text && (
                                        <p className="mt-3 text-sm sm:text-[15px] leading-7 text-white/70">
                                            {text}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default function ProjectsPage() {
    const { language } = useLanguage();

    const router = useRouter();
    const searchParams = useSearchParams();

    const [contents, setContents] = useState<ProjectsContent[]>([]);

    useEffect(() => {
        const fetchProjectsPage = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/pages/ProjectsPage`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(
                        `ProjectsPage verisi alınamadı. Status: ${response.status}`
                    );
                }

                const data = (await response.json()) as ProjectsPageResponse;

                const projectsSection =
                    data.sections?.find((section) => {
                        const sectionName = section.name?.toLowerCase();

                        return (
                            sectionName === "projects" ||
                            sectionName === "projectspage" ||
                            sectionName === "projects-page"
                        );
                    }) || data.sections?.[0];

                if (projectsSection?.contents) {
                    setContents(projectsSection.contents);
                }
            } catch (error) {
                console.error("ProjectsPage verisi alınamadı:", error);
            }
        };

        fetchProjectsPage();
    }, []);

    const projectWords = getTextArray(
        getContent<LocalizedStringArray>(contents, "projectWords", {}),
        language
    );

    const tabs = getContent<ProjectTab[]>(contents, "tabs", []);

    const projects = getContent<ProjectItem[]>(contents, "projects", []);

    const emptyText = getText(
        getContent<LocalizedText>(contents, "emptyText", {}),
        language
    );

    const validTabKeys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);

    const activeTabKey = useMemo(() => {
        const category = searchParams.get("category");

        if (!category) return "all";

        return validTabKeys.includes(category) ? category : "all";
    }, [searchParams, validTabKeys]);

    const handleTabChange = (tabKey: string) => {
        if (tabKey === "all") {
            router.push("/projects");
            return;
        }

        router.push(`/projects?category=${encodeURIComponent(tabKey)}`);
    };

    const filteredProjects = useMemo(() => {
        if (activeTabKey === "all") return projects;

        return projects.filter((project) => project.categoryKey === activeTabKey);
    }, [activeTabKey, projects]);

    return (
        <main className="bg-[#e8e8e8] min-h-screen">
            {projectWords.length > 0 && (
                <ProjectsScrollTextSection words={projectWords} />
            )}

            <ProjectsTabs
                tabs={tabs}
                activeTabKey={activeTabKey}
                language={language}
                onTabChange={handleTabChange}
            />

            <section className="pb-24 bg-[#e8e8e8]">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
                    <motion.div
                        layout
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="
              mt-2
              grid
              gap-x-8 lg:gap-x-12 2xl:gap-x-20
              gap-y-20 md:gap-y-24
              grid-cols-1
              md:grid-cols-2
              2xl:grid-cols-3
              justify-items-center
            "
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    slug={project.slug}
                                    primaryImage={project.primaryImage}
                                    secondaryImage={project.secondaryImage}
                                    type={getText(project.type, language)}
                                    company={getText(project.company, language)}
                                    description={getText(project.description, language)}
                                    year={project.year}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredProjects.length === 0 && emptyText && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mt-16 text-[#555]"
                        >
                            {emptyText}
                        </motion.div>
                    )}
                </div>
            </section>

            <ProjectsShowcaseIntro contents={contents} language={language} />
        </main>
    );
}