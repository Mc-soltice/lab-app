// app/(public)/apropos/page.tsx
"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Globe,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Quote,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// --- COMPOSANTS INTERNES ---

// Composant pour la timeline
const Timeline = ({
  items,
}: {
  items: { year: string; title: string; description: string }[];
}) => {
  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-linear-to-b from-amber-400 via-rose-400 to-purple-400"></div>

      {items.map((item, index) => (
        <div
          key={index}
          className={`flex items-center mb-12 last:mb-0 ${
            index % 2 === 0 ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* Point sur la timeline */}
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-amber-500 rounded-full z-10"></div>

          {/* Contenu */}
          <div
            className={`w-5/12 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
                {item.year}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mt-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant pour les valeurs
const ValueCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) => {
  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className={`inline-flex p-3 rounded-2xl bg-linear-to-br ${color} text-white mb-4 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Composant pour les membres de l'équipe (sans réseaux sociaux)
const TeamMember = ({
  name,
  role,
  bio,
  image,
}: {
  name: string;
  role: string;
  bio: string;
  image: string;
}) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10"></div>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
            <h3 className="font-bold text-gray-800">{name}</h3>
            <p className="text-sm text-rose-600">{role}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
      </div>
    </div>
  );
};

// Composant pour les chiffres clés
const StatCounter = ({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const target = parseInt(value.replace(/[^0-9]/g, ""));
    if (isNaN(target)) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        current = target;
        clearInterval(timer);
        setHasAnimated(true);
      }
      setCount(Math.floor(current));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, hasAnimated]);

  return (
    <div className="text-center">
      <div className="inline-flex p-3 rounded-2xl bg-white shadow-lg mb-3">
        {icon}
      </div>
      <div className="text-3xl lg:text-4xl font-bold text-gray-800">
        {value.includes("+")
          ? `${count}+`
          : value.includes("%")
            ? `${count}%`
            : count}
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

// --- PAGE PRINCIPALE ---

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Données de la timeline
  const timelineData = [
    {
      year: "2022",
      title: "La Naissance d'une Vision",
      description:
        "Création de LAB (Libres Authentiques et Belles) avec la mission d'accompagner les femmes camerounaises vers leur épanouissement personnel et professionnel.",
    },
    {
      year: "2023",
      title: "Lancement du Blog LAB",
      description:
        "Ouverture du web magazine avec les premières rubriques : Intimité, Spiritualité, Culture, Bien-être et Boss Lady.",
    },
    {
      year: "2024",
      title: "Naissance de Virtuose Pro",
      description:
        "Lancement des services professionnels pour TPE/PME : secrétariat, comptabilité, création graphique, formations et accompagnement.",
    },
    {
      year: "2024",
      title: "Ouverture de la Maison LAB",
      description:
        'Inauguration de la boutique physique "La Maison LAB & Espace Virtuose Pro" à Douala, un lieu de rencontre et d\'expériences.',
    },
  ];

  // Données des valeurs
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Authenticité",
      description:
        "Nous croyons en la force de la vérité et de la transparence. Chaque femme mérite d'être célébrée dans sa singularité.",
      color: "from-rose-400 to-pink-400",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confiance & Confidentialité",
      description:
        "La confiance est le pilier de notre relation. Nous protégeons vos données et respectons votre vie privée en toutes circonstances.",
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description:
        "Nous sommes constamment à la recherche de nouvelles solutions pour répondre aux besoins évolutifs des femmes entrepreneures.",
      color: "from-amber-400 to-orange-400",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Soutien Communautaire",
      description:
        "La force du collectif est au cœur de notre approche. Ensemble, nous sommes plus fortes et plus résilientes.",
      color: "from-purple-400 to-indigo-400",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Émancipation",
      description:
        "Nous accompagnons chaque femme dans la découverte de son pouvoir et l'affirmation de son leadership.",
      color: "from-emerald-400 to-teal-400",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Excellence",
      description:
        "Nous visons l'excellence dans tous nos services et contenus, pour offrir le meilleur à notre communauté.",
      color: "from-rose-400 to-amber-400",
    },
  ];

  // Données de l'équipe (sans réseaux sociaux)
  const teamMembers = [
    {
      name: "Marie-Claire N.",
      role: "Fondatrice & Directrice Générale",
      bio: "Experte en gestion d'entreprise et passionnée par l'autonomisation des femmes. Marie-Claire a fondé LAB pour créer un espace où chaque femme peut réaliser son plein potentiel.",
      image: "/images/team/marie-claire.jpg",
    },
    {
      name: "Sarah K.",
      role: "Responsable Editorial & Contenu",
      bio: "Journaliste et rédactrice passionnée, Sarah dirige le Blog LAB avec une plume sensible et engagée, explorant les thématiques qui touchent les femmes camerounaises.",
      image: "/images/team/sarah-k.jpg",
    },
    {
      name: "Amina D.",
      role: "Directrice des Services Virtuose Pro",
      bio: "Experte-comptable et consultante, Amina supervise les services professionnels pour garantir une qualité et une fiabilité exemplaires aux TPE/PME.",
      image: "/images/team/amina-d.jpg",
    },
    {
      name: "Chantal M.",
      role: "Responsable Marketing & Communication",
      bio: "Spécialiste en marketing digital, Chantal développe la stratégie de communication pour faire rayonner LAB et Virtuose Pro au Cameroun et au-delà.",
      image: "/images/team/chantal-m.jpg",
    },
  ];

  // Chiffres clés
  const stats = [
    {
      value: "500+",
      label: "Femmes Accompagnées",
      icon: <Users className="w-6 h-6 text-amber-500" />,
    },
    {
      value: "200+",
      label: "Articles Publiés",
      icon: <BookOpen className="w-6 h-6 text-rose-500" />,
    },
    {
      value: "15+",
      label: "Services Proposés",
      icon: <Award className="w-6 h-6 text-emerald-500" />,
    },
    {
      value: "98%",
      label: "Taux de Satisfaction",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
    },
  ];

  // Témoignages
  const testimonials = [
    {
      quote:
        "LAB m'a offert bien plus qu'une plateforme. Une véritable famille qui croit en moi et m'aide à grandir chaque jour.",
      author: "Aïcha M.",
      role: "Fondatrice de Aïcha Beauty",
    },
    {
      quote:
        "Les services Virtuose Pro ont transformé la gestion de mon entreprise. Professionnalisme, réactivité et une qualité exceptionnelle.",
      author: "Claire N.",
      role: "CEO de Claire Consulting",
    },
    {
      quote:
        "Le blog LAB est ma source d'inspiration quotidienne. Les articles sont profonds, authentiques et toujours pertinents.",
      author: "Fatima B.",
      role: "Entrepreneure en création",
    },
  ];

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-50/30 via-white to-rose-50/30 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-amber-100/50 mb-6">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium text-rose-700">
                  Notre Histoire
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Libres, Authentiques et Belles
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Découvrez l'histoire de BAL & Virtuose Pro, une plateforme née
                de la conviction que chaque femme mérite d'être accompagnée dans
                son épanouissement personnel et professionnel.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Link
                  href="#histoire"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-amber-500 to-rose-500 text-white font-medium rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Découvrir notre histoire
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#equipe"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 font-medium rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 border border-amber-100/50"
                >
                  Rencontrer l'équipe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <StatCounter {...stat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HISTOIRE SECTION --- */}
      <section id="histoire" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-10 opacity-0"
                }`}
              >
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
                  Notre Vision
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-6">
                  Plus qu'une plateforme,
                  <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
                    un mouvement
                  </span>
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <span className="font-semibold text-gray-800">
                      LAB (Libres Authentiques et Belles)
                    </span>{" "}
                    est né d'un constat : les femmes camerounaises manquent d'un
                    espace dédié où elles peuvent trouver à la fois inspiration,
                    soutien et outils concrets pour leur épanouissement.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Virtuose Pro
                    </span>{" "}
                    est venu compléter cette vision en offrant des services
                    professionnels de haute qualité aux TPE/PME, permettant aux
                    femmes entrepreneures de se concentrer sur l'essentiel : le
                    développement de leur business.
                  </p>
                  <p>
                    Aujourd'hui,{" "}
                    <span className="font-semibold text-gray-800">
                      BAL & Virtuose Pro
                    </span>{" "}
                    est un écosystème complet qui accompagne les femmes à chaque
                    étape de leur parcours, de l'inspiration à la concrétisation
                    de leurs projets.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Web Magazine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">E-commerce</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Services Professionnels
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Communauté</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Timeline items={timelineData} />
            </div>
          </div>
        </div>
      </section>

      {/* --- VALEURS SECTION --- */}
      <section className="py-20 lg:py-28 bg-white/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-rose-600 uppercase tracking-wider">
              Nos Valeurs
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-4">
              Ce qui nous anime
            </h2>
            <p className="text-lg text-gray-600">
              Des valeurs qui guident chacune de nos actions et façonnent notre
              relation avec notre communauté.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <ValueCard {...value} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ÉQUIPE SECTION --- */}
      <section id="equipe" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Notre Équipe
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-4">
              Des femmes passionnées
            </h2>
            <p className="text-lg text-gray-600">
              Une équipe dévouée, experte dans son domaine et animée par la même
              mission : accompagner les femmes vers leur réussite.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <TeamMember {...member} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TÉMOIGNAGES SECTION --- */}
      <section className="py-20 lg:py-28 bg-white/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
              Témoignages
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-4">
              Elles parlent de nous
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Quote className="w-8 h-8 text-amber-400 mb-4" />
                <p className="text-gray-600 leading-relaxed italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ENGAGEMENTS SECTION --- */}
      <section className="py-20 lg:py-28 bg-linear-to-br from-amber-50/50 via-white to-rose-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-rose-600 uppercase tracking-wider">
                Nos Engagements
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-6">
                Pourquoi nous choisir
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1 p-2 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Qualité et Professionnalisme
                    </h3>
                    <p className="text-sm text-gray-600">
                      Des services rigoureux et des contenus de qualité, validés
                      par des experts.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1 p-2 bg-blue-100 rounded-full">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Confidentialité et Sécurité
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vos données sont protégées et vos échanges restent
                      strictement confidentiels.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1 p-2 bg-amber-100 rounded-full">
                    <Heart className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Approche Humaine
                    </h3>
                    <p className="text-sm text-gray-600">
                      Une écoute attentive et un accompagnement personnalisé à
                      chaque étape.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1 p-2 bg-purple-100 rounded-full">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Impact Social
                    </h3>
                    <p className="text-sm text-gray-600">
                      Nous contribuons activement à l'autonomisation des femmes
                      et au développement local.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/30">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Prête à nous rejoindre ?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      WhatsApp Business
                    </p>
                    <a
                      href="https://wa.me/237XXXXXXXXX"
                      className="text-sm text-amber-600 hover:text-amber-700"
                    >
                      +237 6 XX XX XX XX
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <a
                      href="mailto:contact@labvirtuosepro.com"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      contact@labvirtuosepro.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-rose-100 rounded-full">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Adresse</p>
                    <p className="text-sm text-gray-600">Douala, Cameroun</p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="block w-full text-center px-6 py-3 bg-linear-to-r from-amber-500 to-rose-500 text-white font-medium rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
