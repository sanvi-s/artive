import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { Search, SortAsc, Filter, Heart, Share2, Bookmark } from "lucide-react";
import { UnifiedSeedCard } from "@/components/UnifiedSeedCard";
import { SeedViewModal } from "@/components/SeedViewModal";
import { allSeeds, categories, sortOptions } from "@/data/sampleSeeds";
import { Seed } from "@/types/seed";

// Use imported data

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("New");
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter and sort seeds
  const displayedSeeds = allSeeds
    .filter((seed) => {
      const matchesSearch = seed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           seed.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (seed.type === 'text' && seed.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || 
                             seed.category === selectedCategory ||
                             (selectedCategory === "Text" && seed.type === 'text') ||
                             (selectedCategory === "Visual" && seed.type === 'visual');
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
                placeholder="Search seeds..."
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
            {selectedCategory === "All" ? "All Seeds" : `${selectedCategory} Seeds`}
          </h1>
          <p className="text-muted-foreground">
            {displayedSeeds.length} {displayedSeeds.length === 1 ? "seed" : "seeds"} found
          </p>
        </div>

        {/* Masonry Grid */}
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

        {/* Empty State */}
        {displayedSeeds.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-display font-semibold mb-2">No seeds yet</h3>
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
      />
    </div>
  );
};

export default Explore;
