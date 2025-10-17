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
import { SeedViewModal } from '@/components/SeedViewModal';

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
  const [selectedSeed, setSelectedSeed] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug modal state
  console.log('Modal state:', { selectedSeed, isModalOpen });

  // Handle seed click to open modal
  const handleSeedClick = (seed: Seed) => {
    console.log('Seed clicked:', seed);
    console.log('Original date:', seed.date);
    console.log('Parsed date:', new Date(seed.date));
    // Convert to proper seed format for the modal
    const modalSeed = {
      id: seed.id,
      title: seed.title,
      author: seed.author,
      time: new Date(seed.date).toISOString(),
      forks: (seed as any).forks || 0,
      sparks: 0,
      category: 'timeline',
      tags: [],
      type: seed.type,
      content: (seed as any).content || '',
      excerpt: (seed as any).content?.slice(0, 100) || '',
      image: (seed as any).image || '',
      isForked: seed.generation > 0,
      parentId: seed.parentId
    };
    console.log('Modal seed:', modalSeed);
    setSelectedSeed(modalSeed);
    setIsModalOpen(true);
    console.log('Modal should be open now');
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSeed(null);
  };

  // Handle fork action
  const handleFork = (seedId: string) => {
    // You can implement fork logic here or redirect to fork page
    console.log('Fork seed:', seedId);
    toast({
      title: "Fork Seed",
      description: "Redirecting to fork page...",
    });
  };

  // Get current seeds and center seed based on mode
  const currentSeeds = React.useMemo(() => {
    return mode === "demo" ? seeds : realSeeds;
  }, [mode, seeds, realSeeds]);

  const currentCenterSeed = React.useMemo(() => {
    return mode === "demo" ? centerSeed : realCenterSeed;
  }, [mode, centerSeed, realCenterSeed]);

  // Sort seeds based on selected option
  const sortedSeeds = React.useMemo(() => {
    // Filter out the center seed from currentSeeds to avoid duplicates
    const filteredCurrentSeeds = currentCenterSeed 
      ? currentSeeds.filter(seed => seed.id !== currentCenterSeed.id)
      : currentSeeds;
    const allSeeds = currentCenterSeed ? [currentCenterSeed, ...filteredCurrentSeeds] : filteredCurrentSeeds;
    
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
          // Add a small delay to allow clicking on the card
          setTimeout(() => {
            setHoveredNode(null);
            setHighlightedPath([]);
          }, 100);
        }}
        onClick={() => {
          console.log('Timeline node clicked:', seed.id);
          handleSeedClick(seed);
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
        const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  console.error('❌ VITE_API_URL not configured in environment variables');
}
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
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  console.error('❌ VITE_API_URL not configured in environment variables');
}
      const token = localStorage.getItem("token");
      
      console.log('Fetching lineage data for ID:', seedId);
      
      // Try to fetch as seed or fork using the unified endpoint
      let seedOrForkRes = await fetch(`${apiBase}/api/seeds/${seedId}/details`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      let seedData = null;
      let forkData = null;
      let isFork = false;
      
      if (seedOrForkRes.ok) {
        const data = await seedOrForkRes.json();
        if (data.type === 'seed') {
          seedData = data;
          console.log('Found as seed:', seedData);
        } else if (data.type === 'fork') {
          forkData = data;
          isFork = true;
          console.log('Found as fork:', forkData);
        }
      } else {
        console.log('Not found as seed or fork');
      }
      
      // Fetch the lineage data
      const res = await fetch(`${apiBase}/api/lineage/${seedId}?depth=3`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Lineage data received:', data);
        setLineageData(data);
        buildRealTimeline(data, seedId);
      } else {
        const errorText = await res.text();
        console.error('Lineage fetch failed:', res.status, errorText);
        toast({
          title: "Error",
          description: `Failed to fetch lineage data: ${res.status === 404 ? 'Seed/Fork not found' : 'Access denied'}`,
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
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  console.error('❌ VITE_API_URL not configured in environment variables');
}
      const token = localStorage.getItem("token");
      
      console.log('Building timeline with lineage data:', lineageData);
      console.log('Lineage nodes:', lineageData.nodes);
      console.log('Lineage edges:', lineageData.edges);
      
      // Calculate proper generations for all nodes
      const calculateGeneration = (nodeId: string, visited = new Set<string>()): number => {
        if (visited.has(nodeId)) return 0; // Prevent infinite loops
        visited.add(nodeId);
        
        const edge = lineageData.edges.find(e => e.child === nodeId);
        if (!edge) return 0; // Root node
        
        // Recursively calculate parent's generation and add 1
        return calculateGeneration(edge.parent, visited) + 1;
      };

      // Build timeline items from all nodes in lineage (no duplicates)
      const allSeeds: Seed[] = [];
      
      for (const nodeId of lineageData.nodes) {
        console.log('Fetching details for timeline node:', nodeId);
        
        // Use the unified endpoint to fetch as seed or fork
        const res = await fetch(`${apiBase}/api/seeds/${nodeId}/details`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Timeline node details fetched:', data);
          
          let seedData = null;
          if (data.type === 'seed') {
            seedData = data.seed;
          } else if (data.type === 'fork') {
            // Convert fork to seed format for timeline
            const fork = data.fork;
            const originalContent = fork.parentSeed?.contentFull || fork.parentSeed?.contentSnippet || '';
            const forkContent = fork.contentDelta || fork.summary || '';
            const combinedContent = originalContent && forkContent
              ? `${originalContent}\n${forkContent}`
              : (forkContent || originalContent);
            
            seedData = {
              _id: fork._id,
              title: fork.summary || 'Fork',
              contentFull: combinedContent,
              contentSnippet: fork.summary || '',
              content: combinedContent,
              type: (fork.imageUrl || fork.thumbnailUrl) ? 'visual' : 'text',
              author: fork.author,
              createdAt: fork.createdAt,
              thumbnailUrl: fork.thumbnailUrl || fork.imageUrl,
              image: fork.imageUrl || fork.thumbnailUrl,
              forkCount: fork.forkCount || 0
            };
          }
          
          if (seedData) {
            // Calculate proper generation based on lineage depth
            const generation = calculateGeneration(seedData._id);
            console.log(`Timeline node ${seedData._id} (${seedData.title}) has generation ${generation}`);
            
            const timelineSeed = {
              id: seedData._id,
              title: seedData.title,
              author: seedData.author?.displayName || seedData.author?.username || 'Unknown',
              date: new Date(seedData.createdAt).toISOString().split('T')[0],
              createdAt: seedData.createdAt,
              type: seedData.type === 'poem' ? 'text' : 'visual',
              generation: generation,
              parentId: lineageData.edges.find(e => e.child === seedData._id)?.parent,
              content: seedData.contentFull || seedData.contentSnippet || seedData.content || '',
              contentSnippet: (seedData.contentFull || seedData.contentSnippet || '').slice(0, 200),
              image: seedData.thumbnailUrl,
              thumbnailUrl: seedData.thumbnailUrl,
              forks: seedData.forkCount || 0,
              children: []
            } as any;
            
            allSeeds.push(timelineSeed);
            
            // Set the root seed if this is the root
            if (seedData._id === rootSeedId) {
              setRealCenterSeed(timelineSeed);
            }
          }
        } else {
          console.warn('Failed to fetch timeline node details for:', nodeId, res.status);
        }
      }
      
      console.log('Built timeline seeds:', allSeeds);
      setRealSeeds(allSeeds);
      
      // Log the timeline data for debugging
      const timelineData = allSeeds.filter(Boolean).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      console.log('Timeline data:', timelineData);
    } catch (error) {
      console.error('Failed to build real timeline:', error);
    }
  };

  // Auto-load lineage data when selectedSeedId changes
  useEffect(() => {
    console.log('SelectedSeedId changed:', selectedSeedId);
    console.log('Current mode:', mode);
    if (selectedSeedId) {
      // Ensure we're in real mode when a seed is selected
      if (mode !== "real") {
        console.log('Switching to real mode for selected seed');
        setMode("real");
      }
      console.log('Fetching lineage data for seed:', selectedSeedId);
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
                className="fixed z-50"
                style={{
                  left: `${finalLeft + 20}px`, // Move 20px closer to the timeline
                  top: `${position.y}px`,
                  transform: `translateY(-50%)`
                }}
                onMouseEnter={() => {
                  // Keep the card visible when hovering over it
                  setHoveredNode(seed.id);
                }}
                onMouseLeave={() => {
                  // Don't hide immediately when leaving the card
                  setTimeout(() => {
                    setHoveredNode(null);
                  }, 200);
                }}
              >
                <div className="w-96 max-h-[500px]">
                <div 
                  className="relative group cursor-pointer bg-amber-50 dark:bg-orange-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 dark:border-orange-800 overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Card clicked!');
                    handleSeedClick(seed);
                  }}
                >
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
                        <div className="relative overflow-hidden">
                          <img
                            src={(seed as any).image || (seed as any).thumbnailUrl || `https://via.placeholder.com/320x400/E8C9B0/1E1B18?text=${seed.title.charAt(0)}`}
                            alt={seed.title}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/320x400/E8C9B0/1E1B18?text=${seed.title.charAt(0)}`;
                            }}
                          />
                          
                          {/* Title overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                            <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2 drop-shadow-lg">
                              {seed.title}
                            </h3>
                            <p className="text-white/90 text-sm line-clamp-1">
                              by {seed.author}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Text Seed - Content */
                        <div className="p-6 space-y-4">
                          <h3 className="font-semibold text-lg leading-tight text-amber-900 dark:text-orange-100">
                            {seed.title}
                          </h3>
                          <div className="prose prose-sm max-w-none text-amber-700 dark:text-orange-200">
                            <p className="line-clamp-4 leading-relaxed whitespace-pre-wrap">
                              {(seed as any).content || 'No content available'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-6 pb-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-amber-600 dark:text-orange-300">
                          <span className="font-medium">{seed.author}</span>
                          <span>{new Date(seed.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {(seed as any).forks > 0 && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-orange-400">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="8" cy="6" r="2" fill="currentColor"/>
                                <circle cx="16" cy="6" r="2" fill="currentColor"/>
                                <circle cx="12" cy="18" r="2" fill="currentColor"/>
                                <path d="M8 8L12 16M16 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              {(seed as any).forks}
                            </span>
                          )}
                          {seed.generation !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-orange-900/30 dark:text-orange-200">
                              {seed.generation === 0 ? 'Original' : `Gen ${seed.generation}`}
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-amber-200 dark:border-orange-700 hover:bg-amber-100 dark:hover:bg-orange-800/30"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFork(seed.id);
                            }}
                          >
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="8" cy="6" r="2" fill="currentColor"/>
                              <circle cx="16" cy="6" r="2" fill="currentColor"/>
                              <circle cx="12" cy="18" r="2" fill="currentColor"/>
                              <path d="M8 8L12 16M16 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Fork
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-amber-200 dark:border-orange-700 hover:bg-amber-100 dark:hover:bg-orange-800/30"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSeedClick(seed);
                            }}
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Button>
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

      {/* Seed View Modal */}
      <SeedViewModal
        seed={selectedSeed}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onFork={handleFork}
      />
    </div>
  );
};

export default TimelineView;
