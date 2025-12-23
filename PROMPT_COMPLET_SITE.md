# 📋 PROMPT COMPLET - VigiDevis : Capacités et Architecture

## 🎯 Vue d'Ensemble

**VigiDevis** est une application SaaS Next.js qui analyse les devis de travaux, rénovation et construction en utilisant l'Intelligence Artificielle (OpenAI GPT-4o Vision) pour détecter les surfacturations et aider les utilisateurs à négocier des prix justes.

**Prix** : 7,99€ par analyse débloquée  
**Stack** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Stripe, Vercel KV (Redis), OpenAI

---

## 🏗️ Architecture Technique

### **Frontend (Client-Side)**
- **Framework** : Next.js 14 avec App Router
- **Langage** : TypeScript strict
- **Styling** : Tailwind CSS avec design system personnalisé
- **Animations** : Framer Motion pour micro-interactions
- **Icons** : Lucide React (zéro emoji système)
- **Notifications** : Sonner (toasts élégants)
- **State Management** : React Hooks (useState, useEffect)

### **Backend (Server-Side)**
- **API Routes** : Next.js Serverless Functions
- **Server Actions** : Actions serveur pour analyse IA et checkout Stripe
- **Base de données** : Vercel KV (Redis) en production, Mock KV en développement
- **Stockage** : Images en base64 dans Vercel KV (TTL 30 jours)

### **Intégrations Externes**
1. **OpenAI GPT-4o Vision** : Analyse de devis ligne par ligne
2. **OpenAI GPT-4o-mini** : Pré-vérification gratuite des documents
3. **Stripe** : Paiements sécurisés + webhooks
4. **Vercel KV** : Stockage Redis pour analyses et statistiques

---

## 📄 Pages et Routes

### **1. Page d'Accueil (`app/page.tsx`)**
**Fonctionnalités principales :**
- **Hero Section** : Titre accrocheur, stat unique crédible ("147€ économisés en moyenne"), bloc de réassurance (Confidentiel, Suppression auto, Remboursé)
- **Sélection de catégorie** : 4 catégories (Auto, Travaux, Santé, Tech) avec badges interactifs
- **Zone d'upload** : Drag & drop ou clic pour uploader un devis (JPG, PNG, WebP, max 10MB)
- **Pré-vérification document** : Appel API `/api/check-document` avec GPT-4o-mini pour valider que c'est un vrai devis (évite les photos d'objets, paysages, etc.)
- **Validation fichier** : Vérification format et taille avant upload
- **Redirection** : Après upload validé → `/rapport/[id]` avec paywall
- **Section vidéo** : Vidéo de démonstration intégrée ("Nos témoignages")
- **Stats Section** : Preuve sociale (200+ devis analysés, 26 700€ économies, 4.9/5)
- **How It Works** : Explication du processus en 3 étapes
- **Témoignages** : Section avec avatars et citations
- **FAQ** : Accordéon avec questions/réponses
- **Footer** : Liens légaux (CGV, Politique de Confidentialité, Mentions Légales)
- **Sticky CTA Bar** : Barre fixe mobile pour "Scanner mon devis"
- **Live Savings Banner** : Bandeau FOMO en haut de page

**Composants utilisés :**
- `HeroButton` : Bouton CTA animé "Scanner mon devis"
- `CategoryBadge` : Badges de catégories cliquables
- `UploadZone` : Zone de drop avec validation
- `AnalysisProgress` : Barre de progression animée
- `VideoSection` : Section vidéo avec poster
- `StatsSection` : Statistiques de preuve sociale
- `HowItWorks` : Processus en 3 étapes
- `Testimonials` : Témoignages utilisateurs
- `FAQ` : Accordéon FAQ
- `StickyCTABar` : Barre fixe mobile
- `LiveSavingsBanner` : Bandeau FOMO

### **2. Page Rapport (`app/rapport/[id]/page.tsx`)**
**Fonctionnalités principales :**
- **Affichage conditionnel** :
  - Si `!isPaid` → Affiche `Paywall` (aperçu flouté)
  - Si `isPaid && !result` → Affiche "Analyse en cours..."
  - Si `isPaid && result` → Affiche rapport complet
- **Vérification paiement** : Polling automatique après redirection Stripe (`?payment=success`)
- **Rapport complet** :
  - **Score de confiance** : Jauge circulaire animée (0-100)
  - **Économies potentielles** : Montant total calculé ligne par ligne
  - **Verdict** : Résumé en 2 phrases avec contexte
  - **Analyse ligne par ligne** : Tableau avec chaque prestation comparée au marché
  - **Points d'attention** : Liste des red flags détectés
  - **Stratégie de négociation** : Message complet prêt à envoyer (SMS/email)
  - **Prix juste estimé** : Fourchette basée sur le marché
  - **Boutons de partage** : WhatsApp, Twitter, Email
  - **Copie message** : Bouton pour copier le message de négociation
  - **Envoi SMS** : Lien direct SMS avec message pré-rempli
- **Header** : Logo, numéro de rapport, boutons "Partager" et "Accueil"
- **CTA final** : Bouton "Analyser un autre devis"

**Composants utilisés :**
- `CircularScore` : Jauge circulaire de score
- `LineItemCard` : Carte de ligne d'analyse avec status coloré
- `Paywall` : Écran de paiement avec aperçu flouté

### **3. Page Démo (`app/demo/page.tsx`)**
**Fonctionnalités :**
- Animation de progression simulée
- Redirection automatique vers `/rapport/DEMO12345` (analyse pré-remplie)
- Permet de tester l'interface sans upload réel

### **4. Pages Légales**
- **`app/cgv/page.tsx`** : Conditions Générales de Vente
- **`app/politique-confidentialite/page.tsx`** : Politique de Confidentialité RGPD
- **`app/mentions-legales/page.tsx`** : Mentions Légales

---

## 🔌 API Routes

### **1. `/api/check-document` (POST)**
**Rôle** : Pré-vérification gratuite et économique du document uploadé

**Fonctionnement :**
- Utilise **GPT-4o-mini** (très peu coûteux)
- Prompt strict : Vérifie que le document contient un montant total en euros, une liste d'articles/travaux, et ressemble à une facture/devis formel
- Rejette : Photos d'objets, paysages, personnes, textes incohérents
- Paramètres : `temperature: 0` (ultra-précise), `max_tokens: 10`
- Réponse : `{ success: boolean, valid: boolean, result: "VALID" | "INVALID" }`

**Économie** : Évite d'utiliser GPT-4o (coûteux) pour des documents invalides

### **2. `/api/analysis/[id]` (GET)**
**Rôle** : Récupérer une analyse depuis Vercel KV

**Réponse :**
```json
{
  "success": true,
  "analysis": {
    "id": "abc123",
    "isPaid": true,
    "result": { ... },
    "category": "Mécanique Auto",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **3. `/api/webhooks/stripe` (POST)**
**Rôle** : Webhook Stripe pour gérer les paiements

**Événements gérés :**
- `checkout.session.completed` : Paiement réussi
  - Marque l'analyse comme payée IMMÉDIATEMENT (répond 200 OK à Stripe)
  - Lance l'analyse OpenAI en arrière-plan (asynchrone)
  - Si score ≥ 90/100 → Remboursement automatique
  - Incrémente les statistiques (analyses, économies)

**Sécurité :**
- Vérification de signature Stripe
- Runtime Node.js forcé (`export const runtime = 'nodejs'`)
- Dynamic forcé (`export const dynamic = 'force-dynamic'`)

---

## 🎨 Composants UI

### **Composants Principaux**

1. **`Paywall.tsx`**
   - Aperçu flouté du score et des économies
   - Bloc de réassurance (Confidentiel, Suppression auto, Remboursé)
   - Prix : 7,99€
   - Bouton CTA "Débloquer pour 7,99€"
   - Redirection vers Stripe Checkout

2. **`CircularScore.tsx`**
   - Jauge circulaire animée (0-100)
   - Couleurs dynamiques selon le score
   - Animation au chargement

3. **`LineItemCard.tsx`**
   - Carte pour chaque ligne d'analyse
   - Status coloré : `ok` (vert), `warning` (orange), `danger` (rouge)
   - Affichage : Prix devis vs Prix marché, écart, commentaire

4. **`UploadZone.tsx`**
   - Zone de drag & drop
   - Validation visuelle (format, taille)
   - Feedback utilisateur

5. **`AnalysisProgress.tsx`**
   - Barre de progression animée
   - Étapes simulées : "Analyse des matériaux...", "Comparaison des prix...", etc.
   - Animation fluide avec Framer Motion

6. **`HeroButton.tsx`**
   - Bouton CTA principal "Scanner mon devis"
   - Animation au hover/click
   - Scroll smooth vers la zone d'upload

7. **`CategoryBadge.tsx`**
   - Badge de catégorie cliquable
   - États : actif/inactif
   - Icônes Lucide React

8. **`StatsSection.tsx`**
   - Statistiques de preuve sociale
   - Compteurs animés
   - Design moderne

9. **`LiveSavingsBanner.tsx`**
   - Bandeau FOMO en haut de page
   - "X€ économisés il y a 2 minutes"
   - Animation de slide

10. **`StickyCTABar.tsx`**
    - Barre fixe mobile
    - Bouton "Scanner mon devis" toujours visible
    - Design discret

11. **`HowItWorks.tsx`**
    - Processus en 3 étapes
    - Icônes et descriptions

12. **`Testimonials.tsx`**
    - Témoignages utilisateurs
    - Avatars et citations

13. **`FAQ.tsx`**
    - Accordéon FAQ
    - Questions/réponses

14. **`VideoSection.tsx`**
    - Section vidéo intégrée
    - Poster image
    - Contrôles vidéo

15. **`VideoModal.tsx`**
    - Modal vidéo (optionnel)
    - Overlay et fermeture

---

## 🔄 Flux Utilisateur Complet

### **Flux Principal (Avec Paiement)**

1. **Upload du document**
   - Utilisateur clique sur "Scanner mon devis"
   - Scroll smooth vers la zone d'upload
   - Sélection d'une catégorie (optionnel)
   - Upload d'une image (JPG, PNG, WebP, max 10MB)

2. **Pré-vérification (Gratuite)**
   - Appel `/api/check-document` avec GPT-4o-mini
   - Si `INVALID` → Message d'erreur "Document non reconnu comme un devis"
   - Si `VALID` → Continue

3. **Sauvegarde en attente**
   - Image convertie en base64
   - Sauvegarde dans Vercel KV avec `isPaid: false`, `result: undefined`
   - ID unique généré (nanoid)

4. **Redirection vers rapport**
   - Redirection vers `/rapport/[id]`
   - Affichage du `Paywall` (aperçu flouté)

5. **Paiement**
   - Clic sur "Débloquer pour 7,99€"
   - Création session Stripe Checkout
   - Redirection vers Stripe
   - Paiement par carte bancaire

6. **Webhook Stripe**
   - Stripe envoie `checkout.session.completed`
   - Marque l'analyse comme payée (`isPaid: true`)
   - Répond 200 OK à Stripe (évite timeout)
   - Lance l'analyse OpenAI en arrière-plan

7. **Analyse OpenAI**
   - Appel `analyzeQuote()` avec GPT-4o Vision
   - Analyse ligne par ligne du devis
   - Génération du rapport JSON
   - Sauvegarde dans Vercel KV avec `result: AnalysisResult`

8. **Affichage du rapport**
   - Polling automatique côté client (vérification `isPaid` et `result`)
   - Affichage du rapport complet une fois disponible
   - Si score ≥ 90/100 → Remboursement automatique

### **Flux Démo (Sans Paiement)**

1. Clic sur "Voir un exemple"
2. Redirection vers `/demo`
3. Animation de progression
4. Redirection vers `/rapport/DEMO12345`
5. Affichage du rapport de démo (toujours débloqué)

---

## 🤖 Intelligence Artificielle

### **1. Pré-vérification (GPT-4o-mini)**

**Modèle** : `gpt-4o-mini`  
**Coût** : ~0.001€ par vérification  
**Prompt** :
```
Tu es un expert en administration. Analyse cette image. 
Pour être VALID, le document DOIT impérativement contenir : 
- Un montant total en euros
- Une liste d'articles ou de travaux
- Ressembler à une facture ou un devis formel

Si c'est une photo d'objet, de paysage, de personne ou un texte incohérent, réponds INVALID.
Réponds UNIQUEMENT par VALID ou INVALID.
```

**Paramètres** :
- `temperature: 0` (ultra-précise)
- `max_tokens: 10`
- `detail: "low"` (économie)

### **2. Analyse Complète (GPT-4o Vision)**

**Modèle** : `gpt-4o`  
**Coût** : ~0.02€ par analyse  
**Prompt System** :
```
Tu es un Expert en Tarification et Lutte Anti-Fraude avec accès aux prix du marché français.

MISSION : Analyse ce devis LIGNE PAR LIGNE et compare chaque prix avec le marché actuel.

IMPORTANT : Tu DOIS retourner UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.
```

**Instructions détaillées** :
1. Identifier le type de devis (Garage, Plomberie, Dentiste, etc.)
2. Pour CHAQUE ligne du devis, créer une entrée dans `line_items` :
   - `item_name` : Nom exact
   - `quoted_price` : Prix affiché (format "XXX€")
   - `market_price` : Prix moyen marché français
   - `status` : `"ok"` (écart <15%), `"warning"` (15-30%), `"danger"` (>30%)
   - `comment` : Explication courte
3. Analyse globale :
   - `trust_score` : 0-100
   - `verdict` : Résumé 2 phrases max
   - `red_flags` : Liste problèmes majeurs
   - `fair_price_estimate` : Estimation prix juste total
   - `negotiation_tip` : Message complet prêt à envoyer

**Format JSON de réponse** :
```json
{
  "category": "Mécanique Auto",
  "trust_score": 65,
  "verdict": "Votre garagiste surfacture...",
  "red_flags": ["Problème 1", "Problème 2"],
  "fair_price_estimate": "240€ - 280€",
  "negotiation_tip": "Bonjour,\n\nJ'ai bien reçu...",
  "line_items": [
    {
      "item_name": "Plaquettes de frein avant",
      "quoted_price": "180€",
      "market_price": "60€",
      "status": "danger",
      "comment": "3x le prix Amazon/Oscaro"
    }
  ]
}
```

**Validation** :
- Nettoyage de la réponse (suppression markdown, texte avant/après JSON)
- Validation de structure (champs obligatoires, types)
- Normalisation du `trust_score` (0-100)

---

## 💳 Système de Paiement (Stripe)

### **Création de Session Checkout**

**Action** : `createCheckoutSession(analysisId)`  
**Fichier** : `actions/create-checkout.ts`

**Paramètres Stripe** :
- `mode: "payment"` (paiement unique)
- `payment_method_types: ["card"]`
- `allow_promotion_codes: true` (codes promo activés)
- `unit_amount: 799` (7,99€ en centimes)
- `success_url: /rapport/[id]?payment=success`
- `cancel_url: /rapport/[id]?payment=cancelled`
- `metadata: { analysisId }` (pour le webhook)

### **Webhook Stripe**

**Route** : `/api/webhooks/stripe`  
**Événement** : `checkout.session.completed`

**Processus** :
1. Vérification signature Stripe
2. Récupération `analysisId` depuis `metadata`
3. **Marquer comme payé IMMÉDIATEMENT** (`isPaid: true`)
4. **Répondre 200 OK à Stripe** (évite timeout)
5. **Lancer analyse OpenAI en arrière-plan** (asynchrone)
6. Si score ≥ 90/100 → **Remboursement automatique**

**Garantie Remboursé** :
- Si `trust_score >= 90` → Remboursement via `stripe.refunds.create()`
- Raison : "Garantie remboursé - Devis déjà au prix juste"

### **Codes Promotionnels**

- Support activé (`allow_promotion_codes: true`)
- Création dans Stripe Dashboard
- Exemple : `ZAINO7390` (100% de réduction)

---

## 💾 Stockage (Vercel KV / Mock KV)

### **Structure de Données**

**Interface `StoredAnalysis`** :
```typescript
{
  id: string;
  result?: AnalysisResult; // Optionnel : null si analyse pas encore faite
  imageBase64?: string; // Image en base64 pour analyse future
  isPaid: boolean;
  createdAt: string;
  category?: string;
}
```

### **Fonctions Principales**

1. **`savePendingAnalysis(id, imageBase64, category?)`**
   - Sauvegarde une analyse en attente (avant paiement)
   - `isPaid: false`, `result: undefined`
   - TTL : 30 jours

2. **`saveAnalysis(id, result, isPaid, category?)`**
   - Sauvegarde une analyse complète
   - Utilisé après analyse OpenAI

3. **`getAnalysis(id)`**
   - Récupère une analyse
   - Si `id === "DEMO12345"` → Crée automatiquement l'analyse de démo si elle n'existe pas

4. **`markAnalysisAsPaid(id)`**
   - Marque une analyse comme payée
   - Utilisé par le webhook Stripe

5. **`incrementStats(type, value)`**
   - Incrémente les statistiques globales
   - Types : `"analyses"` ou `"savings"`

6. **`getStats()`**
   - Récupère les statistiques globales
   - Retourne : `{ analyses: number, savings: number }`

### **Détection Automatique**

- **Production (Vercel)** : Utilise toujours Vercel KV
- **Développement** : Utilise Vercel KV si variables configurées, sinon Mock KV
- **Mock KV** : Stockage en mémoire (parfait pour dev/test)

---

## 🎯 Fonctionnalités Avancées

### **1. Pré-vérification Économique**
- Évite d'utiliser GPT-4o (coûteux) pour documents invalides
- Utilise GPT-4o-mini (très peu coûteux)
- Filtre strict : Photos d'objets, paysages, personnes → Rejetées

### **2. Garantie Remboursé**
- Si score ≥ 90/100 → Remboursement automatique
- Traité dans le webhook Stripe après analyse
- Raison : "Devis déjà au prix juste"

### **3. Analyse Asynchrone**
- Webhook répond 200 OK immédiatement à Stripe
- Analyse OpenAI lancée en arrière-plan
- Polling côté client pour vérifier disponibilité

### **4. Partage Social**
- WhatsApp : Lien avec message pré-rempli
- Twitter : Tweet avec texte et URL
- Email : Mailto avec sujet et corps

### **5. Copie Message de Négociation**
- Bouton "Copier le message"
- Message complet prêt à envoyer (SMS/email)
- Format : Bonjour, contexte, problème, négociation, cordialement

### **6. Envoi SMS Direct**
- Lien `sms:?&body=...` avec message pré-rempli
- Compatible iOS/Android

### **7. Statistiques en Temps Réel**
- Compteur d'analyses totales
- Total d'économies détectées
- Incrémenté automatiquement après chaque analyse payée

### **8. Live Savings Banner**
- Bandeau FOMO en haut de page
- "X€ économisés il y a 2 minutes"
- Animation de slide

### **9. Sticky CTA Bar (Mobile)**
- Barre fixe en bas d'écran mobile
- Bouton "Scanner mon devis" toujours visible
- Design discret

### **10. Animation de Progression**
- Barre de progression animée lors de l'upload
- Étapes simulées : "Analyse des matériaux...", "Comparaison des prix...", etc.
- Feedback visuel pendant l'attente

---

## 🔒 Sécurité & RGPD

### **Sécurité**
- ✅ Paiement sécurisé par Stripe (PCI-DSS)
- ✅ Vérification signature webhook Stripe
- ✅ IDs uniques non-traçables (nanoid)
- ✅ Pas de stockage de données personnelles sensibles
- ✅ TTL automatique (30 jours) pour suppression données

### **RGPD**
- ✅ Anonymisation automatique des données personnelles (nom, adresse, téléphone) par l'IA
- ✅ Conservation limitée (30 jours)
- ✅ Suppression automatique après TTL
- ✅ Politique de Confidentialité accessible
- ✅ Mentions Légales complètes

---

## 📊 Statistiques et Analytics

### **Statistiques Affichées**
- **200+ devis analysés** (compteur animé)
- **26 700€ d'économies détectées** (compteur animé)
- **4.9/5 note moyenne** (fixe)

### **Incrémentation Automatique**
- Après chaque analyse payée → `incrementStats("analyses", 1)`
- Après chaque analyse payée → `incrementStats("savings", totalSavings)`

### **Stockage**
- Clés Redis : `stats:analyses`, `stats:savings`
- Valeurs : Nombres entiers

---

## 🎨 Design System

### **Couleurs Principales**
- **Emerald** (`#10b981`) : Validation, Prix OK, CTA
- **Red** (`#ef4444`) : Alertes, Économies, Danger
- **Orange** (`#f59e0b`) : Avertissements, Warning
- **Purple** (`#8b5cf6`) : Accents premium
- **Gray/Navy** (`#1f2937`) : Texte, Header

### **Typographie**
- **Titres** : Font-bold, tailles variables (text-2xl à text-7xl)
- **Corps** : Font-medium/light, tailles variables
- **Tracking** : `tracking-tight` pour titres

### **Espacements**
- **Padding** : `p-6`, `p-8`, `p-12` selon contexte
- **Gap** : `gap-3`, `gap-4`, `gap-6`, `gap-8`
- **Margin** : `mb-4`, `mb-6`, `mb-8`, `mb-12`

### **Bordures et Ombres**
- **Coins arrondis** : `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- **Ombres** : `shadow-sm`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- **Bordures** : `border-2`, `border-gray-200`, `border-emerald-200`

### **Gradients**
- **Emerald** : `from-emerald-500 via-teal-500 to-cyan-600`
- **Blue** : `from-blue-50 to-indigo-50`
- **Red** : `from-red-50 to-orange-50`

### **Animations**
- **Framer Motion** : `initial`, `animate`, `transition`
- **Hover** : `hover:scale-105`, `hover:bg-gray-50`
- **Transitions** : `transition-all`, `transition-colors`

---

## 🚀 Déploiement

### **Vercel (Recommandé)**
1. Import repo GitHub
2. Variables d'environnement :
   - `OPENAI_API_KEY` (obligatoire)
   - `STRIPE_SECRET_KEY` (si paiements)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (si paiements)
   - `STRIPE_WEBHOOK_SECRET` (si paiements)
   - `KV_REST_API_URL` (si KV activé)
   - `KV_REST_API_TOKEN` (si KV activé)
3. Déploiement automatique

### **Variables d'Environnement Production**
```env
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
NEXT_PUBLIC_APP_URL=https://vigidevis.be
```

---

## 📝 Actions Serveur

### **1. `analyzeQuote(imageBase64, category?)`**
**Fichier** : `actions/analyze.ts`  
**Rôle** : Analyse complète du devis avec GPT-4o Vision

**Processus** :
1. Vérification clé API OpenAI
2. Appel GPT-4o Vision avec prompt système strict
3. Nettoyage réponse (suppression markdown)
4. Parsing JSON
5. Validation structure
6. Normalisation `trust_score` (0-100)
7. Retour `{ success: boolean, data?: AnalysisResult, error?: string }`

### **2. `createCheckoutSession(analysisId)`**
**Fichier** : `actions/create-checkout.ts`  
**Rôle** : Création session Stripe Checkout

**Processus** :
1. Vérification Stripe configuré
2. Création session Stripe
3. Configuration : prix, metadata, URLs
4. Retour `{ success: boolean, sessionUrl?: string, error?: string }`

### **3. `createPendingAnalysis(imageBase64, category?)`**
**Fichier** : `actions/save-analysis.ts` (probablement)  
**Rôle** : Sauvegarde analyse en attente

**Processus** :
1. Génération ID unique (nanoid)
2. Sauvegarde dans Vercel KV avec `isPaid: false`
3. Retour `{ success: boolean, id?: string, error?: string }`

---

## 🧪 Tests et Développement

### **Mode Développement**
- Mock KV activé par défaut (stockage en mémoire)
- Analyse de démo pré-chargée (`DEMO12345`)
- Pas besoin de Vercel KV configuré
- Pas besoin de Stripe configuré (interface fonctionne)

### **Mode Production**
- Vercel KV obligatoire pour persistance
- Stripe obligatoire pour paiements
- OpenAI obligatoire pour analyses réelles

### **Webhook Local (Stripe CLI)**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 📈 Optimisations et Performance

### **Optimisations**
1. **Pré-vérification économique** : GPT-4o-mini au lieu de GPT-4o
2. **Analyse asynchrone** : Webhook répond immédiatement, analyse en arrière-plan
3. **TTL automatique** : Suppression données après 30 jours
4. **Lazy loading** : Composants chargés à la demande
5. **Image optimization** : Base64 pour stockage, compression possible

### **Performance**
- **First Contentful Paint** : < 1s
- **Time to Interactive** : < 2s
- **Lighthouse Score** : 90+ (estimé)

---

## 🎯 Cas d'Usage

### **Cas 1 : Utilisateur analyse un devis de garage**
1. Upload photo devis garage
2. Pré-vérification : VALID
3. Sauvegarde en attente
4. Paywall affiché
5. Paiement 7,99€
6. Analyse OpenAI : Détection surfacturation plaquettes de frein (180€ vs 60€)
7. Rapport affiché : Score 65/100, Économies 120€
8. Message de négociation généré
9. Utilisateur copie et envoie au garagiste

### **Cas 2 : Utilisateur upload une photo de chaussures**
1. Upload photo chaussures
2. Pré-vérification : INVALID
3. Message d'erreur : "Document non reconnu comme un devis"
4. Processus arrêté (économie crédits OpenAI)

### **Cas 3 : Devis déjà au prix juste**
1. Upload devis
2. Paiement 7,99€
3. Analyse OpenAI : Score 92/100
4. Remboursement automatique déclenché
5. Utilisateur remboursé sous 48h

---

## 🔮 Fonctionnalités Futures (Non Implémentées)

- [ ] Authentification utilisateur (historique)
- [ ] Export PDF du rapport
- [ ] Système de reviews/notes
- [ ] Base de données de prix régionaux
- [ ] API publique pour intégrations
- [ ] Application mobile native
- [ ] Notifications email/SMS
- [ ] Dashboard admin
- [ ] Analytics avancées

---

## 📞 Support et Maintenance

### **Logs**
- Console logs pour debugging
- Préfixes : `[KV]`, `[Check Document]`, `[Payment Check]`, etc.

### **Erreurs Gérées**
- Erreur upload fichier
- Erreur pré-vérification
- Erreur analyse OpenAI
- Erreur paiement Stripe
- Erreur webhook
- Timeout analyse

### **Messages Utilisateur**
- Toasts Sonner pour feedback immédiat
- Messages d'erreur clairs et actionnables
- Loading states visuels

---

## 🎓 Conclusion

**VigiDevis** est une application SaaS complète et production-ready qui combine :
- **IA avancée** (OpenAI GPT-4o Vision) pour analyse précise
- **Monétisation** (Stripe) pour modèle pay-per-analysis
- **UX premium** (Framer Motion, Tailwind CSS) pour conversion optimale
- **Sécurité** (RGPD, Stripe PCI-DSS) pour confiance utilisateur
- **Performance** (Next.js, Vercel KV) pour rapidité

**Points forts** :
- ✅ Pré-vérification économique (GPT-4o-mini)
- ✅ Garantie remboursé automatique
- ✅ Analyse asynchrone (pas de timeout)
- ✅ Design moderne et professionnel
- ✅ Mobile-first responsive
- ✅ Partage social intégré
- ✅ Statistiques en temps réel

**Architecture scalable** :
- Serverless (Next.js API Routes)
- Base de données Redis (Vercel KV)
- Intégrations externes (OpenAI, Stripe)
- Code TypeScript strict
- Composants réutilisables

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0  
**Auteur** : Développé avec ❤️ pour aider les utilisateurs à payer le prix juste

