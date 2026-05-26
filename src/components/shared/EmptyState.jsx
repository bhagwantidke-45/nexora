// EmptyState.jsx — Beautiful SVG empty states for every page in Nexora

const illustrations = {
  tasks: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="30" y="20" width="140" height="18" rx="9" fill="rgba(var(--glow),0.12)" />
      <rect x="30" y="48" width="110" height="18" rx="9" fill="rgba(var(--glow),0.08)" />
      <rect x="30" y="76" width="125" height="18" rx="9" fill="rgba(var(--glow),0.06)" />
      <rect x="30" y="104" width="90"  height="18" rx="9" fill="rgba(var(--glow),0.04)" />
      <circle cx="18" cy="29" r="7" stroke="rgba(var(--glow),0.4)" strokeWidth="2" fill="none"/>
      <circle cx="18" cy="57" r="7" stroke="rgba(var(--glow),0.3)" strokeWidth="2" fill="none"/>
      <circle cx="18" cy="85" r="7" stroke="rgba(var(--glow),0.2)" strokeWidth="2" fill="none"/>
      <circle cx="18" cy="113" r="7" stroke="rgba(var(--glow),0.15)" strokeWidth="2" fill="none"/>
      <circle cx="160" cy="130" r="26" fill="rgba(var(--glow),0.15)" />
      <path d="M150 130 l7 7 l14-14" stroke="var(--p500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="160" cy="130" r="26" stroke="rgba(var(--glow),0.3)" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
    </svg>
  ),
  habits: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="20" y="40" width="24" height="80" rx="6" fill="rgba(var(--glow),0.08)" />
      <rect x="55" y="60" width="24" height="60" rx="6" fill="rgba(var(--glow),0.12)" />
      <rect x="90" y="30" width="24" height="90" rx="6" fill="rgba(var(--glow),0.16)" />
      <rect x="125" y="50" width="24" height="70" rx="6" fill="rgba(var(--glow),0.10)" />
      <rect x="160" y="20" width="24" height="100" rx="6" fill="rgba(var(--glow),0.20)" />
      <path d="M32 80 L67 70 L102 55 L137 65 L172 45" stroke="var(--p500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"/>
      <circle cx="172" cy="45" r="5" fill="var(--p500)" />
      <path d="M90 145 Q100 135 110 145" stroke="rgba(var(--glow),0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M85 152 Q100 140 115 152" stroke="rgba(var(--glow),0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  goals: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="75" r="55" stroke="rgba(var(--glow),0.12)" strokeWidth="2" fill="none"/>
      <circle cx="100" cy="75" r="40" stroke="rgba(var(--glow),0.18)" strokeWidth="2" fill="none"/>
      <circle cx="100" cy="75" r="25" stroke="rgba(var(--glow),0.25)" strokeWidth="2" fill="none"/>
      <circle cx="100" cy="75" r="10" fill="rgba(var(--glow),0.3)" />
      <circle cx="100" cy="75" r="4"  fill="var(--p500)" />
      <line x1="100" y1="20" x2="100" y2="130" stroke="rgba(var(--glow),0.1)" strokeWidth="1"/>
      <line x1="45"  y1="75" x2="155" y2="75"  stroke="rgba(var(--glow),0.1)" strokeWidth="1"/>
      <path d="M130 30 L138 20 L146 30" stroke="var(--p400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="138" y1="20" x2="138" y2="50" stroke="var(--p400)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="30" y="30" width="140" height="110" rx="12" fill="rgba(var(--glow),0.06)" stroke="rgba(var(--glow),0.2)" strokeWidth="1.5"/>
      <rect x="30" y="30" width="140" height="30"  rx="12" fill="rgba(var(--glow),0.15)" />
      <rect x="30" y="48" width="140" height="12"  fill="rgba(var(--glow),0.15)" />
      <line x1="30" y1="78" x2="170" y2="78" stroke="rgba(var(--glow),0.12)" strokeWidth="1"/>
      <line x1="30" y1="104" x2="170" y2="104" stroke="rgba(var(--glow),0.12)" strokeWidth="1"/>
      <line x1="70"  y1="60" x2="70"  y2="140" stroke="rgba(var(--glow),0.08)" strokeWidth="1"/>
      <line x1="110" y1="60" x2="110" y2="140" stroke="rgba(var(--glow),0.08)" strokeWidth="1"/>
      <line x1="150" y1="60" x2="150" y2="140" stroke="rgba(var(--glow),0.08)" strokeWidth="1"/>
      <circle cx="50"  cy="41" r="5" fill="var(--p400)" opacity="0.8"/>
      <circle cx="150" cy="41" r="5" fill="var(--p400)" opacity="0.8"/>
      <rect x="38" y="84"  width="24" height="12" rx="4" fill="rgba(var(--glow),0.2)"/>
      <rect x="78" y="110" width="24" height="12" rx="4" fill="rgba(var(--glow),0.15)"/>
      <rect x="118" y="84" width="24" height="12" rx="4" fill="rgba(var(--glow),0.25)"/>
    </svg>
  ),
  records: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="60" y="15" width="100" height="130" rx="10" fill="rgba(var(--glow),0.06)" stroke="rgba(var(--glow),0.2)" strokeWidth="1.5"/>
      <rect x="40" y="25" width="100" height="130" rx="10" fill="rgba(var(--glow),0.08)" stroke="rgba(var(--glow),0.18)" strokeWidth="1.5"/>
      <rect x="20" y="35" width="100" height="130" rx="10" fill="rgba(var(--glow),0.10)" stroke="rgba(var(--glow),0.25)" strokeWidth="1.5"/>
      <line x1="36" y1="65"  x2="104" y2="65"  stroke="rgba(var(--glow),0.3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="82"  x2="90"  y2="82"  stroke="rgba(var(--glow),0.2)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="99"  x2="98"  y2="99"  stroke="rgba(var(--glow),0.18)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="116" x2="80"  y2="116" stroke="rgba(var(--glow),0.12)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="145" cy="125" r="22" fill="rgba(var(--glow),0.12)" stroke="rgba(var(--glow),0.25)" strokeWidth="1.5"/>
      <path d="M136 125 l6 6 l12-12" stroke="var(--p500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="25" y="100" width="22" height="45" rx="4" fill="rgba(var(--glow),0.15)"/>
      <rect x="57" y="75"  width="22" height="70" rx="4" fill="rgba(var(--glow),0.20)"/>
      <rect x="89" y="50"  width="22" height="95" rx="4" fill="rgba(var(--glow),0.25)"/>
      <rect x="121" y="65" width="22" height="80" rx="4" fill="rgba(var(--glow),0.18)"/>
      <rect x="153" y="30" width="22" height="115" rx="4" fill="rgba(var(--glow),0.30)"/>
      <path d="M36 100 Q68 60 100 50 Q132 40 164 30" stroke="var(--p500)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="164" cy="30" r="4" fill="var(--p500)"/>
      <text x="88" y="22" fontSize="14" fill="rgba(var(--glow),0.6)" fontFamily="sans-serif" fontWeight="bold">₹</text>
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="80" r="55" fill="none" stroke="rgba(var(--glow),0.08)" strokeWidth="20"/>
      <circle cx="100" cy="80" r="55" fill="none" stroke="rgba(var(--glow),0.18)" strokeWidth="20"
        strokeDasharray="86 260" strokeLinecap="round" transform="rotate(-90 100 80)"/>
      <circle cx="100" cy="80" r="55" fill="none" stroke="rgba(var(--glow),0.25)" strokeWidth="20"
        strokeDasharray="52 260" strokeDashoffset="-86" strokeLinecap="round" transform="rotate(-90 100 80)"/>
      <circle cx="100" cy="80" r="55" fill="none" stroke="rgba(var(--glow),0.35)" strokeWidth="20"
        strokeDasharray="34 260" strokeDashoffset="-138" strokeLinecap="round" transform="rotate(-90 100 80)"/>
      <circle cx="100" cy="80" r="35" fill="var(--bg-base,#0a0a0f)"/>
      <text x="100" y="85" textAnchor="middle" fontSize="16" fill="rgba(var(--glow),0.8)" fontFamily="sans-serif" fontWeight="bold">~</text>
    </svg>
  ),
  focus: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="80" r="58" stroke="rgba(var(--glow),0.08)" strokeWidth="12" fill="none"/>
      <circle cx="100" cy="80" r="58" stroke="rgba(var(--glow),0.2)"  strokeWidth="12" fill="none"
        strokeDasharray="183 182" strokeLinecap="round" transform="rotate(-90 100 80)"/>
      <circle cx="100" cy="80" r="40" fill="rgba(var(--glow),0.06)"/>
      <path d="M93 65 L93 95 L118 80 Z" fill="rgba(var(--glow),0.5)"/>
      <circle cx="100" cy="20" r="4" fill="rgba(var(--glow),0.3)"/>
      <circle cx="100" cy="140" r="4" fill="rgba(var(--glow),0.3)"/>
      <circle cx="42" cy="80" r="4"  fill="rgba(var(--glow),0.3)"/>
      <circle cx="158" cy="80" r="4" fill="rgba(var(--glow),0.3)"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="20" y="30" width="130" height="50" rx="16" fill="rgba(var(--glow),0.10)" stroke="rgba(var(--glow),0.25)" strokeWidth="1.5"/>
      <rect x="50" y="100" width="130" height="50" rx="16" fill="rgba(var(--glow),0.06)" stroke="rgba(var(--glow),0.18)" strokeWidth="1.5"/>
      <circle cx="44" cy="55"  r="10" fill="rgba(var(--glow),0.2)"/>
      <circle cx="44" cy="55"  r="4"  fill="var(--p500)"/>
      <line x1="65" y1="47" x2="130" y2="47" stroke="rgba(var(--glow),0.3)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="65" y1="60" x2="110" y2="60" stroke="rgba(var(--glow),0.2)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="156" cy="125" r="10" fill="rgba(var(--glow),0.2)"/>
      <circle cx="156" cy="125" r="4"  fill="var(--p400)"/>
      <line x1="70"  y1="117" x2="140" y2="117" stroke="rgba(var(--glow),0.25)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="70"  y1="130" x2="120" y2="130" stroke="rgba(var(--glow),0.18)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="170" cy="20" r="6" fill="rgba(var(--glow),0.4)" className="animate-ping-slow"/>
      <circle cx="170" cy="20" r="3" fill="var(--p500)"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="88" cy="72" r="42" stroke="rgba(var(--glow),0.25)" strokeWidth="8" fill="none"/>
      <circle cx="88" cy="72" r="28" stroke="rgba(var(--glow),0.12)" strokeWidth="8" fill="none"/>
      <line x1="120" y1="104" x2="155" y2="139" stroke="rgba(var(--glow),0.4)" strokeWidth="8" strokeLinecap="round"/>
      <circle cx="88" cy="72" r="10" fill="rgba(var(--glow),0.15)"/>
      <path d="M82 68 L82 78 M86 64 L98 64" stroke="rgba(var(--glow),0.5)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

/* ── Main EmptyState component ── */
const EmptyState = ({
  type = "tasks",
  title,
  description,
  action,
  actionLabel,
  className = "",
}) => {
  const defaultTitles = {
    tasks:    "No tasks yet",
    habits:   "No habits tracked",
    goals:    "No goals set",
    calendar: "No events scheduled",
    records:  "No records found",
    finance:  "No transactions yet",
    stats:    "Not enough data",
    focus:    "Ready to focus?",
    ai:       "Start a conversation",
    search:   "Nothing found",
  };

  const defaultDescs = {
    tasks:    "Create your first task and start getting things done.",
    habits:   "Build a habit and track your daily progress.",
    goals:    "Set a goal and break it into milestones.",
    calendar: "Add events to stay on top of your schedule.",
    records:  "Save notes, contacts, dates and links here.",
    finance:  "Track income and expenses to manage your money.",
    stats:    "Complete tasks and habits to see your statistics.",
    focus:    "Use the timer to stay in flow state.",
    ai:       "Ask Nexora AI anything about productivity.",
    search:   "Try different keywords to find what you need.",
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in ${className}`}>
      {/* Illustration */}
      <div className="w-44 h-36 mb-6 opacity-90 animate-float" style={{ animationDuration: "4s" }}>
        {illustrations[type] || illustrations.tasks}
      </div>

      {/* Text */}
      <h3 className="font-display font-semibold text-lg text-white mb-2">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
        {description || defaultDescs[type]}
      </p>

      {/* Action */}
      {action && (
        <button
          onClick={action}
          className="btn-primary animate-scale-in"
        >
          {actionLabel || "Get Started"}
        </button>
      )}
    </div>
  );
};

export default EmptyState;