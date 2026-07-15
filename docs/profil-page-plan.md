# Plan de mise en place de la page de profil unifiée

## Objectif

Créer une seule page de profil qui serve à la fois :

- au profil de l'utilisateur connecté ;
- au profil d'un autre auteur lorsqu'un utilisateur clique sur son pseudo/avatar ;
- à l'affichage des publications publiques ;
- à l'affichage des brouillons pour l'utilisateur connecté uniquement ;
- à l'édition des informations personnelles pour l'utilisateur connecté uniquement.

## Règle de comportement

### Si l'utilisateur consulte son propre profil

- il peut voir ses informations personnelles ;
- il peut modifier son profil ;
- il peut voir ses publications publiées ;
- il peut voir ses brouillons (posts avec statut non publié).

### Si l'utilisateur consulte le profil d'un autre auteur

- il ne peut pas éditer le profil ;
- il ne voit pas la section brouillons ;
- il voit uniquement les publications publiées.

---

## Étapes à suivre

### 1. Adapter la page de profil dynamique

La page actuelle est située dans [app/profile/[username]/page.tsx](../app/profile/[username]/page.tsx).

Elle doit être transformée pour :

- détecter si le profil consulté correspond à l'utilisateur connecté ;
- afficher un mode "propriétaire" ou "visiteur" selon le cas ;
- conditionner l'affichage du bouton d'édition et de la section brouillons.

### 2. Reutiliser l'authentification existante

Utiliser le contexte d'authentification pour savoir si un utilisateur est connecté et récupérer son username/id.

Fichiers concernés :

- [contexts/auth/auth.context.tsx](../contexts/auth/auth.context.tsx)
- [hooks/useAuth.ts](../hooks/useAuth.ts)
- [components/Header.tsx](../components/Header.tsx)

### 3. Charger les données du profil

La page doit pouvoir charger :

- le profil public de l'utilisateur ciblé ;
- ses publications ;
- éventuellement ses statistiques (abonnés, abonnements, nombre d'articles).

Fichiers concernés :

- [app/api/users/[username]/route.ts](../app/api/users/[username]/route.ts)
- [app/api/users/[username]/posts/route.ts](../app/api/users/[username]/posts/route.ts)
- [hooks/blog/useAuthorPosts.ts](../hooks/blog/useAuthorPosts.ts)

### 4. Gérer la différence entre publications et brouillons

Le modèle métier utilise déjà un statut de publication.

- les posts publiés correspondent à un statut de type PUBLISHED ;
- les brouillons correspondent à un statut de type DRAFT.

Donc la logique doit filtrer les posts selon :

- pour un profil public : uniquement les posts publiés ;
- pour le profil propriétaire : publié + brouillons.

Fichiers concernés :

- [lib/services/post.service.ts](../lib/services/post.service.ts)
- [lib/repositories/post.repository.ts](../lib/repositories/post.repository.ts)
- [lib/validation/schemas.ts](../lib/validation/schemas.ts)
- [app/api/posts/route.ts](../app/api/posts/route.ts)

### 5. Ajouter l'édition du profil utilisateur

La route API de profil courant existe déjà et doit être utilisée pour la mise à jour.

Fichiers concernés :

- [app/api/me/route.ts](../app/api/me/route.ts)
- [lib/services/user.service.ts](../lib/services/user.service.ts)
- [lib/repositories/user.repository.ts](../lib/repositories/user.repository.ts)
- [lib/validation/schemas.ts](../lib/validation/schemas.ts)

### 6. Ajouter l'interface d'édition

Créer un formulaire ou un modal léger pour modifier :

- le prénom ;
- le nom ;
- la bio ;
- l'avatar.

Ce formulaire ne doit apparaître que pour le profil propriétaire.

Fichiers concernés :

- [app/profile/[username]/page.tsx](../app/profile/[username]/page.tsx)
- [components/ui/Card.tsx](../components/ui/Card.tsx)
- [components/ui/OptimizedImage.tsx](../components/ui/OptimizedImage.tsx)

### 7. Ajouter l'onglet ou la section des brouillons

Pour l'utilisateur connecté, afficher une section séparée ou un onglet avec ses brouillons.

Cette section doit :

- être masquée pour un visiteur ;
- afficher uniquement les posts non publiés ;
- permettre une navigation vers l'édition du post si nécessaire.

Fichiers concernés :

- [app/profile/[username]/page.tsx](../app/profile/[username]/page.tsx)
- [app/post/page.tsx](../app/post/page.tsx)
- [app/post/[slug]/page.tsx](../app/post/[slug]/page.tsx)

---

## Fichiers principaux à modifier

| Rôle                                   | Fichier                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Page principale du profil              | [app/profile/[username]/page.tsx](../app/profile/[username]/page.tsx)                 |
| Authentification / utilisateur courant | [contexts/auth/auth.context.tsx](../contexts/auth/auth.context.tsx)                   |
| Hook de chargement des posts d'auteur  | [hooks/blog/useAuthorPosts.ts](../hooks/blog/useAuthorPosts.ts)                       |
| API profil public                      | [app/api/users/[username]/route.ts](../app/api/users/[username]/route.ts)             |
| API posts d'un auteur                  | [app/api/users/[username]/posts/route.ts](../app/api/users/[username]/posts/route.ts) |
| API profil courant                     | [app/api/me/route.ts](../app/api/me/route.ts)                                         |
| Logique métier des posts               | [lib/services/post.service.ts](../lib/services/post.service.ts)                       |
| Repository des posts                   | [lib/repositories/post.repository.ts](../lib/repositories/post.repository.ts)         |
| Validation des données                 | [lib/validation/schemas.ts](../lib/validation/schemas.ts)                             |
| Navigation depuis le header            | [components/Header.tsx](../components/Header.tsx)                                     |

---

## Recommandation d'architecture

Le plus propre est de garder une seule page de profil dynamique et de basculer son comportement selon un simple test :

- si le username du profil correspond au username de l'utilisateur connecté -> mode propriétaire ;
- sinon -> mode visiteur.

Cela évite de dupliquer la page et permet de garder une expérience cohérente.

---

## Résultat attendu

La page doit permettre :

- de voir un profil utilisateur ;
- de voir ses publications publiées ;
- de voir ses brouillons seulement si c'est son propre profil ;
- de modifier ses informations personnelles seulement si c'est son propre profil ;
- de rester accessible pour un visiteur sans boutons d'édition ni section brouillon.
