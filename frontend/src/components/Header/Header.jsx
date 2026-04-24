import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaChevronDown,
  FaBriefcase,
  FaGamepad,
  FaGlobe,
} from "react-icons/fa";
import { BsArrowUpRight, BsCheck2 } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { fetchJson } from "../../utils/fetchJson";

const getLocalizedValue = (value, language, fallback = "") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? value.tr ?? value.en ?? fallback;
  }

  return value ?? fallback;
};

const normalizeMenuItems = (items, language) => {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    ...item,
    _id: item._id ?? index,
    title: getLocalizedValue(item.title, language, ""),
    submenu: Array.isArray(item.submenu)
      ? item.submenu.map((sub, subIndex) => ({
          ...sub,
          _id: sub._id ?? `${index}-${subIndex}`,
          title: getLocalizedValue(sub.title, language, ""),
          desc: getLocalizedValue(sub.desc, language, ""),
        }))
      : null,
  }));
};

const normalizeLanguages = (items, language) => {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => ({
    ...item,
    _id: item._id ?? index,
    label: getLocalizedValue(item.label, language, item.short || item.code),
  }));
};

const buildImageUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return path;
};

const Header = () => {
  const location = useLocation();
  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);

  const { language, changeLanguage } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [header, setHeader] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [mobileLangOpen, setMobileLangOpen] = useState(true);
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const [contents, setContents] = useState([]);

  const iconMap = {
    briefcase: <FaBriefcase />,
    gamepad: <FaGamepad />,
  };

  useEffect(() => {
    const fetchHeader = async () => {
      try {
        const data = await fetchJson(
          `${import.meta.env.VITE_API_URL}/api/pages/Header`
        );
        if (!data) return;

        const section = data.sections?.find(
          (s) => s.name?.toLowerCase() === "header"
        );

        if (section) {
          setContents(section.contents || []);
        } else {
          setContents([]);
        }
      } catch (error) {
        console.error("Header verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchHeader();
  }, []);

  const contentMap = useMemo(() => {
    return contents.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }, [contents]);

  const logoData = useMemo(() => {
    const logo = contentMap.logo;

    return {
      image: buildImageUrl(logo?.image || ""),
      alt: getLocalizedValue(logo?.alt, language, "Logo"),
    };
  }, [contentMap, language]);

  const menuItems = useMemo(() => {
    return normalizeMenuItems(contentMap.menuItems, language);
  }, [contentMap, language]);

  const languages = useMemo(() => {
    return normalizeLanguages(contentMap.languages, language);
  }, [contentMap, language]);

  const offerButton = useMemo(() => {
    const offer = contentMap.offerButton;

    return {
      label: getLocalizedValue(offer?.label, language, "TEKLİF AL"),
      href: offer?.href || "/offer",
    };
  }, [contentMap, language]);

  const mobileLanguageTitle = useMemo(() => {
    return getLocalizedValue(
      contentMap.mobileLanguageTitle,
      language,
      "Dil Seçimi"
    );
  }, [contentMap, language]);

  const selectedLanguage = useMemo(() => {
    if (!languages.length) return null;
    return languages.find((lang) => lang.code === language) || languages[0];
  }, [languages, language]);

  useEffect(() => {
    const changeBackground = () => {
      if (location.pathname === "/") {
        setHeader(window.scrollY >= 80);
      } else {
        setHeader(true);
      }
    };

    changeBackground();
    window.addEventListener("scroll", changeBackground);

    return () => window.removeEventListener("scroll", changeBackground);
  }, [location.pathname]);

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

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) {
        setMobileLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHome = location.pathname === "/";

  const getSubmenuLink = (item) => {
    if (item.external) return item.url;

    if (item.tab) {
      return `${item.link}?category=${encodeURIComponent(item.tab)}`;
    }

    return item.link || "#";
  };

  const handleLanguageSelect = (selectedLang) => {
    changeLanguage(selectedLang.code);
    setMobileLangOpen(true);
    setDesktopLangOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-[90px] z-[999] transition-all duration-500 ${
        isHome
          ? header
            ? "bg-[#0D0D0D] backdrop-blur-md"
            : "bg-transparent"
          : "bg-[#0D0D0D] backdrop-blur-md"
      }`}
    >
      <nav className="grid grid-cols-[auto_1fr_auto] items-center max-w-[1480px] mx-auto h-full px-4 md:px-6 gap-4">
        <Link to="/" className="z-[1001] flex items-center shrink-0">
          {logoData.image ? (
            <img
              src={logoData.image}
              alt={logoData.alt}
              className="h-[45px] md:h-[50px] lg:h-[55px] w-auto object-contain"
            />
          ) : (
            <span className="text-[#e8e8e8] text-[28px] font-bold">
              Artech<span className="text-[#02acfa]">.</span>
            </span>
          )}
        </Link>

        <div className="flex justify-center min-w-0 max-[940px]:hidden">
          <ul className="flex items-center justify-center gap-6 xl:gap-8">
            {menuItems.map(({ _id, title, link, submenu, external, url }) => (
              <li key={_id} className="relative group shrink-0">
                {!submenu ? (
                  external && url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all whitespace-nowrap"
                    >
                      {title}
                    </a>
                  ) : (
                    <Link
                      to={link || "#"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all whitespace-nowrap"
                    >
                      {title}
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to={link || "#"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all whitespace-nowrap"
                    >
                      {title}
                      <FaChevronDown className="text-xs group-hover:rotate-180 transition-transform" />
                    </Link>

                    <div className="absolute left-0 translate-x-[6px] top-[75px] w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000]">
                      <div className="p-3 rounded-2xl shadow-2xl border border-white/10 bg-black/90 backdrop-blur-xl">
                        {submenu.map((item, i) =>
                          item.external ? (
                            <a
                              key={item._id ?? i}
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
                                    {item.title}
                                  </h4>
                                  <BsArrowUpRight className="text-sm text-[#e8e8e8] shrink-0" />
                                </div>

                                {item.desc && (
                                  <p className="text-sm text-gray-300">
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </a>
                          ) : (
                            <Link
                              key={item._id ?? i}
                              to={getSubmenuLink(item)}
                              className="flex gap-3 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                            >
                              {item.icon && (
                                <div className="text-lg text-[#e8e8e8] mt-1">
                                  {iconMap[item.icon]}
                                </div>
                              )}

                              <div>
                                <h4 className="font-semibold text-[#e8e8e8]">
                                  {item.title}
                                </h4>
                                {item.desc && (
                                  <p className="text-sm text-gray-300">
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end items-center gap-2 max-[940px]:justify-end">
          <div
            ref={desktopLangRef}
            className="relative max-[940px]:hidden flex justify-end shrink-0"
            onMouseEnter={() => setDesktopLangOpen(true)}
            onMouseLeave={() => setDesktopLangOpen(false)}
          >
            <button
              type="button"
              className="w-[92px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer"
            >
              <FaGlobe className="text-base shrink-0" />
              <span className="text-sm font-medium tracking-wide w-[22px] text-center">
                {selectedLanguage?.short || "TR"}
              </span>
              <FaChevronDown
                className={`text-xs shrink-0 transition-transform ${
                  desktopLangOpen ? "rotate-180" : ""
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
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                          selectedLanguage?.code === lang.code
                            ? "bg-white/10"
                            : "hover:bg-white/10"
                        }`}
                      >
                        {lang.flag ? (
                          <img
                            src={buildImageUrl(lang.flag)}
                            alt={lang.label}
                            className="w-7 h-5 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-5 rounded bg-white/10 shrink-0" />
                        )}

                        <span className="font-semibold text-[#e8e8e8] flex-1">
                          {lang.label}
                        </span>

                        {selectedLanguage?.code === lang.code && (
                          <BsCheck2 className="text-white text-sm shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to={offerButton.href}
            className="max-[940px]:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer shrink-0"
          >
            <span className="font-medium whitespace-nowrap">
              {offerButton.label}
            </span>
            <BsArrowUpRight className="text-sm shrink-0" />
          </Link>

          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="hidden max-[940px]:flex flex-col justify-center items-center gap-[6px] cursor-pointer z-[1001]"
          >
            <span
              className={`w-7 h-[2px] bg-white transition-all ${
                menuOpen ? "rotate-45 translate-y-[8px]" : ""
              }`}
            />
            <span
              className={`w-7 h-[2px] bg-white transition-all ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-7 h-[2px] bg-white transition-all ${
                menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
              }`}
            />
          </div>
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
                {menuItems.map(
                  ({ _id, title, link, submenu, external, url }, index) => (
                    <motion.div
                      key={_id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="mb-4"
                    >
                      {!submenu ? (
                        external && url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl text-[#e8e8e8] font-semibold block py-2"
                          >
                            {title}
                          </a>
                        ) : (
                          <Link
                            to={link || "#"}
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl text-[#e8e8e8] font-semibold block py-2"
                          >
                            {title}
                          </Link>
                        )
                      ) : (
                        <div>
                          <div
                            onClick={() =>
                              setOpenSubmenu(openSubmenu === _id ? null : _id)
                            }
                            className="flex justify-between items-center text-2xl text-[#e8e8e8] font-semibold py-2 cursor-pointer"
                          >
                            {title}
                            <span
                              className={`transition-transform ${
                                openSubmenu === _id ? "rotate-180" : ""
                              }`}
                            >
                              <FaChevronDown />
                            </span>
                          </div>

                          <AnimatePresence>
                            {openSubmenu === _id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-4 overflow-hidden"
                              >
                                {submenu.map((item, i) =>
                                  item.external ? (
                                    <a
                                      key={item._id ?? i}
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => setMenuOpen(false)}
                                      className="flex items-center gap-2 py-2 text-lg text-gray-300 cursor-pointer"
                                    >
                                      <span>{item.title}</span>
                                      <BsArrowUpRight className="text-sm shrink-0" />
                                    </a>
                                  ) : (
                                    <Link
                                      key={item._id ?? i}
                                      to={getSubmenuLink(item)}
                                      onClick={() => {
                                        setMenuOpen(false);
                                        setOpenSubmenu(null);
                                      }}
                                      className="block py-2 text-lg text-gray-300 cursor-pointer"
                                    >
                                      {item.title}
                                    </Link>
                                  )
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </div>

              <div className="mt-auto pt-8 pb-8 space-y-4">
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
                        {mobileLanguageTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/70 font-medium">
                        {selectedLanguage?.short || "TR"}
                      </span>
                      <FaChevronDown
                        className={`transition-transform duration-300 ${
                          mobileLangOpen ? "rotate-180" : ""
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
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => handleLanguageSelect(lang)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-all mt-2 ${
                                selectedLanguage?.code === lang.code
                                  ? "bg-white/10"
                                  : "hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {lang.flag ? (
                                  <img
                                    src={buildImageUrl(lang.flag)}
                                    alt={lang.label}
                                    className="w-7 h-5 object-cover shrink-0 rounded-[2px]"
                                  />
                                ) : (
                                  <div className="w-7 h-5 rounded bg-white/10 shrink-0" />
                                )}

                                <span className="text-[#e8e8e8] font-medium">
                                  {lang.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-white/45 font-medium tracking-wide">
                                  {lang.short}
                                </span>
                                {selectedLanguage?.code === lang.code && (
                                  <BsCheck2 className="text-white text-sm" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to={offerButton.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl text-[#e8e8e8] hover:bg-white/10 transition-all cursor-pointer"
                >
                  <span className="font-semibold text-lg">
                    {offerButton.label}
                  </span>
                  <BsArrowUpRight className="text-base shrink-0" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
