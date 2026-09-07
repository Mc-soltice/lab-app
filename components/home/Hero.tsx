// components/sections/Hero.tsx
"use client";

import {
  ArrowRight,
  ChevronRight,
  Clock,
  Heart,
  Play,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Statistiques clés
  const stats: StatItem[] = [
    {
      label: "Femmes accompagnées",
      value: "500+",
      icon: <Users className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "Articles publiés",
      value: "200+",
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
    },
    {
      label: "Services proposés",
      value: "15+",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: "Taux de satisfaction",
      value: "98%",
      icon: <Star className="w-5 h-5 text-yellow-500" />,
    },
  ];

  // Caractéristiques principales
  const features: FeatureItem[] = [
    {
      title: "Blog LAB Inspirant",
      description:
        "Découvrez des articles sur l'intimité, la spiritualité, la culture et le leadership féminin.",
      icon: <Sparkles className="w-6 h-6" />,
      link: "/blog",
    },
    {
      title: "Virtuose Pro",
      description:
        "Services professionnels pour TPE/PME : secrétariat, comptabilité, création graphique et plus.",
      icon: <TrendingUp className="w-6 h-6" />,
      link: "/boutique/services",
    },
    {
      title: "Communauté Active",
      description:
        "Webinaires, podcasts et ateliers pour développer votre réseau et vos compétences.",
      icon: <Users className="w-6 h-6" />,
      link: "/webinaires",
    },
  ];

  // Témoignages
  const testimonials = [
    {
      id: 1,
      name: "Marie-Claire N.",
      role: "Fondatrice de MCN Consulting",
      content:
        "BAL & Virtuose Pro m'a permis de donner une nouvelle dimension à mon entreprise. Les services de secrétariat et la communauté m'ont accompagnée à chaque étape.",
      rating: 5,
      image: "/images/testimonials/marie-claire.jpg",
    },
    {
      id: 2,
      name: "Sarah K.",
      role: "Créatrice de mode",
      content:
        "Grâce aux articles du blog et aux webinaires, j'ai pu structurer ma marque et gagner en confiance dans mon leadership.",
      rating: 5,
      image: "/images/testimonials/sarah-k.jpg",
    },
    {
      id: 3,
      name: "Amina D.",
      role: "Artisanat Local",
      content:
        "La plateforme m'a offert une vitrine incroyable pour mes créations artisanales. L'accompagnement est d'une grande qualité.",
      rating: 5,
      image: "/images/testimonials/amina-d.jpg",
    },
  ];

  // Animation au montage
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-rotation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Rendu des étoiles
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 lg:pt-20">
      {/* Background avec dégradé et motifs */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-50/50 via-white to-rose-50/50 -z-10">
        {/* Motifs décoratifs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-200/10 rounded-full blur-3xl"></div>

        {/* Motif de points */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Contenu de gauche */}
          <div
            className={`space-y-8 transform transition-all duration-1000 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-amber-100/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium text-amber-700">
                Plateforme d'émancipation féminine
              </span>
            </div>

            {/* Titre principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="block text-gray-800">Osez</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-amber-600 via-rose-500 to-purple-600">
                votre potentiel
              </span>
              <span className="block text-gray-700">
                avec BAL & Virtuose Pro
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-600 max-w-xl leading-relaxed">
              La première plateforme digitale hybride camerounaise dédiée à
              l'émancipation féminine et à l'entrepreneuriat. Inspirez-vous,
              formez-vous, et développez votre business.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/boutique"
                className="group inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-amber-500 to-rose-500 text-white text-lg font-medium rounded-2xl hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 gap-2"
              >
                Découvrir nos services
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/blog"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-lg font-medium rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 gap-2 border border-amber-100/50"
              >
                Lire le blog
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-amber-100/30 transform transition-all duration-700 hover:scale-105 hover:shadow-lg ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Sécurité et confiance */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Communauté bienveillante</span>
              </div>
            </div>
          </div>

          {/* Contenu de droite */}
          <div
            className={`space-y-8 transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            {/* Image principale */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero/hero-image.jpg"
                  alt="Femmes inspirantes et entrepreneurs"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Badge flottant */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-amber-100/50 animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      En ligne
                    </span>
                  </div>
                </div>

                {/* Badge vidéo */}
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-amber-500/30">
                    <Play className="w-8 h-8 lg:w-10 lg:h-10 text-amber-500 ml-1 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </button>
              </div>

              {/* Carte flottante - Témoignage */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-xs border border-amber-100/50 animate-float">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      MC
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium">
                      Marie-Claire N.
                    </p>
                    <div className="flex gap-0.5 mt-1">{renderStars(5)}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      "Une expérience transformatrice !"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <Link
                  key={feature.title}
                  href={feature.link}
                  className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/30 hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-linear-to-br from-amber-100 to-rose-100 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Témoignages carrousel */}
        <div className="mt-16 lg:mt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Ce que disent nos membres
            </h2>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-amber-500"
                      : "bg-amber-200 hover:bg-amber-300"
                  }`}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-amber-100/30 p-6 lg:p-8">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-2">
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="shrink-0">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-linear-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex justify-center lg:justify-start gap-0.5 mb-2">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="mt-3">
                        <p className="font-semibold text-gray-800">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Styles globaux pour les animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
