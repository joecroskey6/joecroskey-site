"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { popSound, navigateSound, backSound } from "@/lib/sounds";

const funItems = [
  {
    href: "/gallery",
    label: "museum pieces",
    description: "iconic design objects",
    accent: "linear-gradient(135deg, #4fc3f7 0%, #00b4d8 100%)",
  },
  {
    href: "/fun/cigarettes",
    label: "chinese cigarettes",
    description: "pack art, pricing, regional brands",
    accent: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  },
  {
    href: "/fun/cocktails",
    label: "cocktails",
    description: "classic & contemporary drinks",
    accent: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const isMuseumDetail = pathname.startsWith("/object/");
  const isCigsDetail = /^\/fun\/cigarettes\/.+/.test(pathname);
  const isCocktailsDetail = /^\/fun\/cocktails\/.+/.test(pathname);
  const isDetail = isMuseumDetail || isCigsDetail || isCocktailsDetail;
  const backHref = isMuseumDetail ? "/gallery"
    : isCigsDetail ? "/fun/cigarettes"
    : "/fun/cocktails";
  const backLabel = isMuseumDetail ? "← back to gallery"
    : isCigsDetail ? "← back to cigarettes"
    : "← back to cocktails";
  const [funOpen, setFunOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFunActive = pathname.startsWith("/fun") || pathname.startsWith("/gallery") || pathname.startsWith("/object");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFunOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong">
        <nav className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <Link href="/gallery" className="flex items-center gap-2 mr-4">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #4fc3f7 0%, #00b4d8 50%, #38b000 100%)",
                  boxShadow: "0 2px 8px rgba(0, 180, 216, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                design archive
              </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              <Link
                href="/uncovered"
                onClick={() => navigateSound()}
                onMouseEnter={() => popSound()}
                className={`text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
                  pathname.startsWith("/uncovered")
                    ? "text-foreground font-medium"
                    : "text-muted hover:text-foreground"
                }`}
                style={
                  pathname.startsWith("/uncovered")
                    ? {
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(186,230,253,0.4) 100%)",
                        boxShadow:
                          "0 1px 4px rgba(0,120,180,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                      }
                    : {}
                }
              >
                uncovered
              </Link>

              {/* Fun stuff dropdown */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => { popSound(); setFunOpen((o) => !o); }}
                  onMouseEnter={() => popSound()}
                  className={`text-sm px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isFunActive
                      ? "text-foreground font-medium"
                      : "text-muted hover:text-foreground"
                  }`}
                  style={
                    isFunActive
                      ? {
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(186,230,253,0.4) 100%)",
                          boxShadow:
                            "0 1px 4px rgba(0,120,180,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                        }
                      : {}
                  }
                >
                  browse ▾
                </button>

                {funOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      boxShadow:
                        "0 8px 32px rgba(0,120,180,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                  >
                    <div className="p-1.5">
                      {funItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { navigateSound(); setFunOpen(false); }}
                          onMouseEnter={() => popSound()}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors group"
                        >
                          <div
                            className="w-5 h-5 rounded-full flex-shrink-0"
                            style={{
                              background: item.accent,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground group-hover:text-accent transition-colors truncate">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-muted truncate">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDetail && (
              <Link
                href={backHref}
                onClick={() => backSound()}
                onMouseEnter={() => popSound()}
                className="aero-btn text-xs py-1.5 px-4"
              >
                {backLabel}
              </Link>
            )}
            <button
              onClick={() => { if (typeof window !== "undefined" && window.top) window.top.location.href = "/"; }}
              onMouseEnter={() => popSound()}
              className="aero-btn text-xs py-1.5 px-4"
            >
              ⌂ home
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
