import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Skeleton } from "../components/ui/skeleton";
import { type Difficulty, getFlipLimit } from "../lib/gameConstants";
import { useCardThemes } from "../lib/themeUtils";
import { useTheme } from "@/contexts/ThemeContext";

function Start() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [imageSet, setImageSet] = useState<string>("emoji");
  const [limitFlips, setLimitFlips] = useState<boolean>(false);
  const [backImageLoading, setBackImageLoading] = useState(true);
  const [cardImageLoading, setCardImageLoading] = useState(true);

  const { theme } = useTheme();
  const themesMap = useCardThemes();

  // Reset loading states when imageSet changes
  const handleImageSetChange = (newImageSet: string) => {
    setImageSet(newImageSet);
    setBackImageLoading(true);
    setCardImageLoading(true);
  };

  const themeNames = useMemo<string[]>(
    () => Object.keys(themesMap).sort(),
    [themesMap]
  );

  function handleStart() {
    navigate("/game", {
      state: {
        difficulty,
        imageSet,
        limitFlips,
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 ring-1 ring-border">
        <h1 className="text-3xl font-bold text-card-foreground">Card Match</h1>
        <p className="text-muted-foreground mt-1">
          Train your memory. Match all pairs before time runs out.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-muted-foreground">Difficulty</span>
              <div className="mt-1">
                  <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as Difficulty)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (6 pairs)</SelectItem>
                    <SelectItem value="medium">Medium (9 pairs)</SelectItem>
                    <SelectItem value="hard">Hard (12 pairs)</SelectItem>
                    <SelectItem value="hell">Hell (14 pairs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-muted-foreground">Image set</span>
              <div className="mt-1">
                <Select value={imageSet} onValueChange={handleImageSetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emoji">Emoji</SelectItem>
                    {themeNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </label>

            <div className="flex items-start gap-3">
              <Checkbox
                id="flip-limit"
								className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-1 focus:ring-ring focus:ring-offset-0"
                checked={limitFlips}
                onCheckedChange={(checked) => setLimitFlips(checked === true)}
              />
              <div className="grid gap-2">
                <label htmlFor="flip-limit" className="text-sm">
                  Limit flip count
                </label>
                <p className="text-muted-foreground text-sm h-4">
                  {limitFlips && (
                    <span className="block text-xs text-muted-foreground/70 mt-0.5">
                      Max {getFlipLimit(difficulty)} flips
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="block">
            <span className="text-sm text-muted-foreground">Preview</span>
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl ring-1 ring-border bg-muted/30 p-2">
              {imageSet === "emoji" ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1 text-center">
                      Card Back
                    </span>
                    <div className={`flex items-center justify-center overflow-hidden rounded aspect-[3/4] bg-gradient-to-br ${
                      theme === "dark" ? "from-purple-500 via-violet-500 to-indigo-500" : "from-cyan-500 via-teal-500 to-green-500"
                    } group cursor-pointer transition-transform duration-300 hover:scale-105`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs opacity-70 mb-1 text-center">
                      Card Face
                    </span>
                    <div className="flex items-center justify-center overflow-hidden rounded bg-muted aspect-[3/4] group cursor-pointer">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-125">😀</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1 text-center">
                      Card Back
                    </span>
                    <div className="relative flex items-center justify-center overflow-hidden rounded bg-muted/30 aspect-[3/4] group cursor-pointer">
                      {backImageLoading && (
                        <Skeleton className="absolute inset-0 w-full h-full" />
                      )}
                      {themesMap[imageSet]?.back ? (
                        <img
                          src={themesMap[imageSet].back}
                          alt="card back"
                          loading="lazy"
                          onLoad={() => setBackImageLoading(false)}
                          onError={() => setBackImageLoading(false)}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            backImageLoading ? "opacity-0" : "opacity-100"
                          } transition-opacity duration-300`}
                        />
                      ) : (
                        <span className={`text-sm text-muted-foreground ${
                          backImageLoading ? "opacity-0" : "opacity-100"
                        }`}>No back</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs opacity-70 mb-1 text-center">
                      Card Face
                    </span>
                    <div className="relative flex items-center justify-center overflow-hidden rounded bg-muted/30 aspect-[3/4] group cursor-pointer">
                      {cardImageLoading && (
                        <Skeleton className="absolute inset-0 w-full h-full" />
                      )}
                      {themesMap[imageSet]?.cards?.[0] ? (
                        <img
                          src={themesMap[imageSet].cards[0].url}
                          alt="card preview"
                          loading="lazy"
                          onLoad={() => setCardImageLoading(false)}
                          onError={() => setCardImageLoading(false)}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            cardImageLoading ? "opacity-0" : "opacity-100"
                          } transition-opacity duration-300`}
                        />
                      ) : (
                        <span className={`text-sm text-muted-foreground ${
                          cardImageLoading ? "opacity-0" : "opacity-100"
                        }`}>No card</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center md:justify-start">
          <button
            onClick={handleStart}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 shadow-lg shadow-black/10 hover:opacity-90 transition cursor-pointer"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Start;
