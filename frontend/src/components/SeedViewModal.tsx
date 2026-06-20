import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Seed, TextSeed, VisualSeed } from "@/types/seed";
import { GitFork, Quote, Image as ImageIcon, Calendar, User, Tag, GitBranch, Music, X } from "lucide-react";
import { useForklore } from "@/contexts/ForkloreContext";
import { motion, AnimatePresence } from "framer-motion";
import { ForkModal } from "./ForkModal";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedSeedCard } from "./UnifiedSeedCard";

interface SeedViewModalProps {
  seed: Seed | null;
  isOpen: boolean;
  onClose: () => void;
  onFork?: (seedId: string) => void;
  onForkCreated?: () => void;
  allSeeds?: Seed[];
}

const typeIcon = (type: string) => {
  if (type === 'text') return <Quote className="h-4 w-4 text-accent-1" />;
  if (type === 'visual') return <ImageIcon className="h-4 w-4 text-accent-2" />;
  if (type === 'music') return <Music className="h-4 w-4 text-accent-1" />;
  return <Quote className="h-4 w-4 text-accent-1" />;
};

export const SeedViewModal = ({ seed, isOpen, onClose, onFork, onForkCreated, allSeeds = [] }: SeedViewModalProps) => {
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [viewingSeed, setViewingSeed] = useState<Seed | null>(null);
  const [similarSeeds, setSimilarSeeds] = useState<Seed[]>([]);
  const navigate = useNavigate();
  const { setSelectedSeedId } = useForklore();
  const { isAuthenticated } = useAuth();

  const activeSeed = viewingSeed || seed;

  useEffect(() => {
    if (!activeSeed?.id) { setSimilarSeeds([]); return; }
    const apiBase = (import.meta as any).env.VITE_API_URL || "";
    fetch(`${apiBase}/api/search/similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeSeed.id, type: activeSeed.isForked ? "fork" : "seed" }),
    })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => {
        console.log('[similar]', activeSeed.id, activeSeed.type, data);
        const mapped: Seed[] = (data.items || []).map((s: any) => ({
          id: s._id,
          title: s.title,
          author: s.author?.displayName || s.author?.username || "Anonymous",
          authorId: s.author?._id,
          time: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdAt: s.createdAt,
          forks: s.forkCount || 0,
          sparks: 0,
          category: "general",
          tags: s.tags || [],
          type: (s.type === 'visual' ? 'visual' : 'text') as Seed['type'],
          content: s.contentFull || s.contentSnippet || "",
          excerpt: s.contentSnippet || s.title,
          image: s.thumbnailUrl || "",
          description: s.contentSnippet || "",
          isForked: false,
        }));
        setSimilarSeeds(mapped);
      })
      .catch(() => setSimilarSeeds([]));
  }, [activeSeed?.id]);

  if (!activeSeed) return null;

  const handleClose = () => {
    setViewingSeed(null);
    onClose();
  };

  const handleFork = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setIsForkModalOpen(true);
    handleClose();
  };

  const handleOpenForklore = () => {
    setSelectedSeedId(activeSeed.id);
    handleClose();
    navigate('/forklore/timeline');
  };

  const handleAuthorClick = () => {
    const authorId = (activeSeed as any).authorId || (activeSeed as any).author?._id;
    if (authorId) { handleClose(); navigate(`/profile/${authorId}`); }
  };

  const handleViewRelated = (seedId: string) => {
    const found = allSeeds.find((s) => s.id === seedId) || similarSeeds.find((s) => s.id === seedId);
    if (found) {
      setViewingSeed(found);
    }
  };

  const handleForkRelated = (seedId: string) => {
    onFork?.(seedId);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const textSeed = activeSeed as TextSeed;
  const visualSeed = activeSeed as VisualSeed;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-5xl w-full p-0 gap-0 rounded-2xl border border-white/8 overflow-hidden flex flex-col [&>button:last-child]:hidden"
        style={{
          maxHeight: '90vh',
          background: 'linear-gradient(160deg, hsl(30,12%,11%) 0%, hsl(25,10%,8%) 100%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(234,179,8,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSeed.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col overflow-y-auto hide-scrollbar"
          >
            {/* Header */}
            <DialogHeader className="px-8 pt-7 pb-5 shrink-0 border-b border-white/5">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 p-2 rounded-lg bg-white/5 border border-white/6 shrink-0">
                  {typeIcon(activeSeed.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle
                    className="text-[1.35rem] font-semibold leading-snug mb-1.5"
                    style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(40, 25%, 91%)' }}
                  >
                    {activeSeed.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px]" style={{ color: 'hsl(30, 5%, 48%)' }}>
                    <button onClick={handleAuthorClick} className="flex items-center gap-1 hover:text-amber-400/80 transition-colors">
                      <User className="h-3 w-3" />
                      {activeSeed.author}
                    </button>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(activeSeed.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      {activeSeed.forks} {activeSeed.forks === 1 ? 'fork' : 'forks'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="shrink-0 ml-2 p-1.5 rounded-lg hover:bg-white/8 transition-colors"
                  style={{ color: 'hsl(30, 5%, 50%)' }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DialogDescription className="sr-only">
                {activeSeed.type === 'visual' ? visualSeed.description || '' : textSeed.excerpt || ''}
              </DialogDescription>
            </DialogHeader>

            {/* Body */}
            <div className="px-8 py-6 space-y-5">

              {/* Text content */}
              {activeSeed.type === 'text' && (
                <div>
                  <p
                    className="text-[15px] leading-8 font-serif whitespace-pre-wrap rich-content"
                    style={{ color: 'hsl(40, 18%, 80%)' }}
                    dangerouslySetInnerHTML={{ __html: textSeed.content || textSeed.excerpt }}
                  />
                  {activeSeed.isThread && activeSeed.threadParts && activeSeed.threadParts.length > 1 && (
                    <div className="mt-5 space-y-2.5">
                      {activeSeed.threadParts.map((part, i) => (
                        <div key={i} className="pl-4 border-l border-amber-400/15">
                          <span className="block text-[9px] text-amber-400/35 mb-1 uppercase tracking-widest">Part {i + 1}</span>
                          <p className="text-sm font-serif leading-7" style={{ color: 'hsl(40, 12%, 72%)' }}>{part}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visual content */}
              {activeSeed.type === 'visual' && (
                <div className="space-y-3.5">
                  <div className="rounded-xl overflow-hidden bg-black/25 border border-white/5">
                    <img
                      src={visualSeed.image}
                      alt={visualSeed.alt || activeSeed.title}
                      className="w-full h-auto object-contain max-h-[440px]"
                      onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/800x450/1a1714/998877?text=${activeSeed.title.charAt(0)}`; }}
                    />
                  </div>
                  {visualSeed.description && (
                    <p className="text-sm leading-7 font-serif" style={{ color: 'hsl(40, 12%, 70%)' }}>
                      {visualSeed.description}
                    </p>
                  )}
                </div>
              )}

              {/* Music content */}
              {activeSeed.type === 'music' && (
                <div className="rounded-xl bg-white/3 border border-white/6 p-5">
                  <audio controls className="w-full" src={(activeSeed as any).audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Tags */}
              {activeSeed.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Tag className="h-3 w-3 shrink-0" style={{ color: 'hsl(30, 5%, 40%)' }} />
                  {activeSeed.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 text-[10px] rounded-full"
                      style={{
                        background: 'rgba(234,179,8,0.06)',
                        color: 'hsl(40, 35%, 60%)',
                        border: '1px solid rgba(234,179,8,0.12)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1 border-t border-white/5">
                <Button
                  onClick={handleFork}
                  className="flex-1 h-9 text-sm font-medium rounded-full border-0"
                  style={{ background: 'linear-gradient(90deg, #b38bff 0%, #f9c6b8 55%, #ffe4a3 100%)', color: '#1a1a1a' }}
                >
                  <GitFork className="h-3.5 w-3.5 mr-1.5" />
                  Fork
                </Button>
                <Button
                  onClick={handleOpenForklore}
                  variant="outline"
                  className="flex-1 h-9 text-sm font-medium rounded-full border-white/8 bg-white/3 hover:bg-white/6 transition-colors"
                  style={{ color: 'hsl(35, 8%, 68%)' }}
                >
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                  Forklore
                </Button>
              </div>

              {/* Related posts */}
              {similarSeeds.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: 'hsl(30, 5%, 35%)' }}>
                    More like this
                  </p>
                  <div className="grid grid-cols-2 gap-6 pb-2">
                    {similarSeeds.map((r) => (
                      <UnifiedSeedCard
                        key={r.id}
                        seed={r}
                        onView={handleViewRelated}
                        onFork={handleForkRelated}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      {seed && (
        <ForkModal
          isOpen={isForkModalOpen}
          onClose={() => setIsForkModalOpen(false)}
          seedId={activeSeed.id}
          seedType={activeSeed.type}
          initialText={activeSeed.type === 'text' ? textSeed.content || '' : visualSeed.description || ''}
          onForkCreated={() => { onForkCreated?.(); }}
        />
      )}
    </Dialog>
  );
};
