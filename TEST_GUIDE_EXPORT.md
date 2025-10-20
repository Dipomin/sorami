# 🧪 Guide de Test Rapide - Pagination et Export

## Préparation

```bash
# 1. Assurez-vous que le serveur tourne
npm run dev

# 2. Ouvrez la console navigateur (F12)
# 3. Ouvrez le terminal où npm run dev est lancé
```

## Test Complet (5 minutes)

### Étape 1 : Formater un Livre

1. ✅ Allez sur `/books`
2. ✅ Sélectionnez un livre avec **plusieurs chapitres**
3. ✅ Cliquez sur le menu du livre → "✨ Mise en forme pro (IA)"
4. ✅ Attendez la fin du formatage (15-60s)
5. ✅ Le dialog du livre formaté s'ouvre

**Vérifications** :
- Dialog s'ouvre automatiquement après formatage
- Panneau de contrôles visible en haut (Format de page + Format d'export)
- Livre affiché dans zone scrollable

### Étape 2 : Tester le Blocage du Dialog

Dans le dialog ouvert :

1. ✅ Cliquez **en dehors** du dialog
   - **Attendu** : Dialog reste ouvert ✅
   
2. ✅ Appuyez sur **Escape**
   - **Attendu** : Dialog reste ouvert ✅
   
3. ✅ Cliquez sur le bouton **"X Fermer"** en bas
   - **Attendu** : Dialog se ferme ✅
   
4. ✅ Réouvrez le dialog (cliquer "Mise en forme pro" à nouveau)
   
5. ✅ Cliquez sur le **"X"** en haut à droite
   - **Attendu** : Dialog se ferme ✅

**Résultat** : Le dialog ne se ferme QUE via les boutons ! ✅

### Étape 3 : Tester l'Export PDF Format A4

1. ✅ Réouvrez le dialog
2. ✅ Sélectionnez **"📄 A4 (210 × 297 mm)"**
3. ✅ Sélectionnez **"📄 PDF (impression)"**
4. ✅ Cliquez sur **"📥 Télécharger"**

**Vérifications** :
- ✅ Bouton affiche "Export..." avec spinner pendant le traitement
- ✅ Dialog d'impression du navigateur s'ouvre
- ✅ Aperçu montre le livre paginé en format A4
- ✅ Pages numérotées visibles en bas à droite
- ✅ Page de titre affichée en premier
- ✅ Sauts de page entre les chapitres
- ✅ Toast vert : "✅ Livre exporté en PDF avec succès !"

**Logs Console** :
```
📥 [Client] Début de l'export du livre formaté
📐 [Client] Format de page: A4
📄 [Client] Format d'export: pdf
✅ [Client] HTML paginé reçu
📄 [Client] Génération PDF en cours...
✅ [Client] PDF prêt pour impression
✅ [Client] Export PDF réussi
```

**Logs Terminal** :
```
📄 [Export Formatted API] Début de l'export formaté paginé
📐 [Export Formatted API] Format de page: A4
✅ [Export Formatted API] Livre trouvé: [Titre]
✅ [Export Formatted API] HTML paginé généré
```

### Étape 4 : Tester l'Export PDF Format A5

1. ✅ Dans le dialog d'impression, annulez
2. ✅ Retournez au dialog du livre
3. ✅ Sélectionnez **"📖 A5 (148 × 210 mm)"**
4. ✅ Cliquez sur **"📥 Télécharger"**

**Vérifications** :
- ✅ Dialog d'impression s'ouvre
- ✅ Aperçu montre un format **plus petit** (A5)
- ✅ Marges adaptées (20mm au lieu de 25mm)
- ✅ Même structure que A4 mais dimensions réduites

### Étape 5 : Tester l'Export DOCX

1. ✅ Annulez le dialog d'impression
2. ✅ Sélectionnez **"📝 DOCX (Word)"**
3. ✅ Cliquez sur **"📥 Télécharger"**

**Vérifications** :
- ✅ Fichier `.docx` téléchargé automatiquement
- ✅ Nom du fichier : `[titre_du_livre].docx`
- ✅ Toast vert : "✅ Livre exporté en DOCX avec succès !"
- ✅ Ouvrir dans Word/LibreOffice
- ✅ Contenu du livre présent
- ✅ Styles appliqués (titres, paragraphes, etc.)

### Étape 6 : Tester l'Export EPUB

1. ✅ Sélectionnez **"📚 EPUB (eBook)"**
2. ✅ Cliquez sur **"📥 Télécharger"**

**Vérifications** :
- ✅ Fichier `.epub` téléchargé automatiquement
- ✅ Nom du fichier : `[titre_du_livre].epub`
- ✅ Toast vert : "✅ Livre exporté en EPUB avec succès !"
- ✅ (Optionnel) Ouvrir dans Calibre pour vérifier

### Étape 7 : Tester le Bouton "Copier HTML"

1. ✅ Cliquez sur **"📋 Copier HTML"** en bas à gauche
2. ✅ Toast vert : "📋 Contenu HTML copié dans le presse-papiers !"
3. ✅ Collez dans un éditeur de texte (Ctrl+V / Cmd+V)
4. ✅ Vérifiez que le HTML formaté est copié

## Checklist Complète

### ✅ Fonctionnalités de Base
- [ ] Dialog s'ouvre après formatage
- [ ] Panneau de contrôles visible
- [ ] Sélecteurs fonctionnent
- [ ] Bouton "Télécharger" cliquable
- [ ] Livre affiché et scrollable

### ✅ Sécurité du Dialog
- [ ] Clic extérieur → Aucun effet
- [ ] Touche Escape → Aucun effet
- [ ] Bouton "Fermer" → Dialog se ferme
- [ ] Bouton "X" (top-right) → Dialog se ferme

### ✅ Export PDF
- [ ] Format A4 → Dialog d'impression avec A4
- [ ] Format A5 → Dialog d'impression avec A5
- [ ] Pagination visible
- [ ] Page de titre présente
- [ ] Sauts de page corrects

### ✅ Export DOCX
- [ ] Fichier `.docx` téléchargé
- [ ] Nom de fichier correct
- [ ] Ouvre dans Word
- [ ] Contenu présent
- [ ] Styles appliqués

### ✅ Export EPUB
- [ ] Fichier `.epub` téléchargé
- [ ] Nom de fichier correct
- [ ] Toast de succès

### ✅ UX
- [ ] Toast de succès après export
- [ ] Spinner pendant export
- [ ] Logs console présents
- [ ] Logs terminal présents
- [ ] Aucune erreur TypeScript

### ✅ Performance
- [ ] Export rapide (< 2s pour PDF, < 100ms pour DOCX/EPUB)
- [ ] Interface réactive
- [ ] Pas de freeze de l'UI

## Scénarios de Test Supplémentaires

### Test avec un Livre Court (1 chapitre)
1. Formater un livre avec 1 seul chapitre
2. Exporter en PDF A4
3. **Vérifier** : 1-2 pages générées

### Test avec un Livre Long (10+ chapitres)
1. Formater un livre avec 10+ chapitres
2. Exporter en PDF A4
3. **Vérifier** : Plusieurs pages, sauts entre chapitres

### Test de Changement Rapide de Format
1. Sélectionner A4
2. Immédiatement sélectionner A5
3. Cliquer "Télécharger"
4. **Vérifier** : Export en A5 (dernier choix)

### Test avec Livre Non Formaté
1. Créer un nouveau livre
2. Ne PAS cliquer "Mise en forme pro"
3. Essayer d'ouvrir le dialog
4. **Attendu** : Dialog ne s'ouvre pas (contenu formaté manquant)

## Dépannage

### Problème : Dialog d'impression ne s'ouvre pas
**Solution** : Vérifiez que les pop-ups ne sont pas bloqués par le navigateur

### Problème : Fichier DOCX/EPUB ne s'ouvre pas
**Solution** : Vérifiez l'extension du fichier téléchargé

### Problème : Logs manquants
**Solution** : Actualisez la page et réessayez

### Problème : Toast n'apparaît pas
**Solution** : Vérifiez la console pour erreurs JavaScript

## Résultats Attendus

### Si tous les tests passent ✅
```
✅ Dialog sécurisé (fermeture contrôlée)
✅ Pagination fonctionnelle (A4 et A5)
✅ Export PDF opérationnel
✅ Export DOCX opérationnel
✅ Export EPUB opérationnel
✅ Toast notifications fonctionnent
✅ Logs complets dans console et terminal
✅ Aucune erreur TypeScript

🎉 Fonctionnalité prête pour la production !
```

### Si des tests échouent ❌
1. Notez le test qui échoue
2. Vérifiez les logs de console
3. Vérifiez les logs de terminal
4. Rapportez l'erreur avec les logs

## Temps Estimé

- **Test rapide** (Étapes 1-3) : 2 minutes
- **Test complet** (Étapes 1-7) : 5 minutes
- **Test approfondi** (avec scénarios supplémentaires) : 10 minutes

## Notes Importantes

⚠️ **PDF** : Utilise `window.print()` donc dépend du navigateur
⚠️ **DOCX** : Format simplifié, peut nécessiter ajustements dans Word
⚠️ **EPUB** : Format de base, peut nécessiter conversion pour certains readers

✅ **Tous les formats sont fonctionnels pour un usage de base**

---

**Bon test ! 🚀**
