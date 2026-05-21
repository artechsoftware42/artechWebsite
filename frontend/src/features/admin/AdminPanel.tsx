/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ReactNode,
} from "react";
import {
    FiAlertCircle,
    FiCheck,
    FiChevronDown,
    FiCopy,
    FiEdit3,
    FiImage,
    FiLayers,
    FiList,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiTrash2,
    FiUploadCloud,
} from "react-icons/fi";

type Lang = "tr" | "en" | "fr" | "ru";

type PageListItem = {
    name: string;
    title?: string;
};

type CmsContent = {
    key?: string;
    id?: string;
    type?: string;
    label?: string;
    value: unknown;
};

type CmsSection = {
    name?: string;
    id?: string;
    type?: string;
    label?: string;
    contents?: CmsContent[];
    fields?: CmsContent[];
};

type CmsPage = {
    _id?: string;
    pageKey: string;
    title?: string;
    sections: CmsSection[];
};

type SaveState = "idle" | "saving" | "success" | "error";

type ProjectWordOption = {
    index: number;
    key: string;
    label: Record<Lang, string>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const IMAGE_UPLOAD_FIELD = "image";

const LANGUAGES: { key: Lang; label: string }[] = [
    { key: "tr", label: "TR" },
    { key: "en", label: "EN" },
    { key: "fr", label: "FR" },
    { key: "ru", label: "RU" },
];

const labelMap: Record<string, string> = {
    pageKey: "Sayfa",
    title: "Başlık",
    name: "İsim",
    id: "ID",
    slug: "Sayfa Yolu",
    url: "URL",
    link: "Link",
    href: "Link",
    projectUrl: "Canlı Website Linki",
    buttonLink: "Buton Linki",
    buttonText: "Buton Yazısı",
    backgroundImage: "Arka Plan Görseli",
    primaryImage: "Ana Görsel",
    secondaryImage: "İkinci Görsel",
    galleryImages: "Galeri Görselleri",
    logo: "Logo",
    image: "Görsel",
    imgUrl: "Görsel",
    icon: "İkon",
    alt: "Alternatif Metin",
    company: "Firma",
    description: "Açıklama",
    year: "Yıl",
    type: "Tür",
    categoryKey: "Kategori Kodu",
    sector: "Sektör",
    duration: "Süre",
    location: "Lokasyon",
    services: "Hizmetler",
    technologies: "Teknolojiler",
    challenge: "Problem",
    solution: "Çözüm",
    result: "Sonuç",
    stats: "İstatistikler",
    projects: "Projeler",
    tabs: "Kategoriler",
    examples: "Yazı Animasyonları",
    tag: "Etiket",
    strongText: "Vurgulu Metin",
    text: "Metin",
    contents: "İçerikler",
    fields: "Alanlar",
    label: "Etiket",
    value: "Değer",
    key: "Kod",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLocalizedText(value: unknown): value is Record<Lang, string> {
    if (!isPlainObject(value)) return false;

    const keys = Object.keys(value);

    return (
        keys.length > 0 &&
        keys.every((key) => ["tr", "en", "fr", "ru"].includes(key)) &&
        keys.some((key) => typeof value[key] === "string")
    );
}

function isLocalizedArray(value: unknown): value is Record<Lang, unknown[]> {
    if (!isPlainObject(value)) return false;

    const keys = Object.keys(value);

    return (
        keys.length > 0 &&
        keys.every((key) => ["tr", "en", "fr", "ru"].includes(key)) &&
        keys.some((key) => Array.isArray(value[key]))
    );
}

function isMediaPath(value: unknown) {
    if (typeof value !== "string") return false;

    const clean = value.toLowerCase();

    return (
        clean.includes("/images/") ||
        clean.includes("/assets/") ||
        clean.endsWith(".png") ||
        clean.endsWith(".jpg") ||
        clean.endsWith(".jpeg") ||
        clean.endsWith(".webp") ||
        clean.endsWith(".svg") ||
        clean.endsWith(".mp4")
    );
}

function isLikelyImageField(fieldKey: string, value: unknown, type?: string) {
    const key = fieldKey.toLowerCase();

    return (
        type === "image" ||
        key.includes("image") ||
        key.includes("img") ||
        key.includes("logo") ||
        key.includes("background") ||
        key.includes("video") ||
        isMediaPath(value)
    );
}

function getPublicMediaUrl(path: unknown) {
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

function friendlyLabel(value?: string) {
    if (!value) return "Alan";

    if (labelMap[value]) return labelMap[value];

    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());
}

function getSectionTitle(section: CmsSection, index: number) {
    return (
        section.label ||
        friendlyLabel(section.name || section.id || section.type) ||
        `Bölüm ${index + 1}`
    );
}

function getContentKey(content: CmsContent, index: number) {
    return content.key || content.id || `field-${index}`;
}

function createEmptyFromTemplate(value: unknown): unknown {
    if (typeof value === "string") return "";
    if (typeof value === "number") return 0;
    if (typeof value === "boolean") return false;

    if (Array.isArray(value)) {
        return [];
    }

    if (isPlainObject(value)) {
        const result: Record<string, unknown> = {};

        Object.entries(value).forEach(([key, item]) => {
            if (key === "id") {
                result[key] = Date.now();
                return;
            }

            if (key === "slug") {
                result[key] = "new-item";
                return;
            }

            result[key] = createEmptyFromTemplate(item);
        });

        return result;
    }

    return "";
}

function createNewArrayItem(items: unknown[]) {
    const template = items[items.length - 1];

    if (template === undefined) return "";

    const newItem = createEmptyFromTemplate(template);

    if (isPlainObject(newItem)) {
        const ids = items
            .filter(isPlainObject)
            .map((item) => Number(item.id))
            .filter((id) => Number.isFinite(id));

        if ("id" in newItem) {
            newItem.id = ids.length > 0 ? Math.max(...ids) + 1 : Date.now();
        }

        if ("slug" in newItem) {
            newItem.slug = `new-item-${Date.now()}`;
        }
    }

    return newItem;
}

function slugifyTabKey(value: unknown) {
    const text = String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return text || `category-${crypto.randomUUID().slice(0, 8)}`;
}

function getContentItemByKey(sections: CmsSection[], key: string) {
    for (const section of sections) {
        const items = section.contents || section.fields || [];
        const found = items.find((item) => item.key === key || item.id === key);

        if (found) return found;
    }

    return null;
}

function getFallbackLocalizedArrayItem(
    value: Record<Lang, unknown[]>,
    index: number,
    activeLang: Lang
) {
    return (
        value[activeLang]?.[index] ||
        value.tr?.[index] ||
        value.en?.[index] ||
        value.fr?.[index] ||
        value.ru?.[index] ||
        ""
    );
}

function syncLocalizedProjectWords(
    value: Record<Lang, unknown[]>,
    activeLang: Lang
): Record<Lang, unknown[]> {
    const maxLength = Math.max(
        value.tr?.length || 0,
        value.en?.length || 0,
        value.fr?.length || 0,
        value.ru?.length || 0
    );

    const nextValue: Record<Lang, unknown[]> = {
        tr: [...(value.tr || [])],
        en: [...(value.en || [])],
        fr: [...(value.fr || [])],
        ru: [...(value.ru || [])],
    };

    LANGUAGES.forEach((lang) => {
        for (let index = 0; index < maxLength; index += 1) {
            if (!String(nextValue[lang.key][index] || "").trim()) {
                nextValue[lang.key][index] = getFallbackLocalizedArrayItem(
                    nextValue,
                    index,
                    activeLang
                );
            }
        }
    });

    return nextValue;
}

function buildTabsFromProjectWords(
    projectWords: Record<Lang, unknown[]>,
    oldTabs: unknown[],
    activeLang: Lang
) {
    const oldCategoryTabs = oldTabs
        .filter(isPlainObject)
        .filter((tab) => tab.key !== "all");

    const maxLength = Math.max(
        projectWords.tr?.length || 0,
        projectWords.en?.length || 0,
        projectWords.fr?.length || 0,
        projectWords.ru?.length || 0
    );

    const categoryTabs = Array.from({ length: maxLength }).map((_, index) => {
        const fallbackLabel = getFallbackLocalizedArrayItem(
            projectWords,
            index,
            activeLang
        );

        const oldTab = oldCategoryTabs[index];

        const label = {
            tr: String(projectWords.tr?.[index] || fallbackLabel),
            en: String(projectWords.en?.[index] || fallbackLabel),
            fr: String(projectWords.fr?.[index] || fallbackLabel),
            ru: String(projectWords.ru?.[index] || fallbackLabel),
        };

        return {
            key:
                typeof oldTab?.key === "string" && oldTab.key
                    ? oldTab.key
                    : slugifyTabKey(fallbackLabel),
            label,
        };
    });

    return [
        {
            key: "all",
            label: {
                tr: "Tümü",
                en: "All",
                fr: "Tous",
                ru: "Все",
            },
        },
        ...categoryTabs,
    ];
}

function getProjectWordOptionsFromSections(
    sections: CmsSection[],
    activeLang: Lang
): ProjectWordOption[] {
    const projectWordsContent = getContentItemByKey(sections, "projectWords");

    if (!projectWordsContent || !isLocalizedArray(projectWordsContent.value)) {
        return [];
    }

    const syncedWords = syncLocalizedProjectWords(
        projectWordsContent.value,
        activeLang
    );

    const maxLength = Math.max(
        syncedWords.tr.length,
        syncedWords.en.length,
        syncedWords.fr.length,
        syncedWords.ru.length
    );

    return Array.from({ length: maxLength })
        .map((_, index) => {
            const fallback = getFallbackLocalizedArrayItem(
                syncedWords,
                index,
                activeLang
            );

            const label = {
                tr: String(syncedWords.tr[index] || fallback),
                en: String(syncedWords.en[index] || fallback),
                fr: String(syncedWords.fr[index] || fallback),
                ru: String(syncedWords.ru[index] || fallback),
            };

            return {
                index,
                key: slugifyTabKey(fallback),
                label,
            };
        })
        .filter((item) => item.label[activeLang]?.trim());
}

function syncProjectsPageSectionsFromProjectWords(
    sections: CmsSection[],
    activeLang: Lang
) {
    const nextSections = structuredClone(sections);

    const projectWordsContent = getContentItemByKey(nextSections, "projectWords");
    const tabsContent = getContentItemByKey(nextSections, "tabs");

    if (!projectWordsContent || !isLocalizedArray(projectWordsContent.value)) {
        return nextSections;
    }

    const syncedProjectWords = syncLocalizedProjectWords(
        projectWordsContent.value,
        activeLang
    );

    projectWordsContent.value = syncedProjectWords;

    if (tabsContent) {
        const oldTabs = Array.isArray(tabsContent.value) ? tabsContent.value : [];
        tabsContent.value = buildTabsFromProjectWords(
            syncedProjectWords,
            oldTabs,
            activeLang
        );
    }

    return nextSections;
}

function buildHeaderProjectsSubmenuFromProjectsPageSections(
    projectsSections: CmsSection[]
) {
    const tabsContent = getContentItemByKey(projectsSections, "tabs");

    if (!Array.isArray(tabsContent?.value)) return [];

    return tabsContent.value
        .filter(isPlainObject)
        .filter((tab) => tab.key && tab.key !== "all")
        .map((tab) => ({
            title: isPlainObject(tab.label)
                ? tab.label
                : {
                    tr: String(tab.key),
                    en: String(tab.key),
                    fr: String(tab.key),
                    ru: String(tab.key),
                },
            link: "/projects",
            tab: tab.key,
        }));
}

function isHeaderProjectsNavItem(value: unknown) {
    return (
        isPlainObject(value) &&
        value.link === "/projects" &&
        Array.isArray(value.submenu)
    );
}

function syncHeaderProjectsSubmenuInValue(value: unknown, submenu: unknown[]) {
    let didUpdate = false;

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (syncHeaderProjectsSubmenuInValue(item, submenu)) {
                didUpdate = true;
            }
        });

        return didUpdate;
    }

    if (!isPlainObject(value)) return false;

    if (isHeaderProjectsNavItem(value)) {
        value.submenu = submenu;
        return true;
    }

    Object.values(value).forEach((childValue) => {
        if (syncHeaderProjectsSubmenuInValue(childValue, submenu)) {
            didUpdate = true;
        }
    });

    return didUpdate;
}

function syncHeaderSectionsFromProjectsPage(
    headerSections: CmsSection[],
    projectsSections: CmsSection[]
) {
    const submenu = buildHeaderProjectsSubmenuFromProjectsPageSections(
        projectsSections
    );

    if (submenu.length === 0) {
        return {
            sections: headerSections,
            didUpdate: false,
        };
    }

    const nextHeaderSections = structuredClone(headerSections);

    const didUpdate = syncHeaderProjectsSubmenuInValue(
        nextHeaderSections,
        submenu
    );

    return {
        sections: nextHeaderSections,
        didUpdate,
    };
}

function getHeaderNavLinksFromSections(headerSections: CmsSection[]) {
    const navLinksContent = getContentItemByKey(headerSections, "navLinks");

    if (!Array.isArray(navLinksContent?.value)) return [];

    return navLinksContent.value.filter(isPlainObject);
}

function buildFooterColumnsFromHeader(headerSections: CmsSection[]) {
    const navLinks = getHeaderNavLinksFromSections(headerSections);

    const aboutItem = navLinks.find((item) => item.link === "/about");
    const projectsItem = navLinks.find((item) => item.link === "/projects");
    const corporateItem = navLinks.find((item) => item.link === "/corporate");
    const contactItem = navLinks.find((item) => item.link === "/contact");

    return {
        aboutTitle: aboutItem?.title,
        projectsTitle: projectsItem?.title,
        projectsLinks: Array.isArray(projectsItem?.submenu)
            ? projectsItem.submenu.map((item) => ({
                title: item.title,
                link: item.link || "/projects",
                tab: item.tab || "",
                external: false,
            }))
            : [],
        corporateTitle: corporateItem?.title,
        corporateLinks: Array.isArray(corporateItem?.submenu)
            ? corporateItem.submenu.map((item) => ({
                title: item.title,
                link: item.link || "",
                url: item.url || "",
                external: Boolean(item.external),
            }))
            : [],
        contactTitle: contactItem?.title,
    };
}

function syncFooterSectionsFromHeader(
    footerSections: CmsSection[],
    headerSections: CmsSection[]
) {
    const footerSyncData = buildFooterColumnsFromHeader(headerSections);
    const nextFooterSections = structuredClone(footerSections);

    const setContentValue = (key: string, value: unknown) => {
        const content = getContentItemByKey(nextFooterSections, key);

        if (content) {
            content.value = value;
        }
    };

    setContentValue("aboutTitle", footerSyncData.aboutTitle);
    setContentValue("projectsTitle", footerSyncData.projectsTitle);
    setContentValue("projectsLinks", footerSyncData.projectsLinks);
    setContentValue("corporateTitle", footerSyncData.corporateTitle);
    setContentValue("corporateLinks", footerSyncData.corporateLinks);
    setContentValue("contactTitle", footerSyncData.contactTitle);

    return nextFooterSections;
}

async function syncFooterFromHeaderSections(headerSections: CmsSection[]) {
    const footerResponse = await fetch(`${API_BASE}/api/pages/Footer`, {
        credentials: "include",
        cache: "no-store",
    });

    const footerData = await parseResponse(footerResponse);

    if (!footerResponse.ok || !Array.isArray(footerData.sections)) {
        return false;
    }

    const syncedFooterSections = syncFooterSectionsFromHeader(
        footerData.sections,
        headerSections
    );

    const footerSaveResponse = await fetch(`${API_BASE}/api/pages/Footer`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            sections: syncedFooterSections,
        }),
    });

    return footerSaveResponse.ok;
}

async function parseResponse(response: Response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { raw: text };
    }
}

export default function AdminPanel() {
    const [pages, setPages] = useState<PageListItem[]>([]);
    const [selectedPageKey, setSelectedPageKey] = useState("");
    const [pageData, setPageData] = useState<CmsPage | null>(null);

    const [activeLang, setActiveLang] = useState<Lang>("tr");
    const [search, setSearch] = useState("");
    const [loadingPages, setLoadingPages] = useState(true);
    const [loadingPage, setLoadingPage] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>("idle");
    const [message, setMessage] = useState("");

    const filteredPages = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return pages;

        return pages.filter((page) => {
            return (
                page.name.toLowerCase().includes(keyword) ||
                page.title?.toLowerCase().includes(keyword)
            );
        });
    }, [pages, search]);

    const currentSections = useMemo(() => {
        return pageData?.sections || [];
    }, [pageData?.sections]);

    const projectWordOptions = useMemo(() => {
        if (pageData?.pageKey !== "ProjectsPage") return [];

        return getProjectWordOptionsFromSections(currentSections, activeLang);
    }, [pageData?.pageKey, currentSections, activeLang]);

    const fetchPages = useCallback(async () => {
        try {
            setLoadingPages(true);
            setMessage("");

            const response = await fetch(`${API_BASE}/api/pages`, {
                credentials: "include",
                cache: "no-store",
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || "Sayfa listesi alınamadı.");
            }

            const list = Array.isArray(data) ? data : [];

            setPages(list);

            if (!selectedPageKey && list[0]?.name) {
                setSelectedPageKey(list[0].name);
            }
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Sayfa listesi alınamadı."
            );
        } finally {
            setLoadingPages(false);
        }
    }, [selectedPageKey]);

    const fetchPageDetail = useCallback(async (pageKey: string) => {
        if (!pageKey) return;

        try {
            setLoadingPage(true);
            setMessage("");
            setSaveState("idle");

            const response = await fetch(`${API_BASE}/api/pages/${pageKey}`, {
                credentials: "include",
                cache: "no-store",
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || `${pageKey} verisi alınamadı.`);
            }

            setPageData(data as CmsPage);
        } catch (error) {
            setPageData(null);
            setMessage(
                error instanceof Error ? error.message : `${pageKey} verisi alınamadı.`
            );
        } finally {
            setLoadingPage(false);
        }
    }, []);

    const savePage = async () => {
        if (!pageData?.pageKey) return;

        try {
            setSaveState("saving");
            setMessage("");

            let sectionsToSave =
                pageData.pageKey === "ProjectsPage"
                    ? syncProjectsPageSectionsFromProjectWords(
                        pageData.sections,
                        activeLang
                    )
                    : pageData.sections;

            if (pageData.pageKey === "Header") {
                const projectsResponse = await fetch(
                    `${API_BASE}/api/pages/ProjectsPage`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const projectsData = await parseResponse(projectsResponse);

                if (projectsResponse.ok && Array.isArray(projectsData.sections)) {
                    const syncedProjectsSections =
                        syncProjectsPageSectionsFromProjectWords(
                            projectsData.sections,
                            activeLang
                        );

                    const syncedHeader = syncHeaderSectionsFromProjectsPage(
                        pageData.sections,
                        syncedProjectsSections
                    );

                    sectionsToSave = syncedHeader.sections;
                }
            }

            const response = await fetch(`${API_BASE}/api/pages/${pageData.pageKey}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sections: sectionsToSave,
                }),
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || "Kaydedilemedi.");
            }

            if (pageData.pageKey === "ProjectsPage") {
                const headerResponse = await fetch(`${API_BASE}/api/pages/Header`, {
                    credentials: "include",
                    cache: "no-store",
                });

                const headerData = await parseResponse(headerResponse);

                if (headerResponse.ok && Array.isArray(headerData.sections)) {
                    const syncedHeader = syncHeaderSectionsFromProjectsPage(
                        headerData.sections,
                        sectionsToSave
                    );

                    if (syncedHeader.didUpdate) {
                        const headerSaveResponse = await fetch(
                            `${API_BASE}/api/pages/Header`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    sections: syncedHeader.sections,
                                }),
                            }
                        );

                        const headerSaveData = await parseResponse(headerSaveResponse);

                        if (!headerSaveResponse.ok) {
                            throw new Error(
                                headerSaveData.error ||
                                "Header proje menüsü senkronize edilemedi."
                            );
                        }

                        await syncFooterFromHeaderSections(syncedHeader.sections);
                    }
                }

                setPageData((prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        sections: sectionsToSave,
                    };
                });
            }

            if (pageData.pageKey === "Header") {
                await syncFooterFromHeaderSections(sectionsToSave);

                setPageData((prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        sections: sectionsToSave,
                    };
                });
            }

            setSaveState("success");
            setMessage(
                pageData.pageKey === "ProjectsPage"
                    ? "Kaydedildi. Project Words, Kategoriler ve Header Projeler menüsü senkronize edildi."
                    : "Kaydedildi."
            );

            window.setTimeout(() => {
                setSaveState("idle");
            }, 1600);
        } catch (error) {
            setSaveState("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Oturumu yenileyip bir daha deneyin."
            );
        }
    };

    useEffect(() => {
        void fetchPages();
    }, [fetchPages]);

    useEffect(() => {
        if (!selectedPageKey) return;

        void fetchPageDetail(selectedPageKey);
    }, [selectedPageKey, fetchPageDetail]);

    const updateSections = (sections: CmsSection[]) => {
        setPageData((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                sections,
            };
        });
    };

    const updateContentValue = (
        sectionIndex: number,
        contentIndex: number,
        nextValue: unknown
    ) => {
        const sections = structuredClone(currentSections);
        const section = sections[sectionIndex];

        if (!section) return;

        const listKey = section.contents ? "contents" : "fields";
        const items = section[listKey];

        if (!items?.[contentIndex]) return;

        items[contentIndex].value = nextValue;

        updateSections(sections);
        setSaveState("idle");
        setMessage("");
    };

    const addSection = () => {
        const sections = structuredClone(currentSections);

        sections.push({
            name: `new-section-${sections.length + 1}`,
            contents: [],
        });

        updateSections(sections);
    };

    const deleteSection = (sectionIndex: number) => {
        const sections = structuredClone(currentSections);
        sections.splice(sectionIndex, 1);
        updateSections(sections);
    };

    return (
        <main className="min-h-screen bg-[#f4f6fb] text-[#101418]">
            <div className="flex min-h-screen">
                <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 border-r border-black/10 bg-[#0d1117] text-white lg:flex lg:flex-col">
                    <div className="border-b border-white/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#02acfa] shadow-[0_18px_50px_rgba(2,172,250,0.35)]">
                                <FiLayers className="text-xl" />
                            </div>

                            <div>
                                <h1 className="text-lg font-bold tracking-[-0.03em]">
                                    Admin Panel
                                </h1>
                                <p className="mt-1 text-xs text-white/45">
                                    PageKey CMS yönetimi
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-6">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Sayfa ara..."
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#02acfa]/60"
                            />
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        {loadingPages ? (
                            <PanelSkeleton />
                        ) : (
                            <div className="space-y-2">
                                {filteredPages.map((page) => {
                                    const isActive = page.name === selectedPageKey;

                                    return (
                                        <button
                                            key={page.name}
                                            type="button"
                                            onClick={() => setSelectedPageKey(page.name)}
                                            className={`w-full rounded-2xl px-4 py-3 text-left transition ${isActive
                                                ? "bg-[#02acfa] text-white shadow-[0_16px_40px_rgba(2,172,250,0.28)]"
                                                : "bg-white/[0.035] text-white/65 hover:bg-white/[0.07] hover:text-white"
                                                }`}
                                        >
                                            <span className="block text-sm font-semibold">
                                                {page.title || page.name}
                                            </span>

                                            <span
                                                className={`mt-1 block text-xs ${isActive ? "text-white/70" : "text-white/30"
                                                    }`}
                                            >
                                                {page.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
                                    Seçili Sayfa
                                </p>

                                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#101418]">
                                    {pageData?.title || pageData?.pageKey || "Sayfa seçilmedi"}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex rounded-2xl border border-black/10 bg-black/[0.03] p-1">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.key}
                                            type="button"
                                            onClick={() => setActiveLang(lang.key)}
                                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${activeLang === lang.key
                                                ? "bg-[#101418] text-white"
                                                : "text-black/45 hover:text-black"
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => selectedPageKey && fetchPageDetail(selectedPageKey)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/65 transition hover:border-[#02acfa]/50 hover:text-[#02acfa]"
                                >
                                    <FiRefreshCw />
                                    Yenile
                                </button>

                                <button
                                    type="button"
                                    onClick={savePage}
                                    disabled={!pageData || saveState === "saving"}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${saveState === "saving"
                                        ? "cursor-not-allowed bg-black/25"
                                        : saveState === "success"
                                            ? "bg-emerald-500"
                                            : saveState === "error"
                                                ? "bg-red-500"
                                                : "bg-[#02acfa] hover:bg-[#101418]"
                                        }`}
                                >
                                    {saveState === "success" ? (
                                        <FiCheck />
                                    ) : saveState === "saving" ? (
                                        <FiRefreshCw className="animate-spin" />
                                    ) : (
                                        <FiSave />
                                    )}

                                    {saveState === "saving"
                                        ? "Kaydediliyor"
                                        : saveState === "success"
                                            ? "Kaydedildi"
                                            : "Kaydet"}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${saveState === "error" || message.includes("alınamadı")
                                    ? "bg-red-50 text-red-700"
                                    : "bg-emerald-50 text-emerald-700"
                                    }`}
                            >
                                {saveState === "error" || message.includes("alınamadı") ? (
                                    <FiAlertCircle />
                                ) : (
                                    <FiCheck />
                                )}
                                {message}
                            </div>
                        )}
                    </header>

                    <div className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mb-5 block lg:hidden">
                            <select
                                value={selectedPageKey}
                                onChange={(event) => setSelectedPageKey(event.target.value)}
                                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none"
                            >
                                {pages.map((page) => (
                                    <option key={page.name} value={page.name}>
                                        {page.title || page.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {loadingPage ? (
                            <ContentSkeleton />
                        ) : !pageData ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                    <InfoCard
                                        icon={<FiLayers />}
                                        title="PageKey"
                                        value={pageData.pageKey}
                                    />

                                    <InfoCard
                                        icon={<FiList />}
                                        title="Bölüm Sayısı"
                                        value={String(pageData.sections?.length || 0)}
                                    />

                                    <InfoCard
                                        icon={<FiEdit3 />}
                                        title="Dil"
                                        value={activeLang.toUpperCase()}
                                    />
                                </div>

                                <div className="space-y-6">
                                    {pageData.sections.map((section, sectionIndex) => (
                                        <SectionEditor
                                            key={`${section.name || section.id || sectionIndex}`}
                                            section={section}
                                            sectionIndex={sectionIndex}
                                            activeLang={activeLang}
                                            projectWordOptions={projectWordOptions}
                                            onUpdateContent={updateContentValue}
                                            onDeleteSection={() => deleteSection(sectionIndex)}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="flex w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-black/15 bg-white py-6 text-sm font-bold text-black/50 transition hover:border-[#02acfa] hover:text-[#02acfa]"
                                >
                                    <FiPlus />
                                    Yeni Bölüm Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

function SectionEditor({
    section,
    sectionIndex,
    activeLang,
    projectWordOptions,
    onUpdateContent,
    onDeleteSection,
}: {
    section: CmsSection;
    sectionIndex: number;
    activeLang: Lang;
    projectWordOptions: ProjectWordOption[];
    onUpdateContent: (
        sectionIndex: number,
        contentIndex: number,
        value: unknown
    ) => void;
    onDeleteSection: () => void;
}) {
    const [open, setOpen] = useState(true);

    const items = section.contents || section.fields || [];

    return (
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.045)]">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-4 border-b border-black/10 bg-[#101418] px-5 py-5 text-left text-white sm:px-6"
            >
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#02acfa]">
                        Bölüm {sectionIndex + 1}
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                        {getSectionTitle(section, sectionIndex)}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">
                        {items.length} alan
                    </span>

                    <FiChevronDown
                        className={`transition ${open ? "rotate-180" : "rotate-0"}`}
                    />
                </div>
            </button>

            {open && (
                <div className="p-5 sm:p-6">
                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-black/45">
                            Bu bölümde düzenlenebilir alan yok.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {items.map((content, contentIndex) => {
                                const fieldKey = getContentKey(content, contentIndex);

                                return (
                                    <FieldEditor
                                        key={`${fieldKey}-${contentIndex}`}
                                        fieldKey={fieldKey}
                                        label={content.label || friendlyLabel(fieldKey)}
                                        value={content.value}
                                        type={content.type}
                                        activeLang={activeLang}
                                        projectWordOptions={projectWordOptions}
                                        depth={0}
                                        onChange={(nextValue) =>
                                            onUpdateContent(sectionIndex, contentIndex, nextValue)
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={onDeleteSection}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                        >
                            <FiTrash2 />
                            Bölümü Sil
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

function FieldEditor({
    fieldKey,
    label,
    value,
    type,
    activeLang,
    projectWordOptions,
    depth,
    onChange,
}: {
    fieldKey: string;
    label: string;
    value: unknown;
    type?: string;
    activeLang: Lang;
    projectWordOptions: ProjectWordOption[];
    depth: number;
    onChange: (value: unknown) => void;
}) {
    if (isFooterSyncedField(fieldKey)) {
        return (
            <FieldShell label={label} depth={depth}>
                <SyncedLockedNotice fieldKey={fieldKey} />
            </FieldShell>
        );
    }
    if (isLocalizedText(value)) {
        const currentValue =
            typeof value[activeLang] === "string" ? String(value[activeLang]) : "";

        return (
            <FieldShell label={label} depth={depth}>
                <SmartTextInput
                    value={currentValue}
                    onChange={(nextValue) =>
                        onChange({
                            ...value,
                            [activeLang]: nextValue,
                        })
                    }
                />
            </FieldShell>
        );
    }

    if (isLocalizedArray(value)) {
        const currentArray = Array.isArray(value[activeLang])
            ? (value[activeLang] as unknown[])
            : [];

        return (
            <FieldShell label={label} depth={depth}>
                <ArrayEditor
                    fieldKey={fieldKey}
                    items={currentArray}
                    activeLang={activeLang}
                    projectWordOptions={projectWordOptions}
                    depth={depth + 1}
                    onChange={(nextArray) => {
                        const nextValue: Record<Lang, unknown[]> = {
                            tr: Array.isArray(value.tr) ? [...value.tr] : [],
                            en: Array.isArray(value.en) ? [...value.en] : [],
                            fr: Array.isArray(value.fr) ? [...value.fr] : [],
                            ru: Array.isArray(value.ru) ? [...value.ru] : [],
                        };

                        const oldArray = nextValue[activeLang];
                        const oldLength = oldArray.length;
                        const nextLength = nextArray.length;

                        nextValue[activeLang] = nextArray;

                        if (nextLength > oldLength) {
                            const addedItems = nextArray.slice(oldLength);

                            LANGUAGES.forEach((lang) => {
                                if (lang.key === activeLang) return;

                                addedItems.forEach((item) => {
                                    nextValue[lang.key].push(item);
                                });
                            });
                        }

                        if (nextLength < oldLength) {
                            LANGUAGES.forEach((lang) => {
                                if (lang.key === activeLang) return;

                                nextValue[lang.key] = nextValue[lang.key].slice(
                                    0,
                                    nextLength
                                );
                            });
                        }

                        onChange(nextValue);
                    }}
                />
            </FieldShell>
        );
    }

    if (
        fieldKey === "categoryKey" &&
        typeof value === "string" &&
        projectWordOptions.length > 0
    ) {
        return (
            <FieldShell label={label} depth={depth}>
                <ProjectCategorySelector
                    value={value}
                    activeLang={activeLang}
                    options={projectWordOptions}
                    onChange={onChange}
                />
            </FieldShell>
        );
    }

    if (isLikelyImageField(fieldKey, value, type) && typeof value === "string") {
        return (
            <FieldShell label={label} depth={depth}>
                <ImageField value={value} onChange={onChange} />
            </FieldShell>
        );
    }

    if (typeof value === "string") {
        return (
            <FieldShell label={label} depth={depth}>
                <SmartTextInput value={value} onChange={onChange} />
            </FieldShell>
        );
    }

    if (typeof value === "number") {
        return (
            <FieldShell label={label} depth={depth}>
                <input
                    type="number"
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
                />
            </FieldShell>
        );
    }

    if (typeof value === "boolean") {
        return (
            <FieldShell label={label} depth={depth}>
                <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`inline-flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition ${value
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-black/[0.04] text-black/45"
                        }`}
                >
                    {value ? "Aktif" : "Pasif"}
                </button>
            </FieldShell>
        );
    }

    if (Array.isArray(value)) {
        return (
            <FieldShell label={label} depth={depth}>
                <ArrayEditor
                    fieldKey={fieldKey}
                    items={value}
                    activeLang={activeLang}
                    projectWordOptions={projectWordOptions}
                    depth={depth + 1}
                    onChange={onChange}
                />
            </FieldShell>
        );
    }

    if (isPlainObject(value)) {
        return (
            <FieldShell label={label} depth={depth}>
                <ObjectEditor
                    value={value}
                    activeLang={activeLang}
                    projectWordOptions={projectWordOptions}
                    depth={depth + 1}
                    onChange={onChange}
                />
            </FieldShell>
        );
    }

    return (
        <FieldShell label={label} depth={depth}>
            <input
                value={String(value ?? "")}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
            />
        </FieldShell>
    );
}

function ArrayEditor({
    fieldKey,
    items,
    activeLang,
    projectWordOptions,
    depth,
    onChange,
}: {
    fieldKey: string;
    items: unknown[];
    activeLang: Lang;
    projectWordOptions: ProjectWordOption[];
    depth: number;
    onChange: (value: unknown[]) => void;
}) {
    const addItem = () => {
        onChange([...items, createNewArrayItem(items)]);
    };

    const duplicateItem = (index: number) => {
        const item = structuredClone(items[index]);
        const uniqueValue = crypto.randomUUID();

        if (isPlainObject(item)) {
            if ("id" in item) {
                item.id = uniqueValue;
            }

            if ("slug" in item) {
                item.slug = `${String(item.slug || "item")}-${uniqueValue.slice(0, 8)}`;
            }
        }

        onChange([...items.slice(0, index + 1), item, ...items.slice(index + 1)]);
    };

    const deleteItem = (index: number) => {
        onChange(items.filter((_, itemIndex) => itemIndex !== index));
    };

    const updateItem = (index: number, value: unknown) => {
        onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
    };

    const isObjectList = items.some(isPlainObject);

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-5 text-center text-sm text-black/45">
                    Liste boş.
                </div>
            )}

            {items.map((item, index) => {
                if (isObjectList) {
                    const isLockedProjectsMenu = isHeaderProjectsNavItem(item);

                    return (
                        <ObjectArrayCard
                            key={index}
                            title={getArrayItemTitle(fieldKey, item, index)}
                            locked={isLockedProjectsMenu}
                            onDuplicate={() => duplicateItem(index)}
                            onDelete={() => deleteItem(index)}
                        >
                            <FieldEditor
                                fieldKey={`${fieldKey}-${index}`}
                                label=""
                                value={item}
                                activeLang={activeLang}
                                projectWordOptions={projectWordOptions}
                                depth={depth}
                                onChange={(nextValue) => updateItem(index, nextValue)}
                            />
                        </ObjectArrayCard>
                    );
                }

                return (
                    <div key={index} className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#02acfa]/10 text-sm font-bold text-[#02acfa]">
                            {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                            <FieldEditor
                                fieldKey={`${fieldKey}-${index}`}
                                label=""
                                value={item}
                                activeLang={activeLang}
                                projectWordOptions={projectWordOptions}
                                depth={depth}
                                onChange={(nextValue) => updateItem(index, nextValue)}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => deleteItem(index)}
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#02acfa]/10 px-4 py-3 text-sm font-bold text-[#02acfa] transition hover:bg-[#02acfa] hover:text-white"
            >
                <FiPlus />
                Yeni Ekle
            </button>
        </div>
    );
}

function ObjectEditor({
    value,
    activeLang,
    projectWordOptions,
    depth,
    onChange,
}: {
    value: Record<string, unknown>;
    activeLang: Lang;
    projectWordOptions: ProjectWordOption[];
    depth: number;
    onChange: (value: Record<string, unknown>) => void;
}) {

    if (isHeaderProjectsNavItem(value)) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-bold text-amber-800">
                    Bu alan ProjectsPage ile senkronize edilir.
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-700">
                    Header içindeki Projeler menüsü buradan düzenlenemez. Proje
                    kategorileri ve linkleri ProjectsPage içindeki Project Words
                    alanından üretilir.
                </p>
            </div>
        );
    }

    if (
        typeof value.key === "string" &&
        isLocalizedText(value.label) &&
        projectWordOptions.length > 0 &&
        !("id" in value) &&
        !("slug" in value)
    ) {
        return (
            <ProjectTabSelector
                value={value}
                activeLang={activeLang}
                options={projectWordOptions}
                onChange={onChange}
            />
        );
    }

    const entries = Object.entries(value).filter(([key]) => key !== "_id");

    return (
        <div className="space-y-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            {entries.map(([key, item]) => (
                <FieldEditor
                    key={key}
                    fieldKey={key}
                    label={friendlyLabel(key)}
                    value={item}
                    activeLang={activeLang}
                    projectWordOptions={projectWordOptions}
                    depth={depth}
                    onChange={(nextValue) =>
                        onChange({
                            ...value,
                            [key]: nextValue,
                        })
                    }
                />
            ))}
        </div>
    );
}

function ProjectTabSelector({
    value,
    activeLang,
    options,
    onChange,
}: {
    value: Record<string, unknown>;
    activeLang: Lang;
    options: ProjectWordOption[];
    onChange: (value: Record<string, unknown>) => void;
}) {
    const currentKey = typeof value.key === "string" ? value.key : "";

    const selectedOption =
        options.find((option) => option.key === currentKey) ||
        options.find((option) => {
            if (!isLocalizedText(value.label)) return false;

            return option.label[activeLang] === value.label[activeLang];
        });

    const handleSelect = (selectedKey: string) => {
        const selected = options.find((option) => option.key === selectedKey);

        if (!selected) return;

        onChange({
            ...value,
            key: selected.key,
            label: selected.label,
        });
    };

    return (
        <div className="space-y-4 rounded-2xl border border-[#02acfa]/20 bg-[#02acfa]/5 p-4">
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-black/38">
                    Etiket
                </label>

                <select
                    value={selectedOption?.key || currentKey}
                    onChange={(event) => handleSelect(event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
                >
                    <option value="" disabled>
                        Project Words içinden seç
                    </option>

                    {options.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.label[activeLang]}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-black/38">
                    Kod
                </label>

                <input
                    value={currentKey}
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3 text-sm text-black/45 outline-none"
                />
            </div>

            <p className="text-xs leading-5 text-black/45">
                Bu kategori Project Words alanından seçilir. Link ve Header
                menüsü kaydettiğinde otomatik senkronize edilir.
            </p>
        </div>
    );
}

function ProjectCategorySelector({
    value,
    activeLang,
    options,
    onChange,
}: {
    value: string;
    activeLang: Lang;
    options: ProjectWordOption[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-3 rounded-2xl border border-[#02acfa]/20 bg-[#02acfa]/5 p-4">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
            >
                <option value="" disabled>
                    Project Words içinden kategori seç
                </option>

                {options.map((option) => (
                    <option key={option.key} value={option.key}>
                        {option.label[activeLang]} — {option.key}
                    </option>
                ))}
            </select>

            <p className="text-xs leading-5 text-black/45">
                Bu değer elle yazılmaz. ProjectsPage içindeki Project Words
                listesinden seçilir ve projelerin filtrelenmesinde kullanılır.
            </p>
        </div>
    );
}

function ObjectArrayCard({
    title,
    children,
    locked = false,
    onDuplicate,
    onDelete,
}: {
    title: string;
    children: ReactNode;
    locked?: boolean;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-black/[0.025] px-4 py-3">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <FiChevronDown
                        className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
                    />

                    <span className="truncate text-sm font-bold text-black/75">
                        {title}
                    </span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                    {locked && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            Senkron
                        </span>
                    )}

                    {!locked && (
                        <>
                            <button
                                type="button"
                                onClick={onDuplicate}
                                className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black/45 transition hover:bg-[#02acfa] hover:text-white"
                            >
                                <FiCopy />
                            </button>

                            <button
                                type="button"
                                onClick={onDelete}
                                className="grid h-9 w-9 place-items-center rounded-xl bg-white text-red-500 transition hover:bg-red-500 hover:text-white"
                            >
                                <FiTrash2 />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {open && <div className="p-4">{children}</div>}
        </div>
    );
}

function ImageField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const src = getPublicMediaUrl(value);
    const isVideo = src.toLowerCase().endsWith(".mp4");

    const uploadFile = async (file: File) => {
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append(IMAGE_UPLOAD_FIELD, file);

            const response = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || "Yükleme başarısız.");
            }

            const uploadedUrl =
                data.url ||
                data.path ||
                data.filePath ||
                data.imageUrl ||
                data.filename ||
                "";

            if (!uploadedUrl) {
                throw new Error("Upload cevabında dosya yolu bulunamadı.");
            }

            if (String(uploadedUrl).startsWith("/")) {
                onChange(String(uploadedUrl));
            } else if (String(uploadedUrl).startsWith("images/")) {
                onChange(`/${uploadedUrl}`);
            } else {
                onChange(`/images/${uploadedUrl}`);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        await uploadFile(file);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]">
                {src ? (
                    isVideo ? (
                        <video src={src} className="h-40 w-full object-cover" controls />
                    ) : (
                        <img src={src} alt="" className="h-40 w-full object-cover" />
                    )
                ) : (
                    <div className="grid h-40 place-items-center text-black/35">
                        <FiImage className="text-3xl" />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="/images/ornek.png"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
                />

                <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#02acfa]/10 px-4 py-3 text-sm font-bold text-[#02acfa] transition hover:bg-[#02acfa] hover:text-white">
                        {uploading ? (
                            <FiRefreshCw className="animate-spin" />
                        ) : (
                            <FiUploadCloud />
                        )}
                        {uploading ? "Yükleniyor" : "Görsel Yükle"}

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,video/mp4"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                            <FiTrash2 />
                            Temizle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SmartTextInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const isLong = value.length > 80 || value.includes("\n");

    if (isLong) {
        return (
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={4}
                className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#02acfa]"
            />
        );
    }

    return (
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02acfa]"
        />
    );
}

function FieldShell({
    label,
    children,
    depth,
}: {
    label: string;
    children: ReactNode;
    depth: number;
}) {
    return (
        <div
            className={`rounded-[22px] ${depth === 0
                ? "border border-black/10 bg-[#f8fafc] p-4"
                : "bg-transparent"
                }`}
        >
            {label && (
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-black/38">
                    {label}
                </label>
            )}

            {children}
        </div>
    );
}

function SyncedLockedNotice({ fieldKey }: { fieldKey: string }) {
    const message = getFooterSyncedMessage(fieldKey);

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-800">
                {message.title}
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-700">
                {message.text}
            </p>
        </div>
    );
}

function getArrayItemTitle(fieldKey: string, item: unknown, index: number) {
    if (isPlainObject(item)) {
        const title =
            item.title ??
            item.company ??
            item.name ??
            item.label ??
            item.slug ??
            item.key ??
            item.id;

        if (isLocalizedText(title)) {
            return String(title.tr || title.en || title.fr || title.ru || index + 1);
        }

        if (typeof title === "string" || typeof title === "number") {
            return String(title);
        }
    }

    return `${friendlyLabel(fieldKey)} ${index + 1}`;
}

function InfoCard({
    icon,
    title,
    value,
}: {
    icon: ReactNode;
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-[26px] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#02acfa]/10 text-[#02acfa]">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">
                        {title}
                    </p>

                    <p className="mt-1 truncate text-lg font-bold tracking-[-0.03em]">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="grid min-h-[520px] place-items-center rounded-[30px] border border-dashed border-black/15 bg-white">
            <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-black/[0.04] text-black/35">
                    <FiLayers className="text-2xl" />
                </div>

                <h3 className="mt-5 text-xl font-bold">Sayfa seçilmedi</h3>
                <p className="mt-2 text-sm text-black/45">
                    Soldaki listeden düzenlemek istediğin pageKey’i seç.
                </p>
            </div>
        </div>
    );
}

function PanelSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl bg-white/[0.06]"
                />
            ))}
        </div>
    );
}

function ContentSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="h-52 animate-pulse rounded-[30px] bg-black/[0.05]"
                />
            ))}
        </div>
    );
}

function isFooterSyncedField(fieldKey: string) {
    return [
        "projectsTitle",
        "projectsLinks",
        "corporateTitle",
        "corporateLinks",
    ].includes(fieldKey);
}

function getFooterSyncedMessage(fieldKey: string) {
    if (fieldKey === "projectsTitle" || fieldKey === "projectsLinks") {
        return {
            title: "Bu alan ProjectsPage ile senkronize edilir.",
            text: "Footer içindeki Projeler başlığı ve proje kategori listesi buradan düzenlenemez. Kategori eklemek veya değiştirmek için ProjectsPage içindeki Project Words alanını düzenleyin. Kaydedince Header ve Footer otomatik güncellenir.",
        };
    }

    if (fieldKey === "corporateTitle" || fieldKey === "corporateLinks") {
        return {
            title: "Bu alan Header ile senkronize edilir.",
            text: "Footer içindeki Kurumsal başlığı ve alt bağlantıları buradan düzenlenemez. Kurumsal menüsünü değiştirmek için Header içindeki Kurumsal alanını düzenleyin.",
        };
    }

    return {
        title: "Bu alan senkronize edilir.",
        text: "Bu alan başka bir sayfadan otomatik güncellenir.",
    };
}
