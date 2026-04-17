import React, { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("siteLanguage") || "tr";
    });

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("siteLanguage", lang);
    };

    const value = useMemo(() => {
        return {
            language,
            changeLanguage,
        };
    }, [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }

    return context;
}