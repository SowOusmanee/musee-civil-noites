import React from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  Ticket, 
  MapPin, 
  Clock, 
  Compass, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DashboardHeroProps {
  user: UserProfile;
  onOpenTicketsModal: () => void;
  onOpenMapModal: () => void;
  onOpenCuratorModal: () => void;
  onScrollToGallery: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  user,
  onOpenTicketsModal,
  onOpenMapModal,
  onOpenCuratorModal,
  onScrollToGallery
}) => {
  const { t, isFr } = useLanguage();

  return (
    <section id="dashboard-hero" className="relative py-8 sm:py-12 overflow-hidden border-b border-[#2D241F] bg-[#0A0A0A]">
      {/* Background Decorative SVG Motif */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="65" stroke="#9B3922" strokeWidth="3" />
          <polygon points="100,40 120,80 100,160 80,80" fill="#D4AF37" />
          <circle cx="100" cy="100" r="20" fill="#F2E8DF" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Welcome Text & Presentation */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14100E] border border-[#3D2B22] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('heroBadge')}</span>
            </div>

            {/* Personalized Welcome */}
            <h1 className="font-syne text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F2E8DF] tracking-tight leading-tight">
              {isFr ? 'Dalal ak jàmm' : 'Welcome'}, <span className="font-serif italic text-[#D4AF37]">{user.name}</span>
            </h1>

            <p className="text-[#8B735B] text-sm sm:text-base leading-relaxed max-w-2xl">
              {t('heroDescription')}
            </p>

            {/* Practical Info Pill Banner */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs text-[#F2E8DF]/80">
              <span className="flex items-center gap-1.5 bg-[#14100E] px-3 py-1.5 rounded-xl border border-[#2D241F]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('address')}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#14100E] px-3 py-1.5 rounded-xl border border-[#2D241F]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFr ? 'Mardi - Dimanche : 10h00 - 19h00' : 'Tue - Sun: 10:00 AM - 7:00 PM'}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#14100E] px-3 py-1.5 rounded-xl border border-[#2D241F]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9B3922]" />
                <span>{isFr ? '14 000 m² d\'expositions' : '14,000 m² of galleries'}</span>
              </span>
            </div>

            {/* Fast Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                id="hero-btn-tickets"
                type="button"
                onClick={onOpenTicketsModal}
                className="py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-2.5 cursor-pointer transition-all transform active:scale-95"
              >
                <Ticket className="w-4 h-4" />
                <span>{t('heroCtaBuyTicket')}</span>
              </button>

              <button
                id="hero-btn-gallery"
                type="button"
                onClick={onScrollToGallery}
                className="py-3.5 px-5 rounded-xl bg-[#14100E] hover:bg-[#1A1310] border border-[#2D241F] hover:border-[#D4AF37]/50 text-[#F2E8DF] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>{t('heroCtaExplore')}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>

              <button
                id="hero-btn-curator"
                type="button"
                onClick={onOpenCuratorModal}
                className="py-3.5 px-4 rounded-xl bg-[#14100E] border border-[#2D241F] hover:border-[#D4AF37] text-[#D4AF37] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('heroCtaCurator')}</span>
              </button>
            </div>

          </div>

          {/* Right Highlight Card : Today's Featured Artwork Snapshot */}
          <div className="lg:col-span-4">
            <div className="relative rounded-2xl bg-[#14100E] border border-[#2D241F] p-4 sm:p-5 overflow-hidden shadow-2xl group hover:border-[#D4AF37]/50 transition-all">
              <div className="absolute top-3 right-3 z-20">
                <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A] text-[#D4AF37] border border-[#3D2B22] text-[10px] font-bold uppercase tracking-widest">
                  {isFr ? 'Trésor du Jour' : 'Daily Masterpiece'}
                </span>
              </div>

              <div className="relative h-48 sm:h-52 rounded-xl overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=800&q=80"
                  alt="Masque Punu Okuyi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="bg-[#9B3922]/90 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {isFr ? '1er Étage • Rituels' : '1st Floor • Rituals'}
                  </span>
                  <span className="text-[11px] text-[#F2E8DF]/80">Gabon / RDC</span>
                </div>
              </div>

              <h2 className="font-syne font-bold text-base text-[#F2E8DF] group-hover:text-[#D4AF37] transition-colors">
                Masque Punu 'Okuyi'
              </h2>
              <p className="text-xs text-[#8B735B] line-clamp-2 mt-1">
                {isFr 
                  ? 'Recouvert de kaolin blanc sacré, symbole de la sagesse éternelle des ancêtres.'
                  : 'Coated with sacred white kaolin, a symbol of eternal ancestral wisdom.'}
              </p>

              <div className="mt-3 pt-3 border-t border-[#2D241F] flex items-center justify-between">
                <button
                  type="button"
                  onClick={onScrollToGallery}
                  className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isFr ? 'Examiner l\'œuvre' : 'Inspect artwork'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onOpenMapModal}
                  className="text-[11px] text-[#8B735B] hover:text-[#F2E8DF] flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-[#D4AF37]" />
                  <span>{isFr ? 'Localiser dans le MCN' : 'Locate in museum'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
