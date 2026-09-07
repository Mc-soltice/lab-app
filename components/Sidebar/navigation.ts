import {
  Bell,
  Bookmark,
  BookOpen,
  LayoutDashboard,
  Mic,
  SquarePen,
  Users,
  UserStar,
} from "lucide-react";

import type { SidebarItemType } from "./types";

export const navigation: SidebarItemType[] = [
  {
    label: "Articles",
    href: "/post",
    icon: SquarePen,
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
    label: "Mes enregistrements",
    href: "/enregistrement",
    icon: Bookmark,
  },

  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 12,
  },

  {
    label: "Administration",
    href: "/dashboard",
    icon: UserStar,
    roles: ["ADMIN"],
    children: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN"],
      },
      {
        label: "Utilisateurs",
        href: "/dashboard/users",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Articles",
        href: "/dashboard/posts",
        icon: SquarePen,
        roles: ["ADMIN"],
      },
      {
        label: "Podcasts",
        href: "/dashboard/podcasts",
        icon: Mic,
        roles: ["ADMIN"],
      },
      {
        label: "Livres",
        href: "/dashboard/books",
        icon: BookOpen,
        roles: ["ADMIN"],
      },
    ],
  },
];
