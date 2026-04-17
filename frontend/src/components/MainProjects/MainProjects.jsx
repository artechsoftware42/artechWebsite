"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

import styles from "../MainExplore/styles/index";
import { staggerContainer } from "../../utils/motion";
import { TitleText, TypingText } from "../MainExplore/components/CustomText";

const API_BASE = import.meta.env.VITE_API_URL;

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

const normalizeMainProjects = (items, language) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({
      id: item?.id ?? index + 1,
      type: getLocalizedValue(item?.type, language, ""),
      company: getLocalizedValue(item?.company, language, item?.company ?? ""),
      description: getLocalizedValue(item?.description, language, ""),
      year: item?.year ?? "",
      primaryImage: normalizeImagePath(item?.primaryImage),
      secondaryImage: normalizeImagePath(item?.secondaryImage || item?.primaryImage),
    }))
    .filter((item) => item.primaryImage);
};

export default function MainProjects() {
  const { language } = useLanguage();

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMainProjectsData = async () => {
      try {
        setLoading(true);

        const data = await fetchJson(`${API_BASE}/api/pages/MainProjects`);
        if (!data) return;

        const mainProjectsSection = data?.sections?.find(
          (section) => section?.name?.toLowerCase() === "projects"
        );

        setContents(mainProjectsSection?.contents || []);
      } catch (err) {
        console.error("MainProjects verisi alınamadı:", err);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMainProjectsData();
  }, []);

  const mainProjectsSubtitle = getLocalizedValue(
    getContentValue(contents, "projectsSubtitle"),
    language,
    ""
  );

  const mainProjectsTitle = getLocalizedValue(
    getContentValue(contents, "projectsTitle"),
    language,
    ""
  );

  const mainProjectsButtonText = getLocalizedValue(
    getContentValue(contents, "projectsButtonText"),
    language,
    ""
  );

  const projectData = useMemo(() => {
    return normalizeMainProjects(getContentValue(contents, "projectItems"), language);
  }, [contents, language]);

  const hasMainProjects = projectData.length > 0;

  const titleLines = mainProjectsTitle
    ? mainProjectsTitle.split("\n")
    : [];

  return (
    <section className="py-24 bg-[#E8E8E8]" id="projects">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto flex flex-col items-center`}
      >
        <TypingText
          title={`| ${mainProjectsSubtitle}`}
          textStyles="text-center text-[#181818] text-lg"
        />

        <TitleText
          title={
            <div className="text-[#181818] text-center">
              {titleLines.length > 0
                ? titleLines.map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < titleLines.length - 1 && (
                      <br className="md:block hidden" />
                    )}
                  </span>
                ))
                : null}
            </div>
          }
        />
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-6 flex flex-col">
        {loading ? null : hasMainProjects ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="
              mt-20
              grid
              gap-x-12 gap-y-24
              grid-cols-1 md:grid-cols-2 2xl:grid-cols-3
              justify-items-center
            "
          >
            {projectData.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </motion.div>
        ) : null}

        <div className="mt-20 flex justify-center">
          <Link to="/about">
            <motion.button
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="relative px-8 py-3 rounded-2xl text-white font-medium overflow-hidden group cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#02acfa] via-[#028ac9] to-[#026fa3] z-0 transition-all duration-500 group-hover:scale-105" />

              <span className="relative z-10 flex items-center gap-2">
                <motion.span
                  variants={{
                    rest: { x: -10, opacity: 0 },
                    hover: { x: 0, opacity: 1 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaArrowRight />
                </motion.span>

                <span>{mainProjectsButtonText}</span>

                <motion.span
                  variants={{
                    rest: { x: 0, opacity: 1 },
                    hover: { x: 10, opacity: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaArrowRight />
                </motion.span>
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}

const ProjectCard = ({
  primaryImage,
  secondaryImage,
  type,
  company,
  description,
  year,
}) => {
  return (
    <motion.div
      variants={cardVariants}
      className="group cursor-pointer flex flex-col items-center w-full max-w-[520px]"
    >
      <motion.div
        whileHover={{ y: -14 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="
          relative
          w-full
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

      <div className="mt-6 space-y-2 w-full text-left px-2 sm:px-0">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{type}</p>

        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#181818]">
          {company}
        </h3>

        <p className="text-sm sm:text-base text-gray-600">
          {description}
        </p>
      </div>
    </motion.div>
  );
};