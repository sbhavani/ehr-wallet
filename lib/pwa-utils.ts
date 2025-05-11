/**
 * PWA utility functions for handling installation, updates, and other PWA-specific functionality
 */

// BeforeInstallPromptEvent is not in the standard TypeScript types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Store the install prompt event for later use
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Initialize PWA event listeners
 * Call this function once when the app starts
 */
export function initPWA() {
  if (typeof window === 'undefined') return;

  // Handle the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e as BeforeInstallPromptEvent;
  });

  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt variable
    deferredPrompt = null;
    // Log or track installation
    console.log('PWA was installed');
  });
}

/**
 * Check if the app can be installed
 * @returns Boolean indicating if the app can be installed
 */
export function canInstallPWA(): boolean {
  return !!deferredPrompt;
}

/**
 * Show the install prompt
 * @returns Promise that resolves to the user's choice
 */
export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }

  // Show the prompt
  await deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;

  // Reset the deferred prompt variable
  deferredPrompt = null;

  return choiceResult.outcome;
}

/**
 * Check if the app is running in standalone mode (installed as PWA)
 * @returns Boolean indicating if the app is in standalone mode
 */
export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

/**
 * Check if the app is running on iOS
 * @returns Boolean indicating if the app is running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
         !(window as any).MSStream;
}

/**
 * Check if the app is running on Android
 * @returns Boolean indicating if the app is running on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}
