import { Button } from "@/components/ui/button";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { ShardCard } from "@/components/ShardCard";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { PlantSeedModal } from "@/components/PlantSeedModal";
import { SeedViewModal } from "@/components/SeedViewModal";
import { ForkModal } from "@/components/ForkModal";
import { Link } from "react-router-dom";
import { allSeeds } from "@/data/sampleSeeds";
import { SeedCreationData, Seed } from "@/types/seed";
import { useState } from "react";
import heroCollage from "@/assets/hero-collage.jpg";
import seed1 from "@/assets/seed-1.jpg";
import seed2 from "@/assets/seed-2.jpg";
import seed4 from "@/assets/seed-4.jpg";

// Use the mixed seeds from sample data
const featuredSeeds = allSeeds.slice(0, 12);

const shards = [
  {
    image: seed1,
    title: "Color Studies",
    excerpt: "What if we never finish? What if that's the point...",
    rotation: -2,
    size: "medium" as const,
  },
  {
    image: seed2,
    title: "Words Left Unsaid",
    excerpt: "کچھ باتیں ادھوری ہی اچھی لگتی ہیں (Some things feel better incomplete)",
    rotation: 3,
    size: "large" as const,
  },
  {
    image: seed4,
    title: "Thread & Time",
    excerpt: "Every stitch holds a story waiting to continue...",
    rotation: -1,
    size: "small" as const,
  },
];

const Index = () => {
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [forkSeedMeta, setForkSeedMeta] = useState<{ id: string; type: 'text' | 'visual' | 'music' | 'code' | 'other'; initialText?: string } | null>(null);

  const handlePlantSeed = async (seedData: SeedCreationData) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/api/seeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: seedData.title,
          contentSnippet: seedData.content?.slice(0, 400) || "",
          contentFull: seedData.content || "",
          type: seedData.type === 'text' ? 'poem' : seedData.type,
          thumbnailUrl: seedData.image || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to plant seed");
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewSeed = (seedId: string) => {
    const seed = allSeeds.find(s => s.id === seedId);
    if (seed) {
      setSelectedSeed(seed);
      setIsViewModalOpen(true);
    }
  };

  const handleForkSeed = (seedId: string) => {
    const seed = allSeeds.find(s => s.id === seedId);
    if (!seed) return;
    if (seed.type === 'text') {
      setForkSeedMeta({ id: seedId, type: 'text', initialText: seed.content });
    } else if (seed.type === 'visual') {
      setForkSeedMeta({ id: seedId, type: 'visual' });
    } else {
      setForkSeedMeta({ id: seedId, type: 'other' });
    }
    setIsForkModalOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Hero Section */}
      <section className="relative min-h-[84vh] flex items-center overflow-hidden">
        {/* Background collage */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroCollage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start animate-fade-in-up">
                  <img 
                    src="/LOGO_NOHEXA.png" 
                    alt="Artive Logo" 
                    className="h-32 w-32 object-contain dark:hidden"
                  />
                  <img 
                    src="/LOGO_DARK.png" 
                    alt="Artive Logo" 
                    className="h-32 w-32 object-contain hidden dark:block"
                  />
                  <h1 className="text-display font-logo font-bold tracking-tight">
                    Artive
                  </h1>
                </div>
                <p className="text-md italic text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  the art of forgotten things
                </p>
              </div>

              <div className="max-w-2xl mx-auto lg:mx-0">
                <p className="text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  For the half-baked, half-written, half-whatever. Share your scraps, steal a spark, and build on the beautiful mess.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <PlantSeedModal onPlantSeed={handlePlantSeed}>
                  <Button variant="hero" size="lg">
                    Share your unfinished idea
                  </Button>
                </PlantSeedModal>
                <Link to="/explore">
                  <Button variant="hero-ghost" size="lg">
                    Explore seeds
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Floating Shards */}
            <div className="lg:col-span-5 relative h-[400px] lg:h-[600px] hidden md:block">
              <div className="absolute top-0 left-0" style={{ animationDelay: "0.4s" }}>
                <ShardCard {...shards[0]} />
              </div>
              <div className="absolute top-20 right-0" style={{ animationDelay: "0.5s" }}>
                <ShardCard {...shards[1]} />
              </div>
              <div className="absolute bottom-10 left-12" style={{ animationDelay: "0.6s" }}>
                <ShardCard {...shards[2]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-16 md:py-24 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-xl md:text-2xl font-display font-semibold">
              Why We Exist
            </h2>
            <p className="text-base md:text-md leading-relaxed text-muted-foreground">
              Most creative work dies in draft folders. Ideas abandoned mid-sentence.
              Sketches left unfinished. Code that almost worked. We celebrate these
              fragments—not as failures, but as invitations. Every incomplete thing
              here is a spark waiting for the next creative mind to carry it forward.
            </p>
            <p className="font-handwritten text-lg text-accent-foreground italic">
              <span className="font-playwrite" style={{ color: '#D4A574', fontWeight: 'bold' }}>Begin messy, perfect doesn't need to be finished.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Seeds */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-xl md:text-2xl font-display font-semibold mb-2">
              Featured Seeds
            </h2>
            <p className="text-sm text-muted-foreground">
              Half-baked ideas waiting for your touch
            </p>
          </div>

          {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSeeds.map((seed, index) => (
            <div key={seed.id} className={`${seed.type === 'text' ? 'row-span-1' : 'row-span-2'}`}>
              <UnifiedSeedCard
                seed={seed}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                onFork={handleForkSeed}
                onView={handleViewSeed}
              />
            </div>
          ))}
        </div>

          <div className="mt-12 text-center">
            <Link to="/explore">
              <Button variant="outline" size="lg">
                View All Seeds
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            Artive © 2025 · Celebrating imperfection, one fragment at a time
          </p>
        </div>
      </footer>

      {/* Seed View Modal */}
      <SeedViewModal
        seed={selectedSeed}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onFork={handleForkSeed}
      />

      <ForkModal 
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        seedId={forkSeedMeta?.id || null}
        seedType={forkSeedMeta?.type}
        initialText={forkSeedMeta?.initialText}
      />
    </div>
  );
};

export default Index;
