import { cn } from "@/lib/utils";
import { useState } from "react";
import { TextSeed } from "@/types/seed";
import { GitFork, Eye, Quote } from "lucide-react";

interface TextCardProps {
  seed: TextSeed;
  className?: string;
  style?: React.CSSProperties;
  onFork?: (seedId: string) => void;
  onView?: (seedId: string) => void;
  onDelete?: (seedId: string) => void;
}

export const TextCard = ({ 
  seed, 
  className, 
  style, 
  onFork, 
  onView,
  onDelete
}: TextCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFork?.(seed.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(seed.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this seed? This cannot be undone.')) {
      onDelete?.(seed.id);
    }
  };


  const displayContent = isExpanded ? seed.content : seed.excerpt;
  const shouldTruncate = !isExpanded && seed.content.length > seed.excerpt.length;

  return (
        <div
          className={cn(
            "relative group cursor-pointer bg-gradient-to-br from-amber-100 to-amber-200 dark:from-transparent dark:to-transparent backdrop-blur-paper border border-amber-300/40 dark:border-border/20 transition-all duration-hover ease-organic hover:scale-[1.02] hover:-translate-y-1 animate-organic-fade-in hover:border-accent-1/30 h-fit min-h-[200px] max-h-[300px] torn_container torn_left torn_right",
            className
          )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      style={style}
    >
      <div></div>
      <div className="relative">
      {/* Ink ripple effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-accent-1/5 rounded-lg animate-ink-ripple pointer-events-none" />
      )}

      {/* Thread indicator */}
      {seed.isThread && seed.threadIndex && seed.totalThreadParts && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-accent-1/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-accent-1 border border-accent-1/30">
            {seed.threadIndex}/{seed.totalThreadParts}
          </div>
        </div>
      )}

      {/* Quote icon for text seeds */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-8 h-8 rounded-full bg-accent-1/10 backdrop-blur-sm flex items-center justify-center border border-accent-1/20">
          <Quote className="h-4 w-4 text-accent-1" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-10 space-y-3">
        {/* Title */}
        <h3 className="font-display font-semibold text-lg leading-tight text-foreground">
          {seed.title}
        </h3>

        {/* Text content */}
        <div className="space-y-2">
          <div className="relative">
            <p className="text-foreground/90 leading-relaxed text-sm font-serif line-clamp-4 whitespace-pre-wrap">
              {displayContent}
            </p>
            
            {/* Fade mask for truncated content */}
            {shouldTruncate && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
          </div>

          {/* Thread parts preview */}
          {seed.isThread && seed.threadParts && seed.threadParts.length > 1 && !isExpanded && (
            <div className="space-y-2">
              {seed.threadParts.slice(0, 2).map((part, index) => (
                <div key={index} className="text-sm text-muted-foreground italic border-l-2 border-accent-1/30 pl-3">
                  {part.length > 60 ? `${part.substring(0, 60)}...` : part}
                </div>
              ))}
              {seed.threadParts.length > 2 && (
                <div className="text-xs text-muted-foreground italic">
                  +{seed.threadParts.length - 2} more thoughts...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {seed.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {seed.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-accent-1/10 text-accent-1 rounded-full border border-accent-1/20"
              >
                {tag}
              </span>
            ))}
            {seed.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{seed.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
          <div className="flex items-center gap-2">
            <span className="font-handwritten text-accent-1">{seed.author}</span>
            <span>•</span>
            <span>{seed.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {seed.forks > 0 && (
              <span className="flex items-center gap-1 text-accent-2">
                <GitFork className="h-3 w-3" />
                {seed.forks}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-sm",
          "transform translate-y-full transition-transform duration-reveal ease-organic",
          "group-hover:translate-y-0 border-t border-border/20"
        )}
        style={{ paddingBottom: '10px' }}
      >
        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={handleFork}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-1/20 hover:bg-accent-1/30 text-accent-1 border border-accent-1/30 transition-colors"
          >
            <GitFork className="h-3 w-3" />
            <span>Fork</span>
          </button>
          <button 
            onClick={handleView}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>Read</span>
          </button>
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground border border-destructive/50 transition-colors"
            >
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

        {/* Expand/collapse indicator */}
        {shouldTruncate && (
          <div className="absolute bottom-12 right-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border/30">
            {isExpanded ? 'Show less' : 'Read more'}
          </div>
        )}
      </div>
    </div>
  );
};
