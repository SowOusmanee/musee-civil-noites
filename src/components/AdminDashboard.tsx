import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Artwork, 
  TicketType, 
  MuseumEvent, 
  BookedTicket, 
  ArtworkCategory,
  GuestbookReview
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { museumAudio } from '../utils/audioSynth';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Search, 
  Eye, 
  LogOut, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  Image as ImageIcon, 
  Clock, 
  MapPin, 
  User, 
  ArrowUpRight, 
  RefreshCw,
  QrCode,
  Tag,
  Star,
  FileText,
  Camera,
  Scan,
  CheckCircle2,
  XCircle,
  Zap,
  Volume2,
  Database,
  BarChart3,
  MessageSquareQuote,
  Reply,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { RevenueAnalytics } from './RevenueAnalytics';

interface AdminDashboardProps {
  user: UserProfile;
  artworks: Artwork[];
  ticketTypes: TicketType[];
  events: MuseumEvent[];
  bookedTickets: BookedTicket[];
  guestbookReviews?: GuestbookReview[];
  onAddArtwork: (artwork: Artwork) => void;
  onUpdateArtwork: (artwork: Artwork) => void;
  onDeleteArtwork: (artworkId: string) => void;
  onUpdateTicketPrice: (typeId: string, priceCFA: number, priceEUR: number, updates?: Partial<TicketType>) => void;
  onAddTicketType: (ticketType: TicketType) => void;
  onDeleteTicketType: (ticketTypeId: string) => void;
  onAddEvent: (event: MuseumEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onValidateTicket?: (ticketId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onAdminReply?: (reviewId: string, reply: { author: string; message: string; date: string }) => void;
  onSwitchToVisitorView: () => void;
  onLogout: () => void;
  onResetDefaults: () => void;
}

type AdminTab = 'artworks' | 'tickets' | 'events' | 'analytics' | 'revenue' | 'guestbook';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  artworks,
  ticketTypes,
  events,
  bookedTickets,
  guestbookReviews = [],
  onAddArtwork,
  onUpdateArtwork,
  onDeleteArtwork,
  onUpdateTicketPrice,
  onAddTicketType,
  onDeleteTicketType,
  onAddEvent,
  onDeleteEvent,
  onValidateTicket,
  onDeleteReview,
  onAdminReply,
  onSwitchToVisitorView,
  onLogout,
  onResetDefaults
}) => {
  const { t, isFr } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('artworks');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ArtworkCategory>('all');
  
  // Artwork Modals
  const [isAddArtworkModalOpen, setIsAddArtworkModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);

  // Ticket Pricing Edit State
  const [ticketPricesDraft, setTicketPricesDraft] = useState<Record<string, { cfa: number; eur: number }>>(() => {
    const initial: Record<string, { cfa: number; eur: number }> = {};
    ticketTypes.forEach(t => {
      initial[t.id] = { cfa: t.priceCFA, eur: t.priceEUR };
    });
    return initial;
  });
  const [ticketSaveSuccess, setTicketSaveSuccess] = useState(false);

  // Event Modals
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<MuseumEvent | null>(null);

  // QR Scanner State for Museum Entry Validation
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanValidationResult, setScanValidationResult] = useState<{
    status: 'success' | 'already_used' | 'not_found';
    ticket?: BookedTicket;
    message: string;
  } | null>(null);

  // Guestbook Moderation State
  const [guestbookFilter, setGuestbookFilter] = useState<'all' | 'unreplied' | '5stars' | 'verified'>('all');
  const [activeReplyingId, setActiveReplyingId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');

  const handleValidateTicketByCode = (ticketIdToScan: string) => {
    const cleanId = ticketIdToScan.trim().toUpperCase();
    if (!cleanId) return;

    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      const found = bookedTickets.find(t => t.ticketId.toUpperCase() === cleanId);
      if (!found) {
        // Play error sound for not found ticket
        museumAudio.playScanError();
        setScanValidationResult({
          status: 'not_found',
          message: isFr 
            ? `Billet introuvable avec la référence "${cleanId}". Vérifiez le code ou la réservation.` 
            : `Ticket with reference "${cleanId}" not found in registry.`
        });
      } else if (found.status === 'used') {
        // Play error sound for already used ticket
        museumAudio.playScanError();
        setScanValidationResult({
          status: 'already_used',
          ticket: found,
          message: isFr 
            ? `Attention : Ce billet a déjà été validé à l'entrée${found.validatedAt ? ` (${found.validatedAt})` : ''} !` 
            : `Warning: This pass was already validated at the gate${found.validatedAt ? ` (${found.validatedAt})` : ''}!`
        });
      } else {
        // Play success sound for valid ticket
        museumAudio.playScanSuccess();
        if (onValidateTicket) {
          onValidateTicket(found.ticketId);
        }
        setScanValidationResult({
          status: 'success',
          ticket: { ...found, status: 'used', validatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
          message: isFr 
            ? `Accès autorisé ! Billet validé avec succès pour ${found.visitorName} (${found.quantity} personne(s)).` 
            : `Access granted! Successfully validated entry for ${found.visitorName} (${found.quantity} guest(s)).`
        });
      }
    }, 600);
  };

  // Form State for Adding / Editing Artwork
  const [artworkFormData, setArtworkFormData] = useState<Partial<Artwork>>({
    title: '',
    subtitle: '',
    artistOrCulture: '',
    originCountry: 'Sénégal',
    originRegion: '',
    era: 'XXe siècle',
    category: 'masques_rituels',
    pavilion: "Galerie des Rituels & Masques - 1er Étage",
    floor: 1,
    imageUrl: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80',
    shortDescription: '',
    fullHistory: '',
    spiritualMeaning: '',
    materials: ['Bois sculpté', 'Pigments naturels'],
    dimensions: '40 × 25 × 15 cm',
    acquisitionYear: new Date().getFullYear().toString(),
    isHighlight: false,
    audioDuration: '2 min 30 s',
    audioStory: ''
  });

  // Sample Preset Images for Artwork Form Quick-Select
  const sampleArtworkImages = [
    { label: isFr ? 'Masque Rituel' : 'Ritual Mask', url: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80' },
    { label: isFr ? 'Bronze Ife' : 'Ife Bronze', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80' },
    { label: isFr ? 'Textile Kente' : 'Kente Textile', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80' },
    { label: isFr ? 'Statue Ancêtre' : 'Ancestor Statue', url: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80' },
    { label: isFr ? 'Art Contemporain' : 'Contemporary Art', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
    { label: isFr ? 'Poterie & Terre' : 'Pottery & Clay', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80' },
  ];

  // Form State for Adding Event
  const [eventFormData, setEventFormData] = useState<Partial<MuseumEvent>>({
    title: '',
    category: isFr ? 'Exposition Temporaire' : 'Temporary Exhibition',
    time: '15h00 - 17h00',
    location: 'Auditorium Léopold Sédar Senghor',
    speakerOrArtist: '',
    description: '',
    fullDetails: '',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    isToday: true,
    seatsLeft: 45,
    badge: isFr ? 'Nouveau' : 'New'
  });

  // Calculate Key Admin Analytics
  const totalRevenueCFA = bookedTickets.reduce((sum, t) => sum + (t.totalPriceCFA || 0), 0);
  const totalTicketsIssued = bookedTickets.reduce((sum, t) => sum + (t.quantity || 1), 0);

  // Filter artworks in admin tab
  const filteredArtworks = artworks.filter(art => {
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;
    const matchesQuery = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artistOrCulture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.originCountry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleOpenAddArtwork = () => {
    setEditingArtwork(null);
    setArtworkFormData({
      title: '',
      subtitle: '',
      artistOrCulture: '',
      originCountry: 'Sénégal',
      originRegion: '',
      era: isFr ? 'XXe siècle' : '20th Century',
      category: 'masques_rituels',
      pavilion: isFr ? "Galerie des Rituels & Masques - 1er Étage" : "Rituals & Masks Gallery - 1st Floor",
      floor: 1,
      imageUrl: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80',
      shortDescription: '',
      fullHistory: '',
      spiritualMeaning: '',
      materials: isFr ? ['Bois sculpté', 'Pigments minéraux'] : ['Carved Wood', 'Mineral Pigments'],
      dimensions: '35 × 20 × 15 cm',
      acquisitionYear: new Date().getFullYear().toString(),
      isHighlight: false,
      audioDuration: '2 min 30 s',
      audioStory: ''
    });
    setIsAddArtworkModalOpen(true);
  };

  const handleOpenEditArtwork = (art: Artwork) => {
    setEditingArtwork(art);
    setArtworkFormData({ ...art });
    setIsAddArtworkModalOpen(true);
  };

  const handleSaveArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkFormData.title || !artworkFormData.artistOrCulture) {
      alert(isFr ? 'Veuillez renseigner le titre de l\'œuvre et la culture / l\'artiste.' : 'Please provide artwork title and culture/artist.');
      return;
    }

    if (editingArtwork) {
      // Update existing artwork
      const updated: Artwork = {
        ...editingArtwork,
        ...artworkFormData as Artwork,
        materials: Array.isArray(artworkFormData.materials) 
          ? artworkFormData.materials 
          : String(artworkFormData.materials || '').split(',').map(s => s.trim())
      };
      onUpdateArtwork(updated);
    } else {
      // Create new artwork
      const newArtwork: Artwork = {
        id: 'mcn-art-custom-' + Date.now(),
        title: artworkFormData.title || (isFr ? 'Œuvre MCN' : 'MCN Artwork'),
        subtitle: artworkFormData.subtitle || '',
        artistOrCulture: artworkFormData.artistOrCulture || (isFr ? 'Culture Panafricaine' : 'Pan-African Culture'),
        originCountry: artworkFormData.originCountry || 'Sénégal',
        originRegion: artworkFormData.originRegion || '',
        era: artworkFormData.era || (isFr ? 'Contemporain' : 'Contemporary'),
        category: (artworkFormData.category as ArtworkCategory) || 'masques_rituels',
        pavilion: artworkFormData.pavilion || (isFr ? "Galerie des Collections - 1er Étage" : "Collections Gallery - 1st Floor"),
        floor: Number(artworkFormData.floor) || 1,
        imageUrl: artworkFormData.imageUrl || sampleArtworkImages[0].url,
        shortDescription: artworkFormData.shortDescription || (isFr ? 'Pièce de la collection nationale du MCN.' : 'Masterpiece from the MCN national collection.'),
        fullHistory: artworkFormData.fullHistory || artworkFormData.shortDescription || (isFr ? 'Œuvre acquise par le Musée des Civilisations Noires de Dakar.' : 'Artwork acquired by the Museum of Black Civilisations in Dakar.'),
        spiritualMeaning: artworkFormData.spiritualMeaning || '',
        materials: Array.isArray(artworkFormData.materials) 
          ? artworkFormData.materials 
          : String(artworkFormData.materials || '').split(',').map(s => s.trim()),
        dimensions: artworkFormData.dimensions || '',
        acquisitionYear: artworkFormData.acquisitionYear || new Date().getFullYear().toString(),
        isHighlight: Boolean(artworkFormData.isHighlight),
        audioDuration: artworkFormData.audioDuration || '2 min 00 s',
        audioStory: artworkFormData.audioStory || ''
      };
      onAddArtwork(newArtwork);
    }

    setIsAddArtworkModalOpen(false);
  };

  const handleConfirmDeleteArtwork = () => {
    if (artworkToDelete) {
      onDeleteArtwork(artworkToDelete.id);
      setArtworkToDelete(null);
    }
  };

  const handleSaveTicketPrices = () => {
    Object.entries(ticketPricesDraft).forEach(([typeId, prices]) => {
      const priceObj = prices as { cfa: number; eur: number };
      onUpdateTicketPrice(typeId, priceObj.cfa, priceObj.eur);
    });
    setTicketSaveSuccess(true);
    setTimeout(() => setTicketSaveSuccess(false), 3500);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title || !eventFormData.location) {
      alert(isFr ? 'Veuillez renseigner le titre et le lieu de l\'événement.' : 'Please provide event title and location.');
      return;
    }

    const newEvent: MuseumEvent = {
      id: 'mcn-event-' + Date.now(),
      title: eventFormData.title || (isFr ? 'Événement MCN' : 'MCN Event'),
      category: eventFormData.category || (isFr ? 'Exposition Temporaire' : 'Temporary Exhibition'),
      time: eventFormData.time || '15h00 - 17h00',
      location: eventFormData.location || 'Auditorium Senghor',
      speakerOrArtist: eventFormData.speakerOrArtist || '',
      description: eventFormData.description || '',
      fullDetails: eventFormData.fullDetails || eventFormData.description || '',
      imageUrl: eventFormData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      isToday: Boolean(eventFormData.isToday),
      seatsLeft: Number(eventFormData.seatsLeft) || 30,
      badge: eventFormData.badge || (isFr ? 'Exposition' : 'Exhibition')
    };

    onAddEvent(newEvent);
    setIsAddEventModalOpen(false);
  };

  return (
    <div id="mcn-admin-dashboard" className="min-h-screen bg-[#0A0A0A] text-[#F2E8DF] font-sans selection:bg-[#D4AF37] selection:text-[#0A0A0A] flex flex-col">
      
      {/* Admin Top Header Banner */}
      <header className="sticky top-0 z-40 bg-[#14100E]/95 backdrop-blur-md border-b border-[#2D241F] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#9B3922] border border-[#D4AF37]/50 flex items-center justify-center text-[#F2E8DF] shadow-[0_0_12px_rgba(212,175,55,0.2)] font-cinzel font-black text-lg">
                M
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-syne font-bold text-base text-[#F2E8DF]">
                    {isFr ? "Console d'Administration MCN" : "MCN Management Console"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider">
                    {isFr ? "Direction & Conservateur" : "Leadership & Curator"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Database className="w-2.5 h-2.5" />
                    <span>{isFr ? "Firestore Cloud Connecté" : "Firestore Live"}</span>
                  </span>
                </div>
                <p className="text-xs text-[#8B735B]">
                  {isFr ? "Connecté :" : "Logged in:"} <strong className="text-[#F2E8DF]">{user.name}</strong> ({user.adminTitle || (isFr ? 'Administrateur' : 'Administrator')})
                </p>
              </div>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex items-center gap-2 sm:hidden">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={onSwitchToVisitorView}
                className="p-2 rounded-xl bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <LanguageSwitcher />

            <button
              id="btn-switch-to-visitor"
              type="button"
              onClick={onSwitchToVisitorView}
              className="py-2 px-3.5 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] hover:border-[#D4AF37] text-xs font-syne font-bold text-[#D4AF37] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title={isFr ? "Aperçu direct de ce que voient les visiteurs" : "Direct preview of what visitors see"}
            >
              <Eye className="w-4 h-4" />
              <span>{isFr ? "Voir Vue Visiteur" : "Visitor View"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onResetDefaults}
              className="py-2 px-3 rounded-xl bg-[#14100E] hover:bg-[#1A1310] border border-[#2D241F] text-xs text-[#8B735B] hover:text-[#F2E8DF] transition-all cursor-pointer flex items-center gap-1"
              title={isFr ? "Réinitialiser les œuvres et tarifs initiaux" : "Reset initial artworks and pricing"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isFr ? "Réinitialiser" : "Reset"}</span>
            </button>

            <button
              id="btn-admin-logout"
              type="button"
              onClick={onLogout}
              className="py-2 px-3.5 rounded-xl bg-[#9B3922]/20 hover:bg-[#9B3922] border border-[#9B3922]/50 text-xs font-semibold text-[#F2E8DF] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isFr ? "Déconnexion" : "Log out"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* KPI Analytics Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
                {isFr ? "Œuvres Exposées" : "Exhibited Artworks"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-[#D4AF37]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="font-syne text-2xl sm:text-3xl font-bold text-[#F2E8DF]">
              {artworks.length}
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {artworks.filter(a => a.isHighlight).length} {isFr ? "chefs-d'œuvre en vedette" : "featured highlights"}
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
                {isFr ? "Grille Tarifaire" : "Price Matrix"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-syne text-2xl sm:text-3xl font-bold text-[#F2E8DF]">
              {ticketTypes.length} <span className="text-sm font-normal text-[#8B735B]">{isFr ? "catégories" : "categories"}</span>
            </p>
            <span className="text-[11px] text-[#D4AF37] mt-1">
              {isFr ? "Tarifs modifiables en direct" : "Live editable rates"}
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
                {isFr ? "Billets Réservés" : "Booked Passes"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-sky-400">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <p className="font-syne text-2xl sm:text-3xl font-bold text-[#F2E8DF]">
              {totalTicketsIssued} <span className="text-sm font-normal text-[#8B735B]">{isFr ? "pass émis" : "passes issued"}</span>
            </p>
            <span className="text-[11px] text-[#8B735B] mt-1">
              {bookedTickets.length} {isFr ? "commandes enregistrées" : "orders recorded"}
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
                {isFr ? "Recettes Billetterie" : "Ticketing Revenue"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-[#D4AF37]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="font-syne text-xl sm:text-2xl font-bold text-[#D4AF37]">
              {totalRevenueCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} <span className="text-xs font-normal text-[#F2E8DF]">FCFA</span>
            </p>
            <span className="text-[11px] text-[#8B735B] mt-1">
              ≈ {Math.round(totalRevenueCFA / 655.957)} € {isFr ? "encaissés" : "collected"}
            </span>
          </div>
        </div>

        {/* Admin Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-[#2D241F] pb-3 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              id="admin-tab-artworks"
              type="button"
              onClick={() => setActiveTab('artworks')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'artworks'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isFr ? `Gestion des Œuvres (${artworks.length})` : `Artwork Management (${artworks.length})`}</span>
            </button>

            <button
              id="admin-tab-tickets"
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{isFr ? "Changer les Prix des Billets" : "Edit Ticket Prices"}</span>
            </button>

            <button
              id="admin-tab-events"
              type="button"
              onClick={() => setActiveTab('events')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'events'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{isFr ? `Événements & Expositions (${events.length})` : `Events & Exhibitions (${events.length})`}</span>
            </button>

            <button
              id="admin-tab-analytics"
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{isFr ? `Réservations & Ventes (${bookedTickets.length})` : `Bookings & Sales (${bookedTickets.length})`}</span>
            </button>

            <button
              id="admin-tab-revenue"
              type="button"
              onClick={() => setActiveTab('revenue')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'revenue'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{isFr ? "Revenus & Comparatifs Mensuels" : "Revenue & Monthly Graphs"}</span>
            </button>

            <button
              id="admin-tab-guestbook"
              type="button"
              onClick={() => setActiveTab('guestbook')}
              className={`py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'guestbook'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>{isFr ? `Livre d'or & Avis (${guestbookReviews.length})` : `Guestbook & Reviews (${guestbookReviews.length})`}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ARTWORKS MANAGEMENT */}
        {activeTab === 'artworks' && (
          <div className="space-y-6">
            
            {/* Action Bar (Search, Category Filter, Add Button) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#14100E] p-4 rounded-2xl border border-[#2D241F]">
              
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isFr ? "Rechercher une œuvre, un artiste, une culture..." : "Search artwork, artist, culture..."}
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B735B] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ArtworkCategory)}
                  className="bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none cursor-pointer"
                >
                  <option value="all">{isFr ? "Toutes catégories" : "All Categories"}</option>
                  <option value="masques_rituels">{isFr ? "Masques & Rituels" : "Masks & Rituals"}</option>
                  <option value="bronzes_metallurgie">{isFr ? "Bronzes & Métallurgie" : "Bronzes & Metallurgy"}</option>
                  <option value="textiles_tissages">{isFr ? "Textiles & Bogolan" : "Textiles & Weaving"}</option>
                  <option value="art_contemporain">{isFr ? "Art Contemporain" : "Contemporary Art"}</option>
                  <option value="sciences_manuscrits">{isFr ? "Manuscrits & Sciences" : "Manuscripts & Sciences"}</option>
                </select>
              </div>

              <button
                id="btn-admin-add-artwork"
                type="button"
                onClick={handleOpenAddArtwork}
                className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isFr ? "Ajouter une Œuvre" : "Add Artwork"}</span>
              </button>

            </div>

            {/* Artworks List / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtworks.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#14100E] border border-[#2D241F] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  {/* Artwork Image & Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0A0A]">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#14100E]/90 border border-[#2D241F] text-[#D4AF37] text-[10px] font-bold">
                        {isFr ? `Niveau ${art.floor}` : `Floor ${art.floor}`}
                      </span>
                      {art.isHighlight && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" /> {isFr ? "Chef-d'œuvre" : "Masterpiece"}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                        {art.artistOrCulture} • {art.originCountry}
                      </span>
                      <h3 className="font-syne text-base font-bold text-[#F2E8DF] truncate">
                        {art.title}
                      </h3>
                    </div>
                  </div>

                  {/* Artwork Details Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#8B735B] line-clamp-2 leading-relaxed">
                      {art.shortDescription}
                    </p>

                    <div className="pt-2 border-t border-[#2D241F] flex items-center justify-between text-[11px] text-[#8B735B]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        <span className="truncate max-w-[140px]">{art.pavilion}</span>
                      </span>
                      <span>{isFr ? "Époque:" : "Era:"} <strong className="text-[#F2E8DF]">{art.era}</strong></span>
                    </div>

                    {/* Admin Actions */}
                    <div className="pt-3 border-t border-[#2D241F] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditArtwork(art)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] hover:border-[#D4AF37] text-xs font-semibold text-[#F2E8DF] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isFr ? "Modifier" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setArtworkToDelete(art)}
                        className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title={isFr ? "Supprimer cette œuvre" : "Delete this artwork"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isFr ? "Supprimer" : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="p-12 text-center bg-[#14100E] rounded-3xl border border-[#2D241F] space-y-3">
                <Layers className="w-10 h-10 text-[#8B735B] mx-auto" />
                <h3 className="font-syne text-base font-bold text-[#F2E8DF]">{isFr ? "Aucune œuvre trouvée" : "No artworks found"}</h3>
                <p className="text-xs text-[#8B735B]">{isFr ? "Modifiez vos critères de recherche ou ajoutez une nouvelle œuvre." : "Modify your search criteria or add a new artwork."}</p>
                <button
                  type="button"
                  onClick={handleOpenAddArtwork}
                  className="py-2 px-4 rounded-xl bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold uppercase cursor-pointer"
                >
                  {isFr ? "Ajouter une œuvre" : "Add an artwork"}
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: TICKET PRICING MANAGEMENT */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            
            <div className="bg-[#14100E] p-6 rounded-3xl border border-[#2D241F] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-syne text-lg font-bold text-[#F2E8DF] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                    <span>{isFr ? "Configuration des Tarifs & Catégories de Billets" : "Ticket Pricing & Categories Configuration"}</span>
                  </h3>
                  <p className="text-xs text-[#8B735B] mt-1">
                    {isFr ? "Les prix modifiés ici sont immédiatement appliqués sur la billetterie publique en ligne (Wave, Orange Money, CB)." : "Prices edited here are immediately reflected in the public booking system (Wave, Orange Money, Card)."}
                  </p>
                </div>

                <button
                  id="btn-save-ticket-prices"
                  type="button"
                  onClick={handleSaveTicketPrices}
                  className="py-3 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isFr ? "Enregistrer les Nouveaux Tarifs" : "Save All Rates"}</span>
                </button>
              </div>

              {ticketSaveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isFr ? "Grille tarifaire mise à jour avec succès ! Les visiteurs verront immédiatement ces prix." : "Ticket matrix updated successfully! Visitors will see these new rates immediately."}</span>
                </div>
              )}
            </div>

            {/* Ticket Cards Grid with Live Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ticketTypes.map((t) => {
                const currentDraft = ticketPricesDraft[t.id] || { cfa: t.priceCFA, eur: t.priceEUR };
                return (
                  <div
                    key={t.id}
                    className="bg-[#14100E] rounded-3xl border border-[#2D241F] p-6 shadow-xl space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] text-[10px] font-bold uppercase">
                          Pass MCN
                        </span>
                        {t.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-[#9B3922] text-[#F2E8DF] text-[10px] font-bold">
                            {isFr ? "Le plus réservé" : "Most Popular"}
                          </span>
                        )}
                      </div>

                      <h4 className="font-syne text-base font-bold text-[#F2E8DF]">
                        {t.name}
                      </h4>

                      <p className="text-xs text-[#8B735B] min-h-[36px]">
                        {t.description}
                      </p>

                      {/* Editable Price Inputs */}
                      <div className="p-3.5 bg-[#0A0A0A] rounded-2xl border border-[#2D241F] space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#D4AF37] mb-1">
                            {isFr ? "Prix en Francs CFA (FCFA)" : "Price in CFA Francs (FCFA)"}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="500"
                              min="0"
                              value={currentDraft.cfa}
                              onChange={(e) => {
                                const newCFA = Math.max(0, Number(e.target.value) || 0);
                                const newEUR = Math.round((newCFA / 655.957) * 10) / 10;
                                setTicketPricesDraft(prev => ({
                                  ...prev,
                                  [t.id]: { cfa: newCFA, eur: newEUR }
                                }));
                              }}
                              className="w-full bg-[#14100E] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm font-bold text-[#F2E8DF] outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B735B] font-bold">
                              FCFA
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#8B735B] mb-1">
                            {isFr ? "Prix équivalent en Euros (€)" : "Equivalent price in Euros (€)"}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={currentDraft.eur}
                              onChange={(e) => {
                                const newEUR = Math.max(0, Number(e.target.value) || 0);
                                setTicketPricesDraft(prev => ({
                                  ...prev,
                                  [t.id]: { cfa: currentDraft.cfa, eur: newEUR }
                                }));
                              }}
                              className="w-full bg-[#14100E] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs font-semibold text-[#8B735B] outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B735B]">
                              EUR
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Perks list */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-[#8B735B] uppercase tracking-wider font-semibold">
                          {isFr ? "Avantages inclus :" : "Included perks:"}
                        </span>
                        {t.perks.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-[#8B735B]">
                            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTicketPrice(t.id, currentDraft.cfa, currentDraft.eur);
                        setTicketSaveSuccess(true);
                        setTimeout(() => setTicketSaveSuccess(false), 3000);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] hover:border-[#D4AF37] text-xs font-syne font-bold text-[#F2E8DF] cursor-pointer transition-all text-center"
                    >
                      {isFr ? "Mettre à jour ce tarif" : "Update this rate"}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: EVENTS MANAGEMENT */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14100E] p-5 rounded-3xl border border-[#2D241F]">
              <div>
                <h3 className="font-syne text-lg font-bold text-[#F2E8DF] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  <span>{isFr ? "Agenda Culturel, Conférences & Vernissages" : "Cultural Agenda, Conferences & Openings"}</span>
                </h3>
                <p className="text-xs text-[#8B735B] mt-1">
                  {isFr ? "Programmez les rencontres, conférences de chercheurs et expositions temporaires du musée." : "Schedule museum talks, scholarly conferences, and temporary exhibitions."}
                </p>
              </div>

              <button
                id="btn-admin-add-event"
                type="button"
                onClick={() => setIsAddEventModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isFr ? "Nouvel Événement" : "New Event"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#14100E] rounded-2xl border border-[#2D241F] p-5 shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] text-[10px] font-bold">
                        {evt.category}
                      </span>
                      <span className="text-xs text-[#8B735B] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {evt.time}
                      </span>
                    </div>

                    <h4 className="font-syne text-base font-bold text-[#F2E8DF]">
                      {evt.title}
                    </h4>

                    {evt.speakerOrArtist && (
                      <p className="text-xs text-[#D4AF37] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{evt.speakerOrArtist}</span>
                      </p>
                    )}

                    <p className="text-xs text-[#8B735B] leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-[#8B735B] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2D241F] flex items-center justify-between">
                    <span className="text-[11px] text-[#8B735B]">
                      {isFr ? "Places disponibles :" : "Available seats:"} <strong className="text-[#F2E8DF]">{evt.seatsLeft || 50}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(evt.id)}
                      className="py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-300 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isFr ? "Supprimer" : "Delete"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS & ANALYTICS & QR SCANNER */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Top Quick Action: QR Scanner Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1A1310] via-[#241712] to-[#14100E] border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Scan className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                      {isFr ? "Scanner de Billets & Contrôle d'Accès MCN" : "Ticket QR Scanner & Entry Gate Control"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold">
                      {isFr ? "Guichet Actif" : "Active Gate"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A1310] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                      <span>{isFr ? "Signal Sonore Actif" : "Audio Beep Active"}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#C5A880] mt-1 max-w-xl">
                    {isFr 
                      ? "Validez les QR codes des visiteurs à l'entrée du musée. Bip sonore de confirmation pour accès accordé ou alerte sonore en cas de pass invalide." 
                      : "Scan visitor QR codes at the museum entrance. Audio chime confirmation on valid entry and alert buzzer for invalid passes."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsScannerOpen(!isScannerOpen);
                    setScanValidationResult(null);
                  }}
                  className={`py-2.5 px-5 rounded-2xl font-syne font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isScannerOpen 
                      ? "bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#E5C158]" 
                      : "bg-[#0A0A0A] hover:bg-[#14100E] border border-[#D4AF37] text-[#D4AF37]"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScannerOpen ? (isFr ? "Masquer le Scanner" : "Hide Scanner") : (isFr ? "Ouvrir le Scanner Caméra" : "Open Camera Scanner")}</span>
                </button>
              </div>
            </div>

            {/* EXPANDABLE QR SCANNER PANEL */}
            <AnimatePresence>
              {isScannerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#14100E] p-6 rounded-3xl border border-[#D4AF37]/40 space-y-6 overflow-hidden shadow-2xl"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Col: Camera & Laser Viewfinder Simulator */}
                    <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#0A0A0A] p-6 rounded-2xl border border-[#2D241F] relative overflow-hidden">
                      <div className="relative w-64 h-64 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl flex flex-col items-center justify-center bg-[#14100E]/80 backdrop-blur-sm p-4 overflow-hidden">
                        
                        {/* Laser beam animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_12px_#D4AF37] animate-[bounce_2s_infinite]" />
                        
                        {/* Corner Target Markers */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />

                        <QrCode className="w-24 h-24 text-[#D4AF37]/30 mb-2" />
                        <p className="text-center text-xs text-[#F2E8DF] font-semibold">
                          {isFr ? "Visez le QR Code du Pass" : "Aim at visitor pass QR Code"}
                        </p>
                        <p className="text-center text-[10px] text-[#8B735B]">
                          {isFr ? "Caméra MCN & Détecteur Optique" : "MCN Optical Entry Gate"}
                        </p>

                        {isSimulatingScan && (
                          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-[#D4AF37]">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <span className="text-xs font-bold font-syne">{isFr ? "Décodage en cours..." : "Decoding pass..."}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick test buttons for registered tickets */}
                      <div className="mt-4 w-full">
                        <p className="text-[11px] text-[#8B735B] mb-2 text-center font-medium">
                          {isFr ? "Tester un billet enregistré (clic rapide pour simuler le scan) :" : "Simulate scan on registered tickets:"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {bookedTickets.slice(0, 3).map(t => (
                            <button
                              key={t.ticketId}
                              type="button"
                              onClick={() => {
                                setScannedCodeInput(t.ticketId);
                                handleValidateTicketByCode(t.ticketId);
                              }}
                              className="py-1 px-2.5 rounded-lg bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[11px] text-[#D4AF37] font-mono transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3 text-[#D4AF37]" />
                              <span>{t.ticketId}</span>
                              <span className="text-[10px] text-[#8B735B]">({t.visitorName.split(' ')[0]})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Manual Input & Instant Scan Verification Status */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                      
                      {/* Manual Code Input Bar */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#F2E8DF] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{isFr ? "Saisir ou scanner la référence du billet :" : "Enter or scan ticket reference:"}</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scannedCodeInput}
                            onChange={(e) => setScannedCodeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleValidateTicketByCode(scannedCodeInput);
                              }
                            }}
                            placeholder="ex: MCN-TKT-2026-8894"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#2D241F] text-[#F2E8DF] font-mono text-sm placeholder-[#8B735B] focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            type="button"
                            onClick={() => handleValidateTicketByCode(scannedCodeInput)}
                            disabled={!scannedCodeInput.trim() || isSimulatingScan}
                            className="py-2.5 px-4 rounded-xl bg-[#9B3922] hover:bg-[#B24429] disabled:opacity-50 text-[#F2E8DF] font-syne font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isFr ? "Valider" : "Validate"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Result Feedback Banner */}
                      {scanValidationResult && (
                        <div className={`p-4 rounded-2xl border transition-all ${
                          scanValidationResult.status === 'success'
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
                            : scanValidationResult.status === 'already_used'
                            ? 'bg-amber-950/70 border-amber-500/50 text-amber-100'
                            : 'bg-red-950/70 border-red-500/50 text-red-100'
                        }`}>
                          <div className="flex items-start gap-3">
                            {scanValidationResult.status === 'success' && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                            {scanValidationResult.status === 'already_used' && (
                              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            {scanValidationResult.status === 'not_found' && (
                              <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 text-xs">
                              <p className="font-bold font-syne text-sm">
                                {scanValidationResult.status === 'success' && (isFr ? "Entrée Autorisée ✓" : "Entry Approved ✓")}
                                {scanValidationResult.status === 'already_used' && (isFr ? "Billet Déjà Consommé ⚠" : "Pass Already Used ⚠")}
                                {scanValidationResult.status === 'not_found' && (isFr ? "Billet Non Valide ✗" : "Invalid Ticket Reference ✗")}
                              </p>
                              <p className="mt-1 leading-relaxed">{scanValidationResult.message}</p>
                              
                              {scanValidationResult.ticket && (
                                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 font-mono text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-[#8B735B]">{isFr ? "Porteur :" : "Holder:"}</span>
                                    <span className="font-bold text-[#F2E8DF]">{scanValidationResult.ticket.visitorName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#8B735B]">{isFr ? "Formule :" : "Pass:"}</span>
                                    <span className="text-[#D4AF37]">{scanValidationResult.ticket.ticketTypeName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#8B735B]">{isFr ? "Quantité :" : "Quantity:"}</span>
                                    <span className="text-[#F2E8DF]">{scanValidationResult.ticket.quantity} personne(s)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#8B735B]">{isFr ? "Date de visite :" : "Visit date:"}</span>
                                    <span className="text-[#F2E8DF]">{scanValidationResult.ticket.visitDate} ({scanValidationResult.ticket.timeSlot})</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="p-3.5 rounded-xl bg-[#1A1310] border border-[#2D241F] text-[11px] text-[#8B735B] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>
                          {isFr 
                            ? "La validation marque instantanément le billet comme utilisé dans le registre central et empêche toute double utilisation." 
                            : "Validation instantly marks the pass as redeemed in the central registry to prevent duplicate entry."}
                        </span>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Booked Tickets Registry Table */}
            <div className="bg-[#14100E] p-6 rounded-3xl border border-[#2D241F] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-syne text-lg font-bold text-[#F2E8DF] flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#D4AF37]" />
                    <span>{isFr ? "Registre des Billets Émis & Validation des Pass" : "Pass Issuance & Validation Registry"}</span>
                  </h3>
                  <p className="text-xs text-[#8B735B] mt-1">
                    {isFr ? "Historique en temps réel des accès générés avec QR Codes coupe-file." : "Real-time log of generated passes and priority fast-track QR codes."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] text-xs font-bold">
                    {bookedTickets.length} {isFr ? "billets" : "tickets"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    {bookedTickets.filter(b => b.status === 'used').length} {isFr ? "entrées enregistrées" : "validated entries"}
                  </span>
                </div>
              </div>

              {/* Booked tickets table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0A0A] text-[#8B735B] uppercase text-[10px] tracking-wider border-b border-[#2D241F]">
                    <tr>
                      <th className="p-3.5">{isFr ? "Réf. Billet" : "Ticket Ref."}</th>
                      <th className="p-3.5">{isFr ? "Visiteur" : "Visitor"}</th>
                      <th className="p-3.5">{isFr ? "Catégorie" : "Category"}</th>
                      <th className="p-3.5">{isFr ? "Date & Créneau" : "Date & Slot"}</th>
                      <th className="p-3.5">{isFr ? "Quantité" : "Quantity"}</th>
                      <th className="p-3.5">{isFr ? "Total Payé" : "Total Paid"}</th>
                      <th className="p-3.5">{isFr ? "Statut" : "Status"}</th>
                      <th className="p-3.5 text-right">{isFr ? "Contrôle Guichet" : "Gate Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D241F]">
                    {bookedTickets.map((t) => {
                      const isUsed = t.status === 'used';
                      return (
                        <tr key={t.ticketId} className="hover:bg-[#1A1310] transition-colors">
                          <td className="p-3.5 font-bold font-syne text-[#D4AF37]">
                            <div className="flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-[#8B735B]" />
                              <span>{t.ticketId}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-[#F2E8DF]">{t.visitorName}</p>
                            <p className="text-[10px] text-[#8B735B]">{t.visitorEmail}</p>
                          </td>
                          <td className="p-3.5 text-[#F2E8DF]">
                            {t.ticketTypeName}
                          </td>
                          <td className="p-3.5 text-[#8B735B]">
                            <p>{t.visitDate}</p>
                            <p className="text-[10px]">{t.timeSlot}</p>
                          </td>
                          <td className="p-3.5 font-bold text-[#F2E8DF]">
                            {t.quantity}
                          </td>
                          <td className="p-3.5 font-bold text-[#D4AF37]">
                            {t.totalPriceCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} FCFA
                          </td>
                          <td className="p-3.5">
                            {isUsed ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {isFr ? `Entrée Validée${t.validatedAt ? ` (${t.validatedAt})` : ''}` : `Entry Validated${t.validatedAt ? ` (${t.validatedAt})` : ''}`}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {isFr ? "Accès Valide" : "Valid Access"}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (onValidateTicket) {
                                  if (!isUsed) {
                                    museumAudio.playScanSuccess();
                                  }
                                  onValidateTicket(t.ticketId);
                                }
                              }}
                              className={`py-1 px-3 rounded-lg text-xs font-semibold font-syne transition-all cursor-pointer inline-flex items-center gap-1 ${
                                isUsed
                                  ? "bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]"
                                  : "bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 shadow-sm"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isUsed ? (isFr ? "Réinitialiser" : "Reset") : (isFr ? "Valider Entrée" : "Validate Entry")}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: REVENUE & MONTHLY COMPARISON ANALYTICS */}
        {activeTab === 'revenue' && (
          <RevenueAnalytics
            bookedTickets={bookedTickets}
            ticketTypes={ticketTypes}
          />
        )}

        {/* TAB 6: GUESTBOOK & VISITOR REVIEWS MODERATION */}
        {activeTab === 'guestbook' && (
          <div className="space-y-6">
            
            {/* Top Stats Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#14100E] border border-[#2D241F]">
                <p className="text-xs text-[#8B735B] font-semibold uppercase">{isFr ? "Total des Avis" : "Total Reviews"}</p>
                <p className="font-syne text-2xl font-bold text-[#F2E8DF] mt-1">{guestbookReviews.length}</p>
                <p className="text-[11px] text-[#D4AF37] mt-1">{isFr ? "Publiés par les visiteurs" : "Published by visitors"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#14100E] border border-[#2D241F]">
                <p className="text-xs text-[#8B735B] font-semibold uppercase">{isFr ? "Note Moyenne" : "Average Rating"}</p>
                <p className="font-syne text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                  <span>
                    {guestbookReviews.length > 0
                      ? (guestbookReviews.reduce((acc, r) => acc + r.rating, 0) / guestbookReviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                  <span className="text-sm text-[#8B735B]">/ 5</span>
                  <span className="text-xs">★</span>
                </p>
                <p className="text-[11px] text-emerald-400 mt-1">{isFr ? "Score d'excellence" : "Excellence score"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#14100E] border border-[#2D241F]">
                <p className="text-xs text-[#8B735B] font-semibold uppercase">{isFr ? "Visites Vérifiées" : "Verified Visits"}</p>
                <p className="font-syne text-2xl font-bold text-emerald-400 mt-1">
                  {guestbookReviews.filter(r => r.isVerifiedVisitor || (r as unknown as { isVerifiedVisit?: boolean }).isVerifiedVisit).length}
                </p>
                <p className="text-[11px] text-[#8B735B] mt-1">{isFr ? "Billets validés au scanner" : "Passes scanned at gate"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#14100E] border border-[#2D241F]">
                <p className="text-xs text-[#8B735B] font-semibold uppercase">{isFr ? "Réponses Administrateur" : "Admin Replies"}</p>
                <p className="font-syne text-2xl font-bold text-sky-400 mt-1">
                  {guestbookReviews.filter(r => Boolean(r.adminResponse)).length} / {guestbookReviews.length}
                </p>
                <p className="text-[11px] text-[#8B735B] mt-1">
                  {guestbookReviews.filter(r => !r.adminResponse).length} {isFr ? "en attente de mot de la direction" : "pending reply"}
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14100E] p-4 rounded-2xl border border-[#2D241F]">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGuestbookFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    guestbookFilter === 'all'
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                  }`}
                >
                  {isFr ? `Tous les avis (${guestbookReviews.length})` : `All reviews (${guestbookReviews.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setGuestbookFilter('unreplied')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    guestbookFilter === 'unreplied'
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                  }`}
                >
                  {isFr 
                    ? `Sans réponse (${guestbookReviews.filter(r => !r.adminResponse).length})` 
                    : `Unreplied (${guestbookReviews.filter(r => !r.adminResponse).length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setGuestbookFilter('5stars')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    guestbookFilter === '5stars'
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                  }`}
                >
                  ★ 5 étoiles ({guestbookReviews.filter(r => r.rating === 5).length})
                </button>
                <button
                  type="button"
                  onClick={() => setGuestbookFilter('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    guestbookFilter === 'verified'
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                  }`}
                >
                  ✓ {isFr ? "Billet vérifié" : "Verified tickets"} ({guestbookReviews.filter(r => r.isVerifiedVisitor || (r as unknown as { isVerifiedVisit?: boolean }).isVerifiedVisit).length})
                </button>
              </div>

              <p className="text-xs text-[#8B735B]">
                {isFr ? "Les avis sont synchronisés en temps réel avec le Cloud Firestore." : "Reviews are synced real-time via Cloud Firestore."}
              </p>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {guestbookReviews
                .filter(r => {
                  if (guestbookFilter === 'unreplied') return !r.adminResponse;
                  if (guestbookFilter === '5stars') return r.rating === 5;
                  if (guestbookFilter === 'verified') return Boolean(r.isVerifiedVisitor || (r as unknown as { isVerifiedVisit?: boolean }).isVerifiedVisit);
                  return true;
                })
                .map((review) => {
                  const isReplying = activeReplyingId === review.id;
                  const displayName = review.userName || (review as unknown as { authorName?: string }).authorName || (isFr ? 'Visiteur' : 'Visitor');
                  const displayEmail = review.userEmail || (review as unknown as { authorEmail?: string }).authorEmail || '';
                  const displayCountry = review.userCountry || (review as unknown as { authorOrigin?: string }).authorOrigin || '';
                  const isVerified = Boolean(review.isVerifiedVisitor || (review as unknown as { isVerifiedVisit?: boolean }).isVerifiedVisit);
                  const displayInitial = (displayName.trim().charAt(0) || 'V').toUpperCase();
                  const categoryName = review.experienceCategory || (review as unknown as { category?: string }).category;

                  return (
                    <div
                      key={review.id}
                      className="bg-[#14100E] p-5 sm:p-6 rounded-3xl border border-[#2D241F] hover:border-[#D4AF37]/30 transition-all space-y-4 shadow-lg"
                    >
                      {/* Review Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D241F] pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1F1713] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-sm text-[#D4AF37]">
                            {displayInitial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-syne font-bold text-sm text-[#F2E8DF]">{displayName}</h4>
                              {displayCountry && (
                                <span className="text-xs text-[#8B735B]">({displayCountry})</span>
                              )}
                              {isVerified && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isFr ? "Billet Vérifié" : "Verified Pass"}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8B735B]">
                              {displayEmail ? `${displayEmail} • ` : ''}{review.visitDate ? `${isFr ? "Visite du" : "Visit on"} ${review.visitDate} • ` : ''}{review.createdAt ? new Date(review.createdAt).toLocaleDateString(isFr ? 'fr-FR' : 'en-US') : ''}
                            </p>
                          </div>
                        </div>

                        {/* Rating Stars & Delete */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= review.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>

                          {onDeleteReview && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(isFr ? 'Supprimer cet avis du livre d\'or ?' : 'Delete this guestbook review?')) {
                                  onDeleteReview(review.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-[#1A1310] hover:bg-red-950/60 border border-[#2D241F] text-[#8B735B] hover:text-red-400 transition-colors"
                              title={isFr ? "Modération / Supprimer" : "Moderate / Delete"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Review Comment */}
                      {review.title && (
                        <h5 className="font-syne font-bold text-sm text-[#F2E8DF]">
                          {review.title}
                        </h5>
                      )}
                      <p className="text-sm text-[#F2E8DF] leading-relaxed italic bg-[#0A0A0A]/50 p-4 rounded-2xl border border-[#2D241F]/60">
                        "{review.comment}"
                      </p>

                      {/* Extra details (Category / Ticket / Likes) */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B735B]">
                        {categoryName && (
                          <span className="px-2.5 py-1 rounded-xl bg-[#1A1310] border border-[#2D241F] text-[#D4AF37]">
                            🏷️ {categoryName}
                          </span>
                        )}
                        {review.ticketTypeName && (
                          <span className="px-2.5 py-1 rounded-xl bg-[#1A1310] border border-[#2D241F] text-[#F2E8DF]">
                            🎟️ {review.ticketTypeName}
                          </span>
                        )}
                        {review.ticketId && (
                          <span className="text-[11px] font-mono text-[#8B735B]">
                            Ref: {review.ticketId}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[#8B735B]">
                          <ThumbsUp className="w-3 h-3 text-[#D4AF37]" />
                          <span>{review.likesCount || 0} {isFr ? "mentions utiles" : "helpful votes"}</span>
                        </span>
                      </div>

                      {/* Admin Response Section */}
                      {review.adminResponse ? (
                        <div className="bg-[#1A1310] p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{review.adminResponse.author}</span>
                              <span className="text-[10px] font-normal text-[#8B735B]">({review.adminResponse.date})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyingId(review.id);
                                setReplyInputText(review.adminResponse?.message || '');
                              }}
                              className="text-[11px] text-[#8B735B] hover:text-[#D4AF37] underline cursor-pointer"
                            >
                              {isFr ? "Modifier la réponse" : "Edit reply"}
                            </button>
                          </div>
                          <p className="text-xs text-[#F2E8DF] leading-relaxed">
                            {review.adminResponse.message}
                          </p>
                        </div>
                      ) : null}

                      {/* Reply Form Trigger & Box */}
                      {isReplying ? (
                        <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#D4AF37] space-y-3 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                            <Reply className="w-3.5 h-3.5" />
                            <span>{isFr ? "Répondre officiellement au visiteur :" : "Official response to visitor:"}</span>
                          </label>
                          <textarea
                            rows={3}
                            value={replyInputText}
                            onChange={(e) => setReplyInputText(e.target.value)}
                            placeholder={isFr ? "Chère visiteuse, cher visiteur, nous vous remercions chaleureusement pour votre visite..." : "Dear visitor, thank you warmly for visiting the MCN..."}
                            className="w-full bg-[#14100E] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl p-3 text-xs text-[#F2E8DF] placeholder-[#8B735B] outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyingId(null);
                                setReplyInputText('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1A1310] border border-[#2D241F] text-xs text-[#8B735B] hover:text-[#F2E8DF]"
                            >
                              {isFr ? "Annuler" : "Cancel"}
                            </button>
                            <button
                              type="button"
                              disabled={!replyInputText.trim()}
                              onClick={() => {
                                if (onAdminReply && replyInputText.trim()) {
                                  onAdminReply(review.id, {
                                    author: `${user.name} (${user.adminTitle || (isFr ? 'Direction MCN' : 'MCN Direction')})`,
                                    message: replyInputText.trim(),
                                    date: new Date().toISOString().split('T')[0]
                                  });
                                  setActiveReplyingId(null);
                                  setReplyInputText('');
                                }
                              }}
                              className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isFr ? "Publier la Réponse" : "Post Reply"}</span>
                            </button>
                          </div>
                        </div>
                      ) : !review.adminResponse && onAdminReply ? (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyingId(review.id);
                              setReplyInputText('');
                            }}
                            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>{isFr ? "Répondre à cet avis au nom de la direction du musée" : "Reply to this review on behalf of museum direction"}</span>
                          </button>
                        </div>
                      ) : null}

                    </div>
                  );
                })}

              {guestbookReviews.length === 0 && (
                <div className="bg-[#14100E] p-12 rounded-3xl border border-[#2D241F] text-center space-y-3">
                  <MessageSquareQuote className="w-12 h-12 text-[#D4AF37] mx-auto opacity-50" />
                  <p className="font-syne font-bold text-base text-[#F2E8DF]">
                    {isFr ? "Aucun avis pour l'instant" : "No reviews yet"}
                  </p>
                  <p className="text-xs text-[#8B735B]">
                    {isFr ? "Les avis déposés par les visiteurs ayant validé leur billet apparaîtront ici." : "Visitor reviews will show up here once left by visitors."}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* MODAL: AJOUTER / MODIFIER UNE OEUVRE */}
      <AnimatePresence>
        {isAddArtworkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl my-8">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-[#2D241F] bg-[#1A1310] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2D241F] border border-[#3D2B22] flex items-center justify-center text-[#D4AF37]">
                    {editingArtwork ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                      {editingArtwork 
                        ? (isFr ? 'Modifier la fiche de l\'Œuvre' : 'Edit Artwork Entry') 
                        : (isFr ? 'Ajouter une Nouvelle Œuvre au MCN' : 'Add New Artwork to MCN')}
                    </h3>
                    <p className="text-xs text-[#8B735B]">
                      {isFr 
                        ? "Les informations seront immédiatement visibles dans la galerie interactive et l'audio guide."
                        : "Information will be immediately live in the interactive gallery and audio guide."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddArtworkModalOpen(false)}
                  className="p-2 rounded-full bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveArtwork} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Titre de l'Œuvre *" : "Artwork Title *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={artworkFormData.title || ''}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, title: e.target.value })}
                      placeholder={isFr ? "ex: Masque Kanaga Dogon" : "e.g., Kanaga Dogon Mask"}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F2E8DF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Culture / Peuple ou Artiste *" : "Culture / People or Artist *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={artworkFormData.artistOrCulture || ''}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, artistOrCulture: e.target.value })}
                      placeholder={isFr ? "ex: Peuple Dogon / Falaises de Bandiagara" : "e.g., Dogon People / Bandiagara Cliffs"}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F2E8DF] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Pays d'origine" : "Country of Origin"}
                    </label>
                    <input
                      type="text"
                      value={artworkFormData.originCountry || ''}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, originCountry: e.target.value })}
                      placeholder={isFr ? "Mali, Sénégal, Nigéria..." : "Mali, Senegal, Nigeria..."}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Époque / Datation" : "Era / Period"}
                    </label>
                    <input
                      type="text"
                      value={artworkFormData.era || ''}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, era: e.target.value })}
                      placeholder={isFr ? "ex: Fin XIXe siècle" : "e.g., Late 19th Century"}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Catégorie" : "Category"}
                    </label>
                    <select
                      value={artworkFormData.category || 'masques_rituels'}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, category: e.target.value as ArtworkCategory })}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    >
                      <option value="masques_rituels">{isFr ? "Masques & Rituels" : "Masks & Rituals"}</option>
                      <option value="bronzes_metallurgie">{isFr ? "Bronzes & Métallurgie" : "Bronzes & Metallurgy"}</option>
                      <option value="textiles_tissages">{isFr ? "Textiles & Bogolan" : "Textiles & Weaving"}</option>
                      <option value="art_contemporain">{isFr ? "Art Contemporain" : "Contemporary Art"}</option>
                      <option value="sciences_manuscrits">{isFr ? "Manuscrits & Sciences" : "Manuscripts & Sciences"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Étage & Pavillon" : "Floor & Pavilion"}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={artworkFormData.floor ?? 1}
                        onChange={(e) => setArtworkFormData({ ...artworkFormData, floor: Number(e.target.value) })}
                        className="w-28 bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                      >
                        <option value={0}>{isFr ? "RDC (0)" : "Ground (0)"}</option>
                        <option value={1}>{isFr ? "1er Étage" : "1st Floor"}</option>
                        <option value={2}>{isFr ? "2e Étage" : "2nd Floor"}</option>
                        <option value={3}>{isFr ? "3e Étage" : "3rd Floor"}</option>
                      </select>
                      <input
                        type="text"
                        value={artworkFormData.pavilion || ''}
                        onChange={(e) => setArtworkFormData({ ...artworkFormData, pavilion: e.target.value })}
                        placeholder={isFr ? "Nom du pavillon ou galerie..." : "Pavilion or gallery name..."}
                        className="flex-1 bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                      {isFr ? "Matériaux & Dimensions" : "Materials & Dimensions"}
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(artworkFormData.materials) ? artworkFormData.materials.join(', ') : artworkFormData.materials || ''}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, materials: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder={isFr ? "Bois sculpté, Kaolin, Bronze..." : "Carved wood, Kaolin, Bronze..."}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    />
                  </div>
                </div>

                {/* Image URL & Presets */}
                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                    {isFr ? "URL de la Photographie Haute Résolution" : "High-Resolution Photograph URL"}
                  </label>
                  <input
                    type="url"
                    required
                    value={artworkFormData.imageUrl || ''}
                    onChange={(e) => setArtworkFormData({ ...artworkFormData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-[#F2E8DF] outline-none"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[11px] text-[#8B735B]">{isFr ? "Suggestions rapides :" : "Quick presets:"}</span>
                    {sampleArtworkImages.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setArtworkFormData({ ...artworkFormData, imageUrl: s.url })}
                        className="px-2 py-0.5 rounded-lg bg-[#1A1310] border border-[#2D241F] hover:border-[#D4AF37] text-[10px] text-[#8B735B] hover:text-[#F2E8DF]"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                    {isFr ? "Description Courte (Affichage carte galerie)" : "Short Description (Card preview)"}
                  </label>
                  <textarea
                    rows={2}
                    value={artworkFormData.shortDescription || ''}
                    onChange={(e) => setArtworkFormData({ ...artworkFormData, shortDescription: e.target.value })}
                    placeholder={isFr ? "Synthèse de l'œuvre et signification immédiate..." : "Artwork summary and key significance..."}
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl p-3 text-xs text-[#F2E8DF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                    {isFr ? "Notice Historique Complète & Cosmogonies (Fiche détaillée)" : "Full Historical Background & Symbolism (Detail sheet)"}
                  </label>
                  <textarea
                    rows={3}
                    value={artworkFormData.fullHistory || ''}
                    onChange={(e) => setArtworkFormData({ ...artworkFormData, fullHistory: e.target.value })}
                    placeholder={isFr ? "Contexte historique, rituels associés, symbolique..." : "Historical context, associated rituals, symbology..."}
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl p-3 text-xs text-[#F2E8DF] outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(artworkFormData.isHighlight)}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, isHighlight: e.target.checked })}
                      className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="text-xs font-semibold text-[#F2E8DF]">
                      {isFr ? "Classer comme Chef-d'œuvre en Vedette (Badge doré & Hero)" : "Mark as Featured Masterpiece (Gold Badge & Hero)"}
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-[#2D241F] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddArtworkModalOpen(false)}
                    className="py-2.5 px-5 rounded-xl bg-[#1A1310] border border-[#2D241F] text-xs font-semibold text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                  >
                    {isFr ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    {editingArtwork 
                      ? (isFr ? 'Sauvegarder les Modifications' : 'Save Changes') 
                      : (isFr ? 'Ajouter l\'Œuvre au Catalogue' : 'Add Artwork to Catalog')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CONFIRMATION SUPPRESSION OEUVRE */}
      <AnimatePresence>
        {artworkToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md bg-[#14100E] border border-red-900/50 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                  {isFr ? "Supprimer cette œuvre du Musée ?" : "Delete this artwork from the Museum?"}
                </h3>
                <p className="text-xs text-[#8B735B]">
                  {isFr 
                    ? <>Vous êtes sur le point de retirer définitivement <strong className="text-[#F2E8DF]">« {artworkToDelete.title} »</strong> de la galerie et des audio guides.</>
                    : <>You are about to permanently remove <strong className="text-[#F2E8DF]">"{artworkToDelete.title}"</strong> from the gallery and audio guides.</>}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setArtworkToDelete(null)}
                  className="py-2.5 px-5 rounded-xl bg-[#1A1310] border border-[#2D241F] text-xs font-semibold text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                >
                  {isFr ? "Annuler" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteArtwork}
                  className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-syne font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-900/30"
                >
                  {isFr ? "Confirmer la suppression" : "Confirm Deletion"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AJOUTER UN EVENEMENT */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2D241F] pb-4">
                <h3 className="font-syne text-base font-bold text-[#F2E8DF]">
                  {isFr ? "Programmer un Nouvel Événement / Exposition" : "Schedule New Event / Exhibition"}
                </h3>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="p-1 rounded-full text-[#8B735B] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1">
                    {isFr ? "Titre de l'événement" : "Event Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.title || ''}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    placeholder={isFr ? "ex: Conférence sur les Cosmogonies Dogon" : "e.g., Lecture on Dogon Cosmogonies"}
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1">
                      {isFr ? "Horaire" : "Time"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.time || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                      placeholder="15h00 - 17h00"
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-1">
                      {isFr ? "Lieu" : "Location"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.location || ''}
                      onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                      placeholder={isFr ? "Auditorium Senghor" : "Senghor Auditorium"}
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1">
                    {isFr ? "Intervenant ou Artiste" : "Speaker or Artist"}
                  </label>
                  <input
                    type="text"
                    value={eventFormData.speakerOrArtist || ''}
                    onChange={(e) => setEventFormData({ ...eventFormData, speakerOrArtist: e.target.value })}
                    placeholder="Pr. Souleymane Bachir Diagne"
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1">
                    {isFr ? "Description" : "Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={eventFormData.description || ''}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    placeholder={isFr ? "Résumé du contenu et public cible..." : "Summary and target audience..."}
                    className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#F2E8DF] outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEventModalOpen(false)}
                    className="py-2 px-4 rounded-xl bg-[#1A1310] text-xs text-[#8B735B] cursor-pointer"
                  >
                    {isFr ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-[#D4AF37] text-[#0A0A0A] font-syne font-bold text-xs uppercase cursor-pointer"
                  >
                    {isFr ? "Publier l'événement" : "Publish Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
