import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Seed, TextSeed, VisualSeed } from "@/types/seed";
import { GitFork, Eye, Quote, Image as ImageIcon, X, Calendar, User, Tag, GitBranch } from "lucide-react";
import { useForklore } from "@/contexts/ForkloreContext";
import { motion, AnimatePresence } from "framer-motion";
import { ForkModal } from "./ForkModal";

interface SeedViewModalProps {
  seed: Seed | null;
  isOpen: boolean;
  onClose: () => void;
  onFork?: (seedId: string) => void;
  onForkCreated?: () => void;
}

export const SeedViewModal = ({ seed, isOpen, onClose, onFork, onForkCreated }: SeedViewModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setSelectedSeedId } = useForklore();

  if (!seed) return null;

  const handleFork = () => {
    setIsForkModalOpen(true);
    onClose();
  };

  const handleOpenForklore = () => {
    console.log('Opening Forklore for seed:', seed);
    console.log('Seed ID:', seed.id);
    console.log('Is Forked:', seed.isForked);
    console.log('Parent ID:', seed.parentId);
    
    // If this is a fork, use the parent seed ID for lineage
    const seedIdForLineage = seed.isForked && seed.parentId ? seed.parentId : seed.id;
    console.log('Using seed ID for lineage:', seedIdForLineage);
    
    setSelectedSeedId(seedIdForLineage);
    onClose();
    navigate('/forklore/timeline');
  };

  const handleAuthorClick = () => {
    // Extract author ID from seed data if available
    const authorId = (seed as any).authorId || (seed as any).author?._id;
    if (authorId) {
      onClose();
      navigate(`/profile/${authorId}`);
    }
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
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto px-8 py-6 gap-4 rounded-2xl border-orange-200/20 dark:border-orange-200/20 border-yellow-300/20 dark:shadow-[0_8px_32px_rgba(251,146,60,0.3)] shadow-[0_8px_32px_rgba(234,179,8,0.3)]"
        style={{
          background: 'rgba(234, 179, 8, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
        {/* Inner glow highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.3) 0%, transparent 100%)'
          }}
        />
        
        <DialogHeader className="space-y-4 pb-6 border-b border-yellow-300/20 dark:border-orange-200/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/20">
                {seed.type === 'text' ? (
                  <Quote className="h-6 w-6 text-accent-1" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-accent-2" />
                )}
              </div>
              <div>
                <DialogTitle 
                  className="text-2xl font-semibold leading-tight"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    color: 'hsl(30, 20%, 90%)'
                  }}
                >
                  {seed.title}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'hsl(30, 5%, 60%)' }}>
                  <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-all">
                    <User className="h-4 w-4" />
                    <button 
                      onClick={handleAuthorClick}
                      className="font-medium hover:text-accent-1 transition-colors cursor-pointer"
                    >
                      {seed.author}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-all">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(seed.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-all">
                    <GitFork className="h-4 w-4" />
                    <span>{seed.forks} forks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Accessible description to satisfy aria and silence warnings */}
          <DialogDescription className="sr-only">
            {seed.type === 'visual' ? (seed as VisualSeed).description || '' : (seed as TextSeed).excerpt || ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Content based on seed type */}
          {seed.type === 'text' && (
            <div className="space-y-6">
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/20">
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">Content</h3>
                  <div className="border-t border-yellow-300/20 dark:border-orange-200/20 mt-4 pt-4">
                    <div className="prose prose-sm max-w-none">
                      <p 
                        className="text-base leading-relaxed font-serif whitespace-pre-line"
                        style={{ color: 'hsl(40, 25%, 85%)' }}
                      >
                        {isExpanded ? (seed as TextSeed).content : (seed as TextSeed).excerpt}
                      </p>
                      {(seed as TextSeed).content && (seed as TextSeed).excerpt && (seed as TextSeed).content.length > (seed as TextSeed).excerpt.length && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="mt-2 text-accent-1 hover:text-accent-1/80 text-sm font-medium"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thread parts */}
                  {seed.isThread && seed.threadParts && seed.threadParts.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-foreground">Thread Parts</h4>
                      <div className="space-y-2">
                        {seed.threadParts.map((part, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded border-l-2 border-accent-1/30">
                            <div className="text-xs text-muted-foreground mb-1">Part {index + 1}</div>
                            <p className="text-sm font-serif text-foreground">{part}</p>
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
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/20">
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={(seed as VisualSeed).image}
                      alt={(seed as VisualSeed).alt || seed.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/800x450/E8C9B0/1E1B18?text=${seed.title.charAt(0)}`;
                      }}
                    />
                  </div>
                  
                  {(seed as VisualSeed).description && (
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2 text-foreground">Description</h3>
                      <p className="text-foreground/90 leading-relaxed font-serif">
                        {(seed as VisualSeed).description}
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
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
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
          <div className="flex flex-col gap-3 pt-4 border-t border-yellow-300/20 dark:border-orange-200/20">
            <div className="flex gap-3">
              <Button
                onClick={handleFork}
                className="flex-1 h-11 px-6 text-sm font-medium rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(90deg, #b38bff 0%, #f9c6b8 50%, #ffe4a3 100%)',
                  border: 'none',
                  color: '#1a1a1a'
                }}
              >
                <GitFork className="h-4 w-4 mr-2" />
                Fork This Seed
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 h-11 px-6 text-sm font-medium rounded-full border border-yellow-300/20 dark:border-orange-200/20 hover:border-yellow-400/40 dark:hover:border-orange-300/40 transition-all"
                style={{
                  background: 'transparent',
                  color: 'hsl(35, 10%, 80%)'
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
            <Button
              onClick={handleOpenForklore}
              className="w-full h-11 px-6 text-sm font-medium rounded-full border border-yellow-300/20 dark:border-orange-200/20 hover:border-yellow-400/40 dark:hover:border-orange-300/40 transition-all"
              style={{
                background: 'transparent',
                color: 'hsl(35, 10%, 80%)'
              }}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Open Forklore
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
      
      {/* Fork Modal */}
      <ForkModal 
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        seedId={seed.id}
        seedType={seed.type}
        initialText={seed.type === 'text' ? (seed as TextSeed).content || '' : (seed as VisualSeed).description || ''}
        onForkCreated={() => {
          // Call the refresh function passed from parent
          onForkCreated?.();
          console.log('Fork created successfully');
        }}
      />
    </Dialog>
  );
};
