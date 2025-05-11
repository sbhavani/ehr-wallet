import { useState, useEffect } from "react";

type MediaQueryOptions = {
  query: string;
  defaultValue?: boolean;
};

/**
 * Custom hook for responsive media queries
 * @param options Media query options
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery({ 
  query, 
  defaultValue = false 
}: MediaQueryOptions): boolean {
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Create media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
    }

    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Predefined media query hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery({ query: "(max-width: 767px)" });
}

export function useIsTablet() {
  return useMediaQuery({ query: "(min-width: 768px) and (max-width: 1023px)" });
}

export function useIsDesktop() {
  return useMediaQuery({ query: "(min-width: 1024px)" });
}

export function useIsLargeDesktop() {
  return useMediaQuery({ query: "(min-width: 1280px)" });
}

export function useIsPortrait() {
  return useMediaQuery({ query: "(orientation: portrait)" });
}

export function useIsLandscape() {
  return useMediaQuery({ query: "(orientation: landscape)" });
}

export function useIsTouchDevice() {
  return useMediaQuery({ 
    query: "(hover: none) and (pointer: coarse)",
    defaultValue: false
  });
}
