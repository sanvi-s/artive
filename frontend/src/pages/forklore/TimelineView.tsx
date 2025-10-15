import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Eye, Clock, Download, Layout, SlidersHorizontal, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { InkCursor } from '@/components/InkCursor';
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
  const hasAnimatedOnceRef = useRef<boolean>(false);

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
  const contentWidth = React.useMemo(() => {
    if (orientation !== 'horizontal') return 0;
    const xs = Object.values(positions).map((p) => p.x);
    return (xs.length ? Math.max(...xs) : 0) + 240; // padding at end
  }, [positions, orientation]);

  // Stats for footer card
  const timelineStats = React.useMemo(() => {
    const totalNodes = (centerSeed ? 1 : 0) + seeds.length;
    const originalSeeds = centerSeed ? 1 : 0;
    const totalForks = seeds.filter(s => (s.generation ?? 0) > 0).length;
    const maxDepth = Math.max(1, seeds.reduce((m, s) => Math.max(m, s.generation ?? 0), 0) + 1);
    const totalConnections = seeds.filter(s => !!s.parentId).length;
    return { totalNodes, originalSeeds, totalForks, maxDepth, totalConnections };
  }, [seeds, centerSeed]);

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
          stroke="rgba(139,69,19,0.7)"
          strokeWidth="2.4"
          fill="none"
          className="transition-all duration-1000 ease-organic"
          style={hasAnimatedOnceRef.current ? { strokeDasharray: '5,5' } : {
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
            stroke="rgba(139,69,19,0.5)"
            strokeWidth="1.2"
            strokeDasharray="3,3"
            className="transition-all duration-500"
            style={{
              opacity: isHighlighted ? 0.8 : 0.2,
              strokeWidth: isHighlighted ? '2' : '1.2'
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
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-organic",
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
            "relative rounded-lg border transition-all duration-300 ease-organic shadow-lg bg-[rgba(200,240,200,0.10)] backdrop-blur-sm",
            "dark:[background:rgba(60,60,65,0.75)] dark:[border:2px_solid_rgba(63,184,61,0.9)]",
            isHighlighted 
              ? "shadow-accent-1/20" 
              : "hover:border-accent-1/40",
            isHovered && "shadow-lg"
          )}
          style={{
            width: orientation === 'horizontal' ? '170px' : '150px',
            minHeight: '96px',
            borderColor: 'rgba(63,184,61,0.9)',
            borderWidth: 2
          }}
        >
          {/* Card content */}
          <div className="p-3">
            <h3 className="font-display text-sm font-medium text-foreground dark:text-white mb-1 line-clamp-2">
              {seed.title}
            </h3>
            <p className="text-xs text-muted-foreground dark:text-[#e6f6e6] mb-2">by {seed.author}</p>
            
            {/* Generation indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-[rgb(46,125,50)] dark:text-[#e6f6e6]">
                <Clock className="h-3 w-3" />
                Gen {seed.generation}
              </div>
              {seed.children.length > 0 && (
                <div className="text-xs text-[rgb(27,94,32)] dark:text-[#d4f2d4]">
                  {seed.children.length} forks
                </div>
              )}
            </div>
          </div>

          {/* Ripple effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-lg" style={{ background: 'rgba(255,255,255,0.12)' }} />
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

  // Ensure one-time animations only run on first mount
  useEffect(() => {
    // Mark animations as completed after initial paint
    const id = window.requestAnimationFrame(() => {
      hasAnimatedOnceRef.current = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Parallax scroll effect (throttled with rAF)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        try {
          if (timelineRef.current) {
            const rect = (timelineRef.current as HTMLDivElement).getBoundingClientRect();
            setScrollOffset(rect.top);
          }
        } catch {}
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll as EventListener, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('scroll', handleScroll as EventListener);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Page frame - match LineageTree */}
      <div className="pointer-events-none fixed top-2 left-2 z-10 rounded-lg" style={{ 
        borderTop: "1px solid hsl(var(--border))", 
        borderLeft: "1px solid hsl(var(--border))",
        width: "calc(100% - 1rem)",
        height: "calc(100% - 1rem)"
      }} />

      {/* Tagline: FORKLORE — left-aligned, same as LineageTree */}
      <div className="absolute left-4" style={{ top: 'calc(4rem + 8px)', zIndex: 20, maxWidth: 560 }}>
        <div className="px-2 py-1 flex flex-col items-start text-left gap-2">
          <h1 className="font-display text-xl tracking-tight dark:text-white">forklore.</h1>
          <div className="font-display text-[1rem]" style={{ color: '#b35e78' }}>
            your seed, their forklore.
          </div>
        </div>
      </div>

      {/* Lineage Graph Area */}
      <div className="flex-1 relative overflow-hidden pt-8">
        {/* Light mode subtle radial background */}
        <div className="pointer-events-none absolute inset-0 block dark:hidden" style={{
          background: 'radial-gradient(800px 500px at 50% 30%, rgba(255,240,242,0.55), transparent 70%)',
          zIndex: 0
        }} />
        {/* Dark-mode background gradient + noise + radial focus */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{
          background: 'linear-gradient(180deg, #4a4a4f 0%, #5a5a5f 100%)',
          zIndex: 0
        }} />
        <div className="pointer-events-none absolute inset-0 hidden dark:block mix-blend-soft-light" style={{
          backgroundImage: `url(/assets/textures/paper-grain-1.png)`,
          backgroundSize: '320px auto',
          opacity: 0.08,
          zIndex: 0
        }} />
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{
          background: 'radial-gradient(700px 420px at 50% 28%, rgba(143,188,143,0.06), transparent 70%)',
          zIndex: 0
        }} />
        {/* Ambient particles (dark only) */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ zIndex: 0 }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${(i*37)%100}%`,
              top: `${(i*19)%100}%`,
              width: 1.5,
              height: 1.5,
              background: 'rgba(143, 188, 143, 0.2)',
              filter: 'blur(0.8px)',
              animation: `float${i%3} 12s ease-in-out ${i}s infinite`
            }} />
          ))}
        </div>
      </div>
      {/* Top Controls (match tree) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-2 rounded-lg shadow-paper dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)] bg-background/80 backdrop-blur-sm border border-border/20">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <Layout className="h-5 w-5" />
          <span className="sr-only">Layout Options</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
          <span className="sr-only">Filter</span>
        </Button>
        <Button variant="ghost" size="icon">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="sr-only">Depth Slider</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Undo2 className="h-5 w-5" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Redo2 className="h-5 w-5" />
          <span className="sr-only">Redo</span>
        </Button>
      </div>

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

      {/* Main visualization - horizontally scrollable when wide */}
      <div
        ref={timelineRef}
        className="relative w-full h-screen overflow-x-auto overflow-y-hidden"
        style={{
          transform: Math.abs(scrollOffset) > 1 ? `translateY(${scrollOffset * 0.1}px)` : undefined,
          transition: 'transform 0.1s ease-out',
          zIndex: 1
        }}
      >
        <div className="relative h-full" style={{ width: orientation === 'horizontal' ? `${contentWidth}px` : '100%' }}>
          {/* Ambient particles (dark only) */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ zIndex: 0 }}>
            {[...Array(15)].map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                left: `${(i*37)%100}%`,
                top: `${(i*19)%100}%`,
                width: 1.5,
                height: 1.5,
                background: 'rgba(143, 188, 143, 0.2)',
                filter: 'blur(0.8px)',
                animation: `float${i%3} 12s ease-in-out ${i}s infinite`
              }} />
            ))}
          </div>
          {/* Floating particles */}
          <FloatingParticles />
          
          {/* Timeline line */}
          <TimelineLine />
          
          {/* Lineage connections */}
          <LineageConnections />
          
          {/* Date markers */}
          <DateMarkers />

          <div ref={containerRef} className="relative w-full h-full overflow-visible">
            {/* Seed cards */}
            {sortedSeeds.map(seed => 
              positions[seed.id] && (
                <SeedCard key={seed.id} seed={seed} position={positions[seed.id]} />
              )
            )}
          </div>
        </div>
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
              Timeline
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

      {/* Timeline Statistics */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="bg-card/90 backdrop-blur-paper rounded-lg p-4 shadow-paper dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)]">
          <h3 className="text-sm font-semibold mb-2 text-foreground dark:[color:#f2f2f2]">Timeline Statistics</h3>
          <div className="space-y-1 text-xs text-muted-foreground dark:[color:#aaa5b5]">
            <div>Total Nodes: {timelineStats.totalNodes}</div>
            <div>Original Seeds: {timelineStats.originalSeeds}</div>
            <div>Total Forks: {timelineStats.totalForks}</div>
            <div>Max Depth: {timelineStats.maxDepth} levels</div>
            <div>Total Connections: {timelineStats.totalConnections}</div>
          </div>
        </div>
      </div>

      {/* Download Timeline */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          variant="hero"
          size="sm"
          style={{
            background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
            border: 'none',
            color: '#f2f2f2',
            boxShadow: '0 0 12px rgba(120,200,120,0.3)'
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Timeline
        </Button>
      </div>
    </div>
  );
};

export default TimelineView;
