import { useMemo } from "react";

export interface CardInfo {
  url: string;
  isVideo: boolean;
  isSecret: boolean;
}

export interface ThemeData {
  back?: string;
  cards: CardInfo[];
}

export interface ThemesMap {
  [themeName: string]: ThemeData;
}

/**
 * Hook to load theme images and videos from /src/assets/Illustration/<theme>
 * Returns a map of theme names to their card images/videos and back image
 * Secret videos (SECRET.*) are identified and sorted to the end
 */
export function useCardThemes(): ThemesMap {
  return useMemo(() => {
    // Load images
    const imageFiles = import.meta.glob(
      "/src/assets/Illustration/**/*.{png,jpg,jpeg,webp,svg}",
      {
        eager: true,
        query: "?url",
        import: "default",
      }
    ) as Record<string, string>;
    
    // Load videos
    const videoFiles = import.meta.glob(
      "/src/assets/Illustration/**/*.{mp4,webm,mov}",
      {
        eager: true,
        query: "?url",
        import: "default",
      }
    ) as Record<string, string>;
    
    const map: ThemesMap = {};
    
    // Process images
    for (const fullPath in imageFiles) {
      const url = imageFiles[fullPath];
      const parts = fullPath.split("/");
      const idx = parts.indexOf("Illustration");
      if (idx === -1 || idx + 1 >= parts.length) continue;
      
      const themeName = parts[idx + 1];
      const fileName = parts[parts.length - 1];
      
      if (!map[themeName]) {
        map[themeName] = { cards: [] };
      }
      
      if (/^back\.(png|jpg|jpeg|webp|svg)$/i.test(fileName)) {
        map[themeName].back = url;
      } else {
        map[themeName].cards.push({
          url,
          isVideo: false,
          isSecret: false,
        });
      }
    }
    
    // Process videos
    for (const fullPath in videoFiles) {
      const url = videoFiles[fullPath];
      const parts = fullPath.split("/");
      const idx = parts.indexOf("Illustration");
      if (idx === -1 || idx + 1 >= parts.length) continue;
      
      const themeName = parts[idx + 1];
      const fileName = parts[parts.length - 1];
      
      if (!map[themeName]) {
        map[themeName] = { cards: [] };
      }
      
      // Check if it's a SECRET video
      const isSecret = /^SECRET\./i.test(fileName);
      
      map[themeName].cards.push({
        url,
        isVideo: true,
        isSecret,
      });
    }
    
    // Sort cards: regular cards first, then secret videos at the end
    for (const themeName in map) {
      map[themeName].cards.sort((a, b) => {
        if (a.isSecret && !b.isSecret) return 1;
        if (!a.isSecret && b.isSecret) return -1;
        return 0;
      });
    }
    
    return map;
  }, []);
}

