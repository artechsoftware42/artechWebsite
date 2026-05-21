"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { staggerContainer } from "@/lib/motion";
import { TitleText, TypingText } from "@/features/home/shared/SectionText";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type PartnerLogo = {
  id: number;
  image: string;
  alt: LocalizedText;
};

type PartnersContentValue = string | LocalizedText | PartnerLogo[];

type PartnersContent = {
  key: string;
  value: PartnersContentValue;
};

type PartnersSection = {
  name?: string;
  contents?: PartnersContent[];
};

type PartnersPageResponse = {
  pageKey?: string;
  title?: string;
  sections?: PartnersSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function normalizeLanguage(language: string): LanguageCode {
  const normalized = language.toLowerCase();

  if (normalized === "tr") return "tr";
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "ru") return "ru";

  return "tr";
}

function getContent<T>(
  contents: PartnersContent[],
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

export default function Partners() {
  const { language } = useLanguage();

  const [contents, setContents] = useState<PartnersContent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/PartnersHome`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `PartnersHome verisi alınamadı. Status: ${response.status}`
          );
        }

        const data = (await response.json()) as PartnersPageResponse;

        const partnersSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "partners-home"
        );

        if (partnersSection?.contents) {
          setContents(partnersSection.contents);
        }
      } catch (error) {
        console.error("PartnersHome verisi alınamadı:", error);
      }
    };

    fetchPartners();
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

  const logos = getContent<PartnerLogo[]>(contents, "logos", []);

  const repeatedLogos = [...logos, ...logos, ...logos];

  return (
    <section
      className="sm:p-16 min-[480px]:p-8 px-6 py-12 bg-[#E8E8E8]"
      id="partners"
    >
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
              <div className="text-[#181818]">
                {titleLine1} <br className="md:block hidden" /> {titleLine2}
              </div>
            }
            textStyles="text-center"
          />
        )}

        {logos.length > 0 && (
          <div
            className="w-full overflow-hidden mt-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={`flex gap-20 items-center whitespace-nowrap ${isPaused ? "partners-scroll-paused" : "partners-scroll"
                }`}
            >
              {repeatedLogos.map((logo, index) => {
                const imageUrl = getPublicMediaUrl(logo.image);
                const altText = getText(logo.alt, language) || "Partner";

                if (!imageUrl) return null;

                return (
                  <div
                    key={`${logo.id}-${index}`}
                    className="flex items-center justify-center min-w-[120px]"
                  >
                    <Image
                      src={imageUrl}
                      alt={altText}
                      width={100}
                      height={60}
                      unoptimized
                      className="
                        w-[100px] h-[60px] object-contain
                        grayscale hover:grayscale-0
                        transition duration-300
                        hover:scale-110
                        cursor-pointer
                      "
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      <style jsx>{`
        .partners-scroll {
          animation: partnersScroll 14s linear infinite;
        }

        .partners-scroll-paused {
          animation: partnersScroll 14s linear infinite;
          animation-play-state: paused;
        }

        @keyframes partnersScroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-33.333%);
          }
        }

        @media (max-width: 768px) {
          .partners-scroll {
            animation: partnersScroll 10s linear infinite;
          }

          .partners-scroll-paused {
            animation: partnersScroll 10s linear infinite;
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}