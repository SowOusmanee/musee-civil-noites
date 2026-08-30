import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles, 
  ArrowUp, 
  ShieldCheck, 
  Heart
} from 'lucide-react';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenTicketsModal: () => void;
  onOpenMapModal: () => void;
  onOpenCuratorModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToSection,
  onOpenTicketsModal,
  onOpenMapModal,
  onOpenCuratorModal
}) => {
  const { t, isFr } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="mcn-footer" className="bg-[#0A0A0A] text-[#F2E8DF] border-t border-[#2D241F] relative overflow-hidden">
      
      {/* Sleek gold linear accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Col 1: MCN Brand & Heritage */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#14100E] border border-[#3D2B22] flex items-center justify-center text-[#D4AF37] font-serif italic font-bold text-base shadow-sm">
                MCN
              </div>
              <div>
                <h3 className="font-syne font-bold text-base text-[#F2E8DF]">
                  {t('museumFullName')}
                </h3>
                <p className="text-xs text-[#D4AF37]">{t('museumCity')}</p>
              </div>
            </div>

            <p className="text-xs text-[#8B735B] leading-relaxed">
              {isFr 
                ? "Inauguré en décembre 2018 à Dakar, le Musée des Civilisations Noires est un carrefour mondial de la créativité, de l'histoire, des sciences et des cosmogonies du continent africain et de sa diaspora."
                : "Inaugurated in December 2018 in Dakar, the Museum of Black Civilizations is a global hub for African and diaspora creativity, history, sciences, and cosmogonies."}
            </p>

            <div className="pt-2 text-xs text-[#8B735B] space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isFr ? 'Place de la Gare ferroviaire de Dakar, BP 4003' : 'Dakar Train Station Plaza, BP 4003'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>+221 33 889 00 00 / +221 77 000 00 00</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>contact@mcn.sn / billetterie@mcn.sn</span>
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Rapide */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-syne text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              {isFr ? 'Parcours & Espaces' : 'Tours & Spaces'}
            </h4>
            <ul className="space-y-2 text-xs text-[#8B735B]">
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('dashboard-hero')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {isFr ? 'Accueil & Espace Visiteur' : 'Home & Visitor Space'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('events-section')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {isFr ? 'Événements & Expositions du Jour' : "Today's Events & Exhibitions"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('gallery-section')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {t('interactiveGallery')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMapModal}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {isFr ? 'Plan des 4 Niveaux & Pavillons' : '4-Level Floor Map & Pavilions'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCuratorModal}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {t('virtualCuratorAssistant')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollToSection('guestbook-section')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1.5 text-[#D4AF37]"
                >
                  <span>📖</span>
                  <span>{isFr ? 'Livre d\'or & Avis Visiteurs' : 'Guestbook & Visitor Reviews'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Horaires & Tarifs */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-syne text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              {isFr ? 'Horaires & Visite' : 'Hours & Visit'}
            </h4>
            <div className="space-y-2 text-xs text-[#8B735B]">
              <div className="bg-[#14100E] p-3 rounded-2xl border border-[#2D241F]">
                <p className="font-bold text-[#F2E8DF]">{isFr ? 'Mardi au Dimanche' : 'Tuesday to Sunday'}</p>
                <p className="text-[11px] text-emerald-400">10h00 — 19h00 (GMT Dakar)</p>
              </div>
              <div className="bg-[#14100E] p-3 rounded-2xl border border-[#2D241F]">
                <p className="font-bold text-[#F2E8DF]">{isFr ? 'Lundi' : 'Monday'}</p>
                <p className="text-[11px] text-amber-400">{isFr ? 'Fermeture hebdomadaire' : 'Weekly closure'}</p>
              </div>
              <button
                type="button"
                onClick={onOpenTicketsModal}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-bold font-syne uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                {t('buyATicket')}
              </button>
            </div>
          </div>

          {/* Col 4: Citations & Cheikh Anta Diop */}
          <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-syne text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {isFr ? 'Mémoire Vivante' : 'Living Heritage'}
              </h4>
              <p className="text-[11px] text-[#8B735B] italic leading-relaxed mt-2">
                {isFr 
                  ? "« L'Afrique doit réécrire sa propre histoire et apporter sa contribution fraternelle à l'édification de la civilisation de l'Universel. »"
                  : "« Africa must rewrite its own history and bring its fraternal contribution to the building of the Universal Civilization. »"}
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="self-start p-2.5 rounded-xl bg-[#14100E] hover:bg-[#1A1310] border border-[#2D241F] text-[#F2E8DF] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('backToTop')}</span>
            </button>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-[#2D241F] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B735B] gap-4">
          <p>© {new Date().getFullYear()} {t('museumFullName')} (MCN Dakar). {isFr ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{isFr ? 'Mentions légales' : 'Legal Mentions'}</span>
            <span>{isFr ? 'Politique de confidentialité' : 'Privacy Policy'}</span>
            <span>{isFr ? 'Règlement intérieur' : 'Museum Rules'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

