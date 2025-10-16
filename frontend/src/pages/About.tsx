import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InkCursor } from "@/components/InkCursor";
import { ArrowLeft } from "lucide-react";

const milestones = [
  {
    year: "2023",
    title: "The Seed of an Idea",
    description: "Artive was born from a simple observation: most creative work dies in draft folders. We envisioned a space where unfinished ideas could thrive, evolve, and connect.",
    image: "https://via.placeholder.com/150/E8C9B0/1E1B18?text=Concept",
  },
  {
    year: "2024", 
    title: "First Brushstrokes",
    description: "I began with sketching the UI, focusing on a tactile, imperfect aesthetic. Paper textures, ink bleeds, and organic motion became our guiding principles.",
    image: "https://via.placeholder.com/150/A3B9A5/1E1B18?text=Design",
  },
  {
    year: "2025",
    title: "Launch & Beyond", 
    description: "With a passionate community, Artive officially launches, inviting creators worldwide to share their fragments and contribute to a living tapestry of collaborative art.",
    image: "https://via.placeholder.com/150/D4C3DE/1E1B18?text=Launch",
  },
];


const About = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Header */}
      <header className="container mx-auto px-4 md:px-8 py-12 text-center relative">
        <Link to="/">
          <Button variant="ghost" size="icon" className="absolute top-6 left-6 hover:bg-accent/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/LOGO_NOHEXA.png" 
            alt="Artive Logo" 
            className="h-16 w-16 object-contain dark:hidden"
          />
          <img 
            src="/LOGO_DARK.png" 
            alt="Artive Logo" 
            className="h-16 w-16 object-contain hidden dark:block"
          />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Heart of artive
          </h1>
        </div>
        <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/20 max-w-3xl mx-auto">
          <p className="text-lg italic text-foreground/90 max-w-2xl mx-auto font-serif">
            "Art is never finished, only abandoned."
          </p>
          <p className="text-sm italic text-muted-foreground mt-2 font-serif">
            — Leonardo da Vinci
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-12 space-y-16">
        {/* Mission Piece */}
        <section className="text-center max-w-4xl mx-auto">
          <div className="bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-border/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h2 className="font-display text-2xl font-semibold mb-4 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">
              Our Mission: To Celebrate the Unfinished
            </h2>
            <p className="text-base leading-relaxed text-foreground/90 font-serif">
              Artive is more than a platform; it's a philosophy. We believe that true creativity
              often lies in the raw, the unpolished, the half-formed idea. By providing a space
              for these fragments, we foster a culture of collaboration, where every incomplete
              thought is an invitation for another to continue its whisper. We are building a
              living tapestry of collective imagination, one spark at a time.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative">
          <h2 className="font-display text-3xl text-center font-semibold mb-12 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">Our Journey</h2>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-accent-1/30 via-accent-2/30 to-accent-3/30 hidden md:block rounded-full" />
          
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`relative mb-8 md:mb-16 flex items-center ${
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              }`}
            >
              <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"} text-center md:text-left`}>
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300">
                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{milestone.title}</h3>
                  
                  <p className="text-base leading-relaxed text-foreground/90">{milestone.description}</p>
                  
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-accent-1 to-accent-2 border-2 border-background z-10 hidden md:block">
              </div>
            </div>
          ))}
        </section>

        {/* Developer Bio */}
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">Meet the Developer</h2>
          <div className="bg-card/40 backdrop-blur-sm p-8 rounded-2xl border border-border/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
            <h3 className="font-display text-xl font-semibold mb-3 text-foreground">Sanvi Shanishchara</h3>
            <p className="text-accent-1 italic mb-4 font-medium text-base">Developer</p>
            <p className="text-base leading-relaxed text-foreground/90 max-w-4xl mx-auto font-serif">
              Artive was created by Sanvi, a developer and multidisciplinary creator who has always found beauty in the unfinished. She often describes herself as someone who can never quite finish a poem—someone who collects fragments of thought, paints that pause mid-stroke, and hobbies that drift halfway before transforming into something new. It was from this realization that Artive was born—a space for the jack of all trades, master of none. Through Artive, Sanvi sought to build a platform that embraces incompletion as art in itself, where half-formed ideas can evolve, connect, and find meaning in collaboration.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-card/40 backdrop-blur-sm p-8 rounded-2xl border border-border/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h2 className="font-display text-xl font-semibold mb-3 bg-gradient-to-r from-accent-1 to-accent-2 bg-clip-text text-transparent">Join the Movement</h2>
          <p className="text-foreground/90 mb-4 max-w-2xl mx-auto text-base font-serif">
            Ready to share your half-thoughts and build on the beautiful mess? 
            Join thousands of creators who believe that perfect doesn't need to be finished.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button 
                variant="hero" 
                size="lg"
                className="shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(90deg, #b38bff 0%, #f9c6b8 50%, #ffe4a3 100%)',
                  border: 'none',
                  color: '#1a1a1a'
                }}
              >
                Share Your First Seed
              </Button>
            </Link>
            <Link to="/explore">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:-translate-y-0.5 transition-all border-border/20 hover:border-accent-1/40"
                style={{
                  background: 'transparent',
                  color: 'hsl(35, 10%, 80%)'
                }}
              >
                Explore the Gallery
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
