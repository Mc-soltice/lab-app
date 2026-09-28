"use client";

import { useCallback, useState } from "react";

/**
 * État de sélection simple pour une liste d'éléments média (vidéos,
 * images, slides…). Conserve l'élément sélectionné lui-même plutôt
 * qu'un index, pour rester agnostique de l'ordre de la liste.
 */
export function useMediaSelector<T>(items: T[]) {
  const [selected, setSelected] = useState<T | undefined>(items[0]);

  const select = useCallback((item: T) => {
    setSelected(item);
  }, []);

  return { selected, select };
}
