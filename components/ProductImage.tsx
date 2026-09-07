// components/ProductImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface ProductImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  alt: string;
  onLoad?: () => void;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  className = "object-cover rounded",
  onLoad,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  ...rest
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const { onError, onLoadingComplete, ...imageProps } = rest;

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <span className="text-xs text-gray-500">No image</span>
      </div>
    );
  }

  const normalizedSrc = src?.trim() ?? "";
  const needsUnoptimized =
    normalizedSrc.startsWith("http://localhost") ||
    normalizedSrc.startsWith("blob:") ||
    normalizedSrc.startsWith("data:");

  const safeSrc =
    normalizedSrc.match(/^(https?:)?\/\//) || normalizedSrc.startsWith("/")
      ? normalizedSrc
      : `/${normalizedSrc}`;

  // 🔥 Si fill est true, on n'a pas besoin de width/height
  // Sinon, on doit les fournir
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={safeSrc}
          alt={alt}
          className={className}
          fill={true}
          sizes={sizes || "(max-width: 768px) 100vw, 33vw"}
          unoptimized={needsUnoptimized}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
          onLoad={() => {
            onLoad?.();
          }}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          quality={priority ? 85 : 75}
          {...imageProps}
        />
      </div>
    );
  }

  // 🔥 Sans fill, on doit fournir width et height
  const finalWidth = width || 800;
  const finalHeight = height || 600;

  return (
    <Image
      src={safeSrc}
      alt={alt}
      className={className}
      width={finalWidth}
      height={finalHeight}
      unoptimized={needsUnoptimized}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
      onLoad={() => {
        onLoad?.();
      }}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      quality={priority ? 85 : 75}
      sizes={
        fill
          ? sizes || "(max-width: 768px) 100vw, 33vw"
          : undefined
      }
      {...imageProps}
    />
  );
}

