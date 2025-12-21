# VigiDevis 🛡️

**Payez enfin le prix juste.**

Une application web SaaS qui analyse vos devis **ligne par ligne** en 3 secondes grâce à l'IA et vous révèle exactement où économiser.

## 🚀 Fonctionnalités

### 🔍 Analyse IA Détaillée
- **Scan ligne par ligne** : Chaque prix du devis comparé au marché en temps réel
- **Score de confiance** : Note de 0 à 100 avec jauge circulaire animée
- **Détection d'anomalies** : Status coloré (✓ Prix Juste / ⚠ À Surveiller / ! Trop Cher)
- **Calcul d'économies** : Montant exact économisable sur chaque ligne
- **Sources fiables** : Amazon, Oscaro, Leroy Merlin, Tarifs conventionnés 2024

### 💰 Monétisation
- **Modèle pay-per-analysis** : 7,99€ par rapport débloqué
- **Paywall professionnel** : Aperçu flouté avant paiement
- **Garantie remboursé** : Si score ≥ 90/100 (devis déjà au prix juste)
- **Paiement sécurisé** : Intégration Stripe

### 🎨 Expérience Utilisateur Premium
- **Design moderne** : Interface style SaaS premium (inspiré Airbnb/Revolut)
- **Animations fluides** : Framer Motion pour tous les micro-interactions
- **Icônes professionnelles** : Lucide React (zéro emoji système)
- **Social proof** : Stats dynamiques, live savings banner
- **Partage social** : WhatsApp, Twitter, Email
- **Mobile-first** : Sticky CTA bar, responsive design

### 📊 Rapport d'Analyse Complet
- Verdict détaillé avec contexte
- Tableau comparatif ligne par ligne
- Points d'attention (red flags)
- **Stratégie de négociation** : Message prêt à envoyer par SMS/email
- Prix juste estimé

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **IA** : OpenAI GPT-4o (Vision)
- **Paiement** : Stripe
- **Base de données** : Vercel KV (Redis) / Mock KV pour dev
- **Notifications** : Sonner (toasts)

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine :

```env
# OpenAI (OBLIGATOIRE pour l'analyse)
OPENAI_API_KEY=sk-votre-clé-ici

# Stripe (OPTIONNEL - pour tester les paiements)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel KV (OPTIONNEL - le mock est activé par défaut)
# VERCEL_KV_REST_API_URL=https://...
# VERCEL_KV_REST_API_TOKEN=...
```

**Pour obtenir votre clé OpenAI :**
- [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Créez un compte et générez une clé API

### 3. Lancer le serveur

```bash
npm run dev
```

### 4. Ouvrir l'application

[http://localhost:3000](http://localhost:3000)

## 🎯 Utilisation

### Mode Démo (sans clé API)
1. Cliquez sur **"Voir un exemple"**
2. Découvrez un rapport d'analyse pré-rempli

### Mode Analyse Réelle
1. Cliquez sur **"Scanner mon devis"**
2. Uploadez une photo de votre devis (PNG, JPG, max 10MB)
3. Attendez 3 secondes (barre de progression animée)
4. **Paywall** : Aperçu du score et des économies
5. Débloquez pour 7,99€ (si Stripe configuré)

## 🏗️ Structure du Projet

```
devis-ia/
├── app/
│   ├── layout.tsx              # Layout principal + metadata
│   ├── page.tsx                # Landing page (Hero + Upload)
│   ├── demo/page.tsx           # Page démo
│   ├── rapport/[id]/page.tsx   # Page de rapport (dynamique)
│   └── api/
│       ├── analysis/[id]/      # API pour récupérer une analyse
│       └── webhooks/stripe/    # Webhook Stripe
├── components/
│   ├── AnalysisProgress.tsx    # Barre de chargement animée
│   ├── CategoryBadge.tsx       # Badges de catégories
│   ├── CircularScore.tsx       # Jauge circulaire de score
│   ├── HeroButton.tsx          # Bouton CTA animé
│   ├── LineItemCard.tsx        # Carte de ligne d'analyse
│   ├── LiveSavingsBanner.tsx   # Bandeau de FOMO
│   ├── Paywall.tsx             # Écran de paiement
│   ├── StatsSection.tsx        # Section de preuve sociale
│   ├── StickyCTABar.tsx        # Barre fixe mobile
│   └── UploadZone.tsx          # Zone de drop
├── actions/
│   ├── analyze.ts              # Server Action OpenAI
│   ├── create-checkout.ts      # Création session Stripe
│   └── save-analysis.ts        # Sauvegarde analyse dans KV
├── lib/
│   ├── kv.ts                   # Config KV (prod)
│   ├── kv-mock.ts              # Mock KV (dev)
│   ├── stripe.ts               # Config Stripe
│   └── types.ts                # Types TypeScript
└── .env                        # Variables d'environnement
```

## 🎨 Design System

### Couleurs Principales
- **Emerald** : `#10b981` (Validation, Prix OK)
- **Red** : `#ef4444` (Alertes, Économies)
- **Orange** : `#f59e0b` (Avertissements)
- **Purple** : `#8b5cf6` (Accents premium)
- **Gray/Navy** : `#1f2937` (Texte, Header)

### Principes
- Mobile-first, responsive design
- Coins arrondis (`rounded-2xl`, `rounded-3xl`)
- Ombres subtiles et gradients sophistiqués
- Animations micro-interactions
- Feedback visuel immédiat
- Typographie claire et hiérarchisée

## 🧠 Intelligence Artificielle

### Prompt System
L'IA reçoit des instructions strictes pour :
1. **Lire le devis ligne par ligne** (OCR intelligent)
2. **Comparer chaque prix** avec des sources fiables françaises
3. **Assigner un status** : `ok`, `warning`, `danger`
4. **Calculer l'écart** et les économies potentielles
5. **Générer une stratégie** de négociation personnalisée

### Format de Réponse
```json
{
  "category": "Mécanique Auto",
  "trust_score": 65,
  "verdict": "Votre garagiste surfacture...",
  "line_items": [
    {
      "item_name": "Plaquettes de frein avant",
      "quoted_price": "180€",
      "market_price": "60€",
      "status": "danger",
      "comment": "3x le prix Oscaro"
    }
  ],
  "red_flags": ["Problème 1", "Problème 2"],
  "fair_price_estimate": "240€ - 280€",
  "negotiation_tip": "Bonjour, j'ai bien reçu..."
}
```

## 🔐 Mode Développement (Mock KV)

Par défaut, le **Mock KV** est activé dans `lib/kv.ts` :
- ✅ Aucune configuration KV nécessaire
- ✅ Analyses stockées en mémoire
- ✅ Démo pré-chargée (`DEMO12345`)
- ✅ Parfait pour tester l'interface

Pour passer en **mode production** avec Vercel KV :
1. Commentez `export * from "./kv-mock";`
2. Décommentez le code Vercel KV
3. Ajoutez les variables d'environnement KV

## 💳 Configuration Stripe (Optionnel)

Voir le fichier `SETUP.md` pour les instructions détaillées.

### Test Local (sans webhook)
L'interface et le paywall fonctionnent sans Stripe configuré.

## 📊 Statistiques

Le Mock KV affiche des stats fictives par défaut :
- **200+ devis** analysés
- **26 700€** d'économies détectées
- **4.9/5** note moyenne

En production, ces stats sont incrémentées automatiquement.

## 🚀 Déploiement

### Vercel (Recommandé)
1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez votre repo GitHub
3. Ajoutez les variables d'environnement
4. Déployez !

### Variables d'environnement Production
- `OPENAI_API_KEY` (obligatoire)
- `STRIPE_SECRET_KEY` (si paiements)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (si paiements)
- `STRIPE_WEBHOOK_SECRET` (si paiements)
- `VERCEL_KV_REST_API_URL` (si KV activé)
- `VERCEL_KV_REST_API_TOKEN` (si KV activé)

## 🔒 Sécurité & RGPD

- ✅ Analyses stockées avec IDs uniques non-traçables
- ✅ Pas de tracking utilisateur invasif
- ✅ Paiement sécurisé par Stripe
- ✅ Données supprimées après 30 jours (TTL Redis)

## 📈 Prochaines Étapes

- [ ] Authentification utilisateur (historique)
- [ ] Export PDF du rapport
- [ ] Système de reviews/notes
- [ ] Base de données de prix régionaux
- [ ] API publique pour intégrations
- [ ] Application mobile native

## 🤝 Support

Pour toute question :
- Consultez `SETUP.md` pour la configuration
- Vérifiez que votre clé OpenAI fonctionne
- Testez d'abord avec la démo

## 📝 License

MIT License - Libre d'utilisation et modification.

---

**VigiDevis** - Développé avec ❤️ par un passionné de technologie.

**Note** : L'utilisation de l'API OpenAI génère des coûts (environ 0,02€ par analyse). Pensez à activer les limites de dépenses sur votre compte OpenAI.
