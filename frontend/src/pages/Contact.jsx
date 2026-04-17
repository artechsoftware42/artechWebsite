import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { sendContactMail } from "../services/mailService";
import { fetchJson } from "../utils/fetchJson";
import { useMemo } from "react";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((item) => item.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
};



const Contact = () => {
  const { language } = useLanguage();
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [contents, setContents] = useState([]);

  const embedMapUrl = useMemo(() => {
    return (
      contents.find((item) => item.key === "contactEmbedMapUrl")?.value || null
    );
  }, [contents]);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_URL}/api/pages/Contact`);
        if (!data) return;

        const contactSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "contact"
        );

        if (contactSection) {
          setContents(contactSection.contents || []);
        }
      } catch (error) {
        console.error("Contact verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchContactData();
  }, []);

  const getValue = (key, fallback = "") => {
    return getLocalizedValue(contents, key, language, fallback);
  };

  const maps = contents.find((item) => item.key === "contactMaps")?.value ?? [];

  const isSubmitDisabled = !kvkkChecked;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kvkkChecked) return;

    const form = e.target;

    const data = {
      name: form.name.value,
      surname: form.surname.value,
      phone: form.phone.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      await sendContactMail(data);
      alert(getValue("contactSuccessMessage", ""));
      form.reset();
      setKvkkChecked(false);
    } catch (err) {
      console.error("Mail hatası-front:", err);
      alert(getValue("contactErrorMessage", ""));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#e8e8e8] pt-[120px] pb-20 px-4">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0D0D0D] leading-tight">
          {getValue("contactTitle", "")}
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          {getValue("contactSubtitle", "")}
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-2 gap-10 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/30"
          >
            <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-8">
              {getValue("contactInfoTitle", "")}
            </h2>

            <div className="flex flex-col gap-10">
              <div className="flex items-start gap-4">
                <div className="text-3xl text-[#02acfa] mt-1">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0D0D0D]">
                    {getValue("contactAddressTitle", "")}
                  </h4>
                  <p className="text-lg text-gray-700 mt-2 whitespace-pre-line">
                    {getValue("contactAddress", "")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-3xl text-[#02acfa] mt-1">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0D0D0D]">
                    {getValue("contactEmailTitle", "")}
                  </h4>
                  <p className="text-lg text-gray-700 mt-2">
                    {contents.find((item) => item.key === "contactEmail")?.value ?? ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-3xl text-[#02acfa] mt-1">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0D0D0D]">
                    {getValue("contactPhoneTitle", "")}
                  </h4>
                  <p className="text-lg text-gray-700 mt-2">
                    {contents.find((item) => item.key === "contactPhone")?.value ?? ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-3xl text-[#02acfa] mt-1">
                  <FaMapLocationDot />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0D0D0D]">
                    {getValue("contactMapTitle", "")}
                  </h4>

                  <div className="flex flex-wrap gap-4 mt-2 text-lg font-medium">
                    {Array.isArray(maps) &&
                      maps.map((item, index) => (
                        <a
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-[#02acfa] transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0D0D0D] p-8 rounded-3xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              {getValue("contactFormTitle", "")}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    {getValue("contactNameLabel", "")}
                  </label>
                  <input
                    name="name"
                    className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#02acfa]"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    {getValue("contactSurnameLabel", "")}
                  </label>
                  <input
                    name="surname"
                    className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#02acfa]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  {getValue("contactPhoneLabel", "")}
                </label>
                <input
                  name="phone"
                  className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#02acfa]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  {getValue("contactEmailLabel", "")}
                </label>
                <input
                  name="email"
                  className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#02acfa]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  {getValue("contactMessageLabel", "")}
                </label>
                <textarea
                  name="message"
                  rows="5"
                  className="w-full p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#02acfa] resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kvkkChecked}
                    onChange={() => setKvkkChecked(!kvkkChecked)}
                    className="accent-[#02acfa]"
                  />

                  {!kvkkChecked ? (
                    <span>{getValue("contactPrivacyShortText", "")}</span>
                  ) : (
                    <span>
                      {getValue("contactPrivacyApprovalPrefix", "")}{" "}
                      <Link
                        to="/kvkk"
                        className="text-[#02acfa] hover:underline"
                      >
                        {getValue("contactPrivacyLinkText", "")}
                      </Link>{" "}
                      {getValue("contactPrivacyApprovalSuffix", "")}
                    </span>
                  )}
                </label>

                <motion.button
                  type="submit"
                  whileHover={!isSubmitDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitDisabled ? { scale: 0.95 } : {}}
                  disabled={isSubmitDisabled}
                  className={`px-7 py-3 rounded-xl text-sm shadow-md transition ${isSubmitDisabled
                    ? "cursor-not-allowed bg-gray-400 text-white"
                    : "cursor-pointer bg-[#02acfa] text-white"
                    }`}
                >
                  {getValue("contactFormButton", "")}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>

        <div className="relative group w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/30">
          {embedMapUrl ? (
            <iframe
              title="map"
              src={embedMapUrl}
              className="w-full h-full border-0 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white text-gray-500">
              Harita yüklenemedi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;