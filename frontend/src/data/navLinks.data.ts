import type { NavLinkItem } from "@/src/types/navigation";

export const navLinksdata: NavLinkItem[] = [
  {
    _id: 1002,
    title: "HAKKIMIZDA",
    link: "/about",
  },
  {
    _id: 1003,
    title: "PROJELER",
    link: "/projects",
    submenu: [
      {
        title: "Web Sitesi",
        link: "/projects",
        tab: "Websitesi",
      },
      {
        title: "Mobil Uygulama",
        link: "/projects",
        tab: "Mobil Uygulamalar",
      },
      {
        title: "CRM Sistemleri",
        link: "/projects",
        tab: "CRM Sistemleri",
      },
      {
        title: "Stok Takibi Programları",
        link: "/projects",
        tab: "Stok Takibi Programları",
      },
      {
        title: "ERP / MRP Sistemleri",
        link: "/projects",
        tab: "ERP / MRP Sistemleri",
      },
      {
        title: "Savunma Sanayii",
        link: "/projects",
        tab: "Savunma Sanayii",
      },
    ],
  },
  {
    _id: 1004,
    title: "KURUMSAL",
    link: "/kurumsal",
    submenu: [
      {
        title: "Kariyer",
        desc: "Ekibimize katıl, birlikte büyüyelim",
        link: "/career",
        icon: "briefcase",
      },
      {
        title: "RSquare Game Studio",
        desc: "Oyun geliştirme stüdyomuz",
        icon: "gamepad",
        external: true,
        url: "https://rsquarestudio.net/",
      },
    ],
  },
  {
    _id: 1005,
    title: "İLETİŞİM",
    link: "/contact",
  },
];