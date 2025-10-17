import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForklore } from "@/contexts/ForkloreContext";

interface ForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedId: string | null;
  seedType?: 'text' | 'visual' | 'music' | 'code' | 'other';
  initialText?: string;
  onForkCreated?: () => void;
}

export const ForkModal = ({ isOpen, onClose, seedId, seedType, initialText, onForkCreated }: ForkModalProps) => {
  const [summary, setSummary] = useState("");
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { triggerRefresh } = useForklore();

  useEffect(() => {
    if (isOpen) {
      setText(initialText || "");
      setSummary("");
      setDescription("");
      setFile(null);
    }
  }, [initialText, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedId) return;
    // Prevent server error when trying to fork demo/sample seeds (non-ObjectId ids like "t1")
    const isValidObjectId = /^[a-f\d]{24}$/i.test(seedId);
    if (!isValidObjectId) {
      toast({ title: "Demo seed", description: "This is a demo seed and can't be forked on the server. Try planting a real seed first.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
        if (!apiBase) {
          console.error('❌ VITE_API_URL not configured in environment variables');
          throw new Error('API configuration missing');
        }
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to fork.");

      // Production debugging for fork creation
      console.log('🔀 Creating fork for seed:', seedId);
      console.log('🔀 API base:', apiBase);
      console.log('🔀 Seed type:', seedType);
      
      let imageUrl = undefined;
      let thumbnailUrl = undefined;
      
      // Handle image upload if file is selected
      if (file && seedType === 'visual') {
        console.log('🖼️ Uploading image for fork...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'artive/forks');
        
        const uploadRes = await fetch(`${apiBase}/api/uploads`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const uploadError = await uploadRes.text();
          throw new Error(`Image upload failed: ${uploadError}`);
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
        thumbnailUrl = uploadData.url; // Use same URL for thumbnail for now
        console.log('🖼️ Image uploaded successfully:', imageUrl);
      }
      
      // Create the fork with the uploaded image data
      const res = await fetch(`${apiBase}/api/forks/${encodeURIComponent(seedId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          contentDelta: seedType === 'text' ? text : undefined, 
          summary,
          description: seedType === 'visual' ? description : undefined,
          imageUrl,
          thumbnailUrl
        }),
      });
      
      console.log('🔀 Fork creation response status:', res.status);
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!res.ok) {
        const msg = data?.error?.message || (raw ? raw.slice(0, 200) : `HTTP ${res.status} ${res.statusText}`);
        console.error('🔀 Fork creation failed:', msg);
        throw new Error(msg || "Failed to create fork");
      }
      
      console.log('🔀 Fork created successfully!');
      toast({ title: "Fork created", description: "Your fork has been published." });
      onForkCreated?.();
      triggerRefresh(); // Trigger global refresh for lineage tree
      onClose();
    } catch (err: any) {
      toast({ title: "Fork Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fork this seed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Input id="summary" placeholder="What did you change or add?" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          {seedType === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea id="text" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Edit or add to the original text here" />
            </div>
          )}

          {seedType === 'visual' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file">Upload an image</Label>
                <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground">Upload a new image to fork this visual seed. Maximum size: 10MB.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your image fork..."
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={submitting}>{submitting ? 'Publishing...' : 'Publish Fork'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


