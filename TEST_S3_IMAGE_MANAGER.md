# 🧪 Guide de Test - Gestionnaire d'Images S3

## ✅ Serveur Démarré
```
✓ Ready in 2.4s
Local: http://localhost:3001
```

---

## 🎯 Checklist de Test Rapide

### 1️⃣ Accéder à l'Éditeur de Blog
```
URL: http://localhost:3001/admin/blog/editor
```

**Attendu**:
- Page éditeur de blog s'affiche
- Onglets: Content | Settings | SEO
- Section "Image de couverture" visible
- Bouton **"Gérer les images"** avec gradient violet-indigo

---

### 2️⃣ Ouvrir le Gestionnaire d'Images

**Action**: Cliquer sur "Gérer les images"

**Attendu**:
- Modal apparaît avec animation fade-in
- Fond noir semi-transparent avec blur
- Header: "Gestionnaire d'Images" avec icône
- Toolbar:
  - Bouton "Uploader" (gradient violet)
  - Barre de recherche
  - Toggle Grille/Liste
- Zone de contenu (vide ou avec images)

---

### 3️⃣ Tester l'Upload

**Action**: Cliquer "Uploader" → Sélectionner 2-3 images

**Formats à tester**:
- ✅ PNG
- ✅ JPG/JPEG
- ✅ WebP
- ✅ PDF (optionnel)

**Attendu**:
- Bouton devient "Upload... X%"
- Barre de progression (0% → 100%)
- Images apparaissent en haut de la grille
- Preview correcte (aspect-ratio 16:9)
- Métadonnées: nom fichier + taille (KB)

**Console** (F12):
```javascript
// Devrait voir:
POST /api/blog/upload (200 OK)
Response: { url: "https://sorami-blog.s3...", fileName: "...", size: ... }
```

---

### 4️⃣ Tester la Recherche

**Action**: Taper dans la barre de recherche

**Cas à tester**:
```
Recherche: "test"     → Filtre images contenant "test"
Recherche: ".webp"    → Filtre images WebP
Recherche: "zzz"      → Aucun résultat (message affiché)
```

**Attendu**:
- Filtrage instantané (pas de délai)
- Compteur mis à jour
- Message "Aucune image trouvée" si vide

---

### 5️⃣ Tester les Modes d'Affichage

#### Mode Grille (défaut)
**Action**: S'assurer que l'icône grille est active (violet)

**Attendu**:
- Grid responsive:
  - Mobile: 2 colonnes
  - Tablet: 3 colonnes
  - Desktop: 4 colonnes
- Cards avec:
  - Image preview
  - Overlay au hover avec boutons
  - Nom + taille en bas

#### Mode Liste
**Action**: Cliquer icône liste

**Attendu**:
- Vue liste verticale
- Chaque ligne:
  - Thumbnail 64x64 à gauche
  - Nom + métadonnées au centre
  - Boutons d'action à droite
- Bordure violette si sélectionnée

---

### 6️⃣ Tester la Sélection

**Action**: 
1. Cliquer sur une image (ou bouton ✓)
2. Vérifier que la modal se ferme
3. Vérifier que l'image s'affiche dans "Image de couverture"

**Attendu**:
- Modal se ferme avec animation
- Image définie dans `formData.coverImage`
- Preview 128x128 affiché dans l'éditeur
- URL correcte: `https://sorami-blog.s3.eu-north-1.amazonaws.com/...`

---

### 7️⃣ Tester le Rognage (Crop)

**Action**:
1. Rouvrir modal
2. Cliquer icône crop (bleue) sur une image
3. Modal crop s'ouvre par-dessus

**Attendu**:
- Sous-modal crop affiché
- Image chargée dans ReactCrop
- Zone de sélection visible (ratio 16:9)
- Poignées de resize fonctionnelles
- Boutons "Annuler" et "Appliquer"

**Action**: Ajuster zone → Cliquer "Appliquer"

**Attendu**:
- Canvas créé en mémoire
- Blob WebP généré
- Upload automatique
- Nouvelle image avec "cropped-image.webp"
- Ajoutée en haut de la liste
- Modal crop se ferme

**Console**:
```javascript
POST /api/blog/upload (200 OK)
// Image rognée uploadée
```

---

### 8️⃣ Tester la Suppression

**Action**:
1. Cliquer icône poubelle (rouge)
2. Confirmer dans le dialogue

**Attendu**:
- Dialogue natif: "Êtes-vous sûr..."
- Si confirmé:
  - DELETE /api/blog/upload (200 OK)
  - Image disparaît de la liste
  - Animation fade-out (optionnelle)

**Console**:
```javascript
DELETE /api/blog/upload
Body: { fileName: "blog/images/xxx.webp" }
Response: 200 OK
```

---

### 9️⃣ Tester la Fermeture

**Actions à tester**:
1. Cliquer bouton X (en haut à droite)
2. Cliquer en dehors du modal (backdrop)
3. Appuyer Échap (si implémenté)

**Attendu**:
- Modal se ferme avec animation
- État `isImageManagerOpen = false`
- Éditeur de blog redevient visible

---

### 🔟 Tester le Responsive

**Breakpoints à tester**:
```
Mobile:   375px  (iPhone)
Tablet:   768px  (iPad)
Desktop:  1280px (Standard)
```

**Éléments à vérifier**:
- Modal: max-w-6xl avec padding mobile
- Grille: colonnes adaptatives
- Barre recherche: width: 100% sur mobile
- Boutons: pas de débordement
- Crop modal: scroll si nécessaire

**Chrome DevTools**:
1. F12 → Toggle device toolbar
2. Tester iPhone 12, iPad, Desktop
3. Rotation portrait/landscape

---

## 🐛 Problèmes Potentiels

### Erreur 403 Forbidden
**Symptôme**: Images ne se chargent pas, 403 dans Network

**Solution**:
1. Vérifier bucket `sorami-blog` est public
2. Vérifier IAM policy (pas de deny)
3. Tester URL directe dans navigateur

### Erreur CORS
**Symptôme**: Blocked by CORS policy

**Solution**:
1. Vérifier CORS bucket S3:
```json
{
  "AllowedOrigins": ["http://localhost:3001", "https://sorami.app"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"]
}
```

### Upload échoue
**Symptôme**: Upload bloqué à X%

**Solution**:
1. Vérifier taille fichier < 10MB
2. Vérifier credentials AWS dans .env
3. Logs serveur: `npm run dev` (terminal)

### Images ne s'affichent pas
**Symptôme**: Liste vide alors qu'images existent

**Solution**:
1. F12 → Network → GET /api/blog/images
2. Vérifier response: `{ images: [...] }`
3. Vérifier prefix: `blog/images/`
4. Tester S3 ListObjects avec AWS CLI:
```bash
aws s3 ls s3://sorami-blog/blog/images/
```

---

## 📊 Métriques de Performance

### Temps de Chargement Attendus
- Modal open: < 200ms
- Load images: < 1s (10-50 images)
- Upload 1 image: 2-5s (compression incluse)
- Crop & upload: 3-6s
- Delete: < 500ms

### Taille Bundle
```bash
# Vérifier impact bundle
npm run build
# Chercher: S3ImageManager.tsx
```

**Attendu**: < 50KB (gzipped)

---

## ✅ Checklist Finale

Avant de merger/déployer:

- [ ] Upload fonctionne (PNG, JPG, WebP)
- [ ] Recherche filtre correctement
- [ ] Toggle grille/liste OK
- [ ] Sélection ferme modal
- [ ] Crop crée nouvelle image
- [ ] Suppression retire image
- [ ] Fermeture modal OK
- [ ] Responsive mobile OK
- [ ] Pas d'erreurs console
- [ ] Pas d'erreurs TypeScript
- [ ] Documentation lue
- [ ] Variables .env configurées

---

## 🎉 Test Réussi !

Si tous les tests passent:
✅ Le gestionnaire d'images est **prêt pour la production**

**Prochaine étape**: 
1. Tester en staging
2. Migration images existantes (script fourni)
3. Déploiement production

---

## 📞 En Cas de Problème

1. **Logs serveur**: Terminal où `npm run dev` tourne
2. **Logs client**: F12 → Console
3. **Network**: F12 → Network tab
4. **Documentation**: `docs/S3_IMAGE_MANAGER.md`
5. **Code**: `src/components/admin/S3ImageManager.tsx`

**Debug Mode**:
```tsx
// Dans S3ImageManager.tsx, ajouter:
console.log("Modal state:", { isOpen, images: images.length });
console.log("Upload progress:", uploadProgress);
console.log("Crop image:", cropImage);
```
