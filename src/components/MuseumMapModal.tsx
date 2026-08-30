import React, { useState } from 'react';
import { MUSEUM_PAVILIONS } from '../data/museumData';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Map, 
  Layers, 
  Sparkles, 
  Compass, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface MuseumMapModalProps {
  onClose: () => void;
  initialFloor?: number;
  onSelectPavilionArtworks?: (floor: number) => void;
}

export const MuseumMapModal: React.FC<MuseumMapModalProps> = ({
  onClose,
  initialFloor = 0,
  onSelectPavilionArtworks
}) => {
  const { t, isFr } = useLanguage();
  const [activeFloor, setActiveFloor] = useState<number>(initialFloor);

  const currentPavilion = MUSEUM_PAVILIONS.find(p => p.floor === activeFloor) || MUSEUM_PAVILIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2D241F] bg-[#1A1310] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D241F] border border-[#3D2B22] flex items-center justify-center text-[#D4AF37]">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                {isFr ? 'Plan Interactif des Salles & Pavillons' : 'Interactive Map of Pavilions & Halls'}
              </h3>
              <p className="text-xs text-[#8B735B]">
                {isFr 
                  ? 'Architecture circulaire inspirée des cases traditionnelles africaines • 4 Niveaux'
                  : 'Circular architecture inspired by traditional African round huts • 4 Levels'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          
          {/* Left Floor Selector */}
          <div className="lg:col-span-4 p-5 bg-[#0F0D0C] border-b lg:border-b-0 lg:border-r border-[#2D241F] space-y-3">
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
              {isFr ? 'Sélectionnez un Niveau :' : 'Select a Level:'}
            </p>

            <div className="space-y-2">
              {MUSEUM_PAVILIONS.map((pav) => (
                <button
                  key={pav.floor}
                  type="button"
                  onClick={() => setActiveFloor(pav.floor)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    activeFloor === pav.floor
                      ? 'bg-[#1A1310] border-[#D4AF37] text-[#F2E8DF] shadow-lg'
                      : 'bg-[#14100E] border-[#2D241F] text-[#8B735B] hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-syne font-bold text-xs ${
                      activeFloor === pav.floor ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-[#1A1310] text-[#F2E8DF]'
                    }`}>
                      {pav.floor === 0 ? (isFr ? 'RDC' : 'Ground') : `${pav.floor}${isFr ? 'E' : 'F'}`}
                    </div>
                    <div>
                      <p className="font-bold text-xs">{pav.name}</p>
                      <p className="text-[11px] text-[#8B735B] line-clamp-1">{pav.theme}</p>
                    </div>
                  </div>
                  <Compass className={`w-4 h-4 ${activeFloor === pav.floor ? 'text-[#D4AF37]' : 'text-transparent'}`} />
                </button>
              ))}
            </div>

            <div className="p-3.5 bg-[#14100E] rounded-2xl border border-[#2D241F] text-xs text-[#8B735B] space-y-1">
              <p className="font-bold text-[#D4AF37] flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                Dakar, Place de la Gare
              </p>
              <p className="text-[11px]">
                {isFr 
                  ? 'Surface totale : 14 000 m² répartis sur 4 niveaux concentriques avec ascenseurs et accès PMR intégral.'
                  : 'Total area: 14,000 sqm across 4 concentric levels with elevators and full accessibility.'}
              </p>
            </div>
          </div>

          {/* Right Visual Architecture & Floor Highlights */}
          <div className="lg:col-span-8 p-6 space-y-5 bg-[#14100E]">
            
            {/* Visual Floor Diagram */}
            <div className="bg-[#1A1310] rounded-2xl border border-[#2D241F] p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              
              {/* Circular Architectural Visual */}
              <div className="relative w-48 h-48 rounded-full border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center animate-pulse">
                <div className="w-36 h-36 rounded-full border-2 border-[#9B3922] flex items-center justify-center bg-[#9B3922]/10">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#9B3922] to-[#D4AF37] flex flex-col items-center justify-center text-center p-2 shadow-lg">
                    <span className="font-cinzel text-xs font-bold text-white uppercase">MCN DAKAR</span>
                    <span className="text-[10px] text-white/90 font-bold">{currentPavilion.name}</span>
                  </div>
                </div>

                {/* Satellite thematic stations */}
                <div className="absolute -top-2 bg-[#14100E] border border-[#D4AF37] px-2 py-0.5 rounded text-[10px] text-[#F2E8DF]">
                  {isFr ? 'Rotonde Centrale' : 'Central Rotunda'}
                </div>
                <div className="absolute -bottom-2 bg-[#14100E] border border-[#D4AF37] px-2 py-0.5 rounded text-[10px] text-[#F2E8DF]">
                  {isFr ? 'Ascenseurs & Pass' : 'Elevators & Pass'}
                </div>
              </div>

              <span className="text-[11px] text-[#8B735B] mt-4">
                {isFr ? 'Plan schématique du niveau sélectionné' : 'Schematic blueprint of selected level'}
              </span>
            </div>

            {/* Current Pavilion Details */}
            <div className="bg-[#1A1310] rounded-2xl border border-[#2D241F] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                    {isFr ? `Thématique Principale du ${currentPavilion.name}` : `Main Theme of ${currentPavilion.name}`}
                  </span>
                  <h4 className="font-syne text-lg font-bold text-[#F2E8DF] mt-0.5">
                    {currentPavilion.theme}
                  </h4>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-[#8B735B] mb-2">
                  {isFr ? 'Collections & Pièces majeures exposées à cet étage :' : 'Collections & major masterpieces on this floor:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPavilion.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#14100E] p-2.5 rounded-xl border border-[#2D241F] text-xs text-[#F2E8DF]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1A1310] border-t border-[#2D241F] flex items-center justify-between">
          <span className="text-xs text-[#8B735B]">
            {isFr ? 'Guide des espaces • Musée des Civilisations Noires' : 'Spaces Guide • Museum of Black Civilizations'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-syne font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.25)]"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};

