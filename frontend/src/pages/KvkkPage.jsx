"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchJson } from "../utils/fetchJson";

const getValue = (contents, key, fallback) => {
  return contents?.find((item) => item.key === key)?.value ?? fallback;
};

export default function KvkkPage() {
  const [activeTab, setActiveTab] = useState("kvkk");
  const API_BASE = import.meta.env.VITE_API_URL;

  const [kvkkData, setKvkkData] = useState([]);
  const [cookieData, setCookieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/api/pages/Kvkk`);
        if (!data) return;

        const sections = data.sections || [];

        const kvkk = sections.find((s) => s.name === "kvkk");
        const cookie = sections.find((s) => s.name === "cookie");

        setKvkkData(kvkk?.contents || []);
        setCookieData(cookie?.contents || []);
      } catch (err) {
        console.error("KVKK fetch error:", err);
      }
    };

    fetchData();
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 sm:px-6 md:px-10 pt-36 sm:pt-40 md:pt-44 pb-16">
      <div className="max-w-5xl mx-auto text-center mb-14 sm:mb-16 md:mb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
          KVKK & Gizlilik
        </h1>
        <p className="mt-5 text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Artech Software olarak, kişisel verilerinizin gizliliğini ve güvenliğini en üst seviyede
          korumayı taahhüt ederiz. Bu kapsamda tüm veri işleme faaliyetlerimizi yürürlükteki mevzuata
          uygun şekilde gerçekleştirmekteyiz.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center gap-6 border-b border-gray-700 mb-10 relative">
          <TabButton
            label="KVKK Aydınlatma Metni"
            isActive={activeTab === "kvkk"}
            onClick={() => setActiveTab("kvkk")}
          />

          <TabButton
            label="Çerez Politikası"
            isActive={activeTab === "cookie"}
            onClick={() => setActiveTab("cookie")}
          />
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#181818] p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl text-gray-300 text-sm sm:text-base leading-relaxed space-y-6"
        >
          {activeTab === "kvkk"
            ? <KvkkContent data={kvkkData} />
            : <CookieContent data={cookieData} />
          }
        </motion.div>
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer pb-3 text-sm sm:text-base"
    >
      <span className={isActive ? "text-white" : "text-gray-400"}>
        {label}
      </span>

      {isActive && (
        <motion.div
          layoutId="underline"
          className="absolute left-0 bottom-0 h-[2px] w-full bg-[#02acfa]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

function KvkkContent({ data }) {
  return (
    <>
      <h2 className="text-xl sm:text-2xl text-white font-semibold">
        KVKK Aydınlatma Metni
      </h2>

      <p>{getValue(data, "kvkk_intro", "")}</p>
      <p>{getValue(data, "kvkk_intro_2", "")}</p>

      <h3 className="text-white font-medium">1. İşlenen Kişisel Veriler</h3>
      <p>{getValue(data, "kvkk_data", "")}</p>

      <h3 className="text-white font-medium">2. Amaçlar</h3>
      <p>{getValue(data, "kvkk_purpose", "")}</p>

      <h3 className="text-white font-medium">3. Aktarım</h3>
      <p>{getValue(data, "kvkk_transfer", "")}</p>

      <h3 className="text-white font-medium">4. Toplama</h3>
      <p>{getValue(data, "kvkk_collection", "")}</p>

      <h3 className="text-white font-medium">5. Haklar</h3>
      <p>{getValue(data, "kvkk_rights", "")}</p>
    </>
  );
}

function CookieContent({ data }) {
  return (
    <>
      <h2 className="text-xl sm:text-2xl text-white font-semibold">
        Çerez Politikası
      </h2>

      <p>{getValue(data, "cookie_intro", "")}</p>

      <h3 className="text-white font-medium">1. Çerez Nedir?</h3>
      <p>{getValue(data, "cookie_definition", "")}</p>

      <h3 className="text-white font-medium">2. Türler</h3>
      <p>{getValue(data, "cookie_types", "")}</p>

      <h3 className="text-white font-medium">3. Amaç</h3>
      <p>{getValue(data, "cookie_purpose", "")}</p>

      <h3 className="text-white font-medium">4. Kontrol</h3>
      <p>{getValue(data, "cookie_control", "")}</p>
    </>
  );
}