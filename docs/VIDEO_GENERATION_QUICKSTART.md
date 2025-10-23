# 🚀 Guide Rapide - Génération de Vidéos

## Démarrage en 5 minutes

### 1. Configuration Backend (30 secondes)

```bash
# Dans le dossier backend
pip install google-genai

# Ajouter dans .env
GEMINI_API_KEY=votre_cle_api_google_gemini
```

### 2. Démarrer les Services (30 secondes)

**Terminal 1 - Backend**:
```bash
cd backend
python main.py
# ✅ Backend sur http://localhost:9006
```

**Terminal 2 - Frontend**:
```bash
cd front
npm run dev
# ✅ Frontend sur http://localhost:3000
```

### 3. Accéder à l'Interface (30 secondes)

Visitez: **http://localhost:3000/generate-videos**

Ou depuis le dashboard: **http://localhost:3000/dashboard** → Carte "Générer des vidéos"

### 4. Générer Votre Première Vidéo (2 minutes)

1. **Entrez une description**:
   ```
   Un magnifique lever de soleil sur l'océan avec des vagues douces 
   et des mouettes volant dans le ciel orange et rose
   ```

2. **Cliquez sur "Générer la vidéo"**

3. **Attendez 30-120 secondes** (barre de progression visible)

4. **Téléchargez votre vidéo** 🎬

---

## 🎯 Exemples Rapides

### Prompt Simple
```
Un chat qui dort paisiblement au soleil
```

### Prompt Avancé
```
Un lever de soleil cinématographique sur l'océan Pacifique, 
avec des vagues douces s'écrasant sur la plage, des mouettes 
volant dans le ciel orange et rose, mouvement de caméra 
fluide de gauche à droite, ambiance paisible et sereine
```

### Avec Image de Référence
1. Uploader une image de paysage
2. Ajouter le prompt: "Animer cette scène avec un mouvement de caméra lent"

---

## ⚡ Options Disponibles

| Option | Valeurs | Défaut |
|--------|---------|--------|
| Ratio d'aspect | 16:9, 16:10 | 16:9 |
| Durée | 5-8 secondes | 8s |
| Nombre de vidéos | 1-4 | 1 |
| Génération de personnes | Autoriser, Interdire | Autoriser |

---

## 🧪 Test Rapide

```bash
# Tester l'API directement
./test-video-generation.sh

# Ou manuellement
curl http://localhost:9006/health
```

---

## 📝 Conseils pour de Meilleurs Résultats

✅ **À FAIRE**:
- Soyez descriptif et précis
- Mentionnez les mouvements de caméra
- Décrivez l'ambiance et l'éclairage
- Utilisez un vocabulaire cinématographique

❌ **À ÉVITER**:
- Prompts trop courts ("océan")
- Descriptions vagues
- Trop de détails complexes

---

## 🐛 Problèmes Courants

### Backend non accessible
```bash
# Vérifier que le backend est démarré
curl http://localhost:9006/health
```

### Génération échoue
- Vérifier `GEMINI_API_KEY` dans `.env`
- Vérifier `google-genai` installé
- Consulter les logs du backend

### Timeout
- Normal pour les premières générations
- Temps moyen: 30-120 secondes
- Max: 3 minutes

---

## 📚 Documentation Complète

Voir [VIDEO_GENERATION_FEATURE.md](./VIDEO_GENERATION_FEATURE.md) pour la documentation détaillée.

---

**🎬 Prêt à créer vos vidéos!**

*Total: ~3-5 minutes de setup*
