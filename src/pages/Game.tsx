import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  type Difficulty,
  getGridSize,
  getTimeLimit,
  getFlipLimit,
  getSecretChance,
} from "../lib/gameConstants";
import { useCardThemes } from "../lib/themeUtils";
import { CircularProgress } from "../components/ui/circular-progress";
import { useTheme } from "@/contexts/ThemeContext";
import { unlockSecretCard } from "../lib/secretCardUtils";

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
  isVideo?: boolean;
  isSecret?: boolean;
};

type StartState = {
  difficulty?: Difficulty;
  imageSet?: string;
  limitFlips?: boolean;
};

// Card component to handle video playback
function GameCard({
  card,
  cardSize,
  backImageUrl,
  lastMatched,
  theme,
  onFlip,
  onMediaLoad,
  onMediaError,
  isGameReady,
}: {
  card: Card;
  cardSize: number;
  backImageUrl?: string;
  lastMatched: number[];
  theme: string;
  onFlip: () => void;
  onMediaLoad: () => void;
  onMediaError: () => void;
  isGameReady: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasLoadedRef = useRef(false);
  
  // Control video playback based on card state
  // Video plays when flipped and continues playing when matched
  useEffect(() => {
    if (card.isVideo && videoRef.current) {
      if (card.flipped || card.matched) {
        videoRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [card.flipped, card.matched, card.isVideo]);
  
  // Mark emoji cards as loaded immediately (no media to load)
  useEffect(() => {
    if (!card.value.includes("/") && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      onMediaLoad();
    }
  }, [card.value, onMediaLoad]);
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => isGameReady && !card.flipped && !card.matched && onFlip()}
      disabled={!isGameReady}
      className={`relative ${card.matched ? "opacity-90" : ""} ${!isGameReady ? "cursor-wait" : ""}`}
      style={{ perspective: "1000px" }}
    >
      {/* Matched bounce + pop flash */}
      <motion.div
        className={`absolute inset-0 rounded ring-border ring-4`}
        initial={{ opacity: 0, scale: 1 }}
        animate={
          lastMatched.includes(card.id)
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, -3, 3, 0],
                opacity: [0, 1, 0.8],
              }
            : undefined
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.div
        className={`absolute inset-0 rounded ring ${theme === "dark" ? "ring-white/50" : "ring-black/50"} shadow-md shadow-black/20 ${
          backImageUrl
            ? ""
            : `bg-gradient-to-br ${
              theme === "dark" ? "from-purple-500 via-violet-500 to-indigo-500" : "from-cyan-500 via-teal-500 to-green-500"
            }`
        }`}
        initial={{ rotateY: card.flipped ? 180 : 0 }}
        animate={{ rotateY: card.flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: backImageUrl
            ? `url(${backImageUrl})`
            : undefined,
        }}
      />
      <motion.div
        className={`absolute inset-0 flex items-center justify-center rounded ring ${theme === "dark" ? "ring-white/50" : "ring-black/50"} shadow-md shadow-black/20 bg-white text-slate-900 text-4xl`}
        initial={{
          rotateY: card.flipped ? 0 : -180,
          scale: card.matched ? 0.9 : 1,
        }}
        animate={{
          rotateY: card.flipped ? 0 : -180,
          scale: card.matched ? 0.9 : 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
      >
        {card.isVideo ? (
          <video
            ref={videoRef}
            src={card.value}
            loop
            muted
            playsInline
            onLoadedData={() => {
              if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                onMediaLoad();
              }
            }}
            onError={() => {
              if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                onMediaError();
              }
            }}
            className="w-full h-full object-cover object-center rounded"
          />
        ) : card.value.includes("/") ? (
          <img
            src={card.value}
            alt="card"
            onLoad={() => {
              if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                onMediaLoad();
              }
            }}
            onError={() => {
              if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                onMediaError();
              }
            }}
            className="w-full h-full object-cover object-center rounded"
          />
        ) : (
          card.value
        )}
        {card.isSecret && (
          <div className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
            SECRET
          </div>
        )}
      </motion.div>
      {/* Size the card explicitly to avoid page scroll */}
      <div
        style={{
          width: cardSize,
          height: Math.round(cardSize * (4 / 3)),
        }}
      />
    </motion.button>
  );
}

function Game() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: StartState };
  const difficulty = (location.state?.difficulty ?? "easy") as Difficulty;
  const imageSet = (location.state?.imageSet ?? "emoji") as string;
  const limitFlips = location.state?.limitFlips ?? false;
  const { cols, rows } = getGridSize(difficulty);
  const maxFlips = limitFlips ? getFlipLimit(difficulty) : Infinity;
  const secretChance = getSecretChance(difficulty);

  const { theme } = useTheme();
  // Load theme images from /src/assets/Illustration/<theme>
  const themes = useCardThemes();

  const [cards, setCards] = useState<Card[]>([]);
  const [, setSelectedIds] = useState<number[]>([]);
  const [flipCount, setFlipCount] = useState(0);
  const [lastMatched, setLastMatched] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLimit(difficulty));
  const timerRef = useRef<number | null>(null);
  
  // Track loading state for all cards
  const [loadedCards, setLoadedCards] = useState<Set<number>>(new Set());
  const [errorCards, setErrorCards] = useState<Set<number>>(new Set());
  const isGameReady = cards.length > 0 && loadedCards.size + errorCards.size === cards.length;

  // Compute a card size that fits the viewport without scrolling
  const [cardSize, setCardSize] = useState<number>(64);
  useEffect(() => {
    function computeSize() {
      const paddingX = 32; // page horizontal padding
      const gap = 12; // grid gap in px (gap-3)
      const headerH = 48; // HUD height estimate
      const controlsH = 56; // buttons area estimate
      const verticalPadding = 40; // top/bottom padding/margins
      const availableW = Math.max(
        280,
        window.innerWidth - paddingX * 2 - gap * (cols - 1)
      );
      const availableH = Math.max(
        200,
        window.innerHeight -
          headerH -
          controlsH -
          verticalPadding -
          gap * (rows - 1)
      );
      const sizeByW = Math.floor(availableW / cols);
      const sizeByH = Math.floor(availableH / rows / (4 / 3)); // account for 3:4 aspect
      const size = Math.max(36, Math.min(sizeByW, sizeByH));
      setCardSize(size);
    }

    // Initial calculation
    computeSize();

    // Debounce resize handler for better performance
    let timeoutId: number | undefined;
    const handleResize = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        computeSize();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [cols, rows]);

  const buildPool = useCallback(
    (kind: string, needed: number): Array<{ url: string; isVideo?: boolean; isSecret?: boolean }> => {
      const theme = themes[kind];
      let pool: Array<{ url: string; isVideo?: boolean; isSecret?: boolean }> = [];

      if (theme && theme.cards.length > 0) {
        // Separate regular cards and secret cards
        const regularCards = theme.cards.filter(card => !card.isSecret);
        const secretCards = theme.cards.filter(card => card.isSecret);
        
        // Map to card objects - include ALL secret cards (both locked and unlocked)
        // so users have a chance to unlock them by matching
        const regularPool = regularCards.map(card => ({ 
          url: card.url, 
          isVideo: card.isVideo, 
          isSecret: card.isSecret 
        }));
        const secretPool = secretCards.map(card => ({ 
          url: card.url, 
          isVideo: card.isVideo, 
          isSecret: card.isSecret 
        }));
        
        // Build pool with 5% chance per card slot to be secret
        // This ensures secret cards can appear even in small games
        const availableRegular = [...regularPool];
        const availableSecret = [...secretPool];
        pool = [];
        
        // Select cards one by one with 10% chance for secret each time
        for (let i = 0; i < needed; i++) {
          const secretRand = Math.random();
          const useSecret = secretRand < secretChance && availableSecret.length > 0;
          
          if (useSecret) {
            // Pick a random secret card and remove it to ensure uniqueness
            const randomIndex = Math.floor(Math.random() * availableSecret.length);
            pool.push(availableSecret[randomIndex]);
            availableSecret.splice(randomIndex, 1);
          } else if (availableRegular.length > 0) {
            // Pick a random regular card and remove it to ensure uniqueness
            const randomIndex = Math.floor(Math.random() * availableRegular.length);
            pool.push(availableRegular[randomIndex]);
            availableRegular.splice(randomIndex, 1);
          } else if (availableSecret.length > 0) {
            // Fallback: if regular pool is exhausted, use secret cards
            const randomIndex = Math.floor(Math.random() * availableSecret.length);
            pool.push(availableSecret[randomIndex]);
            availableSecret.splice(randomIndex, 1);
          } else {
            // Both pools exhausted - need to repeat
            break;
          }
        }
        
        // If we need more cards than available in unique pools, repeat the pool
        while (pool.length < needed && pool.length > 0) {
          pool = pool.concat(pool).slice(0, needed);
        }
      } else {
        const emoji = [
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
          "🔥",
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
        pool = [...new Set([...emoji])].map(emoji => ({ url: emoji }));
        // If we need more emojis than available, repeat the pool
        while (pool.length < needed) {
          pool = pool.concat(pool).slice(0, needed);
        }
      }

      // Shuffle the pool randomly
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      // Return the first N items needed
      return shuffled.slice(0, needed);
    },
    [themes]
  );

  useEffect(() => {
    const total = cols * rows;
    const needed = total / 2;
    const candidates = buildPool(imageSet, needed);
    const deck: Card[] = [...candidates, ...candidates]
      .map((v, idx) => ({
        id: idx + 1,
        value: v.url,
        flipped: false,
        matched: false,
        isVideo: v.isVideo,
        isSecret: v.isSecret,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipCount(0);
    setSelectedIds([]);
    // Reset loading state when deck changes
    setLoadedCards(new Set());
    setErrorCards(new Set());
  }, [cols, rows, imageSet, buildPool]);
  
  // Handle card media loading
  const handleCardLoad = useCallback((cardId: number) => {
    setLoadedCards((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);
  
  const handleCardError = useCallback((cardId: number) => {
    setErrorCards((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  // Start timer only when all cards are loaded
  useEffect(() => {
    if (!isGameReady || timerRef.current != null) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameReady]);

  // Win condition - check this first before any lose conditions
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const totalTime = getTimeLimit(difficulty);
      navigate("/result", {
        state: {
          win: true,
          flips: flipCount,
          timeTaken: totalTime - timeLeft,
          difficulty,
          imageSet,
          limitFlips,
          loseReason: null,
        },
      });
    }
  }, [cards, timeLeft, flipCount, difficulty, navigate, imageSet, limitFlips]);

  // Time up lose condition
  useEffect(() => {
    if (timeLeft <= 0) {
      const allMatched = cards.length > 0 && cards.every((c) => c.matched);
      if (!allMatched) {
        if (timerRef.current != null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        navigate("/result", {
          state: {
            win: false,
            flips: flipCount,
            timeTaken: getTimeLimit(difficulty),
            difficulty,
            imageSet,
            limitFlips,
            loseReason: "time",
          },
        });
      }
    }
  }, [timeLeft, flipCount, navigate, difficulty, imageSet, limitFlips, cards]);

  // Flip limit lose condition - only check if limit is enabled and exceeded
  useEffect(() => {
    if (limitFlips && flipCount > maxFlips) {
      const allMatched = cards.length > 0 && cards.every((c) => c.matched);
      if (!allMatched) {
        // Flip limit exceeded and game not won - lose immediately
        if (timerRef.current != null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const totalTime = getTimeLimit(difficulty);
        navigate("/result", {
          state: {
            win: false,
            flips: flipCount,
            timeTaken: totalTime - timeLeft,
            difficulty,
            imageSet,
            limitFlips,
            loseReason: "flips",
          },
        });
      }
    }
  }, [
    flipCount,
    limitFlips,
    maxFlips,
    cards,
    timeLeft,
    difficulty,
    navigate,
    imageSet,
  ]);

  function flip(cardId: number) {
    // If flip limit is reached and user tries to flip, end the game immediately
    if (limitFlips && flipCount >= maxFlips) {
      const allMatched = cards.length > 0 && cards.every((c) => c.matched);
      if (!allMatched) {
        if (timerRef.current != null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const totalTime = getTimeLimit(difficulty);
        navigate("/result", {
          state: {
            win: false,
            flips: flipCount,
            timeTaken: totalTime - timeLeft,
            difficulty,
            imageSet,
            limitFlips,
            loseReason: "flips",
          },
        });
      }
      return;
    }
    const newFlipCount = flipCount + 1;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c))
    );
    setFlipCount(newFlipCount);
    setSelectedIds((sel) => {
      const next = [...sel, cardId];
      if (next.length === 2) {
        const [aId, bId] = next;
        const a = cards.find((c) => c.id === aId)!;
        const b = cards.find((c) => c.id === bId)!;
        if (a.value === b.value) {
          // If matched cards are secret, unlock them
          if (a.isSecret && b.isSecret) {
            unlockSecretCard(a.value).catch(console.error);
          }
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === aId || c.id === bId ? { ...c, matched: true } : c
              )
            );
            setLastMatched([aId, bId]);
            setTimeout(() => setLastMatched([]), 700);
          }, 300);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === aId || c.id === bId ? { ...c, flipped: false } : c
              )
            );
          }, 600);
        }
        return [];
      }
      return next;
    });
  }

  const themeForBack = themes[imageSet];
  const backImageUrl = themeForBack?.back;

  return (
    <div
      className="relative mx-auto px-4 min-h-[calc(100vh-100px)] flex flex-col"
      style={{ maxWidth: "100%" }}
    >
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-foreground">Time:</div>
          <CircularProgress
            value={timeLeft}
            max={getTimeLimit(difficulty)}
            size={72}
            strokeWidth={6}
          />
        </div>
        <div className="font-semibold text-foreground">
          Flips: {flipCount}
          {limitFlips && <span className="text-muted-foreground"> / {maxFlips}</span>}
        </div>
      </div>
      
      {/* Loading overlay */}
      {!isGameReady && cards.length > 0 && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-foreground">
              Loading cards...
            </div>
            <div className="text-sm text-muted-foreground">
              {loadedCards.size + errorCards.size} / {cards.length} loaded
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cardSize}px)` }}
        >
          {cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              cardSize={cardSize}
              backImageUrl={backImageUrl}
              lastMatched={lastMatched}
              theme={theme}
              onFlip={() => flip(card.id)}
              onMediaLoad={() => handleCardLoad(card.id)}
              onMediaError={() => handleCardError(card.id)}
              isGameReady={isGameReady}
            />
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground font-semibold px-4 py-2 shadow hover:opacity-90"
        >
          Quit
        </button>
        <button
          onClick={() => navigate(0)}
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:opacity-90"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default Game;
