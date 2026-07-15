"use client";

import { useEffect, useState } from "react";
import ProductImage from "./ProductImage";

export default function Hero() {
  const slides = [
    {
      badge: "Communauté",
      title: "Un espace pour s'élever, apprendre et s'affirmer",
      description:
        "VirtualLab est une plateforme dédiée aux femmes qui souhaitent évoluer, se découvrir et construire une vie alignée avec leurs ambitions.",
    },
    {
      badge: "Inspiration",
      title: "Des contenus qui nourrissent ton esprit au quotidien",
      description:
        "Podcasts, ebooks et conseils pratiques pour t'accompagner dans ton développement personnel et t'aider à avancer chaque jour.",
    },
    {
      badge: "Bien-être",
      title: "Des astuces simples pour transformer ton quotidien",
      description:
        "Organisation, confiance en soi, relations, mindset… découvre des clés concrètes pour améliorer ta vie pas à pas.",
    },
    {
      badge: "Empowerment",
      title: "Prends ta place. Assume qui tu es.",
      description:
        "VirtualLab est un espace où chaque femme peut grandir, s'exprimer librement et reprendre le contrôle de sa vie.",
    },
    {
      badge: "Voix",
      title: "Écoute, apprends et reconnecte-toi à toi-même",
      description:
        "Nos podcasts et contenus sont pensés pour t'inspirer, te motiver et t'aider à avancer à ton rythme.",
    },
    {
      badge: "Évolution",
      title: "Chaque petit pas compte",
      description:
        "Avec des conseils concrets et accessibles, transforme ton quotidien et construis la version de toi que tu veux devenir.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Auto slide toutes les 7s avec animation fondu plus lente
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setIsFading(false);
      }, 600);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="w-full min-h-screen overflow-hidden">
      {/* Background image optimisée */}
      <ProductImage
        src="/hero.png"
        alt="Hero background"
        fill
        className="object-cover object-center"
      />

      {/* Dark linear overlay - adapté mobile */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content - Mobile First avec tailles progressives */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-12 flex flex-col gap-3 sm:gap-4">
        {/* Badge dynamique */}
        <span
          className={`w-fit text-white text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-1000 ${
            isFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          {current.badge}
        </span>

        {/* Title dynamique - tailles responsives */}
        <h1
          className={`text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl transition-all duration-1000 ${
            isFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          {current.title}
        </h1>

        {/* Description dynamique - texte responsive */}
        <p
          className={`text-white/80 text-sm sm:text-base max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg leading-relaxed transition-all duration-1000 ${
            isFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          {current.description}
        </p>

        {/* Dots dynamiques - espacement responsive */}
        <div className="flex items-end justify-between mt-2 sm:mt-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsFading(true);
                  setTimeout(() => {
                    setIndex(i);
                    setIsFading(false);
                  }, 600);
                }}
                className={`transition-all duration-1000 ${
                  i === index
                    ? "w-6 sm:w-8 bg-white"
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/60"
                } h-1.5 sm:h-2 rounded-full`}
                aria-label={`Aller au slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
