import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 text-center">

      <img
        src="/images/404img.png"
        alt="404 Not Found"
        draggable={false}
        className="w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] select-none pointer-events-none mb-2"
      />

      <div className="max-w-xl -mt-2 sm:-mt-3 md:-mt-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
          404 | Sayfa Bulunamadı
        </h1>

        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-5">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-[#02acfa] text-white px-6 py-3 rounded-lg text-sm sm:text-base font-medium 
          hover:opacity-90 transition-all duration-300 cursor-pointer"
        >
          Anasayfaya Dön
        </button>
      </div>
    </div>
  );
}