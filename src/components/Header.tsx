import { LogIn, LogOut, Settings, Home, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-5 px-6 md:px-8 bg-background border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="group">
          <span className="font-display text-2xl md:text-3xl font-semibold text-primary">
            Shamsalong
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/shamsalong"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/shamsalong"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Auth Buttons */}
          {user ? (
            <>
              {isAdminPage && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Hem</span>
                  </Link>
                </Button>
              )}
              {!isAdminPage && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-secondary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logga ut</span>
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-secondary uppercase text-xs tracking-wider font-semibold"
            >
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
