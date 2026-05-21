"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import {
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type FooterIconType =
  | "email"
  | "mail"
  | "phone"
  | "location"
  | "instagram"
  | "linkedin";

type FooterLinkItem = {
  type?: FooterIconType;
  title?: LocalizedText;
  label?: string | LocalizedText;
  href?: string;
  link?: string;
  url?: string;
  tab?: string;
  external?: boolean;
};

type FooterContentValue =
  | string
  | LocalizedText
  | FooterLinkItem[];

type FooterContent = {
  key: string;
  value: FooterContentValue;
};

type FooterSection = {
  name?: string;
  contents?: FooterContent[];
};

type FooterPageResponse = {
  pageKey?: string;
  title?: string;
  sections?: FooterSection[];
};

type FooterColumn = {
  title: string;
  href: string;
  text?: string;
  links: FooterLinkItem[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const iconMap: Partial<Record<FooterIconType, ReactNode>> = {
  email: <IoIosMail />,
  mail: <IoIosMail />,
  phone: <FaPhoneAlt />,
  location: <FaMapMarkerAlt />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedinIn />,
};

function normalizeLanguage(language: string): LanguageCode {
  const normalized = language.toLowerCase();

  if (normalized === "tr") return "tr";
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "ru") return "ru";

  return "tr";
}

function getContent<T>(contents: FooterContent[], key: string, fallback: T): T {
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

function getFooterLinkHref(item: FooterLinkItem) {
  if (item.external) {
    return item.url || item.href || item.link || "#";
  }

  const baseHref = item.href || item.link || item.url || "#";

  if (item.tab && baseHref.startsWith("/projects")) {
    return `${baseHref}?category=${encodeURIComponent(item.tab)}`;
  }

  return baseHref;
}

function getFooterLinkLabel(item: FooterLinkItem, language: string) {
  return (
    getText(item.label, language) ||
    getText(item.title, language) ||
    item.href ||
    item.link ||
    item.url ||
    ""
  );
}

const itemMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 },
} as const;

function FooterLink({ item, language }: { item: FooterLinkItem; language: string }) {
  const href = getFooterLinkHref(item);
  const label = getFooterLinkLabel(item, language);

  if (!label || !href) return null;

  const isExternal = Boolean(item.external) || href.startsWith("http");
  const isActionLink = href.startsWith("mailto:") || href.startsWith("tel:");
  const icon = item.type ? iconMap[item.type] : null;

  const className =
    "group inline-flex items-start gap-3 text-sm leading-7 text-white/58 transition-colors duration-300 hover:text-white";

  const content = (
    <>
      {icon ? (
        <span className="mt-[5px] shrink-0 text-[#02acfa]">{icon}</span>
      ) : (
        <span className="mt-[11px] h-[5px] w-[5px] shrink-0 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-[#02acfa]" />
      )}

      <span className="whitespace-pre-line">{label}</span>
    </>
  );

  if (isExternal || isActionLink) {
    return (
      <motion.a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        whileHover={{ x: 6 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
      <Link href={href} className={className}>
        {content}
      </Link>
    </motion.div>
  );
}

export default function Footer() {
  const { language } = useLanguage();

  const [contents, setContents] = useState<FooterContent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFooter = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/Footer`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Footer verisi alınamadı. Status: ${response.status}`);
        }

        const data = (await response.json()) as FooterPageResponse;

        const footerSection =
          data.sections?.find(
            (section) => section.name?.toLowerCase() === "footer"
          ) || data.sections?.[0];

        if (isMounted && footerSection?.contents) {
          setContents(footerSection.contents);
        }
      } catch (error) {
        console.error("Footer verisi alınamadı:", error);
      } finally {
        if (isMounted) {
          setLoaded(true);
        }
      }
    };

    fetchFooter();

    return () => {
      isMounted = false;
    };
  }, []);

  const logo = getPublicMediaUrl(getContent<string>(contents, "logo", ""));

  const topEyebrow = getText(
    getContent<LocalizedText>(contents, "topEyebrow", {}),
    language
  );

  const topTitle = getText(
    getContent<LocalizedText>(contents, "topTitle", {}),
    language
  );

  const topHighlight = getText(
    getContent<LocalizedText>(contents, "topHighlight", {}),
    language
  );

  const topCtaText = getText(
    getContent<LocalizedText>(contents, "topCtaText", {}),
    language
  );

  const topCtaLink = getContent<string>(contents, "topCtaLink", "/contact");

  const aboutTitle = getText(
    getContent<LocalizedText>(contents, "aboutTitle", {}),
    language
  );

  const aboutLink = getContent<string>(contents, "aboutLink", "/about");

  const aboutText = getText(
    getContent<LocalizedText>(contents, "aboutText", {}),
    language
  );

  const projectsTitle = getText(
    getContent<LocalizedText>(contents, "projectsTitle", {}),
    language
  );

  const projectsLink = getContent<string>(contents, "projectsLink", "/projects");

  const projectsLinks = getContent<FooterLinkItem[]>(
    contents,
    "projectsLinks",
    []
  );

  const corporateTitle = getText(
    getContent<LocalizedText>(contents, "corporateTitle", {}),
    language
  );

  const corporateLink = getContent<string>(
    contents,
    "corporateLink",
    "/corporate"
  );

  const corporateLinks = getContent<FooterLinkItem[]>(
    contents,
    "corporateLinks",
    []
  );

  const contactTitle = getText(
    getContent<LocalizedText>(contents, "contactTitle", {}),
    language
  );

  const contactLink = getContent<string>(contents, "contactLink", "/contact");

  const contactLinks = getContent<FooterLinkItem[]>(
    contents,
    "contactLinks",
    []
  );

  const copyright = getText(
    getContent<LocalizedText>(contents, "copyright", {}),
    language
  );

  const companyText = getText(
    getContent<LocalizedText>(contents, "companyText", {}),
    language
  );

  const socialLinks = getContent<FooterLinkItem[]>(
    contents,
    "socialLinks",
    []
  );

  const legalLinks = getContent<FooterLinkItem[]>(
    contents,
    "legalLinks",
    []
  );

  const footerColumns: FooterColumn[] = [
    {
      title: aboutTitle,
      href: aboutLink,
      text: aboutText,
      links: [],
    },
    {
      title: projectsTitle,
      href: projectsLink,
      links: projectsLinks,
    },
    {
      title: corporateTitle,
      href: corporateLink,
      links: corporateLinks,
    },
    {
      title: contactTitle,
      href: contactLink,
      links: contactLinks,
    },
  ].filter((column) => column.title);

  if (!loaded && contents.length === 0) {
    return null;
  }

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
        {(topEyebrow || topTitle || topHighlight || topCtaText) && (
          <motion.div
            {...itemMotion}
            className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:mb-14 md:p-6 xl:p-7"
          >
            {topEyebrow && (
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-[#02acfa]">
                {topEyebrow}
              </p>
            )}

            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="group inline-block"
            >
              <Link href={topCtaLink || "/contact"}>
                <motion.h2
                  variants={{
                    rest: { y: 0 },
                    hover: { y: -2 },
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="max-w-4xl text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white md:text-[34px] xl:text-[42px]"
                >
                  {topTitle}
                  {topHighlight && (
                    <span className="block text-white/85 transition-colors duration-300 group-hover:text-[#02acfa]">
                      {topHighlight}
                    </span>
                  )}
                </motion.h2>

                {topCtaText && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/50 transition-colors duration-300 group-hover:text-white md:text-sm">
                    <span className="relative inline-block">
                      {topCtaText}
                      <span className="absolute -bottom-1 left-0 h-[1px] w-full origin-left scale-x-0 bg-[#02acfa] transition-transform duration-300 group-hover:scale-x-100" />
                    </span>

                    <FiArrowUpRight className="text-[#02acfa] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                )}

                <div className="pointer-events-none mt-6 h-px w-full max-w-2xl bg-gradient-to-r from-[#02acfa]/50 via-white/10 to-transparent" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        <div className="grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 xl:grid-cols-4">
          {footerColumns.map((column, columnIndex) => (
            <motion.div
              key={`${column.title}-${columnIndex}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: columnIndex * 0.05,
                ease: "easeOut",
              }}
            >
              <Link
                href={column.href || "#"}
                className="mb-5 inline-block text-lg font-semibold text-white transition-colors duration-300 hover:text-[#02acfa]"
              >
                {column.title}
              </Link>

              {column.links.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {column.links.map((item, index) => (
                    <FooterLink
                      key={`${getFooterLinkLabel(item, language)}-${index}`}
                      item={item}
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                column.text && (
                  <p className="max-w-sm whitespace-pre-line text-sm leading-7 text-white/45">
                    {column.text}
                  </p>
                )
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          {...itemMotion}
          className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between"
        >
          <div>
            {logo && (
              <Link href="/" className="inline-block">
                <Image
                  src={logo}
                  alt="Artech Logo"
                  width={180}
                  height={55}
                  unoptimized
                  className="h-[40px] w-auto object-contain md:h-[45px] lg:h-[50px]"
                />
              </Link>
            )}

            {copyright && (
              <p className="mt-3 text-sm leading-7 text-white/45">
                {copyright}
              </p>
            )}

            {companyText && (
              <p className="mt-1 text-xs leading-6 text-white/35">
                {companyText}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {socialLinks.map((item, index) => {
                  const href = getFooterLinkHref(item);
                  const label = getFooterLinkLabel(item, language);
                  const icon = item.type ? iconMap[item.type] : null;

                  if (!href || !label) return null;

                  return (
                    <a
                      key={`${label}-${index}`}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-white"
                    >
                      {icon && <span className="text-[#02acfa]">{icon}</span>}
                      {label}
                    </a>
                  );
                })}
              </div>
            )}

            {legalLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {legalLinks.map((item, index) => {
                  const href = getFooterLinkHref(item);
                  const label = getFooterLinkLabel(item, language);

                  if (!href || !label) return null;

                  return (
                    <Link
                      key={`${label}-${index}`}
                      href={href}
                      className="text-sm text-white/55 transition-colors duration-300 hover:text-white"
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}