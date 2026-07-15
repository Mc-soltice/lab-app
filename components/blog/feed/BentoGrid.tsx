// app/blog/components/BentoGrid.tsx
"use client";

import ProductImage from "@/components/ProductImage";

interface BentoGridProps {
  bentoPosts: any[];
  handleViewBentoPost: (post: any) => void;
}

export default function BentoGrid({
  bentoPosts,
  handleViewBentoPost,
}: BentoGridProps) {
  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-2.5 aspect-4/3 sm:aspect-16/10 md:aspect-21/9 lg:aspect-21/8 w-full">
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const post = bentoPosts[idx];
        const gridClasses = [
          "col-span-4 row-span-4",
          "col-span-2 row-span-2 col-start-1 row-start-5",
          "col-span-2 row-span-2 col-start-3 row-start-5",
          "col-span-2 row-span-2 col-start-5 row-start-5",
          "col-span-2 row-span-2 col-start-5 row-start-3",
          "col-span-2 row-span-2 col-start-5 row-start-1",
        ][idx];

        return (
          <div
            key={idx}
            onClick={() => post && handleViewBentoPost(post)}
            className={`${gridClasses} relative overflow-hidden rounded-lg border group cursor-pointer`}
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {post?.imageUrl && (
              <ProductImage
                src={post.imageUrl}
                alt={`Bento item ${idx + 1}`}
                fill
                sizes="(min-width: 1024px) 570px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03] opacity-50 mix-blend-lighten"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span
                className="font-mono text-[9px] md:text-[10px] tracking-widest font-bold"
                style={{ color: "var(--accent)" }}
              >
                {idx === 0 ? "FEAT // [ 01 ]" : `[ 0${idx + 1} ]`}
              </span>
              {idx === 0 && (
                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  À la une
                </span>
              )}
            </div>

            <div
              className={
                idx === 0
                  ? "absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6"
                  : "absolute bottom-2.5 left-2.5 right-2.5"
              }
            >
              <span
                className="text-[9px] md:text-[10px] uppercase font-mono tracking-wider block mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {post?.category}
              </span>
              <h3
                className={`font-display font-medium tracking-tight leading-tight transition-colors ${
                  idx === 0
                    ? "text-sm sm:text-lg md:text-2xl mb-2"
                    : "text-[10px] sm:text-xs line-clamp-2"
                }`}
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                {post?.title}
              </h3>
              {idx === 0 && (
                <p
                  className="text-[10px] md:text-xs line-clamp-2 font-light hidden sm:block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post?.excerpt}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
