import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * OfflineBanner — shows a non-intrusive banner when the user loses network.
 * Add once to App.jsx above <Routes />.
 */
const OfflineBanner = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2
                  py-2 px-4 text-sm font-medium transition-all duration-300 animate-slide-down
                  ${online
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                  }`}
      role="status"
      aria-live="polite"
    >
      {online ? (
        <>
          <Wifi size={14} />
          Back online — syncing your data
        </>
      ) : (
        <>
          <WifiOff size={14} />
          You're offline — changes will sync when reconnected
        </>
      )}
    </div>
  );
};

export default OfflineBanner;