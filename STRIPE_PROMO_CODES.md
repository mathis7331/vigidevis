# 🎟️ Configuration des Codes Promotionnels Stripe

## ✅ Code Modifié

Le support des codes promotionnels a été ajouté dans `actions/create-checkout.ts` avec l'option `allow_promotion_codes: true`.

## 📋 Créer un Code Promotionnel dans Stripe

### Étape 1 : Accéder au Dashboard Stripe

1. **Aller sur Stripe Dashboard**
   - https://dashboard.stripe.com
   - **IMPORTANT :** Basculer en mode **LIVE** (toggle en haut à droite)

### Étape 2 : Créer un Coupon

1. **Aller dans Produits > Coupons**
   - https://dashboard.stripe.com/coupons

2. **Cliquer sur "+ Nouveau"** (ou "Create coupon")

3. **Remplir le formulaire :**
   - **Nom :** `Test Propriétaire` (ou le nom de votre choix)
   - **ID du coupon (Code) :** `ZAINO7390` (ou le code de votre choix)
   - **Type de réduction :**
     - Sélectionner **"Pourcentage"**
     - Entrer **100%** (pour un code gratuit)
   - **Durée :** 
     - "Une fois" (pour un usage unique)
     - "Pour toujours" (pour usage illimité)
     - "Répété" (pour un nombre d'usages spécifique)

4. **Cliquer sur "Enregistrer le coupon"** (ou "Create coupon")

### Étape 3 : Tester le Code Promotionnel

Une fois le code créé et Vercel redéployé :

1. **Aller sur votre site** (ex: vigidevis.be)
2. **Faire une analyse** (uploader un devis)
3. **Sur la page de paiement Stripe**, cliquer sur **"Ajouter un code promotionnel"**
4. **Taper le code** : `ZAINO7390`
5. **Le prix passera à 0,00€**
6. **Valider le paiement** (Stripe ne demandera même pas votre carte pour un montant à 0€)

## 🎯 Types de Réductions Possibles

### Pourcentage
- **Exemple :** 50% de réduction
- Le prix sera réduit de 50%

### Montant Fixe
- **Exemple :** 5€ de réduction
- Le prix sera réduit de 5€

### 100% (Gratuit)
- **Exemple :** Code gratuit
- Le prix passera à 0,00€
- Aucune carte bancaire requise

## ⚙️ Options Avancées

### Limites d'Utilisation
- **Une fois :** Le code ne peut être utilisé qu'une seule fois
- **Pour toujours :** Le code peut être utilisé un nombre illimité de fois
- **Répété :** Le code peut être utilisé un nombre spécifique de fois

### Dates de Validité
- **Date de début :** Quand le code devient actif
- **Date de fin :** Quand le code expire

### Restrictions
- **Minimum d'achat :** Montant minimum requis pour utiliser le code
- **Maximum de réduction :** Montant maximum de réduction (pour les pourcentages)

## 🔍 Vérifier les Codes Créés

1. **Stripe Dashboard > Produits > Coupons**
2. Vous verrez la liste de tous vos coupons
3. Cliquer sur un coupon pour voir ses détails et statistiques d'utilisation

## 📝 Exemple de Configuration

Pour le code `ZAINO7390` mentionné :

```
Nom : Test Propriétaire
ID du coupon : ZAINO7390
Type : Pourcentage
Valeur : 100%
Durée : Une fois (ou Pour toujours selon vos besoins)
```

## ⚠️ Important

- **Mode LIVE :** Assurez-vous d'être en mode LIVE pour créer des codes en production
- **Mode TEST :** Pour tester, créez le code en mode TEST d'abord
- **Sécurité :** Ne partagez pas publiquement vos codes promotionnels si vous voulez les garder privés
- **Expiration :** Configurez des dates d'expiration pour éviter l'abus

## 🚀 Après le Déploiement

Une fois que Vercel a redéployé avec la modification :

1. ✅ Le bouton "Ajouter un code promotionnel" apparaîtra sur la page de paiement Stripe
2. ✅ Les utilisateurs pourront entrer le code `ZAINO7390`
3. ✅ Le prix sera réduit à 0,00€ (si 100% de réduction)
4. ✅ Le paiement pourra être validé sans carte bancaire

---

**Les codes promotionnels sont maintenant activés ! 🎉**

