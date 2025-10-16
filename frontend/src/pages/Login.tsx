import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let apiBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || "";
      if (!apiBase) {
        apiBase = "http://localhost:5050";
        toast({ title: "Using default API", description: `No API base configured, trying ${apiBase}`, variant: "default" });
      }
      const endpoint = `${apiBase}/api/auth/login`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON */ }
      if (!res.ok) {
        const msg = data?.error?.message || (raw ? raw.slice(0, 200) : `HTTP ${res.status} ${res.statusText}`);
        throw new Error(msg || "Login failed");
      }
      if (data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      toast({ title: "Login Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
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

        {/* Container */}
        <div className="relative z-10 w-full max-w-md">
          <div 
            className="torn-edge bg-card/90 backdrop-blur-paper shadow-paper p-8 md:p-10"
            style={{ borderRadius: "12px 16px 10px 14px" }}
          >
            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <div className="flex items-center justify-center">
                <img src="/LOGO_NOHEXA.png" alt="Artive Logo" className="h-10 w-10 object-contain dark:hidden" />
                <img src="/LOGO_DARK.png" alt="Artive Logo" className="h-10 w-10 object-contain hidden dark:block" />
              </div>
              <h1 className="text-display font-logo font-bold tracking-tight">Artive</h1>
              <p className="text-base italic text-muted-foreground">Half-baked? Perfect. Let's go.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium">Email or Username</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@example.com or yourhandle"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="torn-edge-soft h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Log In"}
                </Button>

                <Link to="/signup">
                  <Button type="button" variant="hero-ghost" size="lg" className="w-full">
                    Need an account? Sign Up
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


