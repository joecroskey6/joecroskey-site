"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DesignObject } from "@/lib/types";
import MasonryGrid from "@/components/MasonryGrid";

export default function GalleryPage() {
  const [objects, setObjects] = useState<DesignObject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/objects/browse")
      .then((r) => r.json())
      .then((data) => {
        setObjects(data.objects || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleClick(obj: DesignObject) {
    router.push(`/object/${obj.id}`);
  }

  return (
    <div className="px-6 max-w-[1800px] mx-auto pb-12">
      {/* Hero header */}
      <div className="mt-6 mb-10">
        <div className="glass-card inline-block px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            browse the archive
          </h1>
          <p className="text-sm text-muted mt-1">
            iconic design objects from museum collections around the world
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
                  background: "linear-gradient(135deg, #4fc3f7, #00b4d8)",
                  animation: "float 2s ease-in-out infinite",
                }}
              />
              <span className="text-sm text-muted">Loading collection...</span>
            </div>
          </div>
        </div>
      ) : (
        <MasonryGrid objects={objects} onObjectClick={handleClick} />
      )}
    </div>
  );
}
