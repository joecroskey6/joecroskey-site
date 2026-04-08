"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DesignObjectDetail } from "@/lib/types";
import Link from "next/link";
import { backSound, popSound, clickSound } from "@/lib/sounds";

export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [obj, setObj] = useState<DesignObjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/objects/detail?id=${id}`)
      .then((r) => r.json())
      .then(setObj)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #4fc3f7, #00b4d8)",
                animation: "float 2s ease-in-out infinite",
              }}
            />
            <span className="text-sm text-muted">Loading object...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="glass-card px-8 py-6 text-center">
          <p className="text-muted text-sm mb-4">Object not found</p>
          <Link href="/" className="aero-btn text-sm">
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 pb-16">
      {/* Back button */}
      <button
        onClick={() => { backSound(); router.back(); }}
        onMouseEnter={() => popSound()}
        className="aero-btn mb-8 text-sm py-2 px-5"
      >
        ← back
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Image */}
        <div className="lg:flex-1 lg:max-w-[700px]">
          <div className="glass-card overflow-hidden p-3">
            <div className="relative rounded-xl overflow-hidden">
              {!imgLoaded && (
                <div className="w-full aspect-[3/4] shimmer rounded-xl" />
              )}
              <img
                src={obj.imageUrl}
                alt={obj.title}
                className={`w-full rounded-xl transition-opacity duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0 h-0"
                }`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:w-[420px] shrink-0">
          <div className="glass-card p-6">
            <h1 className="text-2xl font-semibold leading-tight text-foreground">
              {obj.title}
            </h1>
            <p className="text-base text-muted mt-1">{obj.designer}</p>
            <p className="text-base text-muted">{obj.date}</p>

            {obj.description && (
              <p className="text-sm text-foreground/80 mt-5 leading-relaxed">
                {obj.description}
              </p>
            )}

            {obj.materials?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1.5 font-medium">
                  Materials
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {obj.materials.map((m, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(186,230,253,0.3))",
                        border: "1px solid rgba(0,180,216,0.15)",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {obj.place && (
              <div className="mt-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">
                  Place of origin
                </p>
                <p className="text-sm text-foreground">{obj.place}</p>
              </div>
            )}

            {obj.dimensions && (
              <div className="mt-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">
                  Dimensions
                </p>
                <p className="text-sm text-foreground">{obj.dimensions}</p>
              </div>
            )}

            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(0,180,216,0.1)" }}>
              <p className="text-sm text-muted">
                Source:{" "}
                <a
                  href={obj.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline transition-colors"
                >
                  V&A Collection
                </a>
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                className="aero-btn text-sm"
                onClick={() => clickSound()}
                onMouseEnter={() => popSound()}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
