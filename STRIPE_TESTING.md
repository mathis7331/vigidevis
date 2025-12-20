# 🧪 Guide de Test des Paiements Stripe

## Mode 1 : Test Rapide (sans webhook) - MODE DEV ACTUEL ✅

Après avoir fait un paiement test, ajoutez `?dev_unlock=true` à l'URL :
```
http://localhost:3000/rapport/VOTRE_ID?payment=success&dev_unlock=true
```

Cela débloquera automatiquement l'analyse en mode développement.

---

## Mode 2 : Test Complet avec Webhooks (recommandé)

### Installation de Stripe CLI

**Sur macOS avec Homebrew :**
```bash
brew install stripe/stripe-cli/stripe
```

**Ou téléchargez depuis :**
https://github.com/stripe/stripe-cli/releases/latest

### Configuration

**1. Se connecter à Stripe**
```bash
stripe login
```

**2. Démarrer votre serveur Next.js (Terminal 1)**
```bash
npm run dev
```

**3. Écouter les webhooks Stripe (Terminal 2)**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Vous verrez :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**4. Copier le secret webhook dans `.env.local`**

Remplacez la ligne dans `.env.local` :
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**5. Redémarrer votre serveur Next.js**
Arrêtez et relancez `npm run dev` pour charger le nouveau secret.

### Tester un Paiement

1. Faites un paiement test avec la carte `4242 4242 4242 4242`
2. Regardez le terminal avec `stripe listen` - vous verrez les événements
3. L'analyse devrait automatiquement se débloquer ! ✨

### Simuler des Événements (optionnel)

Pour tester sans vraiment payer :
```bash
stripe trigger checkout.session.completed
```

---

## 🃏 Cartes de Test Stripe

| Carte | Résultat |
|-------|----------|
| `4242 4242 4242 4242` | Paiement réussi ✅ |
| `4000 0000 0000 9995` | Carte refusée (fonds insuffisants) ❌ |
| `4000 0027 6000 3184` | Authentification 3D Secure requise 🔐 |

**Date d'expiration :** N'importe quelle date future (ex: 12/28)  
**CVC :** N'importe quel 3 chiffres (ex: 123)  
**Code postal :** N'importe lequel (ex: 75001)

---

## 🎁 Garantie Remboursé Automatique

Si le score d'analyse est ≥ 90/100, le remboursement est automatique !
Vous verrez dans les logs :
```
🎉 Score 92/100 ≥ 90 → Remboursement automatique
✅ Remboursement effectué pour l'analyse xxx
```

---

## 📊 Dashboard Stripe Test

Voir tous vos paiements test :
https://dashboard.stripe.com/test/payments


