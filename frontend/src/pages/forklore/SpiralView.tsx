import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';
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

interface SpiralViewProps {
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
  },
  {
    id: "9",
    title: "Spiral Thoughts",
    author: "Maya D.",
    date: "2024-01-23",
    type: "text",
    generation: 3,
    parentId: "6",
    children: []
  },
  {
    id: "10",
    title: "Golden Ratio",
    author: "David W.",
    date: "2024-01-24",
    type: "visual",
    generation: 4,
    parentId: "8",
    children: []
  },
  {
    id: "11",
    title: "Spiral Dreams",
    author: "Elena R.",
    date: "2024-01-25",
    type: "text",
    generation: 4,
    parentId: "9",
    children: []
  },
  {
    id: "12",
    title: "Infinite Loop",
    author: "Marcus T.",
    date: "2024-01-26",
    type: "visual",
    generation: 5,
    parentId: "10",
    children: []
  },
  {
    id: "13",
    title: "Fibonacci Flow",
    author: "Zara K.",
    date: "2024-01-27",
    type: "text",
    generation: 5,
    parentId: "11",
    children: []
  },
  {
    id: "14",
    title: "Cosmic Spiral",
    author: "Nina P.",
    date: "2024-01-28",
    type: "visual",
    generation: 6,
    parentId: "12",
    children: []
  },
  {
    id: "15",
    title: "Golden Spiral",
    author: "Oliver M.",
    date: "2024-01-29",
    type: "text",
    generation: 6,
    parentId: "13",
    children: []
  },
  {
    id: "16",
    title: "Infinite Journey",
    author: "Sophia L.",
    date: "2024-01-30",
    type: "visual",
    generation: 7,
    parentId: "14",
    children: []
  },
  {
    id: "17",
    title: "Spiral Wisdom",
    author: "James R.",
    date: "2024-01-31",
    type: "text",
    generation: 7,
    parentId: "15",
    children: []
  },
  {
    id: "18",
    title: "Endless Flow",
    author: "Isabella C.",
    date: "2024-02-01",
    type: "visual",
    generation: 8,
    parentId: "16",
    children: []
  },
  {
    id: "19",
    title: "Spiral Universe",
    author: "Lucas M.",
    date: "2024-02-02",
    type: "text",
    generation: 8,
    parentId: "17",
    children: []
  },
  {
    id: "20",
    title: "Infinite Patterns",
    author: "Emma W.",
    date: "2024-02-03",
    type: "visual",
    generation: 9,
    parentId: "18",
    children: []
  },
  {
    id: "21",
    title: "Golden Dreams",
    author: "Noah K.",
    date: "2024-02-04",
    type: "text",
    generation: 9,
    parentId: "19",
    children: []
  },
  {
    id: "22",
    title: "Cosmic Journey",
    author: "Ava S.",
    date: "2024-02-05",
    type: "visual",
    generation: 10,
    parentId: "20",
    children: []
  },
  {
    id: "23",
    title: "Spiral Wisdom",
    author: "Liam T.",
    date: "2024-02-06",
    type: "text",
    generation: 10,
    parentId: "21",
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

export const SpiralView: React.FC<SpiralViewProps> = ({ 
  seeds = sampleSeeds, 
  centerSeed = sampleCenterSeed
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [zoom, setZoom] = useState(0.4); // Start extremely zoomed out to show the full spiral
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<"all" | "visual" | "poems" | "music" | "code">("all");
  const [depth, setDepth] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate Fermat's spiral positions
  const generateSpiralPositions = (seeds: Seed[], centerX: number, centerY: number) => {
    const positions: { [key: string]: { x: number; y: number; angle: number; radius: number } } = {};
    
    // Sort seeds by date to create chronological spiral
    const sortedSeeds = [...seeds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Center node
    if (centerSeed) {
      positions[centerSeed.id] = { x: centerX, y: centerY, angle: 0, radius: 0 };
    }

    // Generate spiral positions using Fermat's spiral (golden angle)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const spiralTightness = 80; // MUCH larger to fill the screen
    
    sortedSeeds.forEach((seed, index) => {
      const angle = index * goldenAngle;
      const radius = spiralTightness * Math.sqrt(index + 1);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions[seed.id] = { x, y, angle, radius };
    });

    return positions;
  };

  const centerX = 400 + center.x; // Centered horizontally
  const centerY = 300 + center.y; // Centered vertically
  const positions = generateSpiralPositions(seeds, centerX, centerY);

  // Floating particles with spiral motion
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full bg-accent-1/15",
            i % 3 === 0 && "animate-float0",
            i % 3 === 1 && "animate-float1", 
            i % 3 === 2 && "animate-float2"
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 3}s`,
            transform: isRotating ? `rotate(${Date.now() * 0.001}rad)` : 'none'
          }}
        />
      ))}
    </div>
  );

  // Brush texture background
  const BrushTexture = () => (
    <div className="absolute inset-0 opacity-5">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--accent-1) / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, hsl(var(--accent-2) / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, hsl(var(--accent-3) / 0.1) 0%, transparent 50%)`,
          backgroundSize: '400px 400px, 600px 600px, 500px 500px',
          animation: isRotating ? 'spin 20s linear infinite' : 'none'
        }}
      />
    </div>
  );

  // Spiral connection lines
  const SpiralLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {seeds.map((seed, index) => {
        if (!positions[seed.id]) return null;
        
        const current = positions[seed.id];
        const nextSeed = seeds[index + 1];
        
        if (!nextSeed || !positions[nextSeed.id]) return null;
        
        const next = positions[nextSeed.id];
        
        // Create curved line following spiral
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        const controlX = midX + (next.radius - current.radius) * 0.3;
        const controlY = midY + (next.angle - current.angle) * 10;
        
        return (
          <path
            key={`${seed.id}-${nextSeed.id}`}
            d={`M ${current.x} ${current.y} Q ${controlX} ${controlY} ${next.x} ${next.y}`}
            stroke="hsl(var(--accent) / 0.4)"
            strokeWidth="1.5"
            fill="none"
            className="transition-opacity duration-500"
            style={{
              opacity: hoveredNode === seed.id || hoveredNode === nextSeed.id ? 0.8 : 0.4
            }}
          />
        );
      })}
    </svg>
  );

  // Seed node component
  const SeedNode: React.FC<{ seed: Seed; position: { x: number; y: number; angle: number; radius: number } }> = ({ 
    seed, 
    position 
  }) => {
    const isCenter = position.radius === 0;
    const isHovered = hoveredNode === seed.id;
    
    return (
      <div
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-organic",
          isRotating && "animate-shard-lift"
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.15)' : 'scale(1)'} ${isRotating ? `rotate(${position.angle}rad)` : ''}`,
          animationDelay: `${position.radius * 0.01}s`
        }}
        onMouseEnter={() => setHoveredNode(seed.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => {
          console.log('Open seed:', seed.id);
        }}
      >
        {/* Node circle with spiral glow */}
        <div
          className={cn(
            "relative rounded-full border-2 transition-all duration-300 ease-organic overflow-hidden",
            isCenter 
              ? "w-32 h-32 bg-gradient-to-br from-accent-1 to-accent-2 border-accent-1/50 shadow-lg"
              : "w-20 h-20 bg-card border-accent/40 hover:border-accent/70",
            isHovered && "shadow-accent/30 shadow-lg"
          )}
        >
          {/* Node image or content */}
          {seed.type === 'visual' ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/40 flex items-center justify-center">
              <div className={cn(
                "rounded-full bg-accent-1/20 flex items-center justify-center",
                isCenter ? "w-12 h-12" : "w-10 h-10"
              )}>
                <Eye className={cn("text-accent-1", isCenter ? "w-6 h-6" : "w-5 h-5")} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/40 flex items-center justify-center">
              <div className={cn(
                "rounded-full bg-accent-2/20 flex items-center justify-center",
                isCenter ? "w-12 h-12" : "w-10 h-10"
              )}>
                <span className={cn("font-medium text-accent-2", isCenter ? "text-sm" : "text-xs")}>T</span>
              </div>
            </div>
          )}
          
          {/* Spiral pulse effect */}
          {isHovered && (
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ink-ripple" />
          )}
          
          {/* Generation indicator */}
          {!isCenter && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-2/80 text-xs flex items-center justify-center text-white font-medium text-[11px]">
              {seed.generation}
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

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleRecenter = () => {
    setCenter({ x: 0, y: 0 });
    setZoom(0.4); // Start with extremely zoomed out view to show full spiral
  };

  // Toggle rotation
  const toggleRotation = () => setIsRotating(prev => !prev);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Paper grain texture */}
      <div className="absolute inset-0 opacity-[var(--paper-grain-opacity)] pointer-events-none" />
      
      {/* Brush texture */}
      <BrushTexture />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Spiral lines */}
      <SpiralLines />

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
            <Link to="/forklore/radial">
              <Button variant="ghost" size="sm">
                Radial
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-accent-1">
              Spiral
            </Button>
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

      {/* Title overlay */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="font-display text-2xl text-foreground/80 font-handwritten italic">
          "The Spiral of Inspiration"
        </h1>
      </div>

      {/* Main visualization */}
      <main 
        className="relative w-full h-screen flex items-center justify-center transition-transform duration-500 ease-organic"
        style={{ transform: `scale(${zoom}) translate(${center.x}px, ${center.y}px)` }}
      >
        <div ref={containerRef} className="relative w-full h-full">
          {/* Center node */}
          {centerSeed && positions[centerSeed.id] && (
            <SeedNode seed={centerSeed} position={positions[centerSeed.id]} />
          )}
          
          {/* Spiral nodes */}
          {seeds.map(seed => 
            positions[seed.id] && (
              <SeedNode key={seed.id} seed={seed} position={positions[seed.id]} />
            )
          )}
        </div>
      </main>

      {/* Floating toolbar */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/20 shadow-lg">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRecenter}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border/30 mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleRotation}
              className={cn(
                "h-8 px-3 text-xs",
                isRotating && "text-accent-1"
              )}
            >
              {isRotating ? 'Stop' : 'Rotate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Torn edge frame */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="w-full h-full border border-accent-1/20 rounded-lg opacity-30" />
      </div>

      {/* Right Sidebar Controls */}
      <div className="absolute top-16 right-4 z-20 rounded-lg p-4 space-y-3 dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)] bg-background/80 backdrop-blur-sm border border-border/20">
        {/* Navigation */}
        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Layout</label>
          <div className="flex gap-1">
            <Link to="/forklore/radial">
              <Button variant="ghost" size="sm" className="text-xs capitalize">
                Radial
              </Button>
            </Link>
            <Link to="/forklore/timeline">
              <Button variant="ghost" size="sm" className="text-xs capitalize">
                Timeline
              </Button>
            </Link>
            <Button variant="hero" size="sm" className="text-xs capitalize" style={{
              background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
              border: 'none',
              color: '#f2f2f2',
              boxShadow: '0 0 12px rgba(120,200,120,0.3)'
            }}>
              Spiral
            </Button>
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

export default SpiralView;
