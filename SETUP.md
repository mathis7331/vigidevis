# 🚀 Guide de Configuration Rapide - CheckIt

## Étape 1 : Configuration de l'API OpenAI

### Obtenir votre clé API

1. Rendez-vous sur [https://platform.openai.com/](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section **API Keys** : [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. Cliquez sur **"Create new secret key"**
5. Donnez un nom à votre clé (ex: "CheckIt Dev")
6. Copiez la clé générée (vous ne pourrez plus la revoir !)

### Configurer votre projet

1. Créez un fichier `.env` à la racine du projet :

```bash
# Dans le terminal
touch .env
```

2. Ouvrez le fichier `.env` et ajoutez :

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important** : Remplacez `sk-proj-xxxxx` par votre vraie clé API

### Vérifier la configuration

Le fichier `.env` doit ressembler à ça :

```env
OPENAI_API_KEY=sk-proj-Ab3dEfGh1jKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
```

## Étape 2 : Lancer l'application

```bash
# Installer les dépendances (déjà fait normalement)
npm install

# Lancer le serveur de développement
npm run dev
```

## Étape 3 : Tester l'application

1. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur
2. Uploadez une image de devis (ou créez-en un faux pour tester)
3. Attendez l'analyse (environ 3-5 secondes)
4. Consultez les résultats !

## 🎯 Exemples de Devis à Tester

Pour tester l'application, vous pouvez :

1. **Prendre en photo un vrai devis** (garage, plombier, dentiste, etc.)
2. **Créer un faux devis sur Word/Pages** avec des prix exagérés
3. **Télécharger des exemples de devis en ligne** (images libres de droits)

## 💰 Coûts de l'API OpenAI

- **Modèle utilisé** : GPT-4o (Vision)
- **Coût estimé par analyse** : ~$0.01 - $0.03 USD
- **Usage recommandé** : Ajoutez $5-10 de crédit pour commencer

### Suivre votre consommation

Rendez-vous sur [https://platform.openai.com/usage](https://platform.openai.com/usage) pour voir votre consommation en temps réel.

## 🔧 Résolution de Problèmes

### Erreur "Clé API OpenAI manquante"

✅ **Solution** : Vérifiez que :
- Le fichier `.env` existe à la racine du projet
- La clé commence par `sk-proj-` ou `sk-`
- Il n'y a pas d'espaces avant/après la clé
- Vous avez redémarré le serveur après avoir ajouté la clé

### Erreur "Aucune réponse de l'IA"

✅ **Solution** :
- Vérifiez votre crédit sur OpenAI
- Assurez-vous que l'image est lisible (bonne qualité)
- L'image ne doit pas dépasser 10MB

### L'application ne démarre pas

✅ **Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
npm run dev
```

## 📱 Mode Production

Pour déployer en production (Vercel, Netlify, etc.) :

```bash
# Build de production
npm run build

# Lancer en production
npm start
```

N'oubliez pas d'ajouter votre `OPENAI_API_KEY` dans les variables d'environnement de votre hébergeur !

## 🎉 Vous êtes prêt !

Votre application CheckIt est maintenant configurée et prête à analyser des devis.

Pour toute question, consultez le [README.md](./README.md) ou la documentation OpenAI.

---

**Bon développement ! 🚀**












