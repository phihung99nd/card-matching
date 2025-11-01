import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomCursorProps {
  cursorImage?: string;
  pointerImage?: string;
}

export function CustomCursor({ cursorImage, pointerImage }: CustomCursorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Check if we're hovering over a clickable element
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer";
      
      setIsPointer(isClickable);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Hide cursor when mouse leaves the window
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  const defaultCursorSrc = cursorImage || "/cursor/default.png";
  const pointerCursorSrc = pointerImage || "/cursor/pointer.png";
  const currentCursor = isPointer ? pointerCursorSrc : defaultCursorSrc;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed drop-shadow-md drop-shadow-black/50 pointer-events-none z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          }}
        >
          <img
            src={currentCursor}
            alt="cursor"
            className="w-6 h-6 select-none"
            style={{
              imageRendering: "auto",
              ...({
                WebkitImageRendering: "auto",
                MozImageRendering: "auto",
                msImageRendering: "auto",
                OImageRendering: "auto",
              } as React.CSSProperties),
            }}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

