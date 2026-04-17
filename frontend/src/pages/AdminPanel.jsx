import { Bold } from "lucide-react";
import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const dropZoneStyle = {
    border: "2px dashed #cbd5e1",
    borderRadius: "10px",
    padding: "16px",
    background: "#f8fafc",
    textAlign: "center",
    cursor: "pointer",
};

const slugifyFileName = (fileName = "") => {
    const parts = fileName.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
    const base = parts.join(".");

    const safeBase = base
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-_]/g, "")
        .replace(/\s+/g, "-");

    return ext ? `${safeBase}.${ext}` : safeBase;
};

const imageLikeKeys = [
    "image",
    "backgroundImage",
    "heroBackgroundImage",
    "primaryImage",
    "secondaryImage",
    "imgUrl",
    "heroVideo",
];

const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
};

const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
};

const primaryButtonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#02acfa",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
};

const dangerButtonStyle = {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
};

const ghostButtonStyle = {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
};

const panelCardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px",
};

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const isLocalizedObject = (value) =>
    isPlainObject(value) &&
    SUPPORTED_LANGS.some((lang) => lang in value);

const isLocalizedArrayObject = (value) =>
    isPlainObject(value) &&
    SUPPORTED_LANGS.some((lang) => Array.isArray(value[lang]));

const isPrimitiveArray = (value) =>
    Array.isArray(value) &&
    value.every(
        (item) =>
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean"
    );

const normalizeMediaPath = (value) => {
    if (!value || typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    return `/${trimmed}`;
};

const isMediaPath = (value) => {
    if (typeof value !== "string") return false;
    const lower = value.trim().toLowerCase();
    return (
        lower.startsWith("/images/") ||
        lower.startsWith("http://") ||
        lower.startsWith("https://") ||
        lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".svg") ||
        lower.endsWith(".gif") ||
        lower.endsWith(".mp4") ||
        lower.endsWith(".webm") ||
        lower.endsWith(".mov")
    );
};

const isImageField = (contentKey, value) =>
    imageLikeKeys.includes(contentKey) || isMediaPath(value);

const prettifyKey = (key = "") =>
    key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

const slugify = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const getDefaultItemByKey = (key) => {
    switch (key) {
        case "projectTabs":
            return { key: "", label: createEmptyLocalizedObject() };

        case "projectItems":
            return {
                id: Date.now(),
                categoryKey: "",
                type: createEmptyLocalizedObject(),
                company: createEmptyLocalizedObject(),
                description: createEmptyLocalizedObject(),
                year: "",
                primaryImage: "",
                secondaryImage: "",
            };

        case "projectHighlights":
            return {
                id: Date.now(),
                title: createEmptyLocalizedObject(),
                text: createEmptyLocalizedObject(),
            };

        case "servicesItems":
        case "visionItems":
            return {
                title: createEmptyLocalizedObject(),
                description: createEmptyLocalizedObject(),
                tags: [],
                image: "",
            };

        case "statsItems":
            return {
                value: "",
                label: createEmptyLocalizedObject(),
                description: createEmptyLocalizedObject(),
            };

        case "contactMaps":
            return { name: "", url: "" };

        case "partnersItems":
            return { id: Date.now(), image: "", alt: "" };

        case "exploreItems":
            return {
                id: `item-${Date.now()}`,
                imgUrl: "",
                title: createEmptyLocalizedObject(),
            };

        default:
            return "";
    }
};

const SUPPORTED_LANGS = ["tr", "en", "fr", "ru"];

const LANGUAGE_LABELS = {
    tr: "Türkçe",
    en: "English",
    fr: "Français",
    ru: "Русский",
};

const createEmptyLocalizedObject = () => ({
    tr: "",
    en: "",
    fr: "",
    ru: "",
});

const createEmptyLocalizedArrayObject = () => ({
    tr: [],
    en: [],
    fr: [],
    ru: [],
});

const buildProjectsSubmenuFromTabs = (tabs = []) => {
    return tabs
        .filter((tab) => tab.key && tab.key !== "all")
        .map((tab) => ({
            title: {
                tr: tab.label?.tr || "",
                en: tab.label?.en || "",
                fr: tab.label?.fr || "",
                ru: tab.label?.ru || "",
            },
            link: "/projects",
            tab: tab.label?.tr || "",
        }));
};

const AdminPanel = () => {
    const [pages, setPages] = useState([]);
    const [selectedPageName, setSelectedPageName] = useState("");
    const [selectedPage, setSelectedPage] = useState(null);
    const [editableSections, setEditableSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [panelMode, setPanelMode] = useState("content");
    const [uploadingField, setUploadingField] = useState("");
    const [livePreviews, setLivePreviews] = useState({});

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/pages`, {
                    credentials: "include",
                });
                const data = await res.json();
                setPages(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Sayfalar alınamadı:", error);
            }
        };

        fetchPages();
    }, []);

    const updateSections = (updater) => {
        setEditableSections((prev) => {
            const copy = deepClone(prev);
            updater(copy);
            return copy;
        });
    };

    const getContentDisplayName = (content) => {
        if (content.adminLabel && typeof content.adminLabel === "object") {
            return (
                content.adminLabel.tr ||
                content.adminLabel.en ||
                prettifyKey(content.key)
            );
        }
        return prettifyKey(content.key);
    };

    const handlePageClick = async (pageName) => {
        try {
            setLoading(true);
            setSelectedPageName(pageName);

            const res = await fetch(`${API_BASE}/api/pages/${pageName}`, {
                credentials: "include",
            });
            const data = await res.json();

            setSelectedPage(data);
            setEditableSections(data.sections || []);
        } catch (error) {
            console.error("Sayfa detayı alınamadı:", error);
            alert("Sayfa detayı alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const res = await fetch(`${API_BASE}/api/pages/${selectedPageName}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sections: editableSections,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Kaydetme başarısız.");
            }

            if (selectedPageName === "ProjectsPage") {
                const projectTabsContent = editableSections
                    .flatMap((section) => section.contents || [])
                    .find((content) => content.key === "projectTabs");

                const projectTabs = projectTabsContent?.value || [];
                const newSubmenu = buildProjectsSubmenuFromTabs(projectTabs);

                const headerRes = await fetch(`${API_BASE}/api/pages/Header`, {
                    credentials: "include",
                });
                const headerData = await headerRes.json();

                if (!headerRes.ok) {
                    throw new Error("Header verisi alınamadı.");
                }

                const updatedHeaderSections = deepClone(headerData.sections || []);

                updatedHeaderSections.forEach((section) => {
                    (section.contents || []).forEach((content) => {
                        if (content.key !== "menuItems" || !Array.isArray(content.value)) return;

                        content.value.forEach((menuItem) => {
                            if (menuItem.link === "/projects") {
                                menuItem.submenu = newSubmenu;
                            }
                        });
                    });
                });

                const saveHeaderRes = await fetch(`${API_BASE}/api/pages/Header`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        sections: updatedHeaderSections,
                    }),
                });

                const saveHeaderData = await saveHeaderRes.json();

                if (!saveHeaderRes.ok) {
                    throw new Error(saveHeaderData.error || "Header eşitleme başarısız.");
                }
            }

            alert("Başarıyla kaydedildi.");
            setSelectedPage(data.data);
            setEditableSections(data.data.sections || []);
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            alert("Kaydedilemedi.");
        } finally {
            setSaving(false);
        }
    };

    const handleContentChange = (sectionIndex, contentIndex, newValue) => {
        updateSections((copy) => {
            copy[sectionIndex].contents[contentIndex].value = newValue;
        });
    };

    const handleLocalizedChange = (sectionIndex, contentIndex, lang, newValue) => {
        updateSections((copy) => {
            const current = copy[sectionIndex].contents[contentIndex].value;

            if (!isPlainObject(current) || Array.isArray(current)) {
                copy[sectionIndex].contents[contentIndex].value = createEmptyLocalizedObject();
            }

            copy[sectionIndex].contents[contentIndex].value[lang] = newValue;
        });
    };

    const handleContentAdminLabelChange = (sectionIndex, contentIndex, lang, value) => {
        updateSections((copy) => {
            const content = copy[sectionIndex].contents[contentIndex];

            if (!content.adminLabel || typeof content.adminLabel !== "object") {
                content.adminLabel = createEmptyLocalizedObject();
            }

            content.adminLabel[lang] = value;
        });
    };

    const handleNestedLogoChange = (sectionIndex, contentIndex, field, langOrValue, maybeValue) => {
        updateSections((copy) => {
            const content = copy[sectionIndex].contents[contentIndex];

            if (!isPlainObject(content.value)) {
                content.value = {
                    image: "",
                    label: createEmptyLocalizedObject(),
                };
            }

            if (field === "image") {
                content.value.image = langOrValue;
                return;
            }

            if (field === "label") {
                if (!isPlainObject(content.value.label)) {
                    content.value.label = createEmptyLocalizedObject();
                }

                content.value.label[langOrValue] = maybeValue;
            }
        });
    };

    const handleArrayItemFieldChange = (
        sectionIndex,
        contentIndex,
        itemIndex,
        fieldKey,
        newValue
    ) => {
        updateSections((copy) => {
            copy[sectionIndex].contents[contentIndex].value[itemIndex][fieldKey] = newValue;
        });
    };

    const handleFileUpload = async (file, onSuccess, fieldKey) => {
        if (!file) return;

        const tempPreview = URL.createObjectURL(file);

        try {
            setUploadingField(fieldKey);
            setLivePreviews((prev) => ({
                ...prev,
                [fieldKey]: tempPreview,
            }));

            const safeName = slugifyFileName(file.name);
            const renamedFile = new File([file], safeName, { type: file.type });

            const formData = new FormData();
            formData.append("file", renamedFile);

            const res = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Dosya yüklenemedi.");
            }

            onSuccess(data.path);

            setLivePreviews((prev) => ({
                ...prev,
                [fieldKey]: tempPreview,
            }));
        } catch (error) {
            console.error("Upload hatası:", error);
            alert("Dosya yüklenemedi.");
            URL.revokeObjectURL(tempPreview);
        } finally {
            setUploadingField("");
        }
    };

    const renderLocalizedObjectEditor = (value, sectionIndex, contentIndex) => {
        const mergedValue = {
            ...createEmptyLocalizedObject(),
            ...(value || {}),
        };

        const isLongText = SUPPORTED_LANGS.some(
            (lang) => mergedValue?.[lang] && String(mergedValue[lang]).length > 140
        );

        return (
            <div style={{ display: "grid", gap: "10px" }}>
                {SUPPORTED_LANGS.map((lang) =>
                    isLongText ? (
                        <textarea
                            key={lang}
                            rows={4}
                            placeholder={LANGUAGE_LABELS[lang]}
                            value={mergedValue[lang] || ""}
                            onChange={(e) =>
                                handleLocalizedChange(sectionIndex, contentIndex, lang, e.target.value)
                            }
                            style={textareaStyle}
                        />
                    ) : (
                        <input
                            key={lang}
                            type="text"
                            placeholder={LANGUAGE_LABELS[lang]}
                            value={mergedValue[lang] || ""}
                            onChange={(e) =>
                                handleLocalizedChange(sectionIndex, contentIndex, lang, e.target.value)
                            }
                            style={inputStyle}
                        />
                    )
                )}
            </div>
        );
    };

    const renderLocalizedArrayEditor = (value, sectionIndex, contentIndex) => {
        const normalizedValue = {
            ...createEmptyLocalizedArrayObject(),
            ...(value || {}),
        };

        const updateItem = (lang, itemIndex, newValue) => {
            updateSections((copy) => {
                if (!Array.isArray(copy[sectionIndex].contents[contentIndex].value[lang])) {
                    copy[sectionIndex].contents[contentIndex].value[lang] = [];
                }
                copy[sectionIndex].contents[contentIndex].value[lang][itemIndex] = newValue;
            });
        };

        const addItem = (lang) => {
            updateSections((copy) => {
                if (!Array.isArray(copy[sectionIndex].contents[contentIndex].value[lang])) {
                    copy[sectionIndex].contents[contentIndex].value[lang] = [];
                }
                copy[sectionIndex].contents[contentIndex].value[lang].push("");
            });
        };

        const removeItem = (lang, itemIndex) => {
            updateSections((copy) => {
                if (!Array.isArray(copy[sectionIndex].contents[contentIndex].value[lang])) {
                    copy[sectionIndex].contents[contentIndex].value[lang] = [];
                }
                copy[sectionIndex].contents[contentIndex].value[lang].splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "16px" }}>
                {SUPPORTED_LANGS.map((lang) => (
                    <div key={lang} style={panelCardStyle}>
                        <div
                            style={{
                                fontWeight: "bold",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                            }}
                        >
                            {LANGUAGE_LABELS[lang]}
                        </div>

                        <div style={{ display: "grid", gap: "8px" }}>
                            {(normalizedValue[lang] || []).map((item, itemIndex) => (
                                <div
                                    key={`${lang}-${itemIndex}`}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr auto",
                                        gap: "8px",
                                        alignItems: "center",
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={item || ""}
                                        onChange={(e) => updateItem(lang, itemIndex, e.target.value)}
                                        style={inputStyle}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(lang, itemIndex)}
                                        style={dangerButtonStyle}
                                    >
                                        Sil
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => addItem(lang)}
                            style={{ ...primaryButtonStyle, marginTop: "10px", width: "fit-content" }}
                        >
                            + Ekle
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderPrimitiveArrayEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push("");
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        const updateItem = (itemIndex, newValue) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value[itemIndex] = newValue;
            });
        };

        return (
            <div style={{ display: "grid", gap: "8px" }}>
                {value.map((item, itemIndex) => (
                    <div
                        key={itemIndex}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="text"
                            value={item ?? ""}
                            onChange={(e) => updateItem(itemIndex, e.target.value)}
                            style={inputStyle}
                        />
                        <button
                            type="button"
                            onClick={() => removeItem(itemIndex)}
                            style={dangerButtonStyle}
                        >
                            Sil
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Ekle
                </button>
            </div>
        );
    };

    const renderMediaEditor = (value, sectionIndex, contentIndex, fieldKey = "media") => {
        const uploadKey = `${fieldKey}-${sectionIndex}-${contentIndex}`;
        const mediaSrc = livePreviews[uploadKey] || normalizeMediaPath(value);
        const lower = String(mediaSrc).toLowerCase();
        const isVideo =
            lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");

        const handleDrop = async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleContentChange(sectionIndex, contentIndex, uploadedPath);
                },
                uploadKey
            );
        };

        const handleFileInput = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleContentChange(sectionIndex, contentIndex, uploadedPath);
                },
                uploadKey
            );
        };

        return (
            <div style={{ display: "grid", gap: "10px" }}>
                <input
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => handleContentChange(sectionIndex, contentIndex, e.target.value)}
                    placeholder="Medya yolu"
                    style={inputStyle}
                />

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={dropZoneStyle}
                >
                    <div style={{ marginBottom: "10px", fontWeight: 600 }}>
                        Dosyayı buraya sürükle bırak
                    </div>

                    <label
                        style={{
                            ...primaryButtonStyle,
                            display: "inline-block",
                        }}
                    >
                        Dosya Seç
                        <input
                            type="file"
                            accept={isVideo ? "video/*" : "image/*"}
                            onChange={handleFileInput}
                            style={{ display: "none" }}
                        />
                    </label>

                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                        Yükleme yolu: /images/dosya-adi
                    </div>

                    {uploadingField === uploadKey && (
                        <div style={{ marginTop: "8px", color: "#02acfa", fontWeight: 600 }}>
                            Yükleniyor...
                        </div>
                    )}
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "10px",
                        background: "#fff",
                        minHeight: "180px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {mediaSrc ? (
                        isVideo ? (
                            <video
                                src={mediaSrc}
                                controls
                                style={{
                                    width: "100%",
                                    maxWidth: "260px",
                                    borderRadius: "8px",
                                }}
                            />
                        ) : (
                            <img
                                src={mediaSrc}
                                alt="preview"
                                style={{
                                    maxWidth: "220px",
                                    maxHeight: "160px",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    display: "block",
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        )
                    ) : (
                        <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                            Medya yok
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderLogoEditor = (value, sectionIndex, contentIndex) => {
        const currentValue = isPlainObject(value)
            ? value
            : { image: "", label: { tr: "", en: "" } };

        const imageValue = currentValue.image || "";
        const uploadKey = `logo-${sectionIndex}-${contentIndex}`;
        const mediaSrc = livePreviews[uploadKey] || normalizeMediaPath(imageValue);

        const handleDrop = async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleNestedLogoChange(sectionIndex, contentIndex, "image", uploadedPath);
                },
                `logo-${sectionIndex}-${contentIndex}`
            );
        };

        const handleFileInput = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleNestedLogoChange(sectionIndex, contentIndex, "image", uploadedPath);
                },
                `logo-${sectionIndex}-${contentIndex}`
            );
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                <input
                    type="text"
                    placeholder="Logo image path"
                    value={imageValue}
                    onChange={(e) =>
                        handleNestedLogoChange(
                            sectionIndex,
                            contentIndex,
                            "image",
                            e.target.value
                        )
                    }
                    style={inputStyle}
                />

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={dropZoneStyle}
                >
                    <div style={{ marginBottom: "10px", fontWeight: 600 }}>
                        Resmi buraya sürükle bırak
                    </div>

                    <label
                        style={{
                            ...primaryButtonStyle,
                            display: "inline-block",
                        }}
                    >
                        Dosya Seç
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            style={{ display: "none" }}
                        />
                    </label>

                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                        Yükleme yolu: /images/dosya-adi.jpg
                    </div>

                    {uploadingField === `logo-${sectionIndex}-${contentIndex}` && (
                        <div style={{ marginTop: "8px", color: "#02acfa", fontWeight: 600 }}>
                            Yükleniyor...
                        </div>
                    )}
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "10px",
                        background: "#fff",
                        width: "220px",
                        height: "140px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {mediaSrc ? (
                        <img
                            src={mediaSrc}
                            alt="logo preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                display: "block",
                            }}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                            Logo yok
                        </span>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Label TR"
                    value={currentValue.label?.tr || ""}
                    onChange={(e) =>
                        handleNestedLogoChange(
                            sectionIndex,
                            contentIndex,
                            "label",
                            "tr",
                            e.target.value
                        )
                    }
                    style={inputStyle}
                />

                <input
                    type="text"
                    placeholder="Label EN"
                    value={currentValue.label?.en || ""}
                    onChange={(e) =>
                        handleNestedLogoChange(
                            sectionIndex,
                            contentIndex,
                            "label",
                            "en",
                            e.target.value
                        )
                    }
                    style={inputStyle}
                />
            </div>
        );
    };

    const renderArrayItemMediaEditor = ({
        value,
        sectionIndex,
        contentIndex,
        itemIndex,
        fieldKey,
        placeholder = "Görsel",
        accept = "image/*",
    }) => {
        const uploadKey = `${fieldKey}-${sectionIndex}-${contentIndex}-${itemIndex}`;
        const mediaSrc = livePreviews[uploadKey] || normalizeMediaPath(value);

        const handleDrop = async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleArrayItemFieldChange(
                        sectionIndex,
                        contentIndex,
                        itemIndex,
                        fieldKey,
                        uploadedPath
                    );
                },
                uploadKey
            );
        };

        const handleFileInput = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            await handleFileUpload(
                file,
                (uploadedPath) => {
                    handleArrayItemFieldChange(
                        sectionIndex,
                        contentIndex,
                        itemIndex,
                        fieldKey,
                        uploadedPath
                    );
                },
                uploadKey
            );
        };

        return (
            <div style={{ display: "grid", gap: "10px" }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value || ""}
                    onChange={(e) => {
                        handleArrayItemFieldChange(
                            sectionIndex,
                            contentIndex,
                            itemIndex,
                            fieldKey,
                            e.target.value
                        );
                    }}
                    style={inputStyle}
                />

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={dropZoneStyle}
                >
                    <div style={{ marginBottom: "10px", fontWeight: 600 }}>
                        Dosyayı buraya sürükle bırak
                    </div>

                    <label
                        style={{
                            ...primaryButtonStyle,
                            display: "inline-block",
                        }}
                    >
                        Dosya Seç
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileInput}
                            style={{ display: "none" }}
                        />
                    </label>

                    {uploadingField === uploadKey && (
                        <div style={{ marginTop: "8px", color: "#02acfa", fontWeight: 600 }}>
                            Yükleniyor...
                        </div>
                    )}
                </div>

                <div
                    style={{
                        width: "120px",
                        height: "90px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {mediaSrc ? (
                        <img
                            src={mediaSrc}
                            alt={fieldKey}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                            Görsel yok
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderMenuItemsEditor = (value, sectionIndex, contentIndex) => {
        const addMainItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push({
                    _id: Date.now(),
                    title: { tr: "", en: "" },
                    link: "/",
                });
            });
        };

        const removeMainItem = (menuIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(menuIndex, 1);
            });
        };

        const addSubmenuItem = (menuIndex) => {
            updateSections((copy) => {
                const item = copy[sectionIndex].contents[contentIndex].value[menuIndex];
                if (!Array.isArray(item.submenu)) item.submenu = [];
                item.submenu.push({
                    title: { tr: "", en: "" },
                    link: "/",
                    tab: "",
                    desc: { tr: "", en: "" },
                    icon: "",
                    external: false,
                    url: "",
                });
            });
        };

        const removeSubmenuItem = (menuIndex, subIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu.splice(
                    subIndex,
                    1
                );
            });
        };

        return (
            <div style={{ display: "grid", gap: "14px" }}>
                {value.map((menu, menuIndex) => {
                    const isProjectsMenu = menu.link === "/projects";

                    return (
                        <div key={menuIndex} style={panelCardStyle}>
                            <div style={{ display: "grid", gap: "10px", marginBottom: "10px" }}>
                                <div style={{ fontWeight: "bold", color: "#111827" }}>
                                    Menü #{menuIndex + 1}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Türkçe başlık"
                                    value={menu.title?.tr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const item = copy[sectionIndex].contents[contentIndex].value[menuIndex];
                                            if (!isPlainObject(item.title)) item.title = { tr: "", en: "" };
                                            item.title.tr = e.target.value;
                                            if (!item.link || item.link === "/") {
                                                item.link = "/" + slugify(e.target.value || "");
                                            }
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="English title"
                                    value={menu.title?.en || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const item = copy[sectionIndex].contents[contentIndex].value[menuIndex];
                                            if (!isPlainObject(item.title)) item.title = { tr: "", en: "" };
                                            item.title.en = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Link"
                                    value={menu.link || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            copy[sectionIndex].contents[contentIndex].value[menuIndex].link =
                                                e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            {Array.isArray(menu.submenu) && !isProjectsMenu && (
                                <div
                                    style={{
                                        marginTop: "8px",
                                        padding: "10px",
                                        background: "#f9fafb",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Alt Menü</div>

                                    <div style={{ display: "grid", gap: "10px" }}>
                                        {menu.submenu.map((sub, subIndex) => (
                                            <div
                                                key={subIndex}
                                                style={{
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    background: "#fff",
                                                    display: "grid",
                                                    gap: "8px",
                                                }}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Türkçe başlık"
                                                    value={sub.title?.tr || ""}
                                                    onChange={(e) => {
                                                        updateSections((copy) => {
                                                            const item =
                                                                copy[sectionIndex].contents[contentIndex].value[menuIndex]
                                                                    .submenu[subIndex];
                                                            if (!isPlainObject(item.title)) item.title = { tr: "", en: "" };
                                                            item.title.tr = e.target.value;
                                                        });
                                                    }}
                                                    style={inputStyle}
                                                />

                                                <input
                                                    type="text"
                                                    placeholder="English title"
                                                    value={sub.title?.en || ""}
                                                    onChange={(e) => {
                                                        updateSections((copy) => {
                                                            const item =
                                                                copy[sectionIndex].contents[contentIndex].value[menuIndex]
                                                                    .submenu[subIndex];
                                                            if (!isPlainObject(item.title)) item.title = { tr: "", en: "" };
                                                            item.title.en = e.target.value;
                                                        });
                                                    }}
                                                    style={inputStyle}
                                                />

                                                {"desc" in sub && SUPPORTED_LANGS.map((lang) => (
                                                    <input
                                                        key={lang}
                                                        type="text"
                                                        placeholder={`Açıklama ${lang.toUpperCase()}`}
                                                        value={sub.desc?.[lang] || ""}
                                                        onChange={(e) => {
                                                            updateSections((copy) => {
                                                                const item =
                                                                    copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[subIndex];
                                                                if (!isPlainObject(item.desc)) item.desc = createEmptyLocalizedObject();
                                                                item.desc[lang] = e.target.value;
                                                            });
                                                        }}
                                                        style={inputStyle}
                                                    />
                                                ))}

                                                <input
                                                    type="text"
                                                    placeholder="Link"
                                                    value={sub.link || ""}
                                                    onChange={(e) => {
                                                        updateSections((copy) => {
                                                            copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[
                                                                subIndex
                                                            ].link = e.target.value;
                                                        });
                                                    }}
                                                    style={inputStyle}
                                                />

                                                {"tab" in sub && (
                                                    <input
                                                        type="text"
                                                        placeholder="Tab değeri"
                                                        value={sub.tab || ""}
                                                        onChange={(e) => {
                                                            updateSections((copy) => {
                                                                copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[
                                                                    subIndex
                                                                ].tab = e.target.value;
                                                            });
                                                        }}
                                                        style={inputStyle}
                                                    />
                                                )}

                                                {"icon" in sub && (
                                                    <input
                                                        type="text"
                                                        placeholder="Icon"
                                                        value={sub.icon || ""}
                                                        onChange={(e) => {
                                                            updateSections((copy) => {
                                                                copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[
                                                                    subIndex
                                                                ].icon = e.target.value;
                                                            });
                                                        }}
                                                        style={inputStyle}
                                                    />
                                                )}

                                                {"url" in sub && (
                                                    <input
                                                        type="text"
                                                        placeholder="External URL"
                                                        value={sub.url || ""}
                                                        onChange={(e) => {
                                                            updateSections((copy) => {
                                                                copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[
                                                                    subIndex
                                                                ].url = e.target.value;
                                                            });
                                                        }}
                                                        style={inputStyle}
                                                    />
                                                )}

                                                {"external" in sub && (
                                                    <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!sub.external}
                                                            onChange={(e) => {
                                                                updateSections((copy) => {
                                                                    copy[sectionIndex].contents[contentIndex].value[menuIndex].submenu[
                                                                        subIndex
                                                                    ].external = e.target.checked;
                                                                });
                                                            }}
                                                        />
                                                        External
                                                    </label>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => removeSubmenuItem(menuIndex, subIndex)}
                                                    style={{ ...dangerButtonStyle, width: "fit-content" }}
                                                >
                                                    Alt Menüyü Sil
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addSubmenuItem(menuIndex)}
                                        style={{ ...primaryButtonStyle, marginTop: "10px", width: "fit-content" }}
                                    >
                                        + Alt Menü
                                    </button>
                                </div>
                            )}

                            {isProjectsMenu && (
                                <div
                                    style={{
                                        marginTop: "10px",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        background: "#fff7ed",
                                        border: "1px solid #fdba74",
                                        color: "#9a3412",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Bu alan ProjectsPage içindeki projectTabs verisinden otomatik üretiliyor.
                                    Burayı manuel değiştirmeyin.
                                </div>
                            )}

                            <div style={{ marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => removeMainItem(menuIndex)}
                                    style={dangerButtonStyle}
                                >
                                    Menüyü Sil
                                </button>
                            </div>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={addMainItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Menü Ekle
                </button>
            </div>
        );
    };

    const renderProjectTabsEditor = (value, sectionIndex, contentIndex) => {
        const addTab = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(getDefaultItemByKey("projectTabs"));
            });
        };

        const removeTab = (tabIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(tabIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "10px" }}>
                {value.map((tab, tabIndex) => (
                    <div key={tabIndex} style={panelCardStyle}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                                gap: "8px",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Key"
                                value={tab.key || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        copy[sectionIndex].contents[contentIndex].value[tabIndex].key =
                                            e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Türkçe"
                                value={tab.label?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const item = copy[sectionIndex].contents[contentIndex].value[tabIndex];
                                        if (!isPlainObject(item.label)) {
                                            item.label = { tr: "", en: "", fr: "", ru: "" };
                                        }
                                        item.label.tr = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="English"
                                value={tab.label?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const item = copy[sectionIndex].contents[contentIndex].value[tabIndex];
                                        if (!isPlainObject(item.label)) {
                                            item.label = { tr: "", en: "", fr: "", ru: "" };
                                        }
                                        item.label.en = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Français"
                                value={tab.label?.fr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const item = copy[sectionIndex].contents[contentIndex].value[tabIndex];
                                        if (!isPlainObject(item.label)) {
                                            item.label = { tr: "", en: "", fr: "", ru: "" };
                                        }
                                        item.label.fr = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Русский"
                                value={tab.label?.ru || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const item = copy[sectionIndex].contents[contentIndex].value[tabIndex];
                                        if (!isPlainObject(item.label)) {
                                            item.label = { tr: "", en: "", fr: "", ru: "" };
                                        }
                                        item.label.ru = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeTab(tabIndex)}
                                style={dangerButtonStyle}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addTab}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Tab Ekle
                </button>
            </div>
        );
    };

    const renderProjectItemsEditor = (value, sectionIndex, contentIndex) => {

        const addProject = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push({
                    id: Date.now(),
                    categoryKey: "",
                    type: { tr: "", en: "", fr: "", ru: "" },
                    company: { tr: "", en: "", fr: "", ru: "" },
                    description: { tr: "", en: "", fr: "", ru: "" },
                    year: "",
                    primaryImage: "",
                    secondaryImage: "",
                });

            });
        };

        const removeProject = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "14px" }}>
                {value.map((item, itemIndex) => {
                    const localizedType = isPlainObject(item.type)
                        ? item.type
                        : { tr: "", en: "", fr: "", ru: "" };

                    const localizedCompany = isPlainObject(item.company)
                        ? item.company
                        : { tr: "", en: "", fr: "", ru: "" };

                    const localizedDescription = isPlainObject(item.description)
                        ? item.description
                        : { tr: "", en: "", fr: "", ru: "" };

                    return (
                        <div key={itemIndex} style={panelCardStyle}>
                            <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                Proje #{itemIndex + 1}
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                    gap: "10px",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="ID"
                                    value={item.id ?? ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            copy[sectionIndex].contents[contentIndex].value[itemIndex].id =
                                                e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                {"categoryKey" in item ? (
                                    <input
                                        type="text"
                                        placeholder="Category Key"
                                        value={item.categoryKey || ""}
                                        onChange={(e) => {
                                            updateSections((copy) => {
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex].categoryKey =
                                                    e.target.value;
                                            });
                                        }}
                                        style={inputStyle}
                                    />
                                ) : (
                                    <div />
                                )}

                                <input
                                    type="text"
                                    placeholder="Type TR"
                                    value={localizedType.tr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.type)) {
                                                current.type = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.type.tr = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Type EN"
                                    value={localizedType.en || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.type)) {
                                                current.type = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.type.en = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Type FR"
                                    value={localizedType.fr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.type)) {
                                                current.type = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.type.fr = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Type RU"
                                    value={localizedType.ru || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.type)) {
                                                current.type = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.type.ru = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Company TR"
                                    value={localizedCompany.tr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.company)) {
                                                current.company = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.company.tr = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Company EN"
                                    value={localizedCompany.en || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.company)) {
                                                current.company = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.company.en = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Company FR"
                                    value={localizedCompany.fr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.company)) {
                                                current.company = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.company.fr = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Company RU"
                                    value={localizedCompany.ru || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.company)) {
                                                current.company = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.company.ru = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <textarea
                                    rows={3}
                                    placeholder="Description TR"
                                    value={localizedDescription.tr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.description)) {
                                                current.description = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.description.tr = e.target.value;
                                        });
                                    }}
                                    style={textareaStyle}
                                />

                                <textarea
                                    rows={3}
                                    placeholder="Description EN"
                                    value={localizedDescription.en || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.description)) {
                                                current.description = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.description.en = e.target.value;
                                        });
                                    }}
                                    style={textareaStyle}
                                />

                                <textarea
                                    rows={3}
                                    placeholder="Description FR"
                                    value={localizedDescription.fr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.description)) {
                                                current.description = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.description.fr = e.target.value;
                                        });
                                    }}
                                    style={textareaStyle}
                                />

                                <textarea
                                    rows={3}
                                    placeholder="Description RU"
                                    value={localizedDescription.ru || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current =
                                                copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.description)) {
                                                current.description = { tr: "", en: "", fr: "", ru: "" };
                                            }
                                            current.description.ru = e.target.value;
                                        });
                                    }}
                                    style={textareaStyle}
                                />

                                <input
                                    type="text"
                                    placeholder="Year"
                                    value={item.year || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            copy[sectionIndex].contents[contentIndex].value[itemIndex].year =
                                                e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />

                                <div />

                                {renderArrayItemMediaEditor({
                                    value: item.primaryImage,
                                    sectionIndex,
                                    contentIndex,
                                    itemIndex,
                                    fieldKey: "primaryImage",
                                    placeholder: "Primary Image",
                                })}

                                {renderArrayItemMediaEditor({
                                    value: item.secondaryImage,
                                    sectionIndex,
                                    contentIndex,
                                    itemIndex,
                                    fieldKey: "secondaryImage",
                                    placeholder: "Secondary Image",
                                })}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "16px",
                                    marginTop: "12px",
                                    flexWrap: "wrap",
                                }}
                            >
                            </div>

                            <button
                                type="button"
                                onClick={() => removeProject(itemIndex)}
                                style={{ ...dangerButtonStyle, marginTop: "12px", width: "fit-content" }}
                            >
                                Projeyi Sil
                            </button>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={addProject}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Proje Ekle
                </button>
            </div>
        );
    };

    const renderProjectHighlightsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("projectHighlights")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div style={{ display: "grid", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder="Başlık TR"
                                value={item.title?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                        current.title.tr = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Başlık EN"
                                value={item.title?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                        current.title.en = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <textarea
                                rows={3}
                                placeholder="Metin TR"
                                value={item.text?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.text)) current.text = { tr: "", en: "" };
                                        current.text.tr = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            <textarea
                                rows={3}
                                placeholder="Metin EN"
                                value={item.text?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.text)) current.text = { tr: "", en: "" };
                                        current.text.en = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                style={{ ...dangerButtonStyle, width: "fit-content" }}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Madde Ekle
                </button>
            </div>
        );
    };

    const renderFeatureCardsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("servicesItems")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        const addTag = (itemIndex) => {
            updateSections((copy) => {
                const item = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                if (!Array.isArray(item.tags)) item.tags = [];
                item.tags.push("");
            });
        };

        const removeTag = (itemIndex, tagIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value[itemIndex].tags.splice(
                    tagIndex,
                    1
                );
            });
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div style={{ display: "grid", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder="Başlık TR"
                                value={item.title?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                        current.title.tr = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Başlık EN"
                                value={item.title?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                        current.title.en = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <textarea
                                rows={3}
                                placeholder="Açıklama TR"
                                value={item.description?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.description)) {
                                            current.description = { tr: "", en: "" };
                                        }
                                        current.description.tr = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            <textarea
                                rows={3}
                                placeholder="Açıklama EN"
                                value={item.description?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.description)) {
                                            current.description = { tr: "", en: "" };
                                        }
                                        current.description.en = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            {renderArrayItemMediaEditor({
                                value: item.image,
                                sectionIndex,
                                contentIndex,
                                itemIndex,
                                fieldKey: "image",
                                placeholder: "Görsel",
                            })}

                            <div
                                style={{
                                    padding: "10px",
                                    background: "#f9fafb",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Tags</div>

                                <div style={{ display: "grid", gap: "8px" }}>
                                    {(item.tags || []).map((tag, tagIndex) => (
                                        <div
                                            key={tagIndex}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr auto",
                                                gap: "8px",
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={tag || ""}
                                                onChange={(e) => {
                                                    updateSections((copy) => {
                                                        copy[sectionIndex].contents[contentIndex].value[itemIndex].tags[
                                                            tagIndex
                                                        ] = e.target.value;
                                                    });
                                                }}
                                                style={inputStyle}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeTag(itemIndex, tagIndex)}
                                                style={dangerButtonStyle}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => addTag(itemIndex)}
                                    style={{ ...primaryButtonStyle, marginTop: "10px", width: "fit-content" }}
                                >
                                    + Tag Ekle
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                style={{ ...dangerButtonStyle, width: "fit-content" }}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Kart Ekle
                </button>
            </div>
        );
    };

    const renderStatsItemsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("statsItems")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div style={{ display: "grid", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder="Value"
                                value={item.value || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        copy[sectionIndex].contents[contentIndex].value[itemIndex].value =
                                            e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Label TR"
                                value={item.label?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.label)) current.label = { tr: "", en: "" };
                                        current.label.tr = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="Label EN"
                                value={item.label?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.label)) current.label = { tr: "", en: "" };
                                        current.label.en = e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <textarea
                                rows={2}
                                placeholder="Description TR"
                                value={item.description?.tr || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.description)) {
                                            current.description = { tr: "", en: "" };
                                        }
                                        current.description.tr = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            <textarea
                                rows={2}
                                placeholder="Description EN"
                                value={item.description?.en || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                        if (!isPlainObject(current.description)) {
                                            current.description = { tr: "", en: "" };
                                        }
                                        current.description.en = e.target.value;
                                    });
                                }}
                                style={textareaStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                style={{ ...dangerButtonStyle, width: "fit-content" }}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + İstatistik Ekle
                </button>
            </div>
        );
    };

    const renderContactMapsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("contactMaps")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "10px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 2fr auto",
                                gap: "8px",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Map Name"
                                value={item.name || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        copy[sectionIndex].contents[contentIndex].value[itemIndex].name =
                                            e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <input
                                type="text"
                                placeholder="URL"
                                value={item.url || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        copy[sectionIndex].contents[contentIndex].value[itemIndex].url =
                                            e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                style={dangerButtonStyle}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Link Ekle
                </button>
            </div>
        );
    };

    const renderPartnersItemsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("partnersItems")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "120px 1fr 1fr auto",
                                gap: "10px",
                                alignItems: "center",
                            }}
                        >

                            {renderArrayItemMediaEditor({
                                value: item.image,
                                sectionIndex,
                                contentIndex,
                                itemIndex,
                                fieldKey: "image",
                                placeholder: "Image",
                            })}

                            <input
                                type="text"
                                placeholder="Alt"
                                value={item.alt || ""}
                                onChange={(e) => {
                                    updateSections((copy) => {
                                        copy[sectionIndex].contents[contentIndex].value[itemIndex].alt =
                                            e.target.value;
                                    });
                                }}
                                style={inputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeItem(itemIndex)}
                                style={dangerButtonStyle}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Partner Ekle
                </button>
            </div>
        );
    };

    const renderExploreItemsEditor = (value, sectionIndex, contentIndex) => {
        const addItem = () => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.push(
                    getDefaultItemByKey("exploreItems")
                );
            });
        };

        const removeItem = (itemIndex) => {
            updateSections((copy) => {
                copy[sectionIndex].contents[contentIndex].value.splice(itemIndex, 1);
            });
        };

        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "120px 1fr 1fr",
                                gap: "10px",
                                alignItems: "center",
                            }}
                        >

                            <div style={{ display: "grid", gap: "8px" }}>
                                <input
                                    type="text"
                                    placeholder="ID"
                                    value={item.id || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            copy[sectionIndex].contents[contentIndex].value[itemIndex].id =
                                                e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />
                                {renderArrayItemMediaEditor({
                                    value: item.imgUrl,
                                    sectionIndex,
                                    contentIndex,
                                    itemIndex,
                                    fieldKey: "imgUrl",
                                    placeholder: "Image",
                                })}
                            </div>

                            <div style={{ display: "grid", gap: "8px" }}>
                                <input
                                    type="text"
                                    placeholder="Title TR"
                                    value={item.title?.tr || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                            current.title.tr = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="Title EN"
                                    value={item.title?.en || ""}
                                    onChange={(e) => {
                                        updateSections((copy) => {
                                            const current = copy[sectionIndex].contents[contentIndex].value[itemIndex];
                                            if (!isPlainObject(current.title)) current.title = { tr: "", en: "" };
                                            current.title.en = e.target.value;
                                        });
                                    }}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeItem(itemIndex)}
                            style={{ ...dangerButtonStyle, marginTop: "12px", width: "fit-content" }}
                        >
                            Sil
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    style={{ ...primaryButtonStyle, width: "fit-content" }}
                >
                    + Öğe Ekle
                </button>
            </div>
        );
    };

    const renderGenericObjectListEditor = (value, sectionIndex, contentIndex) => {
        return (
            <div style={{ display: "grid", gap: "12px" }}>
                {value.map((item, itemIndex) => (
                    <div key={itemIndex} style={panelCardStyle}>
                        <div style={{ display: "grid", gap: "10px" }}>
                            {Object.entries(item).map(([fieldKey, fieldValue]) => {
                                if (isImageField(fieldKey, fieldValue)) {
                                    return (
                                        <div key={fieldKey}>
                                            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                                                {prettifyKey(fieldKey)}
                                            </div>

                                            {renderArrayItemMediaEditor({
                                                value: fieldValue,
                                                sectionIndex,
                                                contentIndex,
                                                itemIndex,
                                                fieldKey,
                                                placeholder: prettifyKey(fieldKey),
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={fieldKey}>
                                        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                                            {prettifyKey(fieldKey)}
                                        </div>
                                        <input
                                            type="text"
                                            value={fieldValue ?? ""}
                                            onChange={(e) => {
                                                updateSections((copy) => {
                                                    copy[sectionIndex].contents[contentIndex].value[itemIndex][fieldKey] =
                                                        e.target.value;
                                                });
                                            }}
                                            style={inputStyle}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFallbackEditor = (value, sectionIndex, contentIndex, key) => (
        <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                Bu alan için özel editör tanımlı değil: {key}
            </div>
            <textarea
                rows={8}
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                    try {
                        const parsed = JSON.parse(e.target.value);
                        handleContentChange(sectionIndex, contentIndex, parsed);
                    } catch {
                        // ignore invalid json
                    }
                }}
                style={{ ...textareaStyle, fontFamily: "monospace", fontSize: "13px" }}
            />
        </div>
    );

    const renderInput = (content, sectionIndex, contentIndex) => {
        const value = content.value;

        if (content.key === "menuItems") {
            return renderMenuItemsEditor(value, sectionIndex, contentIndex);
        }

        if (
            content.key === "logo" &&
            isPlainObject(content.value) &&
            ("image" in content.value || "label" in content.value)
        ) {
            return renderLogoEditor(content.value, sectionIndex, contentIndex);
        }

        if (content.key === "projectTabs") {
            return renderProjectTabsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "projectItems") {
            return renderProjectItemsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "projectHighlights") {
            return renderProjectHighlightsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "servicesItems" || content.key === "visionItems") {
            return renderFeatureCardsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "statsItems") {
            return renderStatsItemsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "contactMaps") {
            return renderContactMapsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "partnersItems") {
            return renderPartnersItemsEditor(value, sectionIndex, contentIndex);
        }

        if (content.key === "exploreItems") {
            return renderExploreItemsEditor(value, sectionIndex, contentIndex);
        }

        if (isLocalizedArrayObject(value)) {
            return renderLocalizedArrayEditor(value, sectionIndex, contentIndex);
        }

        if (isLocalizedObject(value)) {
            return renderLocalizedObjectEditor(value, sectionIndex, contentIndex);
        }

        if (isImageField(content.key, value)) {
            return renderMediaEditor(value, sectionIndex, contentIndex, content.key);
        }

        if (isPrimitiveArray(value)) {
            return renderPrimitiveArrayEditor(value, sectionIndex, contentIndex);
        }

        if (Array.isArray(value) && value.every((item) => isPlainObject(item))) {
            return renderGenericObjectListEditor(value, sectionIndex, contentIndex);
        }

        if (typeof value === "string" && value.length > 160) {
            return (
                <textarea
                    rows={4}
                    value={value}
                    onChange={(e) => handleContentChange(sectionIndex, contentIndex, e.target.value)}
                    style={textareaStyle}
                />
            );
        }

        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return (
                <input
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => handleContentChange(sectionIndex, contentIndex, e.target.value)}
                    style={inputStyle}
                />
            );
        }

        return renderFallbackEditor(value, sectionIndex, contentIndex, content.key);
    };

    return (
        <div
            style={{
                padding: "20px",
                fontFamily: "Arial, sans-serif",
                height: "100vh",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <h1 style={{ marginBottom: "20px" }}>Admin Panel</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "280px minmax(0, 1fr)",
                    gap: "20px",
                    alignItems: "stretch",
                    height: "calc(100vh - 90px)",
                }}
            >
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px",
                        background: "#fafafa",
                        overflowY: "auto",
                        minHeight: 0,
                    }}
                >
                    <h2 style={{ marginBottom: "15px", fontSize: "18px" }}>
                        websiteCMS Belgeleri
                    </h2>

                    <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                        <button
                            onClick={() => setPanelMode("content")}
                            style={{
                                padding: "10px 12px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background: panelMode === "content" ? "#e6f4ff" : "#fff",
                                fontWeight: panelMode === "content" ? "bold" : "normal",
                            }}
                        >
                            İçerik Düzenle
                        </button>

                        <button
                            onClick={() => setPanelMode("titles")}
                            style={{
                                padding: "10px 12px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background: panelMode === "titles" ? "#e6f4ff" : "#fff",
                                fontWeight: panelMode === "titles" ? "bold" : "normal",
                            }}
                        >
                            Title Settings
                        </button>
                    </div>

                    {pages.length === 0 ? (
                        <p>Kayıt bulunamadı.</p>
                    ) : (
                        pages.map((page, index) => (
                            <div
                                key={index}
                                onClick={() => handlePageClick(page.name)}
                                style={{
                                    padding: "10px 12px",
                                    marginBottom: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    background: selectedPageName === page.name ? "#e6f4ff" : "#fff",
                                    fontWeight: selectedPageName === page.name ? "bold" : "normal",
                                }}
                            >
                                {page.name}
                            </div>
                        ))
                    )}
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px",
                        background: "#fff",
                        minHeight: 0,
                        overflowY: "auto",
                    }}
                >
                    {!selectedPage && !loading && <p>Soldan bir belge seç.</p>}
                    {loading && <p>Yükleniyor...</p>}

                    {selectedPage && !loading && (
                        <>
                            <div
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 5,
                                    background: "#fff",
                                    padding: "14px 16px",
                                    marginBottom: "18px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "16px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontSize: "22px",
                                                fontWeight: 700,
                                                color: "#111827",
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {panelMode === "titles"
                                                ? `${selectedPageName} - Title Settings`
                                                : selectedPageName}
                                        </h2>

                                        <div
                                            style={{
                                                marginTop: "6px",
                                                fontSize: "13px",
                                                color: "#6b7280",
                                            }}
                                        >
                                            {panelMode === "titles"
                                                ? "Alan başlıklarını düzenliyorsun"
                                                : "İçerikleri düzenliyorsun"}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            ...primaryButtonStyle,
                                            background: saving ? "#999" : "#02acfa",
                                            cursor: saving ? "not-allowed" : "pointer",
                                            minWidth: "140px",
                                            height: "42px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "10px",
                                            boxShadow: saving
                                                ? "none"
                                                : "0 6px 18px rgba(2, 172, 250, 0.25)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {saving ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                </div>
                            </div>

                            {editableSections.length > 0 ? (
                                editableSections.map((section, sectionIndex) => (
                                    <div
                                        key={sectionIndex}
                                        style={{
                                            marginBottom: "20px",
                                            padding: "15px",
                                            border: "1px solid #eee",
                                            borderRadius: "8px",
                                            background: "#fafafa",
                                        }}
                                    >
                                        <h3 style={{ marginBottom: "15px" }}>Section: {section.name}</h3>

                                        {section.contents?.length > 0 ? (
                                            section.contents.map((content, contentIndex) => (
                                                <div
                                                    key={contentIndex}
                                                    style={{
                                                        marginBottom: "16px",
                                                        paddingBottom: "12px",
                                                        borderBottom: "1px solid #e5e5e5",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            display: "block",
                                                            fontWeight: "bold",
                                                            marginBottom: "8px",
                                                        }}
                                                    >
                                                        {getContentDisplayName(content)}
                                                    </label>

                                                    {panelMode === "titles" ? (
                                                        <div style={{ display: "grid", gap: "8px" }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Alan Türkçe başlık"
                                                                value={content.adminLabel?.tr || ""}
                                                                onChange={(e) =>
                                                                    handleContentAdminLabelChange(
                                                                        sectionIndex,
                                                                        contentIndex,
                                                                        "tr",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                style={inputStyle}
                                                            />

                                                            <input
                                                                type="text"
                                                                placeholder="Field English title"
                                                                value={content.adminLabel?.en || ""}
                                                                onChange={(e) =>
                                                                    handleContentAdminLabelChange(
                                                                        sectionIndex,
                                                                        contentIndex,
                                                                        "en",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                style={inputStyle}
                                                            />
                                                        </div>
                                                    ) : (
                                                        renderInput(content, sectionIndex, contentIndex)
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p>Bu section içinde içerik yok.</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Section bulunamadı.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
