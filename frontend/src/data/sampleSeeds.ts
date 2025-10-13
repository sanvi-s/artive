import { Seed, TextSeed, VisualSeed } from "@/types/seed";
import seed1 from "@/assets/seed-1.jpg";
import seed2 from "@/assets/seed-2.jpg";
import seed3 from "@/assets/seed-3.jpg";
import seed4 from "@/assets/seed-4.jpg";
import seed5 from "@/assets/seed-5.jpg";
import seed6 from "@/assets/seed-6.jpg";

// Sample text seeds with poetic content
export const textSeeds: TextSeed[] = [
  {
    id: "t1",
    type: "text",
    title: "Midnight Whispers",
    author: "Luna M.",
    time: "2h ago",
    forks: 8,
    sparks: 23,
    category: "Poetry",
    tags: ["night", "dreams", "whispers", "moonlight"],
    createdAt: "2025-01-27T10:00:00Z",
    content: "The moon writes letters on my window sill,\nand I collect them like pressed flowers.\nEach word a silver thread\nconnecting this moment to the next.\n\nWhat if we never finish?\nWhat if that's the point?\nTo leave space for the next dreamer\nto add their own midnight magic.",
    excerpt: "The moon writes letters on my window sill, and I collect them like pressed flowers. Each word a silver thread connecting this moment to the next.",
    isThread: false,
  },
  {
    id: "t2",
    type: "text",
    title: "Half-Finished Thoughts",
    author: "River K.",
    time: "4h ago",
    forks: 12,
    sparks: 31,
    category: "Reflections",
    tags: ["thoughts", "incomplete", "beauty", "imperfection"],
    createdAt: "2025-01-27T08:00:00Z",
    content: "I started writing about the way light falls through leaves,\nbut the words got tangled in the branches.\n\nMaybe some stories are meant to stay\nhalf-told, half-dreamed,\nwaiting for someone else to find\nthe missing pieces in their own heart.",
    excerpt: "I started writing about the way light falls through leaves, but the words got tangled in the branches. Maybe some stories are meant to stay half-told...",
    isThread: false,
  },
  {
    id: "t3",
    type: "text",
    title: "Thread of Memories",
    author: "Sage W.",
    time: "6h ago",
    forks: 5,
    sparks: 18,
    category: "Poetry",
    tags: ["memories", "thread", "time", "nostalgia"],
    createdAt: "2025-01-27T06:00:00Z",
    content: "Every stitch holds a story waiting to continue...\n\nGrandmother's hands,\nweaving time into fabric,\nleaving loose ends\nfor us to tie together.\n\nWhat patterns will we create\nfrom these unfinished threads?",
    excerpt: "Every stitch holds a story waiting to continue... Grandmother's hands, weaving time into fabric, leaving loose ends for us to tie together.",
    isThread: false,
  },
  {
    id: "t4",
    type: "text",
    title: "Words Left Unsaid",
    author: "Ahmed M.",
    time: "1d ago",
    forks: 15,
    sparks: 42,
    category: "Poetry",
    tags: ["unsaid", "words", "silence", "bilingual"],
    createdAt: "2025-01-26T12:00:00Z",
    content: "کچھ باتیں ادھوری ہی اچھی لگتی ہیں\n(Some things feel better incomplete)\n\nLike the way your name\nhangs in the air between us,\nunfinished, beautiful,\nwaiting for the right moment\nto find its way home.",
    excerpt: "کچھ باتیں ادھوری ہی اچھی لگتی ہیں (Some things feel better incomplete). Like the way your name hangs in the air between us...",
    isThread: false,
  },
  {
    id: "t5",
    type: "text",
    title: "Digital Haiku Thread",
    author: "Pixel P.",
    time: "2d ago",
    forks: 9,
    sparks: 27,
    category: "Poetry",
    tags: ["haiku", "digital", "thread", "minimal"],
    createdAt: "2025-01-25T15:00:00Z",
    content: "Screen glows softly\ncode dreams in binary\n\nCursor blinks waiting\nfor the next thought\n\nEmpty text field\nfull of possibilities",
    excerpt: "Screen glows softly, code dreams in binary. Cursor blinks waiting for the next thought. Empty text field full of possibilities.",
    isThread: true,
    threadParts: [
      "Screen glows softly\ncode dreams in binary",
      "Cursor blinks waiting\nfor the next thought", 
      "Empty text field\nfull of possibilities"
    ],
    threadIndex: 1,
    totalThreadParts: 3,
  },
  {
    id: "t6",
    type: "text",
    title: "Morning Fragments",
    author: "Dawn L.",
    time: "3d ago",
    forks: 7,
    sparks: 19,
    category: "Reflections",
    tags: ["morning", "fragments", "light", "new"],
    createdAt: "2025-01-24T07:00:00Z",
    content: "The sun paints the wall\nin stripes of gold and shadow,\nand I remember\nthat every morning\nis a chance to start\nsomething beautiful\nand leave it unfinished\nfor tomorrow.",
    excerpt: "The sun paints the wall in stripes of gold and shadow, and I remember that every morning is a chance to start something beautiful...",
    isThread: false,
  },
];

// Sample visual seeds (existing)
export const visualSeeds: VisualSeed[] = [
  {
    id: "v1",
    type: "visual",
    title: "Unfinished Watercolor Dreams",
    author: "Priya K.",
    time: "2h ago",
    forks: 12,
    sparks: 28,
    category: "Visual",
    tags: ["watercolor", "dreams", "unfinished", "art"],
    createdAt: "2025-01-27T10:00:00Z",
    image: seed1,
    alt: "Unfinished watercolor painting with dreamy colors",
    description: "A half-finished watercolor painting where the colors bleed into each other like dreams merging at dawn. The artist left it incomplete, perhaps waiting for the right moment to add the final brushstrokes.",
  },
  {
    id: "v2",
    type: "visual",
    title: "Incomplete Urdu Verses",
    author: "Ahmed M.",
    time: "5h ago",
    forks: 8,
    sparks: 22,
    category: "Visual",
    tags: ["urdu", "verses", "calligraphy", "incomplete"],
    createdAt: "2025-01-27T07:00:00Z",
    image: seed2,
    alt: "Incomplete Urdu calligraphy on paper",
    description: "Beautiful Urdu calligraphy that stops mid-sentence, leaving the words hanging in the air like unfinished thoughts. The ink flows gracefully until it simply... ends.",
  },
  {
    id: "v3",
    type: "visual",
    title: "Bharatanatyam in Motion",
    author: "Meera S.",
    time: "1d ago",
    forks: 24,
    sparks: 45,
    category: "Visual",
    tags: ["bharatanatyam", "dance", "motion", "culture"],
    createdAt: "2025-01-26T12:00:00Z",
    image: seed3,
    alt: "Bharatanatyam dancer in mid-movement",
    description: "A Bharatanatyam dancer captured in the middle of a complex mudra, frozen in time. The movement is incomplete, waiting for the next beat to continue the story.",
  },
  {
    id: "v4",
    type: "visual",
    title: "Half-Stitched Paisley",
    author: "Lakshmi R.",
    time: "3d ago",
    forks: 15,
    sparks: 33,
    category: "Visual",
    tags: ["paisley", "embroidery", "half-stitched", "textile"],
    createdAt: "2025-01-24T14:00:00Z",
    image: seed4,
    alt: "Half-stitched paisley embroidery pattern",
    description: "Intricate paisley embroidery that stops halfway through the pattern. Each stitch tells a story, but the tale remains unfinished, waiting for the next hand to continue.",
  },
  {
    id: "v5",
    type: "visual",
    title: "Unfinished Raga Notes",
    author: "Ravi D.",
    time: "4d ago",
    forks: 6,
    sparks: 16,
    category: "Visual",
    tags: ["raga", "music", "notes", "unfinished"],
    createdAt: "2025-01-23T16:00:00Z",
    image: seed5,
    alt: "Unfinished musical notation for a raga",
    description: "Musical notation for a raga that ends abruptly, as if the musician's hand was lifted from the paper mid-melody. The notes dance on the page, incomplete but beautiful.",
  },
  {
    id: "v6",
    type: "visual",
    title: "Temple Architecture Sketch",
    author: "Arjun P.",
    time: "1w ago",
    forks: 19,
    sparks: 38,
    category: "Visual",
    tags: ["temple", "architecture", "sketch", "heritage"],
    createdAt: "2025-01-20T11:00:00Z",
    image: seed6,
    alt: "Incomplete sketch of temple architecture",
    description: "A detailed architectural sketch of a temple that stops mid-drawing. The intricate details are beautifully rendered, but the structure remains incomplete, waiting for the final lines.",
  },
];

// Combined seeds array with mixed types
export const allSeeds: Seed[] = [
  // Interweave text and visual seeds for natural flow
  visualSeeds[0], // Unfinished Watercolor Dreams
  textSeeds[0],   // Midnight Whispers
  visualSeeds[1], // Incomplete Urdu Verses
  textSeeds[1],   // Half-Finished Thoughts
  visualSeeds[2], // Bharatanatyam in Motion
  textSeeds[2],   // Thread of Memories
  visualSeeds[3], // Half-Stitched Paisley
  textSeeds[3],   // Words Left Unsaid
  visualSeeds[4], // Unfinished Raga Notes
  textSeeds[4],   // Digital Haiku Thread
  visualSeeds[5], // Temple Architecture Sketch
  textSeeds[5],   // Morning Fragments
];

// Categories for filtering
export const categories = ["All", "Visual", "Text", "Poetry", "Reflections", "Music", "Code"];

// Sort options
export const sortOptions = ["New", "Trending", "Most Forked", "Most Sparked", "Oldest"];
