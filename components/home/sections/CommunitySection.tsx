// components/sections/CommunitySection.tsx
"use client";

import {
  ArrowRight,
  Award,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface EventCard {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "webinar" | "podcast" | "workshop" | "meetup";
  icon: React.ReactNode;
  href: string;
  color: string;
  spots?: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

interface CommunityBenefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const CommunitySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("community");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const events: EventCard[] = [
    {
      id: "webinar-1",
      title: "Comment financer son projet entrepreneurial",
      description:
        "Découvrez les sources de financement accessibles aux femmes entrepreneures au Cameroun.",
      date: "25 juin 2024",
      time: "18h00",
      type: "webinar",
      icon: <Video className="w-5 h-5" />,
      href: "/webinaires/financement",
      color: "from-blue-500 to-cyan-400",
      spots: 45,
    },
    {
      id: "podcast-1",
      title: "Leadership au féminin : Témoignages inspirants",
      description:
        "Des femmes leaders partagent leur parcours, leurs défis et leurs clés de succès.",
      date: "28 juin 2024",
      time: "16h00",
      type: "podcast",
      icon: <Headphones className="w-5 h-5" />,
      href: "/podcasts/leadership",
      color: "from-purple-500 to-pink-400",
      spots: 60,
    },
    {
      id: "workshop-1",
      title: "Maîtrisez les outils digitaux pour votre business",
      description:
        "Workshop pratique sur les outils essentiels pour gérer efficacement votre entreprise.",
      date: "2 juillet 2024",
      time: "14h00",
      type: "workshop",
      icon: <GraduationCap className="w-5 h-5" />,
      href: "/workshops/digital",
      color: "from-emerald-500 to-teal-400",
      spots: 30,
    },
    {
      id: "meetup-1",
      title: "Meetup : Networking féminin à Douala",
      description:
        "Rencontrez d'autres femmes entrepreneures dans une ambiance conviviale et inspirante.",
      date: "6 juillet 2024",
      time: "17h00",
      type: "meetup",
      icon: <Users className="w-5 h-5" />,
      href: "/meetups/douala",
      color: "from-amber-500 to-orange-400",
      spots: 25,
    },
  ];
  // Auto-rotation des événements
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const benefits: CommunityBenefit[] = [
    {
      id: "1",
      title: "Webinaires exclusifs",
      description:
        "Accédez à des sessions en direct avec des experts sur des thématiques variées.",
      icon: <Video className="w-5 h-5" />,
      href: "/webinaires",
    },
    {
      id: "2",
      title: "Podcasts inspirants",
      description:
        "Écoutez les témoignages et conseils de femmes qui ont réussi.",
      icon: <Headphones className="w-5 h-5" />,
      href: "/podcasts",
    },
    {
      id: "3",
      title: "Groupe privé WhatsApp",
      description: "Échangez avec une communauté bienveillante et solidaire.",
      icon: <MessageCircle className="w-5 h-5" />,
      href: "https://wa.me/237XXXXXXXXX",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Aïcha M.",
      role: "Fondatrice de Aïcha Beauty",
      content:
        "BAL & Virtuose Pro m'a offert bien plus qu'une plateforme. Une véritable famille qui croit en moi et m'aide à grandir.",
      rating: 5,
      image: "/images/testimonials/aicha.jpg",
    },
    {
      id: "2",
      name: "Claire N.",
      role: "CEO de Claire Consulting",
      content:
        "Les webinaires et la communauté m'ont permis de développer mon réseau et d'acquérir des compétences essentielles.",
      rating: 5,
      image: "/images/testimonials/claire.jpg",
    },
  ];

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
    <section id="community" className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-50/20 via-white to-pink-50/20 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* En-tête de section */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-100/50 mb-4">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Communauté LAB
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Rejoignez le Mouvement
          </h2>
          <p className="text-lg lg:text-xl text-gray-600">
            Une communauté engagée, bienveillante et solidaire où chaque femme
            trouve sa place et son soutien.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Colonne gauche : Événements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Événements à venir */}
            <div
              className={`transform transition-all duration-700 delay-100 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  Événements à venir
                </h3>
                <Link
                  href="/evenements"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-purple-100/30 p-6">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${activeEventIndex * 100}%)`,
                  }}
                >
                  {events.map((event) => (
                    <div key={event.id} className="min-w-full px-2">
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div
                          className={`shrink-0 p-4 bg-linear-to-br ${event.color} rounded-2xl text-white flex items-center justify-center md:w-24 md:h-24`}
                        >
                          {event.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 text-gray-700`}
                            >
                              {event.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.date} - {event.time}
                            </span>
                            {event.spots && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.spots} places
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-gray-800">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          <Link
                            href={event.href}
                            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            S'inscrire maintenant
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicateurs */}
                <div className="flex justify-center gap-2 mt-4">
                  {events.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveEventIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === activeEventIndex
                          ? "w-8 bg-purple-500"
                          : "bg-purple-200 hover:bg-purple-300"
                      }`}
                      aria-label={`Événement ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Avantages de la communauté */}
            <div
              className={`grid sm:grid-cols-3 gap-4 transform transition-all duration-700 delay-200 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {benefits.map((benefit) => (
                <Link
                  key={benefit.id}
                  href={benefit.href}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-100/30 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                >
                  <div className="inline-flex p-3 bg-linear-to-br from-purple-100 to-pink-100 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform mb-2">
                    {benefit.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {benefit.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne droite : Témoignages et Engagement */}
          <div className="space-y-6">
            {/* Témoignages */}
            <div
              className={`transform transition-all duration-700 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-purple-100/30 p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Témoignages
                </h3>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="space-y-2">
                    <div className="flex gap-0.5">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Engagement */}
            <div
              className={`transform transition-all duration-700 delay-400 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white text-center">
                <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Prête à rejoindre l'aventure ?
                </h3>
                <p className="text-sm text-white/90 mb-4">
                  Inscrivez-vous à notre newsletter et recevez des contenus
                  exclusifs chaque semaine.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-white text-purple-700 font-medium rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Je m'inscris
                  </button>
                </form>
                <p className="text-xs text-white/70 mt-2 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Rejoignez +500 femmes déjà inscrites
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de section */}
        <div
          className={`mt-12 text-center transform transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              Communauté internationale
            </span>
            <span className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              1000+ membres
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Reconnaissance nationale
            </span>
            <Link
              href="/communaute"
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              Découvrir la communauté
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
