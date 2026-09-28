"use client";

import { Bookmark, Check, Mail, Star } from "lucide-react";
import Image from "next/image";

const designer = {
  name: "Natasha Romanoff",
  image:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=90",
  description: "I'm a Brand Designer who focuses on clarity & emotional connection.",
  rating: "4.8",
  earned: "$45k+",
  rate: "$50/hr",
};

function VerifiedBadge() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
      <Check size={9} strokeWidth={3} className="text-white" />
    </span>
  );
}

function Stats({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`grid grid-cols-3 ${dark ? "text-white" : "text-black"}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <Star size={14} fill="#e6a23c" className="text-[#e6a23c]" />
          <span className="text-sm font-semibold">{designer.rating}</span>
        </div>

        <span
          className={`mt-1 text-[11px] ${dark ? "text-white/60" : "text-black/50"}`}
        >
          Rating
        </span>
      </div>

      <div
        className={`flex flex-col items-center border-x ${
          dark ? "border-white/20" : "border-black/10"
        }`}
      >
        <span className="text-sm font-semibold">{designer.earned}</span>

        <span
          className={`mt-1 text-[11px] ${dark ? "text-white/60" : "text-black/50"}`}
        >
          Earned
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold">{designer.rate}</span>

        <span
          className={`mt-1 text-[11px] ${dark ? "text-white/60" : "text-black/50"}`}
        >
          Rate
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CARD A                                                                     */
/* -------------------------------------------------------------------------- */

function CardA() {
  return (
    <div className="w-75 rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
      {/* Image */}
      <div className="relative overflow-hidden rounded-[22px]">
        <div className="relative h-67.5 w-full overflow-hidden">
          <Image
            src={designer.image}
            alt={designer.name}
            fill
            className="object-cover"
          />
        </div>

        <button className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-1 pb-1 pt-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[16px] font-bold">{designer.name}</h2>

          <VerifiedBadge />
        </div>

        <p className="mt-2 text-[12px] leading-[1.45] text-black/60">
          {designer.description}
        </p>

        <div className="mt-4">
          <Stats />
        </div>

        <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-[13px] font-medium text-white">
          <Mail size={16} />
          Get In Touch
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CARD B                                                                     */
/* -------------------------------------------------------------------------- */

function CardB() {
  return (
    <div className="w-75 rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
      <div className="relative h-114.5 overflow-hidden rounded-[22px]">
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={designer.image}
            alt={designer.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black" />

        {/* Bookmark */}
        <button className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
          <Bookmark size={18} />
        </button>

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-bold text-white">{designer.name}</h2>

            <VerifiedBadge />
          </div>

          <p className="mt-2 text-[12px] leading-[1.45] text-white/80">
            {designer.description}
          </p>

          <div className="mt-4">
            <Stats dark />
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[13px] font-medium text-black">
              <Mail size={16} />
              Get In Touch
            </button>

            <button className="flex h-11 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function ComparisonPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex items-center justify-center gap-14">
        {/* A */}
        <CardA />

        {/* B */}
        <CardB />
      </div>
    </main>
  );
}
