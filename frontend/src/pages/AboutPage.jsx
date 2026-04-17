"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { fetchJson } from "../utils/fetchJson";

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

const normalizeMediaPath = (value) => {
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

export default function AboutPage() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const { language } = useLanguage();
  const [contents, setContents] = useState([]);

  const [showScroll, setShowScroll] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [revealedChars, setRevealedChars] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const fetchAboutPage = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/api/pages/AboutPage`);
        if (!data) return;

        const section = data.sections?.find(
          (item) => item.name?.toLowerCase() === "aboutpage"
        );

        setContents(section?.contents || []);
      } catch (error) {
        console.error("AboutPage verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchAboutPage();
  }, []);

  const lines = useMemo(() => {
    const value = getContentValue(contents, "codeLines");
    return getLocalizedValue(value, language, []);
  }, [contents, language]);

  const cards = useMemo(() => {
    const value = getContentValue(contents, "cards");

    if (!Array.isArray(value)) return [];

    return value.map((card, index) => ({
      id: card.id ?? index + 1,
      title: getLocalizedValue(card.title, language, ""),
      desc: getLocalizedValue(card.desc, language, ""),
    }));
  }, [contents, language]);

  const pageTitlePrefix = getLocalizedValue(
    getContentValue(contents, "pageTitlePrefix"),
    language,
    "Hakkımızda"
  );

  const pageTitleAccent = getLocalizedValue(
    getContentValue(contents, "pageTitleAccent"),
    language,
    "ArtechSoftware"
  );

  const scrollText = getLocalizedValue(
    getContentValue(contents, "scrollText"),
    language,
    "SCROLL"
  );

  const heroTag = getLocalizedValue(
    getContentValue(contents, "heroTag"),
    language,
    "/ ARTECH SOFTWARE"
  );

  const heroTitle = getLocalizedValue(
    getContentValue(contents, "heroTitle"),
    language,
    "Bizi daha yakından tanıyın."
  );

  const heroAccent = getLocalizedValue(
    getContentValue(contents, "heroAccent"),
    language,
    "Projenizi birlikte hayata geçirelim."
  );

  const heroParagraph = getLocalizedValue(
    getContentValue(contents, "heroParagraph"),
    language,
    "Fikirlerinizi güçlü, modern ve ölçeklenebilir dijital ürünlere dönüştürüyoruz. Sadece yazılım geliştirmiyoruz, markanızı büyütecek deneyimler tasarlıyoruz."
  );

  const heroButtonText = getLocalizedValue(
    getContentValue(contents, "heroButtonText"),
    language,
    "Projeni Başlat →"
  );

  const heroBackgroundImage = normalizeMediaPath(
    getContentValue(contents, "heroBackgroundImage") || "/images/planet-03.png"
  );

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

  const joinedText = useMemo(() => {
    return Array.isArray(lines) ? lines.join("\n") : "";
  }, [lines]);

  const totalChars = joinedText.length;

  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    measure();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && contentRef.current) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener("resize", measure);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [revealedChars, viewportWidth, viewportHeight, codeTextClass, titleClass, lines]);

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

      const chars = Math.max(1, Math.floor(adjustedProgress * Math.max(totalChars, 1)));
      setRevealedChars(chars);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [viewportHeight, viewportWidth, isMobile, isTablet, isMediumScreen, totalChars]);

  const revealData = useMemo(() => {
    if (!Array.isArray(lines) || lines.length === 0) {
      return {
        fullyVisibleLines: [],
        activeLine: "",
        activeLineIndex: -1,
      };
    }

    let remaining = revealedChars;
    const fullyVisibleLines = [];
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

    if (activeLineIndex === -1) {
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
              <span className="text-[#02acfa]">{pageTitleAccent}</span>
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

        {showScroll && (
          <div className="fixed bottom-6 right-4 z-20 flex animate-bounce flex-col items-center text-white/60 sm:bottom-8 sm:right-6 md:bottom-10 md:right-8">
            <span className="mb-2 text-[10px] tracking-widest sm:text-xs">
              {scrollText}
            </span>

            <div className="relative h-8 w-[2px] overflow-hidden bg-white/30 sm:h-10">
              <div className="absolute left-0 top-0 h-1/2 w-full animate-scrollLine bg-[#02acfa]" />
            </div>

            <span className="mt-2 text-lg sm:text-xl">↓</span>
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
              / BAKIŞ AÇIMIZ
            </p>

            <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0d0d0d] sm:text-4xl md:text-5xl lg:text-6xl">
              Sadece yazılım üretmiyor,
              <span className="block text-[#02acfa]">
                markaların dijital geleceğini tasarlıyoruz.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#0d0d0d]/65 sm:text-base md:text-lg md:leading-8">
              Artech’te geliştirdiğimiz her ürün; estetik, performans ve
              sürdürülebilirliği aynı çizgide buluşturan bir yaklaşımın sonucu.
              Bizim için iyi bir proje yalnızca çalışan değil, büyüyebilen,
              hissedilebilen ve değer üreten bir deneyimdir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-12">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
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
                    {card.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#0d0d0d]/70 transition-colors duration-150 ease-out group-hover:text-[#0d0d0d]/80 md:text-base">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative h-[45vh] w-full overflow-hidden sm:h-[45vh] md:h-[50vh] lg:h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-fixed"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 md:px-12">
          <div className="w-full max-w-5xl text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.6 }}
              className="mb-3 text-xs uppercase tracking-[0.25em] text-[#02acfa] sm:text-sm md:mb-4 md:text-base"
            >
              {heroTag}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.8 }}
              className="mb-4 text-2xl font-bold leading-tight text-[#e8e8e8] sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl"
            >
              {heroTitle}
              <br />
              <span className="text-[#02acfa]">{heroAccent}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 1 }}
              className="mb-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:mb-8 md:text-lg"
            >
              {heroParagraph}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 1.2 }}
            >
              <Link to="/contact">
                <button className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#02acfa] to-[#026fa3] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 sm:px-8 sm:py-3 md:px-10 md:py-4 md:text-base">
                  {heroButtonText}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function highlight(line) {
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