import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      value,
      max,
      size = 64,
      strokeWidth = 6,
      showText = true,
      className,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const { theme } = useTheme();

    // Color based on time remaining
    const getColor = () => {
      if (percentage > 50) return "text-indigo-500";
      if (percentage > 25) return "text-yellow-500";
      return "text-red-500";
    };

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-90"
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={theme === "dark" ? "text-white/20" : "text-foreground/20"}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-300 ease-linear", getColor())}
            style={{
              transition: "stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease-in-out",
            }}
          />
        </svg>
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground">{Math.round(value)}</span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress };

