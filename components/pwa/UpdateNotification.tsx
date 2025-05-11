import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function UpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Listen for new service worker updates
      let refreshing = false;
      
      // When the service worker finds an update, show the update prompt
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        setShowUpdatePrompt(true);
      });
      
      // Check for updates every 60 minutes
      const checkInterval = setInterval(() => {
        navigator.serviceWorker.ready.then(registration => {
          registration.update().catch(err => {
            console.error('Error checking for service worker updates:', err);
          });
        });
      }, 60 * 60 * 1000);
      
      return () => clearInterval(checkInterval);
    }
  }, []);

  const handleUpdate = () => {
    // Reload the page to get the latest version
    window.location.reload();
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between md:bottom-auto md:top-16 md:m-4 md:rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium">Update Available</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">A new version of the app is available</p>
      </div>
      <Button onClick={handleUpdate} className="ml-4">
        <RefreshCw className="h-4 w-4 mr-2" />
        Update Now
      </Button>
    </div>
  );
}
