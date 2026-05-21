"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { fadeIn } from "@/lib/motion";
import headset from "@/assets/icons/headset.svg";

type ExploreCardProps = {
  id: string;
  imgUrl: string;
  title: string;
  discoverText: string;
  index: number;
  active: string;
  handleClick: (id: string) => void;
  priority?: boolean;
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

export default function ExploreCard({
  id,
  imgUrl,
  title,
  index,
  active,
  handleClick,
  discoverText,
  priority = false,
}: ExploreCardProps) {
  const isActive = active === id;
  const safeImageUrl = getPublicMediaUrl(imgUrl);

  if (!safeImageUrl) return null;

  return (
    <motion.div
      inherit={false}
      initial="hidden"
      animate="show"
      variants={fadeIn("right", "spring", index * 0.15, 0.55)}
      className={`relative ${isActive ? "lg:flex-[3.5] flex-[10]" : "lg:flex-[0.5] flex-[2]"
        } flex items-center justify-center min-w-[170px] h-[700px] transition-[flex] duration-[0.7s] ease-out cursor-pointer`}
      onClick={() => handleClick(id)}
    >
      <Image
        src={safeImageUrl}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 25vw"
        className="absolute object-cover rounded-[24px]"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized
      />

      {!isActive ? (
        <h3 className="font-semibold sm:text-[26px] text-[18px] text-white absolute z-10 lg:bottom-20 lg:rotate-[-90deg] lg:origin-[0,0]">
          {title}
        </h3>
      ) : (
        <div className="absolute bottom-0 z-10 p-8 flex justify-start w-full flex-col bg-[rgba(0,0,0,0.5)] rounded-b-[24px]">
          <div className="flex justify-center items-center w-[60px] h-[60px] rounded-[24px] bg-white/25 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[4px] border border-white/20 mb-[16px]">
            <Image
              src={headset}
              alt="headset"
              width={30}
              height={30}
              className="w-1/2 h-1/2 object-contain"
              priority={priority}
            />
          </div>

          <p className="font-normal text-[16px] leading-[20.16px] text-white uppercase">
            {discoverText}
          </p>

          <h2 className="mt-[24px] font-semibold sm:text-[32px] text-[24px] text-white">
            {title}
          </h2>
        </div>
      )}
    </motion.div>
  );
}