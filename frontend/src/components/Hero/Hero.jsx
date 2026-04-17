import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { BsArrowRight } from "react-icons/bs";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import heroVid from "../../assets/banner.mp4";
import { fetchJson } from "../../utils/fetchJson";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((c) => c.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? found.tr ?? fallback;
  }

  return found ?? fallback;
};

const Hero = () => {
  const { language } = useLanguage();
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/Hero`);
        if (!data) return;

        const heroSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "hero"
        );

        if (heroSection) {
          setContents(heroSection.contents || []);
        }
      } catch (error) {
        console.error("Hero verisi alınamadı:", error);
      }
    };

    fetchHero();
  }, [language]);

  const heroTitle = getLocalizedValue(
    contents,
    "heroTitle",
    language,
    "Neler Yapıyoruz?"
  );

  const heroWords = getLocalizedValue(
    contents,
    "heroTypewriter",
    language,
    ["Web Sitesi.", "Mobil Uygulama."]
  );

  const heroParagraph = getLocalizedValue(
    contents,
    "heroParagraph",
    language,
    "Açıklama metni bulunamadı."
  );

  const heroCTA = getLocalizedValue(
    contents,
    "heroCTA",
    language,
    "İletişim"
  );

  const [text] = useTypewriter({
    words: heroWords,
    loop: true,
    typeSpeed: 60,
    deleteSpeed: 30,
    delaySpeed: 2000,
  });

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src={heroVid}
        autoPlay
        loop
        muted
      />

      <div className="w-full max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between text-white">
        <div className="max-w-2xl text-left lg:ml-[-40px]">
          <h1 className="text-[26px] sm:text-[44px] font-bold">
            {heroTitle} <br />
            <span className="text-[#5ad0ff]">{text}</span>
            <Cursor
              cursorBlinking={false}
              cursorStyle="|"
              cursorColor="#5ad0ff"
            />
          </h1>

          <span className="flex items-center gap-3 mt-6 text-[16px] hover:text-sky-500 hover:animate-pulse cursor-pointer">
            {heroCTA} <BsArrowRight />
          </span>
        </div>

        <div className="mt-8 lg:mt-0 max-w-xl text-justify lg:mr-[-40px]">
          <p className="text-[16px] sm:text-[20px] leading-relaxed">
            {heroParagraph}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;