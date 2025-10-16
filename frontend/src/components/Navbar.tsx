import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/explore", label: "Explore" },
    { path: "/forklore", label: "Forklore" },
    ...(isAuthenticated ? [{ path: "/profile", label: "Profile" }] : []),
    { path: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-paper border-b border-border/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/LOGO_NOHEXA.png" 
              alt="Artive Logo" 
              className="h-10 w-10 object-contain dark:hidden"
            />
            <img 
              src="/LOGO_DARK.png" 
              alt="Artive Logo" 
              className="h-10 w-10 object-contain hidden dark:block"
            />
            <span className="font-logo text-2xl font-bold text-foreground">
              Artive
            </span>
            <span className="text-sm italic text-muted-foreground hidden sm:block">
              the art of forgotten things
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
                  location.pathname === item.path
                    ? "text-accent-foreground bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                }`}
              >
                {item.label}
                {/* Gradient underline for active items */}
                {location.pathname === item.path && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #b38bff 0%, #ffe4a3 100%)'
                    }}
                  />
                )}
                {/* Hover underline effect for non-active items */}
                {location.pathname !== item.path && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 w-0 group-hover:w-full"
                    style={{
                      background: 'linear-gradient(90deg, #b38bff 0%, #ffe4a3 100%)'
                    }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* User Actions */}
            {isAuthenticated ? (
              <>
                {/* User Greeting */}
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Hi, {user?.displayName}
                  </span>
                </div>
                
                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Login/Signup Buttons */}
                <Link to="/login">
                  <Button variant="hero-ghost" size="sm" className="hidden sm:flex">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm" className="hidden sm:flex">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-paper">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors relative ${
                    location.pathname === item.path
                      ? "text-accent-foreground bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                  {/* Unfinished line effect */}
                  {location.pathname !== item.path && (
                    <div className="absolute bottom-1 left-3 w-0 h-0.5 bg-accent-foreground animate-pulse" 
                         style={{ 
                           width: Math.random() > 0.5 ? '40%' : '20%',
                           animationDelay: `${Math.random() * 2}s`
                         }} />
                  )}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t border-border/30">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Hi, {user?.displayName}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login">
                      <Button variant="hero-ghost" size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="hero" size="sm" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
