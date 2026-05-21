"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiMapPin,
  FiMaximize2,
  FiTarget,
  FiX,
} from "react-icons/fi";

import { useLanguage } from "@/context/LanguageContext";

type LanguageCode = "tr" | "en" | "fr" | "ru";

type LocalizedText = Partial<Record<LanguageCode, string>>;
type LocalizedStringArray = Partial<Record<LanguageCode, string[]>>;

type MaybeLocalizedText = string | LocalizedText;
type MaybeLocalizedArray = string[] | LocalizedStringArray;

type ProjectItem = {
  id: number;
  slug: string;
  categoryKey: string;
  type: MaybeLocalizedText;
  company: MaybeLocalizedText;
  description: MaybeLocalizedText;
  year: string;
  primaryImage: string;
  secondaryImage: string;

  sector?: MaybeLocalizedText;
  duration?: MaybeLocalizedText;
  location?: MaybeLocalizedText;
  services?: MaybeLocalizedArray;
  technologies?: string[];
  result?: MaybeLocalizedText;
  projectUrl?: string;
  galleryImages?: string[];
};

type ProjectDetailPageProps = {
  project: ProjectItem;
  relatedProjects?: ProjectItem[];
};

type GalleryImage = {
  id: number;
  image: string;
};

function normalizeLanguage(language: string): LanguageCode {
  const normalized = language.toLowerCase();

  if (normalized === "tr") return "tr";
  if (normalized === "en") return "en";
  if (normalized === "fr") return "fr";
  if (normalized === "ru") return "ru";

  return "tr";
}

function getText(value: MaybeLocalizedText | undefined, language: string) {
  if (!value) return "";

  if (typeof value === "string") return value;

  const lang = normalizeLanguage(language);

  return value[lang] || value.tr || value.en || value.fr || value.ru || "";
}

function getTextArray(value: MaybeLocalizedArray | undefined, language: string) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  const lang = normalizeLanguage(language);

  return value[lang] || value.tr || value.en || value.fr || value.ru || [];
}

function getPublicMediaUrl(path: unknown): string {
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

export default function ProjectDetailPage({
  project,
  relatedProjects = [],
}: ProjectDetailPageProps) {
  const { language } = useLanguage();

  const heroRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const company = getText(project.company, language);
  const description = getText(project.description, language);
  const category = getText(project.type, language);
  const result = getText(project.result, language);
  const sector = getText(project.sector, language);
  const duration = getText(project.duration, language);
  const location = getText(project.location, language);
  const services = getTextArray(project.services, language);
  const technologies = project.technologies || [];

  const primaryImage = getPublicMediaUrl(project.primaryImage);
  const secondaryImage = getPublicMediaUrl(
    project.secondaryImage || project.primaryImage
  );

  const projectGalleryImages = useMemo(() => {
    const customGallery =
      project.galleryImages
        ?.map((image) => getPublicMediaUrl(image))
        .filter(Boolean) || [];

    if (customGallery.length > 0) {
      return customGallery;
    }

    return [primaryImage, secondaryImage, primaryImage, secondaryImage].filter(
      Boolean
    );
  }, [project.galleryImages, primaryImage, secondaryImage]);

  const isWebsiteProject = [
    String(category).toLocaleLowerCase("tr-TR"),
    String(project.categoryKey).toLocaleLowerCase("tr-TR"),
  ].some(
    (value) =>
      value.includes("website") ||
      value.includes("websitesi") ||
      value.includes("web sitesi")
  );

  const galleryImages = useMemo<GalleryImage[]>(
    () =>
      projectGalleryImages.map((image, index) => ({
        id: index + 1,
        image,
      })),
    [projectGalleryImages]
  );

  const activeLightboxImage =
    lightboxIndex !== null ? galleryImages[lightboxIndex] : null;

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"],
  });

  const heroTitleY = useTransform(heroProgress, [0, 1], [0, -120]);
  const heroTitleScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const heroTitleOpacity = useTransform(heroProgress, [0, 0.72], [1, 0.12]);

  const heroBackY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroBackScale = useTransform(heroProgress, [0, 1], [1, 1.12]);
  const heroBackOpacity = useTransform(heroProgress, [0, 0.75], [1, 0.2]);

  const heroSideY = useTransform(heroProgress, [0, 1], [0, -70]);
  const heroSideOpacity = useTransform(heroProgress, [0, 0.72], [1, 0.18]);

  const heroLineScale = useTransform(heroProgress, [0, 0.7], [1, 0.35]);
  const galleryY = useTransform(galleryProgress, [0, 1], [18, -18]);

  const marqueeItems = [
    ...technologies,
    ...services,
    ...technologies,
    ...services,
  ].filter(Boolean);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? prev : (prev + 1) % galleryImages.length
        );
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null
            ? prev
            : (prev - 1 + galleryImages.length) % galleryImages.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, galleryImages.length]);

  const showPrevImage = () => {
    setLightboxIndex((prev) =>
      prev === null
        ? prev
        : (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const showNextImage = () => {
    setLightboxIndex((prev) =>
      prev === null ? prev : (prev + 1) % galleryImages.length
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-[#111111] [overflow-x:clip]">
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden bg-[#050505] px-5 pt-32 text-white sm:px-8 md:px-10 lg:px-16 lg:pt-40"
      >
        <motion.div
          style={{
            y: heroBackY,
            scale: heroBackScale,
            opacity: heroBackOpacity,
          }}
          className="pointer-events-none absolute left-1/2 top-[52%] w-full -translate-x-1/2 -translate-y-1/2 select-none text-center text-[15vw] font-black uppercase leading-none tracking-[-0.095em] text-white/[0.055]"
        >
          {category}
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-[1520px] flex-col">
          <div className="relative mb-12 flex items-center justify-between pb-5">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-3 text-sm font-medium text-white/50 transition hover:text-[#02acfa]"
            >
              <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              Projelere dön
            </Link>

            <motion.span
              style={{ y: heroSideY, opacity: heroSideOpacity }}
              className="hidden text-[11px] uppercase tracking-[0.3em] text-white/35 sm:block"
            >
              {project.year} / {category}
            </motion.span>

            <SoftDivider tone="light" className="absolute bottom-0 left-0" />
          </div>

          <div className="grid flex-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              style={{
                y: heroTitleY,
                scale: heroTitleScale,
                opacity: heroTitleOpacity,
              }}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="origin-left"
            >
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.38em] text-[#02acfa]">
                Case Study
              </p>

              <h1 className="max-w-[1100px] font-['Everett','Everett_Fallback',sans-serif] text-[68px] font-semibold leading-[0.88] tracking-[-0.08em] text-white sm:text-[92px] md:text-[116px] lg:text-[140px]">
                {company}
              </h1>

              <motion.div
                style={{ scaleX: heroLineScale }}
                className="mt-9 h-px w-full max-w-[680px] origin-left bg-gradient-to-r from-white/5 via-white/15 to-transparent"
              />

              <p className="mt-9 max-w-[720px] text-base leading-8 text-white/62 sm:text-lg">
                {description}
                {result ? `. ${result}` : ""}
              </p>
            </motion.div>

            <motion.div
              style={{ y: heroSideY, opacity: heroSideOpacity }}
              initial={{ opacity: 0, y: 38 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: "easeOut" }}
              className="ml-auto w-full max-w-[500px]"
            >
              <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
                  Project Info
                </p>

                <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7">
                  <HeroInfo label="Yıl" value={project.year || "-"} />
                  <HeroInfo label="Süre" value={duration || "-"} />
                  <HeroInfo label="Kategori" value={category || "-"} />
                  <HeroInfo label="Durum" value="Tamamlandı" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative px-5 py-14 sm:px-8 md:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[1520px]">
          <div
            className={`relative grid gap-0 ${isWebsiteProject && project.projectUrl
              ? "md:grid-cols-4"
              : "md:grid-cols-3"
              }`}
          >
            <SoftDivider className="absolute left-0 top-0" />
            <SoftDivider className="absolute bottom-0 left-0" />

            <SimpleMeta
              icon={<FiTarget />}
              label="Sektör"
              value={sector || "-"}
              description="Projenin faaliyet alanı ve kullanım senaryosu."
            />

            <SimpleMeta
              icon={<FiMapPin />}
              label="Lokasyon"
              value={location || "-"}
              description="Hedef kitle ve operasyon bağlamı."
            />

            <SimpleMeta
              icon={<FiLayers />}
              label="Kategori"
              value={category || "-"}
              description="Yazılım türü ve proje kapsamı."
            />

            {isWebsiteProject && project.projectUrl && (
              <MetaProjectLink
                href={project.projectUrl}
                label="Proje Linki"
                value="Canlı Website"
                description="Projeyi görüntüleyin."
              />
            )}
          </div>
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section
          ref={galleryRef}
          className="relative px-5 pt-8 pb-24 sm:px-8 md:px-10 lg:px-16 lg:pb-32"
        >
          <div className="mx-auto max-w-[1520px]">
            <div className="relative mb-16 grid gap-8 pb-10 lg:grid-cols-[360px_1fr] lg:items-end">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-[#02acfa]">
                  Project Gallery
                </p>

                <h2 className="mt-5 max-w-[440px] font-['Everett','Everett_Fallback',sans-serif] text-3xl font-semibold leading-[1.06] tracking-[-0.045em] text-[#3b3e3f] sm:text-5xl">
                  Proje görselleri.
                </h2>
              </div>

              <SoftDivider className="absolute bottom-0 left-0" />
            </div>

            <motion.div
              style={{ y: galleryY }}
              className="mx-auto grid max-w-[1320px] gap-y-12 sm:grid-cols-2 sm:gap-x-24 lg:gap-x-32 lg:gap-y-16"
            >
              {galleryImages.map((item, index) => (
                <GalleryShowcaseItem
                  key={item.id}
                  image={item.image}
                  index={index}
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section className="relative px-5 py-20 sm:px-8 md:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1520px]">
          <div className="relative grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="lg:sticky lg:top-28 lg:h-fit lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: -38, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: false, margin: "-120px" }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="relative pt-6"
              >
                <SoftDivider className="absolute left-0 top-0" />

                <p className="text-[11px] uppercase tracking-[0.36em] text-black/38">
                  Project Anatomy
                </p>

                <h2 className="mt-5 max-w-[420px] font-['Everett','Everett_Fallback',sans-serif] text-4xl font-semibold leading-[1.03] tracking-[-0.055em] text-[#3b3e3f] md:text-6xl">
                  Projenin teknik omurgası.
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-black/55 md:text-base md:leading-8">
                  Proje; arayüz, sistem mimarisi ve kullanıcı akışı birlikte
                  düşünülerek geliştirildi.
                </p>

                {services.length > 0 && (
                  <div className="mt-9 space-y-4">
                    {services.map((service, index) => (
                      <motion.div
                        key={`${service}-${index}`}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.35 }}
                        transition={{ duration: 0.45, delay: index * 0.04 }}
                        className="relative flex items-center justify-between pb-4"
                      >
                        <span className="text-sm text-black/60">
                          {service}
                        </span>
                        <FiCheck className="text-[#02acfa]" />
                        <SoftDivider className="absolute bottom-0 left-0" />
                      </motion.div>
                    ))}
                  </div>
                )}

                <Link
                  href="/offer"
                  className="group mt-10 inline-flex items-center gap-3 border-b border-[#02acfa] pb-2 text-sm font-semibold text-[#0d0d0d] transition hover:text-[#02acfa]"
                >
                  Benzer bir proje başlat
                  <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                </Link>
              </motion.div>
            </aside>

            <motion.div
              initial={{ opacity: 0, x: 38, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: false, margin: "-120px" }}
              transition={{
                duration: 0.75,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="max-w-3xl"
            >
              <div className="space-y-24">
                <AnatomyBlock
                  kicker="01 / Planning"
                  title="İş akışı ve ekran mantığı"
                  text="Kullanıcının hangi ekranda hangi bilgiye ihtiyaç duyacağı çıkarıldı. Arayüz, yalnızca görsel görünüm üzerinden değil; kullanım senaryoları, aksiyon noktaları ve içerik önceliği üzerinden tasarlandı."
                />

                <AnatomyBlock
                  kicker="02 / Development"
                  title="Bileşen ve sistem yapısı"
                  text="Projede tekrar kullanılabilir bileşenler, net veri akışı ve genişletilebilir sayfa yapısı hedeflendi. Böylece ileride yeni modül, yeni ekran veya yeni servis eklemek daha kolay hale getirildi."
                />

                <AnatomyBlock
                  kicker="03 / Delivery"
                  title="Teslim edilebilir dijital ürün"
                  text="Son aşamada hız, responsive davranış, içerik okunabilirliği ve kullanım kolaylığı test edildi. Çıktı, yalnızca sunum görseli değil; gerçek kullanım için hazır bir dijital ürün olarak ele alındı."
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {marqueeItems.length > 0 && (
        <section className="relative select-none overflow-hidden py-10">
          <SoftDivider className="absolute left-0 top-0" />
          <SoftDivider className="absolute bottom-0 left-0" />

          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 24, ease: "linear", repeat: Infinity }}
            className="flex w-max select-none gap-8 whitespace-nowrap"
          >
            {marqueeItems.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="select-none text-[34px] font-semibold uppercase leading-none tracking-[-0.05em] text-black/[0.12] transition hover:text-[#02acfa] sm:text-[48px] md:text-[62px]"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="relative px-5 py-24 sm:px-8 md:px-10 lg:px-16 lg:py-32">
          <div className="relative mx-auto max-w-[1520px]">
            <div className="relative mb-14 flex flex-col gap-8 pb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-[#02acfa]">
                  Related Projects
                </p>

                <h2 className="max-w-3xl font-['Everett','Everett_Fallback',sans-serif] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#3b3e3f] sm:text-6xl">
                  Daha fazla proje keşfet.
                </h2>
              </div>

              <Link
                href="/projects"
                className="group relative inline-flex items-center gap-4 pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-black/55 transition hover:text-[#111111]"
              >
                <span className="relative overflow-hidden">
                  <span className="block transition-transform duration-500 ease-out group-hover:-translate-y-full">
                    Tüm Projeler
                  </span>

                  <span className="absolute left-0 top-full block text-[#02acfa] transition-transform duration-500 ease-out group-hover:-translate-y-full">
                    Keşfet
                  </span>
                </span>

                <span className="relative flex items-center">
                  <span className="h-px w-10 bg-black/25 transition-all duration-500 group-hover:w-16 group-hover:bg-[#02acfa]" />
                  <FiArrowUpRight className="ml-3 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45 group-hover:text-[#02acfa]" />
                </span>

                <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#02acfa] transition-transform duration-500 group-hover:scale-x-100" />
              </Link>

              <SoftDivider className="absolute bottom-0 left-0" />
            </div>

            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
              {relatedProjects.map((item) => (
                <RelatedProjectCard
                  key={item.slug}
                  project={item}
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {activeLightboxImage && lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black px-5 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(2,172,250,0.12),transparent_34%)]" />

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex(null);
              }}
              aria-label="Galeriyi kapat"
              className="group absolute right-6 top-6 z-20 cursor-pointer text-white/75 transition-all duration-300 hover:text-[#02acfa]"
            >
              <FiX className="text-4xl transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevImage();
              }}
              aria-label="Önceki görsel"
              className="absolute left-5 top-1/2 z-20 cursor-pointer -translate-y-1/2 text-white/65 transition hover:text-[#02acfa]"
            >
              <FiChevronLeft className="text-5xl" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              aria-label="Sonraki görsel"
              className="absolute right-5 top-1/2 z-20 cursor-pointer -translate-y-1/2 text-white/65 transition hover:text-[#02acfa]"
            >
              <FiChevronRight className="text-5xl" />
            </button>

            <motion.div
              key={activeLightboxImage.id}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -18 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={activeLightboxImage.image}
                alt={`Project gallery image ${lightboxIndex + 1}`}
                width={1400}
                height={1000}
                sizes="90vw"
                className="max-h-[82vh] w-auto max-w-[86vw] object-contain shadow-[0_40px_120px_rgba(0,0,0,0.38)]"
                priority
                unoptimized
              />

              <div className="mt-6 w-full max-w-[420px]">
                <div className="mb-3 flex items-center justify-between font-['Everett','Everett_Fallback',sans-serif] text-[11px] font-semibold uppercase tracking-[0.32em] text-white/65">
                  <span>{String(lightboxIndex + 1).padStart(2, "0")}</span>
                  <span>{String(galleryImages.length).padStart(2, "0")}</span>
                </div>

                <div className="relative h-px w-full overflow-hidden bg-white/18">
                  <motion.div
                    key={lightboxIndex}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: (lightboxIndex + 1) / galleryImages.length,
                    }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-0 h-full w-full origin-left bg-[#02acfa]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SimpleMeta({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden py-8 transition md:px-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-black/35 transition-all duration-500 group-hover:tracking-[0.42em] group-hover:text-[#02acfa]">
            {label}
          </p>

          <h3 className="mt-4 font-['Everett','Everett_Fallback',sans-serif] text-3xl font-semibold tracking-[-0.055em] text-[#3b3e3f] transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#111111]">
            {value}
          </h3>
        </div>

        <div className="text-2xl text-[#02acfa] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-6">
          {icon}
        </div>
      </div>

      <p className="mt-6 max-w-[320px] text-sm leading-7 text-black/50 transition-all duration-500 group-hover:translate-x-2 group-hover:text-black/70">
        {description}
      </p>

      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#02acfa] transition-all duration-700 group-hover:w-full" />

      <SoftDivider className="absolute bottom-0 left-0 md:hidden" />
      <SoftDivider
        direction="vertical"
        className="absolute right-0 top-0 hidden md:block"
      />
    </article>
  );
}

function MetaProjectLink({
  href,
  label,
  value,
  description,
}: {
  href: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden py-8 transition md:px-8">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block cursor-pointer"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-black/35 transition-all duration-500 group-hover:tracking-[0.42em] group-hover:text-[#02acfa]">
              {label}
            </p>

            <h3 className="mt-4 font-['Everett','Everett_Fallback',sans-serif] text-3xl font-semibold tracking-[-0.055em] text-[#3b3e3f] transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#111111]">
              {value}
            </h3>
          </div>

          <FiArrowUpRight className="text-2xl text-[#02acfa] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45" />
        </div>

        <p className="mt-6 max-w-[320px] text-sm leading-7 text-black/50 transition-all duration-500 group-hover:translate-x-2 group-hover:text-black/70">
          {description}
        </p>

        <div className="mt-8 inline-flex cursor-pointer items-center gap-4 pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-black/55 transition group-hover:text-[#111111]">
          <span className="relative overflow-hidden">
            <span className="block transition-transform duration-500 ease-out group-hover:-translate-y-full">
              Linke Git
            </span>

            <span className="absolute left-0 top-full block text-[#02acfa] transition-transform duration-500 ease-out group-hover:-translate-y-full">
              Yeni Sekme
            </span>
          </span>

          <span className="relative flex items-center">
            <span className="h-px w-10 bg-black/25 transition-all duration-500 group-hover:w-16 group-hover:bg-[#02acfa]" />
            <FiArrowUpRight className="ml-3 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45 group-hover:text-[#02acfa]" />
          </span>
        </div>
      </a>

      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#02acfa] transition-all duration-700 group-hover:w-full" />

      <SoftDivider className="absolute bottom-0 left-0 md:hidden" />
      <SoftDivider
        direction="vertical"
        className="absolute right-0 top-0 hidden md:block"
      />
    </article>
  );
}

function GalleryShowcaseItem({
  image,
  index,
  onClick,
}: {
  image: string;
  index: number;
  onClick: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="group w-full">
      <div className="mb-4 flex items-center gap-4 pl-1">
        <span className="font-['Everett','Everett_Fallback',sans-serif] text-xs font-semibold tracking-[0.34em] text-[#3b3e3f]/55 transition-colors duration-300 group-hover:text-[#02acfa]">
          {number}
        </span>

        <span className="h-px w-12 bg-gradient-to-r from-[#3b3e3f]/40 to-transparent transition-all duration-500 group-hover:w-20 group-hover:from-[#02acfa]" />
      </div>

      <button
        type="button"
        onClick={onClick}
        aria-label={`Galeri görseli ${number}`}
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[30px] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.14)] transition-transform duration-500 ease-out hover:-translate-y-2"
      >
        <Image
          src={image}
          alt={`Project gallery image ${number}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          unoptimized
        />

        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

        <div className="absolute right-5 top-5 cursor-pointer text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#02acfa]">
          <FiMaximize2 className="text-xl" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent opacity-70" />
      </button>
    </div>
  );
}

function RelatedProjectCard({
  project,
  language,
}: {
  project: ProjectItem;
  language: string;
}) {
  const category = getText(project.type, language);
  const company = getText(project.company, language);
  const description = getText(project.description, language);
  const primaryImage = getPublicMediaUrl(project.primaryImage);
  const secondaryImage = getPublicMediaUrl(
    project.secondaryImage || project.primaryImage
  );

  if (!project.slug || !primaryImage || !secondaryImage) return null;

  return (
    <motion.div
      layout
      className="group/card flex w-full cursor-pointer flex-col items-center"
    >
      <motion.div
        whileHover={{ y: -14 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="
          relative
          h-[420px]
          w-full
          max-w-[520px]
          overflow-hidden
          rounded-3xl
          shadow-2xl
          sm:h-[500px]
          md:h-[580px]
          xl:h-[650px]
        "
      >
        <Image
          src={primaryImage}
          alt={company}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
          className="object-cover transition-all duration-500 group-hover/card:scale-110 group-hover/card:opacity-0"
          unoptimized
        />

        <Image
          src={secondaryImage}
          alt={company}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
          className="object-cover opacity-0 transition-all duration-500 group-hover/card:scale-110 group-hover/card:opacity-100"
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

        <span className="absolute left-4 bottom-4 translate-y-4 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 sm:left-6 sm:bottom-6 sm:text-base">
          {project.year}
        </span>

        <Link
          href={`/projects/${project.slug}`}
          className="group/button absolute right-4 bottom-4 inline-flex translate-y-4 items-center gap-2 border-b border-white/60 pb-1 text-sm font-semibold text-white opacity-0 transition-all duration-500 hover:border-[#02acfa] hover:text-[#02acfa] group-hover/card:translate-y-0 group-hover/card:opacity-100 sm:right-6 sm:bottom-6"
        >
          <span className="relative overflow-hidden">
            <span className="block transition-transform duration-300 group-hover/button:-translate-y-full">
              Projeyi İncele
            </span>

            <span className="absolute left-0 top-full block text-[#02acfa] transition-transform duration-300 group-hover/button:-translate-y-full">
              Detaya Git
            </span>
          </span>

          <FiArrowUpRight className="transition-transform duration-300 group-hover/button:translate-x-[3px] group-hover/button:-translate-y-[3px] group-hover/button:rotate-45 group-hover/button:text-[#02acfa]" />
        </Link>
      </motion.div>

      <div className="mt-6 w-full max-w-[520px] space-y-2 px-2 text-left sm:px-0">
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          {category}
        </p>

        <h3 className="font-['Everett','Everett_Fallback',sans-serif] text-lg font-semibold text-[#3b3e3f] sm:text-xl md:text-2xl">
          {company}
        </h3>

        <p className="text-sm text-gray-600 sm:text-base">{description}</p>
      </div>
    </motion.div>
  );
}

function HeroInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-white/34">
        {label}
      </p>

      <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">
        {value}
      </p>
    </div>
  );
}

function AnatomyBlock({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.72, ease: "easeOut" }}
      className="relative pt-8"
    >
      <SoftDivider className="absolute left-0 top-0" />

      <p className="text-[11px] uppercase tracking-[0.36em] text-[#02acfa]">
        {kicker}
      </p>

      <h2 className="mt-5 max-w-4xl font-['Everett','Everett_Fallback',sans-serif] text-3xl font-semibold leading-[1.06] tracking-[-0.045em] text-[#3b3e3f] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-6 max-w-4xl text-base leading-8 text-black/62 sm:text-lg">
        {text}
      </p>
    </motion.article>
  );
}

function SoftDivider({
  className = "",
  direction = "horizontal",
  tone = "dark",
}: {
  className?: string;
  direction?: "horizontal" | "vertical";
  tone?: "dark" | "light";
}) {
  const viaColor = tone === "light" ? "via-white/10" : "via-black/10";

  if (direction === "vertical") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none h-full w-px bg-gradient-to-b from-transparent ${viaColor} to-transparent ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none h-px w-full bg-gradient-to-r from-transparent ${viaColor} to-transparent ${className}`}
    />
  );
}