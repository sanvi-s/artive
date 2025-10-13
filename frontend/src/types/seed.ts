// Base seed interface
export interface BaseSeed {
  id: string;
  title: string;
  author: string;
  time: string;
  forks: number;
  sparks: number;
  category: string;
  tags: string[];
  isForked?: boolean;
  parentId?: string;
  createdAt: string;
}

// Text seed specific interface
export interface TextSeed extends BaseSeed {
  type: 'text';
  content: string;
  excerpt: string;
  isThread?: boolean;
  threadParts?: string[];
  threadIndex?: number;
  totalThreadParts?: number;
}

// Visual seed interface (existing)
export interface VisualSeed extends BaseSeed {
  type: 'visual';
  image: string;
  alt?: string;
  description: string;
}

// Music seed interface
export interface MusicSeed extends BaseSeed {
  type: 'music';
  audioUrl: string;
  duration?: number;
  waveform?: number[];
}

// Code seed interface
export interface CodeSeed extends BaseSeed {
  type: 'code';
  code: string;
  language: string;
  description: string;
}

// Union type for all seed types
export type Seed = TextSeed | VisualSeed | MusicSeed | CodeSeed;

// Seed creation form data
export interface SeedCreationData {
  type: 'text' | 'visual' | 'music' | 'code';
  title: string;
  content?: string; // For text seeds
  image?: string; // For visual seeds
  audioUrl?: string; // For music seeds
  code?: string; // For code seeds
  language?: string; // For code seeds
  description?: string; // For code seeds
  tags: string[];
  category: string;
  isThread?: boolean;
  threadParts?: string[];
}

// Seed filter options
export interface SeedFilters {
  category: string;
  type: string;
  sortBy: 'new' | 'trending' | 'mostForked' | 'oldest';
  searchQuery: string;
}

// Seed card props (unified for all types)
export interface SeedCardProps {
  seed: Seed;
  className?: string;
  style?: React.CSSProperties;
  onFork?: (seedId: string) => void;
  onView?: (seedId: string) => void;
  onSpark?: (seedId: string) => void;
}
