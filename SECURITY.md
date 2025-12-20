# 🔒 Documentation Sécurité - VigiDevis

## ✅ Protections Implémentées

### 1. **Authentification des Paiements**

#### ❌ Ce qui NE sécurise PAS :
- Le paramètre `?payment=success` dans l'URL
- Les cookies côté client
- Les sessions JavaScript

#### ✅ Ce qui sécurise VRAIMENT :
- **Webhook Stripe avec signature cryptographique**
  - Ligne 28-32 de `/app/api/webhooks/stripe/route.ts`
  - Vérifie que l'événement vient vraiment de Stripe
  - Impossible à forger sans la clé secrète

```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 2. **Accès au Contenu Premium**

#### Flux sécurisé :
1. ✅ Utilisateur paie via Stripe Checkout (hébergé par Stripe)
2. ✅ Stripe appelle notre webhook avec signature
3. ✅ Notre serveur vérifie la signature
4. ✅ Si valide → `markAnalysisAsPaid(analysisId)` côté serveur
5. ✅ Le client recharge et vérifie `isPaid` depuis le serveur

#### Point de contrôle unique :
```typescript
// app/api/analysis/[id]/route.ts
const analysis = await getAnalysis(id); // Lecture depuis la DB
return NextResponse.json({ analysis }); // isPaid vient du serveur
```

Le paywall affiche/masque le contenu basé sur `analysis.isPaid` qui vient **du serveur**, pas de l'URL.

### 3. **Protection contre les Tentatives de Contournement**

| Attaque | Protection |
|---------|-----------|
| Ajouter `?payment=success` à l'URL | ❌ Ne déverrouille pas l'analyse. Le paywall vérifie `isPaid` côté serveur |
| Modifier le JavaScript côté client | ❌ Le contenu premium est masqué côté serveur, pas juste en CSS |
| Appeler directement `/api/analysis/[id]` | ✅ Retourne `isPaid: false` si pas payé |
| Forger un webhook Stripe | ❌ Impossible sans `STRIPE_WEBHOOK_SECRET` |
| Modifier localStorage/cookies | ❌ Le serveur ne fait pas confiance au client |

### 4. **Variables d'Environnement Sensibles**

```env
# ⚠️ NE JAMAIS exposer côté client
STRIPE_SECRET_KEY=sk_live_...       # Côté serveur uniquement
STRIPE_WEBHOOK_SECRET=whsec_...     # Côté serveur uniquement
OPENAI_API_KEY=sk-proj-...          # Côté serveur uniquement

# ✅ Peut être exposé côté client (préfixe NEXT_PUBLIC_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 5. **Protection en Production**

#### À faire avant la mise en production :

1. **Désactiver les modes debug**
   - Supprimer tous les `console.log` sensibles
   - Aucun affichage de clés API dans les logs

2. **Variables d'environnement Production**
   ```env
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_live_...  # Remplacer sk_test_ par sk_live_
   STRIPE_WEBHOOK_SECRET=whsec_... # Obtenir le vrai secret depuis le dashboard Stripe
   ```

3. **Webhook Stripe en Production**
   - Aller sur : https://dashboard.stripe.com/webhooks
   - Créer un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements à écouter : `checkout.session.completed`, `payment_intent.payment_failed`
   - Copier le secret webhook dans `.env`

4. **Rate Limiting** (à implémenter si besoin)
   ```typescript
   // Limiter les tentatives de paiement
   // Limiter les appels à l'API d'analyse
   ```

## 🧪 Tests de Sécurité

### Test 1 : Accès sans paiement
```bash
# Essayer d'accéder au rapport sans payer
curl http://localhost:3000/api/analysis/test-id

# Devrait retourner : { "isPaid": false }
```

### Test 2 : Paramètre URL malveillant
```
http://localhost:3000/rapport/test-id?payment=success

# Devrait afficher le paywall car isPaid=false côté serveur
```

### Test 3 : Webhook sans signature
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'

# Devrait retourner : { "error": "Missing stripe-signature header" }
```

## 📊 Audit de Sécurité

| Critère | État | Notes |
|---------|------|-------|
| Paiements sécurisés | ✅ | Via Stripe (PCI DSS compliant) |
| Authentification webhook | ✅ | Signature cryptographique |
| Protection XSS | ✅ | React échappe automatiquement |
| Protection CSRF | ✅ | Next.js protège les routes API |
| Données sensibles | ✅ | Jamais exposées côté client |
| HTTPS en production | ⚠️ | À vérifier lors du déploiement |
| Rate limiting | ⚠️ | À implémenter si fort trafic |

## 🚀 Checklist Déploiement Sécurisé

- [ ] Remplacer les clés Stripe test par les clés live
- [ ] Configurer le webhook Stripe en production
- [ ] Vérifier que HTTPS est actif
- [ ] Tester le flow de paiement complet en prod
- [ ] Activer les logs Stripe pour monitoring
- [ ] Configurer les alertes en cas de problème webhook
- [ ] Documenter le processus de remboursement manuel si besoin

## 📞 En cas de Problème de Sécurité

1. Révoquer immédiatement les clés API compromises sur Stripe
2. Vérifier les logs de paiement pour détecter les anomalies
3. Contacter le support Stripe si besoin : https://support.stripe.com

---

**Dernière mise à jour :** 20 décembre 2024

