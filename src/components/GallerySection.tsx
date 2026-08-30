import React, { useState, useMemo, useRef } from 'react';
import { Artwork, ArtworkCategory, UserProfile } from '../types';
import { ARTWORKS_DATA } from '../data/museumData';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Headphones, 
  Grid, 
  Layers, 
  Eye, 
  MapPin, 
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Star
} from 'lucide-react';

interface GallerySectionProps {
  artworks?: Artwork[];
  currentUser?: UserProfile | null;
  onSelectArtwork: (artwork: Artwork) => void;
  favorites: string[];
  onToggleFavorite: (artworkId: string) => void;
  onOpenAdminDashboard?: () => void;
  onEditArtwork?: (artwork: Artwork) => void;
  onDeleteArtwork?: (artworkId: string) => void;
  onAddArtwork?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  artworks = ARTWORKS_DATA,
  currentUser,
  onSelectArtwork,
  favorites,
  onToggleFavorite,
  onOpenAdminDashboard,
  onEditArtwork,
  onDeleteArtwork,
  onAddArtwork
}) => {
  const { t, isFr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'carousel'>('grid');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser?.accountType === 'admin';

  const categories: { id: ArtworkCategory; label: string }[] = [
    { id: 'all', label: isFr ? 'Toutes les collections' : 'All Collections' },
    { id: 'masques_rituels', label: isFr ? 'Masques & Rituels' : 'Masks & Rituals' },
    { id: 'bronzes_metallurgie', label: isFr ? 'Bronzes & Métallurgie' : 'Bronzes & Metallurgy' },
    { id: 'textiles_tissages', label: isFr ? 'Textiles & Bogolan' : 'Textiles & Bogolan' },
    { id: 'art_contemporain', label: isFr ? 'Art Contemporain' : 'Contemporary Art' },
    { id: 'sciences_manuscrits', label: isFr ? 'Manuscrits & Sciences' : 'Manuscripts & Science' },
  ];

  // Real-time search and filter logic
  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(art.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }

      // Search query across title, artist/culture, country, era, pavilion, description
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesArtist = art.artistOrCulture.toLowerCase().includes(q);
        const matchesCountry = art.originCountry.toLowerCase().includes(q);
        const matchesPavilion = art.pavilion.toLowerCase().includes(q);
        const matchesEra = art.era.toLowerCase().includes(q);
        const matchesDesc = art.shortDescription.toLowerCase().includes(q) || art.fullHistory.toLowerCase().includes(q);

        if (!matchesTitle && !matchesArtist && !matchesCountry && !matchesPavilion && !matchesEra && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [artworks, searchQuery, selectedCategory, showOnlyFavorites, favorites]);

  // Masterpieces / Highlight artworks for the scrollable banner
  const highlightArtworks = useMemo(() => {
    return artworks.filter(art => art.isHighlight);
  }, [artworks]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="gallery-section" className="py-14 sm:py-20 bg-[#0E0A08] relative border-b border-[#2D241F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Quick Action Banner if logged in as admin */}
        {isAdmin && (
          <div className="mb-8 p-4 rounded-2xl bg-[#14100E] border border-[#D4AF37]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-sm text-[#F2E8DF] flex items-center gap-2">
                  <span>{isFr ? 'Mode Gestion Administrateur Actif' : 'Administrator Management Mode Active'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold">
                    {currentUser.adminTitle || (isFr ? 'Direction du Musée' : 'Museum Direction')}
                  </span>
                </h3>
                <p className="text-xs text-[#8B735B]">
                  {isFr 
                    ? 'Vous pouvez ajouter, éditer ou supprimer des œuvres directement sur cette page ou depuis la console.'
                    : 'You can add, edit, or delete artworks directly here or from the admin console.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {onAddArtwork && (
                <button
                  id="btn-admin-gallery-add"
                  type="button"
                  onClick={onAddArtwork}
                  className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('adminAddArtwork')}</span>
                </button>
              )}

              {onOpenAdminDashboard && (
                <button
                  type="button"
                  onClick={onOpenAdminDashboard}
                  className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#F2E8DF] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isFr ? 'Ouvrir Console' : 'Open Console'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14100E] border border-[#2D241F] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('treasuresSection')}</span>
            </div>
            <h2 className="font-syne text-2xl sm:text-4xl font-bold text-[#F2E8DF] tracking-tight">
              {t('interactiveGallery')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8B735B] mt-1 max-w-2xl">
              {t('gallerySubtitle', { count: artworks.length })}
            </p>
          </div>

          {/* Quick Display Switcher */}
          <div className="flex items-center gap-2 bg-[#14100E] p-1 rounded-xl border border-[#2D241F] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setDisplayMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-md font-bold'
                  : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t('gridMode')} ({filteredArtworks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('carousel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                displayMode === 'carousel'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-md font-bold'
                  : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('highlightsMode')} ({highlightArtworks.length})</span>
            </button>
          </div>
        </div>

        {/* Masterpieces Spotlight Carousel */}
        {highlightArtworks.length > 0 && (
          <div className="mb-12 bg-[#14100E] rounded-3xl p-6 border border-[#2D241F] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <h3 className="font-syne text-sm sm:text-base font-bold uppercase tracking-wider text-[#F2E8DF]">
                  {t('spotlightTitle')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="p-2 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="p-2 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                  title="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {highlightArtworks.map((art) => {
                const isFav = favorites.includes(art.id);
                return (
                  <div
                    key={art.id}
                    onClick={() => onSelectArtwork(art)}
                    className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-[#1A1310] rounded-2xl border border-[#2D241F] hover:border-[#D4AF37] p-3.5 flex flex-col justify-between cursor-pointer group transition-all duration-300 shadow-lg hover:-translate-y-1 flex-shrink-0"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-[#0A0A0A]">
                      <img 
                        src={art.imageUrl} 
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-transparent to-transparent" />
                      
                      <span className="absolute top-2.5 left-2.5 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-black uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> {t('masterpieceBadge')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(art.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                          isFav 
                            ? 'bg-[#9B3922] border-[#D4AF37] text-[#F2E8DF]' 
                            : 'bg-black/60 border-white/20 text-white hover:bg-black'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white">
                        <span className="bg-[#14100E]/90 px-2 py-0.5 rounded text-[#D4AF37] font-semibold">{art.originCountry}</span>
                        <span className="text-[#8B735B]">{art.era}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                        {art.artistOrCulture}
                      </span>
                      <h4 className="font-syne font-bold text-sm text-[#F2E8DF] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#8B735B] mt-1 line-clamp-2">
                        {art.shortDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#2D241F] flex items-center justify-between text-xs text-[#D4AF37] font-semibold">
                      <span className="flex items-center gap-1 group-hover:underline">
                        <Eye className="w-3.5 h-3.5" />
                        {t('viewFile')}
                      </span>
                      <span className="text-[10px] text-[#8B735B] font-normal">
                        {t('levelPrefix')} {art.floor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-time Search Bar & Category Filter Controls */}
        <div className="bg-[#14100E] rounded-3xl border border-[#2D241F] p-4 sm:p-6 mb-8 shadow-xl space-y-4">
          
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-artwork-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-2xl pl-12 pr-10 py-3.5 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8B735B] hover:text-[#F2E8DF] px-2 py-1 bg-[#14100E] rounded-lg cursor-pointer"
              >
                {t('clearSearch')}
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2D241F]">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-chip-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-md font-bold'
                      : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Favorite Filter Button */}
            <button
              type="button"
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-[#9B3922] text-[#F2E8DF]'
                  : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current text-[#F2E8DF]' : 'text-[#D4AF37]'}`} />
              <span>{t('favoritesFilter')} ({favorites.length})</span>
            </button>
          </div>

        </div>

        {/* Results Counter & Active Query Feedback */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#8B735B]">
          <p>
            {t('showingCount', { count: filteredArtworks.length })}
            {searchQuery && <span> {t('forQuery')} « <em className="text-[#F2E8DF]">{searchQuery}</em> »</span>}
          </p>

          {(searchQuery || selectedCategory !== 'all' || showOnlyFavorites) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowOnlyFavorites(false);
              }}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('resetFilters')}</span>
            </button>
          )}
        </div>

        {/* Main Artwork Grid */}
        {filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((art) => {
              const isFav = favorites.includes(art.id);
              return (
                <div
                  key={art.id}
                  id={`gallery-item-${art.id}`}
                  onClick={() => onSelectArtwork(art)}
                  className="bg-[#14100E] rounded-3xl border border-[#2D241F] hover:border-[#D4AF37] p-4 flex flex-col justify-between cursor-pointer group transition-all duration-300 shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-56 rounded-2xl overflow-hidden mb-3 bg-[#0A0A0A]">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-transparent to-black/30" />
                    
                    {/* Top tags */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="bg-[#14100E]/80 backdrop-blur-sm text-[#F2E8DF] text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-[#2D241F]">
                        {art.era}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(art.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                          isFav 
                            ? 'bg-[#9B3922] border-[#D4AF37] text-white shadow-md' 
                            : 'bg-black/60 border-white/20 text-white hover:bg-black'
                        }`}
                        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                      <span className="bg-[#9B3922]/90 px-2 py-0.5 rounded text-[10px] font-bold">
                        {art.originCountry}
                      </span>
                      <span className="flex items-center gap-1 bg-[#14100E]/90 text-[#D4AF37] px-2 py-0.5 rounded text-[10px] border border-[#2D241F]">
                        <Headphones className="w-3 h-3 text-[#D4AF37]" />
                        {art.audioDuration || 'Audio'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      {art.artistOrCulture}
                    </span>
                    <h3 className="font-syne font-bold text-base text-[#F2E8DF] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#8B735B] mt-1.5 line-clamp-2">
                      {art.shortDescription}
                    </p>
                  </div>

                  {/* Admin controls or Visitor link */}
                  {isAdmin ? (
                    <div 
                      className="mt-4 pt-3 border-t border-[#2D241F] flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onEditArtwork && onEditArtwork(art)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[11px] font-semibold text-[#D4AF37] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{t('edit')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteArtwork && onDeleteArtwork(art.id)}
                        className="py-1.5 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-[11px] font-semibold text-red-300 flex items-center justify-center gap-1 cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-[#2D241F] flex items-center justify-between text-xs">
                      <span className="text-[#D4AF37] font-semibold flex items-center gap-1 group-hover:underline">
                        <Eye className="w-3.5 h-3.5" />
                        {t('viewStory')}
                      </span>

                      <span className="text-[11px] text-[#8B735B]">
                        {t('levelPrefix')} {art.floor}
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty search state */
          <div className="bg-[#14100E] rounded-3xl border border-[#2D241F] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-syne text-lg font-bold text-[#F2E8DF]">
              {t('noArtworkMatch')}
            </h4>
            <p className="text-xs text-[#8B735B] max-w-md mx-auto">
              {t('noArtworkDesc')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowOnlyFavorites(false);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              {t('showAllCollections')}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

