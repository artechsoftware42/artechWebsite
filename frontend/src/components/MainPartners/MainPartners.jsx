"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

import styles from "../MainExplore/styles/index";
import { staggerContainer } from "../../utils/motion";
import { TitleText, TypingText } from "../MainExplore/components/CustomText";

const API_BASE = import.meta.env.VITE_API_URL;

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents?.find((item) => item.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
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

const normalizeMainPartners = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id: item.id ?? index + 1,
      image: normalizeImagePath(item.image),
      alt: item.alt ?? `Partner ${index + 1}`,
    }))
    .filter((item) => item.image);
};

const MainPartners = () => {
  const { language } = useLanguage();

  const [isPaused, setIsPaused] = useState(false);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMainPartnersData = async () => {
      try {
        setLoading(true);

        const data = await fetchJson(`${API_BASE}/api/pages/MainPartners`);
        if (!data) return;

        const sections = Array.isArray(data?.sections) ? data.sections : [];
        const mainPartnersSection = sections.find(
          (section) => section?.name?.toLowerCase() === "partners"
        );

        const sectionContents = Array.isArray(mainPartnersSection?.contents)
          ? mainPartnersSection.contents
          : [];

        setContents(sectionContents);
      } catch (error) {
        console.error("MainPartners verisi alınamadı:", error);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMainPartnersData();
  }, []);

  const mainPartnersSubtitle = getLocalizedValue(
    contents,
    "partnersSubtitle",
    language,
    ""
  );

  const mainPartnersTitle = getLocalizedValue(
    contents,
    "partnersTitle",
    language,
    ""
  );

  const mainPartnersItems = normalizeMainPartners(
    contents.find((item) => item.key === "partnersItems")?.value ?? []
  );

  const sliderItems = useMemo(() => {
    if (!mainPartnersItems.length) return [];
    return [...mainPartnersItems, ...mainPartnersItems, ...mainPartnersItems];
  }, [mainPartnersItems]);

  return (
    <section className={`${styles.paddings} bg-[#E8E8E8]`} id="partners">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto flex flex-col items-center`}
      >
        <TypingText
          title={`| ${mainPartnersSubtitle}`}
          textStyles="text-center text-[#181818] text-lg"
        />

        <TitleText
          title={
            <div className="text-[#181818] text-center">
              {mainPartnersTitle}
            </div>
          }
          textStyles="text-center"
        />

        <div
          className="w-full overflow-hidden mt-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loading ? (
            <div className="w-full text-center text-[#181818] py-8"></div>
          ) : sliderItems.length > 0 ? (
            <div
              className={`flex gap-20 items-center whitespace-nowrap ${isPaused ? "pause" : "animate-scroll"
                }`}
            >
              {sliderItems.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex items-center justify-center min-w-[120px]"
                >
                  <img
                    src={partner.image}
                    alt={partner.alt}
                    className="
                      w-[100px] h-[60px] object-contain
                      grayscale hover:grayscale-0
                      transition duration-300
                      hover:scale-110
                      cursor-pointer
                    "
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-[#181818] py-8"></div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .animate-scroll {
          animation: scroll 14s linear infinite;
        }

        .pause {
          animation: scroll 14s linear infinite;
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll 10s linear infinite;
          }

          .pause {
            animation: scroll 10s linear infinite;
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
};

export default MainPartners;