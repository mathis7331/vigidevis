# 🔧 Fix : Erreur "Analyse introuvable" sur Vercel

## 🎯 Problème

Quand vous uploadez un devis sur Vercel, vous obtenez l'erreur **"Analyse introuvable"** alors que ça fonctionne en localhost.

## 🔍 Cause

Le problème vient du fait que **Vercel KV n'est pas configuré** dans votre dashboard Vercel.  
En local, le code utilise un mock KV (en mémoire), mais sur Vercel, il faut une vraie base de données KV pour persister les analyses.

## ✅ Solution : Configurer Vercel KV

### Étape 1 : Créer la base de données KV sur Vercel

1. **Aller sur Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Sélectionner votre projet** (vigidevis)

3. **Aller dans l'onglet "Storage"**
   - Dans le menu de gauche, cliquez sur **Storage**

4. **Créer une nouvelle base KV**
   - Cliquer sur **"Create Database"**
   - Sélectionner **"KV"** (Key-Value store)
   - Donner un nom (ex: `vigidevis-kv`)
   - Cliquer sur **"Create"**

5. **Attendre que la base soit créée** (quelques secondes)

### Étape 2 : Récupérer les variables d'environnement

Une fois la base créée :

1. **Cliquer sur votre base KV** (vigidevis-kv)

2. **Aller dans l'onglet ".env.local"**

3. **Copier les deux valeurs :**
   - `KV_REST_API_URL` (commence par `https://`)
   - `KV_REST_API_TOKEN` (longue chaîne de caractères)

### Étape 3 : Ajouter les variables dans Vercel

1. **Dans votre projet Vercel**, aller dans **Settings > Environment Variables**

2. **Ajouter la première variable :**
   - **Key :** `KV_REST_API_URL`
   - **Value :** La valeur copiée (ex: `https://vigidevis-kv.vercel-storage.com`)
   - **Environments :** Cocher **Production**, **Preview**, **Development**
   - Cliquer sur **"Save"**

3. **Ajouter la deuxième variable :**
   - **Key :** `KV_REST_API_TOKEN`
   - **Value :** La valeur copiée (ex: `AXjASQgC1234567890...`)
   - **Environments :** Cocher **Production**, **Preview**, **Development**
   - Cliquer sur **"Save"**

### Étape 4 : Redéployer

1. **Aller dans l'onglet "Deployments"**

2. **Cliquer sur les 3 points** du dernier déploiement

3. **Sélectionner "Redeploy"**

   OU

   **Faire un nouveau commit** pour déclencher un nouveau déploiement :
   ```bash
   git commit --allow-empty -m "trigger redeploy for KV config"
   git push origin main
   ```

### Étape 5 : Vérifier

1. **Attendre que le déploiement soit terminé**

2. **Tester sur votre site Vercel :**
   - Uploader un devis
   - Vérifier que l'analyse s'affiche (plus d'erreur "analyse introuvable")

3. **Vérifier les logs Vercel :**
   - Dashboard > Votre projet > Logs
   - Vous devriez voir : `[KV] Using Vercel KV (Vercel production)`

## 🔍 Vérification Alternative : Logs

Si vous voulez vérifier que Vercel KV est bien utilisé :

1. **Aller dans Vercel Dashboard > Votre projet > Logs**

2. **Chercher les lignes qui commencent par `[KV]`**

3. **Vous devriez voir :**
   ```
   [KV] Using Vercel KV (Vercel production)
   [VERCEL KV] ✅ Saved pending analysis abc123
   ```

4. **Si vous voyez :**
   ```
   [KV] Using mock KV store (development mode - Vercel KV not configured)
   ```
   → Les variables ne sont pas correctement configurées

## 🐛 Si ça ne fonctionne toujours pas

### Vérification 1 : Variables bien configurées ?

1. **Vercel Dashboard > Settings > Environment Variables**
2. Vérifier que `KV_REST_API_URL` et `KV_REST_API_TOKEN` existent
3. Vérifier qu'elles sont activées pour **Production**

### Vérification 2 : Base KV créée ?

1. **Vercel Dashboard > Storage**
2. Vérifier qu'une base KV existe
3. Vérifier qu'elle est liée à votre projet

### Vérification 3 : Redéploiement effectué ?

- Les variables d'environnement ne sont prises en compte qu'après un redéploiement
- Faire un nouveau déploiement si nécessaire

### Vérification 4 : Logs d'erreur

1. **Vercel Dashboard > Votre projet > Logs**
2. Chercher les erreurs liées à KV
3. Si vous voyez des erreurs de connexion, vérifier que les variables sont correctes

## 📝 Résumé Rapide

```bash
# 1. Créer KV sur Vercel Dashboard > Storage
# 2. Copier KV_REST_API_URL et KV_REST_API_TOKEN
# 3. Ajouter dans Settings > Environment Variables
# 4. Redéployer
# 5. Tester
```

## ✅ Checklist

- [ ] Base KV créée sur Vercel
- [ ] `KV_REST_API_URL` ajoutée dans Environment Variables
- [ ] `KV_REST_API_TOKEN` ajoutée dans Environment Variables
- [ ] Variables activées pour Production
- [ ] Site redéployé
- [ ] Test effectué (plus d'erreur "analyse introuvable")

---

**Une fois ces étapes suivies, l'erreur "analyse introuvable" devrait être résolue ! 🎉**

