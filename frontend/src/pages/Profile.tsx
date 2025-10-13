import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { SeedCard } from "@/components/SeedCard";
import { Pencil, GitFork, Sparkles, ShoppingBag, Award, Users, Heart } from "lucide-react";

const userSeeds = [
  { 
    id: "u1", 
    image: "https://via.placeholder.com/300x200/E8C9B0/1E1B18?text=My+First+Sketch", 
    title: "My First Sketch", 
    author: "You", 
    time: "1d ago", 
    forks: 5 
  },
  { 
    id: "u2", 
    image: "https://via.placeholder.com/300x200/A3B9A5/1E1B18?text=Poem+Fragment", 
    title: "Poem Fragment", 
    author: "You", 
    time: "3d ago", 
    forks: 2 
  },
  { 
    id: "u3", 
    image: "https://via.placeholder.com/300x200/D4C3DE/1E1B18?text=Code+Snippet", 
    title: "Code Snippet", 
    author: "You", 
    time: "1w ago", 
    forks: 8 
  },
];

const inspiredForks = [
  { 
    id: "f1", 
    image: "https://via.placeholder.com/300x200/A3B9A5/1E1B18?text=Inspired+by+My+Poem", 
    title: "Inspired by My Poem", 
    author: "Guest Artist", 
    time: "2h ago", 
    forks: 1 
  },
  { 
    id: "f2", 
    image: "https://via.placeholder.com/300x200/D4C3DE/1E1B18?text=Remix+of+My+Sketch", 
    title: "Remix of My Sketch", 
    author: "Collaborator", 
    time: "1d ago", 
    forks: 3 
  },
];

const badges = [
  { id: 1, name: "Starter", icon: "🌱", description: "Planted your first seed", earned: true },
  { id: 2, name: "Inspirer", icon: "✨", description: "Inspired 5+ forks", earned: true },
  { id: 3, name: "Collector", icon: "📚", description: "Saved 10+ seeds", earned: false },
  { id: 4, name: "Collaborator", icon: "🤝", description: "Joined 3+ collab rooms", earned: false },
  { id: 5, name: "Luminary", icon: "🌟", description: "Created a viral seed", earned: false },
];

const Profile = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Header Banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(232, 201, 176, 0.3), rgba(163, 185, 165, 0.3), rgba(212, 195, 222, 0.3))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg relative">
            <img 
              src="https://via.placeholder.com/160x160/E8C9B0/1E1B18?text=P" 
              alt="Profile Avatar" 
              className="w-full h-full object-cover" 
            />
            {/* Irregular paint-chip SVG mask */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-accent-1/30 to-accent-3/30 mix-blend-multiply" 
              style={{ 
                clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)' 
              }} 
            />
          </div>
          <div className="mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Priya K.</h1>
            <p className="text-muted-foreground italic">@priya_kreates</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                12 seeds planted
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                8 forks inspired
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="mb-4">
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-16 mt-16 md:mt-20 space-y-16">
        {/* Seeds you've planted */}
        <section>
          <h2 className="font-display text-2xl mb-6">Seeds you've planted</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSeeds.map((seed) => (
              <SeedCard key={seed.id} {...seed} />
            ))}
          </div>
        </section>

        {/* Forks you've inspired */}
        <section>
          <h2 className="font-display text-2xl mb-6">Forks you've inspired</h2>
          <div className="flex overflow-x-auto gap-6 pb-4">
            {inspiredForks.map((seed) => (
              <div key={seed.id} className="flex-shrink-0 w-64">
                <SeedCard {...seed} />
              </div>
            ))}
          </div>
        </section>

        {/* Creative lineage (mini) */}
        <section>
          <h2 className="font-display text-2xl mb-6">Your Creative Lineage</h2>
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg torn-edge-soft shadow-paper flex flex-col items-center justify-center space-y-4">
            <p className="text-muted-foreground text-center">
              A condensed view of your influence.
            </p>
            {/* Placeholder for 3-node radial lineage */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-1 flex items-center justify-center text-white text-sm">Y</div>
              <GitFork className="h-5 w-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-accent-2 flex items-center justify-center text-white text-sm">G</div>
              <GitFork className="h-5 w-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-accent-3 flex items-center justify-center text-white text-sm">C</div>
            </div>
            <Link to="/forklore">
              <Button variant="outline">View Forklore</Button>
            </Link>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="font-display text-2xl mb-6">Creative Sparks Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-lg torn-edge-soft shadow-sm flex flex-col items-center text-center transition-all duration-300 ${
                  badge.earned 
                    ? 'bg-card/80 border-2 border-accent-1/30' 
                    : 'bg-card/30 border-2 border-border/30 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-2 text-xs text-accent-1 font-medium">✓ Earned</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Settings & Shop */}
        <section className="flex justify-between items-center bg-card/50 backdrop-blur-sm p-6 rounded-lg torn-edge-soft shadow-paper">
          <div>
            <h2 className="font-display text-2xl mb-2">Shop & Settings</h2>
            <p className="text-muted-foreground">Manage your profile or turn your creations into prints.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary">
              <ShoppingBag className="h-4 w-4 mr-2" /> Print & Ship
            </Button>
            <Button variant="outline">Settings</Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
