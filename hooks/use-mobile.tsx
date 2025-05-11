import { useMediaQuery } from "./use-media-query";

/**
 * Hook to detect if the current device is a mobile device
 * @returns Boolean indicating if the current device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery({ query: "(max-width: 767px)" });
}
