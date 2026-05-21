"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import { textContainer, textVariant2 } from "@/lib/motion";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type ServiceItem = {
  title: LocalizedText;
};

type AboutContentValue = string | LocalizedText | ServiceItem[];

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

type TypingTextProps = {
  title: string;
  textStyles?: string;
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

function TypingText({ title, textStyles = "" }: TypingTextProps) {
  return (
    <motion.p
      key={title}
      variants={textContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className={`font-normal text-[14px] text-secondary-white ${textStyles}`}
    >
      {Array.from(title).map((letter, index) => (
        <motion.span variants={textVariant2} key={`${letter}-${index}`}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function About() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);

  const [contents, setContents] = useState<AboutContent[]>([]);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/AboutHome`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `AboutHome verisi alınamadı. Status: ${response.status}`
          );
        }

        const data = (await response.json()) as AboutPageResponse;

        const aboutSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "about-home"
        );

        if (aboutSection?.contents) {
          setContents(aboutSection.contents);
        }
      } catch (error) {
        console.error("AboutHome verisi alınamadı:", error);
      }
    };

    fetchAbout();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.4,
  });

  const artechTextX = useTransform(smoothProgress, [0, 1], ["-2.5%", "2.5%"]);
  const lineScale = useTransform(smoothProgress, [0.15, 0.55], [0, 1]);

  const backgroundText = getText(
    getContent<LocalizedText>(contents, "backgroundText", {}),
    language
  );

  const subtitle = getText(
    getContent<LocalizedText>(contents, "subtitle", {}),
    language
  );

  const title = getText(
    getContent<LocalizedText>(contents, "title", {}),
    language
  );

  const paragraph = getText(
    getContent<LocalizedText>(contents, "paragraph", {}),
    language
  );

  const primaryButtonText = getText(
    getContent<LocalizedText>(contents, "primaryButtonText", {}),
    language
  );

  const primaryButtonLink = getContent<string>(
    contents,
    "primaryButtonLink",
    ""
  );

  const secondaryButtonText = getText(
    getContent<LocalizedText>(contents, "secondaryButtonText", {}),
    language
  );

  const secondaryButtonLink = getContent<string>(
    contents,
    "secondaryButtonLink",
    ""
  );

  const serviceItems = getContent<ServiceItem[]>(contents, "serviceItems", []);

  const words = useMemo(() => {
    return paragraph ? paragraph.split(" ") : [];
  }, [paragraph]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden bg-[#E8E8E8] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      {/* SCROLL BACKGROUND TEXT */}
      <motion.div
        style={{ x: artechTextX }}
        className="pointer-events-none absolute left-1/2 top-5 z-0 w-screen -translate-x-1/2 select-none text-center"
      >
        <span className="block whitespace-nowrap text-[clamp(62px,12vw,215px)] font-black leading-none tracking-[-0.105em] text-[#181818]/[0.045]">
          {backgroundText}
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1280px]">
        {subtitle && (
          <TypingText
            title={subtitle}
            textStyles="mb-8 text-left text-[#02acfa] text-lg"
          />
        )}

        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="min-h-[360px] sm:min-h-[430px] lg:min-h-[470px] flex items-end">
            <motion.h2
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-[#181818] sm:text-[68px] lg:text-[92px]"
            >
              {title}
            </motion.h2>
          </div>

          <div className="relative">
            <motion.div
              style={{ scaleX: lineScale }}
              className="mb-8 h-[2px] origin-left bg-[#181818]"
            />

            <motion.p
              key={`paragraph-${normalizeLanguage(language)}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="min-h-[170px] max-w-xl text-base leading-relaxed text-[#181818]/65 sm:text-lg"
            >
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className="mr-[5px] inline-block">
                  {word}
                </span>
              ))}
            </motion.p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {primaryButtonLink && primaryButtonText && (
                <Link
                  href={primaryButtonLink}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#181818] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#02acfa]"
                >
                  <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />

                  <span className="relative z-10 flex items-center gap-3">
                    {primaryButtonText}
                    <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              )}

              {secondaryButtonLink && secondaryButtonText && (
                <Link
                  href={secondaryButtonLink}
                  className="group inline-flex items-center justify-center rounded-full border border-[#181818]/15 px-7 py-4 text-sm font-semibold text-[#181818] transition-all duration-300 hover:border-[#02acfa] hover:text-[#02acfa]"
                >
                  {secondaryButtonText}
                  <FaArrowRight className="ml-3 text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {serviceItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-20 grid border-y border-[#181818]/10 text-[#181818] sm:grid-cols-3"
          >
            {serviceItems.map((item, index) => {
              const itemTitle = getText(item.title, language);

              if (!itemTitle) return null;

              return (
                <div
                  key={`${itemTitle}-${index}`}
                  className="flex items-center justify-between border-[#181818]/10 py-6 sm:border-r sm:px-6 last:sm:border-r-0"
                >
                  <span className="text-sm text-[#181818]/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    {itemTitle}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}