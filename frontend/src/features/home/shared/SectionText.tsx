"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { textVariant2 } from "@/lib/motion";

type TypingTextProps = {
  title: string;
  textStyles?: string;
};

type TitleTextProps = {
  title: ReactNode;
  textStyles?: string;
};

export function TitleText({ title, textStyles = "" }: TitleTextProps) {
  return (
    <motion.h2
      variants={textVariant2}
      initial="hidden"
      whileInView="show"
      className={`mt-[8px] font-bold md:text-[36px] text-[36px] text-white ${textStyles}`}
    >
      {title}
    </motion.h2>
  );
}

//Eyebrowtext
export function TypingText({ title, textStyles = "" }: TypingTextProps) {
  const [replayKey, setReplayKey] = useState(0);

  if (!title) return null;

  return (
    <motion.p
      key={title}
      inherit={false}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.45 }}
      onViewportLeave={() => setReplayKey((prev) => prev + 1)}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.025,
          },
        },
      }}
      className={`font-normal text-[14px] text-secondary-white ${textStyles}`}
    >
      {Array.from(title || "").map((letter, index) => (
        <motion.span
          key={`${letter}-${index}-${title}-${replayKey}`}
          variants={{
            hidden: {
              opacity: 0,
              x: -8,
              filter: "blur(3px)",
            },
            show: {
              opacity: 1,
              x: 0,
              filter: "blur(0px)",
            },
          }}
          transition={{
            duration: 0.28,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.p>
  );
}