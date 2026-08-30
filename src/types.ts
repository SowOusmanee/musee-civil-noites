export type AccountType = 'visitor' | 'admin';

export type VisitorRole = 
  | 'visiteur_local' 
  | 'etudiant' 
  | 'touriste_international' 
  | 'membre_privilege';

export type AdminRole = 
  | 'conservateur_general' 
  | 'responsable_collections' 
  | 'gestionnaire_billetterie' 
  | 'administrateur_principal';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType; // 'visitor' | 'admin'
  role: VisitorRole | 'admin' | string;
  adminRole?: AdminRole;
  adminTitle?: string; // e.g. "Conservateur en Chef", "Direction des Collections"
  avatar?: string;
  favorites: string[];
  bookedTickets: BookedTicket[];
  country?: string;
  createdAt?: string;
}

export interface Artwork {
  id: string;
  title: string;
  subtitle?: string;
  artistOrCulture: string;
  originCountry: string;
  originRegion?: string;
  era: string; // e.g. "XIIe - XIVe siècle", "Circa 500 av. J.-C."
  category: ArtworkCategory;
  pavilion: string; // e.g. "Pavillon Berceau de l'Humanité - RDC", "Galerie des Rituels & Masques - 1er Étage"
  floor: number;
  imageUrl: string;
  thumbnailUrl?: string;
  shortDescription: string;
  fullHistory: string;
  spiritualMeaning?: string;
  materials: string[];
  dimensions?: string;
  acquisitionYear?: string;
  isHighlight?: boolean;
  audioDuration?: string; // e.g. "2 min 45 s"
  audioTranscript?: string;
  audioStory?: string;
}

export type ArtworkCategory = 
  | 'all'
  | 'masques_rituels'
  | 'bronzes_metallurgie'
  | 'textiles_tissages'
  | 'art_contemporain'
  | 'sciences_manuscrits';

export interface MuseumEvent {
  id: string;
  title: string;
  category: 'Exposition Temporaire' | 'Conférence & Débat' | 'Atelier Vivant' | 'Performance & Musique';
  time: string; // e.g. "14h30 - 16h00"
  location: string; // e.g. "Auditorium Léopold Sédar Senghor"
  speakerOrArtist?: string;
  description: string;
  fullDetails: string;
  imageUrl: string;
  isToday: boolean;
  seatsLeft?: number;
  badge?: string;
}

export interface TicketType {
  id: string;
  name: string;
  priceCFA: number;
  priceEUR: number;
  description: string;
  perks: string[];
  popular?: boolean;
  color: string;
}

export interface BookedTicket {
  ticketId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  visitorName: string;
  visitorEmail: string;
  visitDate: string;
  timeSlot: string;
  quantity: number;
  totalPriceCFA: number;
  purchaseDate: string;
  qrCodeUrl: string;
  includesAudioGuide: boolean;
  includesGuidedTour: boolean;
  status?: 'valid' | 'used' | 'cancelled';
  validatedAt?: string;
}

export type ReviewCategory = 
  | 'visite_generale'
  | 'sculptures_masques'
  | 'expositions_temporaires'
  | 'architecture_musee'
  | 'mediation_guides'
  | 'evenements_ateliers';

export interface GuestbookReview {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCountry?: string;
  userRole?: string;
  rating: number; // 1 to 5
  experienceCategory: ReviewCategory;
  title?: string;
  comment: string;
  ticketId?: string; // Validated / used ticket reference
  ticketTypeName?: string; // e.g. "Tarif Résident & CEDEAO"
  visitDate?: string;
  createdAt: string;
  likesCount: number;
  likedBy?: string[]; // Array of user IDs who liked
  isVerifiedVisitor: boolean;
  adminResponse?: {
    author: string;
    message: string;
    date: string;
  };
}

