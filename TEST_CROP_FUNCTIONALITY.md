# 🧪 Test de la Fonctionnalité de Rognage d'Images

## ✅ Améliorations Apportées

### 1. **Gestion Robuste des Coordonnées**
- ✅ Support des unités pixels (px) et pourcentage (%)
- ✅ Conversion automatique selon le type d'unité
- ✅ Calcul correct des facteurs d'échelle (naturalWidth vs displayWidth)

### 2. **Validation & Sécurité**
- ✅ Vérification que le crop a des dimensions valides
- ✅ Vérification que tous les éléments nécessaires sont présents
- ✅ Messages d'erreur clairs pour l'utilisateur

### 3. **UX Améliorée**
- ✅ Indicateur de chargement pendant le traitement
- ✅ Boutons désactivés pendant l'upload
- ✅ Messages de confirmation/erreur
- ✅ Réinitialisation complète de l'état après crop

### 4. **Qualité d'Image**
- ✅ Qualité WebP définie à 95%
- ✅ Préservation de la résolution originale
- ✅ Nom de fichier descriptif ("cropped-image.webp")

---

## 📋 Checklist de Test

### Test 1️⃣ : Ouvrir le Modal de Crop

**Étapes** :
1. Démarrer le serveur : `npm run dev`
2. Aller sur : http://localhost:3001/admin/blog/editor
3. Cliquer "Gérer les images"
4. Cliquer l'icône **bleue** (crop) sur une image

**Attendu** :
- ✅ Modal de crop s'affiche par-dessus
- ✅ Image chargée dans ReactCrop
- ✅ Zone de sélection visible (rectangle avec poignées)
- ✅ Zone initialisée à 90% de largeur, ratio 16:9
- ✅ Titre "Rogner l'image" avec icône

---

### Test 2️⃣ : Manipuler la Zone de Crop

**Étapes** :
1. **Déplacer** : Cliquer et glisser la zone
2. **Redimensionner** : Tirer sur les poignées d'angle
3. **Observer** : Le ratio 16:9 est maintenu

**Attendu** :
- ✅ Zone se déplace fluidement
- ✅ Redimensionnement fonctionne
- ✅ Ratio 16:9 toujours respecté
- ✅ Zone ne déborde pas de l'image

---

### Test 3️⃣ : Appliquer le Crop (Cas Nominal)

**Étapes** :
1. Ajuster la zone de crop
2. Cliquer **"Appliquer"**
3. Observer le comportement

**Attendu** :
- ✅ Bouton devient "Traitement..." avec spinner
- ✅ Boutons désactivés (grisés)
- ✅ Après 2-5 secondes : Alert "Image rognée avec succès !"
- ✅ Modal de crop se ferme
- ✅ Nouvelle image apparaît en haut de la liste
- ✅ Nom : "cropped-image.webp"
- ✅ Taille affichée (KB)

**Console Navigateur (F12)** :
```javascript
POST /api/blog/upload
Status: 200 OK
Response: { url: "https://...", fileName: "...", size: ... }
```

---

### Test 4️⃣ : Annuler le Crop

**Étapes** :
1. Ouvrir modal de crop
2. Ajuster la zone
3. Cliquer **"Annuler"**

**Attendu** :
- ✅ Modal de crop se ferme immédiatement
- ✅ Retour à la liste d'images
- ✅ Aucune image uploadée
- ✅ État réinitialisé

---

### Test 5️⃣ : Crop Sans Sélection

**Étapes** :
1. Ouvrir modal de crop
2. **NE PAS** ajuster la zone (garder celle par défaut)
3. Cliquer "Appliquer"

**Attendu** :
- ✅ Crop fonctionne avec la zone par défaut (90% largeur)
- ✅ Image rognée créée avec succès

---

### Test 6️⃣ : Qualité de l'Image Rognée

**Étapes** :
1. Rogner une image haute résolution
2. Télécharger l'image rognée
3. Vérifier les propriétés

**Attendu** :
- ✅ Format : WebP
- ✅ Qualité visuelle : Excellente (95%)
- ✅ Ratio : 16:9 exact
- ✅ Pas de pixelisation
- ✅ Taille fichier raisonnable (< original)

**Vérification** :
```bash
# Télécharger l'image
curl -O https://sorami-blog.s3.eu-north-1.amazonaws.com/blog/images/xxx-cropped.webp

# Vérifier les dimensions
file cropped-image.webp
# Devrait afficher : WebP image data, [...] x [...] (ratio 16:9)
```

---

### Test 7️⃣ : Gestion d'Erreur - Upload Échoué

**Simulation** :
1. Déconnecter internet ou bloquer l'API
2. Essayer de rogner une image

**Attendu** :
- ✅ Spinner s'affiche pendant traitement
- ✅ Après timeout : Alert "Erreur lors de l'upload: ..."
- ✅ Boutons réactivés
- ✅ Modal reste ouvert (possibilité de réessayer)

---

### Test 8️⃣ : Crop de Petites Images

**Étapes** :
1. Uploader une petite image (< 500px)
2. Ouvrir crop
3. Ajuster zone au minimum
4. Appliquer

**Attendu** :
- ✅ Crop fonctionne même sur petites images
- ✅ Qualité préservée
- ✅ Pas d'erreur de calcul

---

### Test 9️⃣ : Crop de Grandes Images

**Étapes** :
1. Uploader une grande image (> 3000px)
2. Ouvrir crop
3. Sélectionner une petite zone
4. Appliquer

**Attendu** :
- ✅ Calcul d'échelle correct (scaleX, scaleY)
- ✅ Résolution préservée
- ✅ Pas de déformation

---

### Test 🔟 : Multiples Crops Successifs

**Étapes** :
1. Rogner une image → Success
2. Rogner la même image encore → Success
3. Rogner une autre image → Success

**Attendu** :
- ✅ Chaque crop crée une nouvelle image
- ✅ Pas de conflit entre crops
- ✅ État correctement réinitialisé à chaque fois
- ✅ Liste d'images mise à jour progressivement

---

## 🐛 Scénarios d'Erreur Testés

### Erreur 1 : Image Non Chargée
```typescript
if (!cropImageRef.current) {
  alert("Veuillez sélectionner une zone à rogner");
  return;
}
```
✅ **Géré** : Message clair à l'utilisateur

### Erreur 2 : Zone Trop Petite
```typescript
if (!completedCrop.width || !completedCrop.height) {
  alert("La zone de rognage est trop petite");
  return;
}
```
✅ **Géré** : Validation des dimensions

### Erreur 3 : Canvas Non Disponible
```typescript
if (!ctx) {
  throw new Error("Impossible de créer le canvas");
}
```
✅ **Géré** : Try-catch avec alert

### Erreur 4 : Blob Non Généré
```typescript
if (!blob) {
  alert("Erreur lors de la conversion de l'image");
  return;
}
```
✅ **Géré** : Vérification du blob

### Erreur 5 : API Upload Échoué
```typescript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || "Upload échoué");
}
```
✅ **Géré** : Affichage de l'erreur API

---

## 📊 Points Techniques Vérifiés

### Calcul des Coordonnées

**Unités Pixels** :
```typescript
cropX = completedCrop.x
cropWidth = completedCrop.width
```

**Unités Pourcentage** :
```typescript
cropX = (completedCrop.x * image.width) / 100
cropWidth = (completedCrop.width * image.width) / 100
```
✅ **Support des deux types**

### Facteurs d'Échelle

```typescript
const scaleX = image.naturalWidth / image.width;
const scaleY = image.naturalHeight / image.height;
```
✅ **Correct** : Prend en compte taille naturelle vs affichée

### Canvas Drawing

```typescript
ctx.drawImage(
  image,
  cropX * scaleX,      // Source X (image originale)
  cropY * scaleY,      // Source Y
  cropWidth * scaleX,  // Source Width
  cropHeight * scaleY, // Source Height
  0,                   // Dest X (canvas)
  0,                   // Dest Y
  canvas.width,        // Dest Width
  canvas.height        // Dest Height
);
```
✅ **Correct** : Mapping source → destination

---

## 🎯 Résultats Attendus

### Performance
- ⏱️ Temps de crop : < 3 secondes (images normales)
- ⏱️ Temps de crop : 3-6 secondes (grandes images > 5MB)
- 💾 Taille fichier : 30-70% de l'original (WebP 95%)

### Qualité
- 🖼️ Ratio : 16:9 exact
- 📐 Résolution : Préservée (pas de perte)
- 🎨 Couleurs : Fidèles à l'original
- 🔍 Netteté : Aucune pixelisation

### UX
- 🎭 Feedback visuel : Spinner pendant traitement
- 💬 Messages : Clairs et informatifs
- 🚫 Erreurs : Gérées avec alerts
- ✅ Succès : Confirmation + image visible

---

## 🚀 Test Rapide (1 minute)

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir le navigateur
open http://localhost:3001/admin/blog/editor

# 3. Tester
# - Cliquer "Gérer les images"
# - Cliquer icône crop (bleue) sur une image
# - Ajuster la zone
# - Cliquer "Appliquer"
# - Vérifier : nouvelle image en haut de liste

# 4. Vérifier console (F12)
# Devrait voir : POST /api/blog/upload → 200 OK
```

---

## ✅ Checklist Finale

Avant de valider la fonctionnalité :

- [ ] Modal de crop s'ouvre correctement
- [ ] Zone de crop manipulable (déplacement + resize)
- [ ] Ratio 16:9 maintenu pendant manipulation
- [ ] Bouton "Appliquer" montre spinner
- [ ] Boutons désactivés pendant traitement
- [ ] Image rognée uploadée avec succès
- [ ] Nouvelle image visible en liste
- [ ] Qualité d'image excellente (95%)
- [ ] Messages d'erreur clairs si problème
- [ ] Bouton "Annuler" ferme le modal
- [ ] État réinitialisé après crop
- [ ] Pas d'erreurs dans console navigateur
- [ ] Pas d'erreurs dans logs serveur

---

## 🎉 Validation

Si tous les tests passent :
✅ **La fonctionnalité de rognage est PRÊTE pour la production !**

---

## 📞 Debug

En cas de problème :

**Console Navigateur (F12)** :
```javascript
// Vérifier les erreurs
console.log("Crop image:", cropImage);
console.log("Completed crop:", completedCrop);
console.log("Image ref:", cropImageRef.current);
```

**Logs Serveur** :
```bash
# Vérifier l'upload
POST /api/blog/upload
# Devrait voir: 200 OK avec { url, fileName, size }
```
