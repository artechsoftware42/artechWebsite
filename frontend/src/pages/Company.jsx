import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import { fetchJson } from "../utils/fetchJson";

const LIGHT_BG = "#F0F2F5";

const getLocalizedValue = (value, language, fallback = "") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? value.tr ?? fallback;
  }

  return value ?? fallback;
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

const sectionFadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const statContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const statItem = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

const ServiceAccordionItem = ({
  item,
  index,
  activeIndex,
  setActiveIndex,
  serviceProcessText,
}) => {
  const isActive = activeIndex === index;

  return (
    <motion.div
      layout
      onMouseEnter={() => setActiveIndex(index)}
      className={`group relative w-full cursor-pointer overflow-hidden border-b border-white/10 transition-colors duration-300 ${isActive ? "bg-white/[0.04]" : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-12">
        <div className="grid items-center gap-6 py-7 md:grid-cols-[100px_1fr_auto] md:py-9">
          <motion.p
            animate={{
              scale: isActive ? 1.15 : 1,
              opacity: isActive ? 1 : 0.7,
            }}
            transition={{ duration: 0.35 }}
            className="text-lg font-semibold tracking-[0.2em] text-white/70 md:text-xl"
          >
            {String(index + 1).padStart(2, "0")}
            <span className="text-sky-400">.</span>
          </motion.p>

          <div>
            <motion.h3
              animate={{
                x: isActive ? 10 : 0,
                color: isActive ? "#ffffff" : "#d4d4d4",
              }}
              transition={{ duration: 0.35 }}
              className="text-2xl font-semibold md:text-4xl"
            >
              {item.title}
            </motion.h3>
          </div>

          <motion.div
            animate={{ rotate: isActive ? 45 : 0, scale: isActive ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            className="hidden rounded-full border border-white/15 p-3 text-white/80 md:flex"
          >
            <FiArrowUpRight size={20} />
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: isActive ? "auto" : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="grid gap-8 pb-10 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pb-14">
            <motion.div
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 0.96,
                y: isActive ? 0 : 14,
              }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-[280px] w-full object-cover md:h-[360px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </motion.div>

            <div className="flex flex-col justify-center">
              <motion.h4
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 18,
                }}
                transition={{ delay: 0.06, duration: 0.35 }}
                className="mb-4 text-2xl font-semibold text-white md:text-3xl"
              >
                {item.title}
              </motion.h4>

              <motion.p
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 18,
                }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="max-w-2xl text-base leading-7 text-white/70 md:text-lg"
              >
                {item.description}
              </motion.p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {(item.tags || []).map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 10,
                    }}
                    transition={{ delay: 0.16 + i * 0.06, duration: 0.3 }}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/80"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 12,
                }}
                transition={{ delay: 0.28, duration: 0.35 }}
                className="mt-8 flex items-center gap-3 text-sm font-medium text-[#02acfa]"
              >
                <FiCheckCircle />
                {serviceProcessText}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const VisionMissionCard = ({ item, index, cardBadgeText, cardCtaText }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [edge, setEdge] = useState("top");
  const [pos, setPos] = useState(50);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const distTop = y;
    const distBottom = rect.height - y;
    const distLeft = x;
    const distRight = rect.width - x;

    const minDist = Math.min(distTop, distBottom, distLeft, distRight);

    if (minDist === distTop) {
      setEdge("top");
      setPos((x / rect.width) * 100);
    } else if (minDist === distBottom) {
      setEdge("bottom");
      setPos((x / rect.width) * 100);
    } else if (minDist === distLeft) {
      setEdge("left");
      setPos((y / rect.height) * 100);
    } else {
      setEdge("right");
      setPos((y / rect.height) * 100);
    }
  };

  const topGlow = {
    opacity: isHovered && edge === "top" ? 1 : 0,
    background: `radial-gradient(140px 16px at ${pos}% 50%, rgba(2,172,250,1) 0%, rgba(2,172,250,0.72) 35%, rgba(2,172,250,0.18) 70%, transparent 100%)`,
  };

  const bottomGlow = {
    opacity: isHovered && edge === "bottom" ? 1 : 0,
    background: `radial-gradient(140px 16px at ${pos}% 50%, rgba(2,172,250,1) 0%, rgba(2,172,250,0.72) 35%, rgba(2,172,250,0.18) 70%, transparent 100%)`,
  };

  const leftGlow = {
    opacity: isHovered && edge === "left" ? 1 : 0,
    background: `radial-gradient(16px 140px at 50% ${pos}%, rgba(2,172,250,1) 0%, rgba(2,172,250,0.72) 35%, rgba(2,172,250,0.18) 70%, transparent 100%)`,
  };

  const rightGlow = {
    opacity: isHovered && edge === "right" ? 1 : 0,
    background: `radial-gradient(16px 140px at 50% ${pos}%, rgba(2,172,250,1) 0%, rgba(2,172,250,0.72) 35%, rgba(2,172,250,0.18) 70%, transparent 100%)`,
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-[360px] overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#111] sm:h-[380px] xl:h-[420px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${item.image})` }}
      />
      <div className="absolute inset-0 bg-black/55 transition-all duration-500 group-hover:bg-black/74" />

      <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] border border-white/10" />
      <div
        className="pointer-events-none absolute left-4 right-4 top-0 h-[2px] transition-opacity duration-150"
        style={topGlow}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] transition-opacity duration-150"
        style={bottomGlow}
      />
      <div
        className="pointer-events-none absolute bottom-4 left-0 top-4 w-[2px] transition-opacity duration-150"
        style={leftGlow}
      />
      <div
        className="pointer-events-none absolute bottom-4 right-0 top-4 w-[2px] transition-opacity duration-150"
        style={rightGlow}
      />

      <div className="absolute left-6 right-6 top-6 z-10 md:left-7 md:right-7 md:top-7">
        <div className="flex h-10 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white backdrop-blur-md">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="block text-xs font-semibold uppercase tracking-[0.22em] leading-none text-white/65">
            {cardBadgeText}
          </span>
        </div>
      </div>

      <div className="absolute left-6 right-6 top-[92px] z-10 md:left-7 md:right-7 md:top-[98px]">
        <div className="flex h-[88px] items-start md:h-[96px]">
          <h3 className="m-0 max-w-[280px] whitespace-pre-line text-[2rem] font-bold leading-[1] tracking-[-0.02em] text-white md:max-w-[300px] md:text-[2.15rem]">
            {item.title}
          </h3>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 24,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute bottom-6 left-6 right-6 z-10 overflow-hidden md:bottom-7 md:left-7 md:right-7"
      >
        <p className="max-w-xl text-sm leading-7 text-white/78 md:text-[15px]">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(item.tags || []).map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#02acfa]">
          <FiArrowUpRight />
          {cardCtaText}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BrandIntroSection = ({
  introBadge,
  introTitle,
  introParagraph,
  introTags,
  stats,
}) => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [80, -60]);
  const rightY = useTransform(scrollYProgress, [0, 1], [50, -70]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 text-[#0D0D0D] md:py-28"
      style={{ backgroundColor: LIGHT_BG }}
    >
      <motion.div
        style={{ y: leftY }}
        className="pointer-events-none absolute -left-16 top-14 h-44 w-44 rounded-full bg-[#02acfa]/10 blur-3xl md:h-64 md:w-64"
      />
      <motion.div
        style={{ y: rightY }}
        className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-[#02acfa]/10 blur-3xl md:h-72 md:w-72"
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="relative lg:pt-16"
          >
            <motion.div
              style={{ y: badgeY }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/75 px-4 py-2 backdrop-blur-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#02acfa]" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0D0D0D]/70">
                {introBadge}
              </span>
            </motion.div>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] text-[#0D0D0D] sm:text-5xl md:text-6xl xl:text-[5.1rem] whitespace-pre-line">
              {introTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#0D0D0D]/68 md:text-lg">
              {introParagraph}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {(introTags || []).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[#0D0D0D]/75 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={statContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-12 lg:grid-cols-1"
          >
            {(stats || []).map((stat, index) => (
              <motion.div
                key={index}
                variants={statItem}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#dbe1e8] bg-white/78 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-7"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#02acfa]/12 blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#02acfa]/[0.04] via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="text-[2.7rem] font-extrabold leading-none tracking-[-0.05em] text-[#02acfa] md:text-[3.4rem]">
                    {stat.value}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[#0D0D0D] md:text-xl">
                    {stat.label}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#0D0D0D]/65 md:text-[15px]">
                    {stat.description}
                  </p>

                  <div className="mt-5 h-px w-full bg-gradient-to-r from-[#02acfa]/35 via-black/10 to-transparent transition-all duration-300 group-hover:from-[#02acfa] group-hover:via-[#02acfa]/40" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function Company() {
  const { language } = useLanguage();
  const [contents, setContents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/Company`);
        if (!data) return;
        setContents(data.sections || []);
      } catch (error) {
        console.error("Company verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchData();
  }, []);

  const getValue = (sectionName, key, fallback = "") => {
    const section = contents.find((s) => s.name === sectionName);
    const item = section?.contents?.find((c) => c.key === key)?.value;

    return getLocalizedValue(item, language, fallback);
  };

  const services = getValue("services", "servicesItems", []).map((item) => ({
    ...item,
    title: getLocalizedValue(item.title, language, ""),
    description: getLocalizedValue(item.description, language, ""),
    image: normalizeMediaPath(item.image),
  }));

  const visionCards = getValue("vision", "visionItems", []).map((item) => ({
    ...item,
    title: getLocalizedValue(item.title, language, ""),
    description: getLocalizedValue(item.description, language, ""),
    image: normalizeMediaPath(item.image),
  }));

  const stats = getValue("stats", "statsItems", []).map((item) => ({
    ...item,
    label: getLocalizedValue(item.label, language, ""),
    description: getLocalizedValue(item.description, language, ""),
  }));

  const introBadge = getValue("intro", "introBadge", "");
  const introTitle = getValue("intro", "introTitle", "");
  const introParagraph = getValue("intro", "introParagraph", "");
  const introTags = getValue("intro", "introTags", []);

  const servicesSubtitle = getValue("services", "servicesSubtitle", "");
  const servicesTitle = getValue("services", "servicesTitle", "");
  const servicesParagraph = getValue("services", "servicesParagraph", "");
  const serviceProcessText = getValue(
    "services",
    "serviceProcessText",
    "Projeye özel analiz, tasarım ve geliştirme süreci"
  );

  const valuesBadge = getValue("vision", "valuesBadge", "");
  const valuesTitle = getValue("vision", "valuesTitle", "");
  const valuesParagraph = getValue("vision", "valuesParagraph", "");
  const valuesCardBadge = getValue("vision", "valuesCardBadge", "");
  const valuesCardCta = getValue("vision", "valuesCardCta", "");

  return (
    <div
      className="overflow-x-hidden text-[#0D0D0D]"
      style={{ backgroundColor: LIGHT_BG }}
    >
      <BrandIntroSection
        introBadge={introBadge}
        introTitle={introTitle}
        introParagraph={introParagraph}
        introTags={introTags}
        stats={stats}
      />

      <section
        id="services"
        className="relative w-full overflow-hidden bg-[#0D0D0D] py-24 text-[#E8E8E8]"
      >
        <div className="mx-auto mb-16 max-w-7xl px-4 text-center md:px-8 xl:px-12">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400"
          >
            {servicesSubtitle}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="text-4xl font-extrabold md:text-6xl lg:text-7xl"
          >
            {servicesTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/60 md:text-lg"
          >
            {servicesParagraph}
          </motion.p>
        </div>

        <div>
          {services.map((item, index) => (
            <ServiceAccordionItem
              key={index}
              item={item}
              index={index}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              serviceProcessText={serviceProcessText}
            />
          ))}
        </div>
      </section>

      <section
        className="relative overflow-hidden py-24 text-[#0D0D0D]"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-12">
          <motion.div
            variants={sectionFadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="mb-14 text-center"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#02acfa]">
              {valuesBadge}
            </p>

            <h2 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.15] tracking-[-0.02em] text-[#0D0D0D] md:text-6xl md:leading-[1.12]">
              {valuesTitle}
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#0D0D0D]/65 md:text-lg">
              {valuesParagraph}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visionCards.map((item, index) => (
              <VisionMissionCard
                key={index}
                item={item}
                index={index}
                cardBadgeText={valuesCardBadge}
                cardCtaText={valuesCardCta}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}