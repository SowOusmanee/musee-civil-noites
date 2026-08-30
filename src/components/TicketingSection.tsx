import React, { useState } from 'react';
import { UserProfile, BookedTicket, TicketType } from '../types';
import { TICKET_TYPES } from '../data/museumData';
import { useLanguage } from '../context/LanguageContext';
import { 
  Ticket, 
  Check, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  QrCode, 
  Printer, 
  X, 
  UserCheck, 
  Zap, 
  DollarSign,
  Edit3
} from 'lucide-react';

interface TicketingSectionProps {
  user: UserProfile;
  ticketTypes?: TicketType[];
  onTicketPurchased: (ticket: BookedTicket) => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
  onOpenAdminPricing?: () => void;
}

export const TicketingSection: React.FC<TicketingSectionProps> = ({
  user,
  ticketTypes = TICKET_TYPES,
  onTicketPurchased,
  isModalOpen = false,
  onCloseModal,
  onOpenAdminPricing
}) => {
  const { t, isFr } = useLanguage();
  const [selectedTypeId, setSelectedTypeId] = useState<string>(ticketTypes[0]?.id || 'ticket-standard-local');
  const [quantity, setQuantity] = useState<number>(1);
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('14h00 - 16h30');
  const [includeAudioGuide, setIncludeAudioGuide] = useState<boolean>(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(isModalOpen);
  const [purchasedTicket, setPurchasedTicket] = useState<BookedTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isAdmin = user.accountType === 'admin';
  const selectedType = ticketTypes.find(t => t.id === selectedTypeId) || ticketTypes[0] || TICKET_TYPES[0];
  const totalPriceCFA = selectedType.priceCFA * quantity;
  const totalPriceEUR = Math.round(selectedType.priceEUR * quantity * 10) / 10;

  const timeSlots = isFr ? [
    '10h00 - 12h00 (Matinée calme)',
    '12h00 - 14h00 (Créneau midi)',
    '14h00 - 16h30 (Après-midi)',
    '16h30 - 19h00 (Crépuscule & Conférences)'
  ] : [
    '10:00 AM - 12:00 PM (Quiet Morning)',
    '12:00 PM - 02:00 PM (Midday Slot)',
    '02:00 PM - 04:30 PM (Afternoon)',
    '04:30 PM - 07:00 PM (Sunset & Talks)'
  ];

  const handleStartBooking = (typeId?: string) => {
    if (typeId) setSelectedTypeId(typeId);
    setShowCheckoutModal(true);
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const newTicketId = `MCN-TKT-${Date.now().toString().slice(-6)}`;
      const newBookedTicket: BookedTicket = {
        ticketId: newTicketId,
        ticketTypeId: selectedType.id,
        ticketTypeName: selectedType.name,
        visitorName: user.name || (isFr ? 'Visiteur MCN' : 'MCN Visitor'),
        visitorEmail: user.email || 'visiteur@mcn.sn',
        visitDate: visitDate,
        timeSlot: timeSlot,
        quantity: quantity,
        totalPriceCFA: totalPriceCFA,
        purchaseDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${newTicketId}`,
        includesAudioGuide: includeAudioGuide,
        includesGuidedTour: selectedType.id === 'ticket-vip-guide'
      };

      setIsProcessing(false);
      setPurchasedTicket(newBookedTicket);
      onTicketPurchased(newBookedTicket);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="ticketing-section" className="py-12 sm:py-16 bg-[#0A0A0A] border-b border-[#2D241F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Admin Pricing Notice if Admin is logged in */}
        {isAdmin && onOpenAdminPricing && (
          <div className="p-4 rounded-2xl bg-[#14100E] border border-[#D4AF37]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="font-syne font-bold text-xs sm:text-sm text-[#F2E8DF]">
                  {isFr ? 'Gestion des Tarifs (Accès Administrateur)' : 'Pricing Management (Admin Access)'}
                </p>
                <p className="text-[11px] text-[#8B735B]">
                  {isFr 
                    ? 'Vous pouvez ajuster les prix en FCFA/EUR pour chaque pass directement depuis la console.' 
                    : 'You can adjust prices in FCFA/EUR for each ticket directly in the console.'}
                </p>
              </div>
            </div>

            <button
              id="btn-admin-edit-prices"
              type="button"
              onClick={onOpenAdminPricing}
              className="py-2 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('adminEditPrices')}</span>
            </button>
          </div>
        )}

        {/* Section 2 Banner CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-[#9B3922] via-[#7B2D12] to-[#14100E] p-8 sm:p-12 shadow-2xl border border-[#D4AF37]/30 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4 text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14100E]/80 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('ticketingSection')}</span>
              </div>

              <h2 className="font-syne text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-[#F2E8DF]">
                {t('buyTicketOneClick')}
              </h2>

              <p className="text-[#F2E8DF]/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                {t('ticketingSubtitle')}
              </p>

              {/* Key Quick Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 bg-[#0A0A0A]/60 backdrop-blur-sm p-2.5 rounded-xl border border-[#2D241F]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isFr ? 'Billet 100% Digital & Coupe-File' : '100% Digital Fast-Track Pass'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A0A0A]/60 backdrop-blur-sm p-2.5 rounded-xl border border-[#2D241F]">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isFr ? 'Validation Instantanée QR Code' : 'Instant QR Code Validation'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A0A0A]/60 backdrop-blur-sm p-2.5 rounded-xl border border-[#2D241F] col-span-2 sm:col-span-1">
                  <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Wave / Orange Money / CB</span>
                </div>
              </div>
            </div>

            {/* Right Action Button Block */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <div className="bg-[#14100E]/95 backdrop-blur-md p-6 rounded-2xl border border-[#2D241F] hover:border-[#D4AF37]/50 text-center w-full max-w-sm shadow-2xl space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8B735B] font-semibold">
                    {t('pricingFrom')}
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mt-1">
                    <span className="font-syne text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                      {(ticketTypes[1]?.priceCFA || 1000).toLocaleString('fr-FR')}
                    </span>
                    <span className="text-sm font-bold text-[#F2E8DF]">FCFA</span>
                    <span className="text-xs text-[#8B735B]">
                      (~{ticketTypes[1]?.priceEUR || 1.5} €)
                    </span>
                  </div>
                </div>

                <button
                  id="btn-direct-buy-ticket"
                  type="button"
                  onClick={() => handleStartBooking(ticketTypes[0]?.id)}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{t('buyATicket')}</span>
                </button>

                <p className="text-[11px] text-[#8B735B]">
                  {isFr 
                    ? 'Paiement sécurisé avec reçu fiscal et QR code instantané.' 
                    : 'Secure checkout with immediate fiscal receipt and QR code.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Pricing Table Cards Grid */}
        <div>
          <div className="text-center mb-8">
            <h3 className="font-syne text-xl sm:text-2xl font-bold text-[#F2E8DF]">
              {isFr ? 'Consultez nos différentes formules de visite' : 'Choose Your Museum Pass'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8B735B] mt-1">
              {isFr 
                ? 'Des tarifs adaptés à tous les publics : résidents, étudiants, familles et visiteurs internationaux.' 
                : 'Rates tailored for all visitors: residents, students, researchers, and global tourists.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ticketTypes.map((type) => (
              <div
                key={type.id}
                id={`ticket-card-${type.id}`}
                className={`rounded-3xl bg-[#14100E] border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  type.popular 
                    ? 'border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10 -translate-y-1' 
                    : 'border-[#2D241F] hover:border-[#D4AF37]/50'
                }`}
              >
                {type.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                    {t('mostPopular')}
                  </div>
                )}

                <div>
                  <h4 className="font-syne font-bold text-base text-[#F2E8DF]">
                    {type.name}
                  </h4>
                  <p className="text-xs text-[#8B735B] mt-1 min-h-[32px]">
                    {type.description}
                  </p>

                  <div className="my-5 pb-4 border-b border-[#2D241F] flex items-baseline gap-1.5">
                    <span className="font-syne text-3xl font-bold text-[#F2E8DF]">
                      {type.priceCFA.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs font-bold text-[#D4AF37]">FCFA</span>
                    <span className="text-[11px] text-[#8B735B]">({type.priceEUR} €)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#8B735B]">
                    {type.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2D241F]">
                  <button
                    type="button"
                    onClick={() => handleStartBooking(type.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      type.popular
                        ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] shadow-md'
                        : 'bg-[#1A1310] hover:bg-[#2D241F] text-[#F2E8DF] border border-[#2D241F] hover:border-[#D4AF37]'
                    }`}
                  >
                    <span>{t('selectThisRate')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Booking & Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-[#2D241F] bg-[#1A1310] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-syne text-lg font-bold text-[#F2E8DF]">
                    {purchasedTicket ? (isFr ? 'Votre Billet d\'Entrée MCN' : 'Your MCN Admission Ticket') : (isFr ? 'Réservation de Billets en Ligne' : 'Online Ticket Reservation')}
                  </h3>
                  <p className="text-xs text-[#8B735B]">
                    {t('museumFullName')} • Dakar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCheckoutModal(false);
                  setPurchasedTicket(null);
                  if (onCloseModal) onCloseModal();
                }}
                className="p-2 rounded-full bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Checkout Form vs. Confirmed Ticket */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {!purchasedTicket ? (
                <>
                  {/* Step 1: Select Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B735B] mb-2">
                      {isFr ? 'Formule choisie' : 'Selected pass'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ticketTypes.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTypeId(t.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            selectedTypeId === t.id
                              ? 'bg-[#1A1310] border-[#D4AF37] text-[#F2E8DF]'
                              : 'bg-[#0A0A0A] border-[#2D241F] text-[#8B735B] hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{t.name}</span>
                            <span className="font-bold text-[#D4AF37]">{t.priceCFA.toLocaleString('fr-FR')} F</span>
                          </div>
                          <p className="text-[11px] text-[#8B735B] mt-0.5 line-clamp-1">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Date & Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#8B735B] mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isFr ? 'Date de la visite' : 'Date of visit'}</span>
                      </label>
                      <input 
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-xs text-[#F2E8DF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8B735B] mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isFr ? 'Créneau horaire' : 'Time slot'}</span>
                      </label>
                      <select 
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-xs text-[#F2E8DF] outline-none cursor-pointer"
                      >
                        {timeSlots.map((slot, idx) => (
                          <option key={idx} value={slot} className="bg-[#14100E] text-[#F2E8DF]">
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 3: Quantity */}
                  <div className="flex items-center justify-between p-3.5 bg-[#1A1310] rounded-2xl border border-[#2D241F]">
                    <div>
                      <p className="text-xs font-semibold text-[#F2E8DF]">{isFr ? 'Nombre de visiteurs' : 'Number of visitors'}</p>
                      <p className="text-[11px] text-[#8B735B]">{isFr ? 'Accès individuel ou groupe' : 'Individual or group tickets'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-[#14100E] border border-[#2D241F] text-[#F2E8DF] font-bold text-sm hover:border-[#D4AF37] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-syne font-bold text-base text-[#F2E8DF] w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-[#14100E] border border-[#2D241F] text-[#F2E8DF] font-bold text-sm hover:border-[#D4AF37] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Summary & Price */}
                  <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#2D241F] space-y-2 text-xs">
                    <div className="flex justify-between text-[#8B735B]">
                      <span>{selectedType.name} × {quantity}</span>
                      <span>{totalPriceCFA.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-[#8B735B]">
                      <span>{isFr ? 'Guide audio digital' : 'Digital audio guide'}</span>
                      <span className="text-emerald-400 font-semibold">{isFr ? 'Inclus' : 'Included'}</span>
                    </div>
                    <div className="pt-2 border-t border-[#2D241F] flex justify-between items-baseline font-bold text-sm text-[#F2E8DF]">
                      <span>{isFr ? 'Total à régler' : 'Total due'}</span>
                      <div className="text-right">
                        <span className="font-syne text-lg text-[#D4AF37] mr-2">
                          {totalPriceCFA.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-xs text-[#8B735B]">({totalPriceEUR} €)</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    id="btn-confirm-ticket-purchase"
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmPurchase}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <span>{isFr ? 'Émission du billet en cours...' : 'Issuing ticket...'}</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{isFr ? `Payer ${totalPriceCFA.toLocaleString('fr-FR')} FCFA (Wave / OM / CB)` : `Pay ${totalPriceCFA.toLocaleString('fr-FR')} FCFA (Wave / OM / Card)`}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Confirmed Ticket Receipt with QR Code */
                <div className="space-y-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="font-syne text-xl font-bold text-[#F2E8DF]">
                      {isFr ? 'Réservation Confirmée !' : 'Booking Confirmed!'}
                    </h4>
                    <p className="text-xs text-[#8B735B] mt-1">
                      {isFr 
                        ? 'Votre billet a été généré et enregistré dans votre profil MCN.'
                        : 'Your pass has been generated and saved to your MCN profile.'}
                    </p>
                  </div>

                  {/* Physical Style Ticket Voucher Card */}
                  <div className="p-6 bg-[#1A1310] border border-[#D4AF37]/50 rounded-3xl text-left space-y-4 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#2D241F] pb-3">
                      <div>
                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">{isFr ? 'Pass Coupe-File' : 'Fast-Track Pass'}</span>
                        <p className="font-syne font-bold text-sm text-[#F2E8DF]">{purchasedTicket.ticketTypeName}</p>
                      </div>
                      <span className="font-mono text-xs text-[#8B735B] font-bold">
                        {purchasedTicket.ticketId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#8B735B] text-[10px] block">{isFr ? 'Titulaire' : 'Holder'}</span>
                        <span className="font-semibold text-[#F2E8DF]">{purchasedTicket.visitorName}</span>
                      </div>
                      <div>
                        <span className="text-[#8B735B] text-[10px] block">{isFr ? 'Date de visite' : 'Visit Date'}</span>
                        <span className="font-semibold text-[#F2E8DF]">{purchasedTicket.visitDate}</span>
                      </div>
                      <div>
                        <span className="text-[#8B735B] text-[10px] block">{isFr ? 'Créneau' : 'Slot'}</span>
                        <span className="font-semibold text-[#F2E8DF]">{purchasedTicket.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[#8B735B] text-[10px] block">{isFr ? 'Quantité' : 'Quantity'}</span>
                        <span className="font-semibold text-[#F2E8DF]">{purchasedTicket.quantity} {isFr ? 'entrée(s)' : 'ticket(s)'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2D241F] flex items-center justify-between">
                      <div className="w-20 h-20 bg-white p-1 rounded-xl">
                        <img 
                          src={purchasedTicket.qrCodeUrl} 
                          alt="QR Code Billet"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8B735B] block">{isFr ? 'Total Payé' : 'Total Paid'}</span>
                        <span className="font-syne text-base font-bold text-[#D4AF37]">
                          {purchasedTicket.totalPriceCFA.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A1310] border border-[#2D241F] text-xs font-semibold text-[#F2E8DF] flex items-center justify-center gap-2 cursor-pointer hover:border-[#D4AF37]"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isFr ? 'Imprimer / PDF' : 'Print / PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckoutModal(false);
                        setPurchasedTicket(null);
                        if (onCloseModal) onCloseModal();
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0A0A0A] font-syne font-bold text-xs uppercase cursor-pointer"
                    >
                      {isFr ? 'Fermer' : 'Close'}
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </section>
  );
};

