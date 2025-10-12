import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { ArrowLeft, Layout, Filter, SlidersHorizontal, Download, Undo2, Redo2 } from "lucide-react";
import { useState, useRef } from "react";

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
    setSelectedNode(node);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-md p-2 rounded-lg torn-edge-soft shadow-paper">
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
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Link to="/explore">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </Link>
      </div>

      {/* Right Sidebar Controls */}
      <div className="absolute top-4 right-4 z-10 bg-card/90 backdrop-blur-paper rounded-lg p-4 space-y-3 torn-edge">
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
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="bg-background"
          viewBox="0 0 1000 600"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Connections */}
          {connections.map((conn, index) => {
            const fromNode = sampleNodes.find(n => n.id === conn.from);
            const toNode = sampleNodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            // Determine connection style based on levels
            const isOriginalToFirst = fromNode.type === "original";
            const isFirstToSecond = fromNode.y >= 150 && fromNode.y <= 200 && toNode.y >= 200 && toNode.y <= 300;
            const isSecondToThird = fromNode.y >= 200 && fromNode.y <= 300 && toNode.y >= 300 && toNode.y <= 400;
            const isThirdToFourth = fromNode.y >= 300 && fromNode.y <= 400 && toNode.y >= 400;

            let strokeColor, strokeWidth, strokeDasharray;
            if (isOriginalToFirst) {
              strokeColor = "hsl(var(--accent-1))"; // Blush rose / Golden smudge
              strokeWidth = "3";
              strokeDasharray = "8,4";
            } else if (isFirstToSecond) {
              strokeColor = "hsl(var(--accent-2))"; // Muted sage / Watercolor blue
              strokeWidth = "2";
              strokeDasharray = "6,3";
            } else if (isSecondToThird) {
              strokeColor = "hsl(var(--accent-3))"; // Washed lilac / Electric mauve
              strokeWidth = "2";
              strokeDasharray = "4,2";
            } else {
              strokeColor = "hsl(var(--accent-1))"; // Blush rose / Golden smudge
              strokeWidth = "1";
              strokeDasharray = "3,2";
            }

            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                opacity="0.7"
                className="animate-pulse"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(0,0,0,0.1))"
                }}
              />
            );
          })}

          {/* Nodes */}
          {sampleNodes.map((node) => {
            // Determine node level and styling based on position
            const isOriginal = node.type === "original";
            const isFirstLevel = node.y >= 150 && node.y <= 200;
            const isSecondLevel = node.y >= 200 && node.y <= 300;
            const isThirdLevel = node.y >= 300 && node.y <= 400;
            const isFourthLevel = node.y >= 400;
            
            let nodeSize, strokeWidth, strokeColor, textSize;
            if (isOriginal) {
              nodeSize = 45;
              strokeWidth = 4;
              strokeColor = "hsl(var(--accent-1))"; // Blush rose / Golden smudge
              textSize = "text-sm";
            } else if (isFirstLevel) {
              nodeSize = 35;
              strokeWidth = 3;
              strokeColor = "hsl(var(--accent-2))"; // Muted sage / Watercolor blue
              textSize = "text-xs";
            } else if (isSecondLevel) {
              nodeSize = 28;
              strokeWidth = 2;
              strokeColor = "hsl(var(--accent-3))"; // Washed lilac / Electric mauve
              textSize = "text-xs";
            } else if (isThirdLevel) {
              nodeSize = 22;
              strokeWidth = 2;
              strokeColor = "hsl(var(--accent-1))"; // Blush rose / Golden smudge
              textSize = "text-xs";
            } else {
              nodeSize = 18;
              strokeWidth = 1;
              strokeColor = "hsl(var(--accent-2))"; // Muted sage / Watercolor blue
              textSize = "text-xs";
            }

            return (
              <g key={node.id}>
                {/* Node background with gradient */}
                <defs>
                  <radialGradient id={`gradient-${node.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.7)" />
                  </radialGradient>
                </defs>
                
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={`url(#gradient-${node.id})`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="cursor-pointer hover:stroke-2 transition-all drop-shadow-lg"
                  onClick={() => handleNodeClick(node)}
                />
                
                {/* Fork count badge for nodes with forks */}
                {node.forks > 0 && (
                  <circle
                    cx={node.x + nodeSize - 8}
                    cy={node.y - nodeSize + 8}
                    r="12"
                    fill={strokeColor}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  />
                )}
                {node.forks > 0 && (
                  <text
                    x={node.x + nodeSize - 8}
                    y={node.y - nodeSize + 12}
                    textAnchor="middle"
                    className="text-xs fill-white font-bold cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    {node.forks}
                  </text>
                )}
                
                <image
                  href={node.image}
                  x={node.x - nodeSize + 5}
                  y={node.y - nodeSize + 5}
                  width={nodeSize * 2 - 10}
                  height={nodeSize * 2 - 10}
                  clipPath={`circle(${nodeSize - 5}px at ${node.x}px ${node.y}px)`}
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(node)}
                />
                
                <text
                  x={node.x}
                  y={node.y + nodeSize + 20}
                  textAnchor="middle"
                  className={`${textSize} fill-foreground font-medium cursor-pointer`}
                  onClick={() => handleNodeClick(node)}
                >
                  {node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title}
                </text>
                <text
                  x={node.x}
                  y={node.y + nodeSize + 35}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground cursor-pointer"
                  onClick={() => handleNodeClick(node)}
                >
                  by {node.author}
                </text>
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
