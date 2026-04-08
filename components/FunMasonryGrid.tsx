"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FunItem } from "@/lib/types";
import { popSound, clickSound } from "@/lib/sounds";
import CocktailIllustration from "@/components/CocktailIllustration";

interface FunMasonryGridProps {
  items: FunItem[];
  section: "cigarettes" | "cocktails";
}

function FunMasonryItem({
  item,
  section,
}: {
  item: FunItem;
  section: "cigarettes" | "cocktails";
}) {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  function handleClick() {
    clickSound();
    if (section === "cigarettes") {
      router.push(`/fun/cigarettes/${item.id}?brand=${encodeURIComponent(item.subtitle)}`);
    } else {
      router.push(`/fun/cocktails/${item.id}`);
    }
  }

  return (
    <div
      className="masonry-item cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => popSound()}
    >
      {section === "cocktails" ? (
        <div
          className="glass-card p-4 flex flex-col items-center gap-3 group-hover:scale-[1.03] transition-transform duration-300"
          style={{ minHeight: 140 }}
        >
          <div className="flex items-center justify-center w-full" style={{ minHeight: 90 }}>
            <CocktailIllustration name={item.title} size={88} />
          </div>
          <p className="text-xs font-semibold text-foreground text-center leading-tight">{item.title}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden p-2">
          <div className="relative overflow-hidden rounded-xl">
            {!loaded && <div className="w-full aspect-square shimmer rounded-xl" />}
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`w-full block rounded-xl transition-all duration-500 ${
                loaded ? "opacity-100" : "opacity-0 absolute inset-0"
              } group-hover:scale-[1.03]`}
              onLoad={() => setLoaded(true)}
              loading="lazy"
            />
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,180,216,0.08) 100%)",
              }}
            />
          </div>
          <div className="px-1.5 pt-2 pb-1">
            <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
            <p className="text-[10px] text-muted truncate">
              {item.subtitle}
              {item.detail && ` · ${item.detail}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FunMasonryGrid({ items, section }: FunMasonryGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="glass-card inline-block px-8 py-6">
          <p className="text-muted text-sm">Nothing found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="masonry">
      {items.map((item) => (
        <FunMasonryItem key={item.id} item={item} section={section} />
      ))}
    </div>
  );
}
