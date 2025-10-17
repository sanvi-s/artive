import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { TextCard } from "@/components/TextCard";
import { SeedViewModal } from "@/components/SeedViewModal";
import { ArrowLeft, Heart, GitFork, User, Calendar, Mail } from "lucide-react";
import { Seed } from "@/types/seed";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type PublicUser = { 
  id: string; 
  email?: string; 
  username: string; 
  displayName: string; 
  avatarUrl?: string; 
  bannerUrl?: string;
  bio?: string;
  createdAt: string;
};

type ApiSeed = { 
  _id: string; 
  title: string; 
  contentSnippet?: string; 
  contentFull?: string; 
  type: string; 
  author: string; 
  forkCount: number; 
  thumbnailUrl?: string; 
  createdAt: string; 
};

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

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<PublicUser | null>(null);
  const [userSeeds, setUserSeeds] = useState<ApiSeed[]>([]);
  const [userForks, setUserForks] = useState<any[]>([]);
  const [inspiredForksCount, setInspiredForksCount] = useState<number>(0);
  const [userSeedsDisplay, setUserSeedsDisplay] = useState<Seed[]>([]);
  const [userForksDisplay, setUserForksDisplay] = useState<Seed[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedBadges, setCalculatedBadges] = useState<any[]>([]);

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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("token");
        
        // Fetch user profile
        const userRes = await fetch(`${apiBase}/api/users/${userId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (!userRes.ok) {
          if (userRes.status === 404) {
            setError("User not found");
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userRes.json();
        console.log('User data received:', userData);
        setUser(userData);
        
        // Use the correct user ID (could be id or _id)
        const actualUserId = userData.id || userData._id;
        console.log('Using user ID:', actualUserId);
        
        // Fetch user's seeds
        const seedsRes = await fetch(`${apiBase}/api/seeds?author=${encodeURIComponent(actualUserId)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (seedsRes.ok) {
          const seedsData = await seedsRes.json();
          console.log('Seeds data:', seedsData);
          setUserSeeds(seedsData.items || []);
        }
        
        // Fetch user's forks
        const forksRes = await fetch(`${apiBase}/api/forks?author=${encodeURIComponent(actualUserId)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (forksRes.ok) {
          const forksData = await forksRes.json();
          setUserForks(forksData.items || []);
        }
        
        // Fetch forks inspired by this user's seeds
        const inspiredForksRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(actualUserId)}/inspired-forks?limit=50`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (inspiredForksRes.ok) {
          const inspiredForksData = await inspiredForksRes.json();
          // Store the count for badge calculation
          setInspiredForksCount(inspiredForksData.total || 0);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError(err.message || 'Failed to load profile');
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, toast]);

  // Map API seeds to Seed format for display
  useEffect(() => {
    const mappedSeeds: Seed[] = userSeeds.map((s: ApiSeed) => ({
      id: s._id,
      title: s.title,
      author: typeof s.author === 'string' ? s.author : (s.author?.displayName || s.author?.username || 'Anonymous'),
      time: formatTime(s.createdAt),
      createdAt: s.createdAt,
      forks: s.forkCount || 0,
      sparks: 0,
      category: 'general',
      tags: [],
      type: s.type === 'poem' ? 'text' : s.type,
      content: s.contentFull || s.contentSnippet || '',
      excerpt: s.contentSnippet || s.title,
      image: s.thumbnailUrl || '',
      isForked: false
    }));
    
    setUserSeedsDisplay(mappedSeeds);
  }, [userSeeds]);

  // Map API forks to Seed format for display
  useEffect(() => {
    const mappedForks: Seed[] = userForks.map((f: any) => {
      const originalContent = f.parentSeed?.contentFull || f.parentSeed?.contentSnippet || f.parentSeed?.content || '';
      const forkContent = f.contentDelta || f.summary || f.content || '';
      const combinedContent = forkContent || originalContent;
      
      return {
        id: f._id,
        title: f.summary || f.title || 'Fork',
        author: typeof f.author === 'string' ? f.author : (f.author?.displayName || f.author?.username || 'Anonymous'),
        time: formatTime(f.createdAt),
        createdAt: f.createdAt,
        forks: f.forkCount || 0, // Use the fork's own fork count
        sparks: 0,
        category: 'general',
        tags: [],
        type: 'text', // Forks are always text
        content: combinedContent,
        excerpt: combinedContent.slice(0, 200) || f.summary || 'Fork',
        image: f.thumbnailUrl || f.imageUrl || '',
        isForked: true,
        parentId: f.parentSeed?._id
      };
    });
    
    setUserForksDisplay(mappedForks);
  }, [userForks]);

  // Calculate badges when user data changes
  useEffect(() => {
    if (userSeeds.length > 0 || userForks.length > 0) {
      const seedsPlanted = userSeeds.length;
      const forksCreated = userForks.length;
      
      // Debug: Log seed types to ensure visual seeds are included
      const seedTypes = userSeeds.map(s => ({ id: s._id, type: s.type, hasImage: Boolean(s.thumbnailUrl) }));
      console.log("🔄 PublicProfile seed types breakdown:", seedTypes);
      
      // Use the actual count of inspired forks
      const forksInspired = inspiredForksCount;
      
      const badges = calculateBadges(seedsPlanted, forksInspired, forksCreated);
      console.log("🔄 PublicProfile calculated badges:", badges.length, badges);
      setCalculatedBadges(badges);
    }
  }, [userSeeds, userForks, inspiredForksCount, calculateBadges]);

  const handleViewSeed = (seedId: string) => {
    const seed = [...userSeedsDisplay, ...userForksDisplay].find(s => s.id === seedId);
    if (seed) {
      setSelectedSeed(seed);
      setIsViewModalOpen(true);
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'Unknown date';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'Unknown time';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <InkCursor />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-accent-1 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <InkCursor />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl">👤</div>
          <h2 className="text-2xl font-display font-semibold">User Not Found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {error || "The user you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <InkCursor />
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 md:px-8 pt-4">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Header Banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ 
          backgroundImage: user?.bannerUrl 
            ? `url(${user.bannerUrl})` 
            : `linear-gradient(135deg, rgba(232, 201, 176, 0.3), rgba(163, 185, 165, 0.3), rgba(212, 195, 222, 0.3))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg">
            <img 
              src={user?.avatarUrl || `https://via.placeholder.com/160x160/E8C9B0/1E1B18?text=${(user?.displayName || 'U').charAt(0).toUpperCase()}`} 
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
            <h1 className="font-display text-3xl md:text-4xl font-bold">{user?.displayName || "User"}</h1>
            <p className="text-muted-foreground italic">@{user?.username || "username"}</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Joined {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {userSeedsDisplay.length} {userSeedsDisplay.length === 1 ? 'seed' : 'seeds'} planted
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {userForksDisplay.length} {userForksDisplay.length === 1 ? 'fork' : 'forks'} created
              </span>
            </div>
            {user?.bio && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-16 mt-16 md:mt-20 space-y-16">
        {/* Seeds planted */}
        <section>
          <h2 className="font-display text-2xl mb-6">Seeds planted</h2>
          {userSeedsDisplay.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No seeds planted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {userSeedsDisplay.map((seed, index) => (
                <div key={`${seed.id}-${index}`}>
                  {(seed as any).type === 'text' ? (
                    <TextCard
                      seed={seed as any}
                      className="animate-fade-in-up h-full"
                      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                      onView={() => handleViewSeed(seed.id)}
                    />
                  ) : (
                    <UnifiedSeedCard
                      seed={seed}
                      className="animate-fade-in-up h-full"
                      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                      onView={() => handleViewSeed(seed.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Forks created */}
        {userForksDisplay.length > 0 && (
          <section>
            <h2 className="font-display text-2xl mb-6">Forks created</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {userForksDisplay.map((fork, index) => (
                <div key={`${fork.id}-${index}`}>
                  <TextCard
                    seed={fork as any}
                    className="animate-fade-in-up h-full"
                    style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                    onView={() => handleViewSeed(fork.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Badges */}
        {calculatedBadges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Creative Sparks Badges</h2>
              <div className="text-sm text-muted-foreground">
                {calculatedBadges.filter(b => b.earned).length} of {calculatedBadges.length} earned
              </div>
            </div>
            
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {calculatedBadges.map((badge) => (
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
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Seed View Modal */}
      <SeedViewModal
        seed={selectedSeed}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default PublicProfile;
