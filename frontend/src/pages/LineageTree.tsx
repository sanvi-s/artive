import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { ArrowLeft, Layout, Download, Undo2, Redo2, Play, Database, RefreshCw } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForklore } from "@/contexts/ForkloreContext";
import { SeedViewModal } from "@/components/SeedViewModal";

interface Node {
  id: string;
  title: string;
  author: string;
  image: string;
  x: number;
  y: number;
  forks: number;
  date: string;
  type: "original" | "fork";
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

const sampleNodes: Node[] = [
  // Original seed (root) - at the top
  {
    id: "1",
    title: "Unfinished Watercolor Dreams",
    author: "Priya K.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=P",
    x: 500,
    y: 100,
    forks: 12,
    date: "2024-01-15",
    type: "original"
  },
  // First level forks (3 forks from original) - below root
  {
    id: "2",
    title: "Color Studies",
    author: "Ahmed M.",
    image: "https://via.placeholder.com/80x80/A3B9A5/1E1B18?text=A",
    x: 300,
    y: 180,
    forks: 5,
    date: "2024-01-16",
    type: "fork"
  },
  {
    id: "3",
    title: "Dreams in Motion",
    author: "Meera S.",
    image: "https://via.placeholder.com/80x80/D4C3DE/1E1B18?text=M",
    x: 500,
    y: 180,
    forks: 8,
    date: "2024-01-17",
    type: "fork"
  },
  {
    id: "4",
    title: "Watercolor Sketches",
    author: "Lakshmi R.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=L",
    x: 700,
    y: 180,
    forks: 3,
    date: "2024-01-18",
    type: "fork"
  },
  // Second level forks (2 forks from "Color Studies")
  {
    id: "5",
    title: "Abstract Emotions",
    author: "Ravi D.",
    image: "https://via.placeholder.com/80x80/A3B9A5/1E1B18?text=R",
    x: 200,
    y: 280,
    forks: 2,
    date: "2024-01-20",
    type: "fork"
  },
  {
    id: "6",
    title: "Color Theory Notes",
    author: "Sneha P.",
    image: "https://via.placeholder.com/80x80/D4C3DE/1E1B18?text=S",
    x: 400,
    y: 280,
    forks: 4,
    date: "2024-01-21",
    type: "fork"
  },
  // Second level forks (2 forks from "Dreams in Motion")
  {
    id: "7",
    title: "Dance of Colors",
    author: "Kiran M.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=K",
    x: 450,
    y: 280,
    forks: 1,
    date: "2024-01-22",
    type: "fork"
  },
  {
    id: "8",
    title: "Flowing Dreams",
    author: "Arjun P.",
    image: "https://via.placeholder.com/80x80/A3B9A5/1E1B18?text=A",
    x: 550,
    y: 280,
    forks: 3,
    date: "2024-01-23",
    type: "fork"
  },
  // Second level forks (2 forks from "Watercolor Sketches")
  {
    id: "9",
    title: "Sketchbook Stories",
    author: "Deepa S.",
    image: "https://via.placeholder.com/80x80/D4C3DE/1E1B18?text=D",
    x: 650,
    y: 280,
    forks: 2,
    date: "2024-01-24",
    type: "fork"
  },
  {
    id: "10",
    title: "Ink & Water",
    author: "Vikram R.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=V",
    x: 800,
    y: 280,
    forks: 1,
    date: "2024-01-25",
    type: "fork"
  },
  // Third level forks (2 forks from "Color Theory Notes")
  {
    id: "11",
    title: "Theoretical Colors",
    author: "Anita K.",
    image: "https://via.placeholder.com/80x80/A3B9A5/1E1B18?text=A",
    x: 350,
    y: 380,
    forks: 0,
    date: "2024-01-26",
    type: "fork"
  },
  {
    id: "12",
    title: "Practical Palette",
    author: "Rajesh M.",
    image: "https://via.placeholder.com/80x80/D4C3DE/1E1B18?text=R",
    x: 450,
    y: 380,
    forks: 0,
    date: "2024-01-27",
    type: "fork"
  },
  // Third level forks (2 forks from "Flowing Dreams")
  {
    id: "13",
    title: "Stream of Consciousness",
    author: "Pooja N.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=P",
    x: 500,
    y: 380,
    forks: 0,
    date: "2024-01-28",
    type: "fork"
  },
  {
    id: "14",
    title: "Dream Currents",
    author: "Suresh K.",
    image: "https://via.placeholder.com/80x80/A3B9A5/1E1B18?text=S",
    x: 600,
    y: 380,
    forks: 0,
    date: "2024-01-29",
    type: "fork"
  },
  // Fourth level forks (from "Practical Palette")
  {
    id: "15",
    title: "Color Harmony",
    author: "Neha P.",
    image: "https://via.placeholder.com/80x80/D4C3DE/1E1B18?text=N",
    x: 400,
    y: 480,
    forks: 0,
    date: "2024-01-30",
    type: "fork"
  },
  {
    id: "16",
    title: "Palette Studies",
    author: "Manoj K.",
    image: "https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=M",
    x: 500,
    y: 480,
    forks: 0,
    date: "2024-01-31",
    type: "fork"
  },
];

const LineageTree = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [layout, setLayout] = useState<"timeline" | "tree">("tree");
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [taglineDraft, setTaglineDraft] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // New state for real data functionality
  const [userSeeds, setUserSeeds] = useState<UserSeed[]>([]);
  const { selectedSeedId, setSelectedSeedId, refreshTrigger, mode, setMode } = useForklore();
  const [lineageData, setLineageData] = useState<LineageData | null>(null);
  const [realNodes, setRealNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle seed click to open modal
  const handleSeedClick = (node: any) => {
    console.log('Tree seed clicked:', node);
    console.log('Original date:', node.date);
    console.log('Parsed date:', new Date(node.date));
    // Convert node to seed format for the modal
    const seed = {
      id: node.id,
      title: node.title,
      author: node.author,
      time: new Date(node.date).toISOString(),
      forks: node.forks,
      sparks: 0,
      category: 'timeline',
      tags: [],
      type: (node as any).seedType === 'visual' ? 'visual' : 'text',
      content: (node as any).content || '',
      excerpt: (node as any).content?.slice(0, 100) || '',
      image: node.image || '',
      isForked: node.type === 'fork',
      parentId: (node as any).parentId
    };
    console.log('Tree modal seed:', seed);
    setSelectedSeed(seed);
    setIsModalOpen(true);
    console.log('Tree modal should be open now');
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSeed(null);
  };

  // Handle fork action
  const handleFork = (seedId: string) => {
    console.log('Fork seed:', seedId);
    toast({
      title: "Fork Seed",
      description: "Redirecting to fork page...",
    });
  };

  // Get current nodes and connections based on mode
  const currentNodes = useMemo(() => {
    return mode === "demo" ? sampleNodes : realNodes;
  }, [mode, realNodes]);

  const currentConnections = useMemo(() => {
    if (mode === "demo") {
      return [
        // Original to first level forks
        { from: "1", to: "2" }, // Original -> Color Studies
        { from: "1", to: "3" }, // Original -> Dreams in Motion
        { from: "1", to: "4" }, // Original -> Watercolor Sketches
        
        // First level to second level forks
        { from: "2", to: "5" }, // Color Studies -> Abstract Emotions
        { from: "2", to: "6" }, // Color Studies -> Color Theory Notes
        { from: "3", to: "7" }, // Dreams in Motion -> Dance of Colors
        { from: "3", to: "8" }, // Dreams in Motion -> Flowing Dreams
        { from: "4", to: "9" }, // Watercolor Sketches -> Sketchbook Stories
        { from: "4", to: "10" }, // Watercolor Sketches -> Ink & Water
        
        // Second level to third level forks
        { from: "6", to: "11" }, // Color Theory Notes -> Theoretical Colors
        { from: "6", to: "12" }, // Color Theory Notes -> Practical Palette
        { from: "8", to: "13" }, // Flowing Dreams -> Stream of Consciousness
        { from: "8", to: "14" }, // Flowing Dreams -> Dream Currents
        
        // Third level to fourth level forks
        { from: "12", to: "15" }, // Practical Palette -> Color Harmony
        { from: "12", to: "16" }, // Practical Palette -> Palette Studies
      ];
    } else {
      // Convert edges from { parent, child } format to { from, to } format
      const edges = lineageData?.edges || [];
      console.log('🌳 Raw edges from API:', edges);
      const connections = edges.map(edge => ({
        from: edge.parent,
        to: edge.child
      }));
      console.log('🌳 Converted connections:', connections);
      return connections;
    }
  }, [mode, lineageData]);

  const handleNodeClick = (node: Node) => {
    // Only open the modal, no expanding/collapsing
    console.log('Tree node clicked:', node.id);
    handleSeedClick(node);
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

  // Clear any previously saved tagline and avoid persistence going forward
  useEffect(() => {
    try { localStorage.removeItem("forkloreTagline"); } catch {}
  }, []);

  // Auto-load lineage data when selectedSeedId changes
  useEffect(() => {
    if (selectedSeedId && mode === "real") {
      fetchLineageData(selectedSeedId);
    } else if (mode === "demo") {
      // Clear real data when switching to demo mode
      console.log('Switching to demo mode, clearing real data');
      setRealNodes([]);
      setLineageData(null);
    }
  }, [selectedSeedId, mode]);

  // Auto-switch to real mode when a seed is selected
  useEffect(() => {
    if (selectedSeedId && mode === "demo") {
      console.log('Seed selected, switching to real mode');
      setMode("real");
    }
  }, [selectedSeedId, mode, setMode]);

  // Refresh data when component regains focus (e.g., after creating a fork)
  useEffect(() => {
    const handleFocus = () => {
      if (selectedSeedId && mode === "real") {
        console.log('🔄 Component focused, refreshing lineage data');
        refreshLineageData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedSeedId, mode]);

  // Listen for refresh trigger from context (e.g., when fork is created)
  useEffect(() => {
    if (refreshTrigger > 0 && selectedSeedId && mode === "real") {
      console.log('🔄 Refresh triggered from context, refreshing lineage data');
      refreshLineageData();
    }
  }, [refreshTrigger, selectedSeedId, mode]);

  // Fetch lineage data when seed is selected
  const fetchLineageData = async (seedId: string) => {
    if (!seedId) return;
    
    setLoading(true);
    console.log('🌳 Fetching lineage data for seed:', seedId);
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  console.error('❌ VITE_API_URL not configured in environment variables');
}
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${apiBase}/api/lineage/${seedId}?depth=3`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLineageData(data);
        // Use the first node as the root seed ID for positioning
        const rootSeedId = data.nodes && data.nodes.length > 0 ? data.nodes[0] : seedId;
        buildRealTree(data, rootSeedId);
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

  // Refresh lineage data - can be called externally
  const refreshLineageData = async () => {
    if (selectedSeedId && mode === "real") {
      console.log('🔄 Refreshing lineage data for:', selectedSeedId);
      await fetchLineageData(selectedSeedId);
    }
  };

  // Build real tree from lineage data
  const buildRealTree = async (lineageData: LineageData, rootSeedId: string) => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL;
if (!apiBase) {
  console.error('❌ VITE_API_URL not configured in environment variables');
}
      const token = localStorage.getItem("token");
      
      console.log('🌳 Building tree with lineage data:', lineageData);
      console.log('🌳 Nodes to fetch:', lineageData.nodes);
      console.log('🌳 Edges from API:', lineageData.edges);
      
      // Fetch details for each unique node only once
      const nodeDetailsMap = new Map();
      
      for (const nodeId of lineageData.nodes) {
        if (nodeDetailsMap.has(nodeId)) continue; // Skip if already fetched
        
        console.log('🌳 Fetching details for node:', nodeId);
        
        // Add a small delay to prevent rate limiting
        if (nodeDetailsMap.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
        
        const res = await fetch(`${apiBase}/api/seeds/${nodeId}/details`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('🌳 Node details fetched:', data);
          
          if (data.type === 'seed') {
            console.log('🌳 Seed data for', nodeId, ':', {
              id: data.seed._id,
              title: data.seed.title,
              type: data.seed.type,
              forkCount: data.seed.forkCount
            });
            
            nodeDetailsMap.set(nodeId, {
              id: data.seed._id,
              title: data.seed.title,
              author: data.seed.author?.displayName || data.seed.author?.username || 'Unknown',
              image: data.seed.thumbnailUrl || `https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=${data.seed.author?.displayName?.charAt(0) || 'U'}`,
              x: 0, // Will be calculated
              y: 0, // Will be calculated
              forks: data.seed.forkCount || 0,
              date: new Date(data.seed.createdAt).toISOString().split('T')[0],
              type: data.seed._id === rootSeedId ? "original" : "fork",
              seedType: data.seed.type,
              content: data.seed.contentFull || data.seed.contentSnippet || ''
            });
          } else if (data.type === 'fork') {
            const fork = data.fork;
            const originalContent = fork.parentSeed?.contentFull || fork.parentSeed?.contentSnippet || '';
            const forkContent = fork.contentDelta || fork.summary || '';
            const forkDescription = fork.description || '';
            const combinedContent = forkContent || forkDescription || originalContent;
            
            nodeDetailsMap.set(nodeId, {
              id: fork._id,
              title: fork.title || fork.summary || 'Fork',
              author: fork.author?.displayName || fork.author?.username || 'Anonymous',
              image: fork.imageUrl || fork.thumbnailUrl || fork.parentSeed?.imageUrl || fork.parentSeed?.thumbnailUrl || `https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=${fork.author?.displayName?.charAt(0) || 'F'}`,
              x: 0, // Will be calculated
              y: 0, // Will be calculated
              forks: fork.forkCount || 0,
              date: new Date(fork.createdAt).toISOString().split('T')[0],
              type: "fork",
              seedType: (fork.imageUrl || fork.thumbnailUrl) ? 'visual' : 'text',
              content: combinedContent,
              parentId: fork.parentSeed?._id
            });
          }
        } else {
          if (res.status === 429) {
            console.warn('🌳 Rate limited, waiting before retry for:', nodeId);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            // Retry once
            const retryRes = await fetch(`${apiBase}/api/seeds/${nodeId}/details`, {
              headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              console.log('🌳 Node details fetched on retry:', retryData);
              // Process the retry data the same way...
              if (retryData.type === 'seed') {
                nodeDetailsMap.set(nodeId, {
                  id: retryData.seed._id,
                  title: retryData.seed.title,
                  author: retryData.seed.author?.displayName || retryData.seed.author?.username || 'Unknown',
                  image: retryData.seed.thumbnailUrl || `https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=${retryData.seed.author?.displayName?.charAt(0) || 'U'}`,
                  x: 0,
                  y: 0,
                  forks: retryData.seed.forkCount || 0,
                  date: new Date(retryData.seed.createdAt).toISOString().split('T')[0],
                  type: retryData.seed._id === rootSeedId ? "original" : "fork",
                  seedType: retryData.seed.type,
                  content: retryData.seed.contentFull || retryData.seed.contentSnippet || ''
                });
              } else if (retryData.type === 'fork') {
                const fork = retryData.fork;
                const originalContent = fork.parentSeed?.contentFull || fork.parentSeed?.contentSnippet || '';
                const forkContent = fork.contentDelta || fork.summary || '';
                const forkDescription = fork.description || '';
                const combinedContent = forkContent || forkDescription || originalContent;
                
                nodeDetailsMap.set(nodeId, {
                  id: fork._id,
                  title: fork.title || fork.summary || 'Fork',
                  author: fork.author?.displayName || fork.author?.username || 'Anonymous',
                  image: fork.imageUrl || fork.thumbnailUrl || fork.parentSeed?.imageUrl || fork.parentSeed?.thumbnailUrl || `https://via.placeholder.com/80x80/E8C9B0/1E1B18?text=${fork.author?.displayName?.charAt(0) || 'F'}`,
                  x: 0,
                  y: 0,
                  forks: fork.forkCount || 0,
                  date: new Date(fork.createdAt).toISOString().split('T')[0],
                  type: "fork",
                  seedType: (fork.imageUrl || fork.thumbnailUrl) ? 'visual' : 'text',
                  content: combinedContent,
                  parentId: fork.parentSeed?._id
                });
              }
            } else {
              console.warn('🌳 Retry also failed for:', nodeId, retryRes.status);
            }
          } else {
            console.warn('🌳 Failed to fetch node details for:', nodeId, res.status);
          }
        }
      }

      // Convert map to array of nodes
      const allNodes: Node[] = Array.from(nodeDetailsMap.values());
      console.log('🌳 Built nodes:', allNodes);

      // Use the edges from the lineage API directly (they're already in the correct format)
      const edges = lineageData.edges.map(edge => ({
        from: edge.parent,
        to: edge.child
      }));
      console.log('🌳 Using edges from API:', edges);

      // Calculate positions using tree layout algorithm
      console.log('🌳 About to calculate positions for root:', rootSeedId);
      console.log('🌳 Nodes to position:', allNodes.length);
      console.log('🌳 Edges to use:', edges.length);
      const positionedNodes = calculateTreePositions(allNodes, edges, rootSeedId);
      console.log('🌳 Final positioned nodes:', positionedNodes.length);
      setRealNodes(positionedNodes);
    } catch (error) {
      console.error('Failed to build real tree:', error);
    }
  };

  // Calculate tree positions
  const calculateTreePositions = (nodes: Node[], edges: Array<{ from: string; to: string }>, rootId: string) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    const levels = new Map<string, number>();
    
    // Build children map and calculate levels
    edges.forEach(edge => {
      if (!childrenMap.has(edge.from)) {
        childrenMap.set(edge.from, []);
      }
      childrenMap.get(edge.from)!.push(edge.to);
    });

    // BFS to calculate levels
    const queue = [{ id: rootId, level: 0 }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      
      visited.add(id);
      levels.set(id, level);
      
      const children = childrenMap.get(id) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    // Calculate positions
    const levelGroups = new Map<number, Node[]>();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(node);
    });

    const positionedNodes: Node[] = [];
    const levelSpacing = 120;
    const nodeSpacing = 180;

    // Calculate the total width needed for the entire tree
    const maxLevelWidth = Math.max(...Array.from(levelGroups.values()).map(nodes => nodes.length));
    const totalTreeWidth = (maxLevelWidth - 1) * nodeSpacing;
    const treeCenterX = 500;

    levelGroups.forEach((levelNodes, level) => {
      const y = 100 + level * levelSpacing;
      const levelWidth = (levelNodes.length - 1) * nodeSpacing;
      const startX = treeCenterX - levelWidth / 2;

      levelNodes.forEach((node, index) => {
        positionedNodes.push({
          ...node,
          x: startX + index * nodeSpacing,
          y: y
        });
      });
    });

    // Debug logging for tree positioning
    console.log('🌳 Tree positioning debug:');
    console.log('🌳 Root ID:', rootId);
    console.log('🌳 Total nodes:', positionedNodes.length);
    console.log('🌳 Level groups:', Array.from(levelGroups.entries()).map(([level, nodes]) => ({ level, count: nodes.length })));
    console.log('🌳 Children map:', Array.from(childrenMap.entries()).map(([parent, children]) => ({ parent, children })));
    console.log('🌳 Positioned nodes:', positionedNodes.map(n => ({ id: n.id, title: n.title, x: n.x, y: n.y, type: n.type })));

    return positionedNodes;
  };

  // Compute a depth level for styling (1 = earliest, 4 = latest)
  const nodeLevelByY = (y: number) => {
    if (y <= 140) return 1;
    if (y <= 210) return 2;
    if (y <= 310) return 3;
    if (y <= 410) return 4;
    return 5;
  };

  // Green gradient shades per generation (light vs dark aware)
  const greenByLevel = (level: number) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const paletteLight = [
      "hsl(120 40% 95%)",
      "hsl(120 45% 85%)",
      "hsl(120 50% 75%)",
      "hsl(120 55% 65%)",
      "hsl(120 60% 55%)",
    ];
    const paletteDark = [
      "#8fbc8f",
      "#7ba87b",
      "#6b946b",
      "#5a805a",
      "#4a6c4a",
    ];
    const idx = Math.max(1, Math.min(level, 5)) - 1;
    return (isDark ? paletteDark : paletteLight)[idx];
  };

  // Build an organic curved branch path between two points
  const makeBranchPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.25 + (dy > 0 ? -20 : 20);
    const cy1 = y1 + dy * 0.35 + 14;
    const cx2 = x1 + dx * 0.75 + (dy > 0 ? 20 : -20);
    const cy2 = y1 + dy * 0.65 - 14;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  // Build a petal path centered at (cx, cy)
  const makePetalPath = (cx: number, cy: number, size: number, rotationDeg: number) => {
    const w = size * 1.2;
    const h = size * 2;
    // Vertical petal pointing up before rotation
    const p1x = cx, p1y = cy - h * 0.5; // tip
    const p2x = cx + w * 0.5, p2y = cy; // right mid
    const p3x = cx, p3y = cy + h * 0.5; // bottom
    const p4x = cx - w * 0.5, p4y = cy; // left mid

    const path = `M ${p1x} ${p1y} C ${cx + w * 0.45} ${cy - h * 0.25}, ${cx + w * 0.55} ${cy + h * 0.25}, ${p3x} ${p3y} C ${cx - w * 0.55} ${cy + h * 0.25}, ${cx - w * 0.45} ${cy - h * 0.25}, ${p1x} ${p1y} Z`;
    return { d: path, transform: `rotate(${rotationDeg} ${cx} ${cy})` };
  };

  // Precompute gradients for nodes
  const gradients = useMemo(() => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return currentNodes.map((n) => {
      const level = nodeLevelByY(n.y);
      const deep = greenByLevel(level);
      const light = isDark ? "#8fbc8f" : "hsl(120 30% 98%)";
      return { id: `petal-grad-${n.id}` , light, deep };
    });
  }, [currentNodes]);

  // Specific palette per requirements (hex) - Green theme
  const levelHexColor = (level: number) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    if (isDark) {
      if (level <= 1) return '#8fbc8f';
      if (level === 2) return '#7ba87b';
      if (level === 3) return '#6b946b';
      return '#5a805a';
    } else {
      if (level <= 1) return '#a8e6a3';
      if (level === 2) return '#7dd87a';
      if (level === 3) return '#52ca51';
      return '#3fb83d';
    }
  };

  const darkerHex = (hex: string, amount: number) => {
    const h = hex.replace('#','');
    const r = Math.max(0, parseInt(h.substring(0,2),16) - amount);
    const g = Math.max(0, parseInt(h.substring(2,4),16) - amount);
    const b = Math.max(0, parseInt(h.substring(4,6),16) - amount);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Page frame - removed torn edges from bottom and right */}
      <div className="pointer-events-none fixed top-2 left-2 z-10 rounded-lg" style={{ 
        borderTop: "1px solid hsl(var(--border))", 
        borderLeft: "1px solid hsl(var(--border))",
        width: "calc(100% - 1rem)",
        height: "calc(100% - 1rem)"
      }} />

      {/* Tagline: FORKLORE — left-aligned, no background; white in dark mode */}
      <div className="absolute left-4" style={{ top: 'calc(4rem + 8px)', zIndex: 20, maxWidth: 560 }}>
        <div className="px-2 py-1 flex flex-col items-start text-left gap-2">
          <h1 className="font-display text-xl tracking-tight dark:text-white">forklore.</h1>
          <div className="font-display text-[1rem]" style={{ color: '#b35e78' }}>
            your seed, their forklore.
          </div>
          {mode === "real" && (
            <div className="text-xs text-muted-foreground mt-2 max-w-md">
              {selectedSeedId ? (
                <span>Showing lineage tree for your selected seed. Click nodes to expand branches.</span>
              ) : (
                <span>Select "Real" mode and choose one of your seeds to see its actual lineage tree.</span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Top Controls */}
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

      {/* Left Sidebar Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Link to="/explore">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </Link>
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
                Loading lineage...
              </div>
            )}
            {selectedSeedId && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLineageData}
                disabled={loading}
                className="w-full mt-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Fork Counts
              </Button>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground dark:[color:#b0a0b8]">Layout</label>
          <div className="flex gap-1">
            {(["timeline", "tree"] as const).map((layoutType) => {
              const isCurrentLayout = layout === layoutType;
              const isTreeLayout = layoutType === "tree";
              
              return (
                <Button
                  key={layoutType}
                  variant={isCurrentLayout ? "hero" : "ghost"}
                  size="sm"
                  onClick={() => {
                    if (isTreeLayout) {
                      setLayout(layoutType);
                    } else {
                      navigate("/forklore/timeline");
                    }
                  }}
                  className="text-xs capitalize"
                  style={isCurrentLayout ? {
                    background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
                    border: 'none',
                    color: '#f2f2f2',
                    boxShadow: '0 0 12px rgba(120,200,120,0.3)'
                  } : {}}
                >
                  {layoutType}
                </Button>
              );
            })}
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
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="bg-background"
          viewBox="0 0 1000 600"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Definitions for gradients and stroke styles */}
          <defs>
            {gradients.map(g => (
              <radialGradient key={g.id} id={g.id} cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={g.light} />
                <stop offset="100%" stopColor={g.deep} />
              </radialGradient>
            ))}
            <filter id="roughen" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="petalGlowLight" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Neon hover glow */}
            <filter id="petalNeon" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff8fc7" floodOpacity="0.8" />
            </filter>
            {/* Branch jitter/texture */}
            <filter id="branchRough" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence baseFrequency="0.9" numOctaves="1" seed="2" type="fractalNoise" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Organic Branch Connections */}
          {currentConnections.map((conn, index) => {
            const fromNode = currentNodes.find(n => n.id === conn.from);
            const toNode = currentNodes.find(n => n.id === conn.to);
            
            // Debug logging for branch rendering
            if (!fromNode) {
              console.warn('🌳 Branch rendering: fromNode not found for connection:', conn.from, 'in nodes:', currentNodes.map(n => n.id));
            }
            if (!toNode) {
              console.warn('🌳 Branch rendering: toNode not found for connection:', conn.to, 'in nodes:', currentNodes.map(n => n.id));
            }
            
            if (!fromNode || !toNode) return null;

            const toLevel = nodeLevelByY(toNode.y);
            const fromLevel = nodeLevelByY(fromNode.y);
            const startHex = levelHexColor(fromLevel);
            const endHex = levelHexColor(toLevel);
            const d = makeBranchPath(fromNode.x, fromNode.y, toNode.x, toNode.y);

            const gradId = `branch-grad-${index}`;
            const grad = (
              <linearGradient key={gradId} id={gradId} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={startHex} stopOpacity="0.75" />
                <stop offset="100%" stopColor={endHex} stopOpacity="0.95" />
              </linearGradient>
            );

            // Make branches with brown border and brown fill - slim
            const strokeW = 2.0;
            return (
              <g key={index}>
                <defs>{grad}</defs>
                {/* Dark brown border/outline */}
                <path d={d} fill="none" stroke="#654321" strokeWidth={strokeW + 0.5} strokeLinecap="round" strokeLinejoin="round" opacity={1.0} />
                {/* Light brown fill */}
                <path d={d} fill="none" stroke="#8B4513" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" opacity={1.0} />
              </g>
            );
          })}

          {/* Petal Nodes */}
          {currentNodes.map((node) => {
            const level = nodeLevelByY(node.y);
            const size = node.type === "original" ? 46 : level === 2 ? 36 : level === 3 ? 30 : level >= 4 ? 24 : 20;
            const rotation = node.type === "original" ? -6 : (node.x % 3) * 8 - 8; // slight organic tilt
            const stroke = levelHexColor(level);
            const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
            const { d, transform } = makePetalPath(node.x, node.y, size, rotation);

            const isHovered = hoveredNodeId === node.id;

            return (
              <g key={node.id} className="cursor-pointer" onClick={() => handleNodeClick(node)} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}>
                {/* Outer contrast outline */}
                <path d={d} transform={transform} fill="none" stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)"} strokeWidth={node.type === "original" ? 4.2 : 3.2} opacity={0.15} />
                <path
                  d={d}
                  transform={transform}
                  fill={`url(#petal-grad-${node.id})`}
                  stroke={stroke}
                  strokeWidth={node.type === "original" ? 3 : 2.2}
                  style={{ 
                    filter: isDark ? 'url(#roughen)' : 'url(#roughen) drop-shadow(0 2px 6px rgba(120,200,120,0.15))',
                    boxShadow: isDark ? 'inset 0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                />

                {/* subtle inner vein */}
                <path
                  d={`M ${node.x} ${node.y - size * 0.6} Q ${node.x + 6} ${node.y}, ${node.x} ${node.y + size * 0.6}`}
                  stroke={darkerHex(stroke, 60)}
                  strokeWidth={0.7}
                  opacity={0.45}
                  fill="none"
                  transform={transform}
                />

                {/* Fork count badge with gradient and shadow - always show */}
                <g>
                  <defs>
                    <linearGradient id={`badge-${node.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff7eb3" />
                      <stop offset="100%" stopColor="#ff4da6" />
                    </linearGradient>
                  </defs>
                  <circle cx={node.x + size * 0.6} cy={node.y - size * 0.7} r="13" fill={isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.1)'} />
                  <circle cx={node.x + size * 0.6} cy={node.y - size * 0.7} r="11" fill={`url(#badge-${node.id})`} style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
                  <text x={node.x + size * 0.6} y={node.y - size * 0.7 + 4} textAnchor="middle" className="text-xs fill-white font-bold">
                    {node.forks}
                  </text>
                </g>


                {/* Labels - high-contrast pills for dark mode */}
                {(() => {
                  const title = node.title.length > 15 ? node.title.substring(0,15) + '...' : node.title;
                  const titleWidth = Math.max(60, title.length * 7);
                  const titleY = node.y + size + 20;
                  const labelBg = isDark ? 'rgba(60, 60, 65, 0.8)' : 'rgba(255,255,255,0.85)';
                  const labelStroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
                  return (
                    <g>
                      <rect x={node.x - titleWidth/2 - 8} y={titleY - 12} width={titleWidth + 16} height={18} rx={9} ry={9} fill={labelBg} stroke={labelStroke} />
                      <text x={node.x} y={titleY + 2} textAnchor="middle" className="text-[11px] font-medium" fill={isDark ? '#f6e7ef' : 'hsl(var(--foreground))'}>{title}</text>
                    </g>
                  );
                })()}
                {(() => {
                  const author = `by ${node.author}`;
                  const authorWidth = Math.max(60, author.length * 6);
                  const authorY = node.y + size + 38;
                  const labelBg = isDark ? 'rgba(60, 60, 65, 0.7)' : 'rgba(255,255,255,0.8)';
                  const labelStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)';
                  return (
                    <g>
                      <rect x={node.x - authorWidth/2 - 8} y={authorY - 12} width={authorWidth + 16} height={18} rx={9} ry={9} fill={labelBg} stroke={labelStroke} />
                      <text x={node.x} y={authorY + 2} textAnchor="middle" className="text-[10px]" fill={isDark ? '#b8aabf' : 'hsl(var(--muted-foreground))'} fontStyle="italic">{author}</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Seed Preview with Complete Details */}
      {hoveredNodeId && (() => {
        const node = currentNodes.find(n => n.id === hoveredNodeId);
        if (!node) return null;
        
        // Determine if node is on left or right side of screen
        const isOnLeftSide = node.x < window.innerWidth / 2;
        const previewWidth = 384; // w-96 = 384px
        
        // Position closer to the leaf but not overlapping
        let finalLeft;
        if (isOnLeftSide) {
          // Show to the right of the leaf, closer
          finalLeft = node.x + 80;
          // If it would go off screen, move it left
          if (finalLeft + previewWidth > window.innerWidth - 20) {
            finalLeft = window.innerWidth - previewWidth - 20;
          }
        } else {
          // Show to the left of the leaf, closer
          finalLeft = node.x - previewWidth - 80;
          // If it would go off screen, move it right
          if (finalLeft < 20) {
            finalLeft = 20;
          }
        }
        
        return (
          <div 
            className="fixed z-50"
            style={{
              left: `${finalLeft + 20}px`, // Move 20px closer to the node
              top: `${node.y}px`,
              transform: `translateY(-50%)`
            }}
            onMouseEnter={() => {
              // Keep the card visible when hovering over it
              setHoveredNodeId(node.id);
            }}
            onMouseLeave={() => {
              // Don't hide immediately when leaving the card
              setTimeout(() => {
                setHoveredNodeId(null);
              }, 200);
            }}
          >
            <div className="w-96 max-h-[500px]">
            <div 
              className="relative group cursor-pointer bg-amber-50 dark:bg-orange-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 dark:border-orange-800 overflow-hidden"
              onClick={() => handleSeedClick(node)}
            >
                <div></div>
                <div className="relative">
                  {/* Type icon indicator */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="w-8 h-8 rounded-full bg-accent-1/10 backdrop-blur-sm flex items-center justify-center border border-accent-1/20">
                      <span className="text-accent-1">
                        {(node as any).seedType === 'visual' ? '📷' : '📝'}
                      </span>
                    </div>
                  </div>
                  
                  {(node as any).seedType === 'visual' ? (
                    /* Visual Seed - Image */
                    <div className="relative overflow-hidden">
                      <img
                        src={node.image}
                        alt={node.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/320x400/E8C9B0/1E1B18?text=${node.title.charAt(0)}`;
                        }}
                      />
                      
                      {/* Title overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2 drop-shadow-lg">
                          {node.title}
                        </h3>
                        <p className="text-white/90 text-sm line-clamp-1">
                          by {node.author}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Text Seed - Content */
                    <div className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg leading-tight text-amber-900 dark:text-orange-100">
                        {node.title}
                      </h3>
                      <div className="prose prose-sm max-w-none text-amber-700 dark:text-orange-200">
                        <p className="line-clamp-4 leading-relaxed whitespace-pre-wrap">
                          {(node as any).content || 'No content available'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-6 pb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-600 dark:text-orange-300">
                      <span className="font-medium">{node.author}</span>
                      <span>{node.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {node.forks > 0 && (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-orange-400">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="8" cy="6" r="2" fill="currentColor"/>
                            <circle cx="16" cy="6" r="2" fill="currentColor"/>
                            <circle cx="12" cy="18" r="2" fill="currentColor"/>
                            <path d="M8 8L12 16M16 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {node.forks}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-orange-900/30 dark:text-orange-200">
                        {node.type === 'original' ? 'Original' : 'Fork'}
                      </span>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background/95 to-transparent transform translate-y-0 transition-transform duration-reveal ease-organic border-t border-border/20">
                    <div className="flex items-center gap-2 text-xs">
                      <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-1/20 hover:bg-accent-1/30 text-accent-1 border border-accent-1/30 transition-colors">
                        <svg className="w-3 h-3 text-accent-1" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="8" cy="6" r="2" fill="currentColor"/>
                          <circle cx="16" cy="6" r="2" fill="currentColor"/>
                          <circle cx="12" cy="18" r="2" fill="currentColor"/>
                          <path d="M8 8L12 16M16 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Fork</span>
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors">
                        <span>👁</span>
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Node Preview Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg shadow-paper max-w-md w-full dark:[background:rgba(60,60,65,0.9)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedNode.image}
                alt={selectedNode.author}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-display font-semibold text-foreground dark:[color:#f2f2f2]">{selectedNode.title}</h3>
                <p className="text-sm text-muted-foreground dark:[color:#aaa5b5]">by {selectedNode.author}</p>
              </div>
            </div>
            <p className="text-sm mb-4 text-muted-foreground dark:[color:#aaa5b5]">
              {selectedNode.forks} forks • {selectedNode.date}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                style={{
                  background: 'linear-gradient(90deg, #7dd87a, #52ca51)',
                  border: 'none',
                  color: '#f2f2f2',
                  boxShadow: '0 0 12px rgba(120,200,120,0.3)'
                }}
              >
                View Seed
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
              >
                Fork
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Tree Statistics */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="bg-card/90 backdrop-blur-paper rounded-lg p-4 shadow-paper dark:[background:rgba(60,60,65,0.8)] dark:[backdrop-filter:blur(10px)] dark:[border:1px_solid_rgba(255,255,255,0.15)]">
          <h3 className="text-sm font-semibold mb-2 text-foreground dark:[color:#f2f2f2]">Tree Statistics</h3>
          <div className="space-y-1 text-xs text-muted-foreground dark:[color:#aaa5b5]">
            <div>Total Nodes: {currentNodes.length}</div>
            <div>Original Seeds: {currentNodes.filter(n => n.type === "original").length}</div>
            <div>Total Forks: {currentNodes.filter(n => n.type === "fork").length}</div>
            <div>Max Depth: {Math.max(1, Math.max(...currentNodes.map(n => nodeLevelByY(n.y))))} levels</div>
            <div>Total Connections: {currentConnections.length}</div>
            <div>Mode: {mode === "demo" ? "Demo Data" : "Real Data"}</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
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
          Download Lineage
        </Button>
      </div>

      {/* Seed View Modal */}
      <SeedViewModal
        seed={selectedSeed}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onFork={handleFork}
        onForkCreated={() => {
          console.log('🔄 Fork created, triggering lineage refresh');
          refreshLineageData();
        }}
      />
    </div>
  );
};

export default LineageTree;
