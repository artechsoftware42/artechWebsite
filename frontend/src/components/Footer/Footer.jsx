import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

const getLocalizedValue = (value, language, fallback = "") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? fallback;
  }

  return value ?? fallback;
};

const itemMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 },
};

function FooterLink({ href, label, icon, external = false }) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      whileHover={{ x: 6 }}
      transition={{ duration: 0.2 }}
      className="group inline-flex items-center gap-3 text-sm leading-7 text-white/58 transition-colors duration-300 hover:text-white"
    >
      {icon ? (
        <span className="text-[#02acfa]">{icon}</span>
      ) : (
        <span className="h-[5px] w-[5px] rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-[#02acfa]" />
      )}

      <span>{label}</span>
    </motion.a>
  );
}

export default function Footer() {
  const { language } = useLanguage();
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/Footer`);
        if (!data) return;

        const section = data.sections?.find(
          (s) => s.name?.toLowerCase() === "footer"
        );

        if (section) {
          setContents(section.contents || []);
        } else {
          setContents([]);
        }
      } catch (err) {
        console.error("Footer alınamadı:", err);
        setContents([]);
      }
    };

    fetchFooter();
  }, []);

  const contentMap = useMemo(() => {
    return contents.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }, [contents]);

  const topBadge = getLocalizedValue(contentMap.topBadge, language, "");
  const topTitleLine1 = getLocalizedValue(contentMap.topTitleLine1, language, "");
  const topTitleLine2 = getLocalizedValue(contentMap.topTitleLine2, language, "");
  const topCtaText = getLocalizedValue(contentMap.topCtaText, language, "");
  const brandText = getLocalizedValue(contentMap.brandText, language, "artech");
  const copyrightText = getLocalizedValue(contentMap.copyrightText, language, "");
  const companyText = getLocalizedValue(contentMap.companyText, language, "");

  const footerColumns = useMemo(() => {
    const rawColumns = contentMap.footerColumns;
    if (!Array.isArray(rawColumns)) return [];

    return rawColumns.map((column) => {
      const title = getLocalizedValue(column.title, language, "");
      const description = getLocalizedValue(column.description, language, "");

      if (column.columnKey === "projects") {
        const categoryMap = [
          "Websitesi",
          "Mobil Uygulamalar",
          "CRM Sistemleri",
          "Stok Takibi Programları",
          "ERP / MRP Sistemleri",
          "Savunma Sanayii",
        ];

        const links = Array.isArray(column.links)
          ? column.links.map((link, index) => ({
            label: getLocalizedValue(link.text, language, ""),
            href: `/projects?category=${encodeURIComponent(
              categoryMap[index] || getLocalizedValue(link.text, "tr", "")
            )}`,
          }))
          : [];

        return {
          columnKey: column.columnKey,
          title,
          href: "/projects",
          links,
        };
      }

      if (column.columnKey === "corporate") {
        const links = Array.isArray(column.links)
          ? column.links.map((link) => {
            const textTr = getLocalizedValue(link.text, "tr", "");
            const label = getLocalizedValue(link.text, language, "");

            if (textTr === "Kariyer") {
              return {
                label,
                href: "/career",
                external: false,
              };
            }

            if (textTr === "RSquare Studio") {
              return {
                label,
                href: "https://rsquarestudio.net/",
                external: true,
              };
            }

            return {
              label,
              href: "#",
              external: false,
            };
          })
          : [];

        return {
          columnKey: column.columnKey,
          title,
          href: "/kurumsal",
          links,
        };
      }

      if (column.columnKey === "contact") {
        const links = Array.isArray(column.contactItems)
          ? column.contactItems.map((item) => {
            const label = getLocalizedValue(item.value, language, "");

            if (item.type === "email") {
              return {
                label,
                href: `mailto:${getLocalizedValue(item.value, "tr", "")}`,
                icon: <FiMail />,
              };
            }

            if (item.type === "phone") {
              const phoneRaw = getLocalizedValue(item.value, "tr", "").replace(/\s+/g, "");
              const phoneHref = phoneRaw.replace(/[^\d+]/g, "");

              return {
                label,
                href: `tel:${phoneHref}`,
                icon: <FiPhone />,
              };
            }

            if (item.type === "address") {
              return {
                label,
                href: "/contact",
                icon: <FiMapPin />,
              };
            }

            return {
              label,
              href: "#",
            };
          })
          : [];

        return {
          columnKey: column.columnKey,
          title,
          href: "/contact",
          links,
        };
      }

      return {
        columnKey: column.columnKey,
        title,
        href: "/about",
        description,
        links: [],
      };
    });
  }, [contentMap, language]);

  const socialLinks = useMemo(() => {
    const rawSocialLinks = contentMap.socialLinks;
    if (!Array.isArray(rawSocialLinks)) return [];

    const iconMap = {
      instagram: <FiInstagram />,
      linkedin: <FiLinkedin />,
    };

    return rawSocialLinks.map((item) => ({
      label: getLocalizedValue(item.label, language, ""),
      href: item.url,
      icon: iconMap[item.platform] || null,
    }));
  }, [contentMap, language]);

  const legalTexts = useMemo(() => {
    const rawLegalTexts = contentMap.legalTexts;
    if (!Array.isArray(rawLegalTexts)) return [];

    return rawLegalTexts.map((item) => ({
      type: item.type,
      label: getLocalizedValue(item.label, language, ""),
      href: item.type === "kvkk" ? "/kvkk" : "/cerez-politikasi",
    }));
  }, [contentMap, language]);

  return (
    <footer className="relative overflow-hidden bg-[#0D0D0D] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#02acfa]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-[#02acfa]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-20 md:px-8 md:pt-24 xl:px-12">
        <motion.div
          {...itemMotion}
          className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:mb-14 md:p-6 xl:p-7"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-[#02acfa]">
            {topBadge}
          </p>

          <motion.a
            href="/contact"
            whileHover="hover"
            initial="rest"
            animate="rest"
            className="group inline-block"
          >
            <motion.h2
              variants={{
                rest: { y: 0 },
                hover: { y: -2 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-4xl text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white md:text-[34px] xl:text-[42px]"
            >
              {topTitleLine1}
              <span className="block text-white/85 transition-colors duration-300 group-hover:text-[#02acfa]">
                {topTitleLine2}
              </span>
            </motion.h2>

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/50 transition-colors duration-300 group-hover:text-white md:text-sm">
              <span className="relative inline-block">
                {topCtaText}
                <span className="absolute -bottom-1 left-0 h-[1px] w-full origin-left scale-x-0 bg-[#02acfa] transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              <FiArrowUpRight className="text-[#02acfa] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <div className="pointer-events-none mt-6 h-px w-full max-w-2xl bg-gradient-to-r from-[#02acfa]/50 via-white/10 to-transparent" />
          </motion.a>
        </motion.div>

        <div className="grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 xl:grid-cols-4">
          {footerColumns.map((column, columnIndex) => (
            <motion.div
              key={column.columnKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: columnIndex * 0.05,
                ease: "easeOut",
              }}
            >
              <a
                href={column.href}
                className="mb-5 inline-block text-lg font-semibold text-white transition-colors duration-300 hover:text-[#02acfa]"
              >
                {column.title}
              </a>

              {column.links && column.links.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {column.links.map((link, index) => (
                    <FooterLink
                      key={`${column.columnKey}-${index}-${link.label}`}
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      external={link.external || link.href?.startsWith("http")}
                    />
                  ))}
                </div>
              ) : (
                <p className="max-w-sm text-sm leading-7 text-white/45">
                  {column.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          {...itemMotion}
          className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <a
              href="/"
              className="inline-block text-2xl font-extrabold tracking-[-0.04em] text-white md:text-3xl"
            >
              {brandText}
              <span className="text-[#02acfa]">.</span>
            </a>

            <p className="mt-3 text-sm leading-7 text-white/45">
              {copyrightText}
            </p>

            <p className="mt-1 text-xs leading-6 text-white/35">
              {companyText}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {socialLinks.map((item, index) => (
                <a
                  key={`${item.label}-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-white"
                >
                  <span className="text-[#02acfa]">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {legalTexts.map((item, index) => (
                <a
                  key={`${item.type}-${index}`}
                  href={item.href}
                  className="text-sm text-white/55 transition-colors duration-300 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}