import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedId: string | null;
  seedType?: 'text' | 'visual' | 'music' | 'code' | 'other';
  initialText?: string;
}

export const ForkModal = ({ isOpen, onClose, seedId, seedType, initialText }: ForkModalProps) => {
  const [summary, setSummary] = useState("");
  const [text, setText] = useState(initialText || "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setText(initialText || "");
    setSummary("");
    setFile(null);
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
      if (!apiBase) apiBase = "http://localhost:5000";
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to fork.");

      // For now, send text as contentDelta. File upload could be handled by an uploads API then referenced here.
      const res = await fetch(`${apiBase}/api/seeds/${encodeURIComponent(seedId)}/forks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentDelta: seedType === 'text' ? text : undefined, summary }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!res.ok) {
        const msg = data?.error?.message || (raw ? raw.slice(0, 200) : `HTTP ${res.status} ${res.statusText}`);
        throw new Error(msg || "Failed to create fork");
      }
      toast({ title: "Fork created", description: "Your fork has been published." });
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
            <div className="space-y-2">
              <Label htmlFor="file">Upload an image (optional)</Label>
              <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground">Uploads are not yet persisted; this UI is prepared for future upload support.</p>
            </div>
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


