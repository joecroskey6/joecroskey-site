"use client";

import { useEffect, useRef } from "react";

export default function WiiCursor() {
  const ptrRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ptr = ptrRef.current;
    const svg = svgRef.current;
    if (!ptr || !svg) return;
    const isTouch = "ontouchstart" in window;
    if (isTouch) return;
    // When inside iframe, forward mouse position to parent so its cursor keeps tracking
    if (window.self !== window.top) {
      const forward = (e: MouseEvent) => {
        window.parent.postMessage({ type: "wii-mousemove", x: e.clientX, y: e.clientY }, "*");
      };
      document.addEventListener("mousemove", forward);
      return () => document.removeEventListener("mousemove", forward);
    }

    ptr.style.display = "block";
    let mx = 0, my = 0, px = 0, py = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      if (t.closest('button, a, [role="button"], .cursor-pointer')) {
        svg.style.transform = "scale(1.15) rotate(-5deg)";
      }
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as Element;
      if (t.closest('button, a, [role="button"], .cursor-pointer')) {
        svg.style.transform = "";
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    function animate() {
      px += (mx - px) * 0.18;
      py += (my - py) * 0.18;
      ptr.style.left = px + "px";
      ptr.style.top = py + "px";
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ptrRef}
      style={{
        position: "fixed",
        zIndex: 20000,
        pointerEvents: "none",
        display: "none",
        filter: "drop-shadow(0 0 8px rgba(80,180,255,0.5))",
        left: 0,
        top: 0,
      }}
    >
      <svg
        ref={svgRef}
        width="40"
        height="48"
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transition: "transform 0.1s ease", display: "block" }}
      >
        <path
          d="M4 2L4 30L10 24L16 36L20 34L14 22L22 22L4 2Z"
          fill="white"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />
        <ellipse cx="12" cy="18" rx="10" ry="8" fill="rgba(80,180,255,0.12)" />
      </svg>
    </div>
  );
}
