import { cn } from "@/lib/utils";
import { useState } from "react";

interface SeedCardProps {
  image: string;
  title: string;
  author: string;
  time: string;
  forks?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SeedCard = ({ image, title, author, time, forks = 0, className, style }: SeedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group cursor-pointer torn-edge-soft overflow-hidden",
        "bg-card backdrop-blur-paper shadow-paper hover:shadow-paper-hover",
        "transition-all duration-hover ease-organic",
        "hover:scale-[1.03] animate-organic-fade-in",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: "var(--radius)",
        ...style,
      }}
    >
      {/* Ink ripple effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-accent/10 rounded-lg animate-ink-ripple pointer-events-none" />
      )}
      
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-long ease-organic group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-handwritten">{author}</span>
          <span>{time}</span>
        </div>
        {forks > 0 && (
          <div className="text-xs text-accent-foreground">
            <span className="font-medium">{forks}</span> forks
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent",
          "transform translate-y-full transition-transform duration-reveal ease-organic",
          "group-hover:translate-y-0"
        )}
      >
        <div className="flex items-center gap-2 text-xs">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary transition-colors">
            <span>Fork</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors">
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
