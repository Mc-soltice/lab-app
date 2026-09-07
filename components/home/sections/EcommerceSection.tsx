"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  reviewsCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

interface EcommerceSectionProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EcommerceSection({
  products = [],
  title = "Boutique",
  subtitle = "Nos produits",
  description = "Découvrez notre sélection de produits soigneusement choisis pour vous",
  ctaLabel = "Voir tous les produits",
  ctaHref = "/boutique",
}: EcommerceSectionProps) {
  // Vérification que products existe et est un tableau
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  // Limiter à 8 produits (2 lignes de 4)
  const displayProducts = products.slice(0, 8);

  // État pour suivre quel produit est en cours d'animation
  const [animatingProduct, setAnimatingProduct] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Déclencher l'animation
    setAnimatingProduct(productId);

    // Simuler l'ajout au panier
    console.log("Ajouter au panier:", productId);

    // Réinitialiser l'animation après 800ms
    setTimeout(() => {
      setAnimatingProduct(null);
    }, 800);
  };

  return (
    <section className="py-16 px-4 bg-linear-to-r from-amber-50/90 via-white/90 to-rose-50/90">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec titre et accroche */}
        <div className="text-center mb-12">
          {/* Badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-amber-100 to-rose-100 text-amber-800 border border-amber-200/50 mb-4">
            {title}
          </span>

          {/* Titre principal */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600 mb-4">
            {subtitle}
          </h2>

          {/* Phrase d'accroche */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Ligne décorative */}
          <div className="w-20 h-1 bg-linear-to-r from-amber-400 to-rose-400 rounded-full mx-auto mt-4" />
        </div>

        {/* Grille de produits - 2 lignes de 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
          {displayProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/boutique/${product.slug}`}
              className="group/product relative flex flex-col rounded-xl sm:rounded-2xl bg-white overflow-hidden ring-1 ring-black/4 transition-all duration-300 hover:ring-black/8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1"
            >
              {/* Badges */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5">
                {product.isNew && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase bg-gray-900 text-white">
                    Nouveau
                  </span>
                )}
                {product.isOnSale && product.oldPrice && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase bg-rose-500 text-white">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Image */}
              <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                {product.image ? (
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover/product:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="flex flex-col flex-1 p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {product.price?.toFixed(2) || "0.00"} €
                    </span>
                    {product.oldPrice && (
                      <span className="hidden sm:inline text-xs text-gray-400 line-through">
                        {product.oldPrice.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>

                {/* Bouton ajout panier — toujours visible, en bas de carte */}
                <button
                  onClick={(e) => handleAddToCart(e, product.id)}
                  className={`relative mt-1.5 sm:mt-2 w-full py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-medium overflow-hidden transition-all duration-300 ${
                    animatingProduct === product.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                      animatingProduct === product.id
                        ? "opacity-0 -translate-y-2"
                        : "opacity-100 translate-y-0"
                    }`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline sm:inline">
                      Ajouter au panier
                    </span>
                    <span className="xs:hidden sm:hidden">Ajouter</span>
                  </span>

                  <span
                    className={`absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                      animatingProduct === product.id
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <span className="text-sm">✓</span>
                    Ajouté !
                  </span>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA - Voir tous les produits */}
        <div className="mt-12 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95 bg-linear-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            <ShoppingBag className="h-4 w-4" />
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Indicateur de nombre de produits */}
          <p className="text-xs text-gray-400 mt-3">
            {products.length} produits disponibles
          </p>
        </div>
      </div>
    </section>
  );
}
