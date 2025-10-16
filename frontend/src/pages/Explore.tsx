import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { Search, SortAsc, Filter, Heart, Share2, Bookmark } from "lucide-react";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { SeedViewModal } from "@/components/SeedViewModal";
import { Seed } from "@/types/seed";

const categories = ["Text", "Visual", "Music", "Code"];
const sortOptions = ["New", "Trending", "Most Forked", "Most Sparked", "Oldest"];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("New");
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [allSeeds, setAllSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh seeds and forks data
  const refreshSeedsAndForks = async () => {
    setLoading(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL;
      if (!apiBase) {
        console.error('API base URL not configured');
        return;
      }

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch both seeds and forks in parallel
      const [seedsRes, forksRes] = await Promise.all([
        fetch(`${apiBase}/api/seeds?limit=50`, { headers }),
        fetch(`${apiBase}/api/forks?limit=50`, { headers })
      ]);

      const allItems: Seed[] = [];
      
      // Map API seeds to Seed format
      if (seedsRes.ok) {
        const seedsData = await seedsRes.json();
        const seeds: Seed[] = (seedsData.items || []).map((s: any) => ({
          id: s._id,
          title: s.title,
          author: s.author?.displayName || s.author?.username || 'Anonymous',
          authorId: s.author?._id,
          time: s.createdAt,
          createdAt: s.createdAt,
          forks: s.forkCount || 0,
          sparks: 0,
          category: 'general',
          tags: [],
          type: s.type === 'poem' ? 'text' : s.type,
          content: s.contentFull || s.contentSnippet || '',
          excerpt: s.contentSnippet || s.title,
          image: s.thumbnailUrl || '',
          isForked: false,
          parentId: null // Regular seeds don't have a parent
        }));
        allItems.push(...seeds);
      }

      // Map API forks to Seed format
      if (forksRes.ok) {
        const forksData = await forksRes.json();
        const forks: Seed[] = (forksData.items || []).map((f: any) => {
          const originalContent = f.parentSeed?.contentFull || f.parentSeed?.contentSnippet || f.parentSeed?.content || '';
          const forkContent = f.contentDelta || f.summary || f.content || '';
          const combinedContent = forkContent || originalContent;
          
          return {
            id: f._id,
            title: f.summary || f.title || 'Fork',
            author: f.author?.displayName || f.author?.username || 'Anonymous',
            authorId: f.author?._id,
            time: f.createdAt,
            createdAt: f.createdAt,
            forks: 0,
            sparks: 0,
            category: 'general',
            tags: [],
            type: 'text', // Forks are always text
            content: combinedContent,
            excerpt: combinedContent.slice(0, 200) || f.summary || 'Fork',
            image: f.thumbnailUrl || f.imageUrl || '',
            isForked: true,
            parentId: f.parentSeed?._id || f.parentSeed // Ensure parentId is set correctly
          };
        });
        allItems.push(...forks);
      }
      
      // Sort by newest first (most recent first) by default
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllSeeds(allItems);
    } catch (error) {
      console.error('Failed to refresh seeds and forks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch both seeds and forks from API
  useEffect(() => {
    refreshSeedsAndForks();
  }, []);


  // Filter and sort seeds
  const displayedSeeds = allSeeds
    .filter((seed) => {
      // Search filter - search in title, author, content, and tags
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
                           seed.title.toLowerCase().includes(searchLower) ||
                           seed.author.toLowerCase().includes(searchLower) ||
                           seed.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                           (seed.type === 'text' && seed.content.toLowerCase().includes(searchLower)) ||
                           (seed.type === 'visual' && (seed as any).description?.toLowerCase().includes(searchLower)) ||
                           (seed.type === 'code' && (seed as any).description?.toLowerCase().includes(searchLower));
      
      // Category filter - match by type or category
      const matchesCategory = selectedCategory === "All" || 
                             seed.category === selectedCategory ||
                             (selectedCategory === "Text" && seed.type === 'text') ||
                             (selectedCategory === "Visual" && seed.type === 'visual') ||
                             (selectedCategory === "Music" && seed.type === 'music') ||
                             (selectedCategory === "Code" && seed.type === 'code');
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "Trending":
          return (b.sparks + b.forks) - (a.sparks + a.forks);
        case "Most Forked":
          return b.forks - a.forks;
        case "Most Sparked":
          return b.sparks - a.sparks;
        case "Oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // "New" - newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleViewSeed = (seedId: string) => {
    const seed = allSeeds.find(s => s.id === seedId);
    if (seed) {
      setSelectedSeed(seed);
      setIsViewModalOpen(true);
    }
  };

  const handleForkSeed = (seedId: string) => {
    console.log('Forking seed:', seedId);
    // Here you would typically handle the fork logic
  };

  return (
    <div className="min-h-screen bg-background">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Top Filter Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-paper border-b border-border/50">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 torn-edge-soft"
                data-shortcut="search"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "hero" : "hero-ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="torn-edge-soft text-xs font-medium transition-all duration-300 hover:scale-105"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-semibold mb-2">
            {selectedCategory === "All" ? "All Posts" : `${selectedCategory} Seeds`}
          </h1>
          <p className="text-muted-foreground">
            {displayedSeeds.length} {displayedSeeds.length === 1 ? "post" : "posts"} found
          </p>
        </div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-accent-1 border-t-transparent rounded-full"></div>
          </div>
        ) : displayedSeeds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedSeeds.map((seed) => (
              <UnifiedSeedCard
                key={seed.id}
                seed={seed}
                className="torn-edge-soft"
                onFork={handleForkSeed}
                onView={handleViewSeed}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-display font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to leave a trace.
            </p>
            <Link to="/auth">
              <Button variant="hero">Share your unfinished idea</Button>
            </Link>
          </div>
        )}
      </main>

      {/* Seed View Modal */}
      <SeedViewModal
        seed={selectedSeed}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onFork={handleForkSeed}
        onForkCreated={refreshSeedsAndForks}
      />
    </div>
  );
};

export default Explore;
