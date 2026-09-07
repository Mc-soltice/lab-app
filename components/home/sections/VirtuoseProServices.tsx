// components/sections/VirtuoseProServices.tsx
"use client";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  Monitor,
  Phone,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  features: string[];
  color: string;
  popularity?: "popular" | "new" | "best";
  image?: string;
  badge?: string;
  gridPosition?: {
    col: string;
    row: string;
    colStart?: string;
    rowStart?: string;
  };
  size?: "large" | "medium" | "small";
}

const VirtuoseProServices = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("virtuose-services");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const services: ServiceCard[] = [
    {
      id: "secretariat",
      title: "Secrétariat & Rédaction",
      description:
        "Déléguez vos tâches administratives pour vous concentrer sur l'essentiel de votre business.",
      icon: <FileText className="w-7 h-7" />,
      href: "/boutique/services/secretariat",
      features: [
        "Saisie et mise en forme",
        "Rédaction de documents",
        "Gestion d'emails",
        "Prise de rendez-vous",
      ],
      color: "from-blue-500 to-cyan-400",
      popularity: "popular",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop",
      size: "large",
      gridPosition: {
        col: "col-span-2",
        row: "row-span-4",
        colStart: undefined,
        rowStart: undefined,
      },
    },
    {
      id: "bureautique",
      title: "Bureautique Avancée",
      description: "Maîtrisez les outils digitaux pour gagner en efficacité.",
      icon: <Monitor className="w-6 h-6" />,
      href: "/boutique/services/bureautique",
      features: [
        "PowerPoint pro",
        "Excel avancé",
        "Word expert",
        "Google Workspace",
      ],
      color: "from-emerald-500 to-teal-400",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop",
      size: "medium",
      gridPosition: {
        col: "col-span-4",
        row: "row-span-2",
        colStart: "col-start-3",
        rowStart: undefined,
      },
    },
    {
      id: "audit",
      title: "Audit & Contrôle de Gestion",
      description:
        "Une vision claire de votre santé financière pour prendre les meilleures décisions.",
      icon: <BarChart3 className="w-6 h-6" />,
      href: "/boutique/services/audit",
      features: [
        "Analyse financière",
        "Contrôle de gestion",
        "Tableaux de bord",
        "Prévisionnel",
      ],
      color: "from-amber-500 to-orange-400",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      size: "medium",
      gridPosition: {
        col: "col-span-2",
        row: "row-span-2",
        colStart: "col-start-3",
        rowStart: "row-start-3",
      },
    },
    {
      id: "accompagnement",
      title: "Accompagnement & Conseil",
      description:
        "Un partenariat stratégique pour transformer vos idées en réussite entrepreneuriale.",
      icon: <Users className="w-6 h-6" />,
      href: "/boutique/services/accompagnement",
      features: [
        "Stratégie commerciale",
        "Business plan",
        "Micro-projets",
        "Coaching",
      ],
      color: "from-rose-500 to-pink-400",
      popularity: "best",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
      size: "medium",
      gridPosition: {
        col: "col-span-2",
        row: "row-span-2",
        colStart: "col-start-5",
        rowStart: "row-start-3",
      },
    },
  ];

  const getPopularityBadge = (popularity?: string) => {
    switch (popularity) {
      case "popular":
        return (
          <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500" />
            Populaire
          </span>
        );
      case "new":
        return (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Nouveau
          </span>
        );
      case "best":
        return (
          <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Best-seller
          </span>
        );
      default:
        return null;
    }
  };

  // Version mobile (affichage en liste)
  if (isMobile) {
    return (
      <section
        id="virtuose-services"
        className="relative py-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50/30 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50 mb-4">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Virtuose Pro
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Votre Alliée Professionnelle
            </h2>
            <p className="text-lg text-gray-600">
              Des services de haut niveau pour libérer votre potentiel
              entrepreneurial.
            </p>
          </div>

          <div className="space-y-4">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div
                  className={`h-1 w-full bg-linear-to-r ${service.color}`}
                ></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl bg-linear-to-br ${service.color} text-white`}
                      >
                        {service.icon}
                      </div>
                      <h3 className="font-bold text-gray-800">
                        {service.title}
                      </h3>
                    </div>
                    {service.popularity &&
                      getPopularityBadge(service.popularity)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {service.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 2 && (
                      <span className="text-xs text-blue-600">
                        +{service.features.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-blue-600">
                      En savoir plus
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/boutique/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              Découvrir tous nos services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Version tablette/PC - Nouvelle grille 6x4 avec images de fond
  return (
    <section
      id="virtuose-services"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50/30 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-amber-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* En-tête de section */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50 mb-4">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Virtuose Pro
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Votre Alliée Professionnelle
          </h2>
          <p className="text-lg lg:text-xl text-gray-600">
            Des services de haut niveau pour libérer votre potentiel
            entrepreneurial et professionnaliser votre activité.
          </p>
        </div>

        {/* Nouvelle grille 6x4 avec images de fond */}
        <div className="grid grid-cols-6 grid-rows-4 gap-5 min-h-150">
          {/* Service 1: Secrétariat & Rédaction - col-span-2 row-span-4 */}
          <Link
            href={services[0].href}
            className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden col-span-2 row-span-4 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            } ${hoveredService === services[0].id ? "scale-[1.02] z-10" : "z-0"}`}
            style={{ transitionDelay: "0ms" }}
            onMouseEnter={() => setHoveredService(services[0].id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Image de fond */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${services[0].image})` }}
            />
            {/* Overlay sombre pour lisibilité */}
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover:bg-black/40" />

            {/* Contenu */}
            <div className="relative z-10 h-full flex flex-col p-7 text-white">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl bg-linear-to-br ${services[0].color} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  {services[0].icon}
                </div>
                {services[0].popularity && (
                  <div className="shrink-0">
                    {getPopularityBadge(services[0].popularity)}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                {services[0].title}
              </h3>
              <p className="text-white/90 leading-relaxed mb-4 flex-1">
                {services[0].description}
              </p>
              <ul className="space-y-2 mb-4">
                {services[0].features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-white/90"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-auto">
                <span className="font-medium text-white group-hover:text-blue-300 transition-colors">
                  En savoir plus
                </span>
                <ArrowRight className="w-5 h-5 text-white transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </div>
            </div>

            {/* Effet de brillance au survol */}
            <div
              className={`absolute inset-0 bg-linear-to-br from-white/0 via-white/10 to-transparent pointer-events-none transition-opacity duration-500 ${hoveredService === services[0].id ? "opacity-100" : "opacity-0"}`}
            ></div>
            <div
              className={`absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none transition-all duration-500 ${hoveredService === services[0].id ? "border-blue-400/50" : "border-transparent"}`}
            ></div>
          </Link>

          {/* Service 2: Bureautique Avancée - col-span-4 row-span-2 col-start-3 */}
          <Link
            href={services[1].href}
            className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden col-span-4 row-span-2 col-start-3 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            } ${hoveredService === services[1].id ? "scale-[1.02] z-10" : "z-0"}`}
            style={{ transitionDelay: "100ms" }}
            onMouseEnter={() => setHoveredService(services[1].id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Image de fond */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${services[1].image})` }}
            />
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover:bg-black/40" />

            {/* Contenu */}
            <div className="relative z-10 h-full flex flex-col p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-2xl bg-linear-to-br ${services[1].color} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  {services[1].icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-300 transition-colors">
                {services[1].title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-3 flex-1">
                {services[1].description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {services[1].features.slice(0, 2).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {services[1].features.length > 2 && (
                  <span className="text-xs text-emerald-300">
                    +{services[1].features.length - 2}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/20 mt-auto">
                <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                  En savoir plus
                </span>
                <ArrowRight className="w-4 h-4 text-white transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </div>
            </div>

            <div
              className={`absolute inset-0 bg-linear-to-br from-white/0 via-white/10 to-transparent pointer-events-none transition-opacity duration-500 ${hoveredService === services[1].id ? "opacity-100" : "opacity-0"}`}
            ></div>
            <div
              className={`absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none transition-all duration-500 ${hoveredService === services[1].id ? "border-emerald-400/50" : "border-transparent"}`}
            ></div>
          </Link>

          {/* Service 3: Audit & Contrôle de Gestion - col-span-2 row-span-2 col-start-3 row-start-3 */}
          <Link
            href={services[2].href}
            className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden col-span-2 row-span-2 col-start-3 row-start-3 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            } ${hoveredService === services[2].id ? "scale-[1.02] z-10" : "z-0"}`}
            style={{ transitionDelay: "200ms" }}
            onMouseEnter={() => setHoveredService(services[2].id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Image de fond */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${services[2].image})` }}
            />
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover:bg-black/40" />

            {/* Contenu */}
            <div className="relative z-10 h-full flex flex-col p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-2xl bg-linear-to-br ${services[2].color} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  {services[2].icon}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-amber-300 transition-colors">
                {services[2].title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
                {services[2].description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {services[2].features.slice(0, 2).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {services[2].features.length > 2 && (
                  <span className="text-xs text-amber-300">
                    +{services[2].features.length - 2}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/20 mt-auto">
                <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                  En savoir plus
                </span>
                <ArrowRight className="w-4 h-4 text-white transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </div>
            </div>

            <div
              className={`absolute inset-0 bg-linear-to-br from-white/0 via-white/10 to-transparent pointer-events-none transition-opacity duration-500 ${hoveredService === services[2].id ? "opacity-100" : "opacity-0"}`}
            ></div>
            <div
              className={`absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none transition-all duration-500 ${hoveredService === services[2].id ? "border-amber-400/50" : "border-transparent"}`}
            ></div>
          </Link>

          {/* Service 4: Accompagnement & Conseil - col-span-2 row-span-2 col-start-5 row-start-3 */}
          <Link
            href={services[3].href}
            className={`group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden col-span-2 row-span-2 col-start-5 row-start-3 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            } ${hoveredService === services[3].id ? "scale-[1.02] z-10" : "z-0"}`}
            style={{ transitionDelay: "300ms" }}
            onMouseEnter={() => setHoveredService(services[3].id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {/* Image de fond */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${services[3].image})` }}
            />
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover:bg-black/40" />

            {/* Contenu */}
            <div className="relative z-10 h-full flex flex-col p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-2xl bg-linear-to-br ${services[3].color} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  {services[3].icon}
                </div>
                {services[3].popularity && (
                  <div className="shrink-0">
                    {getPopularityBadge(services[3].popularity)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-rose-300 transition-colors">
                {services[3].title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
                {services[3].description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {services[3].features.slice(0, 2).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {services[3].features.length > 2 && (
                  <span className="text-xs text-rose-300">
                    +{services[3].features.length - 2}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/20 mt-auto">
                <span className="text-sm font-medium text-white group-hover:text-rose-300 transition-colors">
                  En savoir plus
                </span>
                <ArrowRight className="w-4 h-4 text-white transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </div>
            </div>

            <div
              className={`absolute inset-0 bg-linear-to-br from-white/0 via-white/10 to-transparent pointer-events-none transition-opacity duration-500 ${hoveredService === services[3].id ? "opacity-100" : "opacity-0"}`}
            ></div>
            <div
              className={`absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none transition-all duration-500 ${hoveredService === services[3].id ? "border-rose-400/50" : "border-transparent"}`}
            ></div>
          </Link>
        </div>

        {/* CTA global */}
        <div
          className={`text-center mt-12 transform transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Link
            href="/boutique/services"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105"
          >
            Découvrir tous nos services
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              Confidentiel
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              Réponse sous 24h
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-amber-500" />
              Support WhatsApp
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtuoseProServices;
