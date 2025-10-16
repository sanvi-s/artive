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
        "relative group cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.4)]",
        "transition-all duration-300 ease-out",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered
          ? `scale(1.03) translateY(-8px) rotate(0deg)`
          : `scale(1) translateY(0) rotate(${rotation}deg)`,
      }}
    >
      {/* Image background */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.75 : 1
          }}
        />
        {/* Dark overlay on hover */}
        <div 
          className="absolute inset-0 bg-black/25 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-end space-y-2">
        <h4 
          className="font-semibold text-sm leading-tight line-clamp-2 transition-all duration-300"
          style={{
            fontFamily: 'serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            color: isHovered ? 'hsl(40, 25%, 95%)' : 'hsl(40, 25%, 90%)'
          }}
        >
          {title}
        </h4>
        <p 
          className="text-xs line-clamp-3 font-handwritten italic transition-all duration-300"
          style={{
            color: isHovered ? 'hsl(40, 15%, 85%)' : 'hsl(40, 15%, 75%)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {excerpt}
        </p>
      </div>

      {/* Hover effect */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};
