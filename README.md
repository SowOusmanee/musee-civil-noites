# Musée des Civilisations Noires — Dakar

Site web interactif du Musée des Civilisations Noires (MCN) de Dakar : galerie d'œuvres, billetterie en ligne, événements, livre d'or, et espace administrateur.

**Site en ligne :** _https://musee-dakar-dist-v3.vercel.app/_

## ✨ Fonctionnalités

- **Galerie d'œuvres** avec fiches détaillées par pièce (`GallerySection`, `ArtworkModal`)
- **Billetterie en ligne** avec types de billets et réservation (`TicketingSection`, `MyTicketsModal`)
- **Événements** du musée (`EventsSection`)
- **Livre d'or** pour les avis des visiteurs (`GuestbookSection`)
- **Carte interactive** du musée (`MuseumMapModal`)
- **Curateur virtuel** (`VirtualCuratorModal`)
- **Authentification** par email/mot de passe ou Google (`AuthScreen`)
- **Espace administrateur** avec tableau de bord et statistiques de revenus (`AdminDashboard`, `RevenueAnalytics`)
- **Multilingue** (français / anglais) via `LanguageSwitcher`

## 🛠️ Stack technique

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS**
- **Firebase** (Authentication + Firestore) comme backend
- **Recharts** pour les graphiques de l'espace admin

## 🚀 Lancer le projet en local

**Prérequis :** [Node.js](https://nodejs.org/) (version 18 ou plus)

\`\`\`bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
\`\`\`

Le site est alors accessible sur `http://localhost:3000`.

Pour vérifier que tout compile sans erreur avant de publier :

\`\`\`bash
npm run build
\`\`\`

## 🔥 Configuration Firebase

Le projet utilise Firebase pour l'authentification et la base de données (Firestore). La configuration se trouve dans `firebase-applet-config.json` à la racine — elle est déjà connectée au projet Firebase du musée, pas besoin d'y toucher pour du développement normal.

Si tu dois créer ton propre projet Firebase de test :
1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com)
2. Active **Firestore Database** (mode Production) et **Authentication** (Email/Mot de passe + Google)
3. Copie les identifiants de config (Paramètres du projet > Général > Vos applications) dans `firebase-applet-config.json`
4. Colle les règles du fichier `firestore.rules` dans l'onglet Règles de Firestore

## 👤 Devenir administrateur

Un compte devient automatiquement administrateur si son adresse email contient l'un des mots suivants : `admin`, `conservateur`, ou `direction@mcn`. Sinon, il est possible de modifier manuellement le champ `accountType` d'un utilisateur (`visitor` → `admin`) directement dans Firestore, collection `users`.

## 🌐 Déploiement

Le site est un projet **statique** (Vite build) déployé sur **Vercel**, connecté à ce dépôt GitHub : chaque `push` sur la branche `main` redéploie automatiquement le site.

⚠️ Si le domaine de déploiement change, pense à l'ajouter dans **Firebase > Authentication > Settings > Domaines autorisés**, sinon la connexion (Google et email) ne fonctionnera pas sur le nouveau domaine.

## 🤝 Contribuer

1. Clone ce dépôt (ou récupère les dernières modifications avec `git pull` / GitHub Desktop)
2. Fais tes modifications
3. Vérifie que le projet compile : `npm run build`
4. Commit et push (via GitHub Desktop ou en ligne de commande) — Vercel redéploiera automatiquement
