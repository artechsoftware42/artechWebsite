"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import styles from "./styles";
import { staggerContainer } from "../../utils/motion";
import MainExploreCard from "./components/ExploreCard";
import { TitleText, TypingText } from "./components/CustomText";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

const getLocalizedValue = (value, language, fallback) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? value.tr ?? fallback;
  }

  return value ?? fallback;
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

const MainExplore = () => {
  const { language } = useLanguage();
  const [active, setActive] = useState("world-2");
  const [mainExploreSubtitle, setMainExploreSubtitle] = useState("");
  const [mainExploreTitle, setMainExploreTitle] = useState("");
  const [mainExploreWorlds, setMainExploreWorlds] = useState([]);

  useEffect(() => {
    const fetchMainExploreData = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/MainExplore`);
        if (!data) return;

        const mainExploreSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "explore"
        );

        if (!mainExploreSection) return;

        const subtitle = getLocalizedValue(
          mainExploreSection.contents?.find((item) => item.key === "exploreSubtitle")?.value,
          language,
          ""
        );

        const title = getLocalizedValue(
          mainExploreSection.contents?.find((item) => item.key === "exploreTitle")?.value,
          language,
          ""
        );

        const items =
          mainExploreSection.contents?.find((item) => item.key === "exploreItems")
            ?.value || [];

        const localizedItems = Array.isArray(items)
          ? items.map((item) => ({
            ...item,
            title: getLocalizedValue(item.title, language, ""),
            imgUrl: normalizeImagePath(item.imgUrl),
          }))
          : [];

        setMainExploreSubtitle(subtitle);
        setMainExploreTitle(title);
        setMainExploreWorlds(localizedItems);
      } catch (error) {
        console.error("MainExplore verisi alınamadı:", error);
      }
    };

    fetchMainExploreData();
  }, [language]);

  return (
    <section className={`${styles.paddings}`} id="explore">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto flex flex-col`}
      >
        <TypingText
          title={`| ${mainExploreSubtitle}`}
          textStyles="text-center text-[#181818] text-lg"
        />

        <TitleText
          title={
            <div className="text-[#181818]">
              {mainExploreTitle}
            </div>
          }
          textStyles="text-center"
        />

        <div className="mt-[50px] flex lg:flex-row flex-col min-h-[70vh] gap-5">
          {mainExploreWorlds.map((world, index) => (
            <MainExploreCard
              key={world.id}
              {...world}
              index={index}
              active={active}
              handleClick={setActive}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default MainExplore;