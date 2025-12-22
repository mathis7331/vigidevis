# 🔑 Variables d'Environnement Vercel - Guide Complet

## 📋 Liste des Variables à Configurer

Voici **exactement** ce que vous devez mettre dans Vercel :

---

## ✅ Variables OBLIGATOIRES

### 1. **OPENAI_API_KEY**

**Clé :** `OPENAI_API_KEY`  
**Valeur :** Votre clé API OpenAI

**Comment l'obtenir :**
1. Aller sur https://platform.openai.com/api-keys
2. Cliquer sur "Create new secret key"
3. Copier la clé (commence par `sk-proj-` ou `sk-`)

**Exemple :**
```
sk-proj-Ab3dEfGh1jKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
```

**Dans Vercel :**
- **Key :** `OPENAI_API_KEY`
- **Value :** `sk-proj-VOTRE_CLE_ICI`

---

### 2. **STRIPE_SECRET_KEY**

**Clé :** `STRIPE_SECRET_KEY`  
**Valeur :** Votre clé secrète Stripe (mode LIVE pour production)

**Comment l'obtenir :**
1. Aller sur https://dashboard.stripe.com
2. **IMPORTANT :** Basculer en mode **LIVE** (toggle en haut à droite)
3. Aller dans **Developers > API keys**
4. Cliquer sur "Reveal test key" → puis "Reveal live key"
5. Copier la clé secrète (commence par `sk_live_`)

**Exemple :**
```
sk_live_51VOTRE_CLE_SECRETE_ICI_REMPLACER_PAR_VOTRE_VRAIE_CLE
```

**Dans Vercel :**
- **Key :** `STRIPE_SECRET_KEY`
- **Value :** `sk_live_VOTRE_CLE_LIVE_ICI`

⚠️ **ATTENTION :** Utilisez la clé **LIVE** (pas `sk_test_`) pour la production !

---

### 3. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**

**Clé :** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  
**Valeur :** Votre clé publique Stripe (mode LIVE)

**Comment l'obtenir :**
1. Même page que ci-dessus (Stripe Dashboard > API keys)
2. Copier la clé **Publishable key** (commence par `pk_live_`)

**Exemple :**
```
pk_live_51VOTRE_CLE_PUBLIQUE_ICI_REMPLACER_PAR_VOTRE_VRAIE_CLE
```

**Dans Vercel :**
- **Key :** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value :** `pk_live_VOTRE_CLE_PUBLIQUE_ICI`

⚠️ **ATTENTION :** Utilisez la clé **LIVE** (pas `pk_test_`) !

---

### 4. **STRIPE_WEBHOOK_SECRET**

**Clé :** `STRIPE_WEBHOOK_SECRET`  
**Valeur :** Le secret du webhook Stripe en production

**Comment l'obtenir :**
1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur "Add endpoint"
3. URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
4. Événements à sélectionner :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Cliquer sur "Add endpoint"
6. Cliquer sur le webhook créé
7. Dans "Signing secret", cliquer sur "Reveal"
8. Copier le secret (commence par `whsec_`)

**Exemple :**
```
whsec_VOTRE_SECRET_WEBHOOK_ICI_REMPLACER_PAR_VOTRE_VRAI_SECRET
```

**Dans Vercel :**
- **Key :** `STRIPE_WEBHOOK_SECRET`
- **Value :** `whsec_VOTRE_SECRET_WEBHOOK_ICI`

⚠️ **IMPORTANT :** Vous devez d'abord déployer votre site pour obtenir l'URL du webhook !

---

## 🔵 Variables OPTIONNELLES (mais recommandées)

### 5. **NEXT_PUBLIC_APP_URL**

**Clé :** `NEXT_PUBLIC_APP_URL`  
**Valeur :** L'URL de votre site en production

**Exemple :**
```
https://vigidevis.vercel.app
```

**Dans Vercel :**
- **Key :** `NEXT_PUBLIC_APP_URL`
- **Value :** `https://VOTRE_DOMAINE.vercel.app`

💡 **Astuce :** Vercel génère automatiquement une URL. Vous pouvez la mettre ici.

---

## 🟢 Variables pour Vercel KV (Base de données) - ⚠️ OBLIGATOIRE pour la production

**🚨 CRITIQUE :** Sans Vercel KV configuré, vous obtiendrez l'erreur **"analyse introuvable"** en production.  
**Le code utilise automatiquement Vercel KV sur Vercel, mais vous devez d'abord créer la base de données KV dans votre dashboard Vercel.**

### 6. **KV_REST_API_URL** (ou VERCEL_KV_REST_API_URL)

**Clé :** `KV_REST_API_URL` (ou `VERCEL_KV_REST_API_TOKEN`)  
**Valeur :** L'URL de votre Vercel KV

**Comment l'obtenir :**
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet
3. Aller dans **Storage**
4. Cliquer sur **Create Database** → Sélectionner **KV**
5. Donner un nom (ex: "vigidevis-kv")
6. Cliquer sur **Create**
7. Une fois créé, cliquer sur votre KV store
8. Dans l'onglet **.env.local**, copier la valeur de **KV_REST_API_URL**

**Exemple :**
```
https://vigidevis-kv.vercel-storage.com
```

**Dans Vercel :**
- **Key :** `KV_REST_API_URL` (ou `VERCEL_KV_REST_API_URL`)
- **Value :** `https://VOTRE_KV.vercel-storage.com`

---

### 7. **KV_REST_API_TOKEN** (ou VERCEL_KV_REST_API_TOKEN)

**Clé :** `KV_REST_API_TOKEN` (ou `VERCEL_KV_REST_API_TOKEN`)  
**Valeur :** Le token d'accès à votre Vercel KV

**Comment l'obtenir :**
1. Même page que ci-dessus (Vercel Dashboard > Storage > KV)
2. Dans l'onglet **.env.local**, copier la valeur de **KV_REST_API_TOKEN**

**Exemple :**
```
AXjASQgC1234567890abcdefghijklmnopqrstuvwxyz...
```

**Dans Vercel :**
- **Key :** `KV_REST_API_TOKEN` (ou `VERCEL_KV_REST_API_TOKEN`)
- **Value :** `VOTRE_TOKEN_KV_ICI`

⚠️ **IMPORTANT :** Le code détecte automatiquement ces variables. Utilisez soit `KV_REST_API_*` soit `VERCEL_KV_REST_API_*` (les deux fonctionnent).

---

## 📝 Récapitulatif - Tableau Complet

| Clé | Valeur | Où l'obtenir | Obligatoire |
|-----|--------|--------------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | platform.openai.com/api-keys | ✅ OUI |
| `STRIPE_SECRET_KEY` | `sk_live_...` | dashboard.stripe.com (mode LIVE) | ✅ OUI |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | dashboard.stripe.com (mode LIVE) | ✅ OUI |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | dashboard.stripe.com/webhooks | ✅ OUI |
| `NEXT_PUBLIC_APP_URL` | `https://...` | Votre URL Vercel | 🟡 Optionnel |
| `KV_REST_API_URL` | `https://...` | vercel.com/dashboard > Storage | 🟡 Si vous utilisez KV |
| `KV_REST_API_TOKEN` | `AXjA...` | vercel.com/dashboard > Storage | 🟡 Si vous utilisez KV |

---

## 🚀 Comment Configurer dans Vercel

### Méthode 1 : Via l'Interface Web

1. **Aller sur Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Sélectionner votre projet**
   - Ou créer un nouveau projet depuis GitHub

3. **Aller dans Settings > Environment Variables**

4. **Ajouter chaque variable :**
   - Cliquer sur "Add New"
   - Entrer la **Key** (nom exact)
   - Entrer la **Value** (votre clé)
   - Sélectionner les environnements (Production, Preview, Development)
   - Cliquer sur "Save"

5. **Répéter pour chaque variable**

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables une par une
vercel env add OPENAI_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
# ... etc
```

---

## ⚠️ Ordre Recommandé

### Étape 1 : Variables de base (sans KV)
1. `OPENAI_API_KEY`
2. `STRIPE_SECRET_KEY`
3. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. `NEXT_PUBLIC_APP_URL` (optionnel)

### Étape 2 : Déployer une première fois
- Pour obtenir l'URL de votre site
- Nécessaire pour configurer le webhook Stripe

### Étape 3 : Webhook Stripe
5. `STRIPE_WEBHOOK_SECRET` (après avoir créé le webhook)

### Étape 4 : Base de données (optionnel mais recommandé)
6. `KV_REST_API_URL`
7. `KV_REST_API_TOKEN`

---

## 🔒 Sécurité

### ✅ À FAIRE :
- ✅ Utiliser les clés **LIVE** pour la production
- ✅ Ne jamais partager vos clés
- ✅ Utiliser les variables d'environnement (jamais dans le code)
- ✅ Activer "Encrypt" dans Vercel (activé par défaut)

### ❌ À NE JAMAIS FAIRE :
- ❌ Commiter les clés dans Git
- ❌ Partager les clés publiquement
- ❌ Utiliser les clés TEST en production
- ❌ Mettre les clés dans le code source

---

## 🧪 Tester après Configuration

Une fois toutes les variables configurées :

1. **Redéployer votre site**
   ```bash
   vercel --prod
   ```

2. **Tester le flow complet :**
   - Upload d'un devis
   - Analyse IA
   - Paiement test
   - Vérifier que le webhook fonctionne

---

## 📞 Besoin d'Aide ?

**Si vous avez des problèmes :**

1. **Vérifier les logs Vercel**
   - Dashboard > Votre projet > Logs

2. **Vérifier les variables**
   - Dashboard > Settings > Environment Variables
   - S'assurer qu'elles sont bien en "Production"

3. **Tester localement**
   - Créer un `.env.production.local` avec les mêmes valeurs
   - Tester avec `npm run build && npm start`

---

## ✅ Checklist Finale

Avant de lancer en production :

- [ ] `OPENAI_API_KEY` configurée
- [ ] `STRIPE_SECRET_KEY` configurée (mode LIVE)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurée (mode LIVE)
- [ ] `STRIPE_WEBHOOK_SECRET` configurée (après déploiement)
- [ ] `NEXT_PUBLIC_APP_URL` configurée (optionnel)
- [ ] `KV_REST_API_URL` configurée (si vous utilisez KV)
- [ ] `KV_REST_API_TOKEN` configurée (si vous utilisez KV)
- [ ] Toutes les variables sont en mode "Production"
- [ ] Site redéployé après ajout des variables
- [ ] Tests effectués

---

**Une fois toutes ces variables configurées, votre site sera prêt pour la production ! 🚀**


