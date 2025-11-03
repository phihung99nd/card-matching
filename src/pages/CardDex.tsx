import { useState, useMemo, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCardThemes } from "@/lib/themeUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { isSecretCardUnlocked } from "@/lib/secretCardUtils";
import secretCardImage from "@/assets/secret_card.jpg";

// Emoji list from Game.tsx
const EMOJI_LIST = [
  "😀",
  "😎",
  "🤖",
  "🐶",
  "🐱",
  "🐼",
  "🍎",
  "🍉",
  "🍓",
  "⚽",
  "🎧",
  "🚀",
  "🌈",
  "⭐",
  "🔥",
  "🧠",
  "🎲",
  "🎯",
  "🎮",
  "🎹",
  "🎨",
  "🎪",
  "🎆",
  "🎇",
  "✨",
  "⚡",
  "❄️",
  "🌙",
  "☀️",
  "🌟",
  "🌸",
  "🌼",
  "🌻",
  "🍁",
  "🍂",
  "🍃",
  "🌊",
  "💧",
  "🪐",
  "🌍",
  "🛰️",
  "📱",
  "💡",
  "🔔",
  "🔮",
  "🧩",
  "🪄",
  "🧸",
  "🪅",
  "🎁",
  "🧁",
  "🍩",
  "🍪",
  "🍰",
  "🍫",
  "🍬",
  "🍭",
  "🥨",
  "🥐",
  "🍔",
  "🍟",
  "🌮",
  "🍕",
  "🍣",
  "🍤",
  "🍙",
  "🍜",
  "🍝",
  "🥟",
  "🥗",
  "🍗",
  "🥩",
  "🥪",
  "🥞",
  "🧇",
];

// Shimmer effect overlay
function ShimmerOverlay() {
  return (
    <>
      <style>{`
        @keyframes shimmer-animation {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
        .shimmer-overlay {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          width: 200%;
          height: 200%;
          animation: shimmer-animation 3s infinite;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-9999">
        <div className="absolute inset-0 shimmer-overlay" />
      </div>
    </>
  );
}

// Helper function to generate uniformly distributed sparkle positions
function generateSparklePositions() {
  const gridCols = 5; // Number of columns in the grid
  const gridRows = 5; // Number of rows in the grid
  const extraSparkles = Math.floor(Math.random() * 3); // 0-2 extra sparkles
  
  const sparkles: Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }> = [];
  
  let sparkleId = 0;
  
  // First, place one sparkle in each grid cell for uniform distribution
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      // Calculate grid cell boundaries (with padding to avoid edges)
      const cellPadding = 5; // 5% padding from edges
      const cellWidth = (100 - cellPadding * 2) / gridCols;
      const cellHeight = (100 - cellPadding * 2) / gridRows;
      
      const cellStartX = cellPadding + col * cellWidth;
      const cellStartY = cellPadding + row * cellHeight;
      
      // Random position within the cell with some margin
      const margin = 20; // 8% margin from cell edges
      const x = cellStartX + margin + Math.random() * (cellWidth - margin * 2);
      const y = cellStartY + margin + Math.random() * (cellHeight - margin * 2);
      
      sparkles.push({
        id: sparkleId++,
        x: Math.max(10, Math.min(90, x)), // Clamp between 5% and 95%
        y: Math.max(10, Math.min(90, y)), // Clamp between 5% and 95%
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 1.5,
      });
    }
  }
  
  // Add extra sparkles randomly across the entire card
  for (let i = 0; i < extraSparkles; i++) {
    sparkles.push({
      id: sparkleId++,
      x: 10 + Math.random() * 80, // 10% to 90% (avoid edges)
      y: 10 + Math.random() * 80,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1.5,
    });
  }
  
  return sparkles;
}

// Sparkle star effect component with white stars
function SparkleStar() {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setSparkles(generateSparklePositions());
  }, []);

  return (
    <>
      <style>{`
        @keyframes sparkle-snow {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
        .sparkle-star {
          position: absolute;
          width: 18px;
          height: 18px;
          pointer-events: none;
        }
        .sparkle-star::before,
        .sparkle-star::after {
          content: '✧';
          position: absolute;
          opacity: 0,
          font-size: 18px;
          color:rgb(255, 255, 255);
          line-height: 1;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(207, 207, 207, 0.8);
          transform-origin: center;
        }
        .sparkle-star::before {
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
        .sparkle-star::after {
          display: none;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-20">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle-star"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animation: `sparkle-snow ${sparkle.duration}s ease-in-out infinite`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Sparkle heart effect component with pink hearts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function SparkleHeart() {
//   const [sparkles, setSparkles] = useState<Array<{
//     id: number;
//     x: number;
//     y: number;
//     delay: number;
//     duration: number;
//   }>>([]);

//   useEffect(() => {
//     setSparkles(generateSparklePositions());
//   }, []);

//   return (
//     <>
//       <style>{`
//         @keyframes sparkle-heart {
//           0% {
//             opacity: 0;
//             transform: translate(-50%, -50%) scale(0);
//           }
//           40% {
//             opacity: 1;
//             transform: translate(-50%, -150%) scale(1.5);
//           }
//           80% {
//             opacity: 1;
//             transform: translate(-50%, -200%) scale(1.5);
//           }
//           100% {
//             opacity: 0;
//             transform: translate(-50%, -250%) scale(0);
//           }
//         }
//         .sparkle-heart {
//           position: absolute;
//           width: 18px;
//           height: 18px;
//           pointer-events: none;
//         }
//         .sparkle-heart::before,
//         .sparkle-heart::after {
//           content: '♡';
//           position: absolute;
//           opacity: 0,
//           font-size: 18px;
//           color: #ff69b4;
//           line-height: 1;
//           text-shadow: 0 0 4px rgba(255, 105, 180, 0.8), 0 0 8px rgba(255, 182, 193, 0.8);
//           transform-origin: center;
//         }
//         .sparkle-heart::before {
//           left: 50%;
//           top: 0;
//           transform: translateX(-50%);
//         }
//         .sparkle-heart::after {
//           display: none;
//         }
//       `}</style>
//       <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-20">
//         {sparkles.map((sparkle) => (
//           <div
//             key={sparkle.id}
//             className="sparkle-heart"
//             style={{
//               left: `${sparkle.x}%`,
//               top: `${sparkle.y}%`,
//               animation: `sparkle-heart ${sparkle.duration}s ease-in-out infinite`,
//               animationDelay: `${sparkle.delay}s`,
//             }}
//           />
//         ))}
//       </div>
//     </>
//   );
// }

// Sparkle star effect component with white stars
function SparkleSnowFlake() {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setSparkles(generateSparklePositions());
  }, []);

  return (
    <>
      <style>{`
        @keyframes sparkle-snow {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, 100%) scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 250%) scale(0) rotate(360deg);
          }
        }
        .sparkle-snow {
          position: absolute;
          width: 18px;
          height: 18px;
          pointer-events: none;
        }
        .sparkle-snow::before,
        .sparkle-snow::after {
          content: '❄️';
          position: absolute;
          opacity: 0,
          font-size: 18px;
          color:rgb(255, 255, 255);
          line-height: 1;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(207, 207, 207, 0.8);
          transform-origin: center;
        }
        .sparkle-snow::before {
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
        .sparkle-snow::after {
          display: none;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-20">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle-snow"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animation: `sparkle-snow ${sparkle.duration}s linear infinite`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Interactive card component with hover tilt and float effect
function InteractiveCard({
  card,
  isEmoji,
  isVideo,
  isSecret,
  isLoading,
  onLoad,
  onError,
}: {
  card: string;
  isEmoji: boolean;
  isVideo?: boolean;
  isSecret?: boolean;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Randomly select foil type (star or heart) - stays consistent for this card instance
  // const foilType = useMemo(() => Math.random() < 0.5 ? 'star' : 'heart', []);
  const foilType = 'star';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation (max 15 degrees)
    const rotateX = (mouseY / (rect.height / 2)) * -15;
    const rotateY = (mouseX / (rect.width / 2)) * 15;

    // Calculate floating effect (translateZ for 3D effect)
    const translateZ = 20;

    setTransform({
      rotateX,
      rotateY,
      translateZ,
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
  };

  const transformStyle = {
    transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateZ(${transform.translateZ}px)`,
    transition: isHovering ? "transform 0.05s linear" : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className="transform-gpu will-change-transform cursor-pointer"
    >
      {isEmoji ? (
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted shadow-xl w-[280px] h-[373px] sm:w-[320px] sm:h-[427px] md:w-[400px] md:h-[533px] lg:w-[450px] lg:h-[600px]">
          <ShimmerOverlay />
          <span className="relative z-10 text-8xl sm:text-9xl md:text-[10rem]">{card}</span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 shadow-xl w-[320px] h-[427px] sm:w-[400px] sm:h-[533px] md:w-[500px] md:h-[667px] lg:w-[600px] lg:h-[800px]">
          <ShimmerOverlay />
          {foilType === 'star' ? <SparkleStar /> : <SparkleSnowFlake />}
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full z-0" />
          )}
          {isVideo ? (
            <video
              src={card}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={onLoad}
              onError={onError}
              className={`relative z-10 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : (
            <img
              src={card}
              alt="Card detail"
              onLoad={onLoad}
              onError={onError}
              className={`relative z-10 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          )}
          {isSecret && (
            <div className="absolute top-4 right-4 bg-yellow-500/90 text-yellow-900 text-sm font-bold px-3 py-1.5 rounded shadow-lg z-20">
              SECRET
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardDex() {
  const themesMap = useCardThemes();
  const [cardImageLoading, setCardImageLoading] = useState<Record<string, boolean>>({});
  const [, setRefreshKey] = useState(0);
  
  // Listen for storage changes to refresh when cards are unlocked
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "unlockedSecretCards") {
        setRefreshKey(prev => prev + 1);
      }
    };
    
    // Also listen for custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Listen for custom events (we'll dispatch this from Game.tsx)
    window.addEventListener("secretCardUnlocked", handleCustomStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("secretCardUnlocked", handleCustomStorageChange);
    };
  }, []);

  const allCardSets = useMemo(() => {
    const sets: Array<{ 
      name: string; 
      isEmoji: boolean; 
      cards: Array<{ url: string; isVideo?: boolean; isSecret?: boolean }> 
    }> = [
      {
        name: "emoji",
        isEmoji: true,
        cards: [...new Set(EMOJI_LIST)].map(emoji => ({ url: emoji })),
      },
    ];

    // Add all theme sets
    const themeNames = Object.keys(themesMap).sort();
    for (const themeName of themeNames) {
      const themeData = themesMap[themeName];
      if (themeData && themeData.cards.length > 0) {
        sets.push({
          name: themeName,
          isEmoji: false,
          cards: themeData.cards.map(card => ({
            url: card.url,
            isVideo: card.isVideo,
            isSecret: card.isSecret,
          })),
        });
      }
    }

    return sets;
  }, [themesMap]);

  const handleImageLoad = (card: string) => {
    setCardImageLoading(prev => ({ ...prev, [card]: false }));
  };

  const handleImageError = (card: string) => {
    setCardImageLoading(prev => ({ ...prev, [card]: false }));
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 ring-1 ring-border">
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Card Dex</h1>
        <p className="text-muted-foreground mb-6">
          Browse all available card sets and view each card in detail.
        </p>

        <Tabs defaultValue={allCardSets[0]?.name || "emoji"} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 mb-6 h-auto p-1 justify-start">
            {allCardSets.map((set) => (
              <TabsTrigger
                key={set.name}
                value={set.name}
                className="capitalize"
              >
                {set.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {allCardSets.map((set) => (
            <TabsContent key={set.name} value={set.name} className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {set.cards.map((card, index) => {
                  const cardKey = `${set.name}-${index}-${card.url}`;
                  const isLoading = cardImageLoading[cardKey] === true;
                  const isLocked = card.isSecret && !isSecretCardUnlocked(card.url);
                  
                  return (
                    <Dialog key={cardKey}>
                      {isLocked ? (
                        <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 aspect-[3/4] cursor-not-allowed opacity-75">
                          <img
                            src={secretCardImage}
                            alt="Locked Secret Card"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-gray-700/90 text-gray-300 text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                            LOCKED
                          </div>
                        </div>
                      ) : (
                        <>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => {
                            setCardImageLoading(prev => ({ ...prev, [cardKey]: true }));
                          }}
                          className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg overflow-hidden"
                        >
                          {set.isEmoji ? (
                            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted aspect-[3/4] transition-transform duration-300 group-hover:scale-105">
                              <span className="text-4xl transition-transform duration-300 group-hover:scale-125">
                                {card.url}
                              </span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 aspect-[3/4] group-hover:scale-105 transition-transform duration-300">
                              {isLoading && (
                                <Skeleton className="absolute inset-0 w-full h-full" />
                              )}
                              {card.isVideo ? (
                                <video
                                  src={card.url}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  onLoadedData={() => handleImageLoad(cardKey)}
                                  onError={() => handleImageError(cardKey)}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                                    isLoading ? "opacity-0" : "opacity-100"
                                  }`}
                                />
                              ) : (
                                <img
                                  src={card.url}
                                  alt={`Card ${index + 1}`}
                                  loading="lazy"
                                  onLoad={() => handleImageLoad(cardKey)}
                                  onError={() => handleImageError(cardKey)}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                                    isLoading ? "opacity-0" : "opacity-100"
                                  }`}
                                />
                              )}
                              {card.isSecret && (
                                <div className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                                  SECRET
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
                        <div className="flex flex-col items-center gap-6 py-4">
                          <h2 className="text-xl sm:text-2xl font-semibold capitalize">
                            {set.name} Card
                          </h2>
                          <InteractiveCard
                            card={card.url}
                            isEmoji={set.isEmoji}
                            isVideo={card.isVideo}
                            isSecret={card.isSecret}
                            isLoading={isLoading}
                            onLoad={() => handleImageLoad(cardKey)}
                            onError={() => handleImageError(cardKey)}
                          />
                        </div>
                      </DialogContent>
                      </>
                      )}
                    </Dialog>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default CardDex;

