
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: "Home", path: "#home" },
    { name: "About", path: "#about" },
    { name: "Projects", path: "#projects" },
    { name: "Contact", path: "#contact" },
  ];

  const isActive = (path: string) => {
    // For hash links, check if we're on the home page
    if (path.startsWith('#')) {
      return location.pathname === '/' && location.hash === path;
    }
    return location.pathname === path;
  };

  const handleNavClick = (path: string) => {
    if (path.startsWith('#')) {
      setIsOpen(false);
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            Portfolio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.path);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive(item.path)
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
              >
                {item.name}
              </a>
            ))}
            <ThemeToggle />
            {isAuthenticated && (
              <Link to="/admin" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.path);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                  isActive(item.path)
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center gap-2 px-3 py-2">
              <ThemeToggle />
              {isAuthenticated && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
