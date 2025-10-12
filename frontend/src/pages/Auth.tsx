import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple mock authentication
    if (email && password) {
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You've successfully logged in." : "Your spark is live ✨",
      });
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">

      {/* Floating shards background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-32 h-40 bg-accent/10 torn-edge-soft"
          style={{ transform: "rotate(-5deg)" }}
        />
        <div 
          className="absolute bottom-32 right-16 w-40 h-48 bg-accent-2/10 torn-edge-soft"
          style={{ transform: "rotate(3deg)" }}
        />
        <div 
          className="absolute top-1/2 right-1/4 w-24 h-32 bg-accent-3/10 torn-edge-soft"
          style={{ transform: "rotate(-2deg)" }}
        />
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md">
        <div 
          className="torn-edge bg-card/90 backdrop-blur-paper shadow-paper p-8 md:p-10"
          style={{ 
            borderRadius: "12px 16px 10px 14px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-display font-logo font-bold tracking-tight">
              Artive
            </h1>
            <p className="text-base italic text-muted-foreground">
              Half-baked? Perfect. Let's go.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="torn-edge-soft h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="torn-edge-soft h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                {isLogin ? "Log In" : "Sign Up"}
              </Button>

              <Button
                type="button"
                variant="hero-ghost"
                size="lg"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
              </Button>
            </div>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          {/* Footer microcopy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground italic opacity-80">
              Because perfect doesn't have to be finished.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
