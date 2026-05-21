"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

import heroImg from "@/assets/cta/contactcta.png";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;
type LocalizedStringArray = Partial<Record<LanguageCode, string[]>>;

type CareerContentValue =
  | string
  | string[]
  | LocalizedText
  | LocalizedStringArray;

type CareerContent = {
  key: string;
  value: CareerContentValue;
};

type CareerSection = {
  name?: string;
  contents?: CareerContent[];
};

type CareerPageResponse = {
  pageKey?: string;
  title?: string;
  sections?: CareerSection[];
};

type BlockInTextCardProps = {
  tag: string;
  strongText: string;
  text: string;
  examples: string[];
  buttonText: string;
  buttonLink: string;
};

type TypewriteProps = {
  examples: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const LETTER_DELAY = 30;
const HOLD_DELAY = 1500;

const fallbackExamples: LocalizedStringArray = {
  tr: [
    "HAYAL ET, DENEMEKTEN KORKMA; GERİSİ GELİŞİMİN BİR PARÇASI.",
    "TUTKULUYSAN, ENGEL TANIMAZSIN; DENEYİM SADECE BİR DETAYDIR.",
    "DENEMEYE CESARET EDENLER, SINIRLARI YOK EDER.",
    "YENİ MEZUN OLMANIN HİÇ BİR ÖNEMİ YOK",
  ],
  en: [
    "IMAGINE, DO NOT FEAR TRYING; THE REST IS PART OF GROWTH.",
    "IF YOU ARE PASSIONATE, YOU KNOW NO OBSTACLES; EXPERIENCE IS ONLY A DETAIL.",
    "THOSE WHO DARE TO TRY REMOVE LIMITS.",
    "BEING A NEW GRADUATE DOES NOT MATTER.",
  ],
  fr: [
    "IMAGINEZ, N’AYEZ PAS PEUR D’ESSAYER; LE RESTE FAIT PARTIE DU PROGRÈS.",
    "SI VOUS ÊTES PASSIONNÉ, AUCUN OBSTACLE NE VOUS ARRÊTE.",
    "CEUX QUI OSENT ESSAYER REPOUSSENT LES LIMITES.",
    "ÊTRE JEUNE DIPLÔMÉ N’A PAS D’IMPORTANCE.",
  ],
  ru: [
    "МЕЧТАЙТЕ И НЕ БОЙТЕСЬ ПРОБОВАТЬ; ОСТАЛЬНОЕ — ЧАСТЬ РАЗВИТИЯ.",
    "ЕСЛИ У ВАС ЕСТЬ СТРАСТЬ, ПРЕГРАДЫ НЕ ВАЖНЫ.",
    "ТЕ, КТО ОСМЕЛИВАЕТСЯ ПРОБОВАТЬ, СТИРАЮТ ГРАНИЦЫ.",
    "БЫТЬ НЕДАВНИМ ВЫПУСКНИКОМ — НЕ ПРОБЛЕМА.",
  ],
};

function normalizeLanguage(language: string): LanguageCode {
  const normalized = language.toLowerCase();

  if (normalized === "tr") return "tr";
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "ru") return "ru";

  return "tr";
}

function getContent<T>(contents: CareerContent[], key: string, fallback: T): T {
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

function getTextArray(
  value: LocalizedStringArray | string[] | undefined,
  language: string
): string[] {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  const lang = normalizeLanguage(language);

  return value[lang] || value.tr || value.en || value.fr || value.ru || [];
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

function randomChar() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/|";

  return chars[Math.floor(Math.random() * chars.length)];
}

export default function Career() {
  const { language } = useLanguage();
  const [contents, setContents] = useState<CareerContent[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCareerCta = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/CareerCTA`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `CareerCTA verisi alınamadı. Status: ${response.status}`
          );
        }

        const data = (await response.json()) as CareerPageResponse;

        const careerSection =
          data.sections?.find((section) => {
            const sectionName = section.name?.toLowerCase();

            return (
              sectionName === "career-cta" ||
              sectionName === "careercta" ||
              sectionName === "career"
            );
          }) || data.sections?.[0];

        if (isMounted && careerSection?.contents) {
          setContents(careerSection.contents);
        }
      } catch (error) {
        console.error("CareerCTA verisi alınamadı:", error);
      }
    };

    fetchCareerCta();

    return () => {
      isMounted = false;
    };
  }, []);

  const backgroundImageFromJson = getPublicMediaUrl(
    getContent<string>(contents, "backgroundImage", "")
  );

  const backgroundImage = backgroundImageFromJson || heroImg.src;

  const tag = getText(
    getContent<LocalizedText>(contents, "tag", {
      tr: "/ KARİYER",
      en: "/ CAREER",
      fr: "/ CARRIÈRE",
      ru: "/ КАРЬЕРА",
    }),
    language
  );

  const strongText = getText(
    getContent<LocalizedText>(contents, "strongText", {
      tr: "Ekibimize katılmak ister misin?",
      en: "Would you like to join our team?",
      fr: "Souhaitez-vous rejoindre notre équipe ?",
      ru: "Хотите присоединиться к нашей команде?",
    }),
    language
  );

  const text = getText(
    getContent<LocalizedText>(contents, "text", {
      tr: "Tutkunuzu ve yeteneklerinizi paylaşın, iş başvuru formunu doldurarak size en uygun işi ve takımı bulabilirsiniz.",
      en: "Share your passion and skills; fill out the job application form and find the most suitable role and team for you.",
      fr: "Partagez votre passion et vos compétences ; remplissez le formulaire de candidature pour trouver le poste et l’équipe qui vous conviennent.",
      ru: "Поделитесь своей страстью и навыками; заполните форму заявки, чтобы найти подходящую роль и команду.",
    }),
    language
  );

  const examples = getTextArray(
    getContent<LocalizedStringArray>(contents, "examples", fallbackExamples),
    language
  );

  const buttonText = getText(
    getContent<LocalizedText>(contents, "buttonText", {
      tr: "KENDİNİ TANIT",
      en: "INTRODUCE YOURSELF",
      fr: "PRÉSENTEZ-VOUS",
      ru: "РАССКАЖИТЕ О СЕБЕ",
    }),
    language
  );

  const buttonLink = getContent<string>(contents, "buttonLink", "/contact");

  return (
    <section className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-10">
        <div className="bg-transparent text-white w-full max-w-3xl lg:max-w-4xl">
          <BlockInTextCard
            tag={tag}
            strongText={strongText}
            text={text}
            examples={examples}
            buttonText={buttonText}
            buttonLink={buttonLink}
          />
        </div>
      </div>
    </section>
  );
}

function BlockInTextCard({
  tag,
  strongText,
  text,
  examples,
  buttonText,
  buttonLink,
}: BlockInTextCardProps) {
  return (
    <div className="w-full space-y-6 sm:space-y-7">
      <div>
        {tag && (
          <p className="mb-2 text-sm sm:text-base font-light uppercase tracking-wide">
            {tag}
          </p>
        )}

        <hr className="border-neutral-700" />
      </div>

      {(strongText || text) && (
        <p className="max-w-full text-base sm:text-lg md:text-xl leading-relaxed">
          {strongText && <strong>{strongText}</strong>} {text}
        </p>
      )}

      {examples.length > 0 && (
        <div>
          <Typewrite key={examples.join("|")} examples={examples} />
          <hr className="border-neutral-300 mt-2" />
        </div>
      )}

      {buttonLink && buttonText && (
        <Link
          href={buttonLink}
          className="group relative mt-6 lg:mt-14 inline-flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-[#02acfa] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#181818]"
        >
          <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[120%]" />

          <span className="relative z-10 flex items-center justify-center gap-3">
            {buttonText}
            <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      )}
    </div>
  );
}

function Typewrite({ examples }: TypewriteProps) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (examples.length === 0) return;

    const currentText = examples[exampleIndex];

    if (!currentText || isHolding) return;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          let temp = "";

          for (let i = 0; i <= charIndex; i++) {
            temp += currentText[i] ?? "";
          }

          for (let i = charIndex + 1; i < currentText.length; i++) {
            temp += randomChar();
          }

          setDisplayText(temp);
          setCharIndex((prev) => prev + 1);
        } else {
          setIsHolding(true);

          window.setTimeout(() => {
            setIsDeleting(true);
            setIsHolding(false);
          }, HOLD_DELAY);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCharIndex(0);
          setExampleIndex((prev) => (prev + 1) % examples.length);
        }
      }
    }, LETTER_DELAY);

    return () => window.clearTimeout(timer);
  }, [charIndex, displayText, exampleIndex, isDeleting, isHolding, examples]);

  if (examples.length === 0) return null;

  return (
    <p className="mb-2.5 text-[10px] sm:text-xs md:text-base lg:text-lg font-mono uppercase text-white whitespace-normal md:whitespace-nowrap">
      {displayText}
      <span className="animate-pulse text-[#02acfa]">█</span>
    </p>
  );
}