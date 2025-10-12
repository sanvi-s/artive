import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Save, GitFork, Sparkles, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { useState } from "react";

const ForkEditor = () => {
  const { id } = useParams();
  const [isRevealed, setIsRevealed] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  return (
    <div className="relative min-h-screen flex flex-col">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Top Banner */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border/50 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/explore">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Explore</span>
            </Button>
          </Link>
          <span className="font-handwritten text-lg text-muted-foreground">
            Inspired by @username {id && `(Seed #${id})`}
          </span>
          {/* Small color strip showing original author palette */}
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-accent-1" />
            <div className="w-4 h-4 rounded-sm bg-accent-2" />
            <div className="w-4 h-4 rounded-sm bg-accent-3" />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" defaultChecked className="form-checkbox rounded-sm" />
            Respect & Credit
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="secondary" size="sm">
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button variant="hero" size="sm">
            <GitFork className="h-4 w-4 mr-2" /> Publish Fork
          </Button>
        </div>
      </header>

      {/* Editor Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Original Seed */}
        <div className="lg:w-[42%] p-6 border-r border-border/50 bg-background/80 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Original Seed</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsRevealed(!isRevealed)}
            >
              {isRevealed ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isRevealed ? "Hide" : "Reveal"}
            </Button>
          </div>
          <div className={`bg-card/50 p-4 rounded-lg torn-edge-soft text-muted-foreground relative transition-all duration-300 ${
            isRevealed ? 'blur-none opacity-100' : 'blur-[2px] opacity-80'
          }`}>
            <p className="text-sm leading-relaxed">
              This is the original content of the seed. It's faded and blurred to provide context
              without distracting from your own creative work. You can click "Reveal" to see specific
              lines more clearly.
              <br /><br />
              "In the quiet hum of forgotten dreams, a melody stirs, half-remembered, half-imagined.
              A whisper of rain on a tin roof, a scent of old books and chai. What if this melody
              was meant to be a symphony, or a lullaby for a restless soul? The notes hang in the air,
              waiting for a hand to guide them, a voice to give them form."
              <br /><br />
              The lines here are a starting point, a fragment. Your task is to continue this thought,
              to weave your own narrative into its fabric. Let your imagination flow, unburdened by
              the need for perfection.
            </p>
          </div>
        </div>

        {/* Right Pane: Your Canvas */}
        <div className="lg:w-[58%] p-6 bg-background overflow-y-auto">
          <h2 className="font-display text-xl mb-4">Your Canvas</h2>
          <div className="bg-card p-4 rounded-lg torn-edge-soft min-h-[400px] border border-border/50 relative">
            <textarea
              className="w-full h-full bg-transparent outline-none resize-none font-body text-base leading-relaxed placeholder:italic placeholder:text-muted-foreground"
              placeholder="Continue their whisper... add your own ink to this story."
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
            />
            {/* Placeholder for rich text editor / sketch canvas / code editor */}
            <div className="absolute bottom-4 left-4 text-muted-foreground text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Start typing or choose a tool...</span>
            </div>
          </div>
          
          {/* Live Preview (collapsible) */}
          <div className="mt-6">
            <h3 className="font-display text-lg mb-2">Live Preview</h3>
            <div className="bg-card/50 p-4 rounded-lg torn-edge-soft border border-border/30 min-h-[150px] flex items-center justify-center text-muted-foreground italic">
              {editorContent ? (
                <div className="w-full">
                  <p className="text-sm leading-relaxed">{editorContent}</p>
                </div>
              ) : (
                "Your fork will appear here as you create."
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForkEditor;
