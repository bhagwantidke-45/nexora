// ─────────────────────────────────────────────────────────────────────────────
// PageTransition.jsx
// Drop-in wrapper that animates page mounts and exports:
//   - PageTransition (default)      – wraps a page with enter animation
//   - AnimatedButton                – button with ripple effect
//   - useConfetti                   – trigger confetti burst
//   - CountUp                       – animated number
//   - SkeletonCard / SkeletonList   – loading skeletons
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback, useEffect, useState } from "react";

/* ══════════════ PAGE TRANSITION ════════════════════════════════════════════ */
const PageTransition = ({ children, className = "" }) => (
  <div className={`animate-page ${className}`}>
    {children}
  </div>
);

export default PageTransition;

/* ══════════════ RIPPLE BUTTON ══════════════════════════════════════════════ */
export const AnimatedButton = ({
  children, onClick, className = "", disabled = false, type = "button", style,
}) => {
  const btnRef = useRef(null);

  const handleClick = useCallback((e) => {
    if (disabled) return;
    const btn  = btnRef.current;
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());

    onClick?.(e);
  }, [disabled, onClick]);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`ripple-container ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

/* ══════════════ CONFETTI HOOK ══════════════════════════════════════════════ */
const CONFETTI_COLORS = [
  "#a855f7","#3b82f6","#10b981","#f59e0b",
  "#ef4444","#ec4899","#06b6d4","#f97316","#8b5cf6","#fbbf24"
];

export const useConfetti = () => {
  const fire = useCallback((count = 120) => {
    // Create canvas
    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "confetti-canvas";
      document.body.appendChild(canvas);
    }
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const pieces = Array.from({ length: count }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * -canvas.height * 0.5,
      w:    Math.random() * 10 + 5,
      h:    Math.random() * 6  + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speed: Math.random() * 4  + 2,
      angle: Math.random() * 360,
      spin:  (Math.random() - 0.5) * 8,
      sway:  (Math.random() - 0.5) * 2,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.y += p.speed;
        p.x += p.sway;
        p.angle += p.spin;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) { frame = requestAnimationFrame(draw); }
      else { canvas.remove(); }
    };
    draw();
    return () => { cancelAnimationFrame(frame); canvas?.remove(); };
  }, []);

  return fire;
};

/* ══════════════ COUNT UP ═══════════════════════════════════════════════════ */
export const CountUp = ({ end, duration = 1000, prefix = "", suffix = "", className = "" }) => {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target  = parseFloat(end) || 0;
    const start   = 0;
    const startTs = performance.now();

    const tick = (now) => {
      const elapsed = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + (target - start) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return (
    <span className={`animate-number-pop inline-block ${className}`}>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  );
};

/* ══════════════ SKELETON SCREENS ═══════════════════════════════════════════ */
export const SkeletonCard = ({ rows = 3 }) => (
  <div className="glass-card p-5 space-y-3 animate-fade-in">
    <div className="skeleton skeleton-title w-3/4 h-5" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton skeleton-text" style={{ width:`${75 - i * 10}%` }} />
    ))}
    <div className="skeleton h-8 rounded-xl w-1/3 mt-2" />
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card p-4 flex items-center gap-4"
        style={{ animationDelay:`${i*60}ms` }}>
        <div className="skeleton skeleton-avatar w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton skeleton-text w-1/2" />
          <div className="skeleton skeleton-text w-3/4" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} rows={2} />
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div className="glass-card p-5 space-y-3 animate-fade-in">
    <div className="skeleton w-10 h-10 rounded-xl" />
    <div className="skeleton h-8 w-1/2 rounded-lg" />
    <div className="skeleton h-4 w-3/4 rounded-lg" />
  </div>
);