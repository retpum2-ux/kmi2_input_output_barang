import React from 'react';

interface HomePageProps {
  onNavigate: (page: 'pengambilan' | 'kedatangan') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in my-auto">
      {/* Outer Container matching PDF Image 1 */}
      <div className="w-full max-w-xl bg-[#faeee0] border border-stone-800 shadow-md p-6 sm:p-10 pt-3 sm:pt-4 relative mx-auto">
        {/* Top bar: Left company label & Right KMI2 as requested */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="text-left text-xs sm:text-sm font-semibold text-stone-600 tracking-wide">
            PT KMI Wire and Cable Tbk
          </div>
          <div className="text-right text-xs sm:text-sm font-bold text-stone-800 tracking-wider">
            KMI2
          </div>
        </div>

        {/* Centered Main Header dengan garis dan warna gradasi */}
        <div className="text-center my-6 sm:my-10 py-3.5 px-4 bg-gradient-to-r from-[#faeee0] via-[#f5dfca] to-[#faeee0] border-y-2 border-stone-800 rounded-lg shadow-2xs space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase font-sans">
            FORM
          </h2>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-stone-900 tracking-wide uppercase font-sans px-2 leading-tight">
            PENGAMBILAN DAN KEDATANGAN BARANG
          </h1>
        </div>

        {/* Two Main Large Navigation Buttons with solid WHITE text as in PDF */}
        <div className="space-y-5 sm:space-y-6 my-8 sm:my-12">
          {/* Button 1: PENGAMBILAN / PEMAKAIAN (Coral/Red) with solid white text */}
          <button
            type="button"
            onClick={() => onNavigate('pengambilan')}
            className="w-full py-4 sm:py-5 px-4 bg-[#dc6b6b] hover:bg-[#cb5858] active:bg-[#b84848] text-white hover:text-white font-black text-base sm:text-lg md:text-xl tracking-wider uppercase border border-stone-900 shadow-xs transition-colors duration-150 cursor-pointer text-center"
          >
            PENGAMBILAN / PEMAKAIAN
          </button>

          {/* Button 2: KEDATANGAN (Sage Green) with solid white text */}
          <button
            type="button"
            onClick={() => onNavigate('kedatangan')}
            className="w-full py-4 sm:py-5 px-4 bg-[#7fae7f] hover:bg-[#6fa06f] active:bg-[#5f8e5f] text-white hover:text-white font-black text-base sm:text-lg md:text-xl tracking-wider uppercase border border-stone-900 shadow-xs transition-colors duration-150 cursor-pointer text-center"
          >
            KEDATANGAN
          </button>
        </div>
      </div>
    </div>
  );
};
