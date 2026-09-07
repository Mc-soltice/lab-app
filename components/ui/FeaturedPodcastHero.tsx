"use client";

import { Pause, Play } from "lucide-react";
import React from "react";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
}

interface Props {
  podcast: Podcast;
  isPlaying?: boolean;
  onPlayToggle: (id: string) => void;
}

const FeaturedPodcastHero: React.FC<Props> = ({
  podcast,
  isPlaying,
  onPlayToggle,
}) => {
  const bg = podcast.coverImage || "/assets/hero-fallback.jpg";

  return (
    <section className="w-full mb-8 rounded-xl overflow-hidden shadow-lg relative">
      <div
        className="w-full h-64 sm:h-80 lg:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bg})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white py-8 sm:py-12">
              <span className="inline-block text-xs uppercase tracking-wider bg-amber-600/80 px-3 py-1 rounded-full font-semibold mb-3">
                Épisode à la une
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight mb-3">
                {podcast.title}
              </h2>
              {podcast.description && (
                <p className="text-sm sm:text-base text-white/90 mb-4">
                  {podcast.description}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlayToggle(podcast.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-(--text-primary) font-medium shadow hover:opacity-95 transition-all"
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Écouter</span>
                </button>
                <button className="px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                  Plus d'infos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPodcastHero;
