const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <span className="text-white font-display font-bold text-2xl">N</span>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse-slow"></div>
        </div>

        {/* Spinner */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>

        {/* Text */}
        <p className="text-gray-400 text-sm font-medium">Loading Nexora...</p>
      </div>
    </div>
  );
};

export default Loader;