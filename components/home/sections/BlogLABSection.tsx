// components/sections/BlogLABSection.tsx
"use client";

import {
  ArrowRight,
  BookOpen,
  Clock,
  Crown,
  Eye,
  Feather,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  count: number;
}

interface ArticlePreview {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  comments: number;
  views: number;
  trending?: boolean;
}

const BlogLABSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("tous");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("blog-lab");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const categories: BlogCategory[] = [
    {
      id: "intimite",
      name: "Intimité au Féminin",
      description: "Sexualité, couple, parentalité, célibat",
      icon: <Heart className="w-5 h-5" />,
      href: "/blog/intimite",
      color: "from-rose-400 to-pink-300",
      count: 34,
    },
    {
      id: "spiritualite",
      name: "Spiritualité & Sens",
      description: "Croyances, harmonie intérieure, bien-être spirituel",
      icon: <Feather className="w-5 h-5" />,
      href: "/blog/spiritualite",
      color: "from-purple-400 to-indigo-300",
      count: 28,
    },
    {
      id: "culture",
      name: "Culture & Société",
      description: "Tabous, relations humaines, traditions",
      icon: <Users className="w-5 h-5" />,
      href: "/blog/culture",
      color: "from-amber-400 to-orange-300",
      count: 31,
    },
    {
      id: "bien-etre",
      name: "Bien-être & Leadership",
      description: "Sport, beauté, développement personnel",
      icon: <Sparkles className="w-5 h-5" />,
      href: "/blog/bien-etre",
      color: "from-emerald-400 to-teal-300",
      count: 42,
    },
    {
      id: "boss-lady",
      name: "Boss Lady",
      description: "Entrepreneuriat, finance, business",
      icon: <Crown className="w-5 h-5" />,
      href: "/blog/boss-lady",
      color: "from-blue-400 to-cyan-300",
      count: 37,
    },
  ];

  const articles: ArticlePreview[] = [
    {
      id: "1",
      title: "Comment oser l'entrepreneuriat féminin au Cameroun ?",
      excerpt:
        "Découvrez les clés pour transformer votre passion en entreprise florissante, les défis et les opportunités du marché camerounais.",
      category: "Boss Lady",
      author: "Marie-Claire N.",
      date: "15 juin 2024",
      readTime: "8 min",
      image: "/images/blog/entrepreneuriat.jpg",
      comments: 23,
      views: 245,
      trending: true,
    },
    {
      id: "2",
      title: "L'art de concilier maternité et carrière professionnelle",
      excerpt:
        "Témoignages et conseils pratiques pour trouver l'équilibre entre vie familiale et ambitions professionnelles.",
      category: "Intimité au Féminin",
      author: "Sarah K.",
      date: "12 juin 2024",
      readTime: "6 min",
      image: "/images/blog/maternite.jpg",
      comments: 18,
      views: 189,
    },
    {
      id: "3",
      title: "La spiritualité comme levier de développement personnel",
      excerpt:
        "Comment les pratiques spirituelles peuvent renforcer votre résilience et votre capacité à atteindre vos objectifs.",
      category: "Spiritualité & Sens",
      author: "Amina D.",
      date: "10 juin 2024",
      readTime: "5 min",
      image: "/images/blog/spiritualite.jpg",
      comments: 15,
      views: 156,
      trending: true,
    },
    {
      id: "4",
      title: "Les tendances de la mode éthique au Cameroun",
      excerpt:
        "Découvrez les créatrices locales qui réinventent la mode avec des matériaux durables et des designs uniques.",
      category: "Bien-être & Leadership",
      author: "Chantal M.",
      date: "8 juin 2024",
      readTime: "7 min",
      image: "/images/blog/mode-ethique.jpg",
      comments: 12,
      views: 134,
    },
  ];

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      "Boss Lady": "bg-blue-100 text-blue-700",
      "Intimité au Féminin": "bg-rose-100 text-rose-700",
      "Spiritualité & Sens": "bg-purple-100 text-purple-700",
      "Bien-être & Leadership": "bg-emerald-100 text-emerald-700",
      "Culture & Société": "bg-amber-100 text-amber-700",
    };
    return colors[categoryName] || "bg-gray-100 text-gray-700";
  };

  return (
    <section id="blog-lab" className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-50/30 via-white to-rose-50/30 -z-10">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* En-tête de section */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-amber-100/50 mb-4">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Blog LAB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            L'Inspiration au Quotidien
          </h2>
          <p className="text-lg lg:text-xl text-gray-600">
            Des articles qui nourrissent votre esprit, éclairent votre chemin et
            célèbrent la femme que vous êtes.
          </p>
        </div>

        {/* Catégories */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-12 transform transition-all duration-700 delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                activeCategory === category.id
                  ? `bg-linear-to-r ${category.color} text-white shadow-lg`
                  : "bg-white/70 backdrop-blur-sm text-gray-700 hover:shadow-md border border-amber-100/30"
              }`}
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory("tous")}
            >
              {category.icon}
              <span className="text-sm font-medium hidden sm:inline">
                {category.name}
              </span>
              <span className="text-xs opacity-70">({category.count})</span>
            </Link>
          ))}
        </div>

        {/* Articles en vedette */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Article principal */}
          <div
            className={`transform transition-all duration-700 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Link href={`/blog/${articles[0].id}`} className="group block">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 h-full">
                <div className="relative h-64 lg:h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10"></div>
                  {articles[0].trending && (
                    <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Tendance
                    </div>
                  )}
                  <Image
                    src={articles[0].image}
                    alt={articles[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(articles[0].category)}`}
                    >
                      {articles[0].category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {articles[0].readTime}
                    </span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {articles[0].title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {articles[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {articles[0].author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          {articles[0].author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {articles[0].date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {articles[0].comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {articles[0].views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Articles secondaires */}
          <div className="space-y-4">
            {articles.slice(1).map((article, index) => (
              <div
                key={article.id}
                className={`transform transition-all duration-700 delay-${300 + index * 100} ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <Link href={`/blog/${article.id}`} className="group block">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {article.trending && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Tendance
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 lg:p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(article.category)}`}
                          >
                            {article.category}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-linear-to-br from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                              {article.author.charAt(0)}
                            </div>
                            <span className="text-xs text-gray-500">
                              {article.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {article.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className={`text-center transform transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-amber-500 to-rose-500 text-white font-medium rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
          >
            Explorer tous les articles
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            Rejoignez la conversation •{" "}
            {categories.reduce((acc, cat) => acc + cat.count, 0)} articles
            publiés
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogLABSection;
