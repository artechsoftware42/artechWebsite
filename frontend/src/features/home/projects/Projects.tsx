"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import { staggerContainer } from "@/lib/motion";
import { TypingText, TitleText } from "@/features/home/shared/SectionText";
import ProjectCard from "./components/ProjectCard";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type ProjectItem = {
  id: number;
  type: LocalizedText;
  company: LocalizedText;
  description: LocalizedText;
  year: string;
  primaryImage: string;
  secondaryImage: string;
};

type ProjectsContentValue =
  | string
  | LocalizedText
  | ProjectItem[];

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

export default function Projects() {
  const { language } = useLanguage();
  const [contents, setContents] = useState<ProjectsContent[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/ProjectsHome`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `ProjectsHome verisi alınamadı. Status: ${response.status}`
          );
        }

        const data = (await response.json()) as ProjectsPageResponse;

        const projectsSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "projects-home"
        );

        if (projectsSection?.contents) {
          setContents(projectsSection.contents);
        }
      } catch (error) {
        console.error("ProjectsHome verisi alınamadı:", error);
      }
    };

    fetchProjects();
  }, []);

  const eyebrow = getText(
    getContent<LocalizedText>(contents, "eyebrow", {}),
    language
  );

  const titleLine1 = getText(
    getContent<LocalizedText>(contents, "titleLine1", {}),
    language
  );

  const titleLine2 = getText(
    getContent<LocalizedText>(contents, "titleLine2", {}),
    language
  );

  const buttonText = getText(
    getContent<LocalizedText>(contents, "buttonText", {}),
    language
  );

  const buttonLink = getContent<string>(contents, "buttonLink", "");

  const projects = getContent<ProjectItem[]>(contents, "projects", []);

  return (
    <section className="py-24 bg-[#E8E8E8]" id="projects">
      <motion.div
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="2xl:max-w-[1280px] w-full mx-auto flex flex-col items-center"
      >
        {eyebrow && (
          <TypingText
            title={eyebrow}
            textStyles="text-center text-[#181818] text-lg"
          />
        )}

        {(titleLine1 || titleLine2) && (
          <TitleText
            title={
              <div className="text-[#181818] text-center">
                {titleLine1} <br className="md:block hidden" /> {titleLine2}
              </div>
            }
          />
        )}
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {projects.length > 0 && (
          <motion.div
            key={`projects-home-${language}-${projects.map((project) => project.id).join("-")}`}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.05 }}
            className="
              mt-20
              grid
              gap-x-8 lg:gap-x-12 2xl:gap-x-20
              gap-y-20 md:gap-y-24
              grid-cols-1
              md:grid-cols-2
              2xl:grid-cols-3
              justify-items-center
            "
          >
            {projects.map((project) => (
              <ProjectCard
                key={`project-${project.id}`}
                primaryImage={project.primaryImage}
                secondaryImage={project.secondaryImage}
                type={getText(project.type, language)}
                company={getText(project.company, language)}
                description={getText(project.description, language)}
                year={project.year}
              />
            ))}
          </motion.div>
        )}

        {buttonLink && buttonText && (
          <div className="mt-20 flex justify-center">
            <Link
              href={buttonLink}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#02acfa] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#181818]"
            >
              <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />

              <span className="relative z-10 flex items-center gap-3">
                {buttonText}
                <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}