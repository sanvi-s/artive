import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Seed, TextSeed, VisualSeed } from "@/types/seed";
import { GitFork, Eye, Quote, Image as ImageIcon, X, Calendar, User, Tag } from "lucide-react";

interface SeedViewModalProps {
  seed: Seed | null;
  isOpen: boolean;
  onClose: () => void;
  onFork?: (seedId: string) => void;
}

export const SeedViewModal = ({ seed, isOpen, onClose, onFork }: SeedViewModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!seed) return null;

  const handleFork = () => {
    onFork?.(seed.id);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            {seed.type === 'text' ? (
              <Quote className="h-5 w-5 text-accent-1" />
            ) : (
              <ImageIcon className="h-5 w-5 text-accent-2" />
            )}
            {seed.title}
          </DialogTitle>
          {/* Accessible description to satisfy aria and silence warnings */}
          <DialogDescription className="sr-only">
            {seed.type === 'visual' ? (seed as VisualSeed).description || '' : (seed as TextSeed).excerpt || ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Author and metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-handwritten text-accent-1">{seed.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(seed.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4" />
              <span>{seed.forks} forks</span>
            </div>
          </div>

          {/* Content based on seed type */}
          {seed.type === 'text' && (
            <div className="space-y-4">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg torn-edge-soft">
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-semibold">Content</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground/90 leading-relaxed font-serif whitespace-pre-line">
                      {isExpanded ? seed.content : seed.excerpt}
                    </p>
                    {seed.content.length > seed.excerpt.length && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-accent-1 hover:text-accent-1/80 text-sm font-medium"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Thread parts */}
                  {seed.isThread && seed.threadParts && seed.threadParts.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Thread Parts</h4>
                      <div className="space-y-2">
                        {seed.threadParts.map((part, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded border-l-2 border-accent-1/30">
                            <div className="text-xs text-muted-foreground mb-1">Part {index + 1}</div>
                            <p className="text-sm font-serif">{part}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {seed.type === 'visual' && (
            <div className="space-y-4">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg torn-edge-soft">
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={seed.image}
                      alt={seed.alt || seed.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {(() => { try { console.debug('[SeedViewModal] visual', { id: seed.id, hasDescription: Boolean(seed.description), preview: (seed.description || '').slice(0, 80) }); } catch {} return null; })()}
                  {seed.description && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">Description</h3>
                      <p className="text-foreground/90 leading-relaxed font-serif">
                        {seed.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {seed.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {seed.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-accent-1/10 text-accent-1 rounded-full border border-accent-1/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/20">
            <Button
              onClick={handleFork}
              variant="hero"
              className="flex-1"
            >
              <GitFork className="h-4 w-4 mr-2" />
              Fork This Seed
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
