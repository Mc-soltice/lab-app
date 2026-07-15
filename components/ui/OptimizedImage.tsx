// components/ui/OptimizedImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = "",
  width,
  height,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Utiliser une image de fallback si l'image principale échoue
  const fallbackImage = "/images/fallback-cover.jpg";

  if (error) {
    return (
      <div className={`bg-neutral-800 ${className}`}>
        <Image
          src={fallbackImage}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
      // Ajouter un timeout pour les images
      onLoadingComplete={(result) => {
        if (result.naturalWidth === 0) {
          setError(true);
        }
      }}
    />
  );
}
