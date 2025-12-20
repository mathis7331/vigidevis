# ⚙️ Configuration de la Vitesse de Scroll

## ✅ Scroll Fluide Activé !

Le scroll est maintenant très doux et fluide, avec une animation personnalisée.

---

## 🎚️ Réglages de Vitesse

### Vitesse actuelle : **1.5 secondes** (très doux)

Dans `app/page.tsx`, ligne ~62 :
```typescript
const duration = 1500; // 1500ms = 1.5 secondes
```

### 📊 Guide des vitesses

| Durée (ms) | Vitesse | Sensation |
|-----------|---------|-----------|
| `800` | Rapide | Dynamique, moderne |
| `1000` | Normal | Équilibré |
| `1500` | Doux | Actuel - Très fluide ✅ |
| `2000` | Très doux | Cinématique |
| `2500` | Ultra doux | Majestueux |
| `3000` | Extrême | Très lent |

---

## 🔧 Pour ajuster la vitesse

### Option 1 : Plus rapide (1 seconde)
```typescript
const duration = 1000; // Plus dynamique
```

### Option 2 : Encore plus doux (2 secondes)
```typescript
const duration = 2000; // Ultra fluide
```

### Option 3 : Cinématique (3 secondes)
```typescript
const duration = 3000; // Comme un film
```

---

## 🎨 Types d'Animation (Easing)

### Actuel : **Ease-in-out Cubic** ✅
- Démarre doucement
- Accélère au milieu
- Ralentit à la fin
- **Sensation :** Naturelle et élégante

### Alternatives possibles :

#### 1. Linear (vitesse constante)
```typescript
const easeLinear = (t: number): number => t;
```
**Sensation :** Robotique, mécanique

#### 2. Ease-in-out Quad (plus doux)
```typescript
const easeInOutQuad = (t: number): number => {
  return t < 0.5 
    ? 2 * t * t 
    : -1 + (4 - 2 * t) * t;
};
```
**Sensation :** Très doux, presque flottant

#### 3. Ease-out Quart (décélération forte)
```typescript
const easeOutQuart = (t: number): number => {
  return 1 - (--t) * t * t * t;
};
```
**Sensation :** Rapide puis freine fort

---

## 🎯 Recommandations par Style

### Style Moderne / Dynamique
```typescript
const duration = 800;
// Easing : ease-in-out cubic (actuel)
```

### Style Premium / Luxe
```typescript
const duration = 2000;
// Easing : ease-in-out cubic (actuel)
```

### Style Zen / Minimaliste
```typescript
const duration = 2500;
// Easing : ease-in-out quad
```

---

## 🧪 Test Rapide

1. Modifier la valeur de `duration` dans `app/page.tsx`
2. Sauvegarder le fichier
3. Le serveur redémarre automatiquement
4. Recharger la page (Cmd+R)
5. Cliquer sur "Scanner mon devis"
6. Observer le nouveau tempo

**Pas besoin de redémarrer le serveur manuellement !**

---

## 💡 Astuce Pro

Si vous voulez différentes vitesses selon la distance :

```typescript
// Calculer la durée selon la distance
const distance = targetPosition - startPosition;
const duration = Math.min(Math.abs(distance) * 1.5, 2500);
// Plus la distance est grande, plus c'est long (max 2.5s)
```

---

## 🎬 Animation Actuelle

**Caractéristiques :**
- ✅ Durée : 1.5 secondes
- ✅ Easing : Ease-in-out cubic
- ✅ Offset : -100px (évite le header)
- ✅ 60 FPS fluide (requestAnimationFrame)

**Avantages :**
- Plus de contrôle que `scrollTo({ behavior: 'smooth' })`
- Vitesse personnalisable
- Compatible tous navigateurs
- Performance optimale

---

## 🚀 Comparaison Avant/Après

### Avant (scroll natif)
```typescript
window.scrollTo({ top: y, behavior: 'smooth' });
```
- ❌ Vitesse fixe (non contrôlable)
- ❌ Varie selon le navigateur
- ❌ Peut être trop rapide

### Après (scroll personnalisé)
```typescript
requestAnimationFrame(animation);
```
- ✅ Vitesse contrôlée précisément
- ✅ Identique partout
- ✅ Doux et élégant

---

**Testez avec la nouvelle animation ! Vous devriez sentir une nette différence** 🌊✨

**La durée actuelle (1.5s) est un bon compromis entre fluidité et rapidité.**  
**Si vous voulez encore plus doux, changez `duration` à `2000` ou `2500`** 🎚️

