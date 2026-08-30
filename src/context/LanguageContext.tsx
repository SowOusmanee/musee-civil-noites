import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

export const TRANSLATIONS = {
  fr: {
    // Brand & General
    museumTitle: 'Musée des Civilisations Noires',
    museumShort: 'M.C.N. Dakar',
    subLocation: 'Dakar, Sénégal',
    portalSubtitle: 'Dakar • Portail d\'Accès Numérique',
    address: 'Place de la Gare de Dakar, Sénégal',
    openStatus: 'Ouvert',
    closedStatus: 'Fermé',
    gmtTime: 'GMT',
    adminBadge: 'Admin',
    switchLang: 'Changer de langue',
    currentLanguage: 'Français',

    // Nav
    navEvents: 'Événements',
    navGallery: 'Expositions & Œuvres',
    navMap: 'Plan des Niveaux',
    navCurator: 'Conservateur IA',
    navGuestbook: 'Livre d\'or',
    navTicketing: 'Billetterie',
    navPass: 'Pass',
    navTicketsCount: 'Billets',
    navAmbient: 'Ambiance',
    navSound: 'Son',
    navMuteSound: 'Couper le son',
    navPlaySound: 'Activer l\'ambiance kora',
    navAdminConsole: 'Console Admin',
    navMyTickets: 'Mes Billets',
    navFavoriteArtworks: 'Œuvres Favorites',
    navPavilionMap: 'Plan des Pavillons',
    navLogout: 'Déconnexion',

    // Roles
    roleResident: 'Visiteur Résident',
    roleStudent: 'Étudiant / Chercheur',
    roleTourist: 'Touriste International',
    rolePrivilege: 'Membre Privilège MCN',
    roleVisitor: 'Visiteur',
    roleAdmin: 'Administrateur MCN',

    // Hero Section
    heroBadge: 'Patrimoine Mondial & Création Contemporaine',
    heroTitlePrefix: 'Le grand sanctuaire des arts et des',
    heroTitleHighlight: 'Civilisations Noires',
    heroDescription: 'Explorez plus de 18 000 chefs-d\'œuvre d\'hier et d\'aujourd\'hui. Réservez votre billet coupe-file, découvrez les parcours audioguidés et plongez dans l\'histoire millénaire de l\'Afrique.',
    heroCtaBuyTicket: 'Réserver mon Billet Coupe-File',
    heroCtaMap: 'Plan Interactif des Salles',
    heroCtaCurator: 'Parler au Conservateur IA',
    heroCtaExplore: 'Explorer les Collections',
    heroStatArtworks: 'Œuvres Préservées',
    heroStatPavilions: 'Pavillons Thématiques',
    heroStatHistory: 'Siècles d\'Histoire',
    heroStatEvents: 'Événements Quotidiens',
    heroLiveNotice: 'Aujourd\'hui : Visite nocturne & conférence à 16h00 (Auditorium Senghor)',

    // Events Section
    eventsTitle: 'Agenda Culturel & Temps Forts',
    eventsSubtitle: 'Conférences, performances vivantes, ateliers d\'artisans et expositions temporaires.',
    eventsFilterAll: 'Tous les temps forts',
    eventsFilterExpo: 'Exposition Temporaire',
    eventsFilterConf: 'Conférence & Débat',
    eventsFilterAtelier: 'Atelier Vivant',
    eventsFilterMusic: 'Performance & Musique',
    eventsTodayBadge: 'Aujourd\'hui au MCN',
    eventsSeatsLeft: 'places disponibles',
    eventsIncluded: 'Accès inclus dans le billet d\'entrée',
    eventsBookAction: 'Réserver ma place',
    eventsAddedToCalendar: 'Ajouté à votre agenda !',
    eventsViewDetails: 'Détails & Programme',
    eventsModalTitle: 'Programme Détaillé de l\'Événement',
    eventsModalSpeaker: 'Intervenant / Artiste :',
    eventsModalLocation: 'Lieu au sein du musée :',
    eventsModalClose: 'Fermer',

    // Ticketing Section
    ticketsTitle: 'Billetterie Officielle & Pass d\'Accès',
    ticketsSubtitle: 'Tarification solidaire et pass coupe-file dématérialisés avec QR Code instantané.',
    ticketsFastBannerTitle: 'Accès Immédiat Sans File d\'Attente',
    ticketsFastBannerDesc: 'Votre QR Code est généré instantanément après paiement et reste accessible hors ligne.',
    ticketsPerkFastTrack: 'Accès coupe-file immédiat',
    ticketsPerkAudio: 'Audioguide interactif inclus',
    ticketsPerkExpos: 'Accès à toutes les galeries permanentes & temporaires',
    ticketsSelectBtn: 'Sélectionner ce Pass',
    ticketsPopularBadge: 'Le plus populaire',
    ticketsResidentFormula: 'Tarif Résident & CEDEAO',
    ticketsInternationalFormula: 'Visiteur International & Tourisme',
    ticketsStudentFormula: 'Tarif Étudiant, Chercheur & Scolaire',
    ticketsVipFormula: 'Pass Mécène & Privilège Annuel',

    // Booking Modal
    bookingModalTitle: 'Réservation de Billet Coupe-File',
    bookingStepDate: '1. Choisissez la date de visite',
    bookingStepSlot: '2. Créneau horaire d\'arrivée',
    bookingStepQuantity: '3. Nombre de billets',
    bookingSummary: 'Récapitulatif de la commande',
    bookingTotal: 'Total à régler :',
    bookingPaymentMethods: 'Paiement sécurisé par : Wave, Orange Money, Free Money ou Carte Bancaire',
    bookingConfirmBtn: 'Payer et Recevoir mon Billet',
    bookingProcessing: 'Traitement sécurisé du paiement...',
    bookingSuccessTitle: 'Billet Réservé avec Succès !',
    bookingSuccessDesc: 'Votre pass d\'entrée MCN a été émis. Présentez ce QR Code aux bornes d\'accueil du musée.',
    bookingTicketNumber: 'N° de Billet :',
    bookingPrint: 'Imprimer / Sauvegarder',
    bookingGoToMyTickets: 'Voir dans mes billets',
    bookingClose: 'Fermer',

    // Gallery & Artworks Section
    galleryTitle: 'Collections Permanentes & Chefs-d\'Œuvre',
    gallerySubtitle: 'Parcourez les trésors des civilisations africaines, du berceau de l\'humanité aux créations contemporaines.',
    gallerySearchPlaceholder: 'Rechercher une œuvre, un pays (ex: Bénin, Sénégal, Dogon, Masque...)',
    galleryFilterAll: 'Toutes les œuvres',
    galleryFilterMasks: 'Masques & Rituels',
    galleryFilterBronzes: 'Bronzes & Métallurgie',
    galleryFilterTextiles: 'Textiles & Tissages',
    galleryFilterContemporary: 'Art Contemporain',
    galleryFilterSciences: 'Sciences & Manuscrits',
    galleryFilterAllFloors: 'Tous les niveaux',
    galleryFloorRDC: 'RDC (Niveau 0)',
    galleryFloor1: 'Niveau 1',
    galleryFloor2: 'Niveau 2',
    galleryFloor3: 'Niveau 3',
    galleryAudioBadge: 'Audioguide',
    galleryListenStory: 'Écouter le récit',
    galleryViewArtwork: 'Découvrir l\'œuvre',
    galleryAddedFavorite: 'Ajouté aux favoris',
    galleryRemovedFavorite: 'Retiré des favoris',
    galleryNoResults: 'Aucune œuvre trouvée pour cette recherche.',
    galleryResetFilters: 'Réinitialiser les filtres',

    // Artwork Modal
    artworkModalOrigin: 'Origine & Datation',
    artworkModalPavilion: 'Pavillon & Localisation',
    artworkModalMaterials: 'Matériaux & Dimensions',
    artworkModalHistory: 'Histoire & Contexte Culturel',
    artworkModalSpiritual: 'Signification Spirituelle & Rituels',
    artworkModalAudioGuide: 'Audioguide Interactif & Récit',
    artworkModalLocate: 'Localiser sur le plan du musée',
    artworkModalClose: 'Fermer la fiche',

    // My Tickets Modal
    myTicketsTitle: 'Mes Billets & Titres d\'Accès',
    myTicketsSubtitle: 'Présentez vos QR Codes aux bornes d\'entrée pour un accès coupe-file instantané.',
    myTicketsEmpty: 'Vous n\'avez aucun billet actif pour le moment.',
    myTicketsBuyBtn: 'Acheter un billet maintenant',
    myTicketsValidFor: 'Valable pour :',
    myTicketsSlot: 'Créneau :',
    myTicketsQuantity: 'Quantité :',
    myTicketsTotal: 'Montant réglé :',
    myTicketsPrint: 'Imprimer le pass',

    // Museum Map Modal
    mapTitle: 'Plan Interactif des Niveaux du MCN',
    mapSubtitle: 'Naviguez à travers les 4 niveaux architecturaux du Musée des Civilisations Noires de Dakar.',
    mapLevel0: 'Niveau 0 — Rez-de-Chaussée (Berceau de l\'Humanité & Grandes Inventions)',
    mapLevel1: 'Niveau 1 — Arts Sacrés, Rituels & Masques d\'Afrique',
    mapLevel2: 'Niveau 2 — Métallurgie, Textiles & Échanges Transahariens',
    mapLevel3: 'Niveau 3 — Création Contemporaine & Diaspora Mondiale',
    mapPavilionCount: 'pavillons à visiter',
    mapClose: 'Fermer le plan',

    // Virtual Curator Modal
    curatorTitle: 'Conservateur Virtuel IA du MCN',
    curatorSubtitle: 'Intelligence Artificielle spécialiste des collections, de la spiritualité et de l\'histoire africaine.',
    curatorPlaceholder: 'Posez votre question sur une œuvre, une dynastie, un rite...',
    curatorSend: 'Envoyer',
    curatorSuggested: 'Questions fréquemment posées :',
    curatorPrompt1: 'Pourquoi le masque Kanaga Dogon a-t-il une forme de croix ?',
    curatorPrompt2: 'Quelle est la technique de fonte à la cire perdue du Bénin ?',
    curatorPrompt3: 'Parlez-moi des manuscrits anciens de Tombouctou.',
    curatorPrompt4: 'Quel est le parcours recommandé pour une visite de 2 heures ?',
    curatorThinking: 'Le conservateur consulte les archives du MCN...',
    curatorAudioListen: 'Écouter la voix du conservateur',

    // Auth Screen
    authHeroTitle: 'Sanctuaire des arts & des',
    authHeroTitleSub: 'Civilisations Noires',
    authHeroDesc: 'Connectez-vous ou créez votre compte en un clic avec Google ou votre adresse email pour accéder à votre espace personnalisé.',
    authTabLogin: 'Connexion',
    authTabRegister: 'Création de compte',
    authContinueGoogle: 'Continuer avec Google',
    authCreateGoogle: 'Créer un compte avec Google',
    authOrEmail: 'ou par email',
    authLoginTitle: 'Accédez à votre espace',
    authRegisterTitle: 'Inscrivez-vous sur le portail MCN',
    authLoginDesc: 'Renseignez vos identifiants pour être dirigé vers votre tableau de bord.',
    authRegisterDesc: 'Créez votre compte pour réserver des billets et gérer vos visites.',
    authNameLabel: 'Nom complet',
    authNamePlaceholder: 'ex: Awa Diop',
    authEmailLabel: 'Adresse Email',
    authEmailPlaceholder: 'votre.email@exemple.com',
    authPasswordLabel: 'Mot de passe',
    authPasswordForgot: 'Mot de passe oublié ?',
    authStaffCodeLink: 'Personnel ou Direction du Musée ? Saisir un code d\'habilitation',
    authStaffCodeLabel: 'Code d\'habilitation administration (facultatif)',
    authStaffCodePlaceholder: 'ex: MCN-ADMIN-2026',
    authSubmitLogin: 'Se connecter',
    authSubmitRegister: 'Créer mon compte',
    authAuthenticating: 'Authentification en cours...',
    authQuickDemo: 'Accès Rapide Démo :',
    authDemoVisitor: 'Compte Visiteur (Awa Diop)',
    authDemoAdmin: 'Compte Direction Admin',
    authAutoRoutingTitle: 'Redirection Automatique Intelligente',
    authAutoRoutingDesc: 'La nature de votre compte (Visiteur ou Administrateur) vous dirige automatiquement vers la page adaptée après connexion.',
    authQuote: '« Le Musée des Civilisations Noires est le lieu de la rencontre de l\'Afrique avec elle-même et avec le monde. » — Dakar, Sénégal',

    // Admin Dashboard
    adminTitle: 'Console d\'Administration & Gestion MCN',
    adminSubtitle: 'Gestion des œuvres, tarification de billetterie, agenda culturel et registre des réservations.',
    adminPreviewBtn: 'Aperçu Public Visiteur',
    adminTabArtworks: 'Gestion des Œuvres',
    adminTabPricing: 'Tarifs & Billetterie',
    adminTabEvents: 'Agenda & Événements',
    adminTabBookings: 'Registre Réservations',
    adminStatTotalArtworks: 'Œuvres au Catalogue',
    adminStatTotalRevenue: 'Recettes Billetterie',
    adminStatTotalBookings: 'Billets Émis',
    adminStatActiveEvents: 'Événements Programmés',
    adminAddArtwork: 'Ajouter une Œuvre',
    adminEditPrice: 'Modifier les Tarifs',
    adminAddEvent: 'Ajouter un Événement',
    adminBackToDashboard: 'Retourner à la Console Admin',

    // Common helper keys
    resetFilters: 'Réinitialiser les filtres',
    edit: 'Modifier',
    delete: 'Supprimer',
    viewStory: 'Écouter le récit',
    levelPrefix: 'Niveau',
    noArtworkMatch: 'Aucune œuvre ne correspond à vos critères.',
    noArtworkDesc: 'Essayez un autre mot-clé ou sélectionnez une autre catégorie.',
    showAllCollections: 'Afficher toutes les collections',
    close: 'Fermer',
    noTicketsFound: 'Aucun billet actif pour le moment.',
    buyATicket: 'Acheter un billet',
    adminEditPrices: 'Modifier les tarifs (Admin)',
    ticketingSection: 'Billetterie',
    buyTicketOneClick: 'Réserver mon billet en ligne',
    ticketingSubtitle: 'Choisissez votre pass d\'accès et bénéficiez de tarifs préférentiels.',
    pricingFrom: 'À partir de',
    mostPopular: 'Le plus populaire',
    selectThisRate: 'Sélectionner ce tarif',
    museumFullName: 'Musée des Civilisations Noires de Dakar',
    virtualCuratorName: 'Conservateur Virtuel IA',
    virtualCuratorDesc: 'Guide interactif et intelligence artificielle culturelle du MCN.',
    agendaSection: 'Agenda Culturel',
    todayEvents: 'Événements du Jour',
    todayInDakar: 'Aujourd\'hui à Dakar',
    ticketIncluded: 'Accès inclus dans le billet',
    detailsProgram: 'Programme complet',
    reminderRegistered: 'Rappel enregistré',
    reminder: 'M\'ajouter un rappel',
    museumCity: 'Dakar, Sénégal',
    interactiveGallery: 'Galerie Interactive',
    virtualCuratorAssistant: 'Assistant Virtuel IA',
    backToTop: 'Haut de page',
    treasuresSection: 'Trésors & Galeries',
    gridMode: 'Grille complète',
    highlightsMode: 'Chefs-d\'œuvre',
    spotlightTitle: 'Trésor Mis en Lumière',
    masterpieceBadge: 'Chef-d\'œuvre MCN',
    viewFile: 'Consulter la notice',
    searchPlaceholder: 'Rechercher une œuvre, un pays...',
    clearSearch: 'Effacer la recherche',
    favoritesFilter: 'Favoris uniquement',
    showingCount: 'Affichage de {count} œuvres',
    forQuery: 'pour « {query} »',
    audioGuideTitle: 'Audioguide Officiel MCN',
    listenAudioGuide: 'Écouter le guide vocal',
    login: 'Connexion',
    signup: 'Créer un compte',

    // Footer
    footerDesc: 'Inauguré en 2018 à Dakar, le Musée des Civilisations Noires est une institution moderne dédiée à la préservation, au rayonnement et au dialogue des cultures d\'Afrique et de ses diasporas.',
    footerHoursTitle: 'Horaires d\'Ouverture',
    footerHoursText: 'Mardi au Dimanche : 10h00 - 19h00\nFermé le Lundi',
    footerAccessTitle: 'Accès & Contact',
    footerAccessAddress: 'Place de la Gare, Dakar, Sénégal',
    footerAccessPhone: '+221 33 889 80 00',
    footerAccessEmail: 'contact@mcn.sn',
    footerLinksTitle: 'Navigation',
    footerRights: 'Tous droits réservés. République du Sénégal.'
  },
  en: {
    // Brand & General
    museumTitle: 'Museum of Black Civilisations',
    museumShort: 'M.C.N. Dakar',
    subLocation: 'Dakar, Senegal',
    portalSubtitle: 'Dakar • Digital Access Portal',
    address: 'Train Station Square, Dakar, Senegal',
    openStatus: 'Open',
    closedStatus: 'Closed',
    gmtTime: 'GMT',
    adminBadge: 'Admin',
    switchLang: 'Switch language',
    currentLanguage: 'English',

    // Nav
    navEvents: 'Events',
    navGallery: 'Exhibitions & Artworks',
    navMap: 'Floor Plan',
    navCurator: 'AI Curator',
    navGuestbook: 'Guestbook',
    navTicketing: 'Ticketing',
    navPass: 'Pass',
    navTicketsCount: 'Tickets',
    navAmbient: 'Ambient',
    navSound: 'Sound',
    navMuteSound: 'Mute sound',
    navPlaySound: 'Play kora soundscape',
    navAdminConsole: 'Admin Console',
    navMyTickets: 'My Tickets',
    navFavoriteArtworks: 'Favorite Artworks',
    navPavilionMap: 'Pavilions Map',
    navLogout: 'Log out',

    // Roles
    roleResident: 'Resident Visitor',
    roleStudent: 'Student / Researcher',
    roleTourist: 'International Tourist',
    rolePrivilege: 'MCN Privilege Member',
    roleVisitor: 'Visitor',
    roleAdmin: 'MCN Administrator',

    // Hero Section
    heroBadge: 'World Heritage & Contemporary Creation',
    heroTitlePrefix: 'The grand sanctuary of arts and',
    heroTitleHighlight: 'Black Civilisations',
    heroDescription: 'Explore over 18,000 masterpieces from ancient times to contemporary creation. Book your fast-track pass, experience audio-guided tours, and dive into Africa\'s millennial heritage.',
    heroCtaBuyTicket: 'Book Fast-Track Ticket',
    heroCtaMap: 'Interactive Floor Map',
    heroCtaCurator: 'Chat with AI Curator',
    heroCtaExplore: 'Explore Collections',
    heroStatArtworks: 'Preserved Artworks',
    heroStatPavilions: 'Thematic Pavilions',
    heroStatHistory: 'Centuries of History',
    heroStatEvents: 'Daily Events',
    heroLiveNotice: 'Today: Evening tour & lecture at 4:00 PM (Senghor Auditorium)',

    // Events Section
    eventsTitle: 'Cultural Agenda & Highlights',
    eventsSubtitle: 'Lectures, live performances, master craftsman workshops and temporary exhibitions.',
    eventsFilterAll: 'All highlights',
    eventsFilterExpo: 'Temporary Exhibition',
    eventsFilterConf: 'Conference & Debate',
    eventsFilterAtelier: 'Live Workshop',
    eventsFilterMusic: 'Performance & Music',
    eventsTodayBadge: 'Today at MCN',
    eventsSeatsLeft: 'seats available',
    eventsIncluded: 'Access included in admission ticket',
    eventsBookAction: 'Reserve my seat',
    eventsAddedToCalendar: 'Added to your calendar!',
    eventsViewDetails: 'Details & Program',
    eventsModalTitle: 'Detailed Event Program',
    eventsModalSpeaker: 'Speaker / Artist:',
    eventsModalLocation: 'Location within museum:',
    eventsModalClose: 'Close',

    // Ticketing Section
    ticketsTitle: 'Official Ticketing & Access Passes',
    ticketsSubtitle: 'Inclusive rates and paperless fast-track passes with instant QR Code.',
    ticketsFastBannerTitle: 'Instant Fast-Track Access',
    ticketsFastBannerDesc: 'Your QR Code is generated instantly after payment and stays accessible offline.',
    ticketsPerkFastTrack: 'Instant priority fast-track entry',
    ticketsPerkAudio: 'Interactive audio guide included',
    ticketsPerkExpos: 'Full access to permanent & temporary galleries',
    ticketsSelectBtn: 'Select this Pass',
    ticketsPopularBadge: 'Most Popular',
    ticketsResidentFormula: 'Resident & ECOWAS Rate',
    ticketsInternationalFormula: 'International Visitor & Tourist',
    ticketsStudentFormula: 'Student, Scholar & Academic Rate',
    ticketsVipFormula: 'Patron & Annual VIP Pass',

    // Booking Modal
    bookingModalTitle: 'Fast-Track Ticket Booking',
    bookingStepDate: '1. Choose your visit date',
    bookingStepSlot: '2. Select arrival time slot',
    bookingStepQuantity: '3. Number of tickets',
    bookingSummary: 'Order Summary',
    bookingTotal: 'Total to pay:',
    bookingPaymentMethods: 'Secure checkout with: Wave, Orange Money, Free Money or Credit/Debit Card',
    bookingConfirmBtn: 'Pay & Receive my Ticket',
    bookingProcessing: 'Processing secure payment...',
    bookingSuccessTitle: 'Ticket Successfully Booked!',
    bookingSuccessDesc: 'Your MCN entry pass has been issued. Present this QR Code at the museum entrance gates.',
    bookingTicketNumber: 'Ticket #:',
    bookingPrint: 'Print / Save Receipt',
    bookingGoToMyTickets: 'View in My Tickets',
    bookingClose: 'Close',

    // Gallery & Artworks Section
    galleryTitle: 'Permanent Collections & Masterpieces',
    gallerySubtitle: 'Discover the treasures of African civilisations, from the cradle of humankind to contemporary creations.',
    gallerySearchPlaceholder: 'Search artwork, culture (e.g. Benin, Senegal, Dogon, Mask...)',
    galleryFilterAll: 'All artworks',
    galleryFilterMasks: 'Masks & Rituals',
    galleryFilterBronzes: 'Bronzes & Metallurgy',
    galleryFilterTextiles: 'Textiles & Weaving',
    galleryFilterContemporary: 'Contemporary Art',
    galleryFilterSciences: 'Sciences & Manuscripts',
    galleryFilterAllFloors: 'All floors',
    galleryFloorRDC: 'Ground Floor (Level 0)',
    galleryFloor1: 'Level 1',
    galleryFloor2: 'Level 2',
    galleryFloor3: 'Level 3',
    galleryAudioBadge: 'Audio Guide',
    galleryListenStory: 'Listen to narration',
    galleryViewArtwork: 'Explore artwork',
    galleryAddedFavorite: 'Added to favorites',
    galleryRemovedFavorite: 'Removed from favorites',
    galleryNoResults: 'No artworks found matching your search.',
    galleryResetFilters: 'Reset filters',

    // Artwork Modal
    artworkModalOrigin: 'Origin & Era',
    artworkModalPavilion: 'Pavilion & Location',
    artworkModalMaterials: 'Materials & Dimensions',
    artworkModalHistory: 'History & Cultural Context',
    artworkModalSpiritual: 'Spiritual Meaning & Rituals',
    artworkModalAudioGuide: 'Interactive Audio Guide & Story',
    artworkModalLocate: 'Locate on museum floor map',
    artworkModalClose: 'Close view',

    // My Tickets Modal
    myTicketsTitle: 'My Tickets & Access Passes',
    myTicketsSubtitle: 'Present your QR Codes at the museum entrance gates for instant fast-track admission.',
    myTicketsEmpty: 'You currently have no active tickets.',
    myTicketsBuyBtn: 'Buy a ticket now',
    myTicketsValidFor: 'Valid for:',
    myTicketsSlot: 'Time Slot:',
    myTicketsQuantity: 'Quantity:',
    myTicketsTotal: 'Amount Paid:',
    myTicketsPrint: 'Print pass',

    // Museum Map Modal
    mapTitle: 'MCN Interactive Floor Plan',
    mapSubtitle: 'Explore the 4 architectural levels of the Museum of Black Civilisations in Dakar.',
    mapLevel0: 'Level 0 — Ground Floor (Cradle of Humankind & Inventions)',
    mapLevel1: 'Level 1 — Sacred Arts, Rituals & African Masks',
    mapLevel2: 'Level 2 — Metallurgy, Textiles & Trans-Saharan Trade',
    mapLevel3: 'Level 3 — Contemporary Creation & Global Diaspora',
    mapPavilionCount: 'pavilions to visit',
    mapClose: 'Close floor plan',

    // Virtual Curator Modal
    curatorTitle: 'MCN AI Virtual Curator',
    curatorSubtitle: 'Artificial Intelligence specializing in African collections, spirituality, and history.',
    curatorPlaceholder: 'Ask a question about an artwork, dynasty, ritual...',
    curatorSend: 'Send',
    curatorSuggested: 'Frequently asked questions:',
    curatorPrompt1: 'Why does the Dogon Kanaga mask feature a cross shape?',
    curatorPrompt2: 'What is the lost-wax bronze casting technique from Benin?',
    curatorPrompt3: 'Tell me about the ancient manuscripts of Timbuktu.',
    curatorPrompt4: 'What is the recommended itinerary for a 2-hour visit?',
    curatorThinking: 'The curator is searching MCN archives...',
    curatorAudioListen: 'Listen to curator voice narration',

    // Auth Screen
    authHeroTitle: 'Sanctuary of arts &',
    authHeroTitleSub: 'Black Civilisations',
    authHeroDesc: 'Sign in or create your account in one click with Google or your email to access your personal museum space.',
    authTabLogin: 'Sign In',
    authTabRegister: 'Create Account',
    authContinueGoogle: 'Continue with Google',
    authCreateGoogle: 'Sign up with Google',
    authOrEmail: 'or with email',
    authLoginTitle: 'Access your account',
    authRegisterTitle: 'Sign up for MCN Portal',
    authLoginDesc: 'Enter your credentials to be directed to your personalized dashboard.',
    authRegisterDesc: 'Create an account to book tickets and manage your museum visits.',
    authNameLabel: 'Full Name',
    authNamePlaceholder: 'e.g. Awa Diop',
    authEmailLabel: 'Email Address',
    authEmailPlaceholder: 'your.email@example.com',
    authPasswordLabel: 'Password',
    authPasswordForgot: 'Forgot password?',
    authStaffCodeLink: 'Museum Staff or Leadership? Enter authorization code',
    authStaffCodeLabel: 'Admin Authorization Code (optional)',
    authStaffCodePlaceholder: 'e.g. MCN-ADMIN-2026',
    authSubmitLogin: 'Sign In',
    authSubmitRegister: 'Create My Account',
    authAuthenticating: 'Authenticating...',
    authQuickDemo: 'Quick Demo Access:',
    authDemoVisitor: 'Visitor Account (Awa Diop)',
    authDemoAdmin: 'Admin Direction Account',
    authAutoRoutingTitle: 'Intelligent Automatic Routing',
    authAutoRoutingDesc: 'Your account type (Visitor or Administrator) automatically directs you to the proper interface upon sign-in.',
    authQuote: '“The Museum of Black Civilisations is the venue where Africa meets with itself and with the world.” — Dakar, Senegal',

    // Admin Dashboard
    adminTitle: 'MCN Administration & Management Console',
    adminSubtitle: 'Manage artworks, ticketing pricing, cultural agenda and visitor reservations.',
    adminPreviewBtn: 'Public Visitor Preview',
    adminTabArtworks: 'Artwork Management',
    adminTabPricing: 'Pricing & Ticketing',
    adminTabEvents: 'Agenda & Events',
    adminTabBookings: 'Reservation Registry',
    adminStatTotalArtworks: 'Artworks in Catalog',
    adminStatTotalRevenue: 'Ticketing Revenue',
    adminStatTotalBookings: 'Issued Tickets',
    adminStatActiveEvents: 'Scheduled Events',
    adminAddArtwork: 'Add Artwork',
    adminEditPrice: 'Edit Pricing',
    adminAddEvent: 'Add Event',
    adminBackToDashboard: 'Return to Admin Console',

    // Common helper keys
    resetFilters: 'Reset filters',
    edit: 'Edit',
    delete: 'Delete',
    viewStory: 'Listen to story',
    levelPrefix: 'Level',
    noArtworkMatch: 'No artworks match your criteria.',
    noArtworkDesc: 'Try another keyword or select another category.',
    showAllCollections: 'Show all collections',
    close: 'Close',
    noTicketsFound: 'No active tickets at this time.',
    buyATicket: 'Purchase a ticket',
    adminEditPrices: 'Edit ticket rates (Admin)',
    ticketingSection: 'Ticketing',
    buyTicketOneClick: 'Book ticket online',
    ticketingSubtitle: 'Select your pass and enjoy preferential museum rates.',
    pricingFrom: 'From',
    mostPopular: 'Most popular',
    selectThisRate: 'Select this rate',
    museumFullName: 'Museum of Black Civilisations of Dakar',
    virtualCuratorName: 'AI Virtual Curator',
    virtualCuratorDesc: 'Interactive cultural guide and artificial intelligence for MCN.',
    agendaSection: 'Cultural Agenda',
    todayEvents: 'Today\'s Events',
    todayInDakar: 'Today in Dakar',
    ticketIncluded: 'Included with general admission',
    detailsProgram: 'Full schedule',
    reminderRegistered: 'Reminder set',
    reminder: 'Add reminder',
    museumCity: 'Dakar, Senegal',
    interactiveGallery: 'Interactive Gallery',
    virtualCuratorAssistant: 'AI Virtual Assistant',
    backToTop: 'Back to top',
    treasuresSection: 'Treasures & Galleries',
    gridMode: 'Complete grid',
    highlightsMode: 'Masterpieces',
    spotlightTitle: 'Spotlighted Treasure',
    masterpieceBadge: 'MCN Masterpiece',
    viewFile: 'View artwork record',
    searchPlaceholder: 'Search artwork, country...',
    clearSearch: 'Clear search',
    favoritesFilter: 'Favorites only',
    showingCount: 'Showing {count} artworks',
    forQuery: 'for "{query}"',
    audioGuideTitle: 'Official MCN Audio Guide',
    listenAudioGuide: 'Listen to voice guide',
    login: 'Sign In',
    signup: 'Create Account',

    // Footer
    footerDesc: 'Inaugurated in 2018 in Dakar, the Museum of Black Civilisations is a state-of-the-art institution dedicated to the preservation, promotion, and dialogue of African cultures and diasporas.',
    footerHoursTitle: 'Opening Hours',
    footerHoursText: 'Tuesday to Sunday: 10:00 AM - 7:00 PM\nClosed on Mondays',
    footerAccessTitle: 'Access & Contact',
    footerAccessAddress: 'Train Station Square, Dakar, Senegal',
    footerAccessPhone: '+221 33 889 80 00',
    footerAccessEmail: 'contact@mcn.sn',
    footerLinksTitle: 'Navigation',
    footerRights: 'All rights reserved. Republic of Senegal.'
  }
};

export type TranslationKey = keyof typeof TRANSLATIONS.fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isFr: boolean;
  isEn: boolean;
}

const fallbackT = (key: TranslationKey, params?: Record<string, string | number>): string => {
  const dict = TRANSLATIONS.fr;
  let str = dict[key] || TRANSLATIONS.en[key] || (key as string);
  if (params) {
    Object.entries(params).forEach(([pKey, pVal]) => {
      str = str.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
    });
  }
  return str;
};

const defaultLanguageContext: LanguageContextType = {
  language: 'fr',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: fallbackT,
  isFr: true,
  isEn: false
};

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mcn_lang');
    if (saved === 'fr' || saved === 'en') {
      return saved;
    }
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mcn_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.fr;
    let str = dict[key] || TRANSLATIONS.fr[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        str = str.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isFr: language === 'fr',
        isEn: language === 'en'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context || defaultLanguageContext;
};
