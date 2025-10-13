import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';

interface Seed {
  id: string;
  title: string;
  author: string;
  date: string;
  type: 'text' | 'visual';
  generation: number;
  parentId?: string;
  children: Seed[];
}

interface RadialViewProps {
  seeds?: Seed[];
  centerSeed?: Seed;
}

// Sample data for demonstration
const sampleSeeds: Seed[] = [
  {
    id: "2",
    title: "Color Studies",
    author: "Ahmed M.",
    date: "2024-01-16",
    type: "visual",
    generation: 1,
    parentId: "1",
    children: []
  },
  {
    id: "3", 
    title: "Dreams in Motion",
    author: "Meera S.",
    date: "2024-01-17",
    type: "text",
    generation: 1,
    parentId: "1",
    children: []
  },
  {
    id: "4",
    title: "Watercolor Sketches", 
    author: "Lakshmi R.",
    date: "2024-01-18",
    type: "visual",
    generation: 1,
    parentId: "1",
    children: []
  },
  {
    id: "5",
    title: "Abstract Emotions",
    author: "Carlos P.",
    date: "2024-01-19",
    type: "visual",
    generation: 2,
    parentId: "2",
    children: []
  },
  {
    id: "6",
    title: "Digital Dreams",
    author: "Sarah L.",
    date: "2024-01-20",
    type: "text",
    generation: 2,
    parentId: "3",
    children: []
  },
  {
    id: "7",
    title: "Ink & Paper",
    author: "Yuki T.",
    date: "2024-01-21",
    type: "visual",
    generation: 2,
    parentId: "4",
    children: []
  },
  {
    id: "8",
    title: "Mixed Media",
    author: "Alex K.",
    date: "2024-01-22",
    type: "visual",
    generation: 3,
    parentId: "5",
    children: []
  }
];

const sampleCenterSeed: Seed = {
  id: "1",
  title: "Unfinished Watercolor Dreams",
  author: "Priya K.",
  date: "2024-01-15",
  type: "visual",
  generation: 0,
  children: []
};

export const RadialView: React.FC<RadialViewProps> = ({ 
  seeds = sampleSeeds, 
  centerSeed = sampleCenterSeed
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [filter, setFilter] = useState<"all" | "visual" | "poems" | "music" | "code">("all");
  const [depth, setDepth] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate radial positions for nodes
  const generateRadialPositions = (seeds: Seed[], centerX: number, centerY: number) => {
    const positions: { [key: string]: { x: number; y: number; generation: number } } = {};
    
    // Center node
    if (centerSeed) {
      positions[centerSeed.id] = { x: centerX, y: centerY, generation: 0 };
    }

    // Group seeds by generation
    const generations: { [key: number]: Seed[] } = {};
    seeds.forEach(seed => {
      if (!generations[seed.generation]) {
        generations[seed.generation] = [];
      }
      generations[seed.generation].push(seed);
    });

    // Position nodes in concentric circles
    Object.entries(generations).forEach(([gen, genSeeds]) => {
      const generation = parseInt(gen);
      if (generation === 0) return; // Skip center node
      
      const radius = 120 + (generation - 1) * 80;
      const angleStep = (2 * Math.PI) / genSeeds.length;
      
      genSeeds.forEach((seed, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions[seed.id] = { x, y, generation };
      });
    });

    return positions;
  };

  const centerX = 400;
  const centerY = 300;
  const positions = generateRadialPositions(seeds, centerX, centerY);

  // Floating particles
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full bg-accent-1/20",
            i % 3 === 0 && "animate-float0",
            i % 3 === 1 && "animate-float1", 
            i % 3 === 2 && "animate-float2"
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  // Radial gradient background
  const RadialGradient = () => (
    <div 
      className="absolute inset-0 opacity-30"
      style={{
        background: `radial-gradient(circle at ${centerX}px ${centerY}px, 
          hsl(var(--accent-1) / 0.1) 0%, 
          hsl(var(--accent-2) / 0.05) 30%, 
          transparent 70%)`
      }}
    />
  );

  // Connection lines
  const ConnectionLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {seeds.map(seed => {
        if (!seed.parentId || !positions[seed.id] || !positions[seed.parentId]) return null;
        
        const start = positions[seed.parentId];
        const end = positions[seed.id];
        
        return (
          <line
            key={`${seed.parentId}-${seed.id}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="hsl(var(--accent-1) / 0.3)"
            strokeWidth="1"
            className="transition-opacity duration-500"
            style={{
              opacity: hoveredNode === seed.id || hoveredNode === seed.parentId ? 0.8 : 0.3
            }}
          />
        );
      })}
    </svg>
  );

  // Seed node component
  const SeedNode: React.FC<{ seed: Seed; position: { x: number; y: number; generation: number } }> = ({ 
    seed, 
    position 
  }) => {
    const isCenter = position.generation === 0;
    const isHovered = hoveredNode === seed.id;
    
    return (
      <div
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-organic",
          isAnimating && "animate-organic-fade-in"
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
          animationDelay: `${position.generation * 0.1}s`
        }}
        onMouseEnter={() => setHoveredNode(seed.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => {
          // Open seed modal
          console.log('Open seed:', seed.id);
        }}
      >
        {/* Node circle */}
        <div
          className={cn(
            "relative rounded-full border-2 transition-all duration-300 ease-organic",
            isCenter 
              ? "w-16 h-16 bg-gradient-to-br from-accent-1 to-accent-2 border-accent-1/50 shadow-lg"
              : "w-12 h-12 bg-card border-accent-1/30 hover:border-accent-1/60",
            isHovered && "shadow-accent-1/20 shadow-lg"
          )}
        >
          {/* Ripple effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-full bg-accent-1/20 animate-ink-ripple" />
          )}
          
          {/* Generation indicator */}
          {!isCenter && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-2/80 text-xs flex items-center justify-center text-white font-medium">
              {position.generation}
            </div>
          )}
        </div>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border/20 shadow-lg text-sm whitespace-nowrap z-10">
            <div className="font-medium text-foreground">{seed.title}</div>
            <div className="text-muted-foreground text-xs">by {seed.author}</div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Paper grain texture */}
      <div className="absolute inset-0 opacity-[var(--paper-grain-opacity)] pointer-events-none" />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Radial gradient */}
      <RadialGradient />
      
      {/* Connection lines */}
      <ConnectionLines />

      {/* Header */}
      <header className="absolute top-16 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <Link to="/forklore">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Forklore
            </Button>
          </Link>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/20">
            <Button variant="ghost" size="sm" className="text-accent-1">
              Radial
            </Button>
            <Link to="/forklore/spiral">
              <Button variant="ghost" size="sm">
                Spiral
              </Button>
            </Link>
            <Link to="/forklore/timeline">
              <Button variant="ghost" size="sm">
                Timeline
              </Button>
            </Link>
            <Link to="/forklore">
              <Button variant="ghost" size="sm">
                Tree
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main visualization */}
      <main className="relative w-full h-screen flex items-center justify-center">
        <div ref={containerRef} className="relative w-full h-full">
          {/* Center node */}
          {centerSeed && positions[centerSeed.id] && (
            <SeedNode seed={centerSeed} position={positions[centerSeed.id]} />
          )}
          
          {/* Child nodes */}
          {seeds.map(seed => 
            positions[seed.id] && (
              <SeedNode key={seed.id} seed={seed} position={positions[seed.id]} />
            )
          )}
        </div>
      </main>

      {/* Floating caption */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/20">
          <p className="text-sm text-muted-foreground font-handwritten italic">
            "Every idea ripples outward…"
          </p>
        </div>
      </div>

      {/* Reset view button */}
      <div className="absolute bottom-8 right-8 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          className="bg-card/50 backdrop-blur-sm border border-border/20"
          onClick={() => {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset View
        </Button>
      </div>

      {/* Right Sidebar Controls */}
      <div className="absolute top-16 right-4 z-20 rounded-lg p-4 space-y-3 dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)] bg-background/80 backdrop-blur-sm border border-border/20">
        {/* Navigation */}
        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Layout</label>
          <div className="flex gap-1">
            <Button variant="hero" size="sm" className="text-xs capitalize" style={{
              background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
              border: 'none',
              color: '#f2f2f2',
              boxShadow: '0 0 12px rgba(120,200,120,0.3)'
            }}>
              Radial
            </Button>
            <Link to="/forklore/timeline">
              <Button variant="ghost" size="sm" className="text-xs capitalize">
                Timeline
              </Button>
            </Link>
            <Link to="/forklore/spiral">
              <Button variant="ghost" size="sm" className="text-xs capitalize">
                Spiral
              </Button>
            </Link>
            <Link to="/forklore">
              <Button variant="ghost" size="sm" className="text-xs capitalize">
                Tree
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Tree Legend</label>
          <div className="space-y-1 text-xs text-muted-foreground dark:[color:#f3d9ea]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-accent-1"></div>
              <span>Original Seed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-accent-2"></div>
              <span>1st Level Forks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-accent-3"></div>
              <span>2nd Level Forks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-accent-1"></div>
              <span>3rd+ Level Forks</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs dark:[background:rgba(60,60,65,0.8)] dark:[border:1px_solid_rgba(255,255,255,0.15)] dark:[color:#f3d9ea]"
          >
            <option value="all">All Types</option>
            <option value="visual">Visual</option>
            <option value="poems">Poems</option>
            <option value="music">Music</option>
            <option value="code">Code</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Depth: {depth}</label>
          <input
            type="range"
            min="1"
            max="4"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full"
            style={{
              background: 'linear-gradient(to right, #7dd87a, #52ca51)',
              height: '6px',
              borderRadius: '3px',
              outline: 'none',
              opacity: 0.8
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RadialView;
