import { useState, useEffect } from "react";

interface PWAStatus {
  isStandalone: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function usePWA(): PWAStatus {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isStandalone: false,
    isInstallable: false,
    isOnline: true,
    isIOS: false,
    isAndroid: false
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if the app is running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    
    // Check if the app is installable (has a service worker)
    const isInstallable = 'serviceWorker' in navigator;
    
    // Check if the device is online
    const isOnline = navigator.onLine;
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Detect Android
    const isAndroid = /Android/.test(navigator.userAgent);
    
    setPwaStatus({
      isStandalone,
      isInstallable,
      isOnline,
      isIOS,
      isAndroid
    });
    
    // Add event listeners for online/offline status
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return pwaStatus;
}
