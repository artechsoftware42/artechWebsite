"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LanguageContextType = {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

const STORAGE_KEY = "artech_language";

function isValidLanguage(value: string | null): value is LanguageCode {
    return value === "tr" || value === "en" || value === "fr" || value === "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>("tr");
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem(STORAGE_KEY);

        if (isValidLanguage(savedLanguage)) {
            setLanguageState(savedLanguage);
        }

        setIsReady(true);
    }, []);

    const setLanguage = (newLanguage: LanguageCode) => {
        setLanguageState(newLanguage);
        localStorage.setItem(STORAGE_KEY, newLanguage);
    };

    if (!isReady) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
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