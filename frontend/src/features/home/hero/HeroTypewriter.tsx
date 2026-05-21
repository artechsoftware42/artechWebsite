"use client";

import { Cursor, useTypewriter } from "react-simple-typewriter";

type HeroTypewriterProps = {
  prefix: string;
  words: string[];
};

export default function HeroTypewriter({
  prefix,
  words,
}: HeroTypewriterProps) {
  const [text] = useTypewriter({
    words,
    loop: true,
    typeSpeed: 60,
    deleteSpeed: 30,
    delaySpeed: 2000,
  });

  return (
    <p className="text-[22px] sm:text-[34px] md:text-[44px] font-semibold tracking-[-0.03em] text-white">
      <span className="text-white/65">{prefix} </span>
      <span className="text-[#02acfa]">{text}</span>
      <Cursor
        cursorBlinking={false}
        cursorStyle="|"
        cursorColor="#02acfa"
      />
    </p>
  );
}