import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage("tr")}
                className={`px-3 py-1 rounded ${language === "tr" ? "bg-[#02acfa] text-white" : "bg-gray-200 text-black"
                    }`}
            >
                TR
            </button>

            <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 rounded ${language === "en" ? "bg-[#02acfa] text-white" : "bg-gray-200 text-black"
                    }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;