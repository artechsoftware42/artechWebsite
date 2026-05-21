"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import HeroTypewriter from "./HeroTypewriter";
import { useLanguage } from "@/context/LanguageContext";

type Language = "tr" | "en" | "fr" | "ru";

type LocalizedValue<T = string> = Partial<Record<Language, T>>;

type ContentValue =
  | string
  | string[]
  | LocalizedValue<string>
  | LocalizedValue<string[]>;

type HomeContent = {
  key: string;
  value: ContentValue;
};

type HomeSection = {
  name?: string;
  contents?: HomeContent[];
};

type HomePageResponse = {
  pageKey?: string;
  title?: string;
  sections?: HomeSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getLocalizedValue<T extends string | string[]>(
  contents: HomeContent[],
  key: string,
  language: string,
  fallback: T
): T {
  const found = contents.find((content) => content.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    const localized = found as LocalizedValue<T>;

    return localized[language as Language] ?? localized.tr ?? fallback;
  }

  if (found !== undefined) {
    return found as T;
  }

  return fallback;
}

function getPublicMediaUrl(path: unknown, fallback = ""): string {
  if (typeof path !== "string") return fallback;

  const cleanPath = path.trim();

  if (!cleanPath) return fallback;

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("/")) {
    return cleanPath;
  }

  return `/${cleanPath}`;
}

export default function Hero() {
  const { language } = useLanguage();
  const [contents, setContents] = useState<HomeContent[]>([]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/Hero`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Hero verisi alınamadı. Status: ${response.status}`);
        }

        const data = (await response.json()) as HomePageResponse;

        const heroSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "hero"
        );

        if (heroSection?.contents) {
          setContents(heroSection.contents);
        }
      } catch (error) {
        console.error("Hero verisi alınamadı:", error);
      }
    };

    fetchHero();
  }, []);

  const heroVideo = getLocalizedValue(
    contents,
    "heroVideo",
    language,
    "/videos/hero6.mp4"
  );

  const heroMainTitle = getLocalizedValue(
    contents,
    "heroMainTitle",
    language,
    "Yazılımı sadece\nkodlamıyoruz,\ndeneyime çeviriyoruz."
  );

  const heroTypewriterPrefix = getLocalizedValue(
    contents,
    "heroTypewriterPrefix",
    language,
    "Ne üretiyoruz?"
  );

  const heroWords = useMemo(() => {
    const words = getLocalizedValue<string | string[]>(
      contents,
      "heroTypewriter",
      language,
      [
        "Web Sitesi.",
        "Mobil Uygulama.",
        "CRM Sistemleri.",
        "Stok Takibi Programları.",
        "ERP / MRP Sistemleri",
      ]
    );

    return Array.isArray(words) ? words : [String(words)];
  }, [contents, language]);

  const heroParagraph = getLocalizedValue(
    contents,
    "heroParagraph",
    language,
    "Markanız için modern, hızlı, ölçeklenebilir ve kullanıcı odaklı dijital ürünler geliştiriyoruz."
  );

  const heroPrimaryCTA = getLocalizedValue(
    contents,
    "heroPrimaryCTA",
    language,
    "Teklif Al"
  );

  const heroPrimaryLink = getLocalizedValue(
    contents,
    "heroPrimaryLink",
    language,
    "/offer"
  );

  const heroSecondaryCTA = getLocalizedValue(
    contents,
    "heroSecondaryCTA",
    language,
    "Projeleri İncele"
  );

  const heroSecondaryLink = getLocalizedValue(
    contents,
    "heroSecondaryLink",
    language,
    "/projects"
  );

  const safeHeroVideo = getPublicMediaUrl(heroVideo, "/videos/hero6.mp4");

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0d0d0d]">
      {/* VIDEO */}
      <video
        className="absolute inset-0 w-full h-full object-cover scale-105 motion-safe:animate-[heroFloat_18s_ease-in-out_infinite_alternate]"
        src={safeHeroVideo}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
      />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-black/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-24 pb-32">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-3 px-4 py-2 backdrop-blur-md"></div>

            <h1 className="text-white font-semibold leading-[1.03] tracking-[-0.045em] text-[40px] sm:text-[58px] md:text-[76px] lg:text-[90px]">
              {String(heroMainTitle)
                .split("\n")
                .map((line, index, lines) => (
                  <Fragment key={`${line}-${index}`}>
                    {line}
                    {index !== lines.length - 1 && <br />}
                  </Fragment>
                ))}
            </h1>

            <div className="mt-7">
              <HeroTypewriter
                prefix={heroTypewriterPrefix}
                words={heroWords}
              />
            </div>

            <p className="mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-white/70">
              {heroParagraph}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={heroPrimaryLink}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#02acfa] px-7 py-4 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:bg-[#181818] cursor-pointer"
              >
                <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />

                <span className="relative z-10 flex items-center gap-3">
                  {heroPrimaryCTA}
                  <BsArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href={heroSecondaryLink}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm sm:text-base font-semibold text-white/85 backdrop-blur-md transition-all duration-300 hover:border-[#fff]/60 hover:bg-[#fff] hover:text-[#0d0d0d] cursor-pointer"
              >
                <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[120%]" />

                <span className="relative z-10 flex items-center gap-3">
                  {heroSecondaryCTA}
                  <BsArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}