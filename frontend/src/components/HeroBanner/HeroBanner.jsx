import heroImg from "../../assets/herobanner.png";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen overflow-hidden">
      
      {/* Background Image */}
      <img
        src={heroImg}
        alt="Hero Banner"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
        style={{
          imageRendering: "auto",
        }}
      />

      {/* Gradient Overlay (karartmaz, sadece yazıyı okunur yapar) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 text-center">
        <div className="text-white max-w-3xl">
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Geleceği Kodluyoruz
          </h1>

          <p className="text-sm md:text-lg lg:text-xl opacity-90 mb-6">
            Modern yazılım çözümleri ile dijital dünyada fark yaratın.
          </p>

          <button className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition">
            Başla
          </button>

        </div>
      </div>
    </section>
  );
}