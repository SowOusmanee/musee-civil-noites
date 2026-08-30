import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'inline' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Compact Pill Button (e.g. [FR | EN])
  if (variant === 'pill') {
    return (
      <div 
        id="language-switcher-pill"
        className={`inline-flex items-center p-0.5 rounded-xl bg-[#14100E] border border-[#2D241F] text-xs font-semibold ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            language === 'fr'
              ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]'
              : 'text-[#8B735B] hover:text-[#F2E8DF]'
          }`}
          title="Passer en Français"
        >
          <span className="text-[11px]">FR</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            language === 'en'
              ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]'
              : 'text-[#8B735B] hover:text-[#F2E8DF]'
          }`}
          title="Switch to English"
        >
          <span className="text-[11px]">EN</span>
        </button>
      </div>
    );
  }

  // Inline List (for Mobile Drawer)
  if (variant === 'inline') {
    return (
      <div id="language-switcher-inline" className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            language === 'fr'
              ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)]'
              : 'bg-[#1A1310] text-[#8B735B] border-[#2D241F] hover:text-[#F2E8DF]'
          }`}
        >
          <span className="text-sm">🇫🇷</span>
          <span>Français</span>
          {language === 'fr' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            language === 'en'
              ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)]'
              : 'bg-[#1A1310] text-[#8B735B] border-[#2D241F] hover:text-[#F2E8DF]'
          }`}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
          {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      </div>
    );
  }

  // Default: Elegant Dropdown in Navbar
  return (
    <div ref={dropdownRef} id="language-switcher-dropdown" className={`relative inline-block ${className}`}>
      <button
        id="btn-language-switcher"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="py-2 px-2.5 sm:px-3 rounded-xl bg-[#14100E] hover:bg-[#1A1310] border border-[#2D241F] hover:border-[#D4AF37]/60 text-[#F2E8DF] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
        title="Changer de langue / Switch language"
        aria-label="Language selection"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="uppercase text-[11px] font-bold text-[#D4AF37]">{language}</span>
        <span className="hidden xl:inline text-xs text-[#8B735B]">
          {language === 'fr' ? 'FR' : 'EN'}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#8B735B] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#D4AF37]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-[#14100E] border border-[#2D241F] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-[#8B735B] tracking-wider border-b border-[#2D241F] mb-1">
            Langue / Language
          </div>

          <button
            id="lang-option-fr"
            type="button"
            onClick={() => handleSelect('fr')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              language === 'fr'
                ? 'bg-[#2D241F] text-[#D4AF37] font-bold'
                : 'text-[#8B735B] hover:bg-[#1A1310] hover:text-[#F2E8DF]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇫🇷</span>
              <span>Français</span>
            </div>
            {language === 'fr' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
          </button>

          <button
            id="lang-option-en"
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-[#2D241F] text-[#D4AF37] font-bold'
                : 'text-[#8B735B] hover:bg-[#1A1310] hover:text-[#F2E8DF]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇬🇧</span>
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
          </button>
        </div>
      )}
    </div>
  );
};
