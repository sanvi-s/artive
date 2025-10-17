import { cn } from "@/lib/utils";
import { useState } from "react";
import { Seed, TextSeed, VisualSeed } from "@/types/seed";
import { TextCard } from "./TextCard";
import { GitFork, Eye, Image as ImageIcon, X } from "lucide-react";

interface UnifiedSeedCardProps {
  seed: Seed;
  className?: string;
  style?: React.CSSProperties;
  onFork?: (seedId: string) => void;
  onView?: (seedId: string) => void;
  onDelete?: (seedId: string) => void;
}

export const UnifiedSeedCard = ({ 
  seed, 
  className, 
  style, 
  onFork, 
  onView, 
  onDelete 
}: UnifiedSeedCardProps) => {
  console.log('🎨 UnifiedSeedCard received seed:', seed);
  console.log('🎨 Seed type:', seed.type);
  if (seed.type === 'visual') {
    console.log('🎨 Visual seed content:', (seed as any).content);
    console.log('🎨 Content type:', typeof (seed as any).content);
    console.log('🎨 Content length:', (seed as any).content?.length);
  }
  // Render text seeds with TextCard component
  if (seed.type === 'text') {
    return (
      <TextCard
        seed={seed as TextSeed}
        className={className}
        style={style}
        onFork={onFork}
        onView={onView}
      />
    );
  }

  // Render visual seeds with the existing SeedCard logic
  if (seed.type === 'visual') {
    return <VisualSeedCard seed={seed as VisualSeed} className={className} style={style} onFork={onFork} onView={onView} onDelete={onDelete} />;
  }

  // For other types, render a placeholder
  return (
    <div className={cn("p-6 bg-card rounded-lg border border-border", className)}>
      <p className="text-muted-foreground">Unsupported seed type: {seed.type}</p>
    </div>
  );
};

// Visual seed card component (extracted from original SeedCard)
const VisualSeedCard = ({ 
  seed, 
  className, 
  style, 
  onFork, 
  onView,
  onDelete
}: {
  seed: VisualSeed;
  className?: string;
  style?: React.CSSProperties;
  onFork?: (seedId: string) => void;
  onView?: (seedId: string) => void;
  onDelete?: (seedId: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFork?.(seed.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(seed.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(seed.id);
  };


  return (
        <div
          className={cn(
            "relative group cursor-pointer bg-card backdrop-blur-paper shadow-paper hover:shadow-paper-hover transition-all duration-hover ease-organic hover:scale-[1.03] animate-organic-fade-in h-fit min-h-[280px] max-h-[400px] torn_container torn_left torn_right",
            className
          )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      <div></div>
      <div className="relative">
      {/* Ink ripple effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-accent/10 rounded-lg animate-ink-ripple pointer-events-none" />
      )}

      {/* Visual icon indicator */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-8 h-8 rounded-full bg-accent-2/10 backdrop-blur-sm flex items-center justify-center border border-accent-2/20 group-hover:bg-accent-2/20 transition-colors duration-300">
          <ImageIcon className="h-4 w-4 text-accent-2 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      {onDelete && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this seed? This cannot be undone.')) { onDelete?.(seed.id); } }}
            className="px-2 py-1 text-xs rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground border border-destructive/50 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Delete
          </button>
        </div>
      )}
      
      {/* Image */}
      <div className={`relative ${isLandscape === null ? 'aspect-[4/5]' : (isLandscape ? 'aspect-video' : 'aspect-[4/5]')} overflow-hidden`}>
        <img
          src={seed.image}
          alt={seed.alt || seed.title}
          className="w-full h-full object-cover transition-transform duration-long ease-organic group-hover:scale-105"
          onLoad={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            setIsLandscape(img.naturalWidth >= img.naturalHeight);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        
        {/* Hover overlay with title and description */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4">
          <div className="transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-display font-semibold text-white text-lg mb-2 line-clamp-2">
              {seed.title}
            </h3>
            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {(seed as any).content || (seed as VisualSeed).description || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-base leading-tight line-clamp-2 group-hover:opacity-0 transition-opacity duration-300">
          {seed.title}
        </h3>
        {seed.type === 'visual' && (seed as any).content && (
          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:opacity-0 transition-opacity duration-300">
            {(seed as any).content}
          </p>
        )}
        {seed.type === 'visual' && !(seed as any).content && (
          <p className="text-xs text-red-500">DEBUG: No content found for visual seed</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-handwritten">{seed.author}</span>
          <span>{seed.time}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {seed.forks > 0 && (
            <span className="flex items-center gap-1 text-accent-2">
              <GitFork className="h-3 w-3" />
              {seed.forks}
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background/95 to-transparent",
          "transform translate-y-full transition-transform duration-reveal ease-organic",
          "group-hover:translate-y-0"
        )}
      >
        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={handleFork}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
          >
            <GitFork className="h-3 w-3" />
            <span>Fork</span>
          </button>
          <button 
            onClick={handleView}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>View</span>
          </button>
          {/* Delete action removed from footer; kept only as top-right icon */}
        </div>
      </div>
      </div>
    </div>
  );
};