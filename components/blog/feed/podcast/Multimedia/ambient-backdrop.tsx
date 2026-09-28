"use client";

import ProductImage from "@/components/ProductImage";
import type { MediaCard } from "@/types/multimedia";

/**
 * Reproduit l'arrière-plan flou et coloré des lecteurs media modernes :
 * une version agrandie et floutée du visuel actif, assombrie pour
 * laisser le contenu au premier plan lisible quel que soit le thème.
 */
export function AmbientBackdrop({ card }: { card: MediaCard | undefined }) {
  if (!card) return <div className="absolute inset-0 bg-black" />;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {card.kind === "video" ? (
        <video
          key={card.src}
          src={card.src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-125 blur-3xl brightness-50 saturate-150"
        />
      ) : (
        <ProductImage
          key={card.coverUrl}
          src={card.coverUrl || ""}
          alt=""
          fill
          className="object-cover scale-125 blur-3xl brightness-50 saturate-150"
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}
