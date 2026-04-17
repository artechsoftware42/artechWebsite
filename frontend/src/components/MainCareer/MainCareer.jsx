"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((c) => c.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
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

const MainCareer = () => {
  const { language } = useLanguage();
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchMainCareer = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/MainCareer`);
        if (!data) return;

        const mainCareerSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "maincareer"
        );

        if (mainCareerSection) {
          setContents(mainCareerSection.contents || []);
        }
      } catch (error) {
        console.error("MainCareer verisi alınamadı:", error);
      }
    };

    fetchMainCareer();
  }, []);

  const backgroundImage = normalizeMediaPath(
    contents.find((c) => c.key === "backgroundImage")?.value ||
    "/images/planet-04.png"
  );

  const tag = getLocalizedValue(contents, "tag", language, "");
  const title = getLocalizedValue(contents, "title", language, "");
  const paragraph = getLocalizedValue(contents, "paragraph", language, "");
  const examples = getLocalizedValue(contents, "examples", language, []);
  const buttonText = getLocalizedValue(contents, "buttonText", language, "");

  return (
    <section className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-10">
        <div className="bg-transparent text-white w-full max-w-3xl lg:max-w-4xl">
          <BlockInTextCard
            tag={tag}
            title={title}
            paragraph={paragraph}
            examples={examples}
            buttonText={buttonText}
          />
        </div>
      </div>
    </section>
  );
};

export default MainCareer;

/* BLOCK */

const BlockInTextCard = ({ tag, title, paragraph, examples, buttonText }) => {
  return (
    <div className="w-full space-y-6 sm:space-y-7">
      <div>
        <p className="mb-2 text-sm sm:text-base font-light uppercase tracking-wide">
          {tag}
        </p>
        <hr className="border-neutral-700" />
      </div>

      <p className="max-w-full text-base sm:text-lg md:text-xl leading-relaxed">
        <strong>{title}</strong> {paragraph}
      </p>

      <div>
        <Typewrite examples={examples} />
        <hr className="border-neutral-300 mt-2" />
      </div>

      <Link to="/contact">
        <button className="relative mt-6 lg:mt-14 px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl text-white font-medium overflow-hidden group cursor-pointer w-full sm:w-auto">
          <span className="absolute inset-0 bg-gradient-to-r from-[#02acfa] via-[#028ac9] to-[#026fa3] z-0 transition-all duration-500 group-hover:scale-105" />

          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>

            <span>{buttonText}</span>

            <span className="opacity-100 translate-x-0 group-hover:opacity-0 group-hover:translate-x-2 transition-all duration-300">
              →
            </span>
          </span>
        </button>
      </Link>
    </div>
  );
};

/* TYPEWRITER */

const LETTER_DELAY = 0.03;
const HOLD_DELAY = 1500;

const randomChar = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/|";
  return chars[Math.floor(Math.random() * chars.length)];
};

const Typewrite = ({ examples }) => {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (!examples || examples.length === 0) return;

    const currentText = examples[exampleIndex];

    const interval = setInterval(() => {
      setDisplayText((prev) => {
        if (!isDeleting) {
          let temp = "";
          for (let i = 0; i < charIndex; i++) temp += currentText[i];
          for (let i = charIndex; i < currentText.length; i++) temp += randomChar();
          return temp;
        } else {
          return prev.slice(0, prev.length - 1);
        }
      });

      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setCharIndex((prev) => prev + 1);
        } else if (!hold) {
          setHold(true);
          setTimeout(() => {
            setIsDeleting(true);
            setHold(false);
          }, HOLD_DELAY);
        }
      } else {
        if (displayText.length === 0) {
          setIsDeleting(false);
          setCharIndex(0);
          setExampleIndex((prev) => (prev + 1) % examples.length);
        }
      }
    }, LETTER_DELAY * 1000);

    return () => clearInterval(interval);
  }, [charIndex, displayText, isDeleting, hold, exampleIndex, examples]);

  return (
    <p className="mb-2.5 text-[10px] sm:text-xs md:text-base lg:text-lg font-mono uppercase text-white whitespace-normal md:whitespace-nowrap">
      {displayText}
      <span className="animate-pulse text-[#02acfa]">█</span>
    </p>
  );
};