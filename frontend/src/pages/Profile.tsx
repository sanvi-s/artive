import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { TextCard } from "@/components/TextCard";
import { ForkModal } from "@/components/ForkModal";
import { PlantSeedModal } from "@/components/PlantSeedModal";
import { SeedViewModal } from "@/components/SeedViewModal";
import { Pencil, GitFork, Sparkles, Award, Users, Heart } from "lucide-react";
import { allSeeds } from "@/data/sampleSeeds";
import { SeedCreationData, Seed } from "@/types/seed";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Sample user seeds (mix of text and visual)
const userSeeds = allSeeds.filter(seed => 
  seed.author === "Priya K." || seed.author === "Luna M." || seed.author === "River K." || 
  seed.author === "Sage W." || seed.author === "Alex Chen" || seed.author === "Maya R."
).slice(0, 12);

// Sample inspired forks
const inspiredForks = allSeeds.filter(seed => 
  seed.author !== "Priya K." && seed.author !== "Luna M." && seed.author !== "River K."
).slice(0, 4);

// Badge definitions
const badgeDefinitions = [
  { id: 1, name: "Starter", icon: "🌱", description: "Planted your first seed", condition: (stats: any) => stats.seedsPlanted >= 1 },
  { id: 2, name: "Inspirer", icon: "✨", description: "Inspired 5+ forks", condition: (stats: any) => stats.forksInspired >= 5 },
  { id: 3, name: "Forker", icon: "🔀", description: "Created 3+ forks", condition: (stats: any) => stats.forksCreated >= 3 },
  { id: 4, name: "Creator", icon: "🎨", description: "Planted 10+ seeds", condition: (stats: any) => stats.seedsPlanted >= 10 },
  { id: 5, name: "Luminary", icon: "🌟", description: "Inspired 20+ forks", condition: (stats: any) => stats.forksInspired >= 20 },
  { id: 6, name: "Collaborator", icon: "🤝", description: "Created 10+ forks", condition: (stats: any) => stats.forksCreated >= 10 },
  { id: 7, name: "Prolific", icon: "📚", description: "Planted 25+ seeds", condition: (stats: any) => stats.seedsPlanted >= 25 },
  { id: 8, name: "Influencer", icon: "💫", description: "Inspired 50+ forks", condition: (stats: any) => stats.forksInspired >= 50 },
];

type Me = { id: string; email?: string; username: string; displayName: string; avatarUrl?: string; bannerUrl?: string };

type ApiSeed = { _id: string; title: string; contentSnippet?: string; contentFull?: string; type: string; author: string; forkCount: number; thumbnailUrl?: string; createdAt: string };

const Profile = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [forkSeedMeta, setForkSeedMeta] = useState<{ id: string; type: 'text' | 'visual' | 'music' | 'code' | 'other'; initialText?: string } | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [mySeeds, setMySeeds] = useState<ApiSeed[]>([]);
  const [inspiredForksState, setInspiredForksState] = useState<any[]>([]);
  const [myForksState, setMyForksState] = useState<any[]>([]);
  const [mySeedsDisplay, setMySeedsDisplay] = useState<Seed[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  // Initialize badges immediately - outside of useState to avoid re-initialization
  const initialBadges = useMemo(() => {
    console.log("🔧 Creating initial badges");
    return badgeDefinitions.map(badge => {
      const stats = {
        seedsPlanted: 0,
        forksInspired: 0,
        forksCreated: 0
      };
      const earned = badge.condition(stats);
      let progress = 0;
      let progressText = '';

      if (badge.id === 1) {
        progress = Math.min(100, (stats.seedsPlanted / 1) * 100);
        progressText = `${stats.seedsPlanted}/1 seeds`;
      } else if (badge.id === 2) {
        progress = Math.min(100, (stats.forksInspired / 5) * 100);
        progressText = `${stats.forksInspired}/5 forks inspired`;
      } else if (badge.id === 3) {
        progress = Math.min(100, (stats.forksCreated / 3) * 100);
        progressText = `${stats.forksCreated}/3 forks created`;
      } else if (badge.id === 4) {
        progress = Math.min(100, (stats.seedsPlanted / 10) * 100);
        progressText = `${stats.seedsPlanted}/10 seeds`;
      } else if (badge.id === 5) {
        progress = Math.min(100, (stats.forksInspired / 20) * 100);
        progressText = `${stats.forksInspired}/20 forks inspired`;
      } else if (badge.id === 6) {
        progress = Math.min(100, (stats.forksCreated / 10) * 100);
        progressText = `${stats.forksCreated}/10 forks created`;
      } else if (badge.id === 7) {
        progress = Math.min(100, (stats.seedsPlanted / 25) * 100);
        progressText = `${stats.seedsPlanted}/25 seeds`;
      } else if (badge.id === 8) {
        progress = Math.min(100, (stats.forksInspired / 50) * 100);
        progressText = `${stats.forksInspired}/50 forks inspired`;
      }

      return {
        ...badge,
        earned,
        progress: Math.round(progress),
        progressText
      };
    });
  }, []);

  const [calculatedBadges, setCalculatedBadges] = useState<any[]>(initialBadges);
  
  // Debug wrapper for setCalculatedBadges
  const setCalculatedBadgesDebug = (badges: any[]) => {
    console.log("🔧 setCalculatedBadges called with:", badges.length, badges);
    setCalculatedBadges(badges);
  };
  const [previousEarnedBadges, setPreviousEarnedBadges] = useState<number[]>(() => {
    // Initialize with empty array, but we'll track this properly
    return [];
  });
  const { toast } = useToast();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent-1 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Function to calculate user stats and badges
  const calculateBadges = useCallback((seedsPlanted: number, forksInspired: number, forksCreated: number) => {
    const stats = {
      seedsPlanted,
      forksInspired,
      forksCreated
    };

    return badgeDefinitions.map(badge => {
      const earned = badge.condition(stats);
      let progress = 0;
      let progressText = '';

      // Calculate progress for different badge types
      if (badge.id === 1) { // Starter
        progress = Math.min(100, (stats.seedsPlanted / 1) * 100);
        progressText = `${stats.seedsPlanted}/1 seeds`;
        console.log(`🔧 Badge ${badge.id} (${badge.name}): seedsPlanted=${stats.seedsPlanted}, earned=${earned}, progress=${progress}`);
      } else if (badge.id === 2) { // Inspirer
        progress = Math.min(100, (stats.forksInspired / 5) * 100);
        progressText = `${stats.forksInspired}/5 forks inspired`;
      } else if (badge.id === 3) { // Forker
        progress = Math.min(100, (stats.forksCreated / 3) * 100);
        progressText = `${stats.forksCreated}/3 forks created`;
      } else if (badge.id === 4) { // Creator
        progress = Math.min(100, (stats.seedsPlanted / 10) * 100);
        progressText = `${stats.seedsPlanted}/10 seeds`;
      } else if (badge.id === 5) { // Luminary
        progress = Math.min(100, (stats.forksInspired / 20) * 100);
        progressText = `${stats.forksInspired}/20 forks inspired`;
      } else if (badge.id === 6) { // Collaborator
        progress = Math.min(100, (stats.forksCreated / 10) * 100);
        progressText = `${stats.forksCreated}/10 forks created`;
      } else if (badge.id === 7) { // Prolific
        progress = Math.min(100, (stats.seedsPlanted / 25) * 100);
        progressText = `${stats.seedsPlanted}/25 seeds`;
      } else if (badge.id === 8) { // Influencer
        progress = Math.min(100, (stats.forksInspired / 50) * 100);
        progressText = `${stats.forksInspired}/50 forks inspired`;
      }

      return {
        ...badge,
        earned,
        progress: Math.round(progress),
        progressText
      };
    });
  }, []);

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
        console.log('User data from /api/auth/me:', data);
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
              authorId: me?.id,
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
              content: s.contentFull || s.contentSnippet || s.title || '',
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

        // fetch forks created by this user
        try {
          const myForksRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(data.id)}/forks?limit=12`);
          const myForksRaw = await myForksRes.text();
          let myForksJson: any = {};
          try { myForksJson = myForksRaw ? JSON.parse(myForksRaw) : {}; } catch { /* ignore */ }
          if (!myForksRes.ok) {
            const msg = myForksJson?.error?.message || (myForksRaw ? myForksRaw.slice(0, 200) : `HTTP ${myForksRes.status} ${myForksRes.statusText}`);
            throw new Error(msg || "Failed to load user forks");
          }
          setMyForksState(Array.isArray(myForksJson.items) ? myForksJson.items : []);
        } catch (e: any) {
          toast({ title: "Forks", description: e.message || "Failed to load your forks", variant: "destructive" });
        }

        // Badges will be calculated automatically when data loads
      } catch (err: any) {
        toast({ title: "Profile", description: err.message || "Failed to load profile", variant: "destructive" });
      }
    };
    fetchMe();
  }, []); // Run only once on mount

  // Calculate badges whenever the relevant data changes
  useEffect(() => {
    console.log("🔄 useEffect triggered - seeds:", mySeeds.length, "inspired:", inspiredForksState.length, "forks:", myForksState.length);
    console.log("🔄 Updating badges - seeds:", mySeeds.length, "inspired:", inspiredForksState.length, "forks:", myForksState.length);
    
    // Debug: Log seed types to ensure visual seeds are included
    const seedTypes = mySeeds.map(s => ({ id: s._id, type: s.type, hasImage: Boolean(s.thumbnailUrl) }));
    console.log("🔄 Seed types breakdown:", seedTypes);
    
    // Always calculate badges, even if user has 0 seeds/forks
    const badges = calculateBadges(
      mySeeds.length, // seeds planted
      inspiredForksState.length, // forks inspired  
      myForksState.length // forks created
    );
    console.log("🔄 Calculated badges:", badges.length, badges);
    console.log("🔄 Starter badge (id=1):", badges.find(b => b.id === 1));
    console.log("🔄 Previous earned badges:", previousEarnedBadges);
    
    // Check for newly earned badges
    const newlyEarned = badges
      .filter(badge => badge.earned && !previousEarnedBadges.includes(badge.id))
      .map(badge => badge.name);
    
    console.log("🔄 Newly earned badges:", newlyEarned);
    
    if (newlyEarned.length > 0) {
      console.log("🔄 Showing toast for newly earned badges:", newlyEarned);
      toast({
        title: "🎉 New Badge Earned!",
        description: `You've earned: ${newlyEarned.join(', ')}`,
        variant: "default"
      });
    }
    
    // Update previous earned badges
    const currentlyEarned = badges.filter(b => b.earned).map(b => b.id);
    console.log("🔄 Currently earned badge IDs:", currentlyEarned);
    setPreviousEarnedBadges(currentlyEarned);
    setCalculatedBadgesDebug(badges);
    console.log("🔄 Set calculatedBadges to:", badges.length);
  }, [mySeeds.length, inspiredForksState.length, myForksState.length, toast]);

  // Removed problematic fallback useEffect that was resetting badges

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
            authorId: me?.id,
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !me) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (5MB limit for avatars)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar image must be smaller than 5MB", variant: "destructive" });
      return;
    }

    try {
      setUploadingAvatar(true);
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");

      // Upload to Cloudinary
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'artive/avatars');

      const uploadRes = await fetch(`${apiBase}/api/uploads`, { 
        method: 'POST', 
        body: form 
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error?.message || 'Upload failed');
      }

      // Update user profile with new avatar URL
      const updateRes = await fetch(`${apiBase}/api/users/${me.id}`, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ avatarUrl: uploadData.url })
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update profile');
      }

      // Update local state
      setMe(prev => prev ? { ...prev, avatarUrl: uploadData.url } : null);
      toast({ title: "Success", description: "Avatar updated successfully", variant: "default" });

    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !me) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (10MB limit for banners)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Banner image must be smaller than 10MB", variant: "destructive" });
      return;
    }

    try {
      setUploadingBanner(true);
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");

      console.log('Starting banner upload for user:', me.id);

      // Upload to Cloudinary
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'artive/banners');

      const uploadRes = await fetch(`${apiBase}/api/uploads`, { 
        method: 'POST', 
        body: form 
      });
      const uploadData = await uploadRes.json();

      console.log('Upload response:', uploadRes.status, uploadData);

      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error?.message || 'Upload failed');
      }

      // Update user profile with new banner URL
      const updateRes = await fetch(`${apiBase}/api/users/${me.id}`, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bannerUrl: uploadData.url })
      });

      console.log('Update response:', updateRes.status);

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        console.error('Update error:', errorData);
        throw new Error('Failed to update profile');
      }

      const updatedUserData = await updateRes.json();
      console.log('Updated user data:', updatedUserData);

      // Update local state
      setMe(prev => prev ? { ...prev, bannerUrl: uploadData.url } : null);
      toast({ title: "Success", description: "Banner updated successfully", variant: "default" });

    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Failed to upload banner", variant: "destructive" });
    } finally {
      setUploadingBanner(false);
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
      toast({ title: "Error", description: "Failed to delete seed", variant: "destructive" });
    }
  };

  const handleDeleteFork = async (forkId: string) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/api/forks/${encodeURIComponent(forkId)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok && res.status !== 204) {
        const raw = await res.text();
        throw new Error(raw || 'Failed to delete fork');
      }
      // Remove from both fork states
      setMyForksState((prev) => prev.filter((f) => f._id !== forkId));
      setInspiredForksState((prev) => prev.filter((f) => f._id !== forkId));
      toast({ title: "Success", description: "Fork deleted successfully", variant: "default" });
    } catch (err) {
      try { console.error('[Profile] delete fork exception', err); } catch {}
      toast({ title: "Error", description: "Failed to delete fork", variant: "destructive" });
    }
  };

  const refreshForks = async () => {
    if (!me?.id) return;
    
    const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
    
    try {
      // fetch forks inspired by this user's seeds
      const forksRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(me.id)}/inspired-forks?limit=12`);
      const forksRaw = await forksRes.text();
      let forksJson: any = {};
      try { forksJson = forksRaw ? JSON.parse(forksRaw) : {}; } catch { /* ignore */ }
      if (forksRes.ok) {
        setInspiredForksState(Array.isArray(forksJson.items) ? forksJson.items : []);
      }

      // fetch forks created by this user
      const myForksRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(me.id)}/forks?limit=12`);
      const myForksRaw = await myForksRes.text();
      let myForksJson: any = {};
      try { myForksJson = myForksRaw ? JSON.parse(myForksRaw) : {}; } catch { /* ignore */ }
      if (myForksRes.ok) {
        setMyForksState(Array.isArray(myForksJson.items) ? myForksJson.items : []);
      }
    } catch (err) {
      console.error('Error refreshing forks:', err);
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
        className="relative h-48 md:h-64 bg-cover bg-center group"
        style={{ 
          backgroundImage: me?.bannerUrl 
            ? `url(${me.bannerUrl})` 
            : `linear-gradient(135deg, rgba(232, 201, 176, 0.3), rgba(163, 185, 165, 0.3), rgba(212, 195, 222, 0.3))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {!uploadingBanner && <div className="absolute inset-0 backdrop-blur-sm" />}
        
        {/* Banner Upload Overlay */}
        <div className={`absolute inset-0 bg-black/50 ${uploadingBanner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 flex items-center justify-center z-10`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
            disabled={uploadingBanner}
          />
          <div className="flex flex-col items-center text-white text-sm">
            {uploadingBanner ? (
              <>
                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                <span>Uploading banner...</span>
              </>
            ) : (
              <>
                <Pencil className="h-6 w-6 mb-2" />
                <span>Upload banner</span>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end gap-4">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg relative group">
            <img 
                src={me?.avatarUrl || `https://via.placeholder.com/160x160/E8C9B0/1E1B18?text=${(me?.displayName || 'U').charAt(0).toUpperCase()}`} 
              alt="Profile Avatar" 
                className={`w-full h-full object-cover ${uploadingAvatar ? 'opacity-50' : ''}`} 
            />
            {/* Irregular paint-chip SVG mask */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-accent-1/30 to-accent-3/30 mix-blend-multiply" 
              style={{ 
                clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)' 
              }} 
            />
            
            {/* Upload overlay */}
            <div className={`absolute inset-0 bg-black/50 ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 flex items-center justify-center`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploadingAvatar}
              />
              <div className="flex flex-col items-center text-white text-xs">
                {uploadingAvatar ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mb-1"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mb-1" />
                    <span>Upload</span>
                  </>
                )}
              </div>
            </div>
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
                {myForksState.length} {myForksState.length === 1 ? 'fork' : 'forks'} created
              </span>
            </div>
          </div>
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
                  {(seed as any).type === 'text' ? (
                    <TextCard
                      seed={seed as any}
                      className="animate-fade-in-up h-full"
                      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                      onView={() => { setSelectedSeed(seed); setIsViewModalOpen(true); }}
                      onDelete={handleDeleteSeed}
                      onFork={async () => {
                        // If text, try to prefetch full content
                        const isValidObjectId = /^[a-f\d]{24}$/i.test(seed.id);
                        if ((seed as any).type === 'text' && isValidObjectId) {
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
                        if ((seed as any).type === 'text') setForkSeedMeta({ id: seed.id, type: 'text', initialText: (seed as any).content });
                        else if ((seed as any).type === 'visual') setForkSeedMeta({ id: seed.id, type: 'visual' });
                        else setForkSeedMeta({ id: seed.id, type: 'other' });
                        setIsForkModalOpen(true);
                      }}
                    />
                  ) : (
                    <UnifiedSeedCard
                      seed={seed}
                      className="animate-fade-in-up h-full"
                      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                      onView={() => { setSelectedSeed(seed); setIsViewModalOpen(true); }}
                      onDelete={handleDeleteSeed}
                      onFork={async () => {
                        // If text, try to prefetch full content
                        const isValidObjectId = /^[a-f\d]{24}$/i.test(seed.id);
                        if ((seed as any).type === 'text' && isValidObjectId) {
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
                        if ((seed as any).type === 'text') setForkSeedMeta({ id: seed.id, type: 'text', initialText: (seed as any).content });
                        else if ((seed as any).type === 'visual') setForkSeedMeta({ id: seed.id, type: 'visual' });
                        else setForkSeedMeta({ id: seed.id, type: 'other' });
                        setIsForkModalOpen(true);
                      }}
                    />
                  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {inspiredForksState.map((f: any, index: number) => {
                // Transform fork data to seed format for UnifiedSeedCard
                const originalContent = f.parentSeed?.contentFull || f.parentSeed?.contentSnippet || f.parentSeed?.content || '';
                const forkContent = f.content || f.summary || '';
                
                // Create combined content showing both original and new text
                const combinedContent = originalContent && forkContent 
                  ? `${originalContent}\n${forkContent}`
                  : forkContent || originalContent;
                
                const forkAsSeed = {
                  id: f._id,
                  title: f.title || f.summary || 'Untitled Fork',
                  type: f.type || 'text',
                  author: f.author?.displayName || f.author?.username || 'Anonymous',
                  authorId: f.author?._id,
                  time: new Date(f.createdAt).toLocaleDateString(),
                  forks: 0, // This is a fork, not a seed
                  sparks: 0,
                  category: f.category || 'general',
                  tags: f.tags || [],
                  createdAt: f.createdAt,
                  // Show combined content
                  content: combinedContent,
                  excerpt: combinedContent.slice(0, 180),
                  contentSnippet: combinedContent.length > 200 ? combinedContent.substring(0, 200) + '...' : combinedContent,
                  contentFull: combinedContent,
                  thumbnailUrl: f.thumbnailUrl || f.parentSeed?.thumbnailUrl,
                  imageUrl: f.imageUrl || f.parentSeed?.imageUrl,
                  avatarUrl: f.author?.avatarUrl,
                  isThread: false,
                  threadIndex: undefined,
                  totalThreadParts: undefined,
                  threadParts: undefined,
                  // Add parent seed info as metadata
                  parentSeedTitle: f.parentSeed?.title,
                  parentSeedType: f.parentSeed?.type,
                  parentSeedThumbnail: f.parentSeed?.thumbnailUrl,
                  // Add original seed info for better context
                  originalSeedContent: originalContent,
                  originalSeedTitle: f.parentSeed?.title,
                  forkContent: forkContent,
                } as any;

                return (
                  <div key={`fork-${f._id}-${index}`}>
                    {(f.type === 'text' || !f.type) ? (
                      <TextCard
                        seed={forkAsSeed as any}
                        className="animate-fade-in-up h-full"
                        style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                        onView={() => { setSelectedSeed(forkAsSeed); setIsViewModalOpen(true); }}
                        onFork={async () => {
                          if (f.type === 'text') setForkSeedMeta({ id: f._id, type: 'text', initialText: combinedContent });
                          else if (f.type === 'visual') setForkSeedMeta({ id: f._id, type: 'visual' });
                          else setForkSeedMeta({ id: f._id, type: 'other' });
                          setIsForkModalOpen(true);
                        }}
                        onDelete={() => handleDeleteFork(f._id)}
                      />
                    ) : (
                      <UnifiedSeedCard
                        seed={forkAsSeed}
                        className="animate-fade-in-up h-full"
                        style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                        onView={() => { setSelectedSeed(forkAsSeed); setIsViewModalOpen(true); }}
                        onFork={async () => {
                          if (f.type === 'text') setForkSeedMeta({ id: f._id, type: 'text', initialText: combinedContent });
                          else if (f.type === 'visual') setForkSeedMeta({ id: f._id, type: 'visual' });
                          else setForkSeedMeta({ id: f._id, type: 'other' });
                          setIsForkModalOpen(true);
                        }}
                        onDelete={() => handleDeleteFork(f._id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Seeds you have forked */}
        <section>
          <h2 className="font-display text-2xl mb-6">Seeds you have forked</h2>
          {myForksState.length === 0 ? (
            <div className="text-sm text-muted-foreground">No forks yet. Explore seeds and fork them to build on others' ideas.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {myForksState.map((fork: any, index: number) => {
                // Transform fork data to seed format for UnifiedSeedCard
                const originalContent = fork.parentSeed?.contentFull || fork.parentSeed?.contentSnippet || fork.parentSeed?.content || '';
                const forkContent = fork.content || fork.summary || '';
                
                // Create combined content showing both original and new text
                const combinedContent = originalContent && forkContent 
                  ? `${originalContent}\n${forkContent}`
                  : forkContent || originalContent;
                
                const forkAsSeed = {
                  id: fork._id,
                  title: fork.title || fork.summary || 'My Fork',
                  type: fork.type || 'text',
                  author: 'You', // This is the user's own fork
                  time: new Date(fork.createdAt).toLocaleDateString(),
                  forks: 0, // This is a fork, not a seed
                  sparks: 0,
                  category: fork.category || 'general',
                  tags: fork.tags || [],
                  createdAt: fork.createdAt,
                  // Show combined content
                  content: combinedContent,
                  excerpt: combinedContent.slice(0, 180),
                  contentSnippet: combinedContent.length > 200 ? combinedContent.substring(0, 200) + '...' : combinedContent,
                  contentFull: combinedContent,
                  thumbnailUrl: fork.thumbnailUrl || fork.parentSeed?.thumbnailUrl,
                  imageUrl: fork.imageUrl || fork.parentSeed?.imageUrl,
                  avatarUrl: me?.avatarUrl, // User's own avatar
                  isThread: false,
                  threadIndex: undefined,
                  totalThreadParts: undefined,
                  threadParts: undefined,
                  // Add parent seed info as metadata
                  parentSeedTitle: fork.parentSeed?.title,
                  parentSeedType: fork.parentSeed?.type,
                  parentSeedThumbnail: fork.parentSeed?.thumbnailUrl,
                  // Add original seed info for better context
                  originalSeedContent: originalContent,
                  originalSeedTitle: fork.parentSeed?.title,
                  forkContent: forkContent,
                } as any;

                return (
                  <div key={`my-fork-${fork._id}-${index}`}>
                    {(fork.type === 'text' || !fork.type) ? (
                      <TextCard
                        seed={forkAsSeed as any}
                        className="animate-fade-in-up h-full"
                        style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                        onView={() => { setSelectedSeed(forkAsSeed); setIsViewModalOpen(true); }}
                        onFork={async () => {
                          if (fork.type === 'text') setForkSeedMeta({ id: fork._id, type: 'text', initialText: combinedContent });
                          else if (fork.type === 'visual') setForkSeedMeta({ id: fork._id, type: 'visual' });
                          else setForkSeedMeta({ id: fork._id, type: 'other' });
                          setIsForkModalOpen(true);
                        }}
                        onDelete={() => handleDeleteFork(fork._id)}
                      />
                    ) : (
                      <UnifiedSeedCard
                        seed={forkAsSeed}
                        className="animate-fade-in-up h-full"
                        style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                        onView={() => { setSelectedSeed(forkAsSeed); setIsViewModalOpen(true); }}
                        onFork={async () => {
                          if (fork.type === 'text') setForkSeedMeta({ id: fork._id, type: 'text', initialText: combinedContent });
                          else if (fork.type === 'visual') setForkSeedMeta({ id: fork._id, type: 'visual' });
                          else setForkSeedMeta({ id: fork._id, type: 'other' });
                          setIsForkModalOpen(true);
                        }}
                        onDelete={() => handleDeleteFork(fork._id)}
                      />
                    )}
                  </div>
                );
              })}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">Creative Sparks Badges</h2>
            {calculatedBadges.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {calculatedBadges.filter(b => b.earned).length} of {calculatedBadges.length} earned
              </div>
            )}
          </div>
          
          {calculatedBadges.length > 0 && (
            <div className="mb-6 bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round((calculatedBadges.filter(b => b.earned).length / calculatedBadges.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent-1 to-accent-2 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(calculatedBadges.filter(b => b.earned).length / calculatedBadges.length) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              console.log("🎨 Rendering badges - calculatedBadges.length:", calculatedBadges.length, "calculatedBadges:", calculatedBadges);
              const starterBadge = calculatedBadges.find(b => b.id === 1);
              console.log("🎨 Starter badge in render:", starterBadge);
              return calculatedBadges.length > 0 ? calculatedBadges.map((badge) => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-lg torn-edge-soft shadow-sm flex flex-col items-center text-center transition-all duration-300 ${
                  badge.earned 
                    ? 'bg-card/80 border-2 border-accent-1/30' 
                    : 'bg-card/30 border-2 border-border/30 opacity-75'
                }`}
              >
                <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale opacity-60'}`}>
                  {badge.icon}
                </div>
                <h3 className={`font-medium text-sm mb-1 ${badge.earned ? 'text-accent-1' : 'text-muted-foreground'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                
                {badge.earned ? (
                  <div className="mt-2 text-xs text-accent-1 font-medium flex items-center gap-1">
                    <span>✓</span>
                    <span>Earned</span>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-1.5">
                      <div 
                        className="bg-accent-1/60 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{badge.progressText}</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading badges...</p>
              </div>
            );
            })()}
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
        onForkCreated={refreshForks}
      />
    </div>
  );
};

export default Profile;
