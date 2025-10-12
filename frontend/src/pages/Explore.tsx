import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { Search, SortAsc, Filter, Heart, Share2, Bookmark } from "lucide-react";
import { SeedCard } from "@/components/SeedCard";

// Sample data
const categories = ["Poems", "Visual", "Music", "Code", "Random"];
const sortOptions = ["New", "Trending", "Most Forked", "Oldest"];

const allSeeds = [
  {
    id: "1",
    image: "https://via.placeholder.com/300x200/E8C9B0/1E1B18?text=Watercolor+Dreams",
    title: "Unfinished Watercolor Dreams",
    author: "Priya K.",
    time: "2h ago",
    forks: 12,
    category: "Visual",
    trending: true,
  },
  {
    id: "2", 
    image: "https://via.placeholder.com/300x200/A3B9A5/1E1B18?text=Color+Studies",
    title: "Color Studies",
    author: "Ahmed M.",
    time: "4h ago",
    forks: 5,
    category: "Visual",
    trending: false,
  },
  {
    id: "3",
    image: "https://via.placeholder.com/300x200/D4C3DE/1E1B18?text=Dreams+in+Motion",
    title: "Dreams in Motion",
    author: "Meera S.",
    time: "6h ago",
    forks: 8,
    category: "Visual",
    trending: true,
  },
  {
    id: "4",
    image: "https://via.placeholder.com/300x200/E8C9B0/1E1B18?text=Poem+Fragment",
    title: "Midnight Whispers",
    author: "Ravi D.",
    time: "1d ago",
    forks: 3,
    category: "Poems",
    trending: false,
  },
  {
    id: "5",
    image: "https://via.placeholder.com/300x200/A3B9A5/1E1B18?text=Code+Snippet",
    title: "Half-Built Algorithm",
    author: "Sneha P.",
    time: "2d ago",
    forks: 15,
    category: "Code",
    trending: true,
  },
  {
    id: "6",
    image: "https://via.placeholder.com/300x200/D4C3DE/1E1B18?text=Music+Sketch",
    title: "Melody Fragment",
    author: "Kiran M.",
    time: "3d ago",
    forks: 7,
    category: "Music",
    trending: false,
  },
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("New");

  // Filter and sort seeds
  const displayedSeeds = allSeeds
    .filter((seed) => {
      const matchesSearch = seed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           seed.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || seed.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "Trending":
          return b.forks - a.forks;
        case "Most Forked":
          return b.forks - a.forks;
        case "Oldest":
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        default:
          return new Date(a.time).getTime() - new Date(b.time).getTime();
      }
    });

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
            <SeedCard
              key={seed.id}
              id={seed.id}
              image={seed.image}
              title={seed.title}
              author={seed.author}
              time={seed.time}
              forks={seed.forks}
              className="torn-edge-soft"
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
    </div>
  );
};

export default Explore;
