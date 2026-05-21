import Link from "next/link";

type CookieSection = {
    title: string;
    content?: string[];
    list?: string[];
};

type CookieTableItem = {
    category: string;
    purpose: string;
    legalBasis: string;
    duration: string;
    consent: string;
};

const sections: CookieSection[] = [
    {
        title: "Giriş",
        content: [
            "Bu Çerez Politikası, Artech Software tarafından işletilen internet sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında kullanıcıları bilgilendirmek amacıyla hazırlanmıştır.",
            "Bu politika; 6698 sayılı Kişisel Verilerin Korunması Kanunu, ilgili ikincil mevzuat, Kişisel Verileri Koruma Kurumu kararları ve Çerez Uygulamaları Hakkında Rehber dikkate alınarak oluşturulmuştur.",
            "İnternet sitemizi ziyaret ettiğinizde, bazı çerezler sitenin güvenli ve doğru şekilde çalışması için zorunlu olarak kullanılabilir. Zorunlu olmayan çerezler ise yalnızca açık rızanızın bulunması halinde kullanılır.",
        ],
    },
    {
        title: "1. Çerez Nedir?",
        content: [
            "Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınız veya cihazınız aracılığıyla saklanabilen küçük metin dosyalarıdır.",
            "Çerezler; internet sitesinin çalışmasını sağlamak, kullanıcı tercihlerini hatırlamak, site performansını ölçmek, kullanıcı deneyimini geliştirmek ve pazarlama faaliyetlerini yürütmek gibi amaçlarla kullanılabilir.",
        ],
    },
    {
        title: "2. Çerez Kullanım Amaçları",
        content: [
            "İnternet sitemizde çerezler; sitenin temel fonksiyonlarının çalıştırılması, güvenliğin sağlanması, kullanıcı tercihinin hatırlanması, performansın ölçülmesi ve kullanıcı deneyiminin iyileştirilmesi amacıyla kullanılabilir.",
            "Analitik, performans, reklam veya pazarlama çerezleri gibi zorunlu olmayan çerezler, yalnızca kullanıcının açık rızası alınarak kullanılmaktadır.",
        ],
    },
    {
        title: "3. Kullanılan Çerez Türleri",
        list: [
            "Zorunlu Çerezler: İnternet sitesinin güvenli ve doğru şekilde çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan sitenin bazı bölümleri çalışmayabilir.",
            "İşlevsel Çerezler: Dil tercihi, bölge tercihi veya daha önce yapılan seçimlerin hatırlanması gibi kullanıcı deneyimini kolaylaştıran çerezlerdir.",
            "Performans ve Analitik Çerezleri: Ziyaretçi sayısı, sayfa görüntüleme, trafik kaynağı ve kullanım davranışları gibi bilgilerin analiz edilmesi amacıyla kullanılabilir.",
            "Reklam ve Pazarlama Çerezleri: Kullanıcı ilgi alanlarına göre reklam gösterimi, kampanya ölçümü veya yeniden hedefleme faaliyetleri için kullanılabilir.",
        ],
    },
    {
        title: "4. Çerezlerin Hukuki Sebebi",
        content: [
            "Zorunlu çerezler, internet sitesinin çalışması ve güvenliğinin sağlanması için gerekli olmaları nedeniyle açık rıza aranmaksızın kullanılabilir.",
            "Zorunlu olmayan işlevsel, analitik, reklam ve pazarlama çerezleri ise kural olarak kullanıcının açık rızasına dayanılarak kullanılır.",
            "Kullanıcılar, zorunlu olmayan çerezlere ilişkin tercihlerini diledikleri zaman değiştirebilir veya geri alabilir.",
        ],
    },
    {
        title: "5. Açık Rıza ve Çerez Tercihleri",
        content: [
            "İnternet sitemizi ilk ziyaretinizde, zorunlu olmayan çerezlere ilişkin tercihlerinizi yönetebilmeniz için çerez bilgilendirme alanı sunulabilir.",
            "Çerez tercihleriniz kapsamında analitik, işlevsel veya pazarlama çerezlerine izin verebilir, reddedebilir veya daha sonra tercihinizi değiştirebilirsiniz.",
            "Açık rızanız bulunmadıkça, zorunlu olmayan çerezler cihazınıza yerleştirilmez ve bu çerezler aracılığıyla kişisel verileriniz işlenmez.",
        ],
    },
    {
        title: "6. Üçüncü Taraf Çerezleri",
        content: [
            "İnternet sitemizde, teknik hizmet sağlayıcılar, analiz araçları veya harita/medya servisleri gibi üçüncü taraf hizmetler aracılığıyla çerezler kullanılabilir.",
            "Üçüncü taraf çerezleri kullanılması halinde, bu çerezlere ilişkin veri işleme faaliyetleri ilgili üçüncü tarafların gizlilik ve çerez politikalarına da tabi olabilir.",
            "Üçüncü taraflara veri aktarımı gerektiğinde, aktarım KVKK’da öngörülen hukuki sebepler ve ilgili mevzuat hükümleri çerçevesinde gerçekleştirilir.",
        ],
    },
    {
        title: "7. Çerezlerin Saklama Süresi",
        content: [
            "Çerezler, kullanım amaçları için gerekli olan süre boyunca saklanır.",
            "Oturum çerezleri tarayıcı kapatıldığında silinir. Kalıcı çerezler ise belirlenen saklama süresi boyunca cihazınızda kalabilir.",
            "Saklama süresi sona eren çerezler silinir, yok edilir veya anonim hale getirilir.",
        ],
    },
    {
        title: "8. Çerezleri Nasıl Yönetebilirsiniz?",
        content: [
            "Tarayıcı ayarlarınızı değiştirerek çerezleri engelleyebilir, silebilir veya yalnızca belirli çerezlere izin verebilirsiniz.",
            "Çerezleri tamamen devre dışı bırakmanız halinde internet sitesinin bazı özellikleri düzgün çalışmayabilir.",
            "Zorunlu olmayan çerezlere ilişkin daha önce verdiğiniz açık rızayı, çerez tercih paneli veya tarayıcı ayarları üzerinden geri alabilirsiniz.",
        ],
    },
    {
        title: "9. İlgili Kişinin Hakları",
        content: [
            "KVKK’nın 11. maddesi kapsamında, kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme ve mevzuatta yer alan diğer haklara sahipsiniz.",
            "Bu haklara ilişkin taleplerinizi, Kişisel Verilerin Korunması Kanunu ve ilgili mevzuatta belirtilen usullere uygun şekilde veri sorumlusuna iletebilirsiniz.",
        ],
    },
    {
        title: "10. Politika Değişiklikleri",
        content: [
            "Bu Çerez Politikası, mevzuat değişiklikleri, Kurul kararları, teknik gereklilikler veya internet sitesindeki çerez kullanımının değişmesi halinde güncellenebilir.",
            "Politikanın güncel hali internet sitesinde yayımlandığı tarihten itibaren geçerli olur.",
        ],
    },
];

const cookieTable: CookieTableItem[] = [
    {
        category: "Zorunlu Çerezler",
        purpose: "Sitenin güvenli, stabil ve temel fonksiyonlarıyla çalışması.",
        legalBasis: "KVKK m.5/2 kapsamında zorunluluk ve meşru menfaat.",
        duration: "Oturum süresi veya teknik gereklilik süresi.",
        consent: "Açık rıza aranmaz.",
    },
    {
        category: "İşlevsel Çerezler",
        purpose: "Kullanıcı tercihlerini hatırlama ve deneyimi iyileştirme.",
        legalBasis: "Açık rıza veya ilgili işleme şartı.",
        duration: "Tercih süresi boyunca.",
        consent: "Gerekli hallerde açık rıza alınır.",
    },
    {
        category: "Performans / Analitik Çerezleri",
        purpose: "Ziyaretçi istatistikleri ve site kullanım performansını ölçme.",
        legalBasis: "Açık rıza.",
        duration: "Araç sağlayıcısına göre değişebilir.",
        consent: "Açık rıza gerekir.",
    },
    {
        category: "Reklam / Pazarlama Çerezleri",
        purpose: "Kişiselleştirilmiş reklam, kampanya ölçümü ve yeniden hedefleme.",
        legalBasis: "Açık rıza.",
        duration: "Araç sağlayıcısına göre değişebilir.",
        consent: "Açık rıza gerekir.",
    },
];

export default function CookiePage() {
    return (
        <main className="min-h-screen bg-white text-[#0d0d0d]">
            <section className="relative overflow-hidden border-b border-black/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,172,250,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(2,172,250,0.08),transparent_30%)]" />

                <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-10">
                    <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-[#02acfa]">
                        Artech Software
                    </p>

                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#0d0d0d] sm:text-5xl lg:text-6xl">
                        Çerez Politikası
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-black/60 sm:text-lg">
                        Bu politika, internet sitemizde kullanılan çerezler ve benzeri
                        teknolojiler hakkında kullanıcıları bilgilendirmek amacıyla
                        hazırlanmıştır.
                    </p>

                    <p className="mt-4 text-sm text-black/45">
                        Son güncelleme tarihi: 18 Mayıs 2026
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 rounded-3xl border border-black/10 bg-black/[0.025] p-6 backdrop-blur">
                        <p className="mb-4 text-sm font-semibold text-black/45">
                            İçindekiler
                        </p>

                        <nav className="space-y-3">
                            {sections.map((section, index) => (
                                <a
                                    key={section.title}
                                    href={`#section-${index}`}
                                    className="block text-sm leading-6 text-black/55 transition hover:text-[#02acfa]"
                                >
                                    {section.title}
                                </a>
                            ))}

                            <a
                                href="#cookie-table"
                                className="block text-sm leading-6 text-black/55 transition hover:text-[#02acfa]"
                            >
                                Çerez Kategorileri Tablosu
                            </a>
                        </nav>
                    </div>
                </aside>

                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <article
                            key={section.title}
                            id={`section-${index}`}
                            className="scroll-mt-24 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8"
                        >
                            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0d0d0d]">
                                {section.title}
                            </h2>

                            {section.content && (
                                <div className="space-y-4">
                                    {section.content.map((paragraph) => (
                                        <p
                                            key={paragraph}
                                            className="text-sm leading-8 text-black/65 sm:text-base"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {section.list && (
                                <ul className="space-y-3">
                                    {section.list.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-3 text-sm leading-7 text-black/65 sm:text-base"
                                        >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#02acfa]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    ))}

                    <article
                        id="cookie-table"
                        className="scroll-mt-24 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8"
                    >
                        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0d0d0d]">
                            Çerez Kategorileri Tablosu
                        </h2>

                        <p className="mb-6 text-sm leading-8 text-black/60 sm:text-base">
                            Aşağıdaki tablo genel çerez kategorilerini göstermektedir. Sitede
                            kullanılan teknik araçlara göre çerez adı, sağlayıcı ve saklama
                            süreleri ayrıca güncellenmelidir.
                        </p>

                        <div className="overflow-hidden rounded-2xl border border-black/10">
                            <div className="hidden grid-cols-[1.1fr_1.5fr_1.3fr_1fr_1fr] bg-black/[0.035] text-xs font-semibold uppercase tracking-[0.18em] text-black/45 lg:grid">
                                <div className="border-r border-black/10 p-4">Kategori</div>
                                <div className="border-r border-black/10 p-4">Amaç</div>
                                <div className="border-r border-black/10 p-4">Hukuki Sebep</div>
                                <div className="border-r border-black/10 p-4">Süre</div>
                                <div className="p-4">Rıza</div>
                            </div>

                            {cookieTable.map((item) => (
                                <div
                                    key={item.category}
                                    className="grid border-t border-black/10 text-sm leading-7 text-black/65 lg:grid-cols-[1.1fr_1.5fr_1.3fr_1fr_1fr]"
                                >
                                    <div className="border-black/10 p-4 font-semibold text-[#0d0d0d] lg:border-r">
                                        {item.category}
                                    </div>
                                    <div className="border-black/10 p-4 lg:border-r">
                                        {item.purpose}
                                    </div>
                                    <div className="border-black/10 p-4 lg:border-r">
                                        {item.legalBasis}
                                    </div>
                                    <div className="border-black/10 p-4 lg:border-r">
                                        {item.duration}
                                    </div>
                                    <div className="p-4">{item.consent}</div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <div className="rounded-3xl border border-[#02acfa]/30 bg-[#02acfa]/10 p-6 sm:p-8">
                        <h2 className="mb-3 text-2xl font-semibold text-[#0d0d0d]">
                            Çerez Tercihleri
                        </h2>

                        <p className="text-sm leading-8 text-black/70 sm:text-base">
                            Zorunlu olmayan çerezlere ilişkin tercihlerinizi, internet
                            sitesinde yer alan çerez tercih paneli üzerinden değiştirebilir
                            veya tarayıcı ayarlarınızdan çerezleri silebilirsiniz.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-black/10 bg-black/[0.025] p-6 sm:p-8">
                        <h2 className="mb-3 text-2xl font-semibold text-[#0d0d0d]">
                            İletişim Bilgileri
                        </h2>

                        <p className="text-sm leading-8 text-black/70 sm:text-base">
                            Adres: Aşkan Mahallesi, Sancaktar Caddesi, 28/2, Meram/KONYA
                        </p>

                        <p className="text-sm leading-8 text-black/70 sm:text-base">
                            E-posta: artechsoftware@outlook.com
                        </p>
                    </div>

                    <div className="flex justify-start pt-4">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3 rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-[#0d0d0d] transition hover:border-[#02acfa] hover:bg-[#02acfa] hover:text-white"
                        >
                            Anasayfaya Dön
                            <span className="transition group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}