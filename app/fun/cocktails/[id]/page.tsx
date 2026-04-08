"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { backSound, popSound } from "@/lib/sounds";
import CocktailIllustration from "@/components/CocktailIllustration";

interface CocktailDetail {
  id: string;
  name: string;
  category: string;
  alcoholic: string;
  glass: string;
  instructions: string;
  imageUrl: string;
  tags: string | null;
  iba: string | null;
  ingredients: { name: string; measure: string }[];
}

export default function CocktailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cocktail, setCocktail] = useState<CocktailDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/fun/cocktails/${id}`)
      .then((r) => r.json())
      .then(setCocktail)
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
                background: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
                animation: "float 2s ease-in-out infinite",
              }}
            />
            <span className="text-sm text-muted">Loading recipe...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!cocktail) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card px-8 py-6">
          <p className="text-muted text-sm">Cocktail not found</p>
        </div>
      </div>
    );
  }

  const tags = cocktail.tags ? cocktail.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 pb-16">
      <button
        onClick={() => { backSound(); router.back(); }}
        onMouseEnter={() => popSound()}
        className="aero-btn mb-8 text-sm py-2 px-5"
      >
        ← back
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Illustration */}
        <div className="lg:flex-1 lg:max-w-[480px]">
          <div className="glass-card p-10 flex items-center justify-center" style={{ minHeight: 340 }}>
            <CocktailIllustration name={cocktail.name} size={260} />
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:w-[460px] shrink-0 flex flex-col gap-4">
          {/* Header */}
          <div className="glass-card p-6">
            <h1 className="text-2xl font-semibold leading-tight text-foreground">
              {cocktail.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {[cocktail.glass, cocktail.alcoholic, cocktail.category].filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(200,190,255,0.3))",
                    border: "1px solid rgba(108,92,231,0.15)",
                  }}
                >
                  {tag}
                </span>
              ))}
              {cocktail.iba && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(162,155,254,0.3))",
                    border: "1px solid rgba(108,92,231,0.2)",
                    fontWeight: 600,
                  }}
                >
                  IBA: {cocktail.iba}
                </span>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="glass-card p-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">
              Ingredients
            </p>
            <div className="space-y-2">
              {cocktail.ingredients.map((ing, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-foreground">{ing.name}</span>
                  {ing.measure && (
                    <span className="text-xs text-muted whitespace-nowrap">{ing.measure}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {cocktail.instructions && (
            <div className="glass-card p-6">
              <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">
                How to make it
              </p>
              <p className="text-sm text-foreground leading-relaxed">{cocktail.instructions}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full text-muted"
                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
