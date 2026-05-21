"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { staggerContainer, textVariant2 } from "@/lib/motion";
import ExploreCard from "./components/ExploreCard";
import { useLanguage } from "@/context/LanguageContext";
import { TypingText } from "../shared/SectionText";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type ExploreWorld = {
  id: string;
  imgUrl: string;
  title: LocalizedText;
  discoverText?: LocalizedText;
};

type ExploreContentValue = string | LocalizedText | ExploreWorld[];

type ExploreContent = {
  key: string;
  value: ExploreContentValue;
};

type ExploreSection = {
  name?: string;
  contents?: ExploreContent[];
};

type ExplorePageResponse = {
  pageKey?: string;
  title?: string;
  sections?: ExploreSection[];
};

type TitleTextProps = {
  title: ReactNode;
  textStyles?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getContent<T>(
  contents: ExploreContent[],
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

function getText(
  value: LocalizedText | string | undefined,
  language: string
): string {
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

function preloadImages(imageUrls: string[]) {
  if (typeof window === "undefined") return;

  imageUrls.forEach((src) => {
    if (!src) return;

    const image = new window.Image();
    image.src = src;
  });
}

function TitleText({ title, textStyles = "" }: TitleTextProps) {
  return (
    <motion.h2
      variants={textVariant2}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className={`mt-[8px] font-bold md:text-[36px] text-[36px] text-white ${textStyles}`}
    >
      {title}
    </motion.h2>
  );
}

export default function Explore() {
  const { language } = useLanguage();

  const [contents, setContents] = useState<ExploreContent[]>([]);
  const [active, setActive] = useState("world-2");

  useEffect(() => {
    let isMounted = true;

    const fetchExplore = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/Explore`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Explore verisi alınamadı. Status: ${response.status}`
          );
        }

        const data = (await response.json()) as ExplorePageResponse;

        const exploreSection =
          data.sections?.find((section) => {
            const sectionName = section.name?.toLowerCase();

            return (
              sectionName === "explore" ||
              sectionName === "explorehome" ||
              sectionName === "explore-home"
            );
          }) || data.sections?.[0];

        if (isMounted && exploreSection?.contents) {
          setContents(exploreSection.contents);
        }
      } catch (error) {
        console.error("Explore verisi alınamadı:", error);
      }
    };

    fetchExplore();

    return () => {
      isMounted = false;
    };
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

  const exploreWorlds = getContent<ExploreWorld[]>(
    contents,
    "exploreWorlds",
    []
  );

  const preparedWorlds = useMemo(() => {
    return exploreWorlds
      .map((world) => ({
        ...world,
        safeImgUrl: getPublicMediaUrl(world.imgUrl),
      }))
      .filter((world) => Boolean(world.safeImgUrl));
  }, [exploreWorlds]);

  useEffect(() => {
    if (preparedWorlds.length === 0) return;

    preloadImages(preparedWorlds.map((world) => world.safeImgUrl));
  }, [preparedWorlds]);

  return (
    <section
      className="relative sm:p-16 min-[480px]:p-8 px-6 py-12"
      id="explore"
    >
      <motion.div
        key={`explore-motion-${preparedWorlds.length}-${preparedWorlds
          .map((world) => world.id)
          .join("-")}`}
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.08 }}
        className="2xl:max-w-[1280px] w-full mx-auto flex flex-col"
      >
        <TypingText
          title={eyebrow}
          textStyles="text-center text-[#181818] text-lg"
        />

        <TitleText
          key={`title-${language}-${titleLine1}-${titleLine2}`}
          title={
            <div className="text-[#181818]">
              {titleLine1} <br className="md:block hidden" /> {titleLine2}
            </div>
          }
          textStyles="text-center"
        />

        <div className="mt-[50px] flex lg:flex-row flex-col min-h-[70vh] gap-5">
          {preparedWorlds.map((world, index) => (
            <ExploreCard
              key={world.id}
              id={world.id}
              imgUrl={world.safeImgUrl}
              title={getText(world.title, language)}
              discoverText={getText(world.discoverText, language) || "Keşfedin"}
              index={index}
              active={active}
              handleClick={setActive}
              priority={index < 3 || active === world.id}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}