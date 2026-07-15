import {
  Bell,
  Bookmark,
  BookOpen,
  Compass,
  Home,
  LayoutDashboard,
  Mic,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { SidebarItemType } from "./types";

export const navigation: SidebarItemType[] = [
  {
    label: "Fil d'actualité",
    href: "/post",
    icon: Home,
  },

  {
    label: "Podcasts",
    href: "/podcast",
    icon: Mic,
  },
  {
    label: "Livres",
    href: "/book",
    icon: BookOpen,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },

  {
    label: "Create",
    href: "/post",
    icon: PlusCircle,
  },

  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Enregistrements",
    href: "/enregistrement",
    icon: Bookmark,
  },

  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,

    /**
     * Exemple badge dynamique
     * Plus tard remplacé par API
     */
    badge: 12,
  },

  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,

    /**
     * Visible uniquement admin
     */
    roles: ["ADMIN"],

    children: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,

        roles: ["ADMIN"],
      },

      {
        label: "Roles",
        href: "/dashboard/roles",
        icon: ShieldCheck,

        roles: ["ADMIN"],
      },

      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,

        roles: ["ADMIN"],
      },
    ],
  },
];
