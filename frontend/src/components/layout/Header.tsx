"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaChevronDown,
  FaBriefcase,
  FaGamepad,
  FaGlobe,
} from "react-icons/fa";
import { BsArrowUpRight, BsCheck2 } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;

type NavIconName = "briefcase" | "gamepad";

type SubmenuItem = {
  title: LocalizedText;
  desc?: LocalizedText;
  link?: string;
  tab?: string;
  url?: string;
  external?: boolean;
  icon?: NavIconName;
};

type NavLinkItem = {
  _id: number;
  title: LocalizedText;
  link: string;
  submenu?: SubmenuItem[];
};

type LanguageItem = {
  code: LanguageCode;
  short: string;
  label: string | LocalizedText;
  flag: string;
};

type HeaderContentValue =
  | string
  | LocalizedText
  | NavLinkItem[]
  | LanguageItem[];

type HeaderContent = {
  key: string;
  value: HeaderContentValue;
};

type HeaderSection = {
  name?: string;
  contents?: HeaderContent[];
};

type HeaderPageResponse = {
  pageKey?: string;
  title?: string;
  sections?: HeaderSection[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const iconMap: Record<NavIconName, ReactNode> = {
  briefcase: <FaBriefcase />,
  gamepad: <FaGamepad />,
};

function getContent<T>(
  contents: HeaderContent[],
  key: string,
  fallback: T
): T {
  const found = contents.find((content) => content.key === key)?.value;

  if (found === undefined || found === null) {
    return fallback;
  }

  return found as T;
}

function normalizeLanguage(language: string): LanguageCode {
  const normalized = language.toLowerCase();

  if (normalized === "tr") return "tr";
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "ru") return "ru";

  return "tr";
}

function getText(value: LocalizedText | string | undefined, language: string) {
  if (!value) return "";

  if (typeof value === "string") return value;

  const lang = normalizeLanguage(language);

  return value[lang] || value.tr || value.en || value.fr || value.ru || "";
}

function getLanguageLabel(label: string | LocalizedText, language: string) {
  return getText(label, language);
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

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const [contents, setContents] = useState<HeaderContent[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [header, setHeader] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [mobileLangOpen, setMobileLangOpen] = useState(true);
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);

  const mobileLangRef = useRef<HTMLDivElement | null>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    const fetchHeader = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pages/Header`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Header verisi alınamadı. Status: ${response.status}`);
        }

        const data = (await response.json()) as HeaderPageResponse;

        const headerSection =
          data.sections?.find(
            (section) => section.name?.toLowerCase() === "header"
          ) || data.sections?.[0];

        if (headerSection?.contents) {
          setContents(headerSection.contents);
        }
      } catch (error) {
        console.error("Header verisi alınamadı:", error);
      }
    };

    fetchHeader();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const shouldScrollTop = sessionStorage.getItem("reloadHomeToTop");

    if (pathname === "/" && shouldScrollTop === "true") {
      sessionStorage.removeItem("reloadHomeToTop");

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });

      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    }
  }, [pathname]);

  useEffect(() => {
    const changeBackground = () => {
      if (pathname === "/") {
        setHeader(window.scrollY >= 80);
      } else {
        setHeader(true);
      }
    };

    changeBackground();

    window.addEventListener("scroll", changeBackground, { passive: true });

    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 940) {
        setMenuOpen(false);
        setOpenSubmenu(null);
        setMobileLangOpen(true);
      } else {
        setDesktopLangOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileLangRef.current &&
        !mobileLangRef.current.contains(event.target as Node)
      ) {
        setMobileLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logoUrl = getPublicMediaUrl(getContent<string>(contents, "logo", ""));

  const navLinks = getContent<NavLinkItem[]>(contents, "navLinks", []);

  const languages = getContent<LanguageItem[]>(contents, "languages", []);

  const offerText = getText(
    getContent<LocalizedText>(contents, "offerText", {}),
    language
  );

  const offerLink = getContent<string>(contents, "offerLink", "/offer");

  const languageTitle = getText(
    getContent<LocalizedText>(contents, "languageTitle", {}),
    language
  );

  const selectedLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  const getSubmenuLink = (item: SubmenuItem) => {
    if (item.external) return item.url || "#";

    if (item.tab && item.link) {
      return `${item.link}?category=${encodeURIComponent(item.tab)}`;
    }

    return item.link || "#";
  };

  const handleLanguageSelect = (selected: LanguageItem) => {
    setLanguage(selected.code);
    setMobileLangOpen(true);
    setDesktopLangOpen(false);
  };

  const handleLogoClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();

      sessionStorage.setItem("reloadHomeToTop", "true");

      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      window.scrollTo(0, 0);
      window.location.reload();
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full h-[90px] z-[999] transition-all duration-500 ${isHome
        ? header
          ? "bg-[#0D0D0D] backdrop-blur-md"
          : "bg-transparent"
        : "bg-[#0D0D0D] backdrop-blur-md"
        }`}
    >
      <nav className="grid grid-cols-[auto_1fr_auto] items-center max-w-[1480px] mx-auto h-full px-4 md:px-6 gap-4">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="z-[1001] flex items-center shrink-0"
        >
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Artech Logo"
              width={180}
              height={55}
              unoptimized
              priority
              className="h-[45px] md:h-[50px] lg:h-[55px] w-auto object-contain"
            />
          )}
        </Link>

        <div className="flex justify-center min-w-0 max-[940px]:hidden">
          <ul className="flex items-center justify-center gap-6 xl:gap-8">
            {navLinks.map(({ _id, title, link, submenu }) => (
              <li key={_id} className="relative group shrink-0">
                <Link
                  href={link}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  {getText(title, language)}

                  {submenu && submenu.length > 0 && (
                    <FaChevronDown className="text-xs group-hover:rotate-180 transition-transform" />
                  )}
                </Link>

                {submenu && submenu.length > 0 && (
                  <div className="absolute left-0 translate-x-[6px] top-[75px] w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000]">
                    <div className="p-3 rounded-2xl shadow-2xl border border-white/10 bg-black/90 backdrop-blur-xl">
                      {submenu.map((item, index) =>
                        item.external ? (
                          <a
                            key={`${getText(item.title, language)}-${index}`}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex gap-3 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                          >
                            {item.icon && (
                              <div className="text-lg text-[#e8e8e8] mt-1">
                                {iconMap[item.icon]}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-[#e8e8e8]">
                                  {getText(item.title, language)}
                                </h4>

                                <BsArrowUpRight className="text-sm text-[#e8e8e8] shrink-0" />
                              </div>

                              {item.desc && (
                                <p className="text-sm text-gray-300">
                                  {getText(item.desc, language)}
                                </p>
                              )}
                            </div>
                          </a>
                        ) : (
                          <Link
                            key={`${getText(item.title, language)}-${index}`}
                            href={getSubmenuLink(item)}
                            className="flex gap-3 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                          >
                            {item.icon && (
                              <div className="text-lg text-[#e8e8e8] mt-1">
                                {iconMap[item.icon]}
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold text-[#e8e8e8]">
                                {getText(item.title, language)}
                              </h4>

                              {item.desc && (
                                <p className="text-sm text-gray-300">
                                  {getText(item.desc, language)}
                                </p>
                              )}
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end items-center gap-2 max-[940px]:justify-end">
          {selectedLanguage && languages.length > 0 && (
            <div
              className="relative max-[940px]:hidden flex justify-end shrink-0"
              onMouseEnter={() => setDesktopLangOpen(true)}
              onMouseLeave={() => setDesktopLangOpen(false)}
            >
              <button
                type="button"
                aria-label={languageTitle}
                className="w-[92px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer"
              >
                <FaGlobe className="text-base shrink-0" />

                <span className="text-sm font-medium tracking-wide w-[22px] text-center">
                  {selectedLanguage.short}
                </span>

                <FaChevronDown
                  className={`text-xs shrink-0 transition-transform ${desktopLangOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <AnimatePresence>
                {desktopLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 top-[75px] w-[220px] z-[1000]"
                  >
                    <div className="p-3 rounded-2xl shadow-2xl border border-white/10 bg-black/90 backdrop-blur-xl">
                      {languages.map((lang) => {
                        const flagUrl = getPublicMediaUrl(lang.flag);

                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageSelect(lang)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${selectedLanguage.code === lang.code
                              ? "bg-white/10"
                              : "hover:bg-white/10"
                              }`}
                          >
                            {flagUrl && (
                              <Image
                                src={flagUrl}
                                alt={getLanguageLabel(lang.label, language)}
                                width={28}
                                height={20}
                                unoptimized
                                className="w-7 h-5 object-cover shrink-0"
                              />
                            )}

                            <span className="font-semibold text-[#e8e8e8] flex-1">
                              {getLanguageLabel(lang.label, language)}
                            </span>

                            {selectedLanguage.code === lang.code && (
                              <BsCheck2 className="text-white text-sm shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {offerText && (
            <Link
              href={offerLink || "/offer"}
              className="max-[940px]:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer shrink-0"
            >
              <span className="font-medium whitespace-nowrap">{offerText}</span>
              <BsArrowUpRight className="text-sm shrink-0" />
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="hidden max-[940px]:flex flex-col justify-center items-center gap-[6px] cursor-pointer z-[1001]"
          >
            <span
              className={`w-7 h-[2px] bg-white transition-all ${menuOpen ? "rotate-45 translate-y-[8px]" : ""
                }`}
            />

            <span
              className={`w-7 h-[2px] bg-white transition-all ${menuOpen ? "opacity-0" : ""
                }`}
            />

            <span
              className={`w-7 h-[2px] bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
                }`}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl z-[1000] flex flex-col pt-[120px] px-6 overflow-y-auto"
          >
            <div className="flex flex-col min-h-full">
              <div>
                {navLinks.map(({ _id, title, link, submenu }, index) => (
                  <motion.div
                    key={_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="mb-4"
                  >
                    {!submenu || submenu.length === 0 ? (
                      <Link
                        href={link}
                        onClick={() => setMenuOpen(false)}
                        className="text-2xl text-[#e8e8e8] font-semibold block py-2"
                      >
                        {getText(title, language)}
                      </Link>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSubmenu(openSubmenu === _id ? null : _id)
                          }
                          className="w-full flex justify-between items-center text-2xl text-[#e8e8e8] font-semibold py-2 cursor-pointer"
                        >
                          {getText(title, language)}

                          <span
                            className={`transition-transform ${openSubmenu === _id ? "rotate-180" : ""
                              }`}
                          >
                            <FaChevronDown />
                          </span>
                        </button>

                        <AnimatePresence>
                          {openSubmenu === _id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="pl-4 overflow-hidden"
                            >
                              {submenu.map((item, submenuIndex) =>
                                item.external ? (
                                  <a
                                    key={`${getText(item.title, language)}-${submenuIndex}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 py-2 text-lg text-gray-300 cursor-pointer"
                                  >
                                    <span>{getText(item.title, language)}</span>
                                    <BsArrowUpRight className="text-sm shrink-0" />
                                  </a>
                                ) : (
                                  <Link
                                    key={`${getText(item.title, language)}-${submenuIndex}`}
                                    href={getSubmenuLink(item)}
                                    onClick={() => {
                                      setMenuOpen(false);
                                      setOpenSubmenu(null);
                                    }}
                                    className="block py-2 text-lg text-gray-300 cursor-pointer"
                                  >
                                    {getText(item.title, language)}
                                  </Link>
                                )
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-8 pb-8 space-y-4">
                {selectedLanguage && languages.length > 0 && (
                  <div
                    ref={mobileLangRef}
                    className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setMobileLangOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-4 text-[#e8e8e8] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FaGlobe className="text-sm shrink-0" />

                        <span className="font-semibold text-base">
                          {languageTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/70 font-medium">
                          {selectedLanguage.short}
                        </span>

                        <FaChevronDown
                          className={`transition-transform duration-300 ${mobileLangOpen ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {mobileLangOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 border-t border-white/10">
                            {languages.map((lang) => {
                              const flagUrl = getPublicMediaUrl(lang.flag);

                              return (
                                <button
                                  key={lang.code}
                                  type="button"
                                  onClick={() => handleLanguageSelect(lang)}
                                  className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-all mt-2 ${selectedLanguage.code === lang.code
                                    ? "bg-white/10"
                                    : "hover:bg-white/5"
                                    }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {flagUrl && (
                                      <Image
                                        src={flagUrl}
                                        alt={getLanguageLabel(lang.label, language)}
                                        width={28}
                                        height={20}
                                        unoptimized
                                        className="w-7 h-5 object-cover shrink-0 rounded-[2px]"
                                      />
                                    )}

                                    <span className="text-[#e8e8e8] font-medium">
                                      {getLanguageLabel(lang.label, language)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-white/45 font-medium tracking-wide">
                                      {lang.short}
                                    </span>

                                    {selectedLanguage.code === lang.code && (
                                      <BsCheck2 className="text-white text-sm" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {offerText && (
                  <Link
                    href={offerLink || "/offer"}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span className="font-semibold text-lg">{offerText}</span>
                    <BsArrowUpRight className="text-base shrink-0" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}