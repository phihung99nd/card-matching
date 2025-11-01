import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  type Difficulty,
  getGridSize,
  getTimeLimit,
  getFlipLimit,
} from "../lib/gameConstants";
import { useThemes } from "../lib/themeUtils";
import { CircularProgress } from "../components/ui/circular-progress";

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

type StartState = {
  difficulty?: Difficulty;
  imageSet?: string;
  limitFlips?: boolean;
};

function Game() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: StartState };
  const difficulty = (location.state?.difficulty ?? "easy") as Difficulty;
  const imageSet = (location.state?.imageSet ?? "emoji") as string;
  const limitFlips = location.state?.limitFlips ?? false;
  const { cols, rows } = getGridSize(difficulty);
  const maxFlips = limitFlips ? getFlipLimit(difficulty) : Infinity;

  // Load theme images from /src/assets/Illustration/<theme>
  const themes = useThemes();

  const [cards, setCards] = useState<Card[]>([]);
  const [, setSelectedIds] = useState<number[]>([]);
  const [flipCount, setFlipCount] = useState(0);
  const [lastMatched, setLastMatched] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLimit(difficulty));
  const timerRef = useRef<number | null>(null);

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
    (kind: string, needed: number): string[] => {
      const theme = themes[kind];
      let pool: string[] = [];

      if (theme && theme.cards.length > 0) {
        pool = theme.cards.filter(Boolean);
        // If we need more cards than available, repeat the pool
        while (pool.length < needed && theme.cards.length > 0) {
          pool = pool.concat(theme.cards).slice(0, needed);
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
        pool = [...new Set([...emoji])];
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
        value: v,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipCount(0);
    setSelectedIds([]);
  }, [cols, rows, imageSet, buildPool]);

  useEffect(() => {
    if (timerRef.current != null) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

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
      className="mx-auto px-4 min-h-[calc(100vh-100px)] flex flex-col"
      style={{ maxWidth: "100%" }}
    >
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="font-semibold">Time:</div>
          <CircularProgress
            value={timeLeft}
            max={getTimeLimit(difficulty)}
            size={72}
            strokeWidth={6}
          />
        </div>
        <div className="font-semibold">
          Flips: {flipCount}
          {limitFlips && <span className="opacity-70"> / {maxFlips}</span>}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cardSize}px)` }}
        >
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => !card.flipped && !card.matched && flip(card.id)}
              className={`relative ${card.matched ? "opacity-60" : ""}`}
              style={{ perspective: "1000px" }}
            >
              {/* Matched bounce + pop flash */}
              <motion.div
                className={`absolute inset-0 rounded ring ring-white`}
                initial={{ opacity: 0, scale: 1 }}
                animate={
                  lastMatched.includes(card.id)
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -3, 3, 0],
                        opacity: [0, 1, 0],
                      }
                    : undefined
                }
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.div
                className={`absolute inset-0 rounded ring ring-white shadow-md shadow-black/20 ${
                  backImageUrl
                    ? ""
                    : "bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500"
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
                className={`absolute inset-0 flex items-center justify-center rounded ring ring-white shadow-md shadow-black/20 bg-white text-slate-900 text-4xl`}
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
                {card.value.includes("/") ? (
                  <img
                    src={card.value}
                    alt="card"
                    className="w-full h-full object-cover object-center rounded"
                  />
                ) : (
                  card.value
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
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-700 font-semibold px-4 py-2 shadow hover:opacity-90"
        >
          Quit
        </button>
        <button
          onClick={() => navigate(0)}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-700 text-white font-semibold px-4 py-2 shadow hover:opacity-90"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default Game;
