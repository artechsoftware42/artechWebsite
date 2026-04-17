import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { sendCareerMail } from "../services/careerMailService";
import { fetchJson } from "../utils/fetchJson";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((item) => item.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
};

export default function Career() {
  const { language } = useLanguage();

  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    coverLetter: "",
    file: null,
    position: "",
    employmentType: "",
    degree: "",
    graduationStatus: "",
    school: "",
    department: "",
  });

  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        const data = await fetchJson(
          `${import.meta.env.VITE_API_URL}/api/pages/Career`
        );
        if (!data) return;

        const careerSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "career"
        );

        if (careerSection) {
          setContents(careerSection.contents || []);
        }
      } catch (error) {
        console.error("Career verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchCareerData();
  }, []);

  const getValue = (key, fallback = "") => {
    return getLocalizedValue(contents, key, language, fallback);
  };

  const positions =
    contents.find((item) => item.key === "careerPositions")?.value?.[language] ||
    [];

  const employmentTypes =
    contents.find((item) => item.key === "careerEmploymentTypes")?.value?.[
    language
    ] || [];

  const degrees =
    contents.find((item) => item.key === "careerDegrees")?.value?.[language] ||
    [];

  const graduationStatuses =
    contents.find((item) => item.key === "careerGraduationStatuses")?.value?.[
    language
    ] || [];

  const fullText = getValue("careerTypedText", "");

  useEffect(() => {
    let i = 0;
    setTypedText("");

    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 20);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [fullText]);

  const requiredFields = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "coverLetter",
    "position",
    "employmentType",
    "degree",
    "graduationStatus",
    "school",
    "department",
    "file",
  ];

  const validateForm = () => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (field === "file") {
        if (!formData.file) newErrors.file = true;
        return;
      }

      if (!String(formData[field] || "").trim()) {
        newErrors[field] = true;
      }
    });

    if (!kvkkChecked) {
      newErrors.kvkk = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (fieldName) => {
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, file }));
      clearError("file");
      return;
    }

    if (file) {
      setFormData((prev) => ({ ...prev, file: null }));
      setErrors((prev) => ({ ...prev, file: true }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    try {
      await sendCareerMail(formData);
      alert(getValue("careerSuccessMessage", ""));
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        coverLetter: "",
        file: null,
        position: "",
        employmentType: "",
        degree: "",
        graduationStatus: "",
        school: "",
        department: "",
      });
      setKvkkChecked(false);
      setErrors({});
    } catch (error) {
      console.error("Career form hatası:", error);
      alert(getValue("careerErrorMessage", ""));
    }
  };

  const getInputClass = (fieldName, extra = "") =>
    `w-full bg-transparent border rounded-xl px-3 py-3 text-sm transition outline-none ${errors[fieldName]
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-gray-300 focus:border-[#02acfa] focus:ring-2 focus:ring-[#02acfa]/30"
    } ${extra}`;

  const renderDropdown = (label, value, list, keyName) => (
    <div className="relative">
      <label className="block mb-1 text-xs text-gray-600">{label}</label>
      <div
        onClick={() =>
          setDropdownOpen(dropdownOpen === keyName ? null : keyName)
        }
        className={`flex justify-between items-center cursor-pointer rounded-xl px-3 py-3 bg-white text-sm border transition ${errors[keyName]
          ? "border-red-500 ring-2 ring-red-500/10"
          : "border-gray-300"
          }`}
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || getValue("careerSelectPlaceholder", "Seçiniz")}
        </span>
        <FaChevronDown
          className={`transition-transform ${dropdownOpen === keyName ? "rotate-180" : ""
            }`}
        />
      </div>

      <AnimatePresence>
        {dropdownOpen === keyName && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
          >
            {list.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, [keyName]: item }));
                  clearError(keyName);
                  setDropdownOpen(null);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {item}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const isSubmitDisabled = !kvkkChecked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen overflow-hidden bg-[#E8E8E8] px-4 py-16 pt-[140px] md:px-8 md:pt-[160px] lg:pt-[180px]"
    >
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-[-80px] left-[-80px] h-[250px] w-[250px] rounded-full bg-[#02acfa]/30 blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute right-[-80px] bottom-[-100px] h-[250px] w-[250px] rounded-full bg-purple-400/20 blur-[100px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center md:mb-16"
        >
          <h1 className="mb-4 text-4xl font-semibold md:text-5xl">
            {getValue("careerTitle", "")}{" "}
            <span className="text-[#02acfa]">
              {getValue("careerTitleAccent", "")}
            </span>
          </h1>

          <p className="relative mx-auto min-h-[90px] max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {typedText}
            <span className="invisible absolute top-0 left-0">{fullText}</span>
            <span className="ml-1">{showCursor ? "|" : " "}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#3B3B3B] md:text-xl">
                {getValue("careerContactSectionTitle", "")}
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    {getValue("careerFirstNameLabel", "")}
                  </label>
                  <input
                    name="firstName"
                    placeholder={getValue("careerFirstNamePlaceholder", "")}
                    value={formData.firstName}
                    onChange={handleChange}
                    className={getInputClass("firstName")}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    {getValue("careerLastNameLabel", "")}
                  </label>
                  <input
                    name="lastName"
                    placeholder={getValue("careerLastNamePlaceholder", "")}
                    value={formData.lastName}
                    onChange={handleChange}
                    className={getInputClass("lastName")}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    {getValue("careerPhoneLabel", "")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={getValue("careerPhonePlaceholder", "")}
                    value={formData.phone}
                    onChange={handleChange}
                    className={getInputClass("phone")}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    {getValue("careerEmailLabel", "")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={getValue("careerEmailPlaceholder", "")}
                    value={formData.email}
                    onChange={handleChange}
                    className={getInputClass("email")}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#3B3B3B] md:text-xl">
                {getValue("careerEducationSectionTitle", "")}
              </h3>

              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderDropdown(
                  getValue("careerDegreeLabel", ""),
                  formData.degree,
                  degrees,
                  "degree"
                )}
                {renderDropdown(
                  getValue("careerGraduationStatusLabel", ""),
                  formData.graduationStatus,
                  graduationStatuses,
                  "graduationStatus"
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <input
                  name="school"
                  placeholder={getValue("careerSchoolPlaceholder", "")}
                  value={formData.school}
                  onChange={handleChange}
                  className={getInputClass("school")}
                />
                <input
                  name="department"
                  placeholder={getValue("careerDepartmentPlaceholder", "")}
                  value={formData.department}
                  onChange={handleChange}
                  className={getInputClass("department")}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#3B3B3B] md:text-xl">
                {getValue("careerMoreSectionTitle", "")}
              </h3>

              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderDropdown(
                  getValue("careerPositionLabel", ""),
                  formData.position,
                  positions,
                  "position"
                )}
                {renderDropdown(
                  getValue("careerEmploymentTypeLabel", ""),
                  formData.employmentType,
                  employmentTypes,
                  "employmentType"
                )}
              </div>

              <textarea
                name="coverLetter"
                rows={5}
                placeholder={getValue("careerCoverLetterPlaceholder", "")}
                value={formData.coverLetter}
                onChange={handleChange}
                className={getInputClass("coverLetter", "resize-none")}
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-6 text-center text-sm transition ${errors.file
                ? "border-red-500 bg-red-50/40"
                : dragOver
                  ? "border-[#02acfa] bg-[#02acfa]/10"
                  : "border-gray-300"
                }`}
            >
              {formData.file
                ? formData.file.name
                : getValue("careerUploadText", "")}

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="mt-2 block cursor-pointer text-[#02acfa]"
              >
                {getValue("careerUploadButtonText", "")}
              </label>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div
                className={`flex items-center gap-2 text-xs ${errors.kvkk ? "text-red-500" : "text-gray-600"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={kvkkChecked}
                  onChange={() => {
                    const nextValue = !kvkkChecked;
                    setKvkkChecked(nextValue);

                    if (nextValue) {
                      clearError("kvkk");
                    }
                  }}
                  className="accent-[#02acfa]"
                />

                <span>
                  {getValue("careerPrivacyPrefix", "")}
                  <Link to="/kvkk" className="text-[#02acfa]">
                    {" "}
                    {getValue("careerPrivacyLinkText", "")}
                  </Link>
                  {getValue("careerPrivacySuffix", "")}
                </span>
              </div>

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
                {getValue("careerSubmitButtonText", "Gönder")}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}