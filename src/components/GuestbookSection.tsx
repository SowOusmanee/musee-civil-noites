import React, { useState, useMemo } from 'react';
import { UserProfile, BookedTicket, GuestbookReview, ReviewCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Filter, 
  Search, 
  Send, 
  Ticket, 
  Calendar, 
  UserCheck, 
  Award, 
  ThumbsUp, 
  AlertCircle,
  Clock,
  Trash2,
  Reply,
  Check,
  ChevronDown
} from 'lucide-react';

interface GuestbookSectionProps {
  user: UserProfile | null;
  reviews: GuestbookReview[];
  bookedTickets: BookedTicket[];
  onAddReview: (review: Omit<GuestbookReview, 'id' | 'createdAt' | 'likesCount'>) => Promise<void>;
  onToggleLikeReview: (reviewId: string) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onAdminReply?: (reviewId: string, reply: { author: string; message: string; date: string }) => Promise<void>;
  onOpenTicketsModal: () => void;
  onOpenAuthModal?: () => void;
}

const CATEGORY_INFO: Record<ReviewCategory, { labelFr: string; labelEn: string; icon: string }> = {
  visite_generale: {
    labelFr: 'Visite Générale',
    labelEn: 'General Visit',
    icon: '🏛️'
  },
  sculptures_masques: {
    labelFr: 'Masques & Sculptures',
    labelEn: 'Masks & Sculptures',
    icon: '🎭'
  },
  architecture_musee: {
    labelFr: 'Architecture & Espaces',
    labelEn: 'Architecture & Spaces',
    icon: '✨'
  },
  expositions_temporaires: {
    labelFr: 'Expos Temporaires',
    labelEn: 'Temp Exhibitions',
    icon: '🖼️'
  },
  mediation_guides: {
    labelFr: 'Médiation & Guides',
    labelEn: 'Guided Mediation',
    icon: '🗣️'
  },
  evenements_ateliers: {
    labelFr: 'Événements & Ateliers',
    labelEn: 'Events & Workshops',
    icon: '🥁'
  }
};

const RATING_LABELS_FR: Record<number, string> = {
  5: 'Exceptionnel & Inoubliable',
  4: 'Très belle expérience',
  3: 'Visite intéressante',
  2: 'Expérience moyenne',
  1: 'Décevant'
};

const RATING_LABELS_EN: Record<number, string> = {
  5: 'Exceptional & Unforgettable',
  4: 'Great experience',
  3: 'Interesting visit',
  2: 'Average experience',
  1: 'Disappointing'
};

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  user,
  reviews,
  bookedTickets,
  onAddReview,
  onToggleLikeReview,
  onDeleteReview,
  onAdminReply,
  onOpenTicketsModal,
  onOpenAuthModal
}) => {
  const { isFr } = useLanguage();

  // Filters & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'popular'>('recent');

  // Form State
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<ReviewCategory>('visite_generale');
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [userCountryInput, setUserCountryInput] = useState<string>(user?.country || 'Sénégal');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Admin Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');

  // Find user's tickets (from user profile or global matching tickets)
  const userTickets = useMemo(() => {
    if (!user) return [];
    const direct = user.bookedTickets || [];
    const fromGlobal = bookedTickets.filter(
      t => t.visitorEmail?.toLowerCase() === user.email?.toLowerCase() &&
           !direct.some(d => d.ticketId === t.ticketId)
    );
    return [...direct, ...fromGlobal];
  }, [user, bookedTickets]);

  // Has any ticket (used or valid)
  const hasEligibleTicket = userTickets.length > 0;
  const userUsedTickets = userTickets.filter(t => t.status === 'used');

  // Auto-select first ticket if available
  React.useEffect(() => {
    if (userTickets.length > 0 && !selectedTicketId) {
      // Prioritize used tickets or first valid ticket
      const preferred = userUsedTickets[0] || userTickets[0];
      setSelectedTicketId(preferred.ticketId);
    }
  }, [userTickets, userUsedTickets, selectedTicketId]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { avg: 5.0, count: 0, starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, recommendRate: 100 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / total).toFixed(1));
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      starCounts[rounded] = (starCounts[rounded] || 0) + 1;
    });
    const highRatings = (starCounts[5] + starCounts[4]);
    const recommendRate = Math.round((highRatings / total) * 100);
    return { avg, count: total, starCounts, recommendRate };
  }, [reviews]);

  // Filtered & Sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter(rev => {
        // Category filter
        if (selectedCategoryFilter !== 'all' && rev.experienceCategory !== selectedCategoryFilter) {
          return false;
        }
        // Rating filter
        if (ratingFilter !== 'all' && rev.rating !== ratingFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rev.userName?.toLowerCase().includes(q);
          const matchComment = rev.comment?.toLowerCase().includes(q);
          const matchTitle = rev.title?.toLowerCase().includes(q);
          const matchCountry = rev.userCountry?.toLowerCase().includes(q);
          return matchName || matchComment || matchTitle || matchCountry;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'popular') {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        return 0;
      });
  }, [reviews, selectedCategoryFilter, ratingFilter, searchQuery, sortBy]);

  // Handle Submit Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError(isFr ? "Veuillez vous connecter pour publier votre avis." : "Please sign in to post your review.");
      return;
    }

    if (!hasEligibleTicket) {
      setSubmitError(
        isFr 
          ? "Un billet MCN valide est requis pour certifier votre avis dans le Livre d'or." 
          : "A valid MCN pass is required to verify your guestbook entry."
      );
      return;
    }

    if (reviewComment.trim().length < 10) {
      setSubmitError(
        isFr 
          ? "Votre avis doit contenir au moins 10 caractères." 
          : "Your review must be at least 10 characters long."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const activeTicket = userTickets.find(t => t.ticketId === selectedTicketId) || userTickets[0];

      await onAddReview({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userCountry: userCountryInput.trim() || user.country || 'Sénégal',
        userRole: user.accountType === 'admin' ? (user.adminTitle || 'Administrateur') : user.role,
        rating: selectedRating,
        experienceCategory: selectedCategory,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        ticketId: activeTicket?.ticketId,
        ticketTypeName: activeTicket?.ticketTypeName || 'Billet MCN Vérifié',
        visitDate: activeTicket?.visitDate || new Date().toISOString().split('T')[0],
        isVerifiedVisitor: true
      });

      setSubmitSuccess(true);
      setReviewComment('');
      setReviewTitle('');
      setShowReviewForm(false);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error adding review:', err);
      setSubmitError(err.message || (isFr ? "Une erreur est survenue lors de l'enregistrement." : "Failed to record review."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminReplySubmit = async (reviewId: string) => {
    if (!adminReplyText.trim() || !onAdminReply) return;
    try {
      await onAdminReply(reviewId, {
        author: user?.adminTitle || user?.name || 'Direction de la Conservation MCN',
        message: adminReplyText.trim(),
        date: new Date().toISOString().split('T')[0]
      });
      setReplyingReviewId(null);
      setAdminReplyText('');
    } catch (e) {
      console.error('Error replying to review:', e);
    }
  };

  return (
    <section id="guestbook-section" className="py-24 bg-[#0A0A0A] relative border-t border-[#2D241F]">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1713] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-syne font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isFr ? "Livre d'or Officiel du MCN" : "Official MCN Guestbook"}</span>
          </div>

          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2E8DF]">
            {isFr ? "Témoignages & Émotions des Visiteurs" : "Visitor Testimonials & Experiences"}
          </h2>

          <p className="text-base text-[#8B735B] font-serif leading-relaxed">
            {isFr 
              ? "Découvrez les avis authentiques certifiés par billet de nos visiteurs du Sénégal, d'Afrique et de la diaspora internationale." 
              : "Explore verified visitor reviews and memories from Senegal, across Africa and the global diaspora."}
          </p>
        </div>

        {/* TOP STATS & REVIEW INVITATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-stretch">
          
          {/* Global Rating Scorecard (5 cols) */}
          <div className="lg:col-span-5 bg-[#14100E] border border-[#2D241F] rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-syne font-bold tracking-wider text-[#8B735B]">
                  {isFr ? "Note Globale des Visiteurs" : "Overall Visitor Rating"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFr ? "100% Billets Vérifiés" : "100% Verified Tickets"}</span>
                </span>
              </div>

              {/* Big Score Number */}
              <div className="flex items-baseline gap-4">
                <span className="font-syne text-6xl font-bold text-[#D4AF37]">
                  {stats.avg}
                </span>
                <div>
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= Math.round(stats.avg) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#3D2B22]'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#8B735B]">
                    {isFr ? `Basé sur ${stats.count} avis certifiés` : `Based on ${stats.count} certified reviews`}
                  </span>
                </div>
              </div>

              {/* Star Rating Breakdown Progress Bars */}
              <div className="space-y-2 pt-4 border-t border-[#2D241F]">
                {[5, 4, 3, 2, 1].map((ratingLevel) => {
                  const count = stats.starCounts[ratingLevel as 1|2|3|4|5] || 0;
                  const percent = stats.count > 0 ? Math.round((count / stats.count) * 100) : (ratingLevel === 5 ? 85 : ratingLevel === 4 ? 15 : 0);
                  return (
                    <div key={ratingLevel} className="flex items-center gap-3 text-xs">
                      <span className="w-8 font-mono text-[#8B735B] flex items-center gap-1">
                        {ratingLevel} <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-[#0A0A0A] overflow-hidden border border-[#2D241F]">
                        <div 
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B38F26] rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-[#8B735B]">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Satisfaction KPI footer */}
            <div className="pt-6 mt-6 border-t border-[#2D241F] flex items-center justify-between text-xs text-[#8B735B]">
              <div className="flex items-center gap-2 text-[#F2E8DF]">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>{isFr ? `${stats.recommendRate}% recommandent la visite` : `${stats.recommendRate}% recommend visiting`}</span>
              </div>
              <span className="text-[11px] text-[#8B735B]">Dakar • MCN</span>
            </div>
          </div>

          {/* Action Box / Write a Review Call to Action (7 cols) */}
          <div className="lg:col-span-7 bg-[#14100E] border border-[#2D241F] rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1713] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-syne font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFr ? "Partagez Votre Expérience" : "Share Your Experience"}</span>
              </div>

              <h3 className="font-syne text-2xl font-bold text-[#F2E8DF]">
                {isFr ? "Vous avez visité le musée avec un billet valide ?" : "Visited the museum with a valid ticket?"}
              </h3>

              <p className="text-sm text-[#8B735B] font-serif leading-relaxed">
                {isFr 
                  ? "Pour garantir la sincérité et la qualité des témoignages, chaque mot du Livre d'or est authentifié par une référence de billet MCN (résident, international ou pass guidé)." 
                  : "To guarantee authentic feedback, every guestbook contribution is certified with a genuine MCN ticket reference."}
              </p>

              {/* User Ticket Status Check */}
              {user ? (
                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2D241F] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B735B]">
                      {isFr ? "Visiteur connecté :" : "Connected visitor:"} <strong className="text-[#F2E8DF]">{user.name}</strong>
                    </span>
                    <span className="text-xs text-[#D4AF37] font-mono">
                      {user.email}
                    </span>
                  </div>

                  {hasEligibleTicket ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        {isFr 
                          ? `Billet MCN éligible détecté (${userTickets.length} entrée(s) trouvée(s)). Vous pouvez signer le Livre d'or !` 
                          : `Eligible MCN ticket found (${userTickets.length} pass(es)). You are certified to leave a review!`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 text-xs text-[#8B735B] bg-[#1F1713] p-3 rounded-xl border border-[#2D241F]">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>
                          {isFr 
                            ? "Aucun billet associé à ce compte. Réservez une entrée pour laisser votre avis." 
                            : "No ticket registered on this account yet. Book a pass to post."}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenTicketsModal}
                        className="py-1.5 px-3 rounded-lg bg-[#D4AF37] text-[#0A0A0A] font-syne font-bold text-xs shrink-0 cursor-pointer hover:bg-[#E5C158] transition-all"
                      >
                        {isFr ? "Acheter un Billet" : "Buy Ticket"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2D241F] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#F2E8DF] block">
                      {isFr ? "Connexion requise pour signer le Livre d'or" : "Sign in required to post"}
                    </span>
                    <span className="text-xs text-[#8B735B]">
                      {isFr ? "Connectez-vous avec votre compte visiteur ou achetez un billet." : "Sign in with your visitor account or buy a ticket."}
                    </span>
                  </div>
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="py-2 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shrink-0"
                    >
                      {isFr ? "Se Connecter" : "Sign In"}
                    </button>
                  )}
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isFr 
                      ? "Jërëjëf ! Votre avis a été enregistré avec succès et publié dans le Livre d'or du Musée des Civilisations Noires." 
                      : "Thank you! Your verified review has been successfully posted to the official MCN Guestbook."}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button to Open Form */}
            <div className="pt-6 mt-6 border-t border-[#2D241F] flex flex-wrap gap-4 items-center justify-between">
              {hasEligibleTicket ? (
                <button
                  type="button"
                  id="btn-open-review-form"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="py-3 px-6 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.25)] active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {showReviewForm 
                      ? (isFr ? "Masquer le formulaire" : "Hide Form") 
                      : (isFr ? "Laisser un Avis / Témoignage" : "Write a Guestbook Review")}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenTicketsModal}
                  className="py-3 px-6 rounded-2xl bg-[#1F1713] hover:bg-[#2D241F] border border-[#D4AF37]/50 text-[#D4AF37] font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isFr ? "Réserver un Billet pour Laisser un Avis" : "Book Ticket to Post"}</span>
                </button>
              )}

              <span className="text-xs text-[#8B735B]">
                {isFr ? "Modération & respect de la charte culturelle MCN" : "Moderated under MCN cultural guidelines"}
              </span>
            </div>

          </div>

        </div>

        {/* INLINE REVIEW SUBMISSION FORM */}
        {showReviewForm && hasEligibleTicket && (
          <div id="review-submission-form-container" className="mb-16 bg-[#14100E] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-[#2D241F] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-syne text-lg font-bold text-[#F2E8DF]">
                    {isFr ? "Rédiger votre note dans le Livre d'or" : "Write your Guestbook entry"}
                  </h4>
                  <p className="text-xs text-[#8B735B]">
                    {isFr ? "Votre avis sera visible publiquement avec le badge de visiteur vérifié." : "Your review will appear publicly with a verified visitor badge."}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-[#D4AF37] bg-[#1F1713] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                {user?.name}
              </span>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              
              {/* Row 1: Star Rating Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-syne uppercase tracking-wider font-bold text-[#8B735B]">
                  {isFr ? "Votre Note Globale :" : "Your Rating:"}
                </label>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 p-2 bg-[#0A0A0A] rounded-2xl border border-[#2D241F]">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || selectedRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                        >
                          <Star 
                            className={`w-7 h-7 transition-colors ${
                              isActive 
                                ? 'fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' 
                                : 'text-[#3D2B22]'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-sm font-syne font-bold text-[#D4AF37]">
                    {isFr ? RATING_LABELS_FR[hoverRating || selectedRating] : RATING_LABELS_EN[hoverRating || selectedRating]}
                  </span>
                </div>
              </div>

              {/* Row 2: Select Category & Ticket Attachment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-syne uppercase tracking-wider font-bold text-[#8B735B]">
                    {isFr ? "Thématique principale :" : "Main Category:"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CATEGORY_INFO) as ReviewCategory[]).map((cat) => {
                      const isSel = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                            isSel 
                              ? 'bg-[#1F1713] border-[#D4AF37] text-[#D4AF37] shadow-md font-bold' 
                              : 'bg-[#0A0A0A] border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
                          }`}
                        >
                          <span>{CATEGORY_INFO[cat].icon}</span>
                          <span className="truncate">{isFr ? CATEGORY_INFO[cat].labelFr : CATEGORY_INFO[cat].labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Attachment Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-syne uppercase tracking-wider font-bold text-[#8B735B]">
                    {isFr ? "Billet MCN Associé à l'Avis :" : "Associated MCN Pass:"}
                  </label>

                  <div className="space-y-2">
                    <select
                      value={selectedTicketId}
                      onChange={(e) => setSelectedTicketId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2D241F] rounded-xl px-4 py-2.5 text-xs text-[#F2E8DF] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {userTickets.map((tkt) => (
                        <option key={tkt.ticketId} value={tkt.ticketId}>
                          {tkt.ticketId} — {tkt.ticketTypeName} ({tkt.visitDate}) [{tkt.status === 'used' ? (isFr ? 'Validé à l\'entrée' : 'Validated') : (isFr ? 'Valide' : 'Valid')}]
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={isFr ? "Votre pays ou ville (ex: Sénégal, France, Côte d'Ivoire...)" : "Your country / city"}
                        value={userCountryInput}
                        onChange={(e) => setUserCountryInput(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#2D241F] rounded-xl px-3 py-2 text-xs text-[#F2E8DF] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 3: Title & Comment */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-syne uppercase tracking-wider font-bold text-[#8B735B] mb-1">
                    {isFr ? "Titre de votre témoignage (Optionnel) :" : "Review Title (Optional):"}
                  </label>
                  <input
                    type="text"
                    placeholder={isFr ? "Ex: Une scénographie grandiose et inspirante..." : "e.g. Inspiring and memorable experience..."}
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-[#2D241F] rounded-xl px-4 py-2.5 text-xs text-[#F2E8DF] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-syne uppercase tracking-wider font-bold text-[#8B735B]">
                      {isFr ? "Votre Message / Témoignage :" : "Your Experience & Message:"} *
                    </label>
                    <span className="text-[10px] text-[#8B735B] font-mono">
                      {reviewComment.length}/600
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    placeholder={isFr ? "Partagez ce qui vous a le plus touché : les œuvres, l'accueil, les visites guidées, l'histoire des civilisations..." : "Share your thoughts on the collections, guides, atmosphere and cultural impact..."}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={600}
                    required
                    className="w-full bg-[#0A0A0A] border border-[#2D241F] rounded-xl p-4 text-xs text-[#F2E8DF] focus:outline-none focus:border-[#D4AF37] leading-relaxed resize-y"
                  />
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="py-2.5 px-5 rounded-xl bg-[#0A0A0A] hover:bg-[#1A1310] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] font-syne font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {isFr ? "Annuler" : "Cancel"}
                </button>

                <button
                  type="submit"
                  id="submit-review-btn"
                  disabled={isSubmitting || reviewComment.trim().length < 10}
                  className="py-2.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (isFr ? "Enregistrement..." : "Posting...") : (isFr ? "Publier dans le Livre d'or" : "Post to Guestbook")}</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#14100E] border border-[#2D241F] rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-syne font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#D4AF37] text-[#0A0A0A]'
                  : 'bg-[#0A0A0A] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
              }`}
            >
              {isFr ? `Tous les avis (${reviews.length})` : `All (${reviews.length})`}
            </button>

            <button
              type="button"
              onClick={() => setRatingFilter(ratingFilter === 5 ? 'all' : 5)}
              className={`py-1.5 px-3 rounded-xl text-xs font-syne font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                ratingFilter === 5
                  ? 'bg-[#D4AF37] text-[#0A0A0A]'
                  : 'bg-[#0A0A0A] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>5 {isFr ? "Étoiles" : "Stars"}</span>
            </button>

            {(Object.keys(CATEGORY_INFO) as ReviewCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat ? 'all' : cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-syne font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold'
                    : 'bg-[#0A0A0A] text-[#8B735B] hover:text-[#F2E8DF] border border-[#2D241F]'
                }`}
              >
                <span>{CATEGORY_INFO[cat].icon}</span> {isFr ? CATEGORY_INFO[cat].labelFr : CATEGORY_INFO[cat].labelEn}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-[#8B735B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isFr ? "Rechercher un visiteur, pays..." : "Search visitor or country..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2D241F] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F2E8DF] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0A0A0A] border border-[#2D241F] rounded-xl px-3 py-1.5 text-xs text-[#8B735B] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="recent">{isFr ? "Plus récents" : "Most Recent"}</option>
              <option value="rating">{isFr ? "Meilleures notes" : "Highest Rating"}</option>
              <option value="popular">{isFr ? "Plus utiles (Likes)" : "Most Helpful"}</option>
            </select>
          </div>

        </div>

        {/* REVIEWS MASONRY / GRID */}
        {filteredReviews.length === 0 ? (
          <div className="bg-[#14100E] border border-[#2D241F] rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1F1713] text-[#8B735B] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-syne text-base font-bold text-[#F2E8DF]">
              {isFr ? "Aucun avis ne correspond à vos critères" : "No reviews match your filters"}
            </h4>
            <p className="text-xs text-[#8B735B] max-w-md mx-auto">
              {isFr 
                ? "Essayez de réinitialiser vos filtres ou soyez le premier à laisser un témoignage pour cette catégorie !" 
                : "Try resetting your search filters or be the first to share your experience!"}
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategoryFilter('all'); setRatingFilter('all'); setSearchQuery(''); }}
              className="py-2 px-4 rounded-xl bg-[#1F1713] hover:bg-[#2D241F] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition-all cursor-pointer"
            >
              {isFr ? "Réinitialiser les filtres" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((rev) => {
              const catObj = CATEGORY_INFO[rev.experienceCategory] || CATEGORY_INFO.visite_generale;
              const hasLiked = user && Array.isArray(rev.likedBy) && rev.likedBy.includes(user.id);
              const isAdmin = user?.accountType === 'admin';

              return (
                <div 
                  key={rev.id}
                  className="bg-[#14100E] border border-[#2D241F] hover:border-[#D4AF37]/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg group relative overflow-hidden"
                >
                  
                  {/* Top Bar: Visitor Info + Stars */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      
                      {/* Avatar & User Details */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9B3922] to-[#D4AF37] p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-2xl bg-[#14100E] flex items-center justify-center font-syne font-bold text-xs text-[#D4AF37]">
                            {(rev.userName || 'V').charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-syne text-sm font-bold text-[#F2E8DF]">
                              {rev.userName}
                            </h4>
                            {rev.userCountry && (
                              <span className="text-[11px] text-[#8B735B] bg-[#0A0A0A] px-2 py-0.5 rounded-full border border-[#2D241F]">
                                {rev.userCountry}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-[#8B735B] mt-0.5">
                            {rev.userRole && (
                              <span>{rev.userRole}</span>
                            )}
                            <span>&bull;</span>
                            <span>{new Date(rev.createdAt).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stars Rating */}
                      <div className="flex items-center gap-0.5 text-[#D4AF37] bg-[#0A0A0A] px-2 py-1 rounded-xl border border-[#2D241F] shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#3D2B22]'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Verified Ticket Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{isFr ? "Billet MCN Vérifié" : "Verified Pass"}</span>
                        {rev.ticketId && <span className="font-mono text-emerald-200">({rev.ticketId})</span>}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F1713] border border-[#2D241F] text-[#D4AF37] text-[10px] font-medium">
                        <span>{catObj.icon}</span>
                        <span>{isFr ? catObj.labelFr : catObj.labelEn}</span>
                      </span>

                      {rev.ticketTypeName && (
                        <span className="text-[10px] text-[#8B735B] italic hidden sm:inline">
                          {rev.ticketTypeName}
                        </span>
                      )}
                    </div>

                    {/* Review Title */}
                    {rev.title && (
                      <h5 className="font-syne text-sm font-bold text-[#F2E8DF] mb-2">
                        « {rev.title} »
                      </h5>
                    )}

                    {/* Review Body */}
                    <p className="text-xs text-[#D6C7B8] font-serif leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Museum / Admin Official Response if available */}
                  {rev.adminResponse && (
                    <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-syne text-[11px] font-bold text-[#D4AF37] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          <span>{rev.adminResponse.author}</span>
                        </span>
                        <span className="text-[10px] text-[#8B735B]">{rev.adminResponse.date}</span>
                      </div>
                      <p className="text-[11px] text-[#C2B4A3] italic leading-relaxed">
                        {rev.adminResponse.message}
                      </p>
                    </div>
                  )}

                  {/* Card Footer: Likes & Admin Actions */}
                  <div className="pt-3 border-t border-[#2D241F] flex items-center justify-between text-xs">
                    
                    {/* Like / Helpful button */}
                    <button
                      type="button"
                      onClick={() => onToggleLikeReview(rev.id)}
                      className={`py-1 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                        hasLiked 
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300' 
                          : 'bg-[#0A0A0A] border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF]'
                      }`}
                      title={isFr ? "Indiquer que cet avis est utile" : "Mark as helpful"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{rev.likesCount || 0}</span>
                      <span className="text-[10px] hidden sm:inline">{isFr ? "Utile" : "Helpful"}</span>
                    </button>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        {onAdminReply && !rev.adminResponse && (
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(replyingReviewId === rev.id ? null : rev.id)}
                            className="p-1.5 rounded-lg bg-[#1F1713] hover:bg-[#2D241F] text-[#D4AF37] border border-[#2D241F] text-xs cursor-pointer flex items-center gap-1"
                            title={isFr ? "Répondre officiellement" : "Reply as Admin"}
                          >
                            <Reply className="w-3 h-3" />
                            <span className="text-[10px]">{isFr ? "Répondre" : "Reply"}</span>
                          </button>
                        )}

                        {onDeleteReview && (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-xs cursor-pointer"
                            title={isFr ? "Supprimer l'avis" : "Delete review"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Inline Admin Reply Form */}
                  {isAdmin && replyingReviewId === rev.id && (
                    <div className="mt-2 pt-3 border-t border-[#2D241F] space-y-2 animate-fade-in">
                      <textarea
                        rows={2}
                        placeholder={isFr ? "Votre réponse officielle de la conservation..." : "Your official reply..."}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/50 rounded-xl p-2 text-xs text-[#F2E8DF] focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setReplyingReviewId(null); setAdminReplyText(''); }}
                          className="py-1 px-3 rounded-lg bg-[#0A0A0A] text-[#8B735B] text-xs cursor-pointer"
                        >
                          {isFr ? "Annuler" : "Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminReplySubmit(rev.id)}
                          className="py-1 px-3 rounded-lg bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold cursor-pointer"
                        >
                          {isFr ? "Envoyer la réponse" : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
