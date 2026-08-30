import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Ticket, 
  Heart, 
  Map, 
  LogOut, 
  Sparkles, 
  Clock, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { museumAudio } from '../utils/audioSynth';

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenTicketsModal: () => void;
  onOpenMapModal: () => void;
  onOpenCuratorModal: () => void;
  onOpenMyTickets: () => void;
  onScrollToSection: (sectionId: string) => void;
  favoritesCount: number;
  onOpenAdminDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenTicketsModal,
  onOpenMapModal,
  onOpenCuratorModal,
  onOpenMyTickets,
  onScrollToSection,
  favoritesCount,
  onOpenAdminDashboard
}) => {
  const { t, language, isFr } = useLanguage();
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [dakarTime, setDakarTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user.accountType === 'admin';

  // Keep live Dakar (GMT) clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Dakar is UTC/GMT (no daylight saving)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Dakar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setDakarTime(new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const toggleAmbientMusic = () => {
    if (isAmbientPlaying) {
      museumAudio.stopAmbientSoundtrack();
      setIsAmbientPlaying(false);
    } else {
      museumAudio.startAmbientSoundtrack();
      setIsAmbientPlaying(true);
    }
  };

  const getRoleLabel = () => {
    if (isAdmin) {
      return user.adminTitle || t('roleAdmin');
    }
    switch (user.role) {
      case 'visiteur_local': return t('roleResident');
      case 'etudiant': return t('roleStudent');
      case 'touriste_international': return t('roleTourist');
      case 'membre_privilege': return t('rolePrivilege');
      default: return t('roleVisitor');
    }
  };

  return (
    <nav id="mcn-navbar" className="sticky top-0 z-40 bg-[#14100E]/95 backdrop-blur-md border-b border-[#2D241F] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Dakar Info */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onScrollToSection('dashboard-hero')}>
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.35)] flex-shrink-0">
              <span className="font-cinzel text-lg font-black text-[#0A0A0A]">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-syne font-bold text-sm sm:text-base tracking-wider uppercase text-[#D4AF37]">
                  {t('museumShort')}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-[#9B3922] text-[#F2E8DF] text-[9px] font-black uppercase tracking-wider">
                    {t('adminBadge')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-[#8B735B]">
                <span className="text-[#8B735B] uppercase tracking-wider text-[10px]">{t('subLocation')}</span>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#3D2B22]" />
                <span className="hidden sm:flex items-center gap-1 text-[#8B735B]">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  <span>{dakarTime || '10:00'} {t('gmtTime')}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0A0A0A] text-emerald-400 border border-emerald-900/60 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  {t('openStatus')}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              id="nav-link-events"
              type="button"
              onClick={() => onScrollToSection('events-section')}
              className="text-xs font-semibold uppercase tracking-widest text-[#8B735B] hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              {t('navEvents')}
            </button>

            <button
              id="nav-link-gallery"
              type="button"
              onClick={() => onScrollToSection('gallery-section')}
              className="text-xs font-semibold uppercase tracking-widest text-[#8B735B] hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              {t('navGallery')}
            </button>

            <button
              id="nav-link-map"
              type="button"
              onClick={onOpenMapModal}
              className="text-xs font-semibold uppercase tracking-widest text-[#8B735B] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('navMap')}</span>
            </button>

            <button
              id="nav-link-curator"
              type="button"
              onClick={onOpenCuratorModal}
              className="text-xs font-semibold uppercase tracking-widest text-[#8B735B] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('navCurator')}</span>
            </button>

            <button
              id="nav-link-guestbook"
              type="button"
              onClick={() => onScrollToSection('guestbook-section')}
              className="text-xs font-semibold uppercase tracking-widest text-[#8B735B] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📖</span>
              <span>{t('navGuestbook')}</span>
            </button>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Language Switcher in Navbar */}
            <LanguageSwitcher variant="dropdown" />

            {/* Ambient Kora Music Sound Toggle */}
            <button
              id="btn-toggle-ambient"
              type="button"
              onClick={toggleAmbientMusic}
              title={isAmbientPlaying ? t('navMuteSound') : t('navPlaySound')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isAmbientPlaying 
                  ? 'bg-[#2D241F] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                  : 'bg-[#14100E] border-[#2D241F] text-[#8B735B] hover:text-[#D4AF37]'
              }`}
            >
              {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#8B735B]" />}
              <span className="text-xs font-medium hidden md:inline">
                {isAmbientPlaying ? t('navAmbient') : t('navSound')}
              </span>
            </button>

            {/* Admin Console Shortcut Button if Admin */}
            {isAdmin && onOpenAdminDashboard && (
              <button
                id="nav-btn-admin-console"
                type="button"
                onClick={onOpenAdminDashboard}
                className="py-2.5 px-3.5 rounded-xl bg-[#9B3922]/20 hover:bg-[#9B3922]/40 border border-[#9B3922] text-[#F2E8DF] font-syne font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title={t('navAdminConsole')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('navAdminConsole')}</span>
              </button>
            )}

            {/* Booked Tickets Shortcut */}
            <button
              id="btn-my-tickets"
              type="button"
              onClick={onOpenMyTickets}
              className="relative p-2.5 rounded-xl bg-[#14100E] hover:bg-[#1A1310] border border-[#2D241F] text-[#F2E8DF] hover:border-[#D4AF37]/50 transition-colors cursor-pointer flex items-center gap-1.5"
              title={t('navMyTickets')}
            >
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold hidden md:inline">{t('navTicketsCount')}</span>
              {user.bookedTickets.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black flex items-center justify-center border border-[#0A0A0A]">
                  {user.bookedTickets.length}
                </span>
              )}
            </button>

            {/* Primary Ticket Purchase Button */}
            <button
              id="nav-btn-buy-ticket"
              type="button"
              onClick={onOpenTicketsModal}
              className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{t('navTicketing')}</span>
            </button>

            {/* User Profile Pill / Dropdown */}
            <div className="relative">
              <button
                id="btn-user-profile-toggle"
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#14100E] border border-[#2D241F] hover:border-[#D4AF37]/60 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B3922] to-[#D4AF37] p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#14100E] flex items-center justify-center text-[#D4AF37] font-bold text-xs">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-semibold text-[#F2E8DF] leading-tight truncate max-w-[100px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#8B735B] leading-tight">
                    {getRoleLabel()}
                  </p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#14100E] border border-[#2D241F] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2.5 border-b border-[#2D241F] mb-2">
                    <p className="text-xs font-bold text-[#F2E8DF]">{user.name}</p>
                    <p className="text-[11px] text-[#8B735B] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] text-[#D4AF37] font-semibold bg-[#0A0A0A] px-2 py-0.5 rounded-full border border-[#2D241F]">
                      {getRoleLabel()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#8B735B]">
                    {isAdmin && onOpenAdminDashboard && (
                      <button
                        type="button"
                        onClick={() => { onOpenAdminDashboard(); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-[#9B3922]/20 hover:bg-[#9B3922]/40 text-[#F2E8DF] text-left cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-semibold">{t('navAdminConsole')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => { onOpenMyTickets(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#2D241F] hover:text-[#D4AF37] text-left cursor-pointer transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('navMyTickets')} ({user.bookedTickets.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onScrollToSection('gallery-section'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#2D241F] hover:text-[#D4AF37] text-left cursor-pointer transition-colors"
                    >
                      <Heart className="w-4 h-4 text-[#E2725B]" />
                      <span>{t('navFavoriteArtworks')} ({favoritesCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onOpenMapModal(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#2D241F] hover:text-[#D4AF37] text-left cursor-pointer transition-colors"
                    >
                      <Map className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('navPavilionMap')}</span>
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#2D241F]">
                    <button
                      type="button"
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-xs font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSwitcher variant="pill" />

            {isAdmin && onOpenAdminDashboard && (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="py-1.5 px-2.5 rounded-lg bg-[#9B3922] text-[#F2E8DF] text-[10px] font-bold"
              >
                {t('adminBadge')}
              </button>
            )}
            <button
              id="btn-mobile-buy-ticket"
              type="button"
              onClick={onOpenTicketsModal}
              className="py-1.5 px-3 rounded-lg bg-[#D4AF37] text-[#0A0A0A] font-syne font-bold text-xs"
            >
              {t('navPass')}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#14100E] border border-[#2D241F] text-[#F2E8DF]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2D241F] bg-[#14100E] px-4 py-4 space-y-3 animate-in fade-in">
          
          {/* Language Switcher in Mobile Drawer */}
          <div className="pb-1 border-b border-[#2D241F]">
            <p className="text-[11px] text-[#8B735B] font-semibold mb-1.5 uppercase tracking-wider">
              {t('switchLang')}
            </p>
            <LanguageSwitcher variant="inline" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1310] border border-[#2D241F]">
            <div>
              <p className="text-sm font-bold text-[#F2E8DF]">{user.name}</p>
              <p className="text-xs text-[#D4AF37]">{getRoleLabel()}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-rose-400 hover:underline"
            >
              {t('navLogout')}
            </button>
          </div>

          {isAdmin && onOpenAdminDashboard && (
            <button
              type="button"
              onClick={() => { onOpenAdminDashboard(); setMobileMenuOpen(false); }}
              className="w-full p-3 rounded-xl bg-[#9B3922] text-white font-syne font-bold text-xs flex items-center justify-between shadow-md"
            >
              <span>🛡️ {t('navAdminConsole')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { onScrollToSection('events-section'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#1A1310] border border-[#2D241F] text-left font-semibold text-[#F2E8DF]"
            >
              📅 {t('navEvents')}
            </button>
            <button
              type="button"
              onClick={() => { onScrollToSection('gallery-section'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#1A1310] border border-[#2D241F] text-left font-semibold text-[#F2E8DF]"
            >
              🎨 {t('navGallery')}
            </button>
            <button
              type="button"
              onClick={() => { onOpenMyTickets(); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#1A1310] border border-[#2D241F] text-left font-semibold text-[#F2E8DF] flex items-center justify-between"
            >
              <span>🎟️ {t('navMyTickets')}</span>
              <span className="bg-[#D4AF37] text-[#0A0A0A] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {user.bookedTickets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { onOpenMapModal(); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#1A1310] border border-[#2D241F] text-left font-semibold text-[#F2E8DF]"
            >
              🗺️ {t('navPavilionMap')}
            </button>
            <button
              type="button"
              onClick={() => { onScrollToSection('guestbook-section'); setMobileMenuOpen(false); }}
              className="col-span-2 p-3 rounded-xl bg-[#1A1310] border border-[#2D241F] text-left font-semibold text-[#F2E8DF] flex items-center justify-between"
            >
              <span>📖 {t('navGuestbook')} (Avis Vérifiés)</span>
              <span className="text-xs text-[#D4AF37]">★★★★★</span>
            </button>
            <button
              type="button"
              onClick={() => { onOpenCuratorModal(); setMobileMenuOpen(false); }}
              className="col-span-2 p-3 rounded-xl bg-[#2D241F] border border-[#D4AF37]/50 text-left font-semibold text-[#D4AF37] flex items-center justify-between"
            >
              <span>✨ {t('navCurator')}</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}

    </nav>
  );
};

