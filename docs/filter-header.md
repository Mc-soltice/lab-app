# Composant `FilterHeader`

Le composant `FilterHeader` fournit un en-tête réutilisable pour les pages qui affichent une liste filtrable : articles, livres, podcasts, utilisateurs, etc.

Il regroupe :

- un titre et une description ;
- une action principale facultative ;
- un champ de recherche contrôlé ;
- un bouton pour afficher ou masquer les filtres avancés ;
- le nombre de filtres actifs ;
- un bouton pour effacer les filtres ;
- la liste des filtres actifs, avec suppression individuelle ;
- une animation d'apparition avec Framer Motion.

Le fichier se trouve dans [components/ui/FilterHeader.tsx](../components/ui/FilterHeader.tsx).

## Principe général

`FilterHeader` est un composant **contrôlé**. Il ne conserve pas l'état de la recherche ou des filtres. Le composant parent doit donc :

1. conserver la valeur de recherche ;
2. conserver l'état d'ouverture du panneau de filtres ;
3. appliquer réellement la recherche et les filtres aux données ;
4. transmettre les nouvelles valeurs et fonctions via les props.

Le composant s'occupe principalement de l'affichage et appelle les callbacks lorsque l'utilisateur agit.

## Flux de fonctionnement

```text
Utilisateur saisit une recherche
        |
        v
onSearchChange(nouvelleValeur)
        |
        v
Le parent met à jour searchValue
        |
        v
Le parent filtre ses données
        |
        v
FilterHeader est rendu avec la nouvelle valeur
```

Pour les filtres avancés :

```text
Clic sur "Filtres"
        |
        v
onToggleFilters()
        |
        v
Le parent modifie showFilters
        |
        v
Le panneau children apparaît ou disparaît
```

## Utilisation minimale

```tsx
"use client";

import { useState } from "react";
import FilterHeader from "@/components/ui/FilterHeader";

export default function BooksPage() {
  const [search, setSearch] = useState("");

  return (
    <FilterHeader
      title="Livres"
      description="Découvrez les derniers livres publiés."
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher un livre..."
    />
  );
}
```

Dans cet exemple, le champ affiche toujours la valeur de `searchValue`. À chaque saisie, `setSearch` est appelé par l'intermédiaire de `onSearchChange`.

## Utilisation avec une action

Une action peut exécuter une fonction ou naviguer vers une autre page. Il faut fournir `actionLabel` ainsi que l'une des deux props suivantes :

- `onAction` pour exécuter une fonction ;
- `actionHref` pour utiliser un lien Next.js.

```tsx
import { Plus } from "lucide-react";

<FilterHeader
  title="Articles"
  searchValue={search}
  onSearchChange={setSearch}
  actionLabel="Créer un article"
  actionIcon={<Plus className="h-4 w-4" />}
  actionHref="/post/create"
/>
```

Si `onAction` et `actionHref` sont tous les deux fournis, `onAction` est prioritaire.

## Utilisation avec des filtres avancés

Le parent contrôle `showFilters` et son changement via `onToggleFilters`. Le contenu placé dans `children` est affiché dans le panneau lorsque `showFilters` vaut `true`.

```tsx
const [showFilters, setShowFilters] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("all");

<FilterHeader
  title="Podcasts"
  searchValue={search}
  onSearchChange={setSearch}
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters((current) => !current)}
  activeFilterCount={selectedCategory === "all" ? 0 : 1}
  onClearFilters={() => setSelectedCategory("all")}
>
  <label className="flex flex-col gap-1 text-sm">
    Catégorie
    <select
      value={selectedCategory}
      onChange={(event) => setSelectedCategory(event.target.value)}
    >
      <option value="all">Toutes les catégories</option>
      <option value="business">Business</option>
      <option value="culture">Culture</option>
    </select>
  </label>
</FilterHeader>
```

### Condition d'affichage du panneau

Le panneau de filtres est rendu uniquement lorsque `showFilters` n'est pas `undefined`. Cela permet de distinguer deux cas :

- `showFilters` absent : le bouton et le panneau de filtres ne sont pas utilisés ;
- `showFilters={false}` : le bouton est affiché et le panneau est fermé ;
- `showFilters={true}` : le bouton est affiché et le panneau est ouvert.

## Afficher les filtres actifs

`activeFilterCount` affiche le badge numérique sur le bouton « Filtres » et rend disponible le bouton « Effacer » lorsque `onClearFilters` est fourni.

Pour afficher les filtres sous forme de badges supprimables, utiliser `activeFilters` :

```tsx
<FilterHeader
  title="Utilisateurs"
  searchValue={search}
  onSearchChange={setSearch}
  activeFilterCount={2}
  activeFilters={[
    {
      label: "Administrateurs",
      onRemove: () => setRole("admin"),
    },
    {
      label: "Actifs uniquement",
      onRemove: () => setOnlyActive(false),
    },
  ]}
  onClearFilters={clearAllFilters}
/>
```

Chaque objet de `activeFilters` contient :

| Propriété | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Texte affiché dans le badge |
| `onRemove` | `() => void` | Fonction appelée lors du clic sur `X` |

## Props de `FilterHeader`

| Prop | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| `title` | `string` | Oui | Titre principal de la page |
| `description` | `string` | Non | Texte affiché sous le titre |
| `actionLabel` | `string` | Non | Texte du bouton d'action |
| `actionIcon` | `ReactNode` | Non | Icône affichée avant le texte de l'action |
| `onAction` | `() => void` | Non | Callback de l'action |
| `actionHref` | `string` | Non | URL utilisée pour l'action |
| `searchValue` | `string` | Oui | Valeur actuelle du champ de recherche |
| `onSearchChange` | `(value: string) => void` | Oui | Callback appelé pendant la saisie |
| `searchPlaceholder` | `string` | Non | Placeholder, `Rechercher...` par défaut |
| `showFilters` | `boolean` | Non | Indique si le panneau est visible |
| `onToggleFilters` | `() => void` | Non | Callback du bouton de filtres |
| `activeFilterCount` | `number` | Non | Nombre de filtres actifs, `0` par défaut |
| `onClearFilters` | `() => void` | Non | Réinitialise les filtres |
| `activeFilters` | `ActiveFilter[]` | Non | Badges des filtres actifs |
| `children` | `ReactNode` | Non | Contenu du panneau de filtres avancés |

## Composants auxiliaires exportés

### `FilterToggleButton`

Bouton permettant d'activer ou de désactiver un filtre.

```tsx
import { FilterToggleButton } from "@/components/ui/FilterHeader";

<FilterToggleButton
  label="Publiés"
  isSelected={onlyPublished}
  onToggle={() => setOnlyPublished((current) => !current)}
  count={12}
/>
```

Props principales :

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Libellé du filtre |
| `isSelected` | `boolean` | État actif ou inactif |
| `onToggle` | `() => void` | Callback au clic |
| `count` | `number` | Nombre optionnel affiché si supérieur à `0` |
| `icon` | `ReactNode` | Icône optionnelle |

### `FilterToggleGroup`

Groupe de boutons construits à partir d'un tableau de filtres. Il détermine automatiquement l'état sélectionné avec `selectedFilters.includes(filter.id)`.

```tsx
import { FilterToggleGroup } from "@/components/ui/FilterHeader";

<FilterToggleGroup
  label="Statut"
  filters={[
    { id: "published", label: "Publiés", count: 12 },
    { id: "draft", label: "Brouillons", count: 3 },
  ]}
  selectedFilters={selectedStatuses}
  onToggleFilter={toggleStatus}
/>
```

Le parent doit fournir la fonction `toggleStatus` afin d'ajouter ou de retirer l'identifiant du tableau `selectedStatuses`.

## Animations et responsive design

Le composant utilise Framer Motion pour :

- faire apparaître l'en-tête en le déplaçant légèrement vers le bas ;
- faire apparaître la barre de recherche avec un léger délai ;
- ouvrir et fermer le panneau des filtres avec une animation de hauteur et d'opacité.

Les classes Tailwind rendent la mise en page responsive :

- sur petit écran, le titre, la recherche et les actions sont empilés ;
- à partir de `sm`, le titre et l'action sont placés sur la même ligne ;
- le libellé « Filtres » et « Effacer » est masqué sur les très petits écrans, tandis que les icônes restent visibles.

## Points d'attention

- Le fichier contient `"use client"` car il utilise des callbacks, Framer Motion et des interactions utilisateur.
- Le parent doit également être un composant client s'il utilise `useState` pour gérer la recherche ou les filtres.
- `activeFilterCount` doit rester cohérent avec `activeFilters` pour éviter d'afficher un compteur différent du nombre de badges.
- `onAction` est prioritaire sur `actionHref` si les deux sont définis.
- Le composant ne filtre aucune donnée : la logique de filtrage doit rester dans la page ou dans un hook dédié.
