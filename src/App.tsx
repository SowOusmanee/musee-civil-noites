/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Artwork, BookedTicket, TicketType, MuseumEvent, GuestbookReview } from './types';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Navbar } from './components/Navbar';
import { DashboardHero } from './components/DashboardHero';
import { EventsSection } from './components/EventsSection';
import { TicketingSection } from './components/TicketingSection';
import { GallerySection } from './components/GallerySection';
import { GuestbookSection } from './components/GuestbookSection';
import { ArtworkModal } from './components/ArtworkModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { MuseumMapModal } from './components/MuseumMapModal';
import { VirtualCuratorModal } from './components/VirtualCuratorModal';
import { Footer } from './components/Footer';
import { ARTWORKS_DATA, TICKET_TYPES, TODAY_EVENTS, INITIAL_GUESTBOOK_REVIEWS } from './data/museumData';
import { 
  seedFirestoreIfEmpty,
  subscribeArtworks,
  subscribeTicketTypes,
  subscribeEvents,
  subscribeBookedTickets,
  subscribeGuestbookReviews,
  subscribeUserProfile,
  saveArtworkToFirestore,
  deleteArtworkFromFirestore,
  saveTicketTypeToFirestore,
  updateTicketTypeInFirestore,
  deleteTicketTypeFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveBookedTicketToFirestore,
  validateTicketInFirestore,
  saveGuestbookReviewToFirestore,
  deleteGuestbookReviewFromFirestore,
  toggleLikeGuestbookReviewInFirestore,
  addAdminReplyToGuestbookReview,
  resetFirestoreToDefaults,
  signOutFromFirebase
} from './firebase';
import { ShieldCheck, ArrowLeft, Plus, DollarSign, Layers, CloudCheck, RefreshCw } from 'lucide-react';

const INITIAL_DEFAULT_TICKETS: BookedTicket[] = [
  {
    ticketId: 'MCN-TKT-2026-8894',
    ticketTypeId: 'ticket-standard-local',
    ticketTypeName: 'Tarif Résident & CEDEAO',
    visitorName: 'Awa Diop',
    visitorEmail: 'awa.diop@dakar.sn',
    visitDate: new Date().toISOString().split('T')[0],
    timeSlot: '14h00 - 16h30',
    quantity: 2,
    totalPriceCFA: 6000,
    purchaseDate: new Date().toISOString().split('T')[0],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MCN-TKT-2026-8894',
    includesAudioGuide: true,
    includesGuidedTour: false,
    status: 'valid'
  },
  {
    ticketId: 'MCN-TKT-2026-7241',
    ticketTypeId: 'ticket-international',
    ticketTypeName: 'Visiteur International & Tourisme',
    visitorName: 'Jean-Marc Duval',
    visitorEmail: 'jm.duval@paris.fr',
    visitDate: new Date().toISOString().split('T')[0],
    timeSlot: '10h00 - 12h00',
    quantity: 1,
    totalPriceCFA: 5000,
    purchaseDate: new Date().toISOString().split('T')[0],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MCN-TKT-2026-7241',
    includesAudioGuide: true,
    includesGuidedTour: false,
    status: 'valid'
  }
];

export default function App() {
  // Current user state (reads from localStorage or null to prompt login/signup)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mcn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Admin View Mode: when admin is logged in, can be 'dashboard' or 'visitor_preview'
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'visitor_preview'>('dashboard');

  // Dynamic Museum Artworks (Firestore cloud backed with initial fallback)
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    const saved = localStorage.getItem('mcn_artworks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return ARTWORKS_DATA;
  });

  // Dynamic Museum Ticket Pricing (Firestore cloud backed)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(() => {
    const saved = localStorage.getItem('mcn_ticket_types');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return TICKET_TYPES;
  });

  // Dynamic Museum Events (Firestore cloud backed)
  const [events, setEvents] = useState<MuseumEvent[]>(() => {
    const saved = localStorage.getItem('mcn_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return TODAY_EVENTS;
  });

  // Global Booked Tickets Registry for Admin Analytics & Gate Scanner (Firestore cloud backed)
  const [allBookedTickets, setAllBookedTickets] = useState<BookedTicket[]>(() => {
    const saved = localStorage.getItem('mcn_all_booked_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_DEFAULT_TICKETS;
  });

  // Dynamic Guestbook Reviews (Firestore cloud backed)
  const [guestbookReviews, setGuestbookReviews] = useState<GuestbookReview[]>(() => {
    const saved = localStorage.getItem('mcn_guestbook_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_GUESTBOOK_REVIEWS;
  });

  // Modals state
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isTicketingModalOpen, setIsTicketingModalOpen] = useState(false);
  const [isMyTicketsModalOpen, setIsMyTicketsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapInitialFloor, setMapInitialFloor] = useState<number>(0);
  const [isCuratorModalOpen, setIsCuratorModalOpen] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    return currentUser?.favorites || ['mcn-art-01', 'mcn-art-02'];
  });

  // Cloud Sync Status Indicator
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Initialize and subscribe to Firestore collections in real time
  useEffect(() => {
    // 1. Seed initial collections if empty
    seedFirestoreIfEmpty(ARTWORKS_DATA, TICKET_TYPES, TODAY_EVENTS, INITIAL_DEFAULT_TICKETS, INITIAL_GUESTBOOK_REVIEWS);

    // 2. Set up real-time listener for artworks
    const unsubArtworks = subscribeArtworks((remoteArtworks) => {
      if (remoteArtworks.length > 0) {
        setArtworks(remoteArtworks);
        localStorage.setItem('mcn_artworks', JSON.stringify(remoteArtworks));
      }
    }, () => setIsFirestoreConnected(false));

    // 3. Set up real-time listener for ticket types
    const unsubTicketTypes = subscribeTicketTypes((remoteTicketTypes) => {
      if (remoteTicketTypes.length > 0) {
        setTicketTypes(remoteTicketTypes);
        localStorage.setItem('mcn_ticket_types', JSON.stringify(remoteTicketTypes));
      }
    }, () => setIsFirestoreConnected(false));

    // 4. Set up real-time listener for events
    const unsubEvents = subscribeEvents((remoteEvents) => {
      if (remoteEvents.length > 0) {
        setEvents(remoteEvents);
        localStorage.setItem('mcn_events', JSON.stringify(remoteEvents));
      }
    }, () => setIsFirestoreConnected(false));

    // 5. Set up real-time listener for booked tickets
    const unsubTickets = subscribeBookedTickets((remoteTickets) => {
      if (remoteTickets.length > 0) {
        setAllBookedTickets(remoteTickets);
        localStorage.setItem('mcn_all_booked_tickets', JSON.stringify(remoteTickets));
      }
    }, () => setIsFirestoreConnected(false));

    // 6. Set up real-time listener for guestbook reviews
    const unsubReviews = subscribeGuestbookReviews((remoteReviews) => {
      if (remoteReviews.length > 0) {
        setGuestbookReviews(remoteReviews);
        localStorage.setItem('mcn_guestbook_reviews', JSON.stringify(remoteReviews));
      }
    }, () => setIsFirestoreConnected(false));

    return () => {
      unsubArtworks();
      unsubTicketTypes();
      unsubEvents();
      unsubTickets();
      unsubReviews();
    };
  }, []);

  // 7. Real-time Firestore subscription to current user profile
  // When an administrator changes this user's accountType to 'admin' in Firestore,
  // the app updates immediately in real-time.
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubUser = subscribeUserProfile(currentUser.id, (remoteProfile) => {
      if (remoteProfile) {
        setCurrentUser(prev => {
          if (!prev) return remoteProfile;
          if (
            prev.accountType !== remoteProfile.accountType ||
            prev.role !== remoteProfile.role ||
            prev.adminRole !== remoteProfile.adminRole ||
            prev.adminTitle !== remoteProfile.adminTitle
          ) {
            const merged = { ...prev, ...remoteProfile };
            localStorage.setItem('mcn_user', JSON.stringify(merged));
            return merged;
          }
          return prev;
        });
      }
    });
    return () => unsubUser();
  }, [currentUser?.id]);

  // Persist User State Changes locally
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mcn_user', JSON.stringify({ ...currentUser, favorites }));
    } else {
      localStorage.removeItem('mcn_user');
    }
  }, [currentUser, favorites]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setFavorites(user.favorites || []);
    if (user.accountType === 'admin') {
      setAdminViewMode('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutFromFirebase();
    } catch (err) {
      console.error('Error signing out from Firebase:', err);
    }
    localStorage.removeItem('mcn_user');
    setCurrentUser(null);
  };

  const handleToggleFavorite = (artworkId: string) => {
    setFavorites(prev => {
      if (prev.includes(artworkId)) {
        return prev.filter(id => id !== artworkId);
      } else {
        return [...prev, artworkId];
      }
    });
  };

  const handleTicketPurchased = async (newTicket: BookedTicket) => {
    // 1. Optimistic update
    setAllBookedTickets(prev => [newTicket, ...prev]);

    // 2. Persist to Firestore Cloud Database
    try {
      await saveBookedTicketToFirestore(newTicket);
    } catch (err) {
      console.error('Error saving ticket to Firestore:', err);
    }

    // 3. Add to current user's profile
    if (currentUser) {
      const updatedTickets = [newTicket, ...(currentUser.bookedTickets || [])];
      const updatedUser = {
        ...currentUser,
        bookedTickets: updatedTickets
      };
      setCurrentUser(updatedUser);
    }
  };

  // Admin CRUD Actions on Artworks (Syncs with Firestore)
  const handleAddArtwork = async (newArtwork: Artwork) => {
    setArtworks(prev => [newArtwork, ...prev]);
    try {
      await saveArtworkToFirestore(newArtwork);
    } catch (err) {
      console.error('Error adding artwork to Firestore:', err);
    }
  };

  const handleUpdateArtwork = async (updatedArtwork: Artwork) => {
    setArtworks(prev => prev.map(art => art.id === updatedArtwork.id ? updatedArtwork : art));
    try {
      await saveArtworkToFirestore(updatedArtwork);
    } catch (err) {
      console.error('Error updating artwork in Firestore:', err);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    setArtworks(prev => prev.filter(art => art.id !== artworkId));
    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork(null);
    }
    try {
      await deleteArtworkFromFirestore(artworkId);
    } catch (err) {
      console.error('Error deleting artwork from Firestore:', err);
    }
  };

  // Admin Actions on Ticket Prices (Syncs with Firestore)
  const handleUpdateTicketPrice = async (typeId: string, priceCFA: number, priceEUR: number, updates?: Partial<TicketType>) => {
    setTicketTypes(prev => prev.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          priceCFA,
          priceEUR,
          ...(updates || {})
        };
      }
      return type;
    }));
    try {
      await updateTicketTypeInFirestore(typeId, { priceCFA, priceEUR, ...(updates || {}) });
    } catch (err) {
      console.error('Error updating ticket price in Firestore:', err);
    }
  };

  const handleAddTicketType = async (newType: TicketType) => {
    setTicketTypes(prev => [...prev, newType]);
    try {
      await saveTicketTypeToFirestore(newType);
    } catch (err) {
      console.error('Error adding ticket type to Firestore:', err);
    }
  };

  const handleDeleteTicketType = async (ticketTypeId: string) => {
    setTicketTypes(prev => prev.filter(t => t.id !== ticketTypeId));
    try {
      await deleteTicketTypeFromFirestore(ticketTypeId);
    } catch (err) {
      console.error('Error deleting ticket type from Firestore:', err);
    }
  };

  // Admin Actions on Events (Syncs with Firestore)
  const handleAddEvent = async (newEvent: MuseumEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    try {
      await saveEventToFirestore(newEvent);
    } catch (err) {
      console.error('Error adding event to Firestore:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    try {
      await deleteEventFromFirestore(eventId);
    } catch (err) {
      console.error('Error deleting event from Firestore:', err);
    }
  };

  // Reset to Factory Defaults in Firestore Cloud & local
  const handleResetDefaults = async () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données (œuvres, tarifs, événements) aux valeurs initiales du musée dans le Cloud Firestore ?')) {
      setArtworks(ARTWORKS_DATA);
      setTicketTypes(TICKET_TYPES);
      setEvents(TODAY_EVENTS);
      localStorage.removeItem('mcn_artworks');
      localStorage.removeItem('mcn_ticket_types');
      localStorage.removeItem('mcn_events');
      try {
        await resetFirestoreToDefaults(ARTWORKS_DATA, TICKET_TYPES, TODAY_EVENTS);
      } catch (err) {
        console.error('Error resetting Firestore defaults:', err);
      }
    }
  };

  const handleOpenMapLocation = (floor: number) => {
    setMapInitialFloor(floor);
    setIsMapModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gate Ticket Validation (Syncs with Firestore in real-time)
  const handleValidateTicket = async (ticketId: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const target = allBookedTickets.find(t => t.ticketId === ticketId);
    const nextStatus = target?.status === 'used' ? 'valid' : 'used';
    const finalTimestamp = nextStatus === 'used' ? timestamp : undefined;

    setAllBookedTickets(prev => prev.map(t => {
      if (t.ticketId === ticketId) {
        return {
          ...t,
          status: nextStatus,
          validatedAt: finalTimestamp
        };
      }
      return t;
    }));

    try {
      await validateTicketInFirestore(ticketId, nextStatus, finalTimestamp);
    } catch (err) {
      console.error('Error validating ticket in Firestore:', err);
    }
  };

  // Guestbook Reviews Handlers (Syncs with Firestore)
  const handleAddReview = async (newReviewData: Omit<GuestbookReview, 'id' | 'createdAt' | 'likesCount'>) => {
    const newReview: GuestbookReview = {
      ...newReviewData,
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: []
    };

    // Optimistic local state update
    setGuestbookReviews(prev => [newReview, ...prev]);

    // Persist to Cloud Firestore
    try {
      await saveGuestbookReviewToFirestore(newReview);
    } catch (err) {
      console.error('Error saving review to Firestore:', err);
    }
  };

  const handleToggleLikeReview = async (reviewId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    // Optimistic local state update
    setGuestbookReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        const currentLikes = Array.isArray(rev.likedBy) ? rev.likedBy : [];
        const hasLiked = currentLikes.includes(userId);
        const updatedLikedBy = hasLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId];
        return {
          ...rev,
          likedBy: updatedLikedBy,
          likesCount: updatedLikedBy.length
        };
      }
      return rev;
    }));

    try {
      await toggleLikeGuestbookReviewInFirestore(reviewId, userId);
    } catch (err) {
      console.error('Error toggling review like in Firestore:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setGuestbookReviews(prev => prev.filter(r => r.id !== reviewId));
    try {
      await deleteGuestbookReviewFromFirestore(reviewId);
    } catch (err) {
      console.error('Error deleting review from Firestore:', err);
    }
  };

  const handleAdminReply = async (reviewId: string, reply: { author: string; message: string; date: string }) => {
    setGuestbookReviews(prev => prev.map(r => r.id === reviewId ? { ...r, adminResponse: reply } : r));
    try {
      await addAdminReplyToGuestbookReview(reviewId, reply);
    } catch (err) {
      console.error('Error saving admin reply to Firestore:', err);
    }
  };

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // If Admin and in Dashboard view mode, show full Admin Management Console
  if (currentUser.accountType === 'admin' && adminViewMode === 'dashboard') {
    return (
      <AdminDashboard
        user={currentUser}
        artworks={artworks}
        ticketTypes={ticketTypes}
        events={events}
        bookedTickets={allBookedTickets}
        guestbookReviews={guestbookReviews}
        onAddArtwork={handleAddArtwork}
        onUpdateArtwork={handleUpdateArtwork}
        onDeleteArtwork={handleDeleteArtwork}
        onUpdateTicketPrice={handleUpdateTicketPrice}
        onAddTicketType={handleAddTicketType}
        onDeleteTicketType={handleDeleteTicketType}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
        onValidateTicket={handleValidateTicket}
        onDeleteReview={handleDeleteReview}
        onAdminReply={handleAdminReply}
        onSwitchToVisitorView={() => setAdminViewMode('visitor_preview')}
        onLogout={handleLogout}
        onResetDefaults={handleResetDefaults}
      />
    );
  }

  // Visitor View (or Admin in Visitor Preview mode)
  return (
    <div id="mcn-application" className="min-h-screen bg-[#0A0A0A] text-[#F2E8DF] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0A0A0A]">
      
      {/* Top Floating Banner when an Admin is in Visitor Preview Mode */}
      {currentUser.accountType === 'admin' && (
        <aside aria-label="Bandeau de prévisualisation administrateur" className="bg-[#9B3922] text-[#F2E8DF] py-2.5 px-4 sticky top-0 z-50 shadow-md border-b border-[#D4AF37]/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>
                <strong>Mode Prévisualisation Visiteur</strong> : Vous consultez le site public avec vos privilèges d'administrateur ({currentUser.name} - {currentUser.adminTitle || 'Direction'}).
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdminViewMode('dashboard')}
                className="py-1 px-3 rounded-lg bg-[#0A0A0A] hover:bg-[#14100E] border border-[#D4AF37] text-[#D4AF37] font-syne font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retourner à la Console Admin</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenTicketsModal={() => setIsTicketingModalOpen(true)}
        onOpenMapModal={() => { setMapInitialFloor(0); setIsMapModalOpen(true); }}
        onOpenCuratorModal={() => setIsCuratorModalOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsModalOpen(true)}
        onScrollToSection={scrollToSection}
        favoritesCount={favorites.length}
        onOpenAdminDashboard={currentUser.accountType === 'admin' ? () => setAdminViewMode('dashboard') : undefined}
      />

      {/* Main Visitor Dashboard Flow */}
      <main className="flex-1">
        
        {/* Hero Welcome & Summary */}
        <DashboardHero
          user={currentUser}
          onOpenTicketsModal={() => setIsTicketingModalOpen(true)}
          onOpenMapModal={() => { setMapInitialFloor(0); setIsMapModalOpen(true); }}
          onOpenCuratorModal={() => setIsCuratorModalOpen(true)}
          onScrollToGallery={() => scrollToSection('gallery-section')}
        />

        {/* Section 1: Événements du jour à Dakar */}
        <EventsSection
          events={events}
          onOpenTicketsModal={() => setIsTicketingModalOpen(true)}
        />

        {/* Section 2: Raccourci Billetterie (CTA & Fast Checkout) */}
        <TicketingSection
          user={currentUser}
          ticketTypes={ticketTypes}
          onTicketPurchased={handleTicketPurchased}
          isModalOpen={isTicketingModalOpen}
          onCloseModal={() => setIsTicketingModalOpen(false)}
          onOpenAdminPricing={currentUser.accountType === 'admin' ? () => setAdminViewMode('dashboard') : undefined}
        />

        {/* Section 3: Œuvres Exposées (Galerie Interactive avec recherche en direct) */}
        <GallerySection
          artworks={artworks}
          currentUser={currentUser}
          onSelectArtwork={(art) => setSelectedArtwork(art)}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onOpenAdminDashboard={currentUser.accountType === 'admin' ? () => setAdminViewMode('dashboard') : undefined}
          onEditArtwork={currentUser.accountType === 'admin' ? () => setAdminViewMode('dashboard') : undefined}
          onDeleteArtwork={currentUser.accountType === 'admin' ? handleDeleteArtwork : undefined}
          onAddArtwork={currentUser.accountType === 'admin' ? () => setAdminViewMode('dashboard') : undefined}
        />

        {/* Section 4: Livre d'or & Avis des Visiteurs (Avis Vérifiés) */}
        <GuestbookSection
          user={currentUser}
          reviews={guestbookReviews}
          bookedTickets={allBookedTickets}
          onAddReview={handleAddReview}
          onToggleLikeReview={handleToggleLikeReview}
          onDeleteReview={currentUser.accountType === 'admin' ? handleDeleteReview : undefined}
          onAdminReply={currentUser.accountType === 'admin' ? handleAdminReply : undefined}
          onOpenTicketsModal={() => setIsTicketingModalOpen(true)}
          onOpenAuthModal={() => setCurrentUser(null)}
        />

      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={scrollToSection}
        onOpenTicketsModal={() => setIsTicketingModalOpen(true)}
        onOpenMapModal={() => { setMapInitialFloor(0); setIsMapModalOpen(true); }}
        onOpenCuratorModal={() => setIsCuratorModalOpen(true)}
      />

      {/* Pop-up Modals */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          isFavorite={favorites.includes(selectedArtwork.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenMapLocation={handleOpenMapLocation}
        />
      )}

      {isMyTicketsModalOpen && (
        <MyTicketsModal
          tickets={currentUser.bookedTickets || []}
          onClose={() => setIsMyTicketsModalOpen(false)}
          onOpenBooking={() => {
            setIsMyTicketsModalOpen(false);
            setIsTicketingModalOpen(true);
          }}
        />
      )}

      {isMapModalOpen && (
        <MuseumMapModal
          initialFloor={mapInitialFloor}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}

      {isCuratorModalOpen && (
        <VirtualCuratorModal
          onClose={() => setIsCuratorModalOpen(false)}
          onOpenBooking={() => {
            setIsCuratorModalOpen(false);
            setIsTicketingModalOpen(true);
          }}
          onExploreGallery={() => {
            setIsCuratorModalOpen(false);
            scrollToSection('gallery-section');
          }}
        />
      )}

    </div>
  );
}
