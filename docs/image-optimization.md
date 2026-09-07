# Guide d'optimisation des images

Ce guide explique comment optimiser les images dans le projet pour améliorer les performances.

## Configuration Next.js

La configuration suivante est activée dans `next.config.ts` :

- **Formats modernes** : AVIF et WebP sont utilisés automatiquement
- **Responsive images** : Adaptation à différentes tailles d'écran
- **Lazy loading** : Les images sont chargées à la demande par défaut
- **Remote patterns** : Support de plusieurs CDN (Cloudinary, Google, Unsplash, etc.)

## Composants optimisés

### OptimizedImage

Utiliser `OptimizedImage` pour les images avec gestion d'erreur et placeholder :

```tsx
import OptimizedImage from "@/components/ui/OptimizedImage";

// Usage simple
<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>

// Avec priorité (pour les images above the fold)
<OptimizedImage
  src="https://example.com/hero.jpg"
  alt="Hero"
  priority={true}
  fill
  placeholder="blur"
/>
```

### ProductImage

Utiliser `ProductImage` pour les images de produits avec support du fill :

```tsx
import ProductImage from "@/components/ProductImage";

// Fill mode (responsive)
<ProductImage
  src="https://example.com/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Mode fixe
<ProductImage
  src="https://example.com/product.jpg"
  alt="Product"
  width={300}
  height={300}
  priority={true}
/>
```

## Bonnes pratiques

### 1. Utiliser priority pour les images above the fold

```tsx
// Images critiques (hero, header)
<OptimizedImage
  src="hero.jpg"
  alt="Hero"
  priority={true}
  fill
/>

// Autres images
<OptimizedImage
  src="content.jpg"
  alt="Content"
  priority={false}
/>
```

### 2. Fournir les dimensions correctes

```tsx
// ✅ Bon - dimensions cohérentes avec le rendu
<Image width={600} height={400} src="..." alt="..." />

// ❌ Mauvais - dimensions incorrectes peuvent causer du layout shift
<Image width={100} height={100} src="..." alt="..." />
```

### 3. Utiliser fill avec sizes pour les images responsives

```tsx
<Image
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="..."
  alt="..."
/>
```

### 4. Utiliser des placeholders pour les images critiques

```tsx
<OptimizedImage
  src="image.jpg"
  alt="..."
  placeholder="blur"
  blurDataURL="data:image/..." // Base64 encoded blur image
/>
```

### 5. Nommer les images correctement

```tsx
// ✅ Bon
<Image alt="User profile picture" src="/user-avatar.jpg" />
<Image alt="Product: Blue T-Shirt" src="/product-blue-tshirt.jpg" />

// ❌ Mauvais
<Image alt="Image" src="/img1.jpg" />
<Image alt="Pic" src="/photo.jpg" />
```

## Performances attendues

Après optimisation :

- **First Contentful Paint (FCP)** : -10-15%
- **Largest Contentful Paint (LCP)** : -15-25%
- **Cumulative Layout Shift (CLS)** : Réduit par les dimensions correctes
- **Taille du bundle** : -20-30% avec formats modernes

## Outils de diagnostic

### Lighthouse

```bash
# Analyser les performances
npm run build
npm start
# Ouvrir Chrome DevTools > Lighthouse
```

### Image optimization report

Utiliser les outils suivants pour analyser les images :
- Chrome DevTools > Network > filter by images
- Next.js Image Optimization Debug
- WebPageTest.org

## Troubleshooting

### "Image with src must use width and height"

Ajouter `width` et `height` ou utiliser `fill` :

```tsx
// Solution 1: width et height
<Image src="..." alt="..." width={400} height={300} />

// Solution 2: fill mode (parent doit être position: relative)
<div className="relative w-full h-full">
  <Image src="..." alt="..." fill />
</div>
```

### Images ne s'optimisent pas

Vérifier que :
1. Le domaine est dans `remotePatterns` dans `next.config.ts`
2. L'image n'est pas marquée comme `unoptimized`
3. L'image est en format supporté (JPG, PNG, WebP, SVG)

### Layout Shift avec les images

Toujours fournir `width` et `height` corrects ou utiliser `aspectRatio` en CSS :

```tsx
<div className="aspect-video">
  <Image src="..." alt="..." fill />
</div>
```
