import { useMemo } from "react";

export interface ThemeData {
  back?: string;
  cards: string[];
}

export interface ThemesMap {
  [themeName: string]: ThemeData;
}

/**
 * Hook to load theme images from /src/assets/Illustration/<theme>
 * Returns a map of theme names to their card images and back image
 */
export function useCardThemes(): ThemesMap {
  return useMemo(() => {
    const files = import.meta.glob(
      "/src/assets/Illustration/**/*.{png,jpg,jpeg,webp,svg}",
      {
        eager: true,
        query: "?url",
        import: "default",
      }
    ) as Record<string, string>;
    
    const map: ThemesMap = {};
    
    for (const fullPath in files) {
      const url = files[fullPath];
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
        map[themeName].cards.push(url);
      }
    }
    
    return map;
  }, []);
}

