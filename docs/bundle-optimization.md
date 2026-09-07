# Guide d'optimisation du bundle

Ce guide explique comment réduire la taille du bundle en optimisant les imports de dépendances lourdes comme `framer-motion`.

## Analyse du bundle

Pour analyser le bundle et identifier les dépendances lourdes :

```bash
npm run analyze
```

Cela générera un rapport visuel montrant la taille de chaque module.

## Optimisation avec imports dynamiques

### Avant (import statique - charge toujours le bundle)
```tsx
import { motion } from "framer-motion";

export default function MyComponent() {
  return <motion.div animate={{ opacity: 1 }} />;
}
```

### Après (import dynamique - charge seulement si nécessaire)
```tsx
import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Import dynamique du composant qui utilise framer-motion
const AnimatedContent = dynamic(
  () => import("./AnimatedContent"),
  {
    loading: () => <div>Chargement...</div>,
    ssr: false, // Optionnel : désactiver le SSR si non nécessaire
  }
);

export default function MyComponent() {
  return <AnimatedContent />;
}
```

### Créer un composant dédié pour les animations
```tsx
// components/animations/MotionComponent.tsx
"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function MotionDiv({
  children,
  ...props
}: {
  children: ReactNode;
  [key: string]: any;
}) {
  return <motion.div {...props}>{children}</motion.div>;
}
```

## Stratégies d'optimisation recommandées

1. **Code splitting automatique** : Next.js divise automatiquement le code par routes
2. **Lazy loading des composants** : Utiliser `dynamic()` pour les composants non critiques
3. **Tree shaking** : Vérifier que seules les parties utilisées de framer-motion sont incluses
4. **Compression** : Activer la compression gzip/brotli (déjà activée dans `next.config.ts`)

## Mesure de performance

```bash
# Vérifier le type de fichiers
npm run type-check

# Construire et analyser
npm run build
npm run analyze
```

## Résultats attendus

- Réduction de 30-50% de la taille du bundle principal si framer-motion n'est utilisé que sur certaines pages
- Amélioration du First Contentful Paint (FCP)
- Amélioration du Largest Contentful Paint (LCP)
