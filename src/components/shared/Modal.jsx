// Modal.jsx — Spring physics open/close, backdrop blur, theme-aware
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const [visible, setVisible]   = useState(false);
  const [animOut, setAnimOut]   = useState(false);

  // Open → show immediately, animate in
  useEffect(() => {
    if (isOpen) {
      setAnimOut(false);
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      // Animate out first, then hide
      if (visible) {
        setAnimOut(true);
        const t = setTimeout(() => {
          setVisible(false);
          setAnimOut(false);
          document.body.style.overflow = "unset";
        }, 260);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => () => { document.body.style.overflow = "unset"; }, []);

  if (!visible) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* ── Backdrop ── */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          animOut ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <div
        className={`relative w-full ${sizes[size]} glass-card p-6
          shadow-2xl shadow-black/60 overflow-hidden
          ${animOut ? "animate-modal-out" : "animate-modal"}`}
        style={{
          border: "1px solid rgba(var(--glow),0.18)",
          boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--glow),0.08)`,
        }}
      >
        {/* Top gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, var(--grad1), var(--grad2), transparent)` }}
        />

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400
                       hover:text-white transition-all duration-200
                       hover:rotate-90 active:scale-90"
            style={{ transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Content ── */}
        <div>{children}</div>
      </div>

      {/* Inline keyframe for out animation */}
      <style>{`
        @keyframes modal-out {
          from { transform: scale(1) translateY(0);   opacity: 1; }
          to   { transform: scale(0.9) translateY(20px); opacity: 0; }
        }
        .animate-modal-out {
          animation: modal-out 0.25s ease-in both;
        }
      `}</style>
    </div>
  );
};

export default Modal;