"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

type ProjectCardProps = {
  primaryImage: string;
  secondaryImage: string;
  type: string;
  company: string;
  description: string;
  year: string;
};

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

export default function ProjectCard({
  primaryImage,
  secondaryImage,
  type,
  company,
  description,
  year,
}: ProjectCardProps) {
  const safePrimaryImage = getPublicMediaUrl(primaryImage);
  const safeSecondaryImage = getPublicMediaUrl(secondaryImage);

  if (!safePrimaryImage || !safeSecondaryImage) return null;

  return (
    <motion.div
      variants={cardVariants}
      className="group cursor-pointer flex flex-col items-center w-full"
    >
      <motion.div
        whileHover={{ y: -14 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="
          relative
          w-full
          max-w-[520px]
          h-[420px]
          sm:h-[500px]
          md:h-[580px]
          xl:h-[650px]
          rounded-3xl overflow-hidden shadow-2xl
        "
      >
        <Image
          src={safePrimaryImage}
          alt={company}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
          className="object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-110"
          unoptimized
        />

        <Image
          src={safeSecondaryImage}
          alt={company}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
          className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
          unoptimized
        />

        {year && (
          <span className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 text-white text-sm sm:text-base font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            {year}
          </span>
        )}
      </motion.div>

      <div className="mt-6 space-y-2 w-full max-w-[520px] text-left px-2 sm:px-0">
        {type && (
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {type}
          </p>
        )}

        {company && (
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#181818]">
            {company}
          </h3>
        )}

        {description && (
          <p className="text-sm sm:text-base text-gray-600">{description}</p>
        )}
      </div>
    </motion.div>
  );
}