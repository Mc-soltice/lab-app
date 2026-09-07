import type { ResourceDefinition } from "./types";

const statusFilters = [
  { id: "PUBLISHED", label: "Publié" },
  { id: "DRAFT", label: "Brouillon" },
  { id: "ARCHIVED", label: "Archivé" },
];

const statusColumn = {
  key: "status",
  label: "Statut",
  type: "badge" as const,
  badgeColors: {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
    PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

const authorColumn = {
  key: "author",
  label: "Auteur",
  render: (item: any) => (
    <div className="flex items-center gap-2">
      {item.author?.avatar ? (
        <img
          src={item.author.avatar}
          alt={item.author.username}
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-(--bg-tertiary) flex items-center justify-center">
          <span className="text-xs text-(--text-tertiary)">
            {item.author?.firstName?.[0] || item.author?.username?.[0] || "?"}
          </span>
        </div>
      )}
      <span className="text-sm">
        {item.author?.firstName || item.author?.username || "Inconnu"}
      </span>
    </div>
  ),
};

export const resourceRegistry: Record<string, ResourceDefinition> = {
  users: {
    title: "Utilisateurs",
    singular: "utilisateur",
    actionLabel: "Ajouter un utilisateur",
    searchPlaceholder: "Rechercher par nom, email...",
    emptyMessage: "Aucun utilisateur trouvé",
    detailPath: "/dashboard/users",
    createPath: "/dashboard/users/create",
    titleField: "username",
    admin: {
      resourceKey: ["admin", "users"],
      endpoint: "/api/admin/users",
      deleteEndpoint: (id) => `/api/admin/users/${id}`,
      successMessage: "Utilisateur supprimé avec succès",
      filterItem: (user, searchTerm) => {
        const term = searchTerm.toLowerCase().trim();
        return (
          !term ||
          [user.username, user.email, user.firstName, user.lastName]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term))
        );
      },
    },
    columns: [
      {
        key: "avatar",
        label: "Profil",
        type: "image",
        imageField: "avatar",
        imageAltField: "username",
        imageSize: "sm",
      },
      { key: "username", label: "Nom d'utilisateur" },
      { key: "email", label: "Email" },
      { key: "firstName", label: "Prénom" },
      { key: "lastName", label: "Nom" },
      { key: "role", label: "Rôle", type: "badge" },
      { key: "createdAt", label: "Inscrit le", type: "date" },
    ],
  },
  books: {
    title: "Livres",
    singular: "livre",
    actionLabel: "Nouveau livre",
    searchPlaceholder: "Rechercher par titre, auteur...",
    emptyMessage: "Aucun livre trouvé",
    detailPath: "/dashboard/books",
    createPath: "/dashboard/create?type=book",
    titleField: "title",
    admin: {
      resourceKey: ["admin", "books"],
      endpoint: "/api/admin/books",
      deleteEndpoint: (id) => `/api/admin/books/${id}`,
      successMessage: "Livre supprimé avec succès",
      filterItem: (book, searchTerm, selectedFilters) => {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          [
            book.title,
            book.author?.username,
            book.author?.firstName,
            book.author?.lastName,
            book.synopsis,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));
        return (
          matchesSearch &&
          (!selectedFilters.length || selectedFilters.includes(book.status))
        );
      },
    },
    columns: [
      {
        key: "coverImage",
        label: "Couverture",
        type: "image",
        imageField: "coverImage",
        imageAltField: "title",
        imageSize: "lg",
      },
      { key: "title", label: "Titre" },
      authorColumn,
      { key: "price", label: "Prix" },
      { key: "category.name", label: "Catégorie" },
      statusColumn,
      { key: "publishedAt", label: "Publié le", type: "date" },
    ],
    filterGroups: [{ label: "Statut", filters: statusFilters }],
  },
  podcasts: {
    title: "Podcasts",
    singular: "podcast",
    actionLabel: "Nouveau podcast",
    searchPlaceholder: "Rechercher par titre, auteur...",
    emptyMessage: "Aucun podcast trouvé",
    detailPath: "/dashboard/podcasts",
    createPath: "/dashboard/create?type=podcast",
    titleField: "title",
    admin: {
      resourceKey: ["admin", "podcasts"],
      endpoint: "/api/admin/podcasts",
      deleteEndpoint: (id) => `/api/admin/podcasts/${id}`,
      successMessage: "Podcast supprimé avec succès",
      filterItem: (podcast, searchTerm, selectedFilters) => {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          [
            podcast.title,
            podcast.author?.username,
            podcast.author?.firstName,
            podcast.author?.lastName,
            podcast.description,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));
        return (
          matchesSearch &&
          (!selectedFilters.length || selectedFilters.includes(podcast.status))
        );
      },
    },
    columns: [
      {
        key: "coverImage",
        label: "Couverture",
        type: "image",
        imageField: "coverImage",
        imageAltField: "title",
        imageSize: "lg",
      },
      { key: "title", label: "Titre" },
      authorColumn,
      { key: "duration", label: "Durée" },
      { key: "category.name", label: "Catégorie" },
      statusColumn,
      { key: "publishedAt", label: "Publié le", type: "date" },
    ],
    filterGroups: [{ label: "Statut", filters: statusFilters }],
  },
  posts: {
    title: "Articles",
    singular: "article",
    actionLabel: "Nouvel article",
    searchPlaceholder: "Rechercher par titre, auteur...",
    emptyMessage: "Aucun article trouvé",
    detailPath: "/dashboard/posts",
    createPath: "/dashboard/create?type=post",
    titleField: "title",
    admin: {
      resourceKey: ["admin", "posts"],
      endpoint: "/api/admin/posts",
      deleteEndpoint: (id) => `/api/admin/posts/${id}`,
      successMessage: "Article supprimé avec succès",
      filterItem: (post, searchTerm, selectedFilters) => {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          [
            post.title,
            post.author?.username,
            post.author?.firstName,
            post.author?.lastName,
            post.excerpt,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));
        return (
          matchesSearch &&
          (!selectedFilters.length || selectedFilters.includes(post.status))
        );
      },
    },
    columns: [
      {
        key: "coverImage",
        label: "Couverture",
        type: "image",
        imageField: "coverImage",
        imageAltField: "title",
        imageSize: "lg",
      },
      { key: "title", label: "Titre" },
      authorColumn,
      { key: "category.name", label: "Catégorie" },
      statusColumn,
      { key: "publishedAt", label: "Publié le", type: "date" },
    ],
    filterGroups: [{ label: "Statut", filters: statusFilters }],
  },
};
