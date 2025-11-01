import { useState, useEffect } from "react";

/**
 * Hook to detect if the device is a desktop (has mouse/trackpad)
 * Returns true if desktop, false if mobile/touch device
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    // Check if we can use media queries for pointer type
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(pointer: fine)");
      return mediaQuery.matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for fine pointer (mouse/trackpad) vs coarse pointer (touch)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    // Fallback: check for touch support
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsDesktop(!hasTouch);
  }, []);

  return isDesktop;
}

