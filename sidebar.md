# Fonctionnement du sidebar

## Vue d'ensemble

Le sidebar est implémenté dans `components/Sidebar/Sidebar.tsx`. C'est un composant client qui fournit la navigation principale de l'application sur desktop et mobile.

Il s'appuie sur :

- `navigation.ts` pour déclarer les liens, les icônes, les rôles et les badges ;
- `SidebarItem.tsx` pour afficher un lien simple ;
- `SidebarGroup.tsx` pour afficher un élément avec sous-menu ;
- `useActiveRoute.ts` pour déterminer la route active ;
- `permissions.ts` pour contrôler l'accès à la section Administration.

Cette documentation ne couvre volontairement ni `SidebarFooter`, ni `ThemeToggle`.

## Données de navigation

La navigation est définie comme un tableau de `SidebarItemType` dans `components/Sidebar/navigation.ts`.

Chaque élément peut contenir :

- `label` : texte affiché dans le menu ;
- `href` : route Next.js utilisée par le lien ;
- `icon` : icône provenant de `lucide-react` ;
- `roles` : rôles autorisés à voir l'élément ;
- `badge` : compteur ou texte court affiché à droite du lien ;
- `children` : éléments du sous-menu.

Les entrées principales sont `Utilisateurs`, `Besoins`et `Notifications`. La section `Chantier` reccupere en sous-entrées la liste des chantiers depuis un api (chaque chantier etant un onglet different).

## Filtrage par rôle

La fonction `filterByRole` est exécutée à partir du rôle de l'utilisateur retourné par `useAuth()`.

Le filtrage suit deux règles :

1. L'élément nommé `Chantiers` passe par `canAccessAdmin(role)`.
2. Pour les autres éléments, la propriété `roles` est utilisée lorsqu'elle existe. Sans `roles`, l'élément est visible par tous.

`canAccessAdmin` autorise les rôles que je designerais dans un tableau.

Le filtrage est récursif : les enfants sont filtrés avec les mêmes règles que leurs parents. Les éléments non accessibles ne sont donc pas transmis au rendu.

## Détermination du lien actif

`useActiveRoute` compare l'URL courante avec toutes les routes visibles.

La priorité est la suivante :

1. une correspondance exacte avec `pathname` ;
2. sinon, le préfixe correspondant le plus long.

Par exemple, pour `/dashboard/podcasts`, la route `/dashboard/podcasts` est préférée à `/dashboard`. Cela permet de n'avoir qu'un seul élément réellement actif, même lorsqu'un groupe parent et un de ses enfants correspondent à l'URL.

La route active est fournie aux composants `SidebarItem` et `SidebarGroup` via la propriété `activeHref` ou `active`.

## Rendu des éléments

Après filtrage, les éléments sont séparés en deux ensembles :

- `mainItems` : toutes les entrées sauf `Administration` ;
- `adminItem` : l'entrée `Administration`, si elle est accessible.

La fonction `renderNavGroup` choisit le composant approprié :

- si l'élément possède des enfants, il est rendu par `SidebarGroup` ;
- sinon, il est rendu par `SidebarItem`.

### Lien simple

`SidebarItem` utilise `next/link` et ajoute `aria-current="page"` lorsque le lien est actif.

En état normal, il affiche l'icône, le libellé et éventuellement le badge. En état réduit, seul l'icône est visible et le libellé apparaît dans une infobulle au survol.

Les valeurs numériques du badge sont limitées à `99+` au-delà de 99.

### Groupe avec sous-menu

`SidebarGroup` affiche un bouton qui ouvre ou ferme le sous-menu. L'état est stocké localement dans `open`.

Le groupe s'ouvre automatiquement lorsqu'il est actif ou lorsqu'un de ses enfants est actif. Un effet React veille aussi à le rouvrir si la route active change vers ce groupe.

Le bouton utilise `aria-expanded` et `aria-controls`. Le sous-menu possède un identifiant dérivé du libellé et est affiché avec une animation de hauteur et d'opacité.

## Mode desktop

Sur les écrans moyens et larges, le sidebar est affiché dans un `aside` sticky prenant toute la hauteur de la fenêtre.

Deux états contrôlent sa largeur :

- `pinned` : indique si le sidebar est épinglé ou réduit ;
- `isHovered` : indique si la souris est au-dessus du sidebar.

La valeur `collapsed` est calculée ainsi :

```ts
const collapsed = !pinned && !isHovered;
```

Le comportement obtenu est le suivant :

- par défaut, le sidebar est ouvert et large (`w-72`) ;
- après réduction, il devient compact (`w-18`) ;
- lorsqu'il est réduit mais survolé, il se déploie temporairement ;
- le bouton avec `ChevronsLeft` permet de réduire ou de déployer le menu.

En mode réduit, les libellés de sections et les textes des liens sont masqués. Les icônes restent centrées et les infobulles rendent les libellés accessibles au survol.

## Mode mobile

Sur mobile, le sidebar desktop est masqué et un tiroir latéral est utilisé.

Le composant reçoit deux propriétés optionnelles :

- `mobileOpen` : indique si le tiroir est visible ;
- `onCloseMobile` : fonction appelée pour le fermer.

Le tiroir :

- couvre l'écran avec un fond semi-transparent ;
- se place à gauche avec une largeur de `320px` ;
- entre et sort avec une translation horizontale ;
- se ferme au clic sur l'arrière-plan ou sur le bouton `X` ;
- utilise `role="dialog"` et `aria-modal="true"`.

Le contenu de navigation est partagé avec la version desktop afin de conserver les mêmes règles de filtrage, les mêmes routes et le même rendu des groupes.

## Styles et accessibilité

Le style repose principalement sur les classes Tailwind CSS :

- bleu pour l'élément actif ;
- gris pour les éléments inactifs ;
- bordure verticale et fond léger pour renforcer l'état actif ;
- anneaux `focus-visible` pour la navigation au clavier ;
- icônes marquées `aria-hidden` lorsqu'elles sont décoratives ;
- `aria-current`, `aria-expanded`, `aria-controls` et `aria-label` pour donner du contexte aux technologies d'assistance.

Les liens utilisent les routes déclarées dans `navigation.ts`. Pour ajouter une entrée, il faut donc normalement modifier cette configuration plutôt que coder un nouveau lien directement dans `Sidebar.tsx`.

## Ajouter ou modifier une entrée

Pour ajouter une entrée simple :

```ts
{
  label: "Ma page",
  href: "/ma-page",
  icon: UneIcone,
}
```

Pour limiter sa visibilité :

```ts
{
  label: "Gestion",
  href: "/gestion",
  icon: UneIcone,
  roles: ["ADMIN"],
}
```

Pour créer un groupe :

```ts
{
  label: "Mon groupe",
  href: "/mon-groupe",
  icon: UneIcone,
  children: [
    {
      label: "Sous-page",
      href: "/mon-groupe/sous-page",
      icon: UneIcone,
    },
  ],
}
```

Il faut fournir des `href` uniques autant que possible, car ils servent de clés React et permettent d'identifier la route active.
