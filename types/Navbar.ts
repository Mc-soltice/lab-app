// types.ts
export interface MegaMenuItem {
  id: string;
  label: string;
  href: string;
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuSection {
  label: string;
  href?: string;
  columns?: MegaMenuColumn[];
  featured?: MegaMenuItem[];
}
