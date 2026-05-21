import type { StaticImageData } from "next/image";
import type { LanguageCode, LanguageShort } from "@/src/types/navigation";

import turkceFlag from "@/assets/flags/turkce.webp";
import ingilizceFlag from "@/assets/flags/ingilizce.webp";
import fransizcaFlag from "@/assets/flags/fransizca.webp";
import ruscaFlag from "@/assets/flags/rusca.png";

export type Language = {
  code: LanguageCode;
  short: LanguageShort;
  label: string;
  flag: StaticImageData;
};

export const languages: Language[] = [
  { code: "tr", short: "TR", label: "Türkçe", flag: turkceFlag },
  { code: "en", short: "EN", label: "English", flag: ingilizceFlag },
  { code: "fr", short: "FR", label: "Français", flag: fransizcaFlag },
  { code: "ru", short: "RU", label: "Русский", flag: ruscaFlag },
];