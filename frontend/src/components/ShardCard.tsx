import { cn } from "@/lib/utils";
import { useState } from "react";

interface ShardCardProps {
  image: string;
  title: string;
  excerpt: string;
  rotation?: number;
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses = {
  small: "w-[180px] h-[240px]",
  medium: "w-[240px] h-[320px]",
  large: "w-[300px] h-[400px]",
};

export const ShardCard = ({
  image,
  title,
  excerpt,
  rotation = 2,
  size = "medium",
  className,
}: ShardCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group cursor-pointer torn-edge overflow-hidden",
        "bg-card backdrop-blur-paper shadow-shard",
        "transition-all duration-hover ease-organic",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered
          ? `translateY(-8px) rotate(0deg)`
          : `translateY(0) rotate(${rotation}deg)`,
        borderRadius: "10px 16px 8px 14px",
      }}
    >
      {/* Image background */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-end space-y-2">
        <h4 className="font-display font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-3 font-handwritten italic">
          {excerpt}
        </p>
      </div>

      {/* Hover effect */}
      {isHovered && (
        <>
          <div className="absolute inset-0 border-2 border-accent/30 rounded-[10px_16px_8px_14px] pointer-events-none" />
          <div className="absolute inset-0 bg-accent/5 animate-ink-ripple pointer-events-none rounded-[10px_16px_8px_14px]" />
        </>
      )}
    </div>
  );
};
