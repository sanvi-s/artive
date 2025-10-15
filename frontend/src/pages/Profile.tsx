import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { ForkModal } from "@/components/ForkModal";
import { PlantSeedModal } from "@/components/PlantSeedModal";
import { SeedViewModal } from "@/components/SeedViewModal";
import { Pencil, GitFork, Sparkles, ShoppingBag, Award, Users, Heart } from "lucide-react";
import { allSeeds } from "@/data/sampleSeeds";
import { SeedCreationData, Seed } from "@/types/seed";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Sample user seeds (mix of text and visual)
const userSeeds = allSeeds.filter(seed => 
  seed.author === "Priya K." || seed.author === "Luna M." || seed.author === "River K." || 
  seed.author === "Sage W." || seed.author === "Alex Chen" || seed.author === "Maya R."
).slice(0, 12);

// Sample inspired forks
const inspiredForks = allSeeds.filter(seed => 
  seed.author !== "Priya K." && seed.author !== "Luna M." && seed.author !== "River K."
).slice(0, 4);

const badges = [
  { id: 1, name: "Starter", icon: "🌱", description: "Planted your first seed", earned: true },
  { id: 2, name: "Inspirer", icon: "✨", description: "Inspired 5+ forks", earned: true },
  { id: 3, name: "Collector", icon: "📚", description: "Saved 10+ seeds", earned: false },
  { id: 4, name: "Collaborator", icon: "🤝", description: "Joined 3+ collab rooms", earned: false },
  { id: 5, name: "Luminary", icon: "🌟", description: "Created a viral seed", earned: false },
];

type Me = { id: string; email?: string; username: string; displayName: string; avatarUrl?: string };

type ApiSeed = { _id: string; title: string; contentSnippet?: string; type: string; author: string; forkCount: number; thumbnailUrl?: string; createdAt: string };

const Profile = () => {
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [forkSeedMeta, setForkSeedMeta] = useState<{ id: string; type: 'text' | 'visual' | 'music' | 'code' | 'other'; initialText?: string } | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [mySeeds, setMySeeds] = useState<ApiSeed[]>([]);
  const [inspiredForksState, setInspiredForksState] = useState<any[]>([]);
  const [mySeedsDisplay, setMySeedsDisplay] = useState<Seed[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        let apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
        if (!apiBase) {
          apiBase = "http://localhost:5000";
          toast({ title: "Using default API", description: `No API base configured, trying ${apiBase}`, variant: "default" });
        }
        const token = localStorage.getItem("token");
        if (!token) return; // not logged in
        const endpoint = `${apiBase}/api/auth/me`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let data: any = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON */ }
        if (!res.ok) {
          const msg = data?.error?.message || (raw ? raw.slice(0, 200) : `HTTP ${res.status} ${res.statusText}`);
          throw new Error(msg || "Failed to load profile");
        }
        setMe(data);
        // fetch user's seeds
        try {
          const seedsRes = await fetch(`${apiBase}/api/seeds?author=${encodeURIComponent(data.id)}&limit=30`);
          const seedsRaw = await seedsRes.text();
          let seedsJson: any = {};
          try { seedsJson = seedsRaw ? JSON.parse(seedsRaw) : {}; } catch { /* ignore */ }
          if (!seedsRes.ok) {
            const msg = seedsJson?.error?.message || (seedsRaw ? seedsRaw.slice(0, 200) : `HTTP ${seedsRes.status} ${seedsRes.statusText}`);
            throw new Error(msg || "Failed to load seeds");
          }
          const items: ApiSeed[] = Array.isArray(seedsJson.items) ? seedsJson.items : [];
          try { console.debug('[Profile] fetched seeds', { count: items.length }); } catch {}
          // sanitize any mistaken /api/uploads urls to avoid GET /api/uploads 404 in <img>
          items.forEach((s: any) => {
            if (s && typeof s.thumbnailUrl === 'string' && s.thumbnailUrl.startsWith('/api/uploads')) {
              s.thumbnailUrl = undefined;
            }
          });
          setMySeeds(items);
          // map to display seeds compatible with UnifiedSeedCard
          const mapped: Seed[] = items.map((s) => {
            const common = {
              id: s._id,
              title: s.title,
              author: me?.displayName || me?.username || 'You',
              time: new Date(s.createdAt).toLocaleDateString(),
              forks: s.forkCount || 0,
              sparks: 0,
              category: 'Visual',
              tags: [] as string[],
              createdAt: s.createdAt,
            };
            // If a thumbnail url exists, render as visual card regardless of backend type
            if (s.thumbnailUrl) {
              try { console.debug('[Profile] mapping visual seed', { id: s._id, title: s.title, contentSnippet: s.contentSnippet }); } catch {}
              return {
                ...(common as any),
                type: 'visual',
                image: s.thumbnailUrl,
                alt: s.title,
                description: s.contentSnippet || '',
              } as Seed;
            }
            // default to text for poem/other content
            return {
              ...(common as any),
              type: 'text',
              content: s.contentSnippet || s.title || '',
              excerpt: (s.contentSnippet || s.title || '').slice(0, 180),
              isThread: false,
            } as Seed;
          }).filter((seed) => {
            if (!seed) return false;
            if (seed.type === 'visual') return Boolean((seed as any).image);
            if (seed.type === 'text') return Boolean((seed as any).content || (seed as any).excerpt);
            return true;
          });
          try { console.debug('[Profile] mapped seeds for display', { count: mapped.length }); } catch {}
          setMySeedsDisplay(mapped);
        } catch (e: any) {
          toast({ title: "Seeds", description: e.message || "Failed to load seeds", variant: "destructive" });
        }

        // fetch forks inspired by this user's seeds
        try {
          const forksRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(data.id)}/inspired-forks?limit=12`);
          const forksRaw = await forksRes.text();
          let forksJson: any = {};
          try { forksJson = forksRaw ? JSON.parse(forksRaw) : {}; } catch { /* ignore */ }
          if (!forksRes.ok) {
            const msg = forksJson?.error?.message || (forksRaw ? forksRaw.slice(0, 200) : `HTTP ${forksRes.status} ${forksRes.statusText}`);
            throw new Error(msg || "Failed to load inspired forks");
          }
          setInspiredForksState(Array.isArray(forksJson.items) ? forksJson.items : []);
        } catch (e: any) {
          toast({ title: "Forks", description: e.message || "Failed to load inspired forks", variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Profile", description: err.message || "Failed to load profile", variant: "destructive" });
      }
    };
    fetchMe();
  }, [toast]);

  const handlePlantSeed = async (seedData: SeedCreationData) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      const description = seedData.type === 'visual' ? (seedData as any).description || '' : '';
      const contentSnippet = seedData.type === 'visual' ? description : (seedData.content?.slice(0, 400) || "");
      try { console.debug('[Profile] creating seed', { apiBase, title: seedData.title, type: seedData.type, hasImage: Boolean(seedData.image), description: description.slice(0, 50) + '...' }); } catch {}
      const res = await fetch(`${apiBase}/api/seeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: seedData.title,
          contentSnippet: contentSnippet,
          contentFull: seedData.content || "",
          type: seedData.type === 'text' ? 'poem' : seedData.type,
            thumbnailUrl: seedData.image || undefined,
        }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!res.ok) {
        try { console.error('[Profile] create seed failed', { status: res.status, raw }); } catch {}
        throw new Error(data?.error?.message || "Failed to plant seed");
      }
      // Optimistically add to display list so description shows immediately
      try {
        if (seedData.type === 'visual' && seedData.image) {
          const optimistic: Seed = {
            id: data?.id || Math.random().toString(36).slice(2),
            type: 'visual',
            title: seedData.title,
            author: me?.displayName || me?.username || 'You',
            time: new Date().toLocaleDateString(),
            forks: 0,
            sparks: 0,
            category: 'Visual',
            tags: [],
            createdAt: new Date().toISOString(),
            image: seedData.image,
            alt: seedData.title,
            description: (seedData as any).description || '',
          } as any;
          setMySeedsDisplay((prev) => [optimistic, ...prev]);
        }
      } catch {}
    } catch (err) {
      try { console.error('[Profile] create seed exception', err); } catch {}
    }
  };

  const handleDeleteSeed = async (seedId: string) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/api/seeds/${encodeURIComponent(seedId)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok && res.status !== 204) {
        const raw = await res.text();
        throw new Error(raw || 'Failed to delete seed');
      }
      setMySeedsDisplay((prev) => prev.filter((s) => s.id !== seedId));
    } catch (err) {
      try { console.error('[Profile] delete seed exception', err); } catch {}
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
    // For demo/sample data path
    const seed = allSeeds.find(s => s.id === seedId);
    if (seed) {
      if (seed.type === 'text') setForkSeedMeta({ id: seedId, type: 'text', initialText: seed.content });
      else if (seed.type === 'visual') setForkSeedMeta({ id: seedId, type: 'visual' });
      else setForkSeedMeta({ id: seedId, type: 'other' });
      setIsForkModalOpen(true);
      return;
    }
    // If we had API seeds here, we could fetch full text with /api/seeds/:id?full=true
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Header Banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(232, 201, 176, 0.3), rgba(163, 185, 165, 0.3), rgba(212, 195, 222, 0.3))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg relative">
            <img 
              src="https://via.placeholder.com/160x160/E8C9B0/1E1B18?text=P" 
              alt="Profile Avatar" 
              className="w-full h-full object-cover" 
            />
            {/* Irregular paint-chip SVG mask */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-accent-1/30 to-accent-3/30 mix-blend-multiply" 
              style={{ 
                clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)' 
              }} 
            />
          </div>
          <div className="mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{me?.displayName || "Your Name"}</h1>
            <p className="text-muted-foreground italic">@{me?.username || "username"}</p>
            {me?.email && (
              <p className="text-xs text-muted-foreground mt-1">{me.email}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {mySeeds.length} {mySeeds.length === 1 ? 'seed' : 'seeds'} planted
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {inspiredForksState.length} {inspiredForksState.length === 1 ? 'fork' : 'forks'} inspired
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="mb-4">
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-16 mt-16 md:mt-20 space-y-16">
        {/* Seeds you've planted */}
        <section>
          <h2 className="font-display text-2xl mb-6">Seeds you've planted</h2>
          {/* Render only this account's planted seeds from API */}
          {mySeedsDisplay.length === 0 ? (
            <div className="flex flex-col items-start gap-3">
              <div className="text-sm text-muted-foreground">No seeds planted yet.</div>
              <PlantSeedModal onPlantSeed={handlePlantSeed}>
                <Button variant="hero" size="sm">Plant your first seed</Button>
              </PlantSeedModal>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {mySeedsDisplay.map((seed, index) => (
                <div key={`${seed.id}-${index}`}>
                  {(() => { try { console.debug('[Profile] render card', { idx: index, id: seed.id, type: seed.type }); } catch {} return null; })()}
                  <UnifiedSeedCard
                    seed={seed}
                    className="animate-fade-in-up h-full"
                    style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                    onView={() => { setSelectedSeed(seed); setIsViewModalOpen(true); }}
                    onDelete={handleDeleteSeed}
                    onFork={async () => {
                    // If text, try to prefetch full content
                    const isValidObjectId = /^[a-f\d]{24}$/i.test(seed.id);
                    if (seed.type === 'text' && isValidObjectId) {
                      try {
                        let apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
                        if (!apiBase) apiBase = "http://localhost:5000";
                        const res = await fetch(`${apiBase}/api/seeds/${seed.id}?full=true`);
                        const raw = await res.text();
                        let json: any = {};
                        try { json = raw ? JSON.parse(raw) : {}; } catch {}
                        if (res.ok && json?.seed?.contentFull) {
                          setForkSeedMeta({ id: seed.id, type: 'text', initialText: json.seed.contentFull });
                          setIsForkModalOpen(true);
                          return;
                        }
                      } catch {}
                    }
                    // fallback
                    if (seed.type === 'text') setForkSeedMeta({ id: seed.id, type: 'text', initialText: (seed as any).content });
                    else if (seed.type === 'visual') setForkSeedMeta({ id: seed.id, type: 'visual' });
                    else setForkSeedMeta({ id: seed.id, type: 'other' });
                    setIsForkModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>


        {/* Forks you've inspired */}
        <section>
          <h2 className="font-display text-2xl mb-6">Forks you've inspired</h2>
          {inspiredForksState.length === 0 ? (
            <div className="text-sm text-muted-foreground">No forks yet. Share seeds to inspire others.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspiredForksState.map((f: any) => (
                <div key={f._id} className="p-4 rounded-lg border border-border bg-card/60 torn-edge-soft shadow-sm">
                  <p className="text-sm mb-2">Forked summary</p>
                  {f.summary ? (
                    <p className="text-muted-foreground text-sm line-clamp-3">{f.summary}</p>
                  ) : (
                    <p className="text-muted-foreground text-xs">No summary</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{new Date(f.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Creative lineage (mini) */}
        <section>
          <h2 className="font-display text-2xl mb-6">Your Creative Lineage</h2>
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg torn-edge-soft shadow-paper flex flex-col items-center justify-center space-y-4">
            <p className="text-muted-foreground text-center">
              A condensed view of your influence.
            </p>
            {/* Placeholder for 3-node radial lineage */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-1 flex items-center justify-center text-white text-sm">Y</div>
              <GitFork className="h-5 w-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-accent-2 flex items-center justify-center text-white text-sm">G</div>
              <GitFork className="h-5 w-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-accent-3 flex items-center justify-center text-white text-sm">C</div>
            </div>
            <Link to="/forklore">
              <Button variant="outline">View Forklore</Button>
            </Link>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="font-display text-2xl mb-6">Creative Sparks Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-lg torn-edge-soft shadow-sm flex flex-col items-center text-center transition-all duration-300 ${
                  badge.earned 
                    ? 'bg-card/80 border-2 border-accent-1/30' 
                    : 'bg-card/30 border-2 border-border/30 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-2 text-xs text-accent-1 font-medium">✓ Earned</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Settings & Shop */}
        <section className="flex justify-between items-center bg-card/50 backdrop-blur-sm p-6 rounded-lg torn-edge-soft shadow-paper">
          <div>
            <h2 className="font-display text-2xl mb-2">Shop & Settings</h2>
            <p className="text-muted-foreground">Manage your profile or turn your creations into prints.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary">
              <ShoppingBag className="h-4 w-4 mr-2" /> Print & Ship
            </Button>
            <Button variant="outline">Settings</Button>
          </div>
        </section>
      </main>

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

export default Profile;
