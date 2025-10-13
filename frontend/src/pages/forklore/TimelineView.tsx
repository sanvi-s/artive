import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Eye, Clock } from 'lucide-react';
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

interface TimelineViewProps {
  seeds?: Seed[];
  centerSeed?: Seed;
}

type SortOption = 'newest' | 'oldest' | 'most-remixed';
type Orientation = 'horizontal' | 'vertical';

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
    title: "Timeline Poetry",
    author: "Maya D.",
    date: "2024-01-23",
    type: "text",
    generation: 3,
    parentId: "6",
    children: []
  },
  {
    id: "10",
    title: "Chronological Art",
    author: "David W.",
    date: "2024-01-24",
    type: "visual",
    generation: 4,
    parentId: "8",
    children: []
  },
  {
    id: "11",
    title: "Time Capsule",
    author: "Elena R.",
    date: "2024-01-25",
    type: "text",
    generation: 4,
    parentId: "9",
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

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  seeds = sampleSeeds, 
  centerSeed = sampleCenterSeed
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "visual" | "poems" | "music" | "code">("all");
  const [depth, setDepth] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sort seeds based on selected option
  const sortedSeeds = React.useMemo(() => {
    const allSeeds = centerSeed ? [centerSeed, ...seeds] : seeds;
    
    switch (sortBy) {
      case 'newest':
        return allSeeds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return allSeeds.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'most-remixed':
        return allSeeds.sort((a, b) => b.children.length - a.children.length);
      default:
        return allSeeds;
    }
  }, [seeds, centerSeed, sortBy]);

  // Generate timeline positions
  const generateTimelinePositions = (seeds: Seed[]) => {
    const positions: { [key: string]: { x: number; y: number; index: number } } = {};
    const spacing = orientation === 'horizontal' ? 200 : 150;
    const startOffset = orientation === 'horizontal' ? 100 : 100;
    
    seeds.forEach((seed, index) => {
      if (orientation === 'horizontal') {
        positions[seed.id] = { 
          x: startOffset + index * spacing, 
          y: 300 + Math.sin(index * 0.5) * 50, // Slight wave
          index 
        };
      } else {
        positions[seed.id] = { 
          x: 400 + Math.cos(index * 0.3) * 100, // Slight curve
          y: startOffset + index * spacing, 
          index 
        };
      }
    });

    return positions;
  };

  const positions = generateTimelinePositions(sortedSeeds);

  // Floating particles with timeline drift
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
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
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            transform: `translateX(${scrollOffset * 0.1}px) translateY(${scrollOffset * 0.05}px)`
          }}
        />
      ))}
    </div>
  );

  // Hand-drawn timeline line
  const TimelineLine = () => {
    if (sortedSeeds.length < 2) return null;

    const points = sortedSeeds.map(seed => positions[seed.id]).filter(Boolean);
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d={points.reduce((path, point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`;
            
            // Add slight hand-drawn wobble
            const wobbleX = Math.sin(index * 0.3) * 3;
            const wobbleY = Math.cos(index * 0.2) * 2;
            
            return `${path} L ${point.x + wobbleX} ${point.y + wobbleY}`;
          }, '')}
          stroke="hsl(var(--accent-1) / 0.6)"
          strokeWidth="2"
          fill="none"
          className="transition-all duration-1000 ease-organic"
          style={{
            strokeDasharray: '5,5',
            animation: 'brush-reveal 2s ease-out forwards'
          }}
        />
      </svg>
    );
  };

  // Connection lines for lineage paths
  const LineageConnections = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {sortedSeeds.map(seed => {
        if (!seed.parentId || !positions[seed.id] || !positions[seed.parentId]) return null;
        
        const start = positions[seed.parentId];
        const end = positions[seed.id];
        const isHighlighted = highlightedPath.includes(seed.id) || highlightedPath.includes(seed.parentId);
        
        return (
          <line
            key={`${seed.parentId}-${seed.id}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="hsl(var(--accent-2) / 0.4)"
            strokeWidth="1"
            strokeDasharray="3,3"
            className="transition-all duration-500"
            style={{
              opacity: isHighlighted ? 0.8 : 0.2,
              strokeWidth: isHighlighted ? '2' : '1'
            }}
          />
        );
      })}
    </svg>
  );

  // Date markers
  const DateMarkers = () => (
    <div className="absolute inset-0 pointer-events-none">
      {sortedSeeds.map((seed, index) => {
        const position = positions[seed.id];
        if (!position) return null;
        
        const date = new Date(seed.date);
        const isVisible = index % 3 === 0; // Show every 3rd date
        
        if (!isVisible) return null;
        
        return (
          <div
            key={`date-${seed.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: orientation === 'horizontal' ? position.x : position.x - 80,
              top: orientation === 'horizontal' ? position.y - 60 : position.y
            }}
          >
            <div className="bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border/20 text-xs text-muted-foreground font-serif">
              {date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Seed card component
  const SeedCard: React.FC<{ seed: Seed; position: { x: number; y: number; index: number } }> = ({ 
    seed, 
    position 
  }) => {
    const isHovered = hoveredNode === seed.id;
    const isHighlighted = highlightedPath.includes(seed.id);
    
    return (
      <div
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-organic animate-organic-fade-in",
          isHovered && "z-20"
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
          animationDelay: `${position.index * 0.1}s`
        }}
        onMouseEnter={() => {
          setHoveredNode(seed.id);
          // Highlight lineage path
          const path = [seed.id];
          let current = seed;
          while (current.parentId) {
            path.unshift(current.parentId);
            current = sortedSeeds.find(s => s.id === current.parentId) || current;
          }
          setHighlightedPath(path);
        }}
        onMouseLeave={() => {
          setHoveredNode(null);
          setHighlightedPath([]);
        }}
        onClick={() => {
          console.log('Open seed:', seed.id);
        }}
      >
        {/* Card */}
        <div
          className={cn(
            "relative bg-card/90 backdrop-blur-sm rounded-lg border transition-all duration-300 ease-organic shadow-lg",
            isHighlighted 
              ? "border-accent-1/60 shadow-accent-1/20" 
              : "border-border/30 hover:border-accent-1/40",
            isHovered && "shadow-lg"
          )}
          style={{
            width: orientation === 'horizontal' ? '180px' : '160px',
            minHeight: '100px'
          }}
        >
          {/* Card content */}
          <div className="p-3">
            <h3 className="font-display text-sm font-medium text-foreground mb-1 line-clamp-2">
              {seed.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">by {seed.author}</p>
            
            {/* Generation indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-accent-2">
                <Clock className="h-3 w-3" />
                Gen {seed.generation}
              </div>
              {seed.children.length > 0 && (
                <div className="text-xs text-accent-1">
                  {seed.children.length} forks
                </div>
              )}
            </div>
          </div>

          {/* Ripple effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-lg bg-accent-1/5 animate-ink-ripple" />
          )}
        </div>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border/20 shadow-lg text-sm whitespace-nowrap z-30">
            <div className="font-medium text-foreground">{seed.title}</div>
            <div className="text-muted-foreground text-xs">by {seed.author}</div>
            <div className="text-muted-foreground text-xs">{new Date(seed.date).toLocaleDateString()}</div>
          </div>
        )}
      </div>
    );
  };

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        setScrollOffset(rect.top);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Paper grain texture */}
      <div className="absolute inset-0 opacity-[var(--paper-grain-opacity)] pointer-events-none" />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Timeline line */}
      <TimelineLine />
      
      {/* Lineage connections */}
      <LineageConnections />
      
      {/* Date markers */}
      <DateMarkers />

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
            <Link to="/forklore/spiral">
              <Button variant="ghost" size="sm">
                Spiral
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-accent-1">
              Timeline
            </Button>
            <Link to="/forklore">
              <Button variant="ghost" size="sm">
                Tree
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filter dropdown */}
      <div className="absolute top-32 right-6 z-10">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-2 border border-border/20">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm text-foreground border-none outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-remixed">Most Remixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orientation toggle */}
      <div className="absolute top-32 right-32 z-10">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/20">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOrientation('horizontal')}
              className={cn(
                "h-7 px-2 text-xs",
                orientation === 'horizontal' && "text-accent-1"
              )}
            >
              →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOrientation('vertical')}
              className={cn(
                "h-7 px-2 text-xs",
                orientation === 'vertical' && "text-accent-1"
              )}
            >
              ↓
            </Button>
          </div>
        </div>
      </div>

      {/* Main visualization */}
      <main 
        ref={timelineRef}
        className="relative w-full h-screen flex items-center justify-center"
        style={{
          transform: `translateY(${scrollOffset * 0.1}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div ref={containerRef} className="relative w-full h-full overflow-visible">
          {/* Seed cards */}
          {sortedSeeds.map(seed => 
            positions[seed.id] && (
              <SeedCard key={seed.id} seed={seed} position={positions[seed.id]} />
            )
          )}
        </div>
      </main>

      {/* Background quote */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card/30 backdrop-blur-sm px-6 py-3 rounded-full border border-border/10">
          <p className="text-sm text-muted-foreground font-handwritten italic">
            "Time folds within unfinished dreams."
          </p>
        </div>
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
            <Button variant="hero" size="sm" className="text-xs capitalize" style={{
              background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
              border: 'none',
              color: '#f2f2f2',
              boxShadow: '0 0 12px rgba(120,200,120,0.3)'
            }}>
              Timeline
            </Button>
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

export default TimelineView;
