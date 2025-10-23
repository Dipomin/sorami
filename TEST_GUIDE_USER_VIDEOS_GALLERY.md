# 🧪 Guide de Test Rapide - Galerie de Vidéos

## Objectif
Tester le nouveau composant **UserVideosGallery** sur `/generate-videos`

---

## ✅ Checklist de Test

### 1. Accès à la page
```bash
# Le serveur dev tourne sur http://localhost:3000
# Ouvrir: http://localhost:3000/generate-videos
```

**Attendu**:
- ✅ Page charge sans erreur
- ✅ Formulaire de génération visible en haut
- ✅ Section "Mes vidéos générées" visible en bas

---

### 2. État initial (aucune vidéo)

**Si l'utilisateur n'a jamais généré de vidéo**:

```
┌──────────────────────────────────┐
│   [Icône Film gris]              │
│   Aucune vidéo générée           │
│   Vos vidéos générées            │
│   apparaîtront ici               │
└──────────────────────────────────┘
```

**Action**: Passer au test 3 pour générer une première vidéo

---

### 3. Générer une vidéo de test

**Formulaire à remplir**:
```
Prompt: "Un coucher de soleil cinématographique sur l'océan Pacifique, 
avec des vagues douces s'écrasant sur la plage, mouvement de caméra 
fluide de gauche à droite, ambiance paisible et sereine"

Durée: 8 secondes
Style: Cinématique
Ratio: 16:9
```

**Actions**:
1. Cliquer sur "Générer la vidéo"
2. Attendre la progression (2 minutes max)
3. Vérifier que la vidéo s'affiche dans `VideoResults`
4. **Rafraîchir la page complète** (F5 ou Cmd+R)

**Attendu après refresh**:
- ✅ La vidéo apparaît dans "Mes vidéos générées"
- ✅ Elle est en première position (tri DESC)

---

### 4. Vérifier l'affichage de la vidéo

**Dans la galerie, chaque vidéo doit afficher**:

```
┌─────────────────────────────────────────┐
│  [Vidéo Player]  │  Prompt: "Un coucher...│
│  Aspect 16:9     │  📅 Date: 23 oct...   │
│  Fond noir       │  ⏱️ Durée: 8s          │
│                  │  📐 1920x1080          │
│  🟢 AWS S3       │  💾 Taille MB          │
│  (au hover)      │  🟢 Hébergé sur AWS S3 │
│                  │  ✓ Terminé             │
│                  │  [Télécharger] [↗️]   │
└─────────────────────────────────────────┘
```

**Vérifications**:
- ✅ Lecteur vidéo visible
- ✅ Métadonnées affichées (date, durée, dimensions)
- ✅ Badge vert "Hébergé sur AWS S3" présent
- ✅ Statut "✓ Terminé" en vert
- ✅ Deux boutons: "Télécharger" (bleu) et "Ouvrir" (blanc)

---

### 5. Tester le lecteur vidéo

**Actions**:
1. Cliquer sur le bouton Play ▶️
2. Vérifier que la vidéo démarre
3. Tester la seek bar (glisser le curseur)
4. Tester le volume
5. Tester le plein écran

**Vérifications**:
- ✅ Vidéo démarre immédiatement (streaming S3)
- ✅ Seek bar fonctionne (avance/recule)
- ✅ Volume ajustable
- ✅ Plein écran disponible
- ✅ Sur mobile: lecture inline (pas de fullscreen forcé)

**Au hover sur la vidéo**:
- ✅ Badge "Lecture depuis AWS S3" apparaît en haut à gauche
- ✅ Animation pulse du point vert

---

### 6. Tester le téléchargement

**Actions**:
1. Cliquer sur le bouton "Télécharger" (bleu, gradient)
2. Ouvrir la console du navigateur (F12)

**Console attendue**:
```bash
📥 Téléchargement depuis S3: https://s3.amazonaws.com/sorami-videos/...
```

**Vérifications**:
- ✅ Download démarre immédiatement
- ✅ Fichier nommé `video-{id}.mp4`
- ✅ Taille cohérente avec métadonnées
- ✅ Pas de redirection ou loading
- ✅ Console log confirme S3

---

### 7. Tester l'ouverture dans nouvel onglet

**Actions**:
1. Cliquer sur le bouton "↗️" (blanc, bordure grise)

**Vérifications**:
- ✅ Nouvelle fenêtre/onglet s'ouvre
- ✅ URL est une adresse S3 directe
- ✅ Vidéo jouable dans le navigateur
- ✅ Attribut `target="_blank"` fonctionne
- ✅ Sécurité: `rel="noopener noreferrer"`

---

### 8. Tester avec plusieurs vidéos

**Actions**:
1. Générer 2-3 vidéos supplémentaires
2. Rafraîchir la page après chaque génération

**Vérifications**:
- ✅ Toutes les vidéos s'affichent
- ✅ Tri par date décroissante (dernières en premier)
- ✅ Compteur correct: "Mes vidéos générées (3)"
- ✅ Scroll vertical si nécessaire
- ✅ Chaque card indépendante et interactive

---

### 9. Tests Responsive

**Desktop (> 768px)**:
- ✅ Layout horizontal: Vidéo à gauche | Infos à droite
- ✅ Vidéo: largeur fixe 320px (md:w-80)
- ✅ Infos: flex-1 (prend l'espace restant)

**Mobile (< 768px)**:
- ✅ Layout vertical: Vidéo en haut | Infos en bas
- ✅ Vidéo: largeur 100%
- ✅ Boutons empilés ou en ligne selon l'espace
- ✅ Lecteur fonctionne inline (pas de fullscreen forcé iOS)

**Tester sur**:
- 💻 Desktop: 1920x1080
- 📱 Mobile: 375x667 (iPhone SE)
- 📱 Tablet: 768x1024 (iPad)

---

### 10. Tests Edge Cases

#### A. Utilisateur sans vidéos
**Setup**: Nouveau compte ou base vide

**Attendu**:
```
┌──────────────────────────────────┐
│   [Icône Film gris]              │
│   Aucune vidéo générée           │
│   Vos vidéos générées            │
│   apparaîtront ici               │
└──────────────────────────────────┘
```

#### B. Vidéo en cours de traitement
**Setup**: Génération en cours, pas encore de webhook

**Attendu**:
- ✅ Vidéo N'APPARAIT PAS dans la galerie
- ✅ Seules les vidéos `status: COMPLETED` sont affichées

#### C. Erreur d'authentification
**Setup**: Token expiré ou invalide

**Attendu**:
```
┌──────────────────────────────────┐
│  ⚠️ Erreur de chargement         │
│  Token d'authentification        │
│  manquant                        │
└──────────────────────────────────┘
```

#### D. Vidéo sans file_url
**Setup**: Vidéo en base mais pas encore d'URL S3

**Attendu**:
- ✅ Badge S3 masqué
- ✅ Bouton "Télécharger" désactivé (gris)
- ✅ Bouton "Ouvrir" non affiché
- ✅ Message ou état alternatif

---

### 11. Tests de Sécurité

#### Authentification
```bash
# Test 1: User non connecté
- Se déconnecter
- Aller sur /generate-videos
→ Attendu: Redirection vers /sign-in

# Test 2: Token expiré
- Manipuler le token Clerk (DevTools)
- Rafraîchir /generate-videos
→ Attendu: Erreur 401, message d'erreur

# Test 3: Tenter d'accéder aux vidéos d'un autre user
- Manipuler l'API call (DevTools Network)
- Changer userId dans la requête
→ Attendu: 403 Forbidden ou aucune vidéo
```

#### Permissions
```bash
# Test 4: Download vidéo d'un autre user
curl http://localhost:3000/api/videos/{autre_user_video_id}/download \
  -H "Authorization: Bearer {votre_token}"
→ Attendu: 403 Forbidden
```

---

### 12. Tests de Performance

**Métriques à surveiller** (DevTools → Network):

| Métrique | Valeur cible | Comment mesurer |
|----------|-------------|-----------------|
| GET /api/videos/user | < 500ms | Temps réponse API |
| Chargement page | < 2s | First Contentful Paint |
| Streaming S3 | Instantané | Time to First Byte vidéo |
| Download S3 | Dépend taille | Bande passante utilisateur |

**Console Logs attendus**:
```bash
# Backend (Next.js API)
📹 Récupération des vidéos pour l'utilisateur: cm123abc
✅ 3 vidéo(s) trouvée(s) pour l'utilisateur cm123abc

# Frontend (UserVideosGallery)
📥 Téléchargement depuis S3: https://s3.amazonaws.com/...
```

---

### 13. Tests de Regression

**Vérifier que les autres features fonctionnent toujours**:

- ✅ Génération de nouvelles vidéos (formulaire)
- ✅ Affichage dans `VideoResults` après génération
- ✅ Bouton "Générer une nouvelle vidéo"
- ✅ Section "Exemples de prompts" en bas
- ✅ Navigation (retour dashboard)
- ✅ Responsive des autres sections

---

## 🐛 Problèmes Fréquents

### Problème 1: Galerie vide alors que vidéos existent
**Symptômes**: "Aucune vidéo générée" malgré générations récentes

**Causes possibles**:
1. Vidéos pas encore `COMPLETED` → Attendre fin de traitement
2. Webhook pas reçu → Vérifier logs backend Flask
3. Mauvais `authorId` → Vérifier Clerk userId

**Debug**:
```bash
# Console navigateur
→ Erreur 401/403 dans Network tab ?
→ Log "Token manquant" ?

# Database
→ SELECT * FROM video_generations WHERE authorId = '{userId}';
→ Vérifier status = 'COMPLETED'
```

---

### Problème 2: Vidéo ne charge pas dans le player
**Symptômes**: Carré noir, pas de playback

**Causes possibles**:
1. `file_url` manquant ou expiré (presigned URL 1h)
2. CORS S3 mal configuré
3. Format vidéo incompatible

**Debug**:
```bash
# Console navigateur (F12)
→ Erreur CORS ?
→ Erreur 403 sur S3 URL ?

# Vérifier l'URL
console.log(video.video_file?.file_url);
→ URL valide ? Expire dans combien de temps ?
```

**Solution**:
- Regénérer presigned URL si expirée
- Configurer CORS S3: `AllowOrigin: http://localhost:3000`

---

### Problème 3: Download ne fonctionne pas
**Symptômes**: Clic sur "Télécharger" → rien ne se passe

**Causes possibles**:
1. `file_url` manquant
2. Popup bloquée par navigateur
3. Erreur CORS

**Debug**:
```bash
# Console navigateur
→ Vérifier console.log("📥 Téléchargement depuis S3: ...")
→ Erreur JavaScript ?

# Vérifier bouton
→ Classe disabled ?
→ `video.video_file?.file_url` existe ?
```

**Solution**:
- Autoriser popups dans le navigateur
- Vérifier que `file_url` n'est pas null
- Fallback: appeler `/api/videos/[id]/download`

---

### Problème 4: Badge S3 ne s'affiche pas
**Symptômes**: Pas de badge "Lecture depuis AWS S3"

**Causes possibles**:
1. `file_url` manquant
2. CSS hover mal appliqué
3. Z-index conflict

**Debug**:
```tsx
// UserVideosGallery.tsx
{video.video_file?.file_url && (
  <div className="inline-flex items-center ...">
    <Server className="w-3 h-3 mr-1" />
    Hébergé sur AWS S3
  </div>
)}
```

**Solution**:
- Vérifier condition `video.video_file?.file_url`
- Tester hover avec DevTools
- Vérifier classes Tailwind appliquées

---

## ✅ Validation Finale

**Cochez chaque item après test réussi**:

- [ ] Page charge sans erreur
- [ ] Galerie affiche les vidéos existantes
- [ ] Lecteur vidéo fonctionne (play/pause/seek)
- [ ] Badge S3 animé visible au hover
- [ ] Téléchargement depuis S3 fonctionne
- [ ] Ouverture dans nouvel onglet fonctionne
- [ ] Métadonnées correctes (date, durée, taille)
- [ ] Responsive mobile OK
- [ ] Responsive desktop OK
- [ ] État vide (no videos) OK
- [ ] Authentification requise OK
- [ ] Console logs propres (pas d'erreurs)
- [ ] Build production OK (`npm run build`)

---

## 🚀 Commandes Utiles

```bash
# Lancer dev
npm run dev

# Ouvrir dans navigateur
open http://localhost:3000/generate-videos

# Build production
npm run build

# Vérifier logs Prisma
npx prisma studio
→ Ouvrir table video_generations
→ Filtrer par authorId

# Reset base de données (dev only)
npx prisma db push --force-reset
npx prisma db seed
```

---

## 📊 Résultats Attendus

**Tous les tests passent** ✅

**Temps de chargement**:
- Page: < 2s
- API /videos/user: < 500ms
- Streaming S3: instantané

**Expérience utilisateur**:
- Intuitive et fluide
- Feedback visuel clair (badges, statuts)
- Pas d'erreurs console
- Responsive parfait

---

Créé le: 23 octobre 2025  
Version: 1.0.0  
Statut: ✅ Prêt pour test
