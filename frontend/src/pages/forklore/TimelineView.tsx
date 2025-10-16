import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock, Download, Layout, Undo2, Redo2, Play, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { InkCursor } from '@/components/InkCursor';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForklore } from '@/contexts/ForkloreContext';

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

interface UserSeed {
  _id: string;
  title: string;
  contentSnippet?: string;
  type: string;
  author: string;
  forkCount: number;
  thumbnailUrl?: string;
  createdAt: string;
}

interface LineageData {
  nodes: string[];
  edges: Array<{ parent: string; child: string }>;
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
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasAnimatedOnceRef = useRef<boolean>(false);

  // New state for real data functionality
  const [mode, setMode] = useState<"demo" | "real">("real");
  const [userSeeds, setUserSeeds] = useState<UserSeed[]>([]);
  const { selectedSeedId, setSelectedSeedId } = useForklore();
  const [lineageData, setLineageData] = useState<LineageData | null>(null);
  const [realSeeds, setRealSeeds] = useState<Seed[]>([]);
  const [realCenterSeed, setRealCenterSeed] = useState<Seed | null>(null);
  const [loading, setLoading] = useState(false);

  // Get current seeds and center seed based on mode
  const currentSeeds = React.useMemo(() => {
    return mode === "demo" ? seeds : realSeeds;
  }, [mode, seeds, realSeeds]);

  const currentCenterSeed = React.useMemo(() => {
    return mode === "demo" ? centerSeed : realCenterSeed;
  }, [mode, centerSeed, realCenterSeed]);

  // Sort seeds based on selected option
  const sortedSeeds = React.useMemo(() => {
    const allSeeds = currentCenterSeed ? [currentCenterSeed, ...currentSeeds] : currentSeeds;
    
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
  }, [currentSeeds, currentCenterSeed, sortBy]);

  // Generate timeline positions
  const generateTimelinePositions = (seeds: Seed[]) => {
    const positions: { [key: string]: { x: number; y: number; index: number } } = {};
    const spacing = orientation === 'horizontal' ? 250 : 150;
    const startOffset = orientation === 'horizontal' ? 150 : 100;
    
    // Sort seeds by date (oldest first, newest last) - LEFT to RIGHT
    const sortedSeeds = [...seeds].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Oldest to newest (left to right)
    });
    
    sortedSeeds.forEach((seed, index) => {
      if (orientation === 'horizontal') {
        // Position chronologically from left (oldest) to right (newest)
        positions[seed.id] = { 
          x: startOffset + index * spacing, 
          y: 300 + Math.sin(index * 0.3) * 40, // Slight wave for visual interest
          index: index
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

  // Sort seeds chronologically for timeline display
  const chronologicallySortedSeeds = React.useMemo(() => {
    const sorted = [...sortedSeeds].sort((a, b) => {
      // Use createdAt if available (more precise), otherwise fall back to date
      const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : new Date(a.date).getTime();
      const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : new Date(b.date).getTime();
      return timeA - timeB; // Oldest to newest (left to right)
    });
    
    // Debug logging to see the chronological order
    console.log('Timeline chronological order:', sorted.map(s => ({
      id: s.id,
      title: s.title,
      date: s.date,
      createdAt: (s as any).createdAt,
      generation: s.generation
    })));
    
    return sorted;
  }, [sortedSeeds]);

  const positions = generateTimelinePositions(chronologicallySortedSeeds);
  const contentWidth = React.useMemo(() => {
    if (orientation !== 'horizontal') return 0;
    const xs = Object.values(positions).map((p) => p.x);
    return (xs.length ? Math.max(...xs) : 0) + 240; // padding at end
  }, [positions, orientation]);

  // Stats for footer card
  const timelineStats = React.useMemo(() => {
    const totalNodes = (currentCenterSeed ? 1 : 0) + currentSeeds.length;
    const originalSeeds = currentCenterSeed ? 1 : 0;
    const totalForks = currentSeeds.filter(s => (s.generation ?? 0) > 0).length;
    const maxDepth = Math.max(1, currentSeeds.reduce((m, s) => Math.max(m, s.generation ?? 0), 0) + 1);
    const totalConnections = currentSeeds.filter(s => !!s.parentId).length;
    return { totalNodes, originalSeeds, totalForks, maxDepth, totalConnections };
  }, [currentSeeds, currentCenterSeed]);

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

  // Hand-drawn timeline line - connects all seeds in sequence
  const TimelineLine = React.useMemo(() => {
    if (chronologicallySortedSeeds.length < 2) return null;

    const points = chronologicallySortedSeeds.map(seed => positions[seed.id]).filter(Boolean);
    
    return (
      <svg key="timeline-line" className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          key="timeline-path"
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
          style={{ strokeDasharray: '5,5' }}
        />
      </svg>

    );
  }, [sortedSeeds, positions]);

  // Connection lines for lineage paths
 

  // Date markers
  const DateMarkers = () => (
    <div className="absolute inset-0 pointer-events-none">
      {chronologicallySortedSeeds.map((seed, index) => {
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
          transform: `translate(-50%, -50%) scale(1)`, // Remove hover scaling animation
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

      </div>

    );
  };

  // Fetch user seeds when authenticated
  useEffect(() => {
    const fetchUserSeeds = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("token");
        
        if (!token) return;

        // Fetch user's seeds using the actual user ID
        const seedsRes = await fetch(`${apiBase}/api/seeds?author=${encodeURIComponent(user.id)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (seedsRes.ok) {
          const seedsData = await seedsRes.json();
          setUserSeeds(seedsData.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch user seeds:', error);
      }
    };

    fetchUserSeeds();
  }, [isAuthenticated, user]);

  // Fetch lineage data when seed is selected
  const fetchLineageData = async (seedId: string) => {
    if (!seedId) return;
    
    setLoading(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${apiBase}/api/lineage/${seedId}?depth=3`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLineageData(data);
        buildRealTimeline(data, seedId);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch lineage data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch lineage data:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch lineage data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Build real timeline from lineage data
  const buildRealTimeline = async (lineageData: LineageData, rootSeedId: string) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      
      // Fetch details for all nodes including their forks
      const nodeDetails = await Promise.all(
        lineageData.nodes.map(async (nodeId) => {
          const res = await fetch(`${apiBase}/api/seeds/${nodeId}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          if (res.ok) {
            const data = await res.json();
            // The API returns { seed, forks }, so we need both
            return { seed: data.seed, forks: data.forks || [] };
          }
          return null;
        })
      );

      // Filter out failed requests and build seeds
      const validNodeDetails = nodeDetails.filter(Boolean);
      const rootNodeDetail = validNodeDetails.find(nodeDetail => nodeDetail.seed._id === rootSeedId);
      
      if (rootNodeDetail) {
        const rootSeed = rootNodeDetail.seed;
        setRealCenterSeed({
          id: rootSeed._id,
          title: rootSeed.title,
          author: rootSeed.author?.displayName || rootSeed.author?.username || 'Unknown',
          date: new Date(rootSeed.createdAt).toISOString().split('T')[0],
          type: rootSeed.type === 'poem' ? 'text' : 'visual',
          generation: 0,
          children: [],
          // Add image and content for hover preview
          image: rootSeed.thumbnailUrl,
          content: rootSeed.contentSnippet || rootSeed.contentFull
        } as any);
      }

      // Build other seeds including forks
      const otherSeeds: Seed[] = [];
      
      validNodeDetails.forEach((nodeDetail) => {
        const seed = nodeDetail.seed;
        if (seed._id !== rootSeedId) {
          // Find parent from edges
          const edge = lineageData.edges.find(e => e.child === seed._id);
          const generation = edge ? 1 : 0; // Simplified generation calculation
          
          otherSeeds.push({
            id: seed._id,
            title: seed.title,
            author: seed.author?.displayName || seed.author?.username || 'Unknown',
            date: new Date(seed.createdAt).toISOString().split('T')[0],
            createdAt: seed.createdAt, // Add full timestamp for proper sorting
            type: seed.type === 'poem' ? 'text' : 'visual',
            generation: generation,
            parentId: edge?.parent,
            // Add content for hover preview
            content: seed.contentFull || seed.contentSnippet || '',
            children: []
          } as any);
        }

        // Add forks as separate timeline items
        nodeDetail.forks.forEach((fork: any) => {
          const originalContent = seed.contentFull || seed.contentSnippet || '';
          const forkContent = fork.contentDelta || fork.summary || '';
          const combinedContent = originalContent && forkContent
            ? `${originalContent}\n${forkContent}`
            : (forkContent || originalContent);
          
            
          otherSeeds.push({
            id: fork._id,
            title: fork.summary || 'Fork',
            author: fork.author?.displayName || fork.author?.username || 'Anonymous',
            date: new Date(fork.createdAt).toISOString().split('T')[0],
            createdAt: fork.createdAt, // Add full timestamp for proper sorting
            type: fork.type === 'poem' ? 'text' : 'visual',
            generation: 1, // Forks are always generation 1
            parentId: fork.parentSeed?._id || seed._id,
            // Add content for hover preview - combined original and fork content
            content: combinedContent,
            contentSnippet: combinedContent.slice(0, 200),
            // Add image for visual forks
            image: fork.thumbnailUrl || fork.imageUrl,
            thumbnailUrl: fork.thumbnailUrl || fork.imageUrl,
            children: []
          } as any);
        });
      });

      setRealSeeds(otherSeeds);
    } catch (error) {
      console.error('Failed to build real timeline:', error);
    }
  };

  // Auto-load lineage data when selectedSeedId changes
  useEffect(() => {
    if (selectedSeedId && mode === "real") {
      fetchLineageData(selectedSeedId);
    }
  }, [selectedSeedId, mode]);

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
          {mode === "real" && (
            <div className="text-xs text-muted-foreground mt-2 max-w-md">
              {selectedSeedId ? (
                <span>Showing timeline for your selected seed. Hover over nodes to see connections.</span>
              ) : (
                <span>Select "Real" mode and choose one of your seeds to see its actual timeline.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lineage Graph Area */}
      <div className="flex-1 relative overflow-visible pt-8">
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
          <Undo2 className="h-5 w-5" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Redo2 className="h-5 w-5" />
          <span className="sr-only">Redo</span>
        </Button>
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
          {TimelineLine}
          
          {/* Date markers */}
          <DateMarkers />

          <div ref={containerRef} className="relative w-full h-full overflow-visible">
            {/* Seed cards */}
            {chronologicallySortedSeeds.map(seed => 
              positions[seed.id] && (
                <SeedCard key={seed.id} seed={seed} position={positions[seed.id]} />
              )
            )}
          </div>

          {/* Hover Seed Preview with Complete Details */}
          {hoveredNode && (() => {
            const seed = chronologicallySortedSeeds.find(s => s.id === hoveredNode);
            if (!seed || !positions[seed.id]) return null;
            const position = positions[seed.id];
            
            // Determine if seed is on left or right side of screen
            const isOnLeftSide = position.x < window.innerWidth / 2;
            const previewWidth = 384; // w-96 = 384px
            
            // Position closer to the leaf but not overlapping
            let finalLeft;
            if (isOnLeftSide) {
              // Show to the right of the leaf, closer
              finalLeft = position.x + 80;
              // If it would go off screen, move it left
              if (finalLeft + previewWidth > window.innerWidth - 20) {
                finalLeft = window.innerWidth - previewWidth - 20;
              }
            } else {
              // Show to the left of the leaf, closer
              finalLeft = position.x - previewWidth - 80;
              // If it would go off screen, move it right
              if (finalLeft < 20) {
                finalLeft = 20;
              }
            }
            
            return (
              <div 
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${finalLeft}px`,
                  top: `${position.y}px`,
                  transform: `translateY(-50%)`
                }}
              >
                <div className="w-96 max-h-[500px]">
                <div className="relative group cursor-pointer bg-gradient-to-br from-amber-100 to-amber-200 dark:from-transparent dark:to-transparent transition-all duration-hover ease-organic animate-organic-fade-in h-fit torn_container torn_left torn_right" style={{
                    '--torn-background-color': '#fef3c7',
                    '--torn-shadow-background-color': 'transparent',
                    '--torn-left-width': '10px',
                    '--torn-right-width': '10px'
                  } as any}>
                    <div></div>
                    <div className="relative">
                      {/* Type icon indicator */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="w-8 h-8 rounded-full bg-accent-1/10 backdrop-blur-sm flex items-center justify-center border border-accent-1/20">
                          <span className="text-accent-1">
                            {seed.type === 'visual' ? '📷' : '📝'}
                          </span>
                        </div>
                      </div>
                      
                      {seed.type === 'visual' ? (
                        /* Visual Seed - Image */
                        <div className="relative overflow-hidden" style={{ aspectRatio: 'auto' }}>
                          <img
                            src={(seed as any).image || (seed as any).thumbnailUrl || `https://via.placeholder.com/320x400/E8C9B0/1E1B18?text=${seed.title.charAt(0)}`}
                            alt={seed.title}
                            className="w-full h-auto max-h-[300px] object-cover transition-transform duration-long ease-organic"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/320x400/E8C9B0/1E1B18?text=${seed.title.charAt(0)}`;
                            }}
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              const aspectRatio = img.naturalWidth / img.naturalHeight;
                              if (aspectRatio > 1) {
                                img.style.aspectRatio = '16/9';
                              } else {
                                img.style.aspectRatio = '4/5';
                              }
                            }}
                          />
                          
                          {/* Title overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                            <div className="transform translate-y-0 transition-transform duration-300">
                              <h3 className="font-display font-semibold text-white text-lg mb-1 line-clamp-2">
                                {seed.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Text Seed - Content */
                        <div className="p-6 space-y-4 bg-transparent">
                          <h3 className="font-display font-semibold text-lg leading-tight text-foreground">
                            {seed.title}
                          </h3>
                          <div className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="line-clamp-4 leading-relaxed whitespace-pre-wrap">
                              {(seed as any).content || 'No content available'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-handwritten">{seed.author}</span>
                          <span>{new Date(seed.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {(seed as any).forks > 0 && (
                            <span className="flex items-center gap-1 text-accent-2">
                              <span className="text-accent-2">🍴</span>
                              {(seed as any).forks}
                            </span>
                          )}
                          {seed.generation !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300">
                              {seed.generation === 0 ? 'Original' : `Gen ${seed.generation}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Right Sidebar Controls */}
      <div className="absolute top-16 right-4 z-20 rounded-lg p-4 space-y-3 dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)] bg-background/80 backdrop-blur-sm border border-border/20 w-64 min-h-[400px]">
        {/* Mode Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Mode</label>
          <div className="flex gap-1">
            <Button
              variant={mode === "demo" ? "hero" : "ghost"}
              size="sm"
              onClick={() => setMode("demo")}
              className="text-xs flex items-center gap-1"
              style={mode === "demo" ? {
                background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
                border: 'none',
                color: '#f2f2f2',
                boxShadow: '0 0 12px rgba(120,200,120,0.3)'
              } : {}}
            >
              <Play className="h-3 w-3" />
              Demo
            </Button>
            <Button
              variant={mode === "real" ? "hero" : "ghost"}
              size="sm"
              onClick={() => setMode("real")}
              className="text-xs flex items-center gap-1"
              style={mode === "real" ? {
                background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
                border: 'none',
                color: '#f2f2f2',
                boxShadow: '0 0 12px rgba(120,200,120,0.3)'
              } : {}}
            >
              <Database className="h-3 w-3" />
              Real
            </Button>
          </div>
        </div>

        {/* Seed Selection (only in real mode) */}
        {mode === "real" && (
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Select Your Seed</label>
            {userSeeds.length > 0 ? (
              <select
                value={selectedSeedId}
                onChange={(e) => {
                  setSelectedSeedId(e.target.value);
                  if (e.target.value) {
                    fetchLineageData(e.target.value);
                  }
                }}
                className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs dark:[background:rgba(60,60,65,0.8)] dark:[border:1px_solid_rgba(255,255,255,0.15)] dark:[color:#f3d9ea]"
                disabled={loading}
              >
                <option value="">Choose a seed...</option>
                {userSeeds.map((seed) => (
                  <option key={seed._id} value={seed._id}>
                    {seed.title} ({seed.forkCount} forks)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-muted-foreground p-2 border border-border rounded-md">
                {isAuthenticated ? "No seeds found. Create some seeds first!" : "Please log in to see your seeds."}
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                Loading timeline...
              </div>
            )}
          </div>
        )}

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
            <div>Mode: {mode === "demo" ? "Demo Data" : "Real Data"}</div>
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
