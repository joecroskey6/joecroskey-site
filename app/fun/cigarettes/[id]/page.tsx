"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { backSound, popSound } from "@/lib/sounds";

interface CigaretteDetail {
  id: string;
  name: string;
  englishName: string;
  brand: string;
  price: number | null;
  format: string | null;
  imageUrl: string;
}

export default function CigaretteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const brand = searchParams.get("brand") ?? "";
  const [cig, setCig] = useState<CigaretteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/fun/cigarettes/${id}?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then(setCig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, brand]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
                animation: "float 2s ease-in-out infinite",
              }}
            />
            <span className="text-sm text-muted">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!cig) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="glass-card px-8 py-6">
          <p className="text-muted text-sm">Not found</p>
        </div>
      </div>
    );
  }

  const specs = [
    cig.format && { label: "Format", value: cig.format },
    cig.price != null && { label: "Retail price", value: `¥${cig.price}` },
    { label: "Brand", value: cig.brand },
  ].filter(Boolean) as { label: string; value: string }[];

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
        {/* Image */}
        <div className="lg:flex-1 lg:max-w-[480px]">
          <div className="glass-card overflow-hidden p-3">
            <div className="relative rounded-xl overflow-hidden">
              {!imgLoaded && (
                <div className="w-full aspect-[3/4] shimmer rounded-xl" />
              )}
              <img
                src={cig.imageUrl}
                alt={cig.englishName || cig.name}
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
              {cig.englishName || cig.name}
            </h1>
            {cig.englishName && cig.name !== cig.englishName && (
              <p className="text-base text-muted mt-1">{cig.name}</p>
            )}
            <p className="text-base text-muted mt-0.5">{cig.brand}</p>

            {specs.length > 0 && (
              <div className="mt-6 space-y-4">
                {specs.map((s) => (
                  <div key={s.label}>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">
                      {s.label}
                    </p>
                    <p className="text-sm text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
