import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { ArrowLeft, Layout, Filter, SlidersHorizontal, Download, Undo2, Redo2 } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";

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
  const [layout, setLayout] = useState<"radial" | "timeline" | "spiral" | "tree">("tree");
  const [filter, setFilter] = useState<"all" | "visual" | "poems" | "music" | "code">("all");
  const [depth, setDepth] = useState(4);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [taglineDraft, setTaglineDraft] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const connections = [
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

  const handleNodeClick = (node: Node) => {
    // Expand this node to emphasize its child branches and scale the petal
    setExpandedNodeId(prev => prev === node.id ? null : node.id);
  };

  // Clear any previously saved tagline and avoid persistence going forward
  useEffect(() => {
    try { localStorage.removeItem("forkloreTagline"); } catch {}
  }, []);

  // Compute a depth level for styling (1 = earliest, 4 = latest)
  const nodeLevelByY = (y: number) => {
    if (y <= 140) return 1;
    if (y <= 210) return 2;
    if (y <= 310) return 3;
    if (y <= 410) return 4;
    return 5;
  };

  // Pink gradient shades per generation (light vs dark aware)
  const pinkByLevel = (level: number) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const paletteLight = [
      "hsl(345 62% 96%)",
      "hsl(345 70% 88%)",
      "hsl(345 78% 78%)",
      "hsl(345 82% 66%)",
      "hsl(345 85% 56%)",
    ];
    const paletteDark = [
      "hsl(345 72% 82%)",
      "hsl(345 78% 70%)",
      "hsl(345 82% 62%)",
      "hsl(345 86% 54%)",
      "hsl(345 90% 48%)",
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
    return sampleNodes.map((n) => {
      const level = nodeLevelByY(n.y);
      const deep = pinkByLevel(level);
      const light = isDark ? "hsl(345 60% 88%)" : "hsl(345 45% 98%)";
      return { id: `petal-grad-${n.id}` , light, deep };
    });
  }, []);

  // Specific palette per requirements (hex)
  const levelHexColor = (level: number) => {
    if (level <= 1) return '#f8d7de';
    if (level === 2) return '#f2a1b8';
    if (level === 3) return '#e66b96';
    return '#c83b78';
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
      
      {/* Page torn-edge frame */}
      <div className="pointer-events-none fixed inset-2 z-10 rounded-lg torn-edge" style={{ outline: "1px solid hsl(var(--border))", outlineOffset: "-6px" }} />

      {/* Tagline: FORKLORE — left-aligned, no background; white in dark mode */}
      <div className="absolute left-4" style={{ top: 'calc(4rem + 8px)', zIndex: 20, maxWidth: 560 }}>
        <div className="px-2 py-1 flex flex-col items-start text-left gap-2">
          <h1 className="font-display text-xl tracking-tight dark:text-white">forklore.</h1>
          <div className="font-display text-[1rem]" style={{ color: '#b35e78' }}>
            your seed, their forklore-
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="relative" style={{ minWidth: 200 }}>
              {/* visible as a long line; text invisible but caret visible */}
              <input
                type="text"
                value={taglineDraft}
                onChange={(e) => setTaglineDraft(e.target.value.toLowerCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => { setIsInputFocused(false); }}
                aria-label="your forklore line"
                placeholder={(taglineDraft.length === 0) ? "complete it for us?" : ""}
                className="outline-none bg-transparent"
                style={{
                  width: '100%',
                  color: '#b35e78',
                  caretColor: '#b35e78',
                  borderBottom: '1px solid rgba(179,94,120,0.5)',
                  padding: '2px 0',
                  letterSpacing: '0.02em'
                }}
              />
            </div>
          </div>
          <div className="italic" style={{ fontSize: '0.80rem', color: '#d8a3b5', opacity: 0.8 }}>
            yeah, even we couldn’t finish ours ;)
          </div>
        </div>
      </div>
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-2 rounded-lg torn-edge-soft shadow-paper dark:[background:rgba(20,20,25,0.85)]">
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
      <div className="absolute top-4 right-4 z-20 rounded-lg p-4 space-y-3 torn-edge dark:[background:rgba(20,20,25,0.85)]">
        <div>
          <label className="text-xs font-medium mb-2 block">Layout</label>
          <div className="flex gap-1">
            {(["radial", "timeline", "spiral", "tree"] as const).map((layoutType) => (
              <Button
                key={layoutType}
                variant={layout === layoutType ? "hero" : "ghost"}
                size="sm"
                onClick={() => setLayout(layoutType)}
                className="text-xs capitalize"
              >
                {layoutType}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block">Tree Legend</label>
          <div className="space-y-1 text-xs">
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
          <label className="text-xs font-medium mb-2 block">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs"
          >
            <option value="all">All Types</option>
            <option value="visual">Visual</option>
            <option value="poems">Poems</option>
            <option value="music">Music</option>
            <option value="code">Code</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block">Depth: {depth}</label>
          <input
            type="range"
            min="1"
            max="4"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full"
          />
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
          background: 'linear-gradient(180deg, #1b1b1b 0%, #2f2f3a 100%)',
          zIndex: 0
        }} />
        <div className="pointer-events-none absolute inset-0 hidden dark:block mix-blend-soft-light" style={{
          backgroundImage: `url(/assets/textures/paper-grain-1.png)`,
          backgroundSize: '320px auto',
          opacity: 0.06,
          zIndex: 0
        }} />
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{
          background: 'radial-gradient(700px 420px at 50% 28%, rgba(255,255,255,0.055), transparent 70%)',
          zIndex: 0
        }} />
        {/* Ambient particles (dark only) */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ zIndex: 0 }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${(i*37)%100}%`,
              top: `${(i*19)%100}%`,
              width: 2,
              height: 2,
              background: 'rgba(255, 143, 199, 0.35)',
              filter: 'blur(0.5px)',
              animation: `float${i%3} 9s ease-in-out ${i}s infinite`
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
          {connections.map((conn, index) => {
            const fromNode = sampleNodes.find(n => n.id === conn.from);
            const toNode = sampleNodes.find(n => n.id === conn.to);
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

            // Animate growth for emphasized branches
            const isEmphasized = expandedNodeId && (conn.from === expandedNodeId || conn.to === expandedNodeId);
            const strokeW = isEmphasized ? 3 : 2.2;
            return (
              <g key={index} className={isEmphasized ? "animate-organic-fade-in" : undefined}>
                <defs>{grad}</defs>
                {/* halo */}
                <path d={d} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={strokeW + 1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
                {/* base textured stroke */}
                <path d={d} fill="none" stroke={`url(#${gradId})`} strokeWidth={strokeW + 0.6} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#branchRough)" }} opacity={0.9} className="animate-[brush-reveal_2.4s_var(--ease-organic)]" strokeDasharray={600} strokeDashoffset={0} />
                {/* tip accent to fake taper */}
                <path d={d} fill="none" stroke={darkerHex(endHex, 20)} strokeWidth={strokeW - 0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
              </g>
            );
          })}

          {/* Petal Nodes */}
          {sampleNodes.map((node) => {
            const level = nodeLevelByY(node.y);
            const size = node.type === "original" ? 46 : level === 2 ? 36 : level === 3 ? 30 : level >= 4 ? 24 : 20;
            const rotation = node.type === "original" ? -6 : (node.x % 3) * 8 - 8; // slight organic tilt
            const stroke = levelHexColor(level);
            const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
            const { d, transform } = makePetalPath(node.x, node.y, size, rotation);

            const isHovered = hoveredNodeId === node.id;
            const isExpanded = expandedNodeId === node.id;
            const scale = isExpanded ? 1.08 : isHovered ? 1.03 : 1;

            return (
              <g key={node.id} className="cursor-pointer" onClick={() => handleNodeClick(node)} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}>
                {/* Outer contrast outline */}
                <path d={d} transform={transform} fill="none" stroke={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"} strokeWidth={node.type === "original" ? 4.2 : 3.2} opacity={0.22} />
                <path
                  d={d}
                  transform={`${transform} scale(${scale})`}
                  fill={`url(#petal-grad-${node.id})`}
                  stroke={stroke}
                  strokeWidth={node.type === "original" ? 3 : 2.2}
                  style={{ filter: `url(#roughen) ${isHovered ? 'url(#petalNeon)' : ''} drop-shadow(0 6px 16px rgba(0,0,0,0.15))` }}
                />

                {/* subtle inner vein */}
                <path
                  d={`M ${node.x} ${node.y - size * 0.6} Q ${node.x + 6} ${node.y}, ${node.x} ${node.y + size * 0.6}`}
                  stroke={darkerHex(stroke, 60)}
                  strokeWidth={0.7}
                  opacity={0.45}
                  fill="none"
                  transform={`${transform} scale(${scale})`}
                />

                {/* Fork count badge with gradient and shadow */}
                {node.forks > 0 && (
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
                )}

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect x={node.x + 18} y={node.y - size - 10} rx={8} ry={8} width={180} height={44} fill="#fff9f9" opacity={0.95} style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))' }} />
                    <text x={node.x + 28} y={node.y - size + 6} className="text-[11px]" fill="#4a4a4a">{node.title}</text>
                    <text x={node.x + 28} y={node.y - size + 20} className="text-[10px]" fill="#6b6b6b">by {node.author} • echoes {node.forks}</text>
                  </g>
                )}

                {/* Labels - high-contrast pills for dark mode */}
                {(() => {
                  const title = node.title.length > 15 ? node.title.substring(0,15) + '...' : node.title;
                  const titleWidth = Math.max(60, title.length * 7);
                  const titleY = node.y + size + 20;
                  const labelBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)';
                  const labelStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                  return (
                    <g>
                      <rect x={node.x - titleWidth/2 - 8} y={titleY - 12} width={titleWidth + 16} height={18} rx={9} ry={9} fill={labelBg} stroke={labelStroke} />
                      <text x={node.x} y={titleY + 2} textAnchor="middle" className="text-[11px] font-medium" fill={isDark ? '#f0f0f0' : 'hsl(var(--foreground))'}>{title}</text>
                    </g>
                  );
                })()}
                {(() => {
                  const author = `by ${node.author}`;
                  const authorWidth = Math.max(60, author.length * 6);
                  const authorY = node.y + size + 38;
                  const labelBg = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)';
                  const labelStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  return (
                    <g>
                      <rect x={node.x - authorWidth/2 - 8} y={authorY - 12} width={authorWidth + 16} height={18} rx={9} ry={9} fill={labelBg} stroke={labelStroke} />
                      <text x={node.x} y={authorY + 2} textAnchor="middle" className="text-[10px]" fill={isDark ? '#f0f0f0' : 'hsl(var(--muted-foreground))'}>{author}</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Preview Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg torn-edge-soft shadow-paper max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedNode.image}
                alt={selectedNode.author}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-display font-semibold">{selectedNode.title}</h3>
                <p className="text-sm text-muted-foreground">by {selectedNode.author}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedNode.forks} forks • {selectedNode.date}
            </p>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" className="flex-1">
                View Seed
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
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
        <div className="bg-card/90 backdrop-blur-paper rounded-lg p-4 torn-edge shadow-paper">
          <h3 className="text-sm font-semibold mb-2">Tree Statistics</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Total Nodes: {sampleNodes.length}</div>
            <div>Original Seeds: {sampleNodes.filter(n => n.type === "original").length}</div>
            <div>Total Forks: {sampleNodes.filter(n => n.type === "fork").length}</div>
            <div>Max Depth: 4 levels</div>
            <div>Total Connections: {connections.length}</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button variant="hero" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Lineage
        </Button>
      </div>
    </div>
  );
};

export default LineageTree;
