# 🔧 Fix : Erreur 405 Method Not Allowed sur Webhook Stripe

## 🎯 Problème

Le webhook Stripe renvoie une erreur **405 Method Not Allowed** en production.

## ✅ Vérifications Effectuées

### 1. Structure du Fichier ✅
- ✅ Le fichier s'appelle bien `app/api/webhooks/stripe/route.ts`
- ✅ Pas de `page.tsx` qui pourrait causer un conflit

### 2. Export de la Fonction POST ✅
- ✅ La fonction `export async function POST(req: NextRequest)` est bien exportée
- ✅ Utilise `NextRequest` et `NextResponse` de Next.js

### 3. Récupération du Corps ✅
- ✅ Utilise `await req.text()` pour récupérer le corps brut
- ✅ Nécessaire pour la vérification de signature Stripe

### 4. Vérification de Signature ✅
- ✅ Vérifie la signature avec `stripe.webhooks.constructEvent()`
- ✅ Utilise `process.env.STRIPE_WEBHOOK_SECRET`

### 5. Gestion de l'Événement ✅
- ✅ Gère `checkout.session.completed`
- ✅ Récupère `analysisId` dans `session.metadata?.analysisId`
- ✅ Appelle `markAnalysisAsPaid(analysisId)` et `saveAnalysis()`

### 6. Réponse à Stripe ✅
- ✅ Retourne `NextResponse.json({ received: true }, { status: 200 })`
- ✅ Toujours retourner 200 pour confirmer la réception

## 🔧 Modifications Apportées

### Configuration Runtime
Ajout de la configuration pour s'assurer que la route n'est pas mise en cache :

```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

### Réponse Explicite
S'assurer que la réponse finale retourne toujours un status 200 :

```typescript
return NextResponse.json({ received: true }, { status: 200 });
```

## 🔍 Vérifications Supplémentaires

### 1. Vérifier le Middleware
Si vous avez un fichier `middleware.ts`, assurez-vous qu'il n'interfère pas avec les routes API :

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Ne pas bloquer les routes /api/webhooks/*
  if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }
  // ... reste du middleware
}
```

### 2. Vérifier la Configuration Stripe
Dans votre Dashboard Stripe :

1. **Aller dans Developers > Webhooks**
2. **Vérifier l'URL du webhook** : `https://votre-domaine.vercel.app/api/webhooks/stripe`
3. **Vérifier les événements** :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
4. **Vérifier le Signing Secret** : Doit correspondre à `STRIPE_WEBHOOK_SECRET` dans Vercel

### 3. Vérifier les Variables d'Environnement Vercel
Assurez-vous que `STRIPE_WEBHOOK_SECRET` est bien configuré :

- **Key :** `STRIPE_WEBHOOK_SECRET`
- **Value :** Le secret du webhook (commence par `whsec_`)
- **Environments :** Production, Preview, Development

### 4. Vérifier les Logs Vercel
1. **Vercel Dashboard > Votre projet > Logs**
2. **Chercher les erreurs** liées au webhook
3. **Vérifier les requêtes** vers `/api/webhooks/stripe`

## 🐛 Si l'Erreur Persiste

### Test 1 : Vérifier l'URL du Webhook
```bash
# Tester manuellement avec curl
curl -X POST https://votre-domaine.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Si vous obtenez toujours 405, le problème vient de la configuration Next.js.

### Test 2 : Vérifier Next.js Version
Assurez-vous d'utiliser Next.js 14+ (App Router) :

```json
// package.json
{
  "dependencies": {
    "next": "^14.0.0" // ou supérieur
  }
}
```

### Test 3 : Vérifier la Configuration Vercel
Dans Vercel Dashboard > Settings > Functions :

- **Runtime :** Node.js 18.x ou supérieur
- **Max Duration :** Au moins 30 secondes (pour l'analyse OpenAI)

## 📝 Checklist de Vérification

- [ ] Fichier `app/api/webhooks/stripe/route.ts` existe
- [ ] Exporte `export async function POST(req: NextRequest)`
- [ ] Utilise `await req.text()` pour le corps
- [ ] Vérifie la signature Stripe
- [ ] Retourne `NextResponse.json({ received: true }, { status: 200 })`
- [ ] `STRIPE_WEBHOOK_SECRET` configuré dans Vercel
- [ ] URL du webhook correcte dans Stripe Dashboard
- [ ] Événements `checkout.session.completed` activés
- [ ] Pas de middleware qui bloque `/api/webhooks/*`
- [ ] Next.js 14+ avec App Router

## 🚀 Après les Corrections

1. **Redéployer sur Vercel**
2. **Tester le webhook** avec Stripe CLI :
   ```bash
   stripe trigger checkout.session.completed
   ```
3. **Vérifier les logs Vercel** pour confirmer la réception
4. **Tester un paiement réel** et vérifier que l'analyse se débloque

---

**Le webhook devrait maintenant fonctionner correctement ! 🎉**

