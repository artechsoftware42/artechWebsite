"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { fetchJson } from "../utils/fetchJson";

import { fadeIn } from "../hooks/variants";

const API_BASE = import.meta.env.VITE_API_URL;

const getLocalizedValue = (value, language, fallback = "") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? fallback;
  }

  return value ?? fallback;
};

const getContentValue = (contents, key) => {
  if (!Array.isArray(contents)) return undefined;
  return contents.find((item) => item?.key === key)?.value;
};

const normalizeImagePath = (value) => {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRow(words, repeatCount = 3) {
  const result = [];
  for (let i = 0; i < repeatCount; i++) {
    result.push(...shuffleArray(words));
  }
  return result;
}

function getValidTab(tabValue, tabs) {
  if (!tabValue) return "all";
  if (!Array.isArray(tabs) || tabs.length === 0) return "all";

  const normalizedValue = String(tabValue).trim().toLowerCase();

  const matchedTab = tabs.find((tab) => {
    const possibleValues = [
      tab.key,
      tab.label,
      tab.rawLabel?.tr,
      tab.rawLabel?.en,
      tab.rawLabel?.fr,
      tab.rawLabel?.ru,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    return possibleValues.includes(normalizedValue);
  });

  return matchedTab ? matchedTab.key : "all";
}

function MarqueeRow({ items, direction, progress }) {
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

function ProjectsScrollTextSection({ words }) {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rows = useMemo(
    () => [
      buildRow(words, 3),
      buildRow(words, 3),
      buildRow(words, 3),
      buildRow(words, 3),
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

function ProjectsTabs({ tabs, activeTab, onTabChange }) {
  return (
    <section className="bg-[#e8e8e8] px-4 md:px-10 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

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
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectsShowcaseIntro({
  introBadge,
  introTitle,
  introParagraph,
  introTags,
  highlights,
}) {
  return (
    <section className="bg-[#e8e8e8] pt-6 md:pt-10 pb-24 md:pb-32">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-stretch">
          <motion.div
            variants={fadeIn("right", 0.005)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="xl:col-span-7 rounded-[32px] border border-white/50 bg-white/60 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
          >
            <div className="inline-flex items-center rounded-full border border-[#02acfa]/20 bg-[#02acfa]/10 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#028ac9]">
              {introBadge}
            </div>

            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl leading-[1.05] font-semibold tracking-tight text-[#111111]"
            >
              {introTitle}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
              className="mt-6 max-w-3xl text-sm sm:text-base md:text-lg leading-7 text-[#555555]"
            >
              {introParagraph}
            </motion.p>

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
                  className={
                    index === 0
                      ? "rounded-full bg-[#111111] px-4 py-2 text-xs sm:text-sm font-medium text-white"
                      : "rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#111111] border border-black/10"
                  }
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeIn("left", 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.005, ease: "easeOut" }}
            className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4"
          >
            {highlights.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeIn("left", 0.5)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.005, ease: "easeOut" }}
                className="group rounded-[28px] bg-[#111111] text-white p-6 sm:p-6 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.16)] hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/45">
                    0{item.id}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#02acfa]" />
                </div>

                <h3 className="mt-6 text-lg sm:text-xl font-semibold leading-snug">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm sm:text-[15px] leading-7 text-white/70">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  primaryImage,
  secondaryImage,
  type,
  company,
  description,
  year,
}) {
  return (
    <motion.div
      variants={cardVariants}
      layout
      className="group cursor-pointer flex flex-col items-center w-full"
    >
      <motion.div
        whileHover={{ y: -14 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="
          relative
          w-full
          max-w-[520px]
          h-[420px]
          sm:h-[500px]
          md:h-[580px]
          xl:h-[650px]
          rounded-3xl overflow-hidden shadow-2xl
        "
      >
        <img
          src={primaryImage}
          alt={company}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-110"
        />

        <img
          src={secondaryImage}
          alt={company}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
        />

        <span className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 text-white text-sm sm:text-base font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          {year}
        </span>
      </motion.div>

      <div className="mt-6 space-y-2 w-full max-w-[520px] text-left px-2 sm:px-0">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{type}</p>

        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#181818]">
          {company}
        </h3>

        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchProjectsPage = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/api/pages/ProjectsPage`);
        if (!data) return;

        const section = data.sections?.find(
          (item) => item.name?.toLowerCase() === "projectspage"
        );

        setContents(section?.contents || []);
      } catch (error) {
        console.error("ProjectsPage verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchProjectsPage();
  }, []);

  const marqueeWords = useMemo(() => {
    const value = getContentValue(contents, "projectWords");
    return getLocalizedValue(value, language, []);
  }, [contents, language]);

  const tabs = useMemo(() => {
    const value = getContentValue(contents, "projectTabs");

    if (!Array.isArray(value)) return [];

    return value.map((item) => ({
      key: item.key,
      label: getLocalizedValue(item.label, language, ""),
      rawLabel: item.label,
    }));
  }, [contents, language]);

  const projectData = useMemo(() => {
    const value = getContentValue(contents, "projectItems");

    if (!Array.isArray(value)) return [];

    return value.map((item, index) => ({
      id: item.id ?? index + 1,
      categoryKey: item.categoryKey ?? "",
      type: getLocalizedValue(item.type, language, ""),
      company: getLocalizedValue(item.company, language, item.company ?? ""),
      description: getLocalizedValue(item.description, language, ""),
      year: item.year ?? "",
      primaryImage: normalizeImagePath(item.primaryImage),
      secondaryImage: normalizeImagePath(
        item.secondaryImage || item.primaryImage
      ),
    }));
  }, [contents, language]);

  const projectHighlights = useMemo(() => {
    const value = getContentValue(contents, "projectHighlights");

    if (!Array.isArray(value)) return [];

    return value.map((item, index) => ({
      id: item.id ?? index + 1,
      title: getLocalizedValue(item.title, language, ""),
      text: getLocalizedValue(item.text, language, ""),
    }));
  }, [contents, language]);

  const introBadge = getLocalizedValue(
    getContentValue(contents, "introBadge"),
    language,
    ""
  );

  const introTitle = getLocalizedValue(
    getContentValue(contents, "introTitle"),
    language,
    ""
  );

  const introParagraph = getLocalizedValue(
    getContentValue(contents, "introParagraph"),
    language,
    ""
  );

  const introTags = useMemo(() => {
    const value = getContentValue(contents, "introTags");
    return getLocalizedValue(value, language, []);
  }, [contents, language]);

  const emptyCategoryText = getLocalizedValue(
    getContentValue(contents, "emptyCategoryText"),
    language,
    ""
  );

  const activeTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    return getValidTab(category, tabs);
  }, [location.search, tabs]);

  const handleTabChange = (tabKey) => {
    if (tabKey === "all") {
      navigate("/projects");
      return;
    }

    navigate(`/projects?category=${encodeURIComponent(tabKey)}`);
  };

  const filteredProjects = useMemo(() => {
    if (activeTab === "all") return projectData;

    return projectData.filter((project) => project.categoryKey === activeTab);
  }, [activeTab, projectData]);

  return (
    <main className="bg-[#e8e8e8] min-h-screen">
      <ProjectsScrollTextSection words={marqueeWords} />

      <ProjectsTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

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
                <ProjectCard key={project.id} {...project} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-16 text-[#555]"
            >
              {emptyCategoryText}
            </motion.div>
          )}
        </div>
      </section>

      <ProjectsShowcaseIntro
        introBadge={introBadge}
        introTitle={introTitle}
        introParagraph={introParagraph}
        introTags={introTags}
        highlights={projectHighlights}
      />
    </main>
  );
}