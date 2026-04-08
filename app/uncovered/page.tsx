"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DesignObject } from "@/lib/types";
import { clickSound, discoverSound, popSound, navigateSound } from "@/lib/sounds";

export default function UncoveredPage() {
  const [discovered, setDiscovered] = useState<DesignObject[]>([]);
  const [current, setCurrent] = useState<DesignObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const router = useRouter();

  const discover = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setImgLoaded(false);

    try {
      const res = await fetch("/api/objects/discover");
      const obj = await res.json();

      if (obj.error) {
        console.error(obj.error);
        return;
      }

      if (discovered.some((d) => d.id === obj.id)) {
        setLoading(false);
        discover();
        return;
      }

      setCurrent(obj);
      setDiscovered((prev) => [obj, ...prev]);
      discoverSound();
    } catch (err) {
      console.error("Discovery failed:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, discovered]);

  return (
    <div className="px-6 max-w-[1800px] mx-auto pb-12">
      {/* Header */}
      <div className="mt-6 mb-10">
        <div className="glass-card inline-block px-6 py-4 max-w-lg">
          <h1 className="text-2xl font-semibold text-foreground">archive explored</h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            design objects appear as we look at a new piece for the first time.
            the collection grows the more we explore.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, #4fc3f7, #38b000)",
                boxShadow: `0 0 ${8 + discovered.length * 2}px rgba(0,180,216,${Math.min(0.5, 0.15 + discovered.length * 0.03)})`,
              }}
            />
            <p className="text-xs text-foreground">
              <strong>{discovered.length}</strong> objects uncovered
            </p>
          </div>
        </div>
      </div>

      {/* Discover button */}
      <button
        onClick={() => { clickSound(); discover(); }}
        disabled={loading}
        onMouseEnter={() => popSound()}
        className={`aero-btn mb-10 ${loading ? "aero-btn" : "aero-btn-accent"}`}
        style={loading ? { opacity: 0.7, cursor: "wait" } : {}}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #4fc3f7, #00b4d8)",
                animation: "float 1.5s ease-in-out infinite",
              }}
            />
            discovering...
          </span>
        ) : (
          "uncover a new piece"
        )}
      </button>

      {/* Current reveal */}
      {current && (
        <div
          className="mb-14 max-w-md cursor-pointer group"
          onClick={() => { navigateSound(); router.push(`/object/${current.id}`); }}
        >
          <div className="glass-card overflow-hidden p-3">
            <div className="relative overflow-hidden rounded-xl">
              {!imgLoaded && (
                <div className="w-full aspect-square shimmer rounded-xl" />
              )}
              <img
                src={current.imageUrl}
                alt={current.title}
                className={`w-full block rounded-xl transition-all duration-700 ${
                  imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                } group-hover:scale-[1.02]`}
                onLoad={() => setImgLoaded(true)}
              />
              {/* Glossy reflection */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)",
                }}
              />
            </div>
            <div className="px-2 pt-3 pb-1">
              <h3 className="text-base font-medium text-foreground group-hover:text-accent transition-colors">
                {current.title}
              </h3>
              <p className="text-sm text-muted">{current.designer}</p>
              <p className="text-sm text-muted">{current.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Previously discovered */}
      {discovered.length > 1 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-4 font-medium">
            Previously uncovered
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {discovered.slice(1).map((obj) => (
              <div
                key={obj.id}
                className="cursor-pointer group"
                onClick={() => { clickSound(); router.push(`/object/${obj.id}`); }}
              >
                <div className="glass-card overflow-hidden p-1.5">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={obj.thumbnailUrl}
                      alt={obj.title}
                      className="w-full block rounded-lg group-hover:scale-[1.05] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted mt-1.5 truncate group-hover:text-foreground transition-colors px-1">
                  {obj.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
