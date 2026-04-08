"use client";

import { useState } from "react";
import { DesignObject } from "@/lib/types";
import { popSound, clickSound } from "@/lib/sounds";

interface MasonryGridProps {
  objects: DesignObject[];
  onObjectClick: (obj: DesignObject) => void;
}

function MasonryItem({
  obj,
  onClick,
}: {
  obj: DesignObject;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="masonry-item cursor-pointer group"
      onClick={() => { clickSound(); onClick(); }}
      onMouseEnter={() => popSound()}
    >
      <div className="glass-card overflow-hidden p-2">
        <div className="relative overflow-hidden rounded-xl">
          {!loaded && (
            <div className="w-full aspect-square shimmer rounded-xl" />
          )}
          <img
            src={obj.thumbnailUrl}
            alt={obj.title}
            className={`w-full block rounded-xl transition-all duration-500 ${
              loaded ? "opacity-100" : "opacity-0 absolute inset-0"
            } group-hover:scale-[1.03]`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
          {/* Glossy hover overlay */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,180,216,0.08) 100%)",
            }}
          />
        </div>
        {/* Title bar */}
        <div className="px-1.5 pt-2 pb-1">
          <p className="text-xs font-medium text-foreground truncate">
            {obj.title}
          </p>
          <p className="text-[10px] text-muted truncate">
            {obj.designer} {obj.date && `· ${obj.date}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MasonryGrid({ objects, onObjectClick }: MasonryGridProps) {
  if (objects.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="glass-card inline-block px-8 py-6">
          <p className="text-muted text-sm">No objects found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="masonry">
      {objects.map((obj) => (
        <MasonryItem
          key={obj.id}
          obj={obj}
          onClick={() => onObjectClick(obj)}
        />
      ))}
    </div>
  );
}
