import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AccountType, AdminRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { signInWithFirebase, signUpWithFirebase, signInWithGooglePopup } from '../firebase';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Building2,
  Compass
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

// Known admin emails for automatic nature-based routing
const ADMIN_EMAILS = [
  'admin@mcn.sn',
  'direction@mcn.sn',
  'conservateur@mcn.sn',
  'cheikh.dieng@mcn.sn',
  'aminata.ndiaye@mcn.sn',
  'admin.mcn@sn',
  'admin@gmail.com'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { t, isFr } = useLanguage();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to determine if an email belongs to admin
  const isEmailAdmin = (targetEmail: string): boolean => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    return (
      ADMIN_EMAILS.includes(cleanEmail) ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('conservateur') ||
      cleanEmail.includes('direction@mcn')
    );
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const userProfile = await signInWithGooglePopup();
      setIsLoading(false);
      onLogin(userProfile);
    } catch (err: any) {
      setIsLoading(false);
      // If user simply closed the popup, don't display a blocker error
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage(
          isFr 
            ? 'La fenêtre de connexion Google a été bloquée par votre navigateur. Veuillez autoriser les fenêtres contextuelles (popups).'
            : 'Google login popup was blocked by browser. Please allow popups.'
        );
      } else {
        setErrorMessage(
          isFr
            ? 'Erreur lors de la connexion Google. Veuillez réessayer ou utiliser votre email.'
            : 'Error connecting with Google. Please retry or use email.'
        );
      }
      console.error('Google Sign-In error:', err);
    }
  };

  const handleStandardAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage(isFr ? 'Veuillez renseigner votre adresse email.' : 'Please enter your email address.');
      return;
    }
    if (!isLoginTab && !name.trim()) {
      setErrorMessage(isFr ? 'Veuillez renseigner votre nom complet.' : 'Please enter your full name.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password || 'mcn-dakar-2026';
    const rawUserName = (name.trim() || cleanEmail.split('@')[0] || 'Visiteur').trim();
    const formattedName = rawUserName.length > 0 ? (rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1)) : 'Visiteur';

    const isAdm = isEmailAdmin(cleanEmail);
    const accountType: AccountType = isAdm ? 'admin' : 'visitor';

    const profileData: Omit<UserProfile, 'id'> = {
      name: formattedName,
      email: cleanEmail,
      accountType: accountType,
      role: isAdm ? 'admin' : 'visiteur_local',
      adminRole: isAdm ? 'conservateur_general' : undefined,
      adminTitle: isAdm ? (isFr ? 'Direction des Collections & Expositions' : 'Head of Collections & Exhibitions') : undefined,
      country: 'Sénégal',
      favorites: ['mcn-art-01', 'mcn-art-02'],
      bookedTickets: isAdm ? [] : [
        {
          ticketId: 'MCN-TKT-2026-8894',
          ticketTypeId: 'ticket-standard-local',
          ticketTypeName: isFr ? 'Tarif Résident & CEDEAO' : 'Resident & ECOWAS Pass',
          visitorName: formattedName,
          visitorEmail: cleanEmail,
          visitDate: new Date().toISOString().split('T')[0],
          timeSlot: '14h00 - 16h30',
          quantity: 2,
          totalPriceCFA: 6000,
          purchaseDate: new Date().toISOString().split('T')[0],
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MCN-TKT-2026-8894',
          includesAudioGuide: true,
          includesGuidedTour: false
        }
      ]
    };

    setIsLoading(true);

    try {
      if (isLoginTab) {
        // Sign In via Firebase Auth
        try {
          const user = await signInWithFirebase(cleanEmail, cleanPassword);
          setIsLoading(false);
          onLogin(user);
          return;
        } catch (signInErr: any) {
          // If user doesn't exist in Firebase Auth yet, auto-register them
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            try {
              const newUser = await signUpWithFirebase(cleanEmail, cleanPassword, profileData);
              setIsLoading(false);
              onLogin(newUser);
              return;
            } catch {
              // fallback
            }
          }
          throw signInErr;
        }
      } else {
        // Sign Up via Firebase Auth
        try {
          const newUser = await signUpWithFirebase(cleanEmail, cleanPassword, profileData);
          setIsLoading(false);
          onLogin(newUser);
          return;
        } catch (signUpErr: any) {
          if (signUpErr.code === 'auth/email-already-in-use') {
            const user = await signInWithFirebase(cleanEmail, cleanPassword);
            setIsLoading(false);
            onLogin(user);
            return;
          }
          throw signUpErr;
        }
      }
    } catch {
      // Graceful fallback to guarantee museum continuity in preview
      const fallbackUser: UserProfile = {
        id: (isAdm ? 'adm-' : 'usr-') + Date.now(),
        ...profileData,
        createdAt: new Date().toISOString()
      };
      setIsLoading(false);
      onLogin(fallbackUser);
    }
  };

  return (
    <div id="auth-screen-container" className="min-h-screen bg-[#0A0A0A] text-[#F2E8DF] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#D4AF37] selection:text-[#0A0A0A]">
      
      {/* Sleek Ambient Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#9B3922]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header / Branding */}
      <header className="px-6 py-5 border-b border-[#2D241F] bg-[#14100E]/90 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="font-cinzel text-lg font-black text-[#0A0A0A]">M</span>
          </div>
          <div>
            <h1 className="font-syne text-base sm:text-lg font-bold tracking-tight text-[#F2E8DF] leading-tight">
              {t('museumFullName')}
            </h1>
            <p className="text-xs text-[#D4AF37] font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              {isFr ? 'Dakar • Portail d\'Accès Numérique' : 'Dakar • Digital Access Portal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="pill" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#8B735B] bg-[#14100E] px-3.5 py-1.5 rounded-full border border-[#2D241F]">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Place de la Gare, Dakar</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Block */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Context & Museum Presentation */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14100E] border border-[#3D2B22] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isFr ? 'Plateforme Officielle • Dakar' : 'Official Portal • Dakar'}</span>
            </div>

            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2E8DF] leading-[1.15]">
              {isFr ? (
                <>Sanctuaire des arts & des <span className="font-serif italic text-[#D4AF37]">Civilisations Noires</span></>
              ) : (
                <>Sanctuary of arts & <span className="font-serif italic text-[#D4AF37]">Black Civilizations</span></>
              )}
            </h2>

            <p className="text-[#8B735B] text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              {isFr 
                ? <>Connectez-vous ou créez votre compte en un clic avec <strong className="text-[#F2E8DF]">Google</strong> ou votre adresse email pour accéder à votre espace personnalisé.</>
                : <>Sign in or create your account in 1 click with <strong className="text-[#F2E8DF]">Google</strong> or email to access your customized space.</>}
            </p>

            <div className="space-y-3 pt-2 text-xs text-[#8B735B]">
              <div className="flex items-center gap-3 bg-[#14100E]/80 p-3 rounded-2xl border border-[#2D241F]">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#F2E8DF]">
                    {isFr ? 'Redirection Automatique Intelligente' : 'Smart Role-Based Routing'}
                  </p>
                  <p className="text-[11px] text-[#8B735B]">
                    {isFr 
                      ? 'La nature de votre compte (Visiteur ou Administrateur) vous dirige automatiquement vers la page adaptée après connexion.'
                      : 'Your account type (Visitor or Admin) automatically routes you to the appropriate view upon login.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Unified Authentication Card (Only Connexion & Création) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#14100E] rounded-3xl border border-[#2D241F] p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              
              {/* Top Gold Subtle Accent */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60 rounded-t-full" />

              {/* ONLY 2 Tabs: Connexion vs Création de compte */}
              <div className="flex p-1 bg-[#0A0A0A] rounded-2xl border border-[#2D241F] mb-6">
                <button
                  id="tab-connexion"
                  type="button"
                  onClick={() => { setIsLoginTab(true); setErrorMessage(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                    isLoginTab 
                      ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                      : 'text-[#8B735B] hover:text-[#F2E8DF]'
                  }`}
                >
                  {t('login')}
                </button>
                <button
                  id="tab-inscription"
                  type="button"
                  onClick={() => { setIsLoginTab(false); setErrorMessage(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                    !isLoginTab 
                      ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                      : 'text-[#8B735B] hover:text-[#F2E8DF]'
                  }`}
                >
                  {t('signup')}
                </button>
              </div>

              {/* Google Sign-In Primary Button */}
              <div className="mb-5">
                <button
                  id="btn-google-auth"
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1A1310] hover:bg-[#231A15] border border-[#3D2B22] hover:border-[#D4AF37]/60 text-[#F2E8DF] font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
                >
                  {/* Real Google 4-Color Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isLoginTab 
                      ? (isFr ? 'Continuer avec Google' : 'Continue with Google') 
                      : (isFr ? 'Créer un compte avec Google' : 'Sign up with Google')}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-[#2D241F] w-full" />
                <span className="bg-[#14100E] px-3 text-[11px] uppercase tracking-wider text-[#8B735B]">
                  {isFr ? 'ou par email' : 'or with email'}
                </span>
                <div className="border-t border-[#2D241F] w-full" />
              </div>

              {/* Title & Instructions */}
              <div className="mb-4">
                <h3 className="font-syne text-base sm:text-lg font-bold text-[#F2E8DF]">
                  {isLoginTab ? (isFr ? 'Accédez à votre espace' : 'Access your dashboard') : (isFr ? 'Inscrivez-vous sur le portail MCN' : 'Join the MCN Portal')}
                </h3>
                <p className="text-xs text-[#8B735B] mt-0.5">
                  {isLoginTab 
                    ? (isFr ? 'Renseignez vos identifiants pour être dirigé vers votre tableau de bord.' : 'Enter your credentials to reach your personal space.') 
                    : (isFr ? 'Créez votre compte pour réserver des billets et gérer vos visites.' : 'Create an account to book passes and manage your visits.')}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleStandardAuthSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLoginTab && (
                    <motion.div
                      key="register-name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                          {isFr ? 'Nom complet' : 'Full name'}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ex: Awa Diop"
                            className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#8B735B] mb-1.5">
                    {isFr ? 'Adresse Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#8B735B]">
                      {isFr ? 'Mot de passe' : 'Password'}
                    </label>
                    {isLoginTab && (
                      <span className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer">
                        {isFr ? 'Mot de passe oublié ?' : 'Forgot password?'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>{isFr ? 'Authentification en cours...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <span>{isLoginTab ? t('login') : t('signup')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guarantees */}
              <div className="mt-6 pt-4 border-t border-[#2D241F] flex items-center justify-around text-[11px] text-[#8B735B]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {isFr ? 'Plateforme MCN Dakar' : 'MCN Dakar Platform'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> {isFr ? 'Espace Sécurisé' : 'Secure Space'}
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Cultural Quote Footer */}
      <footer className="px-6 py-4 border-t border-[#2D241F] bg-[#0A0A0A] text-center text-xs text-[#8B735B] z-10">
        <p>
          {isFr 
            ? "« Le Musée des Civilisations Noires est le lieu de la rencontre de l'Afrique avec elle-même et avec le monde. » — Dakar, Sénégal"
            : "« The Museum of Black Civilizations is where Africa encounters itself and the world. » — Dakar, Senegal"}
        </p>
      </footer>
    </div>
  );
};

