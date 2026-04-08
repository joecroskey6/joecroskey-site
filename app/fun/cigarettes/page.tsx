"use client";

import { useState, useEffect } from "react";
import { FunItem } from "@/lib/types";
import FunMasonryGrid from "@/components/FunMasonryGrid";

export default function CigarettesPage() {
  const [items, setItems] = useState<FunItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fun/cigarettes")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 max-w-[1800px] mx-auto pb-12">
      <div className="mt-6 mb-10">
        <div className="glass-card inline-block px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">chinese cigarettes</h1>
          <p className="text-sm text-muted mt-1">
            pack art and pricing{items.length > 0 && ` · ${items.length} SKUs`}
          </p>
        </div>
      </div>

      {loading ? (
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
              <span className="text-sm text-muted">Loading collection...</span>
            </div>
          </div>
        </div>
      ) : (
        <FunMasonryGrid items={items} section="cigarettes" />
      )}
    </div>
  );
}
