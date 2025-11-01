// Script pour initialiser les pages légales de Sorami
// Exécuter avec: npx tsx scripts/init-legal-pages.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: 'terms',
    title: 'Conditions Générales d\'Utilisation (CGU)',
    metaTitle: 'CGU - Sorami',
    metaDescription: 'Conditions générales d\'utilisation de la plateforme Sorami de génération de contenu IA.',
    content: `# Conditions Générales d'Utilisation

**Dernière mise à jour : 1er novembre 2025**

## 1. Présentation de Sorami

Sorami est une plateforme SaaS de génération de contenu assistée par intelligence artificielle, permettant aux utilisateurs de créer :
- Des images haute qualité
- Des articles de blog optimisés SEO
- Des vidéos HD
- Des ebooks complets

La plateforme est accessible à l'adresse https://sorami.app

## 2. Acceptation des Conditions

En utilisant Sorami, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.

## 3. Inscription et Compte Utilisateur

### 3.1 Création de Compte
- Vous devez avoir au moins 18 ans pour utiliser Sorami
- Les informations fournies doivent être exactes et à jour
- Vous êtes responsable de la confidentialité de vos identifiants

### 3.2 Sécurité du Compte
- Vous devez choisir un mot de passe robuste
- Ne partagez jamais vos identifiants
- Informez-nous immédiatement de toute utilisation non autorisée

## 4. Plans d'Abonnement et Paiement

### 4.1 Plans Disponibles
**Plan Gratuit**
- 500 crédits d'essai
- Fonctionnalités limitées

**Plan STANDARD (15 000 F CFA/mois ou 144 000 F CFA/an)**
- 3 500 crédits/mois
- 100 images haute qualité
- 10 articles de blog optimisés SEO
- 3 vidéos HD
- Support prioritaire

**Plan CRÉATEUR (35 000 F CFA/mois ou 336 000 F CFA/an)**
- 8 000 crédits/mois
- 700 images premium
- 50 articles de blog
- 10 vidéos HD
- 5 ebooks complets
- API complète
- Support dédié 24/7

### 4.2 Paiement
- Les paiements sont traités par Paystack
- Les abonnements mensuels sont prélevés automatiquement
- Les abonnements annuels bénéficient d'une réduction de 20%
- Aucun remboursement pour les périodes non utilisées

### 4.3 Crédits
- Les crédits sont valables pendant la période d'abonnement
- Les crédits non utilisés ne sont pas reportés
- Consommation : 1 crédit = 1 image, 5 crédits = 1 article, 10 crédits = 1 vidéo

## 5. Utilisation de la Plateforme

### 5.1 Usages Autorisés
- Génération de contenu pour usage professionnel ou personnel
- Téléchargement et utilisation commerciale du contenu généré
- Partage du contenu sur vos canaux de communication

### 5.2 Usages Interdits
- Génération de contenu illégal, diffamatoire ou pornographique
- Contenu incitant à la haine ou à la violence
- Violation de droits de propriété intellectuelle
- Utilisation abusive des ressources (scraping, spam)
- Revente des crédits ou de l'accès

## 6. Propriété Intellectuelle

### 6.1 Contenu Généré
- Vous conservez tous les droits sur le contenu que vous générez
- Sorami ne revendique aucun droit sur votre contenu
- Vous êtes responsable de l'utilisation du contenu généré

### 6.2 Plateforme
- Sorami et sa technologie sont protégés par des droits d'auteur
- Vous ne pouvez pas copier, modifier ou distribuer notre code
- Le nom "Sorami" et le logo sont des marques déposées

## 7. Responsabilités et Garanties

### 7.1 Disponibilité du Service
- Nous visons une disponibilité de 99.9%
- Des maintenances programmées peuvent survenir
- Aucune garantie de disponibilité absolue

### 7.2 Qualité du Contenu
- Le contenu est généré par IA et peut nécessiter des ajustements
- Nous ne garantissons pas l'exactitude du contenu
- Vous devez vérifier le contenu avant publication

### 7.3 Limitation de Responsabilité
- Sorami n'est pas responsable des dommages indirects
- Notre responsabilité est limitée au montant payé
- Vous utilisez la plateforme à vos propres risques

## 8. Résiliation

### 8.1 Par l'Utilisateur
- Vous pouvez annuler votre abonnement à tout moment
- Accès maintenu jusqu'à la fin de la période payée
- Aucun remboursement prorata

### 8.2 Par Sorami
- Nous pouvons suspendre votre compte en cas de violation des CGU
- Résiliation immédiate pour usage frauduleux
- Remboursement au prorata en cas de résiliation injustifiée

## 9. Protection des Données

Vos données personnelles sont traitées conformément à notre [Politique de Confidentialité](/legal/privacy).

## 10. Modifications des CGU

- Nous pouvons modifier ces CGU à tout moment
- Vous serez notifié par email des modifications importantes
- L'utilisation continue vaut acceptation des nouvelles CGU

## 11. Loi Applicable et Juridiction

- Ces CGU sont régies par le droit français
- Tout litige sera soumis aux tribunaux compétents de Paris, France

## 12. Contact

Pour toute question concernant ces CGU :
- Email : support@sorami.app
- Adresse : Sorami SAS, Paris, France

---

**Date d'entrée en vigueur : 1er novembre 2025**
**Version : 1.0**
`,
    version: '1.0',
    published: true,
  },
  {
    slug: 'privacy',
    title: 'Politique de Confidentialité',
    metaTitle: 'Politique de Confidentialité - Sorami',
    metaDescription: 'Comment Sorami collecte, utilise et protège vos données personnelles.',
    content: `# Politique de Confidentialité

**Dernière mise à jour : 1er novembre 2025**

## 1. Introduction

Chez Sorami, nous attachons une grande importance à la protection de vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.

## 2. Responsable du Traitement

**Sorami SAS**
- Adresse : Paris, France
- Email : privacy@sorami.app
- Site web : https://sorami.app

## 3. Données Collectées

### 3.1 Données d'Inscription
- Nom et prénom
- Adresse email
- Mot de passe (hashé)
- Organisation/entreprise (optionnel)

### 3.2 Données d'Utilisation
- Crédits consommés
- Contenus générés (images, articles, vidéos)
- Historique des transactions
- Logs de connexion et d'activité

### 3.3 Données de Paiement
- Informations de facturation (via Paystack)
- Historique des paiements
- Méthode de paiement (tokenisée)

### 3.4 Données Techniques
- Adresse IP
- Type de navigateur et système d'exploitation
- Données de cookies
- Analytiques d'utilisation

## 4. Base Légale du Traitement

Nous traitons vos données sur les bases légales suivantes :
- **Contrat** : pour fournir nos services
- **Consentement** : pour les communications marketing
- **Intérêt légitime** : pour améliorer nos services
- **Obligation légale** : pour la comptabilité et la fiscalité

## 5. Utilisation des Données

### 5.1 Fourniture du Service
- Gestion de votre compte utilisateur
- Génération de contenu IA
- Traitement des paiements
- Support client

### 5.2 Amélioration du Service
- Analyse des usages
- Développement de nouvelles fonctionnalités
- Optimisation des performances
- Détection et prévention de la fraude

### 5.3 Communications
- Emails transactionnels (factures, confirmations)
- Notifications de service
- Newsletter (avec consentement)
- Offres promotionnelles (avec consentement)

## 6. Partage des Données

### 6.1 Prestataires de Services
- **Clerk** : authentification des utilisateurs
- **Paystack** : traitement des paiements
- **AWS S3** : stockage des fichiers
- **Backend CrewAI** : génération de contenu IA

### 6.2 Obligations Légales
- Autorités judiciaires (sur réquisition)
- Administrations fiscales
- Organismes de régulation

### 6.3 Pas de Vente de Données
Nous ne vendons jamais vos données personnelles à des tiers.

## 7. Durée de Conservation

- **Compte actif** : pendant toute la durée de votre abonnement
- **Après résiliation** : 1 an pour les données de facturation
- **Données de contenu** : 30 jours après suppression
- **Logs** : 12 mois maximum

## 8. Vos Droits (RGPD)

### 8.1 Droit d'Accès
Vous pouvez demander une copie de vos données personnelles.

### 8.2 Droit de Rectification
Vous pouvez corriger vos informations inexactes.

### 8.3 Droit à l'Effacement
Vous pouvez demander la suppression de vos données.

### 8.4 Droit à la Portabilité
Vous pouvez récupérer vos données dans un format structuré.

### 8.5 Droit d'Opposition
Vous pouvez vous opposer au traitement de vos données.

### 8.6 Droit de Limitation
Vous pouvez demander la limitation du traitement.

**Pour exercer vos droits** : privacy@sorami.app

## 9. Sécurité des Données

### 9.1 Mesures Techniques
- Chiffrement SSL/TLS
- Hashage des mots de passe (bcrypt)
- Pare-feu et protection DDoS
- Sauvegardes régulières

### 9.2 Mesures Organisationnelles
- Accès restreint aux données
- Formation du personnel
- Audit de sécurité régulier
- Plan de réponse aux incidents

## 10. Transferts Internationaux

Vos données peuvent être transférées hors de l'UE :
- **AWS S3** : Suède (eu-north-1) - Clauses contractuelles types
- **Paystack** : Nigeria - Garanties adéquates

## 11. Cookies et Technologies Similaires

### 11.1 Cookies Essentiels
- Session utilisateur
- Authentification
- Préférences de langue

### 11.2 Cookies Analytiques
- Google Analytics (anonymisé)
- Analyse des performances

### 11.3 Gestion des Cookies
Vous pouvez gérer vos préférences dans votre navigateur.

## 12. Mineurs

Sorami est réservé aux personnes de 18 ans et plus. Nous ne collectons pas consciemment de données de mineurs.

## 13. Modifications de la Politique

- Nous pouvons modifier cette politique à tout moment
- Vous serez notifié des changements importants
- Date de dernière mise à jour indiquée en haut de page

## 14. Réclamations

Vous pouvez déposer une réclamation auprès de la CNIL :
- **Site web** : https://www.cnil.fr
- **Adresse** : 3 Place de Fontenoy, 75007 Paris

## 15. Contact

Pour toute question sur cette politique :
- **Email** : privacy@sorami.app
- **Courrier** : Sorami SAS, Paris, France

---

**Version : 1.0**
**Date d'entrée en vigueur : 1er novembre 2025**
`,
    version: '1.0',
    published: true,
  },
  {
    slug: 'cookies',
    title: 'Politique relative aux Cookies',
    metaTitle: 'Politique Cookies - Sorami',
    metaDescription: 'Comment Sorami utilise les cookies et comment les gérer.',
    content: `# Politique relative aux Cookies

**Dernière mise à jour : 1er novembre 2025**

## 1. Qu'est-ce qu'un Cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur un site web. Les cookies permettent au site de mémoriser vos actions et préférences.

## 2. Cookies Utilisés par Sorami

### 2.1 Cookies Strictement Nécessaires
Ces cookies sont essentiels au fonctionnement de la plateforme.

| Cookie | Durée | Objectif |
|--------|-------|----------|
| \`session\` | Session | Authentification utilisateur |
| \`csrf_token\` | Session | Protection CSRF |
| \`lang\` | 1 an | Préférence de langue |

**Base légale** : Intérêt légitime (pas de consentement requis)

### 2.2 Cookies de Performance
Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.

| Cookie | Durée | Objectif |
|--------|-------|----------|
| \`_ga\` | 2 ans | Google Analytics - visiteurs uniques |
| \`_ga_*\` | 2 ans | Google Analytics - état de session |
| \`_gid\` | 24h | Google Analytics - distinguer les utilisateurs |

**Base légale** : Consentement

### 2.3 Cookies Fonctionnels
Ces cookies améliorent l'expérience utilisateur.

| Cookie | Durée | Objectif |
|--------|-------|----------|
| \`theme\` | 1 an | Thème d'affichage (clair/sombre) |
| \`sidebar_collapsed\` | 1 an | État de la sidebar |
| \`recent_searches\` | 30 jours | Historique de recherches |

**Base légale** : Consentement

### 2.4 Cookies Marketing
Actuellement, Sorami n'utilise **aucun cookie marketing** ou de ciblage publicitaire.

## 3. Cookies Tiers

### 3.1 Clerk (Authentification)
- **Objectif** : Gestion sécurisée des sessions utilisateur
- **Cookies** : \`__clerk_*\`
- **Politique** : https://clerk.com/privacy

### 3.2 Paystack (Paiements)
- **Objectif** : Traitement sécurisé des paiements
- **Cookies** : \`paystack_*\`
- **Politique** : https://paystack.com/privacy

### 3.3 Google Analytics
- **Objectif** : Analyse d'audience
- **Cookies** : \`_ga\`, \`_gid\`, \`_gat\`
- **Politique** : https://policies.google.com/privacy

## 4. Gestion de vos Préférences

### 4.1 Paramètres du Navigateur
Vous pouvez configurer votre navigateur pour :
- Bloquer tous les cookies
- N'accepter que les cookies de première partie
- Supprimer les cookies existants

**Chrome** : Paramètres > Confidentialité et sécurité > Cookies
**Firefox** : Préférences > Vie privée et sécurité > Cookies
**Safari** : Préférences > Confidentialité > Cookies
**Edge** : Paramètres > Confidentialité > Cookies

### 4.2 Outils de Contrôle
- **Google Analytics Opt-out** : https://tools.google.com/dlpage/gaoptout

### 4.3 Conséquences du Refus
Si vous refusez les cookies :
- ✅ Vous pouvez toujours utiliser Sorami
- ❌ Certaines fonctionnalités peuvent être limitées
- ❌ Nous ne pourrons pas mémoriser vos préférences

## 5. Durée de Conservation

- **Cookies de session** : Supprimés à la fermeture du navigateur
- **Cookies persistants** : Selon la durée indiquée dans les tableaux ci-dessus
- **Suppression manuelle** : Possible à tout moment via votre navigateur

## 6. Mises à Jour de cette Politique

Cette politique peut être mise à jour pour refléter :
- Évolution de nos services
- Changements réglementaires
- Nouvelles technologies

La date de dernière mise à jour est indiquée en haut de la page.

## 7. Cookies et Vie Privée

Pour plus d'informations sur la protection de vos données personnelles, consultez notre [Politique de Confidentialité](/legal/privacy).

## 8. Vos Droits

Conformément au RGPD, vous disposez de droits sur vos données, y compris celles collectées via les cookies. Consultez notre [Politique de Confidentialité](/legal/privacy) pour en savoir plus.

## 9. Contact

Pour toute question concernant notre utilisation des cookies :
- **Email** : cookies@sorami.app
- **Support** : https://sorami.app/support

---

**Version : 1.0**
**Date d'entrée en vigueur : 1er novembre 2025**
`,
    version: '1.0',
    published: true,
  },
];

async function initializeLegalPages() {
  console.log('🚀 Initialisation des pages légales...\n');

  for (const pageData of legalPages) {
    try {
      const page = await prisma.legalPage.upsert({
        where: { slug: pageData.slug },
        update: {
          ...pageData,
          publishedAt: new Date(),
        },
        create: {
          ...pageData,
          publishedAt: new Date(),
        },
      });

      console.log(`✅ Page "${page.title}" créée/mise à jour`);
      console.log(`   - Slug: ${page.slug}`);
      console.log(`   - Version: ${page.version}`);
      console.log(`   - Publié: ${page.published ? 'Oui' : 'Non'}\n`);
    } catch (error) {
      console.error(`❌ Erreur pour la page "${pageData.slug}":`, error);
    }
  }

  console.log('✨ Initialisation terminée !\n');
  console.log('📄 Pages accessibles sur :');
  console.log('   - https://sorami.app/legal/terms');
  console.log('   - https://sorami.app/legal/privacy');
  console.log('   - https://sorami.app/legal/cookies');

  await prisma.$disconnect();
}

initializeLegalPages().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
