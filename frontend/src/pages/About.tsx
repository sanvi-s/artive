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
    description: "Our small team began sketching the UI, focusing on a tactile, imperfect aesthetic. Paper textures, ink bleeds, and organic motion became our guiding principles.",
    image: "https://via.placeholder.com/150/A3B9A5/1E1B18?text=Design",
  },
  {
    year: "2025",
    title: "Launch & Beyond", 
    description: "With a passionate community, Artive officially launches, inviting creators worldwide to share their fragments and contribute to a living tapestry of collaborative art.",
    image: "https://via.placeholder.com/150/D4C3DE/1E1B18?text=Launch",
  },
];

const teamMembers = [
  { 
    name: "Rohan V.", 
    role: "Founder & Visionary", 
    bio: "A digital artisan passionate about preserving the beauty of imperfection.", 
    avatar: "https://via.placeholder.com/80/FEFAF6/1E1B18?text=RV" 
  },
  { 
    name: "Ananya S.", 
    role: "Lead Designer", 
    bio: "Weaving visual poetry with pixels and ink.", 
    avatar: "https://via.placeholder.com/80/FEFAF6/1E1B18?text=AS" 
  },
  { 
    name: "Vikram J.", 
    role: "Tech Lead", 
    bio: "Building the canvas for collaborative creation.", 
    avatar: "https://via.placeholder.com/80/FEFAF6/1E1B18?text=VJ" 
  },
];

const About = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <InkCursor />
      
      {/* Navbar */}
      <Navbar />
      

      {/* Header */}
      <header className="container mx-auto px-4 md:px-8 py-12 text-center">
        <Link to="/">
          <Button variant="ghost" size="icon" className="absolute top-6 left-6">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
        <p className="text-lg italic text-muted-foreground max-w-2xl mx-auto">
          "Every masterpiece begins with a forgotten stroke."
        </p>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-12 space-y-16">
        {/* Mission Piece */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-semibold mb-6">
            Our Mission: To Celebrate the Unfinished
          </h2>
          <p className="text-md leading-relaxed text-foreground">
            Artive is more than a platform; it's a philosophy. We believe that true creativity
            often lies in the raw, the unpolished, the half-formed idea. By providing a space
            for these fragments, we foster a culture of collaboration, where every incomplete
            thought is an invitation for another to continue its whisper. We are building a
            living tapestry of collective imagination, one spark at a time.
          </p>
        </section>

        {/* Timeline */}
        <section className="relative">
          <h2 className="font-display text-3xl text-center font-semibold mb-12">Our Journey</h2>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border/50 hidden md:block" />
          
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`relative mb-8 md:mb-16 flex items-center ${
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              }`}
            >
              <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"} text-center md:text-left`}>
                <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg torn-edge-soft shadow-paper">
                  <h3 className="font-display text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{milestone.year}</p>
                  <p className="text-base leading-relaxed">{milestone.description}</p>
                  <img 
                    src={milestone.image} 
                    alt={milestone.title} 
                    className="mt-4 rounded-lg torn-edge-soft mx-auto md:mx-0" 
                  />
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-accent-1 border-4 border-background z-10 hidden md:flex items-center justify-center text-white font-bold">
                {milestone.year.slice(2)}
              </div>
            </div>
          ))}
        </section>

        {/* Team Bios */}
        <section className="text-center">
          <h2 className="font-display text-3xl font-semibold mb-12">Meet the Artisans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-card/80 backdrop-blur-sm p-6 rounded-lg torn-edge-soft shadow-paper">
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-20 h-20 rounded-full mx-auto mb-4 torn-edge-soft" 
                />
                <h3 className="font-display text-xl font-semibold">{member.name}</h3>
                <p className="text-accent-foreground italic mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-card/50 backdrop-blur-sm p-8 rounded-lg torn-edge-soft shadow-paper">
          <h2 className="font-display text-2xl font-semibold mb-4">Join the Movement</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Ready to share your half-thoughts and build on the beautiful mess? 
            Join thousands of creators who believe that perfect doesn't need to be finished.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Share Your First Seed
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="hero-ghost" size="lg">
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
