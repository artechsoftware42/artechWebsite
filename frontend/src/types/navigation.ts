export type NavIconName = "briefcase" | "gamepad";

export type SubmenuItem = {
  title: string;
  desc?: string;
  link?: string;
  tab?: string;
  icon?: NavIconName;
  external?: boolean;
  url?: string;
};

export type NavLinkItem = {
  _id: number;
  title: string;
  link: string;
  submenu?: SubmenuItem[];
};

export type LanguageCode = "tr" | "en" | "fr" | "ru";
export type LanguageShort = "TR" | "EN" | "FR" | "RU";