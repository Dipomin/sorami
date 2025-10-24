# 🧪 Guide de Tests - Sorami Platform

**Date**: 23 octobre 2025  
**Environnement**: Next.js 15 + TypeScript

---

## 📋 Checklist de Tests Manuels

### 1️⃣ **Navigation & Layout**

#### Sidebar (Desktop)
- [ ] Logo Sorami visible et cliquable
- [ ] 8 liens de navigation affichés
- [ ] Lien actif highlighté avec gradient violet
- [ ] UserButton Clerk fonctionnel
- [ ] Hover effects sur les liens
- [ ] Icônes visibles et correctes

#### Mobile Menu
- [ ] Bouton menu visible (< 1024px)
- [ ] Sidebar s'ouvre avec animation
- [ ] Overlay noir semi-transparent
- [ ] Fermeture au clic sur overlay
- [ ] Fermeture au clic sur bouton X
- [ ] Transitions fluides

#### Header
- [ ] Search bar visible et fonctionnelle
- [ ] Notification badge avec point rouge
- [ ] UserButton responsive
- [ ] Sticky au scroll

---

### 2️⃣ **Landing Page (`/`)**

#### Hero Section
- [ ] Titre principal animé (FadeIn)
- [ ] Sous-titre visible
- [ ] 2 boutons CTA (Commencer / En savoir plus)
- [ ] Animation float sur gradient orb
- [ ] Responsive sur mobile (stack vertical)

#### Features Grid
- [ ] 4 cartes visibles
- [ ] Animations stagger au chargement
- [ ] Icônes lucide-react affichées
- [ ] Hover effect (scale + glow)
- [ ] Grid responsive (1/2/4 colonnes)

#### CTA Section
- [ ] Titre avec gradient text
- [ ] Bouton gradient avec hover
- [ ] Background animé

#### Footer
- [ ] 4 colonnes visibles (desktop)
- [ ] Liens fonctionnels
- [ ] Responsive mobile (stack)
- [ ] Copyright année 2025

---

### 3️⃣ **Dashboard (`/dashboard`)**

#### Stats Cards
- [ ] 4 cartes affichées
- [ ] Icônes avec gradient backgrounds
- [ ] Chiffres en gros (3xl font)
- [ ] Labels descriptifs
- [ ] Animations ScaleIn au chargement
- [ ] Hover effects

#### Activity Section
- [ ] 2 cartes (Activité récente + Actions rapides)
- [ ] Liste de 4 activités récentes
- [ ] 4 boutons quick actions
- [ ] Icônes et textes alignés
- [ ] Hover states fonctionnels

---

### 4️⃣ **Generation Images (`/generation-images`)**

#### Formulaire
- [ ] Input prompt fonctionnel
- [ ] Dropdown size (3 options)
- [ ] Dropdown style (4 options)
- [ ] Number input num_images (1-4)
- [ ] Bouton "Générer" avec gradient
- [ ] Validation des champs requis

#### Galerie
- [ ] Grid d'images responsive
- [ ] Images chargées depuis S3
- [ ] Hover effects (scale)
- [ ] Boutons d'action (Download, Delete)
- [ ] Loading states (skeletons)

#### Progress
- [ ] Barre de progression animée
- [ ] Status badge coloré
- [ ] Message de statut
- [ ] Pourcentage affiché

---

### 5️⃣ **Generation Videos (`/generation-videos`)**

#### Formulaire
- [ ] Textarea prompt
- [ ] Dropdown durée
- [ ] Dropdown résolution
- [ ] Checkbox audio background
- [ ] Bouton submit avec icône

#### Liste Vidéos
- [ ] Cards avec thumbnails
- [ ] Titre et date
- [ ] Status badge
- [ ] Bouton play
- [ ] Download button

#### Player
- [ ] Vidéo S3 chargeable
- [ ] Controls natifs
- [ ] Fullscreen disponible
- [ ] Responsive

---

### 6️⃣ **Blog System**

#### Listing (`/blog`)
- [ ] Grid 1/2/3 colonnes responsive
- [ ] Cover images affichées
- [ ] Titres et excerpts
- [ ] Tags colorés
- [ ] Avatar auteur + nom
- [ ] Date formatée
- [ ] Hover effect cards
- [ ] Animations stagger

#### Detail (`/blog/[id]`)
- [ ] Header avec cover image
- [ ] Titre principal (2xl → 4xl)
- [ ] Auteur avec avatar
- [ ] Date de publication
- [ ] Contenu formaté (HTML)
- [ ] Section articles similaires
- [ ] Bouton retour fonctionnel

#### Create (`/blog/create`)
- [ ] Formulaire dark theme
- [ ] Input topic requis
- [ ] Textarea goal optionnel
- [ ] Number input word count (800-5000)
- [ ] Info box avec checkmarks
- [ ] Bouton submit gradient
- [ ] Progress component affiché après submit
- [ ] Polling du statut job
- [ ] Redirect après completion

---

### 7️⃣ **Books System**

#### Listing (`/books`)
- [ ] Grid de livres responsive
- [ ] Cover images
- [ ] Titres et auteurs
- [ ] Progress bars animées
- [ ] Badges (status, pages)
- [ ] Hover effects
- [ ] Empty state si aucun livre

#### Reader (`/books/[id]/reader`)
- [ ] Sidebar chapitres
- [ ] Navigation prev/next
- [ ] Contenu chapitre affiché
- [ ] Table des matières sticky
- [ ] Progress indicator
- [ ] Responsive mobile

---

### 8️⃣ **Settings (`/settings`)**

#### Sidebar Navigation
- [ ] 5 sections affichées
- [ ] Sticky positioning (desktop)
- [ ] Active section highlightée
- [ ] Scroll to section au clic

#### Account Section
- [ ] Input displayName avec valeur Clerk
- [ ] Input email disabled
- [ ] Bouton save avec loading state
- [ ] Success feedback (checkmark)

#### Notifications
- [ ] 3 toggle switches
- [ ] Animation peer-checked
- [ ] États persistés (simulation)

#### Preferences
- [ ] Dropdown langue (3 options)
- [ ] Number input word count
- [ ] Save button fonctionnel

#### Billing
- [ ] Plan actuel affiché (Pro)
- [ ] Prix mensuel (29€)
- [ ] Date prochain paiement
- [ ] Boutons actions (upgrade, cancel)

---

### 9️⃣ **Profile (`/profile`)**

#### Header
- [ ] Avatar avec gradient border
- [ ] Badge niveau (12)
- [ ] Badge Award
- [ ] Nom utilisateur Clerk
- [ ] Email affiché
- [ ] Date membre depuis
- [ ] 2 badges (Plan Pro, Niveau)
- [ ] 2 boutons actions

#### Stats Cards
- [ ] 4 cartes avec chiffres
- [ ] Icônes colorées (gradient)
- [ ] Hover scale effect
- [ ] Grid 2/4 colonnes responsive

#### Activity Section
- [ ] Liste 4 activités récentes
- [ ] Icônes par type
- [ ] Timestamps relatifs
- [ ] Hover effects

#### Achievements
- [ ] 6 succès affichés
- [ ] États locked/unlocked
- [ ] Émojis et descriptions
- [ ] Animations séquentielles

#### XP Progress
- [ ] Barre de progression animée
- [ ] Gradient coloré
- [ ] Compteur XP (8450/10000)
- [ ] Message motivationnel

---

### 🔟 **Legal Pages**

#### Privacy (`/privacy`)
- [ ] Contenu légal affiché
- [ ] Typographie lisible
- [ ] Sections organisées
- [ ] Footer présent

#### Terms (`/terms`)
- [ ] CGU affichées
- [ ] Liens fonctionnels
- [ ] Format professionnel

#### Mentions Légales (`/mentions-legales`)
- [ ] Informations société
- [ ] RGPD compliant
- [ ] Contact visible

---

## 🎨 Tests Visuels

### Colors
- [ ] Primary violet (#8b5cf6) utilisé
- [ ] Accent indigo (#6366f1) utilisé
- [ ] Dark backgrounds (#0f172a, #020617)
- [ ] Text white/dark-300 lisible
- [ ] Gradients fluides

### Typography
- [ ] Poppins pour titres
- [ ] Inter pour body text
- [ ] Tailles hiérarchisées (3xl → 6xl)
- [ ] Line heights corrects
- [ ] Weights appropriés (400, 500, 600, 700)

### Spacing
- [ ] Padding cohérent (4, 6, 8)
- [ ] Gap consistent entre éléments
- [ ] Margins verticaux appropriés
- [ ] Section separations claires

### Borders & Shadows
- [ ] Border dark-800/50 utilisé
- [ ] Rounded corners (xl, 2xl)
- [ ] Shadow-glow sur hover
- [ ] Backdrop-blur-sm glassmorphism

---

## ✨ Tests d'Animations

### Page Load
- [ ] FadeIn au chargement
- [ ] Stagger children animations
- [ ] No jank (60fps)
- [ ] Smooth transitions

### Hover Effects
- [ ] Scale sur cards (1.05)
- [ ] Glow effect sur boutons
- [ ] Color transitions
- [ ] Border color changes

### Scroll Animations
- [ ] FadeInWhenVisible fonctionne
- [ ] Parallax effect (si implémenté)
- [ ] IntersectionObserver trigger
- [ ] Once: true respecté

### Loading States
- [ ] Skeletons animés (pulse)
- [ ] Progress bars fluides
- [ ] Spinners rotatifs
- [ ] Transitions smooth

### Gestures (Mobile)
- [ ] Swipe sidebar close
- [ ] Touch targets > 44px
- [ ] No lag on scroll
- [ ] Smooth drag (si applicable)

---

## 📱 Tests Responsive

### Mobile (< 640px)
- [ ] Sidebar en overlay
- [ ] Grids 1 colonne
- [ ] Textes lisibles (min 16px)
- [ ] Boutons touchables (44x44px)
- [ ] Images adaptées
- [ ] Formulaires accessibles
- [ ] Footer stack vertical

### Tablet (768px - 1023px)
- [ ] Grids 2 colonnes
- [ ] Sidebar accessible
- [ ] Navigation visible
- [ ] Cards bien espacées
- [ ] Textes confortables

### Desktop (≥ 1024px)
- [ ] Sidebar fixe visible
- [ ] Grids 3-4 colonnes
- [ ] Max-width containers
- [ ] Hover states actifs
- [ ] Typographie large

### Orientation
- [ ] Portrait mode OK
- [ ] Landscape mode OK
- [ ] Layout adapté
- [ ] No horizontal scroll

---

## 🔐 Tests d'Authentification

### Non connecté
- [ ] Redirect vers /sign-in sur routes protégées
- [ ] Landing page accessible
- [ ] Legal pages accessibles
- [ ] 404 page accessible

### Connecté
- [ ] Dashboard accessible
- [ ] UserButton affiché
- [ ] Avatar Clerk chargé
- [ ] Nom utilisateur correct
- [ ] Email correct
- [ ] Token JWT présent dans appels API

### Clerk UI
- [ ] Sign In modal dark theme
- [ ] Sign Up modal dark theme
- [ ] UserButton dropdown fonctionnel
- [ ] Sign Out fonctionne
- [ ] Redirects après auth OK

---

## 🌐 Tests API

### Blog API
- [ ] `GET /api/blog` retourne liste
- [ ] `GET /api/blog/[id]` retourne article
- [ ] `POST /api/blog/generate` crée job
- [ ] `GET /api/blog/[id]/status` retourne statut
- [ ] Webhook `/api/webhooks/blog-completion` fonctionne

### Images API
- [ ] `POST /api/images/generate` crée job
- [ ] `GET /api/images/[id]/status` retourne statut
- [ ] Webhook completion fonctionne
- [ ] S3 upload OK
- [ ] URLs presigned valides

### Videos API
- [ ] `POST /api/videos/generate` crée job
- [ ] `GET /api/videos/[id]/status` retourne statut
- [ ] Webhook completion fonctionne
- [ ] S3 upload OK

### Books API
- [ ] `GET /api/books` retourne liste
- [ ] `GET /api/books/[id]` retourne livre
- [ ] `POST /api/books/create` crée job
- [ ] Webhook completion fonctionne

### Error Handling
- [ ] 400 Bad Request géré
- [ ] 401 Unauthorized redirect
- [ ] 404 Not Found affiché
- [ ] 500 Server Error message clair
- [ ] Network errors catchées

---

## ♿ Tests d'Accessibilité

### Keyboard Navigation
- [ ] Tab order logique
- [ ] Focus visible sur éléments
- [ ] Enter/Space activent boutons
- [ ] Esc ferme modals
- [ ] Arrow keys dans dropdowns

### Screen Readers
- [ ] Alt text sur images
- [ ] ARIA labels présents
- [ ] Landmarks HTML5 (nav, main, footer)
- [ ] Heading hierarchy (h1 → h6)
- [ ] Button vs Link approprié

### Contraste
- [ ] Text blanc sur dark background (21:1)
- [ ] Primary colors lisibles
- [ ] Links distinguables
- [ ] Focus indicators visibles

### Reduced Motion
- [ ] Animations désactivables
- [ ] `prefers-reduced-motion` respecté
- [ ] useReducedMotion hook fonctionne
- [ ] Transitions minimales si préférence

---

## 🚀 Tests de Performance

### Lighthouse Scores (Cibles)
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Métriques Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Bundle Size
- [ ] First Load JS: < 200 KB
- [ ] Page-specific JS: < 50 KB
- [ ] Tree-shaking efficace
- [ ] Code splitting activé

### Images
- [ ] Next/Image utilisé
- [ ] Formats optimisés (WebP)
- [ ] Lazy loading actif
- [ ] Placeholder blur
- [ ] Dimensions correctes

---

## 🐛 Tests de Bugs Communs

### UI
- [ ] No white flashes au chargement
- [ ] No layout shift (CLS)
- [ ] No horizontal scroll
- [ ] No overlapping elements
- [ ] No z-index conflicts

### Animations
- [ ] No jank (dropped frames)
- [ ] No infinite loops inattendues
- [ ] Transitions complètes
- [ ] AnimatePresence exit fonctionne

### Forms
- [ ] Validation affichée correctement
- [ ] Error messages clairs
- [ ] Success feedback visible
- [ ] Submit disabled pendant loading
- [ ] No double submit

### Navigation
- [ ] Back button fonctionne
- [ ] Links internes corrects
- [ ] External links ouvrent nouvel onglet
- [ ] Active states persists après reload

---

## 📊 Tests de Régression

### Après Modifications
- [ ] Toutes les pages chargent
- [ ] Aucune console error
- [ ] TypeScript compile sans erreur
- [ ] ESLint passe (0 errors)
- [ ] Build production réussit
- [ ] Tests unitaires passent (si existants)

### Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

## 🔄 Tests de Workflow Complet

### Création Blog Article
1. [ ] Connexion utilisateur
2. [ ] Navigation vers /blog/create
3. [ ] Remplissage formulaire
4. [ ] Submit
5. [ ] Progress tracking
6. [ ] Completion notification
7. [ ] Redirect vers article
8. [ ] Article visible dans listing

### Génération Image
1. [ ] Navigation /generation-images
2. [ ] Saisie prompt
3. [ ] Sélection options
4. [ ] Submit
5. [ ] Loading state
6. [ ] Image affichée
7. [ ] Download fonctionne

### Lecture Livre
1. [ ] Navigation /books
2. [ ] Sélection livre
3. [ ] Ouverture reader
4. [ ] Navigation chapitres
5. [ ] Table des matières
6. [ ] Progress sauvegardé

---

## ✅ Conclusion

Pour valider la transformation UI, **tous les tests doivent passer** avant mise en production.

### Priorité des Tests
1. **Critique**: Navigation, Auth, API
2. **Important**: Responsive, Animations, Forms
3. **Nice-to-have**: Performance, A11y avancée

### Outils Recommandés
- **Manual Testing**: Chrome DevTools, Firefox DevTools
- **Automated Testing**: Playwright, Cypress
- **Performance**: Lighthouse, WebPageTest
- **Accessibility**: axe DevTools, WAVE

---

**Prochaine étape**: Tests automatisés avec Playwright + Jest

