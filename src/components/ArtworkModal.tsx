import React, { useState, useEffect } from 'react';
import { Artwork } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Heart, 
  Share2, 
  Headphones, 
  MapPin, 
  Layers, 
  Calendar, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Check,
  Maximize2,
  BookOpen,
  Info
} from 'lucide-react';
import { museumAudio } from '../utils/audioSynth';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (artworkId: string) => void;
  onOpenMapLocation: (floor: number) => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenMapLocation
}) => {
  const { t, isFr } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'histoire' | 'spiritualite' | 'fiche'>('histoire');

  // Stop audio on modal close or unmount
  useEffect(() => {
    return () => {
      museumAudio.stopSpeaking();
      museumAudio.stopAmbientSoundtrack();
    };
  }, []);

  if (!artwork) return null;

  const toggleAudioGuide = () => {
    if (isPlayingAudio) {
      museumAudio.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      museumAudio.startAmbientSoundtrack();
      const narrative = isFr 
        ? `${artwork.title}. Origine : ${artwork.originCountry}, ${artwork.artistOrCulture}. Époque : ${artwork.era}. ${artwork.shortDescription} ${artwork.fullHistory}`
        : `${artwork.title}. Origin: ${artwork.originCountry}, ${artwork.artistOrCulture}. Era: ${artwork.era}. ${artwork.shortDescription} ${artwork.fullHistory}`;
      museumAudio.speakText(narrative, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div 
        id="artwork-detail-modal"
        className="relative w-full max-w-4xl bg-[#231F1A] border border-[#3F372E] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => onToggleFavorite(artwork.id)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              isFavorite 
                ? 'bg-[#C05621] border-[#D97706] text-white shadow-lg shadow-[#C05621]/40' 
                : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
            }`}
            title={isFavorite ? (isFr ? "Retirer des favoris" : "Remove from favorites") : (isFr ? "Ajouter aux favoris" : "Add to favorites")}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
            title={isFr ? "Partager le lien de l'œuvre" : "Share artwork link"}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          
          {/* Left Column: Artwork Image & Interactive Controls */}
          <div className="lg:col-span-5 bg-[#181512] flex flex-col justify-between p-6 border-b lg:border-b-0 lg:border-r border-[#2F2A23] relative">
            <div className="relative rounded-2xl overflow-hidden group bg-black/40 border border-[#3F372E]">
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title}
                className={`w-full object-cover transition-all duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out h-[360px]' : 'h-72 sm:h-80 cursor-zoom-in group-hover:scale-105'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/70 backdrop-blur-sm text-white hover:bg-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isZoomed ? (isFr ? 'Réduire' : 'Shrink') : (isFr ? 'Zoom HD' : 'HD Zoom')}</span>
              </button>

              <div className="absolute bottom-3 left-3 text-[11px] text-white/90 bg-[#181512]/80 px-2.5 py-1 rounded backdrop-blur-sm">
                <span>{artwork.originCountry}</span>
              </div>
            </div>

            {/* Audio Guide Interactive Bar */}
            <div className="mt-4 bg-[#231F1A] p-4 rounded-2xl border border-[#D97706]/40 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs font-bold text-[#FAF7F2]">{t('audioGuideTitle')}</span>
                </div>
                <span className="text-[11px] text-[#D97706] font-semibold">{artwork.audioDuration || '2 min 30 s'}</span>
              </div>

              <p className="text-[11px] text-[#D8CEBE] mb-3 line-clamp-2">
                {artwork.audioStory || (isFr ? "Écoutez l'histoire et les secrets de création narrés par le conservateur du musée." : "Listen to history and creative secrets narrated by the museum curator.")}
              </p>

              <button
                id="btn-play-audio-guide"
                type="button"
                onClick={toggleAudioGuide}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-[#C05621] to-[#9C4119] hover:from-[#D97706] text-white shadow-md'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{isFr ? "Arrêter l'écoute narrative" : "Stop narrative audio"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t('listenAudioGuide')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Pavilion Location Tag */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMapLocation(artwork.floor);
              }}
              className="mt-3 w-full p-3 rounded-xl bg-[#181512] hover:bg-[#2F2A23] border border-[#3F372E] text-left text-xs flex items-center justify-between text-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D97706] group-hover:scale-110 transition-transform" />
                <span className="truncate">{artwork.pavilion}</span>
              </div>
              <span className="text-[10px] text-[#D97706] underline">{isFr ? 'Voir sur le plan' : 'View on map'}</span>
            </button>

          </div>

          {/* Right Column: Detailed Narrative, Cultural & Technical Specs */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#C05621]/20 border border-[#D97706]/40 text-[#D97706] text-[10px] font-bold uppercase tracking-wider">
                  {artwork.artistOrCulture}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#181512] border border-[#3F372E] text-[#FAF7F2]/80 text-[10px]">
                  {artwork.era}
                </span>
                {artwork.isHighlight && (
                  <span className="px-2 py-0.5 rounded bg-[#D97706] text-[#181512] text-[10px] font-black uppercase">
                    {t('masterpieceBadge')}
                  </span>
                )}
              </div>

              <h2 className="font-syne text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] leading-tight">
                {artwork.title}
              </h2>
              {artwork.subtitle && (
                <p className="text-xs sm:text-sm text-[#D97706] font-medium mt-1">
                  {artwork.subtitle}
                </p>
              )}
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-[#2F2A23] gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('histoire')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'histoire' 
                    ? 'text-[#D97706] border-b-2 border-[#D97706]' 
                    : 'text-[#FAF7F2]/60 hover:text-white'
                }`}
              >
                {isFr ? 'Histoire & Origine' : 'History & Origin'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spiritualite')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'spiritualite' 
                    ? 'text-[#D97706] border-b-2 border-[#D97706]' 
                    : 'text-[#FAF7F2]/60 hover:text-white'
                }`}
              >
                {isFr ? 'Symbolique & Rituels' : 'Symbolism & Rituals'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fiche')}
                className={`pb-2 transition-colors cursor-pointer ${
                  activeTab === 'fiche' 
                    ? 'text-[#D97706] border-b-2 border-[#D97706]' 
                    : 'text-[#FAF7F2]/60 hover:text-white'
                }`}
              >
                {isFr ? 'Fiche Technique' : 'Fact Sheet'}
              </button>
            </div>

            {/* Tab Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#D8CEBE]">
              {activeTab === 'histoire' && (
                <div className="space-y-3">
                  <p className="font-medium text-[#FAF7F2]">
                    {artwork.shortDescription}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {artwork.fullHistory}
                  </p>
                </div>
              )}

              {activeTab === 'spiritualite' && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#181512] rounded-2xl border border-[#D97706]/30">
                    <h4 className="text-xs font-bold text-[#D97706] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isFr ? 'Signification Rituelle & Cosmogonie' : 'Ritual Significance & Cosmology'}
                    </h4>
                    <p className="text-xs text-[#FAF7F2]/90 leading-relaxed">
                      {artwork.spiritualMeaning || (isFr ? "Objet cérémoniel incarnant le dialogue permanent entre les ancêtres, les forces de la nature et la gouvernance communautaire." : "Ceremonial object embodying continuous communion between ancestors, forces of nature, and community.")}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'fiche' && (
                <div className="grid grid-cols-2 gap-3 bg-[#181512] p-4 rounded-2xl border border-[#2F2A23] text-xs">
                  <div>
                    <span className="text-[#FAF7F2]/50 text-[10px] block">{isFr ? 'Région & Pays' : 'Region & Country'}</span>
                    <span className="font-bold text-[#FAF7F2]">{artwork.originRegion ? `${artwork.originRegion}, ` : ''}{artwork.originCountry}</span>
                  </div>
                  <div>
                    <span className="text-[#FAF7F2]/50 text-[10px] block">{isFr ? 'Époque / Datation' : 'Period / Date'}</span>
                    <span className="font-bold text-[#FAF7F2]">{artwork.era}</span>
                  </div>
                  <div>
                    <span className="text-[#FAF7F2]/50 text-[10px] block">{isFr ? 'Dimensions' : 'Dimensions'}</span>
                    <span className="font-bold text-[#FAF7F2]">{artwork.dimensions || (isFr ? 'Non précisé' : 'Unspecified')}</span>
                  </div>
                  <div>
                    <span className="text-[#FAF7F2]/50 text-[10px] block">{isFr ? 'Entrée dans la collection' : 'Acquisition Year'}</span>
                    <span className="font-bold text-[#FAF7F2]">{artwork.acquisitionYear || (isFr ? 'Collection permanente' : 'Permanent collection')}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#2F2A23]">
                    <span className="text-[#FAF7F2]/50 text-[10px] block mb-1">{isFr ? 'Matériaux & Techniques' : 'Materials & Mediums'}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {artwork.materials.map((mat, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#231F1A] border border-[#3F372E] text-[11px] text-[#D8CEBE]">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="pt-4 border-t border-[#2F2A23] flex items-center justify-between">
              <span className="text-[11px] text-[#FAF7F2]/60">
                {t('museumFullName')} • Dakar
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#181512] hover:bg-[#2F2A23] border border-[#3F372E] text-xs font-semibold text-[#FAF7F2] transition-colors cursor-pointer"
              >
                {t('close')}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

