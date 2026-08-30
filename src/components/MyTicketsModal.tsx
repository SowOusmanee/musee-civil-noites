import React from 'react';
import { BookedTicket } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Ticket, 
  QrCode, 
  Calendar, 
  Clock, 
  User, 
  Printer, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

interface MyTicketsModalProps {
  tickets: BookedTicket[];
  onClose: () => void;
  onOpenBooking: () => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  tickets,
  onClose,
  onOpenBooking
}) => {
  const { t, isFr } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2D241F] bg-[#1A1310] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D241F] border border-[#3D2B22] flex items-center justify-center text-[#D4AF37]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                {t('myTicketsTitle')}
              </h3>
              <p className="text-xs text-[#8B735B]">
                {tickets.length} {isFr ? "pass d'accès actif(s) pour le Musée de Dakar" : "active pass(es) for the Museum in Dakar"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#0A0A0A]">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div 
                key={ticket.ticketId}
                className="bg-[#14100E] rounded-2xl border border-[#2D241F] hover:border-[#D4AF37]/50 p-5 relative overflow-hidden shadow-xl"
              >
                {/* Visual African side accent stripe */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#D4AF37]" />

                <div className="pl-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#9B3922] text-[#F2E8DF] text-[10px] font-bold tracking-wider">
                        {ticket.ticketId}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {isFr ? 'Validé & Coupe-File' : 'Validated & Fast-Track'}
                      </span>
                    </div>

                    <h4 className="font-syne text-lg font-bold text-[#F2E8DF]">
                      {ticket.ticketTypeName}
                    </h4>

                    <p className="text-xs text-[#8B735B] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{ticket.visitorName} ({ticket.quantity} {isFr ? `personne${ticket.quantity > 1 ? 's' : ''}` : `guest${ticket.quantity > 1 ? 's' : ''}`})</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B735B] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {ticket.visitDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {ticket.timeSlot}
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center flex-shrink-0 self-center sm:self-auto shadow-md">
                    <img 
                      src={ticket.qrCodeUrl} 
                      alt="QR Code" 
                      className="w-24 h-24"
                    />
                    <span className="text-[9px] text-black font-mono font-bold mt-0.5">{isFr ? 'SCAN ENTRÉE' : 'ENTRY SCAN'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2D241F] flex items-center justify-between text-xs text-[#8B735B]">
                  <span>{isFr ? 'Montant réglé :' : 'Amount paid:'} <strong className="text-[#D4AF37]">{ticket.totalPriceCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} FCFA</strong></span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-[#8B735B] hover:text-[#D4AF37] cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isFr ? 'Imprimer pass' : 'Print pass'}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#14100E] rounded-2xl border border-[#2D241F] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#D4AF37] flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="font-syne text-base font-bold text-[#F2E8DF]">
                {t('noTicketsFound')}
              </h4>
              <p className="text-xs text-[#8B735B] max-w-sm mx-auto">
                {isFr 
                  ? 'Réservez dès maintenant votre accès pour le Musée des Civilisations Noires et bénéficiez de l\'accès coupe-file.'
                  : 'Book your pass now for the Museum of Black Civilizations and enjoy fast-track priority entry.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="mt-2 py-2.5 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-syne font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              >
                <Plus className="w-4 h-4" />
                <span>{t('buyATicket')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1A1310] border-t border-[#2D241F] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14100E] border border-[#2D241F] text-xs font-semibold text-[#F2E8DF] hover:bg-[#2D241F] cursor-pointer"
          >
            {t('close')}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-syne font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFr ? 'Nouveau Billet' : 'New Ticket'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

