#!/usr/bin/env tsx
/**
 * Script pour créer 3 articles de blog SEO-optimisés pour Sorami
 * Usage: npx tsx scripts/create-blog-simple.ts
 */

import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const blogArticles = [
  {
    title: "Comment générer des images époustouflantes avec l'IA en 2025",
    excerpt: "Découvrez les secrets pour créer des visuels professionnels avec l'intelligence artificielle. Guide complet pour maîtriser la génération d'images IA.",
    content: `# Comment générer des images époustouflantes avec l'IA en 2025

L'intelligence artificielle a révolutionné la création d'images, permettant à chacun de produire des visuels professionnels en quelques secondes. Avec **Sorami**, vous avez accès aux modèles IA les plus avancés pour transformer vos idées en œuvres d'art.

## Pourquoi choisir la génération d'images IA ?

### Avantages révolutionnaires
- **Rapidité inégalée** : Créez en 30 secondes ce qui prenait des heures
- **Créativité sans limites** : Explorez des styles impossibles traditionnellement
- **Coût optimisé** : Plus besoin de designers ou de banques d'images coûteuses
- **Personnalisation totale** : Vos visuels reflètent parfaitement votre vision

### Domaines d'application
1. **Marketing digital** - Publicités, posts réseaux sociaux, bannières
2. **E-commerce** - Photos de produits, mockups, illustrations
3. **Contenu créatif** - Concepts artistiques, illustrations d'articles
4. **Présentation professionnelle** - Visuels pour slides, rapports

## Les techniques avancées avec Sorami

### 1. Maîtriser l'art du prompt
Un bon prompt IA transforme une idée vague en chef-d'œuvre. Voici la formule gagnante :

**Structure optimale :**
- **Sujet principal** : Décrivez précisément l'élément central
- **Style artistique** : Photoréaliste, aquarelle, digital art, vintage
- **Ambiance** : Lighting, mood, couleurs dominantes
- **Détails techniques** : Résolution, angle de vue, composition

### 2. Workflow professionnel étape par étape

#### Étape 1 : Définir l'objectif
Avant de générer, clarifiez :
- À qui s'adresse cette image ?
- Quel message véhiculer ?
- Où sera-t-elle utilisée ?

#### Étape 2 : Génération avec Sorami
1. **Connectez-vous** à votre dashboard Sorami
2. **Accédez** à l'outil de génération d'images
3. **Rédigez** votre prompt optimisé
4. **Sélectionnez** le style et les paramètres
5. **Générez** et itérez selon les résultats

## Pourquoi Sorami est votre meilleur allié

### Technologies de pointe
- **Modèles IA dernière génération** : DALL-E 3, Midjourney, Stable Diffusion
- **Interface intuitive** : Pas besoin d'être expert technique
- **Génération rapide** : Résultats en moins de 30 secondes
- **Qualité garantie** : Images haute définition systématiquement

### Avantages business
- **Économies substantielles** : Plus de budgets design externes
- **Autonomie créative** : Générez quand vous voulez
- **Productivité décuplée** : 100x plus rapide qu'un designer
- **Innovation continue** : Accès aux dernières avancées IA

## Prêt à transformer votre création visuelle ?

Ne laissez plus les contraintes créatives freiner vos projets. Rejoignez les milliers d'entrepreneurs, marketers et créateurs qui utilisent **Sorami** pour donner vie à leurs idées.

### Offre spéciale nouveaux utilisateurs
- **10 générations gratuites** pour tester
- **Guide complet** "Maîtriser l'IA créative"
- **Accès VIP** à notre communauté d'experts
- **Garantie satisfait ou remboursé** 30 jours

**[Commencer maintenant →](https://sorami.app/dashboard)**

### Abonnements adaptés à vos besoins
- **Standard (15 000 F/mois)** : 100 images haute qualité
- **Créateur (35 000 F/mois)** : 700 images premium + support dédié

Transformez vos idées en chefs-d'œuvre visuels dès aujourd'hui avec **Sorami** !

---

*Cet article vous a plu ? Partagez-le et découvrez nos autres guides sur la création de contenu IA.*`,
    category: "Tutoriels",
    tags: ["IA", "génération d'images", "design", "marketing digital", "créativité", "tutoriel"],
    metaTitle: "Génération d'images IA 2025 : Guide complet pour créer des visuels professionnels",
    metaDescription: "Maîtrisez la génération d'images avec l'IA. Techniques pro, astuces d'experts et cas d'usage concrets pour créer des visuels époustouflants avec Sorami.",
    metaKeywords: "génération images IA, création visuels IA, Sorami, design IA, DALL-E, Midjourney, prompt engineering, marketing digital",
    status: "PUBLISHED" as const,
    published: true,
  },
  {
    title: "Créer des vidéos captivantes avec l'IA : Le guide ultime 2025",
    excerpt: "Révolutionnez votre stratégie vidéo avec l'intelligence artificielle. Techniques avancées, outils professionnels et workflows optimisés pour des vidéos qui convertissent.",
    content: `# Créer des vidéos captivantes avec l'IA : Le guide ultime 2025

La vidéo représente plus de 80% du trafic internet mondial. Avec l'IA, créer du contenu vidéo professionnel n'est plus réservé aux studios. **Sorami** démocratise la création vidéo en mettant la puissance de l'intelligence artificielle à portée de tous.

## La révolution de la vidéo IA

### Transformation du marché
L'industrie vidéo connaît sa plus grande révolution depuis l'avènement du numérique :
- **Démocratisation** : Créez sans équipe technique
- **Vitesse** : Production 100x plus rapide
- **Coût** : Réduction de 95% des budgets production
- **Qualité** : Résultats comparables aux studios pros

### Chiffres clés 2025
- **91% des entreprises** utilisent la vidéo marketing
- **Engagement +1200%** sur les réseaux sociaux vs images
- **Conversion +80%** sur les landing pages avec vidéo
- **ROI moyen 400%** pour les campagnes vidéo IA

## Types de vidéos révolutionnaires avec Sorami

### 1. Vidéos explicatives animées
**Cas d'usage :** Présenter produits/services complexes
**Durée optimale :** 60-90 secondes
**Style :** Animation 2D/3D, motion graphics

### 2. Contenus réseaux sociaux
**Formats :** Stories, Reels, TikTok, YouTube Shorts
**Caractéristiques :** Rythme dynamique, hook immédiat
**Durée :** 15-60 secondes

### 3. Vidéos corporate & formation
**Objectifs :** Communication interne, onboarding, formation
**Avantages :** Cohérence visuelle, mise à jour facile
**Format :** Présentation dynamique avec avatars IA

### 4. Publicités vidéo performantes
**Plateformes :** Facebook Ads, Google Ads, LinkedIn
**Optimisation :** Tests A/B automatisés
**Conversion :** Jusqu'à 20% de taux de conversion

## Workflow professionnel étape par étape

### Phase 1 : Stratégie et conceptualisation

#### Définir les objectifs SMART
- **Spécifique** : Quel message précis ?
- **Mesurable** : Quelles métriques de succès ?
- **Atteignable** : Objectifs réalistes ?
- **Relevant** : Aligné avec la stratégie business ?
- **Temporel** : Délais de diffusion ?

### Phase 2 : Script et storyboard

#### Structure narrative éprouvée
1. **Hook (0-3s)** : Question provocante, statistique choc
2. **Problème (3-15s)** : Identifier la douleur
3. **Solution (15-45s)** : Présenter votre produit/service
4. **Preuve (45-60s)** : Témoignages, démonstration
5. **Action (60-90s)** : Call-to-action irrésistible

### Phase 3 : Production avec Sorami

#### Configuration optimale
1. **Format et ratio** : 16:9 (YouTube), 9:16 (TikTok), 1:1 (Instagram)
2. **Résolution** : 1080p minimum, 4K pour le premium
3. **Durée** : Adapter selon la plateforme
4. **Style visuel** : Cohérent avec votre branding

## Pourquoi Sorami domine la création vidéo IA

### Technologies de pointe
- **Modèles IA exclusifs** : Dernières avancées recherche
- **Qualité 4K native** : Résolution professionnelle garantie
- **Rendering ultra-rapide** : Vidéos prêtes en 2-5 minutes
- **Bibliothèque assets** : Millions d'éléments disponibles

### Interface révolutionnaire
- **Simplicité d'usage** : Créez sans formation technique
- **Templates pros** : 1000+ modèles optimisés secteur
- **Édition intuitive** : Drag & drop, timeline visuelle
- **Preview temps réel** : Visualisez avant rendu final

## ROI et business impact

### Économies substantielles
- **Production traditionnelle** : 5 000-50 000€ par vidéo
- **Avec Sorami** : 50-500€ par vidéo premium
- **Économie moyenne** : 90-95% des coûts

### Gains de productivité
- **Délai traditionnel** : 2-6 semaines production
- **Avec Sorami** : 1-3 heures création complète
- **Accélération** : 100-500x plus rapide

### Impact business mesurable
- **Trafic web** : +200% en moyenne
- **Génération leads** : +150% qualification
- **Conversions** : +80% taux transformation
- **Brand awareness** : +300% reconnaissance marque

## Prêt à dominer la vidéo marketing ?

L'avenir appartient aux créateurs qui maîtrisent l'IA vidéo. Ne laissez pas la concurrence prendre l'avantage. Rejoignez la révolution **Sorami** dès aujourd'hui !

### Offre de lancement exclusive
- **5 vidéos HD gratuites** pour découvrir
- **Masterclass "Vidéo Marketing IA"** (valeur 297€)
- **Templates exclusifs** secteur d'activité
- **Support VIP** 30 premiers jours

**[Créer ma première vidéo →](https://sorami.app/generation-videos)**

### Plans adaptés à votre ambition
- **Standard (15 000 F/mois)** : 3 vidéos HD + support
- **Créateur (35 000 F/mois)** : 10 vidéos premium + API + coaching

Transformez vos idées en vidéos qui convertissent avec **Sorami** !

---

*Envie d'aller plus loin ? Découvrez nos guides sur la création d'images IA et la rédaction automatique d'ebooks.*`,
    category: "Marketing Vidéo",
    tags: ["vidéo IA", "marketing vidéo", "création contenu", "conversion", "Sorami", "tutorials"],
    metaTitle: "Création vidéo IA 2025 : Guide complet pour des vidéos qui convertissent",
    metaDescription: "Maîtrisez la création vidéo avec l'IA. Techniques pro, workflows optimisés et cas d'usage concrets pour créer des vidéos captivantes avec Sorami.",
    metaKeywords: "création vidéo IA, marketing vidéo, Sorami, vidéo marketing, conversion, engagement, motion design",
    status: "PUBLISHED" as const,
    published: true,
  },
  {
    title: "Écrire et publier un ebook professionnel avec l'IA : Méthode complète 2025",
    excerpt: "De l'idée à la publication : découvrez comment créer des ebooks de qualité professionnelle grâce à l'intelligence artificielle. Stratégies, outils et techniques d'experts.",
    content: `# Écrire et publier un ebook professionnel avec l'IA : Méthode complète 2025

L'ebook est devenu l'outil de référence pour établir son expertise, générer des leads qualifiés et créer des revenus passifs. Avec **Sorami**, créer un livre numérique professionnel n'a jamais été aussi accessible et rapide.

## L'ebook marketing : arme secrète des experts

### Pourquoi l'ebook domine en 2025
- **Lead magnet ultime** : +400% de conversion vs contenu classique
- **Autorité établie** : Positionnement expert instantané
- **Revenus passifs** : Monétisation automatisée 24/7
- **Portée mondiale** : Distribution sans frontières

### Statistiques qui parlent
- **67% des marketeurs** utilisent les ebooks pour la génération de leads
- **Coût acquisition réduit de 61%** avec du contenu ebook
- **ROI moyen 300%** sur les campagnes ebook marketing
- **Engagement lecteur +150%** vs articles de blog

## Types d'ebooks à fort impact

### 1. Guide pratique et tutoriels
**Objectif :** Enseigner une compétence spécifique
**Structure :** Étapes progressives, exercices pratiques
**Longueur :** 30-80 pages
**Exemple :** "Guide complet du marketing digital 2025"

### 2. Livres blancs et études de cas
**Public :** Décideurs B2B, professionnels
**Contenu :** Données, analyses, insights exclusifs
**Format :** Rapport structuré, graphiques
**Valeur :** Positionnement thought leader

### 3. Romans et fiction
**Marché :** Divertissement, développement personnel
**Créativité :** Illimitée avec l'IA
**Monétisation :** Vente directe, abonnements
**Avantage Sorami :** Cohérence narrative parfaite

### 4. Manuels et formations
**Application :** Éducation, formation professionnelle
**Structure :** Modules, quiz, ressources
**Différenciation :** Personnalisation par audience
**Évolutivité :** Mise à jour simplifiée

## Méthode Sorami : De l'idée au bestseller

### Étape 1 : Conceptualisation stratégique

#### Identifier votre niche profitable
1. **Analyse des tendances** : Google Trends, Amazon bestsellers
2. **Étude concurrentielle** : Gaps du marché, angles différenciants
3. **Personas lecteurs** : Besoins, frustrations, attentes
4. **Validation concept** : Sondages, landing pages test

#### Définir la proposition de valeur unique
- **Problème résolu** : Quelle douleur soulagez-vous ?
- **Promesse principale** : Quel bénéfice concret ?
- **Différenciation** : Pourquoi vous vs la concurrence ?
- **Preuve crédibilité** : Expérience, témoignages, résultats

### Étape 2 : Architecture et structure

#### Plan détaillé optimisé
1. **INTRODUCTION CAPTIVANTE (10%)**
   - Hook émotionnel
   - Promesse claire
   - Roadmap du livre

2. **DÉVELOPPEMENT STRUCTURÉ (80%)**
   - 3-7 chapitres principaux
   - Progression logique
   - Exemples concrets
   - Exercices pratiques

3. **CONCLUSION ET ACTION (10%)**
   - Récapitulatif clés
   - Prochaines étapes
   - Call-to-action

### Étape 3 : Rédaction avec Sorami

#### Configuration optimale
1. **Accès** à l'outil création d'ebooks Sorami
2. **Paramétrage** : Genre, audience, longueur cible
3. **Input stratégique** : Brief détaillé, références, style
4. **Génération** : Première version complète en 2-4 heures

### Étape 4 : Design et mise en forme

#### Principes de design professionnels
- **Hiérarchie visuelle** : Titres, sous-titres, corps de texte
- **Espacement généreux** : Lisibilité et respiration
- **Typographie cohérente** : Maximum 2 polices
- **Palette couleurs** : Alignée avec votre branding

## Stratégies de distribution gagnantes

### 1. Lead magnet haute conversion

#### Landing page optimisée
- **Headline irrésistible** : Bénéfice principal en < 8 mots
- **Sous-titre explicatif** : Détails de la promesse
- **Bullets bénéfices** : 5-7 points clés de valeur
- **Formulaire minimaliste** : Email + prénom uniquement
- **Preuve sociale** : Témoignages, logos clients

### 2. Monétisation directe

#### Plateformes de vente
- **Amazon KDP** : Portée massive, SEO Amazon
- **Site web** : Marges maximales, données clients
- **Gumroad/Podia** : Simplicité, fonctionnalités marketing
- **Marketplace spécialisés** : Audiences qualifiées

## Pourquoi Sorami révolutionne l'ebook

### IA de dernière génération
- **Modèles entraînés** : Millions d'ebooks analysés
- **Cohérence narrative** : Structure et style uniformes
- **Personnalisation** : Adaptation automatique audience
- **Fact-checking** : Vérification sources et données

### Workflow optimisé
- **Création express** : Ebook complet en 2-4 heures
- **Templates pros** : 200+ modèles sectoriels
- **Collaboration équipe** : Comments, révisions, approbations
- **Export multi-format** : PDF, EPUB, HTML automatique

## Business model et rentabilité

### Revenus directs
- **Vente unitaire** : 15-150€ selon valeur perçue
- **Abonnements** : Accès bibliothèque, mises à jour
- **Licences B2B** : Formation entreprise, white label
- **Droits dérivés** : Traductions, adaptations

### Revenus indirects
- **Lead generation** : Prospects qualifiés pour services
- **Authority building** : Tarifs consultations premium
- **Speaking engagements** : Conférences, masterclass
- **Partenariats** : Collaborations marques, influenceurs

### ROI calculations
**Investissement initial :**
- Abonnement Sorami : 15-35K F/mois
- Temps création : 20-40 heures
- Design/promotion : 50-200K F

**Retour typique 12 mois :**
- Leads générés : 500-5000 selon niche
- Ventes directes : 50-500K F
- Revenus services : 200K-2M F
- **ROI global : 300-1500%**

## Prêt à devenir auteur expert ?

L'expertise sans visibilité reste invisible. L'ebook est votre passeport vers la reconnaissance et le succès. Avec **Sorami**, votre premier bestseller est à portée de clic !

### Pack de lancement auteur
- **Premier ebook gratuit** : Test complet de la plateforme
- **Masterclass "De zéro à bestseller"** : Stratégie complète (3h)
- **Templates pros** : 50+ structures éprouvées
- **Coaching personnalisé** : Session stratégie 1h offerte

**[Créer mon premier ebook →](https://sorami.app/books)**

### Formules auteur professionnel
- **Standard (15 000 F/mois)** : 1 ebook/mois + formations
- **Créateur (35 000 F/mois)** : 5 ebooks/mois + coaching + white label

Transformez votre expertise en autorité avec **Sorami** !

---

*Prêt pour la suite ? Découvrez comment amplifier votre visibilité avec nos guides création d'images et vidéos IA.*`,
    category: "Création de contenu",
    tags: ["ebook", "rédaction IA", "publishing", "lead generation", "expertise", "Sorami"],
    metaTitle: "Créer un ebook professionnel avec l'IA : Guide complet 2025",
    metaDescription: "Maîtrisez la création d'ebooks avec l'IA. De l'idée à la publication : stratégies, outils et techniques pour créer des livres numériques qui convertissent avec Sorami.",
    metaKeywords: "création ebook IA, rédaction automatique, publishing digital, Sorami, lead magnet, marketing contenu, autorité expertise",
    status: "PUBLISHED" as const,
    published: true,
  }
];

async function createBlogArticles() {
  console.log('🚀 Création des articles de blog Sorami...');

  try {
    // Vérifier qu'on a bien un utilisateur admin pour assigner les articles
    let adminUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: 'admin@sorami.app' }
        ]
      },
    });

    if (!adminUser) {
      console.log('⚠️  Aucun utilisateur trouvé, essayons de prendre le premier utilisateur...');
      
      adminUser = await prisma.user.findFirst();
      
      if (!adminUser) {
        console.log('❌ Aucun utilisateur dans la base de données');
        return;
      }
      
      console.log('✅ Utilisateur trouvé:', adminUser.email);
    } else {
      console.log('✅ Utilisateur admin trouvé:', adminUser.email);
    }

    const authorId = adminUser.id;

    // Créer les catégories si elles n'existent pas
    const categories = ['Tutoriels', 'Marketing Vidéo', 'Création de contenu'];
    
    for (const category of categories) {
      const slug = slugify(category, { lower: true, strict: true });
      
      await prisma.blogCategory.upsert({
        where: { slug },
        update: {},
        create: {
          name: category,
          slug,
          description: `Articles de la catégorie ${category}`,
          icon: category === 'Tutoriels' ? 'BookOpen' : category === 'Marketing Vidéo' ? 'Video' : 'FileText',
          color: category === 'Tutoriels' ? '#3b82f6' : category === 'Marketing Vidéo' ? '#8b5cf6' : '#10b981',
        },
      });
    }

    console.log('✅ Catégories créées/vérifiées');

    // Créer les articles
    for (const article of blogArticles) {
      // Générer le slug à partir du titre
      let slug = slugify(article.title, { lower: true, strict: true });
      
      // Vérifier l'unicité du slug
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (existingPost) {
        console.log(`⚠️  Article avec slug "${slug}" existe déjà, on passe au suivant...`);
        continue;
      }

      // Calculer le temps de lecture (approximation : 200 mots par minute)
      const wordCount = article.content.split(/\s+/).length;
      const readingTimeMinutes = Math.ceil(wordCount / 200);

      // Créer l'article
      const post = await prisma.blogPost.create({
        data: {
          slug,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          authorId,
          category: article.category,
          tags: JSON.stringify(article.tags),
          status: article.status,
          published: article.published,
          publishedAt: article.published ? new Date() : null,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          metaKeywords: article.metaKeywords,
          readingTime: readingTimeMinutes,
          viewsCount: Math.floor(Math.random() * 1000) + 100, // Vues initiales simulées
        },
      });

      console.log(`✅ Article créé: "${post.title}" (${post.slug}) - ${readingTimeMinutes} min de lecture`);
    }

    console.log('\n🎉 Tous les articles ont été créés avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`- ${blogArticles.length} articles créés`);
    console.log(`- ${categories.length} catégories configurées`);
    console.log('- Articles optimisés SEO avec meta tags');
    console.log('- CTAs Sorami intégrés dans chaque article');
    console.log('- Temps de lecture calculé automatiquement');

  } catch (error) {
    console.error('❌ Erreur lors de la création des articles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  createBlogArticles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createBlogArticles;