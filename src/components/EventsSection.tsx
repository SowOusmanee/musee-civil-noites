import React, { useState } from 'react';
import { MuseumEvent } from '../types';
import { TODAY_EVENTS } from '../data/museumData';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Ticket, 
  Bell, 
  X 
} from 'lucide-react';

interface EventsSectionProps {
  events?: MuseumEvent[];
  onOpenTicketsModal: () => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ 
  events = TODAY_EVENTS, 
  onOpenTicketsModal 
}) => {
  const { t, isFr } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<MuseumEvent | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [rsvpSuccessId, setRsvpSuccessId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: isFr ? 'Tous les événements' : 'All Events' },
    { id: 'Exposition Temporaire', label: isFr ? 'Expositions Temporaires' : 'Temporary Exhibitions' },
    { id: 'Conférence & Débat', label: isFr ? 'Conférences & Débats' : 'Talks & Debates' },
    { id: 'Atelier Vivant', label: isFr ? 'Ateliers Pratiques' : 'Workshops' },
    { id: 'Performance & Musique', label: isFr ? 'Musique & Soirées' : 'Music & Performances' },
  ];

  const filteredEvents = activeCategoryFilter === 'all'
    ? events
    : events.filter(e => e.category === activeCategoryFilter);

  const handleRSVP = (eventId: string) => {
    setRsvpSuccessId(eventId);
    setTimeout(() => {
      setRsvpSuccessId(null);
    }, 4000);
  };

  return (
    <section id="events-section" className="py-12 sm:py-16 bg-[#0A0A0A] relative border-b border-[#2D241F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14100E] border border-[#3D2B22] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('agendaSection')}</span>
            </div>
            <h2 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F2E8DF]">
              {isFr ? 'Événements & ' : 'Events & '}<span className="font-serif italic text-[#D4AF37]">{t('todayEvents')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8B735B] mt-1 max-w-2xl">
              {t('eventsSubtitle')}
            </p>
          </div>

          {/* Today's Date Banner */}
          <div className="bg-[#14100E] border border-[#2D241F] px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <div className="text-xs">
              <p className="text-[#F2E8DF] font-bold">{t('todayInDakar')}</p>
              <p className="text-[#D4AF37] text-[11px]">{t('ticketIncluded')}</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#14100E] text-[#8B735B] hover:text-[#F2E8DF] hover:bg-[#1A1310] border border-[#2D241F]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events Grid / Cards Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              id={`event-card-${event.id}`}
              className="bg-[#14100E] rounded-3xl border border-[#2D241F] hover:border-[#D4AF37]/50 overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Event Image */}
              <div className="relative h-44 overflow-hidden bg-[#0A0A0A]">
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-transparent to-black/40" />
                
                {/* Badge */}
                {event.badge && (
                  <span className="absolute top-3 left-3 bg-[#9B3922]/90 backdrop-blur-md text-[#F2E8DF] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#D4AF37]/40 uppercase tracking-wider">
                    {event.badge}
                  </span>
                )}

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#F2E8DF]">
                  <span className="flex items-center gap-1 bg-[#0A0A0A]/80 px-2 py-0.5 rounded-backdrop-blur-sm border border-[#2D241F]">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    {event.time}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-1">
                    {event.category}
                  </span>
                  <h3 className="font-syne font-bold text-sm sm:text-base text-[#F2E8DF] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="mt-2.5 space-y-1 text-xs text-[#8B735B]">
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                    {event.speakerOrArtist && (
                      <p className="flex items-center gap-1.5 text-[11px] text-[#F2E8DF]/75">
                        <User className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{event.speakerOrArtist}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#8B735B] mt-2 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#2D241F] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('detailsProgram')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRSVP(event.id)}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      rsvpSuccessId === event.id
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                        : 'bg-[#1A1310] hover:bg-[#2D241F] text-[#F2E8DF] border border-[#2D241F]'
                    }`}
                    title={isFr ? "Ajouter un rappel" : "Set reminder"}
                  >
                    {rsvpSuccessId === event.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px]">{t('reminderRegistered')}</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[10px]">{t('reminder')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Event Details Popup Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="relative h-48 sm:h-56">
              <img 
                src={selectedEvent.imageUrl} 
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-black/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-[#F2E8DF] hover:bg-black cursor-pointer border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {selectedEvent.category}
                </span>
                <h3 className="font-syne text-lg sm:text-xl font-bold text-[#F2E8DF]">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#8B735B]">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#1A1310] rounded-xl border border-[#2D241F]">
                <div>
                  <span className="text-[10px] text-[#8B735B] uppercase block">{isFr ? 'Horaire' : 'Schedule'}</span>
                  <span className="font-semibold text-[#F2E8DF]">{selectedEvent.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B735B] uppercase block">{isFr ? 'Lieu' : 'Location'}</span>
                  <span className="font-semibold text-[#F2E8DF]">{selectedEvent.location}</span>
                </div>
              </div>

              {selectedEvent.speakerOrArtist && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] block mb-0.5">
                    {isFr ? 'Intervenant / Artiste invité' : 'Speaker / Guest Artist'}
                  </span>
                  <p className="text-sm font-semibold text-[#F2E8DF]">
                    {selectedEvent.speakerOrArtist}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block mb-1">
                  {isFr ? 'Présentation de la séance' : 'Event Overview'}
                </span>
                <p className="leading-relaxed text-[#F2E8DF]/90 text-xs">
                  {selectedEvent.fullDetails || selectedEvent.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#2D241F] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="py-2.5 px-4 rounded-xl bg-[#1A1310] text-[#8B735B] hover:text-[#F2E8DF] text-xs font-semibold cursor-pointer border border-[#2D241F]"
                >
                  {isFr ? 'Fermer' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    onOpenTicketsModal();
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isFr ? 'Réserver mon accès' : 'Book my ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

