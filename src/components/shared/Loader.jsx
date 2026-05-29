const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="flex flex-col items-center gap-4">
        {/* New Vivid Tricolor Flame Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{ background: "linear-gradient(135deg,#12052a,#1e0a3c)" }}>
            <svg width="44" height="44" viewBox="0 0 512 512" fill="none">
              <defs>
                <linearGradient id="lfl" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="40%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
              </defs>
              <path d="M256 72C256 72 324 118 320 168C346 144 338 104 338 104C338 104 380 148 372 200C364 244 344 272 308 292C292 301 274 306 256 308C238 306 220 301 204 292C168 272 148 244 140 200C132 148 174 104 174 104C174 104 166 144 192 168C188 118 256 72 256 72Z" fill="url(#lfl)"/>
              <path d="M256 132C256 132 290 158 287 182C304 168 299 146 299 146C299 146 322 172 318 198C314 220 300 236 278 246C271 249 264 251 256 252C248 251 241 249 234 246C212 236 198 220 194 198C190 172 213 146 213 146C213 146 208 168 225 182C222 158 256 132 256 132Z" fill="white" opacity="0.22"/>
              <ellipse cx="256" cy="222" rx="30" ry="38" fill="white" opacity="0.10"/>
              <circle cx="196" cy="400" r="22" fill="#f97316" opacity="0.9"/>
              <circle cx="256" cy="400" r="22" fill="#ec4899" opacity="0.9"/>
              <circle cx="316" cy="400" r="22" fill="#a855f7" opacity="0.9"/>
            </svg>
          </div>
          <div className="absolute -inset-1 rounded-2xl blur opacity-40 animate-pulse-slow"
            style={{ background: "linear-gradient(135deg,#f97316,#ec4899,#a855f7)" }}/>
        </div>

        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:"#f97316", animationDelay:"0ms" }}/>
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:"#ec4899", animationDelay:"150ms" }}/>
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:"#a855f7", animationDelay:"300ms" }}/>
        </div>

        <p className="text-gray-400 text-sm font-medium">Loading Nexora...</p>
      </div>
    </div>
  );
};

export default Loader;