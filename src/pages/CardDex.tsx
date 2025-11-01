import { useState, useMemo, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCardThemes } from "@/lib/themeUtils";
import { Skeleton } from "@/components/ui/skeleton";

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

// Interactive card component with hover tilt and float effect
function InteractiveCard({
  card,
  isEmoji,
  isLoading,
  onLoad,
  onError,
}: {
  card: string;
  isEmoji: boolean;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [isHovering, setIsHovering] = useState(false);

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
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full z-0" />
          )}
          <img
            src={card}
            alt="Card detail"
            onLoad={onLoad}
            onError={onError}
            className={`relative z-10 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>
      )}
    </div>
  );
}

function CardDex() {
  const themesMap = useCardThemes();
  const [cardImageLoading, setCardImageLoading] = useState<Record<string, boolean>>({});

  const allCardSets = useMemo(() => {
    const sets: Array<{ name: string; isEmoji: boolean; cards: string[] }> = [
      {
        name: "emoji",
        isEmoji: true,
        cards: [...new Set(EMOJI_LIST)],
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
          cards: themeData.cards,
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
                  const cardKey = `${set.name}-${index}-${card}`;
                  const isLoading = cardImageLoading[cardKey] === true;
                  
                  return (
                    <Dialog key={cardKey}>
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
                                {card}
                              </span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 aspect-[3/4] group-hover:scale-105 transition-transform duration-300">
                              {isLoading && (
                                <Skeleton className="absolute inset-0 w-full h-full" />
                              )}
                              <img
                                src={card}
                                alt={`Card ${index + 1}`}
                                loading="lazy"
                                onLoad={() => handleImageLoad(cardKey)}
                                onError={() => handleImageError(cardKey)}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${
                                  isLoading ? "opacity-0" : "opacity-100"
                                }`}
                              />
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
                            card={card}
                            isEmoji={set.isEmoji}
                            isLoading={isLoading}
                            onLoad={() => handleImageLoad(cardKey)}
                            onError={() => handleImageError(cardKey)}
                          />
                        </div>
                      </DialogContent>
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

