"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

import styles from "../MainExplore/styles/index";
import { staggerContainer } from "../../utils/motion";
import { TitleText, TypingText } from "../MainExplore/components/CustomText";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((item) => item.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
};

const MainInfo = () => {
  const { language } = useLanguage();
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchMainInfoData = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/MainInfo`);
        if (!data) return;

        const MainInfoSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "about"
        );

        if (MainInfoSection) {
          setContents(MainInfoSection.contents || []);
        }
      } catch (error) {
        console.error("about verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchMainInfoData();
  }, []);

  const MainInfoSubtitle = getLocalizedValue(contents, "aboutSubtitle", language, "");
  const MainInfoTitle = getLocalizedValue(contents, "aboutTitle", language, "");
  const MainInfoParagraph = getLocalizedValue(contents, "aboutParagraph", language, "");
  const MainInfoButtonText = getLocalizedValue(contents, "aboutButtonText", language, "");

  return (
    <section className={`${styles.paddings} bg-[#E8E8E8]`} id="about">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto flex flex-col items-center`}
      >
        <TypingText
          title={`| ${MainInfoSubtitle}`}
          textStyles="text-center text-[#181818] text-lg"
        />

        <TitleText
          title={<div className="text-[#181818]">{MainInfoTitle}</div>}
          textStyles="text-center"
        />

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-center text-gray-600 text-base md:text-lg leading-relaxed"
        >
          {MainInfoParagraph}
        </motion.p>

        <Link to="/MainInfo">
          <motion.button
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="relative mt-10 px-8 py-3 rounded-xl text-white font-medium overflow-hidden group"
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

              <span>{MainInfoButtonText}</span>

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
      </motion.div>
    </section>
  );
};

export default MainInfo;