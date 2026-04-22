import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { fetchJson } from "../utils/fetchJson";
import { sendOfferMail } from "../services/offerMailService";

const getLocalizedValue = (contents, key, language, fallback) => {
  const found = contents.find((item) => item.key === key)?.value;

  if (found && typeof found === "object" && !Array.isArray(found)) {
    return found[language] ?? fallback;
  }

  return found ?? fallback;
};

function OfferPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [contents, setContents] = useState([]);

  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [kvkkApproved, setKvkkApproved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showError, setShowError] = useState(false);
  const [companyError, setCompanyError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [detailsError, setDetailsError] = useState(false);
  const [kvkkError, setKvkkError] = useState(false);

  useEffect(() => {
    const fetchOfferData = async () => {
      try {
        const data = await fetchJson(
          `${import.meta.env.VITE_API_URL}/api/pages/OfferPage`
        );
        if (!data) return;

        const offerSection = data.sections?.find(
          (section) => section.name?.toLowerCase() === "offer"
        );

        if (offerSection) {
          setContents(offerSection.contents || []);
        }
      } catch (error) {
        console.error("OfferPage verisi alınamadı:", error);
        setContents([]);
      }
    };

    fetchOfferData();
  }, []);

  const getValue = (key, fallback = "") => {
    return getLocalizedValue(contents, key, language, fallback);
  };

  const options =
    contents.find((item) => item.key === "offerOptions")?.value?.[language] ||
    [];

  const totalSteps = 5;
  const progressWidth = `${(step / totalSteps) * 100}%`;

  const handleBack = () => navigate(-1);
  const handleLogoClick = () => navigate("/");
  const handleGoHome = () => navigate("/");

  const handleSelect = (option) => {
    setSelectedOption(option);
    setShowError(false);
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const isValidPhone = (value) => {
    const cleaned = value.replace(/\s+/g, "").trim();
    return /^(\+90|0)?5\d{9}$/.test(cleaned);
  };

  const goToPrevStep = () => {
    if (step <= 1 || isSubmitted) return;
    setStep((prev) => prev - 1);
  };

  const goToNextStep = () => {
    if (isSubmitted) return;

    if (step === 1) {
      if (!selectedOption) {
        setShowError(true);
        return;
      }

      setShowError(false);
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!companyName.trim()) {
        setCompanyError(true);
        return;
      }

      setCompanyError(false);
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!isValidEmail(email)) {
        setEmailError(true);
        return;
      }

      setEmailError(false);
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!isValidPhone(phone)) {
        setPhoneError(true);
        return;
      }

      setPhoneError(false);
      setStep(5);
      return;
    }

    if (step === 5) {
      if (!details.trim()) {
        setDetailsError(true);
        setKvkkError(false);
        return;
      }

      setDetailsError(false);

      if (!kvkkApproved) {
        setKvkkError(true);
        return;
      }

      setKvkkError(false);

      try {
        await sendOfferMail({
          selectedOption,
          companyName,
          email,
          phone,
          details,
        });

        setIsSubmitted(true);
      } catch (error) {
        console.error("Offer form hatası:", error);
        alert("Teklif formu gönderilemedi.");
      }

      return;
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToNextStep();
    }
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      goToNextStep();
    }
  };

  useEffect(() => {
    const handleGlobalEnter = (e) => {
      if (e.key !== "Enter" || isSubmitted) return;

      const tag = e.target?.tagName?.toLowerCase();

      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "button"
      ) {
        return;
      }

      e.preventDefault();
      goToNextStep();
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [
    step,
    selectedOption,
    companyName,
    email,
    phone,
    details,
    kvkkApproved,
    isSubmitted,
  ]);

  const stepMotionProps = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -18 },
    transition: { duration: 0.28, ease: "easeOut" },
  };

  return (
    <>
      <style>{`
        @property --sweep-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes sweepBorder {
          0% { --sweep-angle: 0deg; }
          100% { --sweep-angle: 360deg; }
        }

        .offer-border-animate {
          animation: sweepBorder 0.48s ease forwards;
        }

        .offer-border-static {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          border: 1.5px solid rgba(255, 255, 255, 0.10);
        }

        .offer-border-layer {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 1.5px;
          background: conic-gradient(
            from 225deg,
            #02acfa 0deg,
            #02acfa var(--sweep-angle),
            rgba(255,255,255,0.10) var(--sweep-angle),
            rgba(255,255,255,0.10) 360deg
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .offer-textarea-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .offer-textarea-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .offer-textarea-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
        }

        .offer-textarea-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
        }
      `}</style>

      <div className="min-h-screen bg-[#0d0d0d] text-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between pt-6 sm:pt-8">
            <button
              onClick={handleLogoClick}
              className="cursor-pointer transition-opacity duration-300 hover:opacity-85"
              aria-label="Anasayfaya git"
            >
              <img
                src={getValue("offerLogo", "/images/l1.png")}
                alt="Logo"
                className="h-10 w-auto select-none sm:h-12 md:h-14"
                draggable={false}
              />
            </button>

            <button
              onClick={handleBack}
              className="group flex h-11 w-11 items-center justify-center bg-transparent cursor-pointer"
              aria-label="Geri dön"
            >
              <X className="h-6 w-6 text-white transition-all duration-300 group-hover:rotate-90 group-hover:text-[#02acfa]" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-2xl text-center"
              >
                <div className="mb-5 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#02acfa]/30 bg-[#02acfa]/10">
                    <Check className="h-8 w-8 text-[#02acfa]" strokeWidth={3} />
                  </div>
                </div>

                <h1 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
                  {getValue("offerSuccessTitle", "Teşekkürler")}
                </h1>

                <p className="mx-auto max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                  {getValue(
                    "offerSuccessText",
                    "Talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz"
                  )}
                </p>

                <div className="mt-8">
                  <button
                    onClick={handleGoHome}
                    className="rounded-xl bg-[#02acfa] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:text-base cursor-pointer"
                  >
                    {getValue("offerBackToHomeButton", "Anasayfa")}
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="w-full max-w-5xl">
                  <AnimatePresence mode="wait">
                    <motion.div key={step} {...stepMotionProps}>
                      {step === 1 && (
                        <>
                          <h1 className="mb-10 text-left text-2xl font-semibold">
                            {getValue("offerStep1Title", "")}{" "}
                            <span className="text-[#02acfa]">*</span>
                          </h1>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {options.map((option) => {
                              const isSelected = selectedOption === option;

                              return (
                                <button
                                  key={option}
                                  onClick={() => handleSelect(option)}
                                  className="relative min-h-[84px] rounded-2xl text-left cursor-pointer"
                                >
                                  {!isSelected && <div className="offer-border-static" />}
                                  {isSelected && (
                                    <div className="offer-border-layer offer-border-animate" />
                                  )}

                                  <div className="relative h-full rounded-2xl bg-white/5 px-5 py-5">
                                    {isSelected && (
                                      <Check className="absolute right-3 top-3 h-5 w-5 text-[#02acfa]" />
                                    )}
                                    <span className="text-white/90">{option}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="relative mt-4 h-0">
                            {showError && (
                              <p className="absolute left-0 top-0 text-red-500">
                                {getValue(
                                  "offerOptionRequiredError",
                                  "Lütfen bir alan seçin."
                                )}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <h1 className="mb-10 text-left text-2xl font-semibold">
                            {getValue("offerStep2Title", "")}{" "}
                            <span className="text-[#02acfa]">*</span>
                          </h1>

                          <div className="relative w-full max-w-xl">
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => {
                                setCompanyName(e.target.value);
                                setCompanyError(false);
                              }}
                              onKeyDown={handleInputKeyDown}
                              placeholder={getValue(
                                "offerCompanyPlaceholder",
                                "Şirket veya marka adı"
                              )}
                              className="peer w-full bg-transparent py-3 text-white placeholder:text-white/40 outline-none"
                            />

                            <div className="h-[1px] w-full bg-white/20" />
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                            {companyError && (
                              <p className="absolute left-0 top-full mt-2 text-red-500">
                                {getValue(
                                  "offerCompanyRequiredError",
                                  "Şirket veya marka adı gerekli."
                                )}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <h1 className="mb-10 text-left text-2xl font-semibold">
                            {getValue("offerStep3Title", "")}{" "}
                            <span className="text-[#02acfa]">*</span>
                          </h1>

                          <div className="relative w-full max-w-xl">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(false);
                              }}
                              onKeyDown={handleInputKeyDown}
                              placeholder={getValue(
                                "offerEmailPlaceholder",
                                "ornek@firma.com"
                              )}
                              className="peer w-full bg-transparent py-3 text-white placeholder:text-white/40 outline-none"
                            />

                            <div className="h-[1px] w-full bg-white/20" />
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                            {emailError && (
                              <p className="absolute left-0 top-full mt-2 text-red-500">
                                {getValue(
                                  "offerEmailRequiredError",
                                  "Geçerli bir e-posta giriniz."
                                )}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {step === 4 && (
                        <>
                          <h1 className="mb-10 text-left text-2xl font-semibold">
                            {getValue("offerStep4Title", "")}{" "}
                            <span className="text-[#02acfa]">*</span>
                          </h1>

                          <div className="relative w-full max-w-xl">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                setPhoneError(false);
                              }}
                              onKeyDown={handleInputKeyDown}
                              placeholder={getValue(
                                "offerPhonePlaceholder",
                                "+90 5xx xxx xx xx"
                              )}
                              className="peer w-full bg-transparent py-3 text-white placeholder:text-white/40 outline-none"
                            />

                            <div className="h-[1px] w-full bg-white/20" />
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 peer-focus:w-full" />

                            {phoneError && (
                              <p className="absolute left-0 top-full mt-2 text-red-500">
                                {getValue(
                                  "offerPhoneRequiredError",
                                  "Geçerli bir telefon numarası giriniz."
                                )}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {step === 5 && (
                        <>
                          <h1 className="mb-10 text-left text-2xl font-semibold">
                            {getValue("offerStep5Title", "")}{" "}
                            <span className="text-[#02acfa]">*</span>
                          </h1>

                          <div className="relative w-full max-w-2xl">
                            <textarea
                              value={details}
                              onChange={(e) => {
                                setDetails(e.target.value);
                                setDetailsError(false);
                                if (e.target.value.trim()) {
                                  setKvkkError(false);
                                }
                              }}
                              onKeyDown={handleTextareaKeyDown}
                              placeholder={getValue(
                                "offerDetailsPlaceholder",
                                "kapsam, hedefler, zaman"
                              )}
                              rows={6}
                              className="offer-textarea-scroll w-full resize-none overflow-y-auto bg-transparent py-3 text-white placeholder:text-white/40 outline-none"
                            />

                            <div className="mt-5 h-[1px] w-full bg-white/20" />
                            <div className="absolute bottom-[0px] left-0 h-[2px] w-0 bg-[#02acfa] transition-all duration-300 focus-within:w-full" />

                            <p className="mt-3 text-xs text-white/45">
                              {getValue(
                                "offerDetailsHint",
                                "Shift ⇧ + Enter ↵ satır atlar."
                              )}
                            </p>

                            <label className="mt-4 flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={kvkkApproved}
                                onChange={(e) => {
                                  setKvkkApproved(e.target.checked);
                                  setKvkkError(false);
                                }}
                                className="mt-1 h-4 w-4 accent-[#02acfa]"
                              />

                              <span className="text-sm text-white/80">
                                <button
                                  type="button"
                                  onClick={() => navigate("/kvkk")}
                                  className="text-[#02acfa] transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                                >
                                  {getValue("offerKvkkLinkText", "KVKK Aydınlatma Metni")}
                                </button>
                                {getValue(
                                  "offerKvkkTextSuffix",
                                  "'ni okudum, kişisel verilerimin işlenmesini kabul ediyorum."
                                )}
                              </span>
                            </label>

                            {detailsError && (
                              <p className="absolute left-0 top-full mt-2 text-red-500">
                                {getValue(
                                  "offerDetailsRequiredError",
                                  "Lütfen talebiniz hakkında biraz daha detay yazın."
                                )}
                              </p>
                            )}

                            {kvkkError && (
                              <p className="absolute left-0 top-full mt-2 text-red-500">
                                {getValue(
                                  "offerKvkkRequiredError",
                                  "KVKK onayını işaretlemeniz gerekir."
                                )}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                    <span className="text-xs text-white/45">
                      {getValue("offerEnterHint", "Enter ↵’a bas")}
                    </span>

                    <button
                      onClick={goToNextStep}
                      className="rounded-xl bg-[#02acfa] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                    >
                      {step === 5
                        ? getValue("offerSubmitButton", "Gönder")
                        : getValue("offerNextButton", "İlerle")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-5xl pb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-white/35">
                    {step}/{totalSteps}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      disabled={step === 1}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                        step === 1
                          ? "cursor-not-allowed bg-white/5 text-white/20"
                          : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-label="Önceki adım"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={step === totalSteps}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                        step === totalSteps
                          ? "cursor-not-allowed bg-white/5 text-white/20"
                          : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-label="Sonraki adıma git"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="h-[3px] w-full rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#02acfa] transition-all duration-500"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default OfferPage;