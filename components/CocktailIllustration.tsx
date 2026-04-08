import React from "react";

type GlassType = "martini" | "rocks" | "highball" | "coupe" | "flute" | "hurricane";

interface IllustrationProps {
  glassType: GlassType;
  color: string;       // liquid color (hex)
  color2?: string;     // optional second gradient color
  garnish?: "olive" | "lime" | "orange" | "cherry" | "mint" | "none";
  size?: number;
}

function MartiniGlass({ color, color2, garnish }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      {/* Liquid fill */}
      <defs>
        <linearGradient id={`ml-${color.replace("#","")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d="M22 14 L78 14 L53 62 L47 62 Z" fill={`url(#ml-${color.replace("#","")})`} />
      {/* Glass outline */}
      <path d="M18 12 L82 12 L54 64 L46 64 Z" stroke="rgba(0,100,160,0.35)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* Shine */}
      <path d="M25 15 L38 15 L30 42" stroke="rgba(0,100,160,0.32)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <line x1="50" y1="64" x2="50" y2="98" stroke="rgba(0,100,160,0.38)" strokeWidth="2" />
      {/* Base */}
      <ellipse cx="50" cy="100" rx="22" ry="4.5" stroke="rgba(0,100,160,0.32)" strokeWidth="2" fill="rgba(180,220,240,0.15)" />
      {/* Garnish */}
      {garnish === "olive" && (
        <g>
          <circle cx="50" cy="10" r="4" fill="#6b8e23" />
          <circle cx="50" cy="10" r="2" fill="#cc3300" />
          <line x1="50" y1="6" x2="50" y2="14" stroke="#b8860b" strokeWidth="1.5" />
        </g>
      )}
      {garnish === "lime" && (
        <path d="M40 11 Q50 5 60 11" stroke="#5cb85c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function RocksGlass({ color, color2, garnish }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      <defs>
        <linearGradient id={`rl-${color.replace("#","")}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* Liquid */}
      <path d="M26 38 L74 38 L70 88 L30 88 Z" fill={`url(#rl-${color.replace("#","")})`} />
      {/* Glass outline */}
      <path d="M22 22 L78 22 L74 90 L26 90 Z" stroke="rgba(0,100,160,0.35)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* Bottom */}
      <line x1="26" y1="90" x2="74" y2="90" stroke="rgba(0,100,160,0.28)" strokeWidth="2.5" />
      {/* Ice cube */}
      <rect x="32" y="44" width="16" height="14" rx="2" stroke="rgba(0,100,160,0.28)" strokeWidth="1.5" fill="rgba(180,220,240,0.35)" />
      <rect x="52" y="48" width="14" height="12" rx="2" stroke="rgba(0,100,160,0.25)" strokeWidth="1.5" fill="rgba(180,220,240,0.28)" />
      {/* Shine */}
      <path d="M25 25 L25 70" stroke="rgba(0,100,160,0.22)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Garnish */}
      {garnish === "orange" && (
        <path d="M62 30 Q72 22 80 28" stroke="#ff8c00" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {garnish === "cherry" && (
        <g>
          <circle cx="68" cy="24" r="5" fill="#c0392b" />
          <path d="M68 19 Q72 13 66 10" stroke="#5d4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function HighballGlass({ color, color2, garnish }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      <defs>
        <linearGradient id={`hl-${color.replace("#","")}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.75" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.92" />
        </linearGradient>
      </defs>
      {/* Liquid */}
      <rect x="28" y="28" width="44" height="62" rx="3" fill={`url(#hl-${color.replace("#","")})`} />
      {/* Glass outline */}
      <rect x="26" y="14" width="48" height="76" rx="4" stroke="rgba(0,100,160,0.45)" strokeWidth="2.5" fill="none" />
      {/* Rim */}
      <line x1="26" y1="14" x2="74" y2="14" stroke="rgba(0,100,160,0.38)" strokeWidth="2" />
      {/* Shine */}
      <path d="M29 17 L29 82" stroke="rgba(0,100,160,0.22)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Straw */}
      <line x1="62" y1="8" x2="56" y2="88" stroke="rgba(0,100,160,0.35)" strokeWidth="3" strokeLinecap="round" />
      {/* Garnish */}
      {garnish === "lime" && (
        <g>
          <path d="M70 14 Q80 6 88 16" stroke="#5cb85c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="79" cy="11" r="6" fill="#7dc67d" opacity="0.8" />
        </g>
      )}
      {garnish === "mint" && (
        <g>
          <path d="M38 10 Q42 4 46 10 Q42 7 38 10" fill="#52b788" />
          <path d="M44 8 Q50 2 54 9 Q49 5 44 8" fill="#40916c" />
        </g>
      )}
      {garnish === "orange" && (
        <g>
          <path d="M68 14 Q76 7 84 14" stroke="#ff8c00" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 14 Q76 8 84 14 Q76 12 68 14" fill="#ffa500" opacity="0.8" />
        </g>
      )}
    </g>
  );
}

function CoupeGlass({ color, color2, garnish }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      <defs>
        <linearGradient id={`cl-${color.replace("#","")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.93" />
        </linearGradient>
      </defs>
      {/* Liquid */}
      <path d="M24 20 Q50 58 76 20 Q63 34 50 36 Q37 34 24 20 Z" fill={`url(#cl-${color.replace("#","")})`} />
      {/* Bowl outline */}
      <path d="M20 16 Q50 62 80 16" stroke="rgba(0,100,160,0.35)" strokeWidth="2.5" fill="none" />
      {/* Rim */}
      <line x1="20" y1="16" x2="80" y2="16" stroke="rgba(0,100,160,0.42)" strokeWidth="2.5" />
      {/* Shine */}
      <path d="M24 18 Q34 36 28 52" stroke="rgba(0,100,160,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <line x1="50" y1="60" x2="50" y2="96" stroke="rgba(0,100,160,0.38)" strokeWidth="2" />
      {/* Base */}
      <ellipse cx="50" cy="98" rx="22" ry="4.5" stroke="rgba(0,100,160,0.32)" strokeWidth="2" fill="rgba(180,220,240,0.15)" />
      {garnish === "cherry" && (
        <g>
          <circle cx="50" cy="10" r="5" fill="#c0392b" />
          <path d="M50 5 Q54 0 49 -3" stroke="#5d4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      {garnish === "lime" && (
        <path d="M38 13 Q50 7 62 13" stroke="#5cb85c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function FluteGlass({ color, color2 }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      <defs>
        <linearGradient id={`fl-${color.replace("#","")}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.75" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Liquid */}
      <path d="M34 32 L66 32 L62 80 L38 80 Z" fill={`url(#fl-${color.replace("#","")})`} />
      {/* Glass outline */}
      <path d="M30 14 L70 14 L63 82 L37 82 Z" stroke="rgba(0,100,160,0.45)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* Bubbles */}
      <circle cx="42" cy="60" r="2" fill="rgba(180,220,240,0.5)" />
      <circle cx="52" cy="48" r="1.5" fill="rgba(180,220,240,0.45)" />
      <circle cx="58" cy="68" r="1.8" fill="rgba(180,220,240,0.4)" />
      {/* Shine */}
      <path d="M33 16 L33 70" stroke="rgba(0,100,160,0.22)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <line x1="50" y1="82" x2="50" y2="100" stroke="rgba(0,100,160,0.38)" strokeWidth="2" />
      {/* Base */}
      <ellipse cx="50" cy="102" rx="18" ry="3.5" stroke="rgba(0,100,160,0.28)" strokeWidth="2" fill="rgba(180,220,240,0.15)" />
    </g>
  );
}

function HurricaneGlass({ color, color2, garnish }: IllustrationProps) {
  const c2 = color2 || color;
  return (
    <g>
      <defs>
        <linearGradient id={`hurl-${color.replace("#","")}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* Liquid */}
      <path d="M34 28 Q28 55 32 75 Q38 82 50 82 Q62 82 68 75 Q72 55 66 28 Q60 40 50 42 Q40 40 34 28 Z"
        fill={`url(#hurl-${color.replace("#","")})`} />
      {/* Glass outline */}
      <path d="M30 14 Q24 44 28 74 Q35 88 50 88 Q65 88 72 74 Q76 44 70 14 Q62 30 50 32 Q38 30 30 14 Z"
        stroke="rgba(0,100,160,0.45)" strokeWidth="2.5" fill="none" />
      {/* Shine */}
      <path d="M32 18 Q27 52 30 76" stroke="rgba(0,100,160,0.22)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Straw */}
      <line x1="60" y1="8" x2="56" y2="80" stroke="rgba(0,100,160,0.42)" strokeWidth="3" strokeLinecap="round" />
      {garnish === "orange" && (
        <g>
          <path d="M63 14 Q72 7 79 16" stroke="#ff8c00" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M63 14 Q72 8 79 16 Q71 12 63 14" fill="#ffa500" opacity="0.8" />
        </g>
      )}
    </g>
  );
}

const GLASS_MAP: Record<string, { glassType: GlassType; color: string; color2?: string; garnish?: "olive" | "lime" | "orange" | "cherry" | "mint" | "none" }> = {
  // Martini glass drinks
  "alexander": { glassType: "martini", color: "#e8d5b0", color2: "#c9a96e", garnish: "none" },
  "dry martini": { glassType: "martini", color: "#d4f0e8", color2: "#a8d8c0", garnish: "olive" },
  "cosmopolitan": { glassType: "martini", color: "#e8556a", color2: "#c0392b", garnish: "lime" },
  "lemon drop": { glassType: "martini", color: "#fff44f", color2: "#f4d03f", garnish: "lime" },
  "espresso martini": { glassType: "martini", color: "#3d1c02", color2: "#6f4e37", garnish: "none" },
  "porn star martini": { glassType: "martini", color: "#ffb347", color2: "#ff8c00", garnish: "none" },
  "tuxedo": { glassType: "martini", color: "#e8f4f8", color2: "#b0d4e8", garnish: "olive" },
  "white lady": { glassType: "martini", color: "#f0f8ff", color2: "#d4e8f0", garnish: "none" },

  // Rocks / Old Fashioned glass
  "old fashioned": { glassType: "rocks", color: "#c8850a", color2: "#8b4513", garnish: "orange" },
  "negroni": { glassType: "rocks", color: "#e74c3c", color2: "#c0392b", garnish: "orange" },
  "sazerac": { glassType: "rocks", color: "#d4850a", color2: "#8b4513", garnish: "none" },
  "rusty nail": { glassType: "rocks", color: "#c8a028", color2: "#8b6914", garnish: "none" },
  "stinger": { glassType: "rocks", color: "#e8f4f8", color2: "#90c0d8", garnish: "none" },
  "boulevardier": { glassType: "rocks", color: "#c0392b", color2: "#922b21", garnish: "orange" },
  "caipirinha": { glassType: "rocks", color: "#8bc34a", color2: "#558b2f", garnish: "lime" },
  "whiskey sour": { glassType: "rocks", color: "#f5a623", color2: "#c8850a", garnish: "cherry" },
  "penicillin": { glassType: "rocks", color: "#d4a017", color2: "#8b6914", garnish: "none" },
  "tommy's margarita": { glassType: "rocks", color: "#8bc34a", color2: "#4caf50", garnish: "lime" },

  // Highball / Collins glass
  "mojito": { glassType: "highball", color: "#8bc34a", color2: "#4caf50", garnish: "mint" },
  "moscow mule": { glassType: "highball", color: "#c8e6c9", color2: "#81c784", garnish: "lime" },
  "dark and stormy": { glassType: "highball", color: "#5d3a1a", color2: "#2c1810", garnish: "lime" },
  "long island iced tea": { glassType: "highball", color: "#c8a028", color2: "#8b6914", garnish: "lime" },
  "gin fizz": { glassType: "highball", color: "#e8f4f8", color2: "#b0d4e8", garnish: "lime" },
  "tom collins": { glassType: "highball", color: "#d4f0e0", color2: "#90c0b0", garnish: "lime" },
  "singapore sling": { glassType: "highball", color: "#e8556a", color2: "#c0392b", garnish: "orange" },
  "sea breeze": { glassType: "highball", color: "#e8556a", color2: "#c45078", garnish: "lime" },
  "tequila sunrise": { glassType: "highball", color: "#ff8c00", color2: "#e74c3c", garnish: "orange" },
  "sex on the beach": { glassType: "highball", color: "#ff6b35", color2: "#e84393", garnish: "orange" },
  "planters punch": { glassType: "highball", color: "#ff6b35", color2: "#c0392b", garnish: "orange" },
  "turbo shandy": { glassType: "highball", color: "#f5d020", color2: "#f0a500", garnish: "none" },
  "americano": { glassType: "highball", color: "#e8556a", color2: "#c0392b", garnish: "orange" },
  "airmail": { glassType: "highball", color: "#f4d03f", color2: "#c8a028", garnish: "lime" },

  // Coupe glass
  "daiquiri": { glassType: "coupe", color: "#e8f4d8", color2: "#b8d898", garnish: "lime" },
  "sidecar": { glassType: "coupe", color: "#f5a623", color2: "#d4850a", garnish: "none" },
  "last word": { glassType: "coupe", color: "#8bc34a", color2: "#558b2f", garnish: "cherry" },
  "clover club": { glassType: "coupe", color: "#e8557a", color2: "#c03060", garnish: "none" },
  "gimlet": { glassType: "coupe", color: "#b8e890", color2: "#78c850", garnish: "lime" },
  "hemingway special": { glassType: "coupe", color: "#ffb6c1", color2: "#e8556a", garnish: "lime" },
  "mai tai": { glassType: "coupe", color: "#ff8c00", color2: "#c8a028", garnish: "orange" },
  "pisco sour": { glassType: "coupe", color: "#e8e4d0", color2: "#c8c4a0", garnish: "none" },
  "mary pickford": { glassType: "coupe", color: "#ffb6c1", color2: "#e8557a", garnish: "cherry" },
  "monkey gland": { glassType: "coupe", color: "#e8557a", color2: "#c03060", garnish: "orange" },
  "hanky panky": { glassType: "coupe", color: "#c0392b", color2: "#8e0000", garnish: "none" },
  "brandy crusta": { glassType: "coupe", color: "#d4850a", color2: "#8b4513", garnish: "orange" },
  "paper plane": { glassType: "coupe", color: "#f5a623", color2: "#e74c3c", garnish: "none" },
  "naked and famous": { glassType: "coupe", color: "#f4d03f", color2: "#e67e22", garnish: "none" },
  "trinidad sour": { glassType: "coupe", color: "#e74c3c", color2: "#c0392b", garnish: "none" },
  "illegal": { glassType: "coupe", color: "#c8a028", color2: "#8b4513", garnish: "lime" },
  "between the sheets": { glassType: "coupe", color: "#f5e6c8", color2: "#d4c090", garnish: "none" },
  "porto flip": { glassType: "coupe", color: "#8b0000", color2: "#5a0000", garnish: "none" },
  "bramble": { glassType: "coupe", color: "#8e44ad", color2: "#6c3483", garnish: "lime" },

  // Flute
  "champagne cocktail": { glassType: "flute", color: "#f4d03f", color2: "#c8a028", garnish: "none" },
  "french 75": { glassType: "flute", color: "#e8f4d8", color2: "#c8e4a0", garnish: "none" },
  "aperol spritz": { glassType: "flute", color: "#ff8c00", color2: "#e67e22", garnish: "orange" },
  "spritz veneziano": { glassType: "flute", color: "#ff8c00", color2: "#c0392b", garnish: "orange" },

  // Hurricane
  "singapore sling": { glassType: "hurricane", color: "#e8556a", color2: "#c0392b", garnish: "orange" },
  "spicy fifty": { glassType: "coupe", color: "#ff6b35", color2: "#e74c3c", garnish: "none" },
  "lemon drop": { glassType: "martini", color: "#fff44f", color2: "#f4d03f", garnish: "lime" },
  "manhattan": { glassType: "coupe", color: "#8b1a1a", color2: "#5a0000", garnish: "cherry" },
  "stinger": { glassType: "coupe", color: "#e8f4f8", color2: "#90c0d8", garnish: "none" },
  "tuxedo": { glassType: "martini", color: "#e8f4f8", color2: "#b0d4e8", garnish: "olive" },
  "margarita": { glassType: "coupe", color: "#8bc34a", color2: "#4caf50", garnish: "lime" },
};

function getGlassInfo(name: string) {
  const key = name.toLowerCase();
  if (GLASS_MAP[key]) return GLASS_MAP[key];
  // fallback
  return { glassType: "rocks" as GlassType, color: "#87ceeb", color2: "#4fc3f7", garnish: "none" as const };
}

export default function CocktailIllustration({ name, size = 120 }: { name: string; size?: number }) {
  const info = getGlassInfo(name);
  const props: IllustrationProps = { ...info, glassType: info.glassType, size };

  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block" }}
    >
      {info.glassType === "martini" && <MartiniGlass {...props} />}
      {info.glassType === "rocks" && <RocksGlass {...props} />}
      {info.glassType === "highball" && <HighballGlass {...props} />}
      {info.glassType === "coupe" && <CoupeGlass {...props} />}
      {info.glassType === "flute" && <FluteGlass {...props} />}
      {info.glassType === "hurricane" && <HurricaneGlass {...props} />}
    </svg>
  );
}
