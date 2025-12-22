# 🔧 Fix : Erreur "Invalid API Key provided" Stripe

## 🎯 Problème

Vous obtenez l'erreur :
```
Invalid API Key provided: sk_live_************************
```

Lorsque vous essayez de faire un paiement sur Vercel.

## 🔍 Causes Possibles

1. **Clé Stripe mal copiée** (espaces, caractères manquants)
2. **Clé Stripe expirée ou révoquée**
3. **Mauvaise clé** (clé test au lieu de live, ou vice versa)
4. **Clé non configurée** dans Vercel Environment Variables

## ✅ Solution : Vérifier et Corriger la Clé Stripe

### Étape 1 : Vérifier votre Clé Stripe sur le Dashboard

1. **Aller sur Stripe Dashboard**
   - https://dashboard.stripe.com
   - **IMPORTANT :** Basculer en mode **LIVE** (toggle en haut à droite)

2. **Aller dans Developers > API keys**
   - https://dashboard.stripe.com/apikeys

3. **Vérifier vos clés :**
   - **Secret key** : Doit commencer par `sk_live_` (pas `sk_test_`)
   - **Publishable key** : Doit commencer par `pk_live_` (pas `pk_test_`)

4. **Si la clé n'existe pas ou est révoquée :**
   - Cliquer sur **"Create secret key"** (mode LIVE)
   - Donner un nom (ex: "VigiDevis Production")
   - **Copier la clé immédiatement** (vous ne pourrez plus la revoir !)

### Étape 2 : Vérifier dans Vercel Dashboard

1. **Aller sur Vercel Dashboard**
   - https://vercel.com/dashboard
   - Sélectionner votre projet

2. **Aller dans Settings > Environment Variables**

3. **Vérifier les variables Stripe :**

   #### Variable 1 : `STRIPE_SECRET_KEY`
   - **Key :** `STRIPE_SECRET_KEY`
   - **Value :** Doit commencer par `sk_live_` (pas `sk_test_`)
   - **Vérifier qu'il n'y a pas d'espaces** avant/après la clé
   - **Vérifier que la clé est complète** (environ 100+ caractères)

   #### Variable 2 : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Key :** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Value :** Doit commencer par `pk_live_` (pas `pk_test_`)
   - **Vérifier qu'il n'y a pas d'espaces** avant/après la clé

### Étape 3 : Corriger la Clé si Nécessaire

#### Option A : Mettre à Jour la Clé Existante

1. **Dans Vercel Dashboard > Settings > Environment Variables**
2. **Trouver `STRIPE_SECRET_KEY`**
3. **Cliquer sur les 3 points** → **Edit**
4. **Supprimer l'ancienne valeur**
5. **Coller la nouvelle clé** depuis Stripe Dashboard
   - ⚠️ **Attention :** Pas d'espaces avant/après
   - ⚠️ **Vérifier :** La clé commence bien par `sk_live_`
6. **Sauvegarder**

#### Option B : Supprimer et Recréer

1. **Supprimer l'ancienne variable** `STRIPE_SECRET_KEY`
2. **Cliquer sur "Add New"**
3. **Key :** `STRIPE_SECRET_KEY`
4. **Value :** Coller la clé depuis Stripe Dashboard
5. **Environments :** Cocher **Production**, **Preview**, **Development**
6. **Save**

### Étape 4 : Vérifier la Clé Publique Aussi

1. **Dans Stripe Dashboard > API keys**
2. **Copier la "Publishable key"** (commence par `pk_live_`)
3. **Dans Vercel > Environment Variables**
4. **Vérifier `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
5. **Mettre à jour si nécessaire**

### Étape 5 : Redéployer

**IMPORTANT :** Les variables d'environnement ne sont prises en compte qu'après un redéploiement !

1. **Dans Vercel Dashboard > Deployments**
2. **Cliquer sur les 3 points** du dernier déploiement
3. **Sélectionner "Redeploy"**

   OU

   **Faire un nouveau commit :**
   ```bash
   git commit --allow-empty -m "trigger redeploy for Stripe keys"
   git push origin main
   ```

### Étape 6 : Tester

1. **Attendre que le déploiement soit terminé**
2. **Tester le paiement** sur votre site Vercel
3. **L'erreur devrait disparaître**

## 🔍 Vérifications Supplémentaires

### Vérifier que la Clé est Bien en Mode LIVE

- ✅ **Correct :** `sk_live_51...` et `pk_live_51...`
- ❌ **Incorrect :** `sk_test_51...` ou `pk_test_51...`

### Vérifier le Format de la Clé

- ✅ **Correct :** La clé doit être une longue chaîne de caractères (environ 100+ caractères), commençant par `sk_live_` suivi d'une longue série alphanumérique
- ❌ **Incorrect :** Clé tronquée ou incomplète
- ❌ **Incorrect :** Espaces avant ou après la clé
- ❌ **Incorrect :** Clé qui commence par `sk_test_` au lieu de `sk_live_`

### Vérifier dans les Logs Vercel

1. **Vercel Dashboard > Votre projet > Logs**
2. **Chercher les erreurs Stripe**
3. Si vous voyez toujours "Invalid API Key", vérifier que :
   - La clé est bien mise à jour
   - Le redéploiement est terminé
   - La clé est en mode LIVE (pas test)

## 🐛 Si ça ne Fonctionne Toujours Pas

### Test 1 : Vérifier la Clé Localement

1. **Créer un fichier `.env.local`** (ne pas commiter !)
2. **Ajouter :**
   ```env
   STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_ICI
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE_ICI
   ```
3. **Tester localement :**
   ```bash
   npm run dev
   ```
4. Si ça fonctionne en local mais pas sur Vercel → Problème de configuration Vercel

### Test 2 : Créer une Nouvelle Clé Stripe

1. **Stripe Dashboard > API keys**
2. **Révoquer l'ancienne clé** (si vous pensez qu'elle est compromise)
3. **Créer une nouvelle clé** (mode LIVE)
4. **Mettre à jour dans Vercel**

### Test 3 : Vérifier les Permissions Stripe

1. **Stripe Dashboard > Settings > Account**
2. **Vérifier que votre compte Stripe est activé**
3. **Vérifier qu'il n'y a pas de restrictions** sur votre compte

## 📝 Checklist

- [ ] Clé Stripe récupérée depuis Stripe Dashboard (mode LIVE)
- [ ] Clé commence par `sk_live_` (pas `sk_test_`)
- [ ] Pas d'espaces avant/après la clé
- [ ] Clé complète (100+ caractères)
- [ ] `STRIPE_SECRET_KEY` ajoutée dans Vercel Environment Variables
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` aussi vérifiée
- [ ] Variables activées pour Production
- [ ] Site redéployé après modification
- [ ] Test effectué (plus d'erreur "Invalid API Key")

## ⚠️ Important

- **Ne jamais partager vos clés Stripe** publiquement
- **Utiliser les clés LIVE** uniquement en production
- **Utiliser les clés TEST** pour le développement local
- **Révoquer immédiatement** une clé si elle est compromise

---

**Une fois ces étapes suivies, l'erreur "Invalid API Key" devrait être résolue ! 🎉**

