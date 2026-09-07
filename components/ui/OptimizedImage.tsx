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
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = "",
  width,
  height,
  priority = false,
  placeholder = "empty",
  blurDataURL,
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
          priority={priority}
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
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={
        placeholder === "blur"
          ? blurDataURL || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDA=="
          : undefined
      }
      // Ajouter un timeout pour les images
      onLoadingComplete={(result) => {
        if (result.naturalWidth === 0) {
          setError(true);
        }
      }}
      // Optimisation pour les formats modernes
      sizes={
        fill
          ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          : undefined
      }
    />
  );
}
