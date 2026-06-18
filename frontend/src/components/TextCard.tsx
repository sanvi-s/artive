import { cn } from "@/lib/utils";
import { useState } from "react";
import { TextSeed } from "@/types/seed";
import { GitFork, Eye, Quote, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
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


  const rawContent = (seed as TextSeed).content || (seed as TextSeed).excerpt || '';
  // Strip HTML tags for the card preview; full HTML is shown in the modal
  const displayContent = rawContent.replace(/<[^>]+>/g, '').trim();

  return (
        <div
          className={cn(
            "relative group cursor-pointer bg-gradient-to-br from-amber-100 to-amber-200 dark:from-transparent dark:to-transparent backdrop-blur-paper border border-amber-300/40 dark:border-border/20 transition-all duration-hover ease-organic hover:scale-[1.02] hover:-translate-y-1 animate-organic-fade-in hover:border-accent-1/30 h-fit self-start torn_container torn_left torn_right",
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

      {/* Delete button - top right (show on hover) */}
      {onDelete && (
        <div className={`absolute top-3 z-10 transform transition-all duration-300 ease-organic ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${seed.isThread && seed.threadIndex && seed.totalThreadParts ? 'right-20' : 'right-3'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this seed? This cannot be undone.')) { onDelete?.(seed.id); } }}
            className="px-2 py-1 text-xs rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground border border-destructive/50 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Delete
          </button>
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
        <p className="text-foreground/90 leading-relaxed text-sm font-serif line-clamp-6">
          {displayContent}
        </p>

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
            <span>{new Date(seed.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
          "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-amber-200/95 via-amber-100/80 to-transparent",
          "opacity-0 pointer-events-none transition-opacity duration-reveal ease-organic",
          "group-hover:opacity-100 group-hover:pointer-events-auto"
        )}
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
          {/* Delete action removed from footer; kept only as top-right icon */}
        </div>
      </div>

      </div>
    </div>
  );
};
