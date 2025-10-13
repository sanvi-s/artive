import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SeedCreationData } from "@/types/seed";
import { X, Plus, Type, Image, Music, Code, Quote, Sparkles } from "lucide-react";

interface PlantSeedModalProps {
  children: React.ReactNode;
  onPlantSeed?: (seedData: SeedCreationData) => void;
}

const seedTypes = [
  { id: 'text', label: 'Text', icon: Type, description: 'Poems, thoughts, stories' },
  { id: 'visual', label: 'Visual', icon: Image, description: 'Images, sketches, art' },
  { id: 'music', label: 'Music', icon: Music, description: 'Audio, melodies, sounds' },
  { id: 'code', label: 'Code', icon: Code, description: 'Snippets, algorithms, scripts' },
];

const categories = ['Poetry', 'Reflections', 'Visual', 'Music', 'Code', 'Random'];

export const PlantSeedModal = ({ children, onPlantSeed }: PlantSeedModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'text' | 'visual' | 'music' | 'code'>('text');
  const [formData, setFormData] = useState<SeedCreationData>({
    type: 'text',
    title: '',
    content: '',
    tags: [],
    category: 'Poetry',
    isThread: false,
    threadParts: [],
  });
  const [newTag, setNewTag] = useState('');
  const [newThreadPart, setNewThreadPart] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPlantSeed) {
      onPlantSeed(formData);
    }
    setIsOpen(false);
    // Reset form
    setFormData({
      type: 'text',
      title: '',
      content: '',
      tags: [],
      category: 'Poetry',
      isThread: false,
      threadParts: [],
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addThreadPart = () => {
    if (newThreadPart.trim()) {
      setFormData(prev => ({
        ...prev,
        threadParts: [...(prev.threadParts || []), newThreadPart.trim()]
      }));
      setNewThreadPart('');
    }
  };

  const removeThreadPart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      threadParts: prev.threadParts?.filter((_, i) => i !== index) || []
    }));
  };

  const handleTypeChange = (type: 'text' | 'visual' | 'music' | 'code') => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type,
      content: type === 'text' ? prev.content : '',
      image: type === 'visual' ? prev.image : undefined,
      audioUrl: type === 'music' ? prev.audioUrl : undefined,
      code: type === 'code' ? prev.code : undefined,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Sparkles className="h-5 w-5 text-accent-1" />
            Plant Your Seed
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seed Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What kind of seed?</Label>
            <div className="grid grid-cols-2 gap-3">
              {seedTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeChange(type.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedType === type.id
                        ? 'border-accent-1 bg-accent-1/10'
                        : 'border-border hover:border-accent-1/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-accent-1" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your seed a name..."
              className="torn-edge-soft"
              required
            />
          </div>

          {/* Content based on type */}
          {selectedType === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Your thoughts
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="a half-thought, a whisper of a line..."
                  className="torn-edge-soft min-h-[120px] font-serif"
                  required
                />
              </div>

              {/* Thread option */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isThread"
                    checked={formData.isThread}
                    onChange={(e) => setFormData(prev => ({ ...prev, isThread: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isThread" className="text-sm">
                    This is part of a thread
                  </Label>
                </div>

                {formData.isThread && (
                  <div className="space-y-3 pl-6 border-l-2 border-accent-1/30">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Add thread parts</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newThreadPart}
                          onChange={(e) => setNewThreadPart(e.target.value)}
                          placeholder="Another thought..."
                          className="torn-edge-soft"
                        />
                        <Button
                          type="button"
                          onClick={addThreadPart}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {formData.threadParts && formData.threadParts.length > 0 && (
                      <div className="space-y-2">
                        {formData.threadParts.map((part, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-card/50 rounded border">
                            <span className="text-xs text-muted-foreground">{index + 1}.</span>
                            <span className="flex-1 text-sm">{part}</span>
                            <Button
                              type="button"
                              onClick={() => removeThreadPart(index)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedType === 'visual' && (
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="torn-edge-soft"
                required
              />
            </div>
          )}

          {selectedType === 'music' && (
            <div className="space-y-2">
              <Label htmlFor="audioUrl" className="text-sm font-medium">
                Audio URL
              </Label>
              <Input
                id="audioUrl"
                value={formData.audioUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                placeholder="https://example.com/audio.mp3"
                className="torn-edge-soft"
                required
              />
            </div>
          )}

          {selectedType === 'code' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  Language
                </Label>
                <Input
                  id="language"
                  value={formData.language || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="JavaScript, Python, etc."
                  className="torn-edge-soft"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Code
                </Label>
                <Textarea
                  id="code"
                  value={formData.code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="// Your half-finished code..."
                  className="torn-edge-soft min-h-[120px] font-mono text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="torn-edge-soft"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
            >
              <Quote className="h-4 w-4 mr-2" />
              Plant Your Seed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
