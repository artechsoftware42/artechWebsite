"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

type ProjectCardProps = {
    slug: string;
    primaryImage: string;
    secondaryImage: string;
    type: string;
    company: string;
    description: string;
    year: string;
};

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
            ease: [0.16, 1, 0.3, 1],
        },
    },
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
    slug,
    primaryImage,
    secondaryImage,
    type,
    company,
    description,
    year,
}: ProjectCardProps) {
    const safePrimaryImage = getPublicMediaUrl(primaryImage);
    const safeSecondaryImage = getPublicMediaUrl(secondaryImage);

    if (!safePrimaryImage || !safeSecondaryImage || !slug) return null;

    return (
        <motion.div
            variants={cardVariants}
            layout
            className="group flex w-full cursor-pointer flex-col items-center"
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
                    src={safePrimaryImage}
                    alt={company}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-0"
                    unoptimized
                />

                <Image
                    src={safeSecondaryImage}
                    alt={company}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                    className="object-cover opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                    unoptimized
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="absolute left-4 bottom-4 translate-y-4 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:left-6 sm:bottom-6 sm:text-base">
                    {year}
                </span>

                <Link
                    href={`/projects/${slug}`}
                    className="
                        group/btn
                        absolute
                        right-4
                        bottom-4
                        inline-flex
                        translate-y-4
                        items-center
                        gap-2
                        overflow-hidden
                        rounded-full
                        bg-white/10
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        opacity-0
                        shadow-[0_18px_45px_rgba(0,0,0,0.35)]
                        backdrop-blur-xl
                        transition-all
                        duration-500
                        hover:border-white/70
                        hover:bg-white
                        hover:text-[#0d0d0d]
                        hover:shadow-[0_24px_70px_rgba(255,255,255,0.22)]
                        group-hover:translate-y-0
                        group-hover:opacity-100
                        sm:right-6
                        sm:bottom-6
                    "
                >
                    <span className="absolute inset-0 translate-x-[-120%] skew-x-[-20deg] bg-white/30 transition-transform duration-700 group-hover/btn:translate-x-[120%]" />

                    <span className="relative z-10">Projeyi İncele</span>

                    <FiArrowUpRight className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-[2px] group-hover/btn:-translate-y-[2px]" />
                </Link>
            </motion.div>

            <div className="mt-6 w-full max-w-[520px] space-y-2 px-2 text-left sm:px-0">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                    {type}
                </p>

                <h3 className="text-lg font-semibold text-[#181818] sm:text-xl md:text-2xl">
                    {company}
                </h3>

                <p className="text-sm text-gray-600 sm:text-base">{description}</p>
            </div>
        </motion.div>
    );
}