"use client";
// app/page.tsx - Page principale qui assemble tous les composants
import Hero from "@/components/home/Hero";
import BlogLABSection from "@/components/home/sections/BlogLABSection";
import CommunitySection from "@/components/home/sections/CommunitySection";
import EcommerceSection from "@/components/home/sections/EcommerceSection";
import VirtuoseProServices from "@/components/home/sections/VirtuoseProServices";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { MegaMenuSection } from "@/types/Navbar";

export default function Home() {
  const sections: MegaMenuSection[] = [
    {
      label: "Produits",
      columns: [
        {
          title: "Logiciels",
          items: [
            { id: "p1", label: "CRM", href: "/crm" },
            { id: "p2", label: "ERP", href: "/erp" },
            { id: "p3", label: "Analytics", href: "/analytics" },
          ],
        },
        {
          title: "Solutions",
          items: [
            { id: "p4", label: "Cloud", href: "/cloud" },
            { id: "p5", label: "Sécurité", href: "/security" },
          ],
        },
      ],
      featured: [{ id: "f1", label: "🚀 Nouveau : IA intégrée", href: "/ai" }],
    },
    {
      label: "Ressources",
      columns: [
        {
          title: "Documentation",
          items: [
            { id: "r1", label: "Guides", href: "/guides" },
            { id: "r2", label: "API", href: "/api" },
          ],
        },
        {
          title: "Support",
          items: [
            { id: "r3", label: "FAQ", href: "/faq" },
            { id: "r4", label: "Contact", href: "/contact" },
          ],
        },
      ],
    },
    {
      label: "Tarifs",
      columns: [
        {
          title: "Offres",
          items: [
            { id: "t1", label: "Gratuit", href: "/free" },
            { id: "t2", label: "Pro", href: "/pro" },
            { id: "t3", label: "Entreprise", href: "/enterprise" },
          ],
        },
      ],
    },
  ];
  // Données mock
  const mockProducts = [
    {
      id: "1",
      name: 'MacBook Pro 14" M3 Pro',
      slug: "macbook-pro-14-m3-pro",
      price: 2299.0,
      oldPrice: 2499.0,
      image: "/images/products/macbook-pro.jpg",
      reviewsCount: 342,
      isNew: true,
      isOnSale: true,
    },
    {
      id: "2",
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      price: 1479.0,
      image: "/images/products/iphone-15-pro.jpg",
      reviewsCount: 567,
      isNew: true,
    },
    {
      id: "3",
      name: "AirPods Pro 2",
      slug: "airpods-pro-2",
      price: 279.0,
      oldPrice: 329.0,
      image: "/images/products/airpods-pro.jpg",
      reviewsCount: 893,
      isOnSale: true,
    },
    {
      id: "4",
      name: "iPad Air M2",
      slug: "ipad-air-m2",
      price: 679.0,
      image: "/images/products/ipad-air.jpg",
      reviewsCount: 234,
    },
    {
      id: "5",
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      price: 899.0,
      image: "/images/products/apple-watch-ultra.jpg",
      reviewsCount: 456,
      isNew: true,
    },
    {
      id: "6",
      name: "Mac mini M2",
      slug: "mac-mini-m2",
      price: 699.0,
      image: "/images/products/mac-mini.jpg",
      reviewsCount: 178,
    },
    {
      id: "7",
      name: "Studio Display",
      slug: "studio-display",
      price: 1749.0,
      image: "/images/products/studio-display.jpg",
      reviewsCount: 89,
    },
    {
      id: "8",
      name: "Magic Keyboard",
      slug: "magic-keyboard",
      price: 129.0,
      image: "/images/products/magic-keyboard.jpg",
      reviewsCount: 145,
      isOnSale: true,
      oldPrice: 159.0,
    },
  ];
  return (
    <>
      <Navbar />
      <main>
        {/* Section 1 : Hero - Présentation globale */}
        <Hero />

        {/* Section 2 : Virtuose Pro - Services professionnels */}
        <VirtuoseProServices />

        {/* Section 3 : Blog LAB - Contenu inspirant */}
        <BlogLABSection />

        {/* Section 4 : Communauté - Engagement et événements */}
        <EcommerceSection
          products={mockProducts}
          title="Boutique"
          subtitle="Produits populaires"
          description="Découvrez notre sélection de produits high-tech soigneusement choisis pour vous"
          ctaLabel="Explorer la boutique"
          ctaHref="/shop"
        />

        {/* Section 4 : Communauté - Engagement et événements */}
        <CommunitySection />
      </main>

      <Footer />
    </>
  );
}
