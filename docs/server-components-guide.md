# Guide des composants serveur

Ce guide explique comment utiliser les React Server Components (RSC) pour réduire le JavaScript côté client.

## Qu'est-ce qu'un composant serveur ?

Un composant serveur est un composant React qui s'exécute **uniquement** sur le serveur et n'envoie pas de code JavaScript au navigateur.

### Avantages

- ✅ Réduit le JavaScript côté client
- ✅ Accès direct aux données sensibles (API keys, DB)
- ✅ Meilleure sécurité
- ✅ Meilleure performance
- ✅ Pas de hydration delay

### Limitations

- ❌ Pas d'accès aux hooks React (`useState`, `useEffect`, etc.)
- ❌ Pas d'event listeners directes (`onClick`, `onChange`, etc.)
- ❌ Pas d'accès au contexte client

## Quand utiliser les composants serveur

### ✅ Utiliser les composants serveur pour

- Affichage de contenu statique ou semi-statique
- Chargement de données depuis la base de données
- Chargement de fichiers sécurisés
- Construction de listes/grilles statiques
- Navigation, en-têtes, pieds de page

### ❌ Utiliser les composants client pour

- Interactivité utilisateur (`onClick`, `onChange`, etc.)
- Gestion d'état local (`useState`, `useReducer`)
- Effets côté client (`useEffect`)
- Utilisation de contexte
- Animation et transitions

## Patterns de conversion

### Pattern 1 : Composant entièrement statique

**Avant (Client Component)**
```tsx
// ❌ Clients Component - envoie du JS inutile au client
"use client";

export default function ArticleCard({ article }) {
  return (
    <div className="card">
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
    </div>
  );
}
```

**Après (Server Component)**
```tsx
// ✅ Server Component - aucun JS envoyé au client
export default function ArticleCard({ article }) {
  return (
    <div className="card">
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
    </div>
  );
}
```

### Pattern 2 : Composant avec partie interactive

**Avant (Tout en client)**
```tsx
"use client";
import { useState } from "react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="card">
      <h3>{post.title}</h3>
      {/* Contenu statique mais tout le composant est client */}
      <button onClick={() => setLiked(!liked)}>
        {liked ? "❤️ Liked" : "🤍 Like"}
      </button>
    </div>
  );
}
```

**Après (Séparation serveur/client)**
```tsx
// ✅ Server Component
import LikeButton from "./LikeButton";

export default function PostCard({ post }) {
  return (
    <div className="card">
      <h3>{post.title}</h3>
      {/* Passer seulement le composant interactif au client */}
      <LikeButton postId={post.id} initialLiked={post.liked} />
    </div>
  );
}
```

```tsx
// ✅ Client Component (petit)
"use client";
import { useState } from "react";

export default function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "❤️ Liked" : "🤍 Like"}
    </button>
  );
}
```

### Pattern 3 : Listes avec données dynamiques

**Avant (Client fetches data)**
```tsx
"use client";
import { useEffect, useState } from "react";

export default function BlogFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(setPosts);
  }, []);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

**Après (Server fetches data)**
```tsx
// ✅ Server Component
import { db } from "@/lib/prisma";
import PostCard from "./PostCard";

export default async function BlogFeed() {
  // Fetch directement sur le serveur - pas de JS envoyé au client
  const posts = await db.post.findMany({ take: 20 });

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Pattern 4 : Composant avec données statiques et interactions

```tsx
// ✅ Server Component - chargement de données
import { db } from "@/lib/prisma";
import PostWithInteractions from "./PostWithInteractions";

export default async function PostPage({ params }) {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });

  return <PostWithInteractions post={post} />;
}
```

```tsx
// ✅ Client Component - petite taille, interactions seulement
"use client";
import { useState } from "react";

export default function PostWithInteractions({ post }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div className="interactions">
        <button onClick={() => setLiked(!liked)}>Like</button>
        <button onClick={() => setBookmarked(!bookmarked)}>Bookmark</button>
      </div>
    </article>
  );
}
```

## Stratégies de migration

### 1. Commencer par les composants racine

```tsx
// app/blog/page.tsx - Server Component
import BlogList from "@/components/blog/BlogList";

export default async function BlogPage() {
  return <BlogList />;
}
```

### 2. Descendre progressivement

- Pages → Layouts → Composants affichage → Composants interactifs

### 3. Laisser les composants client au niveau le plus bas

```
Page (Server)
├── Layout (Server)
├── BlogList (Server)
│   └── PostCard (Server)
│       └── LikeButton (Client) ← Petit et interactif seulement
└── Sidebar (Server)
```

## Mesure d'impact

### Avant migration
```
Total JS: 250 KB
- BlogList: 180 KB (structure + state)
- UI Components: 70 KB
```

### Après migration
```
Total JS: 95 KB
- LikeButton: 15 KB (petite interaction)
- UI Components: 80 KB

Réduction: ~62% du JS 🎉
```

## Checklist de migration

- [ ] Identifier les composants sans hooks ni event listeners
- [ ] Convertir les composants statiques en Server Components
- [ ] Tester que les données se chargent correctement
- [ ] Vérifier les performances (Lighthouse)
- [ ] Vérifier les erreurs TypeScript
- [ ] Tester sur le navigateur

## Ressources

- [React Server Components Spec](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Server Components](https://nextjs.org/docs/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/rendering/client-components)
