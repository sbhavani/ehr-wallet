import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return;

    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-2 text-center z-50 flex items-center justify-center">
      <WifiOff className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">You are currently offline. Some features may be limited.</span>
    </div>
  );
}
